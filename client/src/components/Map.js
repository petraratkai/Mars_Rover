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
     x: 0,
     y: 0,
     color: 0
   };
  }
  changePos = ((xvalue,yvalue) => {
    this.setState({
      x: xvalue,
      y: yvalue
    });
  })
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
          src = {rover.default} width = "10%"
          style = {{top: this.state.y*90/100 + "%", left: this.state.x*90/100 + "%"}}
      />
    );
  }
}


class Map extends React.Component {
  constructor(props) {
    super(props);
    this.rover = React.createRef();
    //this.ball_cord = [];
    this.state = {
      ball_cord: [],
      dest_coord: []
    };
    this.handleClick = this.handleClick.bind(this);
    this.ref = React.createRef();
    }

  componentDidMount  ()
  {
    this.roverinterval = setInterval(()=> {
      axios.get('http://' + window.location.hostname + ':8000/rover')
        .then(res => {
          //alert(this.rover.current);
          if(this.rover.current) this.rover.current.changePos(res.data.x,res.data.y);
        })
        .catch(err => {
          console.log(err);
        })
    }, 500);
    this.ballinterval = setInterval(()=> {
      //alert(window.location.hostname);
      axios.get('http://' + window.location.hostname + ':8000/balls')
        .then(res => {
          if(res.data) {
            //alert(JSON.stringify( res.data));
            //let newball = new Ball;
            //this.balls.current.push(newball);

            //this.balls.current[0].changePos(res.data.x,res.data.y);
            //let ball_cord = this.state.ball_cord.slice();
            //ball_cord.push(res.data);
            //alert(JSON.stringify(res.data));
            //alert(window.location.hostname)
            this.setState({ball_cord: res.data.balls, dest_coord: res.data.dest});
          }
        }
        )
        .catch(err => {
          console.log(err);
        })
    }, 5000);
  }
  handleClick(event) {
    if(this) {
      if(this.ref.current) {
      let rect = this.ref.current.getBoundingClientRect();
      //alert(JSON.stringify(rect));
      let x = (event.clientX-rect.left)/rect.width*100;
      x = x.toFixed(2);
      let y = (event.clientY-rect.top)/rect.height*100;
      y = y.toFixed(2);
      this.props.parentCallback({x:x-50, y:(y-50)*(-1)});
    }
    }
  }
  renderBalls() {
    /*return !this.balls.current ? null : this.balls.current.map((ball) => {
      return (
        <Ball ref = {ball} />
      );
    });*/
    var ball;
    var redball = require('../assets/img/coloredspheres/sphere-11.png');
    var blueball = require('../assets/img/coloredspheres/sphere-23.png');
    var yellowball = require('../assets/img/coloredspheres/sphere-22.png');
    var greenball = require('../assets/img/coloredspheres/sphere-14.png');
    var pinkball = require('../assets/img/coloredspheres/sphere-16.png');
    return !this.state.ball_cord ? null : this.state.ball_cord.map((ball_el) => {
      if(ball_el.color == "red")
        ball = redball;
      else if(ball_el.color == "blue")
        ball = blueball;
      else if(ball_el.color == "yellow")
        ball = yellowball;
      else if(ball_el.color == "green")
        ball = greenball;
      else if(ball_el.color =="pink")
        ball = pinkball;
      else throw("invalid color" + ball_el.color);
      //alert(JSON.stringify(ball_el));
      return (
        <Image
          key={JSON.stringify(ball_el)}
          className="fa-stack the-wrapper ball"
          src = {ball.default} width = "3%"
          style = {{top: ((ball_el.y-1.5)+50)*(-1) + "%", left: (ball_el.x-1.5)+50 + "%"}}
        />
      )
    })
  }
  renderDest(){
    var dest = require('../assets/img/dest.png');
    return !this.state.dest_coord ? null : this.state.dest_coord.map((dest_el) => {
      return (
        <Image
          key={JSON.stringify(dest_el)}
          className="fa-stack the-wrapper ball"
          src = {dest.default} width = "5%"
          style = {{top: (dest_el.y-5) + "%", left: (dest_el.x-2.5) + "%"}}
        />
      );
    });
  }


  render() {
    const status = 'Map';
//<div className="status">{status}</div>
  var background = require('../assets/img/brown_square.jpg');
  var ball = require('../assets/img/coloredspheres/sphere-08.png');
  var rover = require("../assets/img/mars_rover.png");
    return (
      <div >
      <a className="block-icon">
        <Image
          src={background.default} height="100%" width="100%"
          ref = {this.ref}
          onClick = {this.handleClick}
        />
        <Rover ref={this.rover}/>
        {this.renderBalls()}
        {this.renderDest()}
      </a>

      </div>

    );
  }
}

export default Map;
