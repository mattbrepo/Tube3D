const TUBE_RADIUS = 5;

// Degrees to radians
function degrees_to_radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi/180);
}

// Make a tube bend path (3D arc on a plane) 
//
// bendAngle: angle of the bend (arc angle)
// bendRadius: radius of the bend (arc radius)
// v1, v2: vectors that describe the arc
// pC: center of the arc
function makeBendPath(bendAngle, bendRadius, v1, v2, pC) {
    const path = [];

    // https://math.stackexchange.com/questions/73237/parametric-equation-of-a-circle-in-3d-space
    for (let i = 0; i <= bendAngle; i++) {
        const step = degrees_to_radians(i);
        const x = pC.x + bendRadius * Math.cos(step) * v2.x + bendRadius * Math.sin(step) * v1.x;
        const y = pC.y + bendRadius * Math.cos(step) * v2.y + bendRadius * Math.sin(step) * v1.y;
        const z = pC.z + bendRadius * Math.cos(step) * v2.z + bendRadius * Math.sin(step) * v1.z;

        const vect = new BABYLON.Vector3(x, y, z);
        path.push(vect);
    }
    return path;
};

// Make a tube bend
//
// scene: 3D scene
// material: the color of the bend
// index: index of the bend (used in the mesh name)
// tpPrevStraight: previous straight part information
// bendRotation: initial rotation of the bend
// bendAngle: angle of the bend
// bendRadius: radius of the bend
function makeBend(scene, material, index, tpPrevStraight, bendRotation, bendAngle, bendRadius) {

    // previous straight part two points
    const v1 = tpPrevStraight.path[0];
    const v2 = tpPrevStraight.path[1];
    // prodebug
    //console.log('v1: ' + v1);
    //console.log('v2: ' + v2);

    // vector of the previous straight part
    const v12 = v1.subtract(v2).normalize(); 

    // unit vector from the previous straight end to its pseudo-center
    const vU = tpPrevStraight.pseudoCenter.subtract(v2).normalize();

    // normal vector to vU and v12
    const vNormal = vU.cross(v12);
    
    // rotate and translate vU to obtain the new bend center
    const radRotation = degrees_to_radians(bendRotation);
    const x = v2.x + bendRadius * Math.cos(radRotation) * vU.x + bendRadius * Math.sin(radRotation) * vNormal.x;
    const y = v2.y + bendRadius * Math.cos(radRotation) * vU.y + bendRadius * Math.sin(radRotation) * vNormal.y;
    const z = v2.z + bendRadius * Math.cos(radRotation) * vU.z + bendRadius * Math.sin(radRotation) * vNormal.z;
    const vCenter = new BABYLON.Vector3(x, y, z);
    
    // prodebug
    //BABYLON.MeshBuilder.CreateTube("x_" + index, {path: [v2, vCenter], radius: TUBE_RADIUS, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene);
    //console.log('vCenter: ' + vCenter);

    // make the bend path
    const v21 = v2.subtract(v1).normalize();
    const v2C = v2.subtract(vCenter).normalize();
    const path = makeBendPath(bendAngle, bendRadius, v21, v2C, vCenter);

    // create the bend of the tube
    const tube = BABYLON.MeshBuilder.CreateTube("bend_" + index, {path: path, radius: TUBE_RADIUS, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene);
    tube.material = material;
    
    // prodebug sphere in the center
    //var sphere = BABYLON.MeshBuilder.CreateSphere("sphere_" + index, {diameter: 10, segments: 32}, scene);
    //sphere.position = vCenter;

    return {'path': path, 'center': vCenter, 'tube': tube };
}

// Make a straight part
//
// scene: 3D scene
// material: the color of the straight part
// index: index of the straight part (used in the mesh name)
// tpPrevBend: previous bend information
// straightLength: length of the straight part
function makeStraight(scene, material, index, tpPrevBend, straightLength) {

    const path = [];
    
    // pseudo center of the next bend, i.e. a point that is close to the end of 
    // the straight part and lies on the plane of the real center that it will
    // be calculated by the makeBend function
    let pseudoCenter = null; 

    if (tpPrevBend == null) {
        // first straight part
        path.push(new BABYLON.Vector3(1, 10, 0));
        path.push(new BABYLON.Vector3(1 + straightLength, 10, 0));
        pseudoCenter = new BABYLON.Vector3(1 + straightLength, 10 + 1, 0);
    } else {
        // any other straight part
        // the last point of the previous straight part is the first point of the bend
        const v1 = tpPrevBend.path[tpPrevBend.path.length - 1];
        path.push(v1);

        // identify the second (and last) point of the straight part
        const vMin2 = tpPrevBend.path[tpPrevBend.path.length - 2];
        const vLast2 = v1.subtract(vMin2);
        const vUX = vLast2.normalize();
        const v2 = v1.add(vUX.scale(straightLength));
        path.push(v2);

        // identify the pseudo center of the next bend
        const vU = tpPrevBend.center.subtract(v1).normalize();
        pseudoCenter = v2.add(vU.scale(1));
    }

    const tube = BABYLON.MeshBuilder.CreateTube("straight_" + index, {path: path, radius: TUBE_RADIUS, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene);
    tube.material = material;

    return {'path': path, 'pseudoCenter': pseudoCenter, 'tube': tube };
}

const createScene = function () {

    // --- scene and camera
    const scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, 3 * Math.PI / 8, 500, BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0));

    // --- materials (colors)
    var materialFirst = new BABYLON.StandardMaterial(scene);
    materialFirst.alpha = 1;
    materialFirst.diffuseColor = new BABYLON.Color3(0.2, 0.5, 1.0);

    var materialBend = new BABYLON.StandardMaterial(scene);
    materialBend.alpha = 1;
    materialBend.diffuseColor = new BABYLON.Color3(1.0, 0.2, 0.7);

    var materialStraight = new BABYLON.StandardMaterial(scene);
    materialStraight.alpha = 1;
    materialStraight.diffuseColor = new BABYLON.Color3(0.0, 1.0, 0.8);

    var materialLast = new BABYLON.StandardMaterial(scene);
    materialLast.alpha = 1;
    materialLast.diffuseColor = new BABYLON.Color3(0.91, 0.85, 0.3);

    // --- LRA
    let LRA = '';

    //        L          R          A         Radius
    LRA += ' 100         0          90          30    ' + "\n";
    LRA += '  50         90        180          50    ' + "\n";
    LRA += ' 150         0          0           0     ';

    // --- tube
    const lines = LRA.split('\n');
    const nPart = lines.length;
    let prevStraight = null;
    let prevBend = null;
    for (let i = 0; i < nPart; i++) {
        const fields = lines[i].split(' ').filter(x => x !== "");
        
        //console.log('---- ' + i);
        //console.log(fields);

        const partIdx = i + 1;
        const L = parseFloat(fields[0]);
        const R = parseFloat(fields[1]);
        const A = parseFloat(fields[2]);
        const Radius = parseFloat(fields[3]);

        let material = materialStraight;
        if (partIdx == 1) {
            material = materialFirst;
        } else if (partIdx == nPart) {
            material = materialLast;
        }

        prevStraight = makeStraight(scene, material, partIdx, prevBend, L);
        if (partIdx != nPart) {
            prevBend = makeBend(scene, materialBend, partIdx, prevStraight, R, A, Radius);
        }
    }

    // prodebug
    //const tpS1 = makeStraight(scene, materialFirst, 1, null, 25);
    //const tpB1 = makeBend(scene, materialBend, 1, tpS1, 0, 60, 30);
    //const tpS2 = makeStraight(scene, materialStraight, 2, tpB1, 40);
    //const tpB2 = makeBend(scene, materialBend, 2, tpS2, 180, 45, 30);
    //const tpS3 = makeStraight(scene, materialLast, 3, tpB2, 25);

    return scene;
}