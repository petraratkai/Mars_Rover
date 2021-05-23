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

app.post('/sendInfo', function(req, res) {
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
