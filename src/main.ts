import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";

import { ModelLoader } from './loaders.js';
import { HDRIPath } from './config.js';

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
    camera.position.set(-42.294607851113554, 28.908477520375804, 44.98071058934696);
    camera.rotation.set(-0.7162648788326684, -0.6121050730297184, -0.4637845039498096);

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

function animate() {
    requestAnimationFrame(animate);
    render();
    // stats.update();
}

function render() {
    renderer.render(scene, camera);
    postprocessing.composer.render();
}
