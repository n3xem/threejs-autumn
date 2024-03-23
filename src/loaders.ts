import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';
import * as MyTHREE from './types/three.js';

export function MTLAndOBJLoader(mtlPath: MyTHREE.MtlPath, objPath: MyTHREE.ObjPath, scene: THREE.Scene) {
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

export function EasyGLTFLoader(path: string, scene: THREE.Scene, size: MyTHREE.Size, position: MyTHREE.Position, rotation: MyTHREE.Rotation) {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(path, function (gltf) {
        scene.add(gltf.scene);
        gltf.scene.scale.set(size, size, size);
        gltf.scene.position.set( ...position );
        gltf.scene.rotation.set( ...rotation );
    });
}
