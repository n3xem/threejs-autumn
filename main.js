/*
import * as THREE from 'three';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';

let [camera, scene, renderer, trackball] = init();
animate(camera, scene, renderer, trackball);

function init() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;
    document.body.appendChild(renderer.domElement);

    var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    ambientLight.position.set(0, 0, 0);
    scene.add(ambientLight);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 0, 0);
    scene.add(light);

    var pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(0, 0, 0);
    camera.add(pointLight);
    scene.add(camera);

    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader();

    mtlLoader.load('./20231122_紅葉02.mtl', function (materials) {
        materials.preload();
        objLoader.setMaterials(materials);
        objLoader.load('./20231122_紅葉02.obj', function (object) {
            scene.add(object);
        });
    });

    camera.position.set(2, 2, 2);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    const trackball = new TrackballControls(camera, renderer.domElement);
    trackball.rotateSpeed = 5.0; //回転速度
    trackball.zoomSpeed = 0.5;//ズーム速度
    trackball.panSpeed = 2.0;//パン速度

    return [camera, scene, renderer, trackball];
}

function animate(camera, scene, renderer, trackball) {
    requestAnimationFrame(function () {
        animate(camera, scene, renderer, trackball)
    });
    renderer.render(scene, camera);
    trackball.update();
}
*/


import * as THREE from 'three';

import Stats from './node_modules/three/examples/jsm/libs/stats.module.js';

import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import { Water } from './node_modules/three/examples/jsm/objects/Water.js';
import { Sky } from './node_modules/three/examples/jsm/objects/Sky.js';

import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { EXRLoader } from "three/addons/loaders/EXRLoader.js";

let container, stats;
let camera, scene, renderer;
let controls, water, sun, mesh;

init();
animate();

function MTLAndOBJLoader(mtlPath, objPath) {
    const mtlLoader = new MTLLoader();
    const objLoader = new OBJLoader();

    mtlLoader.load(mtlPath, function (materials) {
        materials.preload();
        objLoader.setMaterials(materials);
        objLoader.load(objPath, function (object) {
            scene.add(object);
        });
    });
}

function EasyGLTFLoader(path, scene, size, x, y, z) {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(path, function (gltf) {
        scene.add(gltf.scene);
        gltf.scene.scale.set(size, size, size);
        gltf.scene.position.set(x, y, z);
    });
}


function init() {

    container = document.getElementById('container');

    //

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    //

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.set(30, 30, 100);

    var ambientLight = new THREE.AmbientLight(0xffffff, 1);
    ambientLight.position.set(10, 10, 10);
    scene.add(ambientLight);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(20, 20, 20);
    scene.add(light);

    var pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    camera.add(pointLight);
    scene.add(camera);

    MTLAndOBJLoader('./assets/maki_single_2.mtl', './assets/maki_single_2.obj', scene);

    MTLAndOBJLoader('./assets/landscape_ground/landscape_ground.mtl', './assets/landscape_ground/landscape_ground.obj', scene);
    MTLAndOBJLoader('./assets/landscape_water/landscape_water.mtl', './assets/landscape_water/landscape_water.obj', scene);

    EasyGLTFLoader('./assets/momiji_01/momiji.glb', scene, 1, 0, 0, 0);
    EasyGLTFLoader('./assets/momiji_02/momiji.glb', scene, 1, 0, 0, 0);
    EasyGLTFLoader('./assets/bench/bench.glb', scene, 1, 1, 0, 10);
    EasyGLTFLoader('./assets/ityou/ityou.glb', scene, 1, 0, 0, 0);
    EasyGLTFLoader('./assets/loghouse/loghouse.glb', scene, 1, 10, 0, -20);
    EasyGLTFLoader('./assets/maki/maki.glb', scene, 1, 10, 0, 20);

    sun = new THREE.Vector3();

    // Water

    const waterGeometry = new THREE.PlaneGeometry(100, 50);

    water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load('./textures/waternormals.jpg', function (texture) {

                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

            }),
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: scene.fog !== undefined
        }
    );

    water.rotation.x = - Math.PI / 2;

    scene.add(water);

    // Skybox

    const sky = new Sky();
    sky.scale.setScalar(10000);
    // scene.add(sky);

    const skyUniforms = sky.material.uniforms;

    skyUniforms['turbidity'].value = 10;
    skyUniforms['rayleigh'].value = 2;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.8;

    const parameters = {
        inclination: 0.49,
        azimuth: 0.205
    };

    const pmremGenerator = new THREE.PMREMGenerator(renderer);

    function updateSun() {

        const theta = Math.PI * (parameters.inclination - 0.5);
        const phi = 2 * Math.PI * (parameters.azimuth - 0.5);

        sun.x = Math.cos(phi);
        sun.y = Math.sin(phi) * Math.sin(theta);
        sun.z = Math.sin(phi) * Math.cos(theta);

        sky.material.uniforms['sunPosition'].value.copy(sun);
        water.material.uniforms['sunDirection'].value.copy(sun).normalize();

        // scene.environment = pmremGenerator.fromScene(sky).texture;

    }

    updateSun();


    new EXRLoader().load("./assets/HDRI/sunflowers_puresky_1k.exr", (texture) => {
        texture.mapping = THREE.EquirectanglarReflectionMapping;
        scene.background = texture;
    });

    controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set(0, 10, 0);
    controls.minDistance = 40.0;
    controls.maxDistance = 200.0;
    controls.update();

    //

    stats = new Stats();
    container.appendChild(stats.dom);


    window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    requestAnimationFrame(animate);
    render();
    stats.update();

}

function render() {

    const time = performance.now() * 0.001;

    water.material.uniforms['time'].value += 0.4 / 60.0;

    renderer.render(scene, camera);

}
