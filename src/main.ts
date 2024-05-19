import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";

import { ModelLoader } from './loaders.js';
import { HDRIPath } from './config.js';
import { create3DTimeTextMesh } from './mesh.js';

import { TextGeometry } from 'three/examples/jsm/Addons.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';

let container: HTMLElement | null;
let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let postprocessing: {
    composer: EffectComposer,
    bokeh: BokehPass
} = {
    composer: new EffectComposer(new THREE.WebGLRenderer()),
    bokeh: new BokehPass(new THREE.Scene(), new THREE.Camera(), {})
};
let nowMinutes = getNowMinutes();
let textMesh: THREE.Mesh<TextGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>;

let rot = 0;

await init();
animate();

function createRenderer() {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2;
    return renderer;
}

function createCamera() {
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.set(0, 0, 250);
    return camera;
}

function getNowMinutes() {
    const now = new Date();
    return now.getMinutes() + now.getHours() * 60;
}

function generateTimeText() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const minutesFormatted = minutes < 10 ? '0' + minutes : minutes.toString();
    const timeString = hours + ':' + minutesFormatted;
    return timeString;
}

async function init() {
    container = document.getElementById('container');
    if (container === null) {
        console.error('container is null');
        return;
    }
    scene = new THREE.Scene();

    renderer = createRenderer();
    container.appendChild(renderer.domElement);

    camera = createCamera();
    camera.position.set(-12.294607851113554, 28.908477520375804, 60.98071058934696);
    camera.rotation.set(-0.7162648788326684, -0.6121050730297184, -0.4637845039498096);
    camera.lookAt(0, 0, 0);

    const {
        landscapeGround,
        landscapeWater,
        bench,
        firewood,
        loghouse,
        // tree
    } = await ModelLoader();

    // const verticalPointsArray = await getVerticalPositions(Model3dPath + '/tree/tree_leaves_positions.txt');
    // const tree = compositionTree(treeBranch, treeLeaves, verticalPointsArray);

    scene.add(landscapeGround, landscapeWater, bench, firewood, loghouse);

    create3DTimeTextMesh(generateTimeText()).then((text) => {
        textMesh = text;
        scene.add(text);
    });

    new EXRLoader().load(HDRIPath + "/sunflowers_puresky_1k.exr", (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        scene.background = texture;
    });

    controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set(0, 10, 0);
    controls.minDistance = 40.0;
    controls.maxDistance = 200.0;
    controls.update();

    // stats = new Stats();
    // container.appendChild(stats.dom);

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2;

    initPostprocessing();
    renderer.autoClear = false;

    window.addEventListener('resize', onWindowResize);
}

function initPostprocessing() {
    const renderPass = new RenderPass(scene, camera);
    const bokehPass = new BokehPass(scene, camera, {
        focus: 64,
        aperture: 50 * 0.00001,
        maxblur: 0.013,
        aspect: 0.5,
    });

    const outputPass = new OutputPass();
    const composer = new EffectComposer(renderer);

    composer.addPass(renderPass);
    composer.addPass(bokehPass);
    composer.addPass(outputPass);

    postprocessing.composer = composer;
    postprocessing.bokeh = bokehPass;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateTextMeshIfMinuteChanged() {
    if (nowMinutes !== getNowMinutes()) {
        nowMinutes = getNowMinutes();
        scene.remove(textMesh);
        create3DTimeTextMesh(generateTimeText()).then((text) => {
            textMesh = text;
            scene.add(text);
        });
    }
}

function rotateCamera() {
    rot -= 0.1;
    const radian = rot * Math.PI / 180;
    camera.position.x = 70 * Math.sin(radian);
    camera.position.z = 70 * Math.cos(radian);
    camera.lookAt(0, 0, 0);
}

function animate() {
    rotateCamera();
    updateTextMeshIfMinuteChanged();
    requestAnimationFrame(animate);
    render();
    // stats.update();
}

function render() {
    renderer.render(scene, camera);
    postprocessing.composer.render();
}
