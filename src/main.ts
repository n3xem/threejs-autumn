import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";

import * as MyTHREE from './types/three.js';
import { MTLAndOBJLoader, EasyGLTFLoader } from './loaders.js';
import { HDRIPath, Model3dPath, TexturePath } from './config.js';
import { Black, White, DarkGreen } from './colors.js';

let stats: Stats;
let container: HTMLElement | null;
let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let water: Water;
let controls: OrbitControls;

init();
animate();

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
            waterNormals: new THREE.TextureLoader().load(TexturePath + '/waternormals.jpg', function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            sunDirection: new THREE.Vector3(),
            sunColor: White,
            waterColor: DarkGreen,
            distortionScale: 3.7,
            fog: scene.fog !== undefined
        }
    );
    water.rotation.x = - Math.PI / 2;
    return water;
}
function updateSun(sun: THREE.Vector3, parameters: MyTHREE.SunParameters, sky: Sky) {
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
    const ambientLight = new THREE.AmbientLight(White, 1);
    ambientLight.position.set(10, 10, 10);
    return ambientLight;
}

function createDiretionalLight() {
    const light = new THREE.DirectionalLight(White, 1);
    light.position.set(20, 20, 20);
    return light;
}

function createPointLight() {
    const light = new THREE.PointLight(White, 1);
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

    const mtlAndObjFiles: MyTHREE.MtlAndObjFiles[] = [
        [Model3dPath + 'maki_single_2.mtl', Model3dPath + 'maki_single_2.obj'],
        [Model3dPath + '/landscape_ground/landscape_ground.mtl', Model3dPath + '/landscape_ground/landscape_ground.obj'],
        [Model3dPath + '/landscape_water/landscape_water.mtl', Model3dPath + '/landscape_water/landscape_water.obj'],
    ];

    mtlAndObjFiles.forEach(([mtlPath, objPath]) => {
        MTLAndOBJLoader(mtlPath, objPath, scene);
    });

    const gltfFiles: MyTHREE.GLTFFile[] = [
        [Model3dPath + '/momiji_01/momiji.glb', 1, 0, 0, 0],
        [Model3dPath + '/momiji_02/momiji.glb', 1, 0, 0, 0],
        [Model3dPath + '/bench/bench.glb', 1, 1, 0, 10],
        [Model3dPath + '/ityou/ityou.glb', 1, 0, 0, 0],
        [Model3dPath + '/loghouse/loghouse.glb', 1, 10, 0, -20],
        [Model3dPath + '/maki/maki.glb', 1, 10, 0, 20],
    ];

    gltfFiles.forEach(([path, size, x, y, z]) => {
        EasyGLTFLoader(path, scene, size, x, y, z);
    });

    water = createWater();
    scene.add(water);

    const sun = new THREE.Vector3();
    const sky = createSky();
    const parameters = {
        inclination: 0.49,
        azimuth: 0.205
    };
    updateSun(sun, parameters, sky);

    new EXRLoader().load(HDRIPath + "/sunflowers_puresky_1k.exr", (texture) => {
        texture.mapping = THREE.EquirectanglarReflectionMapping;
        scene.background = texture;
    });

    scene.fog = new THREE.Fog(Black, 1, 250);

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
