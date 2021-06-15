var mqtt    = require('mqtt');
var client  = mqtt.connect("mqtt:/localhost",{clientId:"test"});

var dest = {x: 0, y: 0};
var rover_pos = {x: 0, y: 0};

function publish(topic,msg,options){
//console.log("publishing",msg);

if (client.connected == true){

client.publish(topic,msg,options);

}
//count+=1;
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
    if(message!= '{"x":null,"y":null}') {
    var ar = message.toString().split("|");
    dest.x = parseFloat(ar[0]);
    dest.y = parseFloat(ar[1]);
  }
    console.log("received command: " + message);
  }
  else {
    console.log("received topic: " + topic);
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
if(rover_pos!== {x:null,y:null} && dest !== {x:null,y:null}) {
  if(Math.abs(rover_pos.x-dest.x) < 2 && Math.abs(rover_pos.y-dest.y) < 2 ) {
		//console.log(JSON.stringify(dest));
		console.log(JSON.stringify(rover_pos));
		publish("control/positions",JSON.stringify(rover_pos),options);
		rover_pos = dest;
    //publish('ready', JSON.stringify(rover_pos), options);

  }
	else {
		var alpha = Math.atan2(dest.y-rover_pos.y, dest.x-rover_pos.x);
	  var unit = 1;
	  var dx = unit*Math.cos(alpha);
	  var dy = unit*Math.sin(alpha);
	  rover_pos.x += dx;
	  rover_pos.y += dy;
		console.log(JSON.stringify(rover_pos));
	  publish("control/positions",JSON.stringify(rover_pos),options);
	}
}
},500);
