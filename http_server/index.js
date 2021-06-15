var Mongo = require('mongodb');
const express = require("express");
const path = require("path");
const {addObstacle, pathAdjust} = require('./pathfind.js');
//var bodyParser = require('body-parser')
var cors = require('cors');
var mqtt    = require('mqtt');
var client  = mqtt.connect("mqtt:/localhost",{clientId:"mqttjs01"});
var count = 0;
var rover_coord = {x:0, y:0};
var ball_coord = [];
let ready = true;
let roverWidth = 5;
let safetyMargin = 5;
var math = require('mathjs');
let obst_complex = [];
let allObstacles = [];
let allHitboxes = [];
let commandsNrOf = 0;
let commands = [];
let commands_complex = [];
let path_complex = [];
let notifications = [];
//database stuff
var dbo;
const uri = "mongodb+srv://MarsRover:Ji3mrANVpliUEzA9@cluster0.zplcu.mongodb.net/MarsRover?retryWrites=true&w=majority";
const MongoClient = Mongo.MongoClient;
const mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
mongoClient.connect((err, db) => {
	if(err)
		throw(err);
	dbo = db.db("MarsRover");
	if(dbo) {
		dbo.collection("balls").deleteMany({});
		dbo.collection("commands").deleteMany({});
	}
	console.log("MongoDB connected")
});
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
//receive messages - listener
client.on('message', (topic, message, packet) => {
	console.log("message is "+ message);
	console.log("topic is "+ topic);
	if(topic == 'ready') {
		var sort_chron = {time: 1};
		dbo.collection("commands").find().sort(sort_chron).limit(1).toArray((err, res) => {
			if(err) throw err;
			if(res.length===undefined || res.length == 0) {
				ready = true;
			}
			else {
				var options={
				retain:true,
				qos:2};
				qos:0};
				publish('comm/coords', res[0], options);
				var query = {time: res[0].time};
				dbo.collection("commands").deleteOne(query, (err, result) => {
					if(err) throw err;
				});
				ready = false;
				//ready = false;
				commands_complex.shift(); //remove the current position since we reached it
				path_complex.shift();
			}
@@ -199,7 +199,7 @@ app.post("/clearmap", (req, res) => {
})*/
var options={
retain:true,
qos:2};
qos:0};

function toXY(z) {
	return {x: z.re, y:z.im};
@@ -208,7 +208,7 @@ function toXY(z) {
app.post('/sendInfo', (req, res) => {
		if(ready) {
    //publish('comm/coords', req.body.x + '|' + req.body.y, options);
		ready = false;
		//ready = false;
		//console.log(JSON.stringify(rover_coord));
		let start = math.complex(rover_coord.x, rover_coord.y);
		let end = math.complex(req.body.x, req.body.y);
		commands_complex.push(end);
		commands.push(req.body);
		//console.log(commands);
		/*let originalPath = [start, end];
		originalPath = pathAdjust(originalPath, allObstacles, allHitboxes, roverWidth, safetyMargin);
		path_complex.push.apply(path_complex, originalPath);
		let first = toXY(originalPath[1]);
		publish('comm/coords', first.x + '|' + first.y, options);
		for(var i = 2; i<originalPath.length; i++)
		{
			if(dbo) dbo.collection("commands").insertOne({x: originalPath[i].x, y: originalPath[i].y, time: d.getTime()}, (err, result) => {
				if(err) throw err;
				console.log("command saved in db");
			})
		}*/
		if(req.body.y && req.body.x)
		publish('comm/coords', req.body.x + '|' + req.body.y, options);
		}
		else {
			var d = new Date;
			var command = {x: req.body.x, y: req.body.y, time: d.getTime()};
			let start = commands_complex[commands_complex.length - 2];
			let end = math.complex({re: req.body.x, im: req.body.y);
			let originalPath = [start, end];
			commands_complex.push(end);
			commands.push(req.body);
			originalPath = pathAdjust(originalPath, allObstacles, allHitboxes, roverWidth, safetyMargin);
			path_complex.push.apply(path_complex, originalPath);
			if(dbo) dbo.collection("commands").insertOne(command, (err, result) => {
				if(err) throw err;
				console.log("command saved in db");
			})
		};
    res.set('Content-Type', 'text/plain');
    res.send(`You sent: req to Express`);
});
app.get("/notifications", (req, res) => {
	res.send(notifications);
});
app.post('/login', (req, res) => {
	console.log(JSON.stringify(req.body));
	if(req.body.password == "password")
  res.send({
    token: 'test123'
  });
	else res.send({token: undefined});
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
client.subscribe("ready");
client.subscribe("control/obstacles");
client.subscribe('control/positions');
var timer_id=setInterval(function(){publish("comm/connection",message,options);},5000);
//notice this is printed even before we connect
console.log("end of script");
