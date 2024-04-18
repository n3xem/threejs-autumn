import { Vector3 } from 'three';
import { BufferGeometryUtils, ThreeMFLoader } from 'three/addons/Addons.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { BufferGeometry, Loader, Object3D } from 'three';
import * as THREE from 'three';

async function loadLeaves(path: string) {
    const gltfLoader = new GLTFLoader();
    let mesh: BufferGeometry;
    const gltf = await gltfLoader.loadAsync(path);
    gltf.scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh === true) {
            mesh = obj;
            return mesh;
        }
    });
};

function getVerticalPositions (path: string) {
    const positionArray = fetch(path)
        .then(response => response.text())
        .then((data) => {
            return data.split('\n')
                .map((x) => {
                    return x.split(', ')
                        .map((y) => {
                            return parseFloat(y)
                        });
                }).map((z) => {
                    return new Vector3(...z);
                });
        });
    return positionArray;
}

function compositionTree(baseModel: Object3D, decorateModel: Object3D, verticalPositions: Vector3[]) {
    let geoms = [];
    for(let i = 0; i < verticalPositions.length; i++) {
        const geom = decorateModel.clone();
        const randomScale = Math.random();
        geom.position.set(
            verticalPositions[i].x,
            verticalPositions[i].y,
            verticalPositions[i].z
        );
        geom.scale.set(randomScale, randomScale, randomScale);
        // geoms.push(geom);
        baseModel.add(geom);
    }
    // geoms.push(baseModel);
    // console.log(geoms);
    // const geometry = BufferGeometryUtils.mergeGeometries(geoms);

    return baseModel;
}

export { loadLeaves, getVerticalPositions, compositionTree };