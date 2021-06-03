//import Mongo from 'mongodb';
const express = require("express");
const path = require("path");
//var bodyParser = require('body-parser')
var cors = require('cors');
var mqtt    = require('mqtt');
var client  = mqtt.connect("mqtt:/localhost",{clientId:"mqttjs01"});
var count = 0;
var rover_cord = {x:0, y:0};
var ball_cord = [];

//receive messages - listener
client.on('message', (topic, message, packet) => {
	console.log("message is "+ message);
	console.log("topic is "+ topic);
});

client.on("connect", () => {
console.log("connected");
//client.end();
})

client.on("error", error => {
console.log("cannot connect " + error);
process.exit(1)});

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

const PORT = process.env.PORT || 8000;

const app = express();

app.use(express.static(path.resolve(__dirname, '../client/build')));

app.use(express.json());

app.use(express.urlencoded({ extended: true })) ;

app.use(cors());

//var jsonParser = bodyParser.json();

app.get("/api", (req, res) => {
  res.json({ message: "Hello from the server!"});
});
var x = 0;
var y = 0;

app.get("/rover", (req, res) => {
  x+=1;
  y+=1;
  //console.log("rover pos request received");
  res.send("{\"x\": " + x%100 + ", \"y\": " + y%100 + "}");
})
var i = 0;
var ballx, bally;
let cord = [];
app.get("/balls", (req, res) => {
  i++;
  //console.log("ball request received");
  if(i<=5) {
  ballx = Math.random()*100;
  bally = Math.random()*100;
  let ball = {x: ballx, y:bally};
  cord.push(ball);
  //res.send(cord);
  }
  else {
    //res.send(cord)
  }
  res.send(cord);
})
var options={
retain:true,
qos:0};

app.post('/sendInfo', (req, res) => {
    //var input = JSON.parse(req);
    //console.log(JSON.stringify(req.headers));
    console.log("recieved request: " + JSON.stringify(req.body));
    //console.log("test: " + req.body.{\"x)
    //res.json({message: "received req " + req});
    publish('comm/coords', req.body, options);
    res.set('Content-Type', 'text/plain');
    res.send(`You sent: req to Express`);
});

app.listen(PORT, () => {
  console.log("Browser server listening on " + PORT);
})


var message="test message";
var topic_list=["topic2","topic3","topic4"];
var topic_o={"topic22":0,"topic33":1,"topic44":1};
console.log("subscribing to topics");
//client.subscribe(topic,{qos:1}); //single topic
//client.subscribe(topic_list,{qos:1}); //topic list
//client.subscribe(topic_o); //object
client.subscribe("control/esptest");

var timer_id=setInterval(function(){publish("comm/laptoptest",message,options);},5000);
//notice this is printed even before we connect
console.log("end of script");
