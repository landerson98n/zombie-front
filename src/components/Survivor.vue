<template>
    <div>      
      <button class="p-[2vw]" @click="statisticsGenerate">Gerar Estatisticas</button>
      <canvas ref="experience"></canvas>
    </div>
  </template>
  
  <script lang="ts">
  import * as THREE from 'three';
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { useWindowSize } from '@vueuse/core';
  import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
  import EventBus from '../events/eventBus';
  import { getStatistics } from '../api/server';
  import { update_location } from '../api/server';

  export default {
  setup() {
  const experience = ref<HTMLCanvasElement | null>(null);
  const { width, height } = useWindowSize();
  const aspectRatio = computed(() => width.value / height.value);
  
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let controls: OrbitControls;
  const humans: any[] = [];
  let moveForward = false;
  let moveBackward = false;
  let moveLeft = false;
  let moveRight = false;
  let users: any
  let selectedSurvivor: any = null; 
  let position : THREE.Vector3

  function initScene() {
    if(!scene){
        scene = new THREE.Scene();
        scene.background = new THREE.Color('white');
    
        camera = new THREE.PerspectiveCamera(75, aspectRatio.value, 0.1, 1000);
        camera.position.set(5, 5, 5.0);
        camera.lookAt(0, 0, 0);
        scene.add(camera);
    
        const planeGeometry = new THREE.PlaneGeometry();
        const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.scale.set(10, 10, 10);
        plane.rotation.x = -0.5 * Math.PI;
        scene.add(plane);
    
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);
    }
    
  }
  
  function loadHumanModel(id, longitude, latitude) {
    const fbxLoader = new FBXLoader();
    fbxLoader.load('/Human.fbx', (fbx) => {
      fbx.scale.set(0.01, 0.01, 0.01);
      fbx.rotation.set(0, Math.PI, 0);
      fbx.userData.id = id
      fbx.userData.clock = new THREE.Clock();
      fbx.userData.controls = controls 
      fbx.position.x = longitude
      fbx.position.z = latitude
      scene.add(fbx);
  
      const animLoader = new FBXLoader();
      animLoader.load('/human_run.fbx', (animObject) => {
        fbx.userData.mixer = new THREE.AnimationMixer(fbx);
        fbx.userData.runAction = fbx.userData.mixer.clipAction(animObject.animations[0]);;

        animLoader.load('/human_wait.fbx', (waitAnimObject) => {
          fbx.userData.waitAction = fbx.userData.mixer.clipAction(waitAnimObject.animations[0]);
          fbx.userData.waitAction.play();
          fbx.userData.runAction.stop();
  
          function animate() {
            requestAnimationFrame(animate);
            const delta = fbx.userData.clock.getDelta();
            fbx.userData.mixer.update(delta);
            if (selectedSurvivor && selectedSurvivor.userData.id == id ){
              if (moveForward || moveBackward || moveLeft || moveRight) {
                if (moveForward) fbx.position.z -= 0.1;
                if (moveBackward) fbx.position.z += 0.2;
                if (moveLeft) fbx.position.x -= 0.1;
                if (moveRight) fbx.position.x += 0.1;
              }
              position = fbx.position
            }
            
            fbx.userData.controls.update();
            renderer.render(scene, camera);
          }
          animate();
          fbx.traverse((child) => {
          if (child.isMesh) {
            child.userData.parent = fbx;
            child.userData.mixer = fbx.userData.mixer;
            child.userData.runAction = fbx.userData.runAction;
            child.userData.waitAction = fbx.userData.waitAction;
          }
        });
          humans.push(fbx)
          
        });
      });
    });
  }

  function initClickListener() {
    if (renderer) {
        renderer.domElement.addEventListener('click', onMouseClick);
    }
}

function onMouseClick(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(humans, true); 

    if (intersects.length > 0) {
        const selectedModel = intersects[0].object;
        const modelId = selectedModel.parent.userData.id
        EventBus.$emit('survivor-clicked', {id: modelId, items: users[modelId -1 ].items, is_infected: users[modelId -1 ].is_infected });
    }
} 

  function createZombi(id, longitude, latitude) {
    const zombiLoader = new FBXLoader();
    zombiLoader.load('/Zombi.fbx', (zombie) => {
      zombie.userData.mixerZombi = new THREE.AnimationMixer(zombie);
      zombie.scale.set(0.01, 0.01, 0.01);
      zombie.rotation.set(0, Math.PI, 0);
      zombie.userData.clock = new THREE.Clock();
      zombie.userData.id = id
      zombie.userData.controls = controls
      zombie.position.x = longitude
      zombie.position.z = latitude
      scene.add(zombie);
      const animLoader = new FBXLoader();
      animLoader.load('/zombi-idle.fbx', (waitAnimObject) => {
        zombie.userData.waitActionZombi = zombie.userData.mixerZombi.clipAction(waitAnimObject.animations[0]);
        zombie.userData.waitActionZombi.play();
  
        function animate() {
          requestAnimationFrame(animate);
          const delta = zombie.userData.clock.getDelta();
          zombie.userData.mixerZombi.update(delta);
          if (selectedSurvivor && selectedSurvivor.userData.id == id ){
            if (moveForward || moveBackward || moveLeft || moveRight) {
            if (moveForward) zombie.position.z -= 0.1;
            if (moveBackward) zombie.position.z += 0.1;
            if (moveLeft) zombie.position.x -= 0.1;
            if (moveRight) zombie.position.x += 0.1;
          }
          position = zombie.position
          }
          
          zombie.userData.controls.update();
          renderer.render(scene, camera);
        }
        
        replaceHuman(zombie)
        animate();
      });
    });
  }

  function replaceHuman(newHuman) {
  const index = humans.findIndex(human => human.userData.id === newHuman.userData.id);

  if (index !== -1) {
    const oldHuman = humans[index];
    scene.remove(oldHuman);
    oldHuman.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(material => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
    humans.splice(index, 1, newHuman);
  } else {
    humans.push(newHuman)
    console.log('Human not found');
  }
}

  async function statisticsGenerate(){
    const res = await getStatistics()
    EventBus.$emit('statistics', {data: res.data})
  }

  watch(aspectRatio, () => {
    initScene();
  });
  
  function startRunning() {
    if (selectedSurvivor && selectedSurvivor.userData.runAction && !selectedSurvivor.userData.runAction.isRunning()) {
      selectedSurvivor.userData.waitAction.stop();
      selectedSurvivor.userData.runAction.play();
    }
  }
  
  function stopRunning() {
    if (selectedSurvivor && selectedSurvivor.userData.runAction && selectedSurvivor.userData.runAction.isRunning()) {
      selectedSurvivor.userData.runAction.stop();
      selectedSurvivor.userData.waitAction.play();
    }
  }
  
  function handleKeyDown(event) {
    if (!selectedSurvivor) return;
    switch (event.key.toLowerCase()) {
      case 'w':
        moveForward = true;
        startRunning();
        break;
      case 's':
        moveBackward = true;
        startRunning();
        break;
      case 'a':
        moveLeft = true;
        startRunning();
        break;
      case 'd':
        moveRight = true;
        startRunning();
        break;
    }
  }
  
  function handleKeyUp(event) {
    if (!selectedSurvivor) return;
    switch (event.key.toLowerCase()) {
      case 'w':
        moveForward = false;
        stopRunning();
        break;
      case 's':
        moveBackward = false;
        stopRunning();
        break;
      case 'a':
        moveLeft = false;
        stopRunning();
        break;
      case 'd':
        moveRight = false;
        stopRunning();
        break;
    }
  }
  
  function resizeWindow() {
    camera.aspect = window.innerWidth/1.08 / window.innerHeight/1.08;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth/1.08, window.innerHeight/1.08);
  }
  
  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', resizeWindow);
    loop();
    initClickListener();
    EventBus.$on('survivor-added', (survivorData) => {
        loadHumanModel(survivorData.id, survivorData.longitude, survivorData.latitude); 
    });
    EventBus.$on('update-local', async ()=>{
      await update_location(selectedSurvivor.userData.id, parseInt(position.x.toString()), parseInt(position.z.toString()))
    })
    EventBus.$on('data-survivors', (survivorData) => {
        setUsers(survivorData); 
        survivorData.forEach(element => {
          if(element.is_infected){
            createZombi(element.id, element.longitude, element.latitude)
          }else{
            loadHumanModel(element.id, element.longitude, element.latitude); 
          }
        }); 
    });
    EventBus.$on('select-survivor', (survivorData) => {
      setSelectedSurvivor(survivorData.id); 
    });
    EventBus.$on('zombie-transformer', (data)=> createZombi(data.id) )

  });

  function setSelectedSurvivor(id){
    const objectSelected = humans.find((index) => index.userData.id == id )
      
    selectedSurvivor = objectSelected
  }

  function setUsers(data){
    users = data    
  }
  function updateRenderer() {
      renderer.setSize(width.value/1.08, height.value/1.1);
      renderer.render(scene, camera);
  }

  function setRenderer() {
      if (experience.value) {
          renderer = new THREE.WebGLRenderer({ canvas: experience.value });
          controls = new OrbitControls(camera, renderer.domElement);
          controls.enableDamping = true;
          updateRenderer();
      }
  }
  
  const loop = () => {
      initScene()
      setRenderer()
  };

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    window.removeEventListener('resize', resizeWindow);
  });
  
  watch(aspectRatio, () => {
    if (experience.value) {
      renderer = new THREE.WebGLRenderer({ canvas: experience.value });
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      resizeWindow();
    }
  });
  return {
      experience,
      loadHumanModel,
      createZombi,
      statisticsGenerate
    };
    } 
  }
  
  </script>
