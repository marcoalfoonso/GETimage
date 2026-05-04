//mqtt server connection

const client = mqtt.connect("wss://e4f0d50b37b04ea79745872566f605ff.s1.eu.hivemq.cloud:8884/mqtt",{
    clientId: "web_" + Math.random().toString(16).slice(2, 10),
    username: "MarcoA",
    password: "HATeR3__",
    clean: true
});

console.log("Connecting to HiveMQ Claud...");

client.on("connect", () => {
  console.log("Connecting with Outh");

  client.subscribe(["q1","q2","q3"], (err)=>{
    if(!err){
        console.log("Subscripcion en q1, q2 y q3 exitosa");
    }else{
        console.error("Error en subscripcion q1, q2 y q3:", err);
    }
    });
});

client.on("error", (err) => {
  console.error("Error:", err);
});

let g1 = 0;
let g2 = 0;
let g3 = 0;


document.addEventListener("DOMContentLoaded", function(){

    //se obtienen los valores de mqtt

    client.on("message",(topic,message)=>{
        const value = Number(message.toString());
        console.log("Topic: ",topic,"Value: ",value);


        if(topic === "q1"){
            console.log("q1: ", value);
            g1 = value;
        }

        if(topic === "q2"){
            console.log("q2: ", value);
            g2 = value;
        }

        if(topic === "q3"){
            console.log("q3: ", value);
            g3 = value;
        }

    });


    const container = document.getElementById("scope");
    const renderer = new THREE.WebGLRenderer({antialias:true});
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        100,
        1,
        0.1,
        1000
    );

    camera.position.set(1,1.2,-1.3);
    camera.lookAt(0,0,0);

    const grid = new THREE.GridHelper(3,8);
    scene.add(grid);

    function resize(){
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width,height);
        camera.aspect = width/height;
        camera.updateProjectionMatrix();
    }

    resize();
    window.addEventListener("resize", resize);

    //ligths

    const light1 = new THREE.DirectionalLight(0xffffff, 1);
    light1.position.set(2,2,2);
    scene.add(light1);

    const light2 = new THREE.AmbientLight(0x404040);
    scene.add(light2);

    //box geometry, material, mesh, add to scene, position

    const geometry = new THREE.BoxGeometry(0.1,0.1,0.1);
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00,wireframe:true } );
    const cube = new THREE.Mesh( geometry, material );

    scene.add( cube );

    //constants for kinematics

    const b1 = 0.38;
    const b2 = 0.23;
    const l1 = 0.45;
    const l2 = 0.88;

    let lastSend = 0;
    let lastSend2 = 0;
    let lastSend3 = 0;


    let q1 = g1 * Math.PI/180;
    let q2 = g2 * Math.PI/180;
    let q3 = g3 * Math.PI/180;

    //forward kinematics

    let x1 = l1 * Math.cos(q1) * Math.cos(q2);
    let y1 = b1+b2+l1*Math.sin(q2);
    let z1 = -l1*Math.sin(q1)*Math.cos(q2);

    let x2 = Math.cos(q1)*(l2*Math.cos(q2-q3)+l1*Math.cos(q2));
    let y2 = b1+b2+l1*Math.sin(q2)+l2*Math.sin(q2-q3);
    let z2 = -Math.sin(q1)*(l2*Math.cos(q2-q3)+l1*Math.cos(q2));


    //creating vectores for points and lines

    const base = new THREE.Vector3(0,0,0);
    const p1 = new THREE.Vector3(0,b1+b2,0);
    let p2 = new THREE.Vector3(x1,y1,z1);
    let ef = new THREE.Vector3(x2,y2,z2);

    let zeroF = new THREE.BufferGeometry().setFromPoints([
        base,
        ef 
    ]);

    const T01 = new THREE.BufferGeometry().setFromPoints([
        base,
        p1 
    ]);

    let T12 = new THREE.BufferGeometry().setFromPoints([
        p1,
        p2 
    ]);

    let T23 = new THREE.BufferGeometry().setFromPoints([
        p2,
        ef 
    ]);

    const material2 = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const material3 = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const material4 = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const material5 = new THREE.LineBasicMaterial({ color: 0xffff00 });

    let line = new THREE.Line(zeroF, material2);

    const line1 = new THREE.Line(T01, material3);
    let line2 = new THREE.Line(T12, material4);
    let line3 = new THREE.Line(T23, material5);

    //light

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(2,2,2);
    scene.add(light);

    scene.add(line1);
    scene.add(line);
    scene.add(line2);
    scene.add(line3);

    //create joint links

    const link1 = createLink(0.06, 0xff0000);
    const link2 = createLink(0.02, 0x00ff00);
    const link3 = createLink(0.02, 0x0000ff);

    //create joints

    const j0 = createJoint(0.03, 0xffffff);
    const j1 = createJoint(0.03, 0xffffff);
    const j2 = createJoint(0.03, 0xffffff);
    const j3 = createJoint(0.03, 0xffffff);


    //create fuction fot joint links

    function createLink(radius, color){

        const geometry = new THREE.CylinderGeometry(
            radius,
            radius,
            1,
            16
        );

        const material = new THREE.MeshBasicMaterial({
            color: color
        });

        const mesh = new THREE.Mesh(geometry, material);

        scene.add(mesh);

        return mesh;
    }

    //update joint position and orientation

    function updateLink(mesh, start, end){

        const direction = new THREE.Vector3()
            .subVectors(end, start);

        const length = direction.length();

        // midpoint position
        const midpoint = new THREE.Vector3()
            .addVectors(start, end)
            .multiplyScalar(0.5);

        mesh.position.copy(midpoint);

        // scale length
        mesh.scale.set(1, length, 1);

        // rotate to align
        mesh.quaternion.setFromUnitVectors(
            new THREE.Vector3(0,1,0),
            direction.clone().normalize()
        );
    }

    //function to create joints

    function createJoint(radius, color){

        const geometry = new THREE.SphereGeometry(radius, 16, 16);

        const material = new THREE.MeshBasicMaterial({
            color: color
        });

        const mesh = new THREE.Mesh(geometry, material);

        scene.add(mesh);

        return mesh;
    }

    function animate(){

        q1 = g1 * Math.PI/180;
        q2 = g2 * Math.PI/180;
        q3 = g3 * Math.PI/180;

        x1 = l1 * Math.cos(q1) * Math.cos(q2);
        y1 = b1+b2+l1*Math.sin(q2);
        z1 = -l1*Math.sin(q1)*Math.cos(q2);

        x2 = Math.cos(q1)*(l2*Math.cos(q2-q3)+l1*Math.cos(q2));
        y2 = b1+b2+l1*Math.sin(q2)+l2*Math.sin(q2-q3);
        z2 = -Math.sin(q1)*(l2*Math.cos(q2-q3)+l1*Math.cos(q2));

        p2.set(x1,y1,z1);
        ef.set(x2,y2,z2);

        line.geometry.setFromPoints([base,ef]);
        updateLink(link1, base, p1);
        updateLink(link2, p1, p2);
        updateLink(link3, p2, ef);

        j0.position.copy(base);
        j1.position.copy(p1);
        j2.position.copy(p2);
        j3.position.copy(ef);

        renderer.render(scene,camera);
    }

    renderer.setAnimationLoop(animate);

});
