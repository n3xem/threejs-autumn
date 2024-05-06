import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import * as THREE from 'three';
import * as MyTHREE from './types/three.js';
import { Model3dPath } from './config.js';

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
        gltf.scene.position.fromArray( position );
        gltf.scene.rotation.fromArray( rotation.map((x) => {return x * (Math.PI / 180)}) );
    });
}

export async function ModelLoader() {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    dracoLoader.setDecoderConfig({type: 'js'});
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    const [
        landscapeGroundModel, landscapeWaterModel, benchModel, firewoodModel, loghouseModel, treeModel,
    ] = await Promise.all([
        loader.loadAsync(Model3dPath + '/landscape_ground/landscape_groundDraco.glb'),
        loader.loadAsync(Model3dPath + '/landscape_water/landscape_waterDraco.glb'),
        loader.loadAsync(Model3dPath + '/bench/benchDraco.glb'),
        loader.loadAsync(Model3dPath + '/maki/makiDraco.glb'),
        loader.loadAsync(Model3dPath + '/loghouse/loghouseDraco.glb'),
        loader.loadAsync(Model3dPath + '/tree/tree_springDraco.glb'),
    ]);

    const landscapeGround = setupModel(landscapeGroundModel, 1, [0, 0, 0], [0, 0, 0]);
    const landscapeWater = setupModel(landscapeWaterModel, 1, [0, 0, 0], [0, 0, 0]);
    const bench = setupModel(benchModel, 1, [7, 0, 18], [0, 30, 0]);
    const firewood = setupModel(firewoodModel, 0.8, [26, 0, 18], [0, 90, 0]);
    const loghouse = setupModel(loghouseModel, 0.815, [0, 2.5, -15], [0, 0, 0]);
    const tree = setupModel(treeModel, 1.2, [28, 0, -20], [0, 25, 0]);

    return {
        landscapeGround,
        landscapeWater,
        bench,
        firewood,
        loghouse,
        tree
    }
}

function setupModel(data: GLTF, size: MyTHREE.Size, position: MyTHREE.Position, rotation: MyTHREE.Rotation) {
    const model = data.scene;
    model.scale.set(size, size, size);
    model.position.fromArray(position);
    model.rotation.fromArray(rotation.map((x) => x * (Math.PI / 180)));
    return model;
}