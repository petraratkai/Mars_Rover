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
		if(dbo)
		dbo.collection("commands").find().sort(sort_chron).limit(1).toArray((err, res) => {
			if(err) throw err;
			if(res.length===undefined || res.length == 0) {
				//ready = true;
			}
			else {
				if(commands.length==1) {
					ready = true;
					commands_complex.shift(); //remove the current position since we reached it
					path_complex.shift();
					commands.shift();
				}
				else {
				var options={
				retain:true,
				qos:0};
				publish('comm/coords', commands[0].x + '|' + commands[0].y, options);
				var query = {time: res[0].time};

				if(dbo)
					dbo.collection("commands").deleteOne(query, (err, result) => {
					if(err) throw err;
				});
				ready = false;
				commands_complex.shift(); //remove the current position since we reached it
				path_complex.shift();
				commands.shift();
			}
			}
		});
	}
	else if(topic == 'control/obstacles') {
		//let ball = {x: ballx, y:bally, color: colors[i-1]};
		//coord.push(ball);
		//var myobj = { score: game.cars[i].score, Date: new Date() };
		//coord.push(message);
		message=JSON.parse(message);
		if(dbo) dbo.collection("balls").insertOne(message, function(err, res) {
			if (err) throw err;
			console.log("1 ball inserted");
		});
		let rad = 1;
		let ball_compl = math.complex({re: message.x, im: message.y});
		let newObst = {centre: ball_compl, radius: rad};
		coord.push(message);
		[allObstacles, allHitboxes] = addObstacle(newObst, allObstacles);
		path_complex = [];
		let originalPath = commands_complex;
		originalPath.unshift(math.complex({re: rover_coord.x, im: rover_coord.y}));
		path_complex = pathAdjust(originalPath, allObstacles, allHitboxes, roverWidth, safetyMargin);
		path_complex.shift(); //remove current position
	}
	else if(topic == 'control/positions') {
		// posx = message.x;
		//var posy = message.y;
		var options={
		retain:true,
		qos:0};
		rover_coord = JSON.parse(message);
		if(commands.length>0 && !ready && Math.abs(rover_coord.x - commands[0].x)<0.2 && Math.abs(rover_coord.y -commands[0].y) <0.2);
			//publish('ready', "done", options);
	}
	else if(topic == 'done') {
		if(commands.length <=1) ready =true;
		commands.shift();
		commands_complex.shift();
		path_complex.shift();
		if(commands.length>0) {
		publish('comm/coords', commands[0].x+"|"+commands[0].y, options);
		ready = false;
	}
	}
});

client.on("connect", () => {
console.log("connected");
//client.end();
})

client.on("error", error => {
console.log("cannot connect " + error);
process.exit(1)});



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
	var roverx = x%100-50;
	var rovery = y%100-50;
  //res.send("{\"x\": " + roverx + ", \"y\": " + rovery + "}");
	res.send(rover_coord);
})

app.get("/clearnotif", (req, res) => {
  notifications=[];
  //console.log("rover pos request received");
  res.send(notifications);
})
var i = 0;
var ballx, bally;
let coord = [];
let colors = ["red", "blue", "yellow", "pink", "green"];
//let ballfixed = [{x:0, y:50}, {x:30, y:60}, {x:75, y:20}, {x:40, y:10}, {x:, y:}];
app.get("/balls", (req, res) => {
  i++;
  //console.log("ball request received");
  if(i<=1) {
  //ballx = Math.random()*100-50;
  //bally = Math.random()*100-50;
	ballx = 0;
	bally = 50/2.5;
  let ball = {x: ballx, y:bally, color: colors[i-1]};
  coord.push(ball);
	notifications.unshift("ball found: " + colors[i-1]);

	//var myobj = { score: game.cars[i].score, Date: new Date() };
	if(dbo) dbo.collection("balls").insertOne(ball, function(err, res) {
		if (err) throw err;
		console.log("1 ball inserted");

	});
	let rad = 1;
	let ball_compl = math.complex({re: ballx, im: bally});
	let newObst = {centre: ball_compl, radius: rad};
	[allObstacles, allHitboxes] = addObstacle(newObst, allObstacles);
	path_complex = [];
	let originalPath = commands_complex;
	originalPath.unshift(math.complex({re: rover_coord.x, im: rover_coord.y}));
	path_complex = pathAdjust(originalPath, allObstacles, allHitboxes, roverWidth, safetyMargin);
	path_complex.shift(); //remove current position

	}
	if(dbo) dbo.collection("balls").find({}).toArray((err,result) => {
		if(err) throw err;
		//console.log("balls read");
		//coord = result;
		//res.send(coord);
	});
  res.send({balls:coord, dest: commands});
})

app.post("/clearmap", (req, res) => {
	console.log(req.body);
	coord = [];
	commands = [];
	if(dbo) dbo.collection("balls").deleteMany({});
	if(dbo) dbo.collection("commands").deleteMany({});
	notifications.unshift("map cleared");
})

/*app.post("/test", (req, res) => {
	notifications.push(JSON.stringify(req.body));
})*/
var options={
retain:true,
qos:0};

function toXY(z) {
	return {x: z.re, y:z.im};
}

app.post('/sendInfo', (req, res) => {
	var d = new Date();
		var xval = req.body.x;
		var yval = req.body.y;
		if(ready) {
    //publish('comm/coords', req.body.x + '|' + req.body.y, options);
		ready = false;
		//console.log(JSON.stringify(rover_coord));

		let start = math.complex({re: rover_coord.x, im: rover_coord.y});
		let end = math.complex({re: req.body.x, im: req.body.y});
		commands_complex.push(end);
		//commands.push(req.body);
		//console.log(commands);
		let originalPath = [start, end];
		console.log("before" + JSON.stringify(originalPath));
		originalPath = pathAdjust(originalPath, allObstacles, allHitboxes, roverWidth, safetyMargin);
		console.log("after" + JSON.stringify(originalPath));
		//path_complex.push.apply(path_complex, originalPath);
		let first = toXY(originalPath[1]);
		commands.push(toXY(originalPath[1]));
		console.log(JSON.stringify(first));
		publish('comm/coords', first.x + '|' + first.y, options);

		for(var i = 2; i<originalPath.length; i++)
		{
			commands.push(toXY(originalPath[i]));
			if(dbo) dbo.collection("commands").insertOne({x: originalPath[i].x, y: originalPath[i].y, time: d.getTime()}, (err, result) => {
				if(err) throw err;
				console.log("command saved in db");

			})
		}
		//if(req.body.y && req.body.x)
		//publish('comm/coords', req.body.x + '|' + req.body.y, options);
		}
		else {
			var d = new Date;
			var command = {x: req.body.x, y: req.body.y, time: d.getTime()};
			let start = commands_complex[commands_complex.length - 1];
			let end = math.complex(req.body.x, req.body.y);
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
client.subscribe('done');

var timer_id=setInterval(function(){publish("comm/connection",message,options);},5000);
//notice this is printed even before we connect
console.log("end of script");
