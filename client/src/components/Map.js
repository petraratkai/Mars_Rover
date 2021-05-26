import React from 'react';
import ReactDOM from 'react-dom';
//import App from './App';
import "../index.css";
import axios from 'axios';
import Image from "react-bootstrap/Image"


class Square extends React.Component {
  render() {
    return (
      <button className="square">
        {/* TODO */}
      </button>
    );
  }
}

/*class Mapbackground extends React.Component {
  render() {
    return (
      <div className="mapbackground">/div>
    );
  }
}*/
class Ball extends React.Component {
  constructor(props) {
   super(props);
   this.state = {
     x: this.props.x,
     y: this.props.y,
     color: this.props.color
   };
  }
  render() {
    var ball = require('../assets/img/coloredspheres/sphere-02.png');
    return (
      <Image
        className="fa-stack the-wrapper ball"
        src = {ball.default} width = "3%"
        style = {{top: this.state.y + "%", left: this.state.x + "%"}}
      />
    );
  }
}

class Rover extends React.Component {
  constructor(props) {
   super(props);
   this.state = {x: 0, y:0};
  }
  changePos = ((xvalue,yvalue) => {
    this.setState({
      x: xvalue,
      y: yvalue
    });
  })
  render() {
    var rover = require("../assets/img/mars_rover.png");
    return (
      <Image
          className="fa-stack the-wrapper rover"
          src = {rover.default} width = "15%"
          style = {{top: this.state.y + "%", left: this.state.x + "%"}}
      />
    );
  }
}



class Map extends React.Component {
  constructor(props) {
    super(props);
    this.rover = React.createRef();
    this.balls = [];
  }

  componentDidMount  ()
  {
    this.roverinterval = setInterval(()=> {
      axios.get('http://localhost:3001/rover')
        .then(res => {
          //alert(JSON.stringify(res.data));
          this.rover.current.changePos(res.data.x,res.data.y);
        })
        .catch(err => {
          console.log(err);
        })
    }, 300);
    this.ballinterval = setInterval(()=> {
      axios.get('http://localhost:3001/balls')
        .then(res => {
          if(res.data.x !== -1 && res.data.y !== -1)
          {
            let newball = new Ball(res.data.x, res.data.y, 0);
            this.balls.push(newball)
          }
        })
        .catch(err => {
          console.log(err);
        })
    }, 1000);
  }





  render() {
    const status = 'Map';
//<div className="status">{status}</div>
  var background = require('../assets/img/brown_square.jpg');
  var ball = require('../assets/img/coloredspheres/sphere-08.png');
  var rover = require("../assets/img/mars_rover.png");
    return (
      <div>
      <a alt="" href="" className="block-icon">
        <Image
          src={background.default} height="100%"
        />
        <Image
            className="fa-stack the-wrapper ball"
            src = {ball.default} width = "3%"

        />
        <Ball/>
        <Rover ref={this.rover}/>
        <div>
          { this.balls }
        </div>

      </a>
        </div>

    );
  }
}

export default Map;
