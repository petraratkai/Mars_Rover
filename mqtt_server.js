var mqtt    = require('mqtt');
var count =0;
var client  = mqtt.connect("mqtt://localhost",{clientId:"mqttjs01"});

//receive messages - listener
client.on('message', (topic, message, packet) => {
	console.log("message is "+ message);
	console.log("topic is "+ topic);
	var options={
	retain:true,
	qos:1};
	publish("comm/laptoptest", message,options);
});

client.on("connect", () => {
console.log("connected");
//client.end();
})

client.on("error", error => {
console.log("cannot connect " + error);
process.exit(1)});

//client.publish(topic, message, [options], [callback]);

//client.subscribe(topic/topic array/topic object, [options], publish)

function publish(topic,msg,options){
	var startTime = new Date();
console.log("publishing",msg);

if (client.connected == true){

	client.publish(topic,msg,options);
	var endTime = new Date();
	var timeDiff = endTime-startTime;
	console.log("time took to publish: " + timeDiff + "ms");
}
count+=1;
//if (count==2)  //ens script
	//clearTimeout(timer_id); //stop timer
	//client.end();
}

//////////////

var options={
retain:true,
qos:1};
var topic="testtopic";
var message="test message";
var topic_list=["topic2","topic3","topic4"];
var topic_o={"topic22":0,"topic33":1,"topic44":1};
console.log("subscribing to topics");
//client.subscribe(topic,{qos:1}); //single topic
//client.subscribe(topic_list,{qos:1}); //topic list
//client.subscribe(topic_o); //object
client.subscribe("control/esptest");

//var timer_id=setInterval(function(){publish("comm/laptoptest",message,options);},5000);
//notice this is printed even before we connect
console.log("end of script");
