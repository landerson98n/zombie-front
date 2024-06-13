<template>
    <div ref="threeContainer" class="three-container"></div>
  </template>
  
  <script>
  import * as THREE from 'three';
  import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
  export default {
    data() {
      return {
        scene: null,
        camera: null,
        renderer: null,
      };
    },
    mounted() {
      this.initThreeJS();
      this.loadModel();
    },
    methods: {
      initThreeJS() {
        const width = this.$refs.threeContainer.clientWidth;
        const height = this.$refs.threeContainer.clientHeight;
  
        // Scene
        this.scene = new THREE.Scene();
  
        // Camera
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.z = 5;
  
        // Renderer
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(width, height);
        this.$refs.threeContainer.appendChild(this.renderer.domElement);
  
        // Light
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 10, 7.5);
        this.scene.add(light);
  
        // Animate
        const animate = () => {
          requestAnimationFrame(animate);
          this.renderer.render(this.scene, this.camera);
        };
        animate();
      },
      loadModel() {
        const loader = new GLTFLoader();
  
        loader.load(
          // resource URL
          '@/src/scene/model.gltf',
  
          // onLoad callback
          (object) => {
            object.scale.set(0.1, 0.1, 0.1); // Ajuste a escala conforme necessário
            this.scene.add(object);
          },
  
          // onProgress callback
          (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
          },
  
          // onError callback
          (err) => {
            console.error('An error happened', err);
          }
        );
      },
    },
  };
  </script>
  
  <style scoped>
  .three-container {
    width: 100%;
    height: 100%;
    background-color: #000;
  }
  </style>
  