// 今使っていない処理群
// いつか使うかもしれないので控えておく


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

// main.ts > init
const mtlAndObjFiles: MyTHREE.MtlAndObjFiles[] = [
        [Model3dPath + 'maki_single_2.mtl', Model3dPath + 'maki_single_2.obj'],
        [Model3dPath + '/landscape_ground/landscape_ground.mtl', Model3dPath + '/landscape_ground/landscape_ground.obj'],
        [Model3dPath + '/landscape_water/landscape_water.mtl', Model3dPath + '/landscape_water/landscape_water.obj'],
    ];

    mtlAndObjFiles.forEach(([mtlPath, objPath]) => {
        MTLAndOBJLoader(mtlPath, objPath, scene);
    });

    const gltfFiles: MyTHREE.GLTFFile[] = [
        // [Model3dPath + '/momiji_01/momiji.glb', 1, [0, 0, 0], [0, 0, 0]],
        // [Model3dPath + '/momiji_02/momiji.glb', 1, [0, 0, 0], [0, 0, 0]],
        [Model3dPath + '/bench/bench.glb', 1, [7, 0, 18], [0, 30, 0]],
        // [Model3dPath + '/ityou/ityou.glb', 1, [0, 0, 0], [0, 0, 0]],
        [Model3dPath + '/loghouse/loghouse.glb', 0.815, [0, 2.5, -15], [0, 0, 0]],
        [Model3dPath + '/maki/maki.glb', 0.8, [26, 0, 18], [0, 90, 0]],
        [Model3dPath + '/tree/tree.glb', 1.2, [28, 0, -20], [0, 25, 0]],
        [Model3dPath + '/landscape_ground/landscape_ground.glb', 1, [0, 0, 0], [0, 0, 0]],
        // [Model3dPath + '/landscape_water/landscape_water.glb', 1, [0, 0, 0], [0, 0, 0]],
    ];
    gltfFiles.forEach(([path, size, position, rotation]) => {
        EasyGLTFLoader(path, scene, size, position, rotation);
    });

    const sun = new THREE.Vector3();
    const sky = createSky();
    const parameters = {
        inclination: 0.49,
        azimuth: 0.205
    };
    updateSun(sun, parameters, sky);

