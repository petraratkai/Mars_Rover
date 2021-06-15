var mqtt    = require('mqtt');
var client  = mqtt.connect("mqtt:/3.8.187.198",{clientId:"test"});

var dest = {x: 0, y: 0};
var rover_pos = {x: 0, y: 0};

function publish(topic,msg,options){
console.log("publishing",msg);

if (client.connected == true){

client.publish(topic,msg,options);

}
count+=1;
/*if (count==2) //ens script
	clearTimeout(timer_id); //stop timer
	client.end();
}*/
}



client.on('message', (topic, message, packet) => {
	console.log("message is "+ message);
	console.log("topic is "+ topic);
	if(topic == 'comm/coords') {
    //dest = JSON.parse(message);
    var ar = message.toString().split("|");
    dest.x = ar[0];
    dest.y = ar[1];
    console.log("received command: " + message);
  }
})

client.on("connect", () => {
console.log("connected");
//client.end();
})

client.on("error", error => {
console.log("cannot connect " + error);
process.exit(1)});

var options={
retain:true,
qos:0};

client.subscribe('comm/coords');

var timer_id=setInterval(function(){
  var alpha = Math.atan2(dest.y-rover_pos.y, dest.x-rover_pos.x);
  var unit = 0.1;
  var dx = unit*Math.cos(alpha);
  var dy = unit*Math.sin(alpha);
  rover_pos.x += dx;
  rover_pos.y += dy;
  publish("comm/coords",JSON.stringify(rover_pos),options);
  if(Math.abs(rover_pos.x-dest.x) < 0.2 && Math.abs(rover_pos.y-dest.y) < 0.2 ) {
    rover_pos = dest;
    publish('ready', JSON.stringify(rover_pos), options);
    publish("comm/coords",JSON.stringify(rover_pos),options);
  }
},500);
