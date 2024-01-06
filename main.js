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
