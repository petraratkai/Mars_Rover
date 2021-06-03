//import Mongo from 'mongodb';
const express = require("express");
const path = require("path");
//var bodyParser = require('body-parser')
var cors = require('cors');

const PORT = process.env.PORT || 3001;

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
  console.log("rover pos request received");
  res.send("{\"x\": " + x%100 + ", \"y\": " + y%100 + "}");
})
var i = 0;
var ballx, bally;
let cord = [];
app.get("/balls", (req, res) => {
  i++;
  console.log("ball request received");
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

app.post('/sendInfo', (req, res) => {
    //var input = JSON.parse(req);
    //console.log(JSON.stringify(req.headers));
    console.log("recieved request: " + JSON.stringify(req.body));
    //console.log("test: " + req.body.{\"x)
    //res.json({message: "received req " + req});
    res.set('Content-Type', 'text/plain');
    res.send(`You sent: req to Express`);
});

app.listen(PORT, () => {
  console.log("Browser server listening on " + PORT);
})
