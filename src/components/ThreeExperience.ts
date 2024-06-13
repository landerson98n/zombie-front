import * as THREE from 'three';
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useWindowSize } from '@vueuse/core';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const experience = ref<HTMLCanvasElement | null>(null);
const { width, height } = useWindowSize();
const aspectRatio = computed(() => width.value / height.value);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let mixer: THREE.AnimationMixer;
let runAction: THREE.AnimationAction;
let waitAction: THREE.AnimationAction;
const clock = new THREE.Clock();
const humans: THREE.Object3D[] = [];
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

const deeplyClonedModels: THREE.Object3D[] = [];

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
  
  function loadHumanModel() {
    const fbxLoader = new FBXLoader();
    fbxLoader.load('/Human.fbx', (fbx) => {
      fbx.scale.set(0.01, 0.01, 0.01);
      fbx.rotation.set(0, Math.PI, 0);
      deeplyClonedModels.push(fbx.scene);
      scene.add(fbx);
  
      const animLoader = new FBXLoader();
      animLoader.load('/human_run.fbx', (animObject) => {
        mixer = new THREE.AnimationMixer(fbx);
        runAction = mixer.clipAction(animObject.animations[0]);
  
        animLoader.load('/human_wait.fbx', (waitAnimObject) => {
          waitAction = mixer.clipAction(waitAnimObject.animations[0]);
          waitAction.play();
          runAction.stop();
         
          animate(fbx);
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
        console.log('ID do modelo selecionado:', selectedModel.id);
    }
}
  function createZombi() {
    const zombiLoader = new FBXLoader();
    zombiLoader.load('/Zombi.fbx', (fbx) => {
      const mixerZombi = new THREE.AnimationMixer(fbx);
      fbx.scale.set(0.01, 0.01, 0.01);
      fbx.rotation.set(0, Math.PI, 0);
      scene.add(fbx);
  
      const animLoader = new FBXLoader();
      animLoader.load('/zombi-idle.fbx', (waitAnimObject) => {
        const waitActionZombi = mixerZombi.clipAction(waitAnimObject.animations[0]);
        waitActionZombi.play();
  
        animate(fbx);
      });
    });
  }
  
  function animate(model) {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
  
    if (mixer) mixer.update(delta);
    if (moveForward || moveBackward || moveLeft || moveRight) {
      if (moveForward) model.position.z -= 0.1;
      if (moveBackward) model.position.z += 0.1;
      if (moveLeft)  model.position.x -= 0.1;
      if (moveRight)  model.position.x += 0.1;
    }
  
    if (controls && renderer) {        
        controls.update();
        renderer.render(scene, camera);
    }
  }

 

  watch(aspectRatio, () => {
    initScene();
  });
  
  function startRunning() {
    if (runAction && !runAction.isRunning()) {
      waitAction.stop();
      runAction.play();
    }
  }
  
  function stopRunning() {
    if (runAction && runAction.isRunning()) {
      runAction.stop();
      waitAction.play();
    }
  }
  
  function handleKeyDown(event) {
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
  
  // Event listener para redimensionamento da janela
  function resizeWindow() {
    camera.aspect = window.innerWidth/1.08 / window.innerHeight/1.08;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth/1.08, window.innerHeight/1.08);
  }
  
  // Hook de montagem do componente
  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', resizeWindow);
    loop();
    initClickListener();
  });

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

  // Hook de desmontagem do componente
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    window.removeEventListener('resize', resizeWindow);
  });
  
  // Configurar renderizador
  watch(aspectRatio, () => {
    if (experience.value) {
      renderer = new THREE.WebGLRenderer({ canvas: experience.value });
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      resizeWindow();
    }
  });

export {
  experience,
  deeplyClonedModels,
  initScene,
  loadHumanModel,
  createZombi,
  setRenderer,
  loop
};
