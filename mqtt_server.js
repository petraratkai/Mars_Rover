var mqtt    = require('mqtt');
var count =0;
var client  = mqtt.connect("mqtt://localhost",{clean:true, clientId:"mqttjs01"});

//receive messages - listener
client.on('message', (topic, message, packet) => {
	console.log("message is "+ message);
	console.log("topic is "+ topic);
	var options={
	retain:true,
	qos:1};
	//publish("comm/laptoptest", cord,options);
})

client.on("connect", () => {
console.log("connected");
//client.end();
/*var options={
retain:true,
qos:1};*/
//publish("comm/laptoptest", "hello",options);

})

client.on("error", error => {
console.log("cannot connect " + error);
process.exit(1)});

//client.publish(topic, message, [options], [callback]);

//client.subscribe(topic/topic array/topic object, [options], publish)

function publish(topic,msg,options){
	var startTime = new Date();
//console.log("trying to publish",msg);

if (client.connected == true){
	console.log("publishing",msg);
	client.publish(topic,msg,options);
	var endTime = new Date();
	var timeDiff = endTime-startTime;
	console.log("time took to publish: " + timeDiff + "ms");
}
count+=1;
/*if (count==5)  //ens script
{
	//clearTimeout(timer_id); //stop timer
	client.end();
}*/
}

//////////////

var options={
retain:true,
qos:1};
var topic="testtopic";
var message= {x: 4, y: 20};
var topic_list=["topic2","topic3","topic4"];
var topic_o={"topic22":0,"topic33":1,"topic44":1};
console.log("subscribing to topics");
//client.subscribe(topic,{qos:1}); //single topic
//client.subscribe(topic_list,{qos:1}); //topic list
//client.subscribe(topic_o); //object
//publish("comm/laptoptest",message,options);
client.subscribe("control/esptest", function(){publish("comm/coords",message,options);});


var timer_id=setInterval(function(){
	var x = Math.random()*100;
	var y = Math.random()*100;
	publish("comm/coords", x + "|" + y ,options);
},5000);
//notice this is printed even before we connect
console.log("end of script");
