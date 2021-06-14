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
    //var rover = require("../assets/img/mars_rover.png");
    var rover = require("../assets/img/rover2.2.png");
    var x = this.state.x+50-10;
    var y = this.state.y*(-1)+50-10;
    return (
      <Image
          className="fa-stack the-wrapper rover"
          src = {rover.default} width = "20%"
          style = {{top: y + "%", left: x + "%"}}
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
    //var rovercnt = 0;
    //var sum1 = 0;
    this.roverinterval = setInterval(()=> {
      //var startTime = new Date();
      //var endTime;
      axios.get('http://' + window.location.hostname + ':8000/rover')
        .then(res => {
          //alert(this.rover.current);
          /*endTime = new Date();
          rovercnt+=1;
          sum1+= (endTime-startTime)/1000;
          if(rovercnt == 1000) {
            alert('balls done');
            axios.post('http://' + window.location.hostname + ':8000/test', 'rover took on avg ' + sum1/rovercnt + 'ms');
          }*/
          if(this.rover.current) this.rover.current.changePos(res.data.x,res.data.y);
        })
        .catch(err => {
          console.log(err);
        })
    }, 300);
    //var ballcnt = 0;
    //var sum = 0;
    this.ballinterval = setInterval(()=> {
      //alert(window.location.hostname);
      //var startTime = new Date();
      //var endTime;
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
            /*endTime = new Date();
            ballcnt+=1;
            sum+=(endTime-startTime)/1000;
            if(ballcnt == 1000) {
              axios.post('http://' + window.location.hostname + ':8000/test', 'balls took on avg ' + sum/ballcnt + 'ms');
            }*/
            this.setState({ball_cord: res.data.balls, dest_coord: res.data.dest});
          }

        }
        )
        .catch(err => {
          console.log(err);
        })

    }, 400);
  }
  handleClick(event) {
    if(this) {
      if(this.ref.current) {
      let rect = this.ref.current.getBoundingClientRect();
      //alert(JSON.stringify(rect));
      let x = (event.clientX-rect.left)/rect.width*100;
      x-=50;
      x = x.toFixed(2);
      let y = (event.clientY-rect.top)/rect.height*100;
      y = (y-50)*(-1);
      y = y.toFixed(2);
      this.props.parentCallback({x:x, y:y});
    }
    }
  }
  renderBalls() {

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
      var x = ball_el.x+50-1.5;
      var y = ball_el.y*(-1)+50-1.5;
      //alert(x + " , " + y);
      return (
        <Image
          key={JSON.stringify(ball_el)}
          className="fa-stack the-wrapper ball"
          src = {ball.default} width = "3%"
          style = {{top: y + "%", left: x + "%"}}
        />
      )
    })
  }
  renderDest(){
    var dest = require('../assets/img/dest.png');
    return !this.state.dest_coord ? null : this.state.dest_coord.map((dest_el) => {
      //alert(JSON.stringify(dest_el));
      var x = parseFloat(dest_el.x)+50-2.5;
      var y = parseFloat(dest_el.y)*(-1)+50-5;
      //alert(x + ", " + y);
      return (
        <Image
          key={JSON.stringify(dest_el)}
          className="fa-stack the-wrapper ball"
          src = {dest.default} width = "5%"
          style = {{top: y + "%", left: x + "%"}}
        />
      );
    });
  }


  render() {
    const status = 'Map';
//<div className="status">{status}</div>
  //var background = require('../assets/img/brown_square.jpg');
  var background = require('../assets/img/map2.png');
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
