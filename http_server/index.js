var Mongo = require('mongodb');
const express = require("express");
const path = require("path");
//var bodyParser = require('body-parser')
var cors = require('cors');
var mqtt    = require('mqtt');
var client  = mqtt.connect("mqtt:/localhost",{clientId:"mqttjs01"});
var count = 0;
var rover_coord = {x:0, y:0};
var ball_coord = [];
let ready = true;

//database stuff
var dbo;
const uri = "mongodb+srv://MarsRover:Ji3mrANVpliUEzA9@cluster0.899ar.mongodb.net/MarsRover?retryWrites=true&w=majority";
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
				qos:0};
				publish('comm/coords', res[0], options);
				var query = {time: res[0].time};
				dbo.collection("commands").deleteOne(query, (err, result) => {
					if(err) throw err;
				});
				ready = false;

			}
		});
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
  res.send("{\"x\": " + x%100 + ", \"y\": " + y%100 + "}");
})
var i = 0;
var ballx, bally;
let coord = [];
let colors = ["red", "blue", "yellow", "pink", "green"];
app.get("/balls", (req, res) => {
  i++;
  //console.log("ball request received");
  if(i<=5) {
  ballx = Math.random()*100;
  bally = Math.random()*100;
  let ball = {x: ballx, y:bally, color: colors[i-1]};
  //coord.push(ball);
	//var myobj = { score: game.cars[i].score, Date: new Date() };
	if(dbo) dbo.collection("balls").insertOne(ball, function(err, res) {
		if (err) throw err;
		console.log("1 ball inserted");
	});

	}
	if(dbo) dbo.collection("balls").find({}).toArray((err,result) => {
		if(err) throw err;
		console.log("balls read");
		coord = result;
	});
  res.send(coord);
})

app.post("/clearmap", (req, res) => {
	console.log(req.body);
	coord = [];
	if(dbo) dbo.collection("balls").deleteMany({});
})
var options={
retain:true,
qos:0};

var d = new Date;
app.post('/sendInfo', (req, res) => {
    //var input = JSON.parse(req);
    //console.log(JSON.stringify(req.headers));
    //console.log("recieved request: " + JSON.stringify(req.body));
    //console.log("test: " + req.body.{\"x)
    //res.json({message: "received req " + req});
		if(ready) {
    publish('comm/coords', req.body.x + '|' + req.body.y, options);
		ready = false;
		}
		else {
			var command = {x: req.body.x, y: req.body.y, time: d.getTime()};
			if(dbo) dbo.collection("commands").insertOne(command, (err, result) => {
				if(err) throw err;
				console.log("command saved in db");
			})
		};
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
client.subscribe("ready");

//var timer_id=setInterval(function(){publish("comm/laptoptest",message,options);},5000);
//notice this is printed even before we connect
console.log("end of script");
