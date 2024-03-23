import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";

let stats: Stats;
let container: HTMLElement | null;
let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let water: Water;
let sun: THREE.Vector3;
let controls;

type Parameters = {
    inclination: number;
    azimuth: number;
};

init();
animate();

function MTLAndOBJLoader(mtlPath: string, objPath: string) {
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

function EasyGLTFLoader(path: string, scene: THREE.Scene, size: number, x: number, y: number, z: number) {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(path, function (gltf) {
        scene.add(gltf.scene);
        gltf.scene.scale.set(size, size, size);
        gltf.scene.position.set(x, y, z);
    });
}

function createRenderer() {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    return renderer;
}

function createCamera() {
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.set(30, 30, 100);
    return camera;
}

function createWater() {
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
    return water;
}
function updateSun(parameters: Parameters, sky: Sky) {
    const theta = Math.PI * (parameters.inclination - 0.5);
    const phi = 2 * Math.PI * (parameters.azimuth - 0.5);

    sun.x = Math.cos(phi);
    sun.y = Math.sin(phi) * Math.sin(theta);
    sun.z = Math.sin(phi) * Math.cos(theta);

    sky.material.uniforms['sunPosition'].value.copy(sun);
    water.material.uniforms['sunDirection'].value.copy(sun).normalize();
}

function createSky() {
    const sky = new Sky();
    sky.scale.setScalar(10000);
    const skyUniforms = sky.material.uniforms;

    skyUniforms['turbidity'].value = 10;
    skyUniforms['rayleigh'].value = 2;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.8;
    return sky;
}

function createAmbientLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    ambientLight.position.set(10, 10, 10);
    return ambientLight;
}

function createDiretionalLight() {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(20, 20, 20);
    return light;
}

function createPointLight() {
    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    return light;
}

function init() {
    container = document.getElementById('container');
    if (container === null) {
        console.error('container is null');
        return;
    }
    scene = new THREE.Scene();

    renderer = createRenderer();
    container.appendChild(renderer.domElement);

    camera = createCamera();

    const ambientLight = createAmbientLight();
    scene.add(ambientLight);

    const directionalLight = createDiretionalLight();
    scene.add(directionalLight);

    const pointLight = createPointLight();
    camera.add(pointLight);
    scene.add(camera);

    type MtlPath = string;
    type ObjPath = string;

    type MtlAndObjFiles = [MtlPath, ObjPath];
    const mtlAndObjFiles: MtlAndObjFiles[] = [
        ['./assets/maki_single_2.mtl', './assets/maki_single_2.obj'],
        ['./assets/landscape_ground/landscape_ground.mtl', './assets/landscape_ground/landscape_ground.obj'],
        ['./assets/landscape_water/landscape_water.mtl', './assets/landscape_water/landscape_water.obj'],
    ];

    mtlAndObjFiles.forEach(([mtlPath, objPath]) => {
        MTLAndOBJLoader(mtlPath, objPath);
    });

    type GlbPath = string;
    type Size = number;
    type X = number;
    type Y = number;
    type Z = number;

    type GLTFFile = [GlbPath, Size, X, Y, Z];
    const gltfFiles: GLTFFile[] = [
        ['./assets/momiji_01/momiji.glb', 1, 0, 0, 0],
        ['./assets/momiji_02/momiji.glb', 1, 0, 0, 0],
        ['./assets/bench/bench.glb', 1, 1, 0, 10],
        ['./assets/ityou/ityou.glb', 1, 0, 0, 0],
        ['./assets/loghouse/loghouse.glb', 1, 10, 0, -20],
        ['./assets/maki/maki.glb', 1, 10, 0, 20],
    ];

    gltfFiles.forEach(([path, size, x, y, z]) => {
        EasyGLTFLoader(path, scene, size, x, y, z);
    });

    water = createWater();
    scene.add(water);

    const sky = createSky();

    const parameters = {
        inclination: 0.49,
        azimuth: 0.205
    };

    sun = new THREE.Vector3();

    updateSun(parameters, sky);

    new EXRLoader().load("./assets/HDRI/sunflowers_puresky_1k.exr", (texture) => {
        texture.mapping = THREE.EquirectanglarReflectionMapping;
        scene.background = texture;
    });

    scene.fog = new THREE.Fog(0x000000, 1, 250);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set(0, 10, 0);
    controls.minDistance = 40.0;
    controls.maxDistance = 200.0;
    controls.update();

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
    water.material.uniforms['time'].value += 0.4 / 60.0;
    renderer.render(scene, camera);
}
