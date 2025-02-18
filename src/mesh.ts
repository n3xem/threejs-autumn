import * as THREE from 'three';
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from 'three/examples/jsm/Addons.js';
import { White } from './colors.js';

import HelvetikerBold from '../assets/fonts/helvetiker_bold.typeface.json?url';

export async function create3DTimeTextMesh(text: string) {
    const fontLoader = new FontLoader();
    const font = await fontLoader.loadAsync(HelvetikerBold);

    const textMesh = new THREE.Mesh(
        new TextGeometry(text, {
            font: font,
            size: 100,
            height: 1,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 10,
            bevelSize: 8,
            bevelOffset: 0,
            bevelSegments: 5
        }),
        new THREE.MeshBasicMaterial({ color: White })
    );
    textMesh.position.set(-18, 2, 5);
    textMesh.scale.set(0.1, 0.1, 0.1);
    return textMesh;
}
