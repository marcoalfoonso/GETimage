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

client.on("message",(topic,message)=>{
    const value = Number(message.toString());
    console.log("Topic: ",topic,"Value: ",value);

    if(topic === "q1"){
        console.log("q1: ", value);
    }

    if(topic === "q2"){
        console.log("q2: ", value);
    }

    if(topic === "q3"){
        console.log("q3: ", value);
    }

});
