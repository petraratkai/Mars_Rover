import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'
import axios from 'axios';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';


import Image from "react-bootstrap/Image"



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
    var ball = require('./images/coloredspheres/sphere-02.png');
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
    var rover = require("./images/mars_rover.png");
    return (
      <CardMedia image = {rover.default} width = "10%"
          style = {{top: this.state.y*90/100 + "%", left: this.state.x*90/100 + "%", position: "absolute"}}
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
      ball_cord: []
    };
    }

  componentDidMount  ()
  {
    this.roverinterval = setInterval(()=> {
      axios.get('http://localhost:3001/rover')
        .then(res => {
          //alert(this.rover.current);
          if(this.rover.current) this.rover.current.changePos(res.data.x,res.data.y);
        })
        .catch(err => {
          console.log(err);
        })
    }, 500);
    this.ballinterval = setInterval(()=> {
      axios.get('http://localhost:3001/balls')
        .then(res => {
          if(res.data.x != -1) {
            //alert(JSON.stringify( res.data));
            //let newball = new Ball;
            //this.balls.current.push(newball);

            //this.balls.current[0].changePos(res.data.x,res.data.y);
            let ball_cord = this.state.ball_cord.slice();
            ball_cord.push(res.data);
            this.setState({ball_cord: ball_cord});
          }
        }
        )
        .catch(err => {
          console.log(err);
        })
    }, 5000);
  }
  renderBalls() {
    /*return !this.balls.current ? null : this.balls.current.map((ball) => {
      return (
        <Ball ref = {ball} />
      );
    });*/
    return !this.state.ball_cord ? null : this.state.ball_cord.map((ball_el) => {
      var ball = require('./images/coloredspheres/sphere-08.png');
      //alert(JSON.stringify(ball_el));
      return (
        <CardMedia
          key={JSON.stringify(ball_el)}
          image = {ball.default} width = "3%"
          style = {{top: ball_el.y + "%", left: ball_el.x + "%", position: "absolute"}}
        />
      )
    })
  }
  render() {
    const status = 'Map';
//<div className="status">{status}</div>
  var background = require('./images/brown_square.jpg');
  var ball = require('./images/coloredspheres/sphere-08.png');
  var rover = require("./images/mars_rover.png");
  const styles = {
    card: {
      position: "relative",
    },
    overlay: {
      position: "absolute",
    }
  };
    return (
      <a>

        <CardMedia minHeight = "100%" width = "100%" height = "100%" style = {{position: "relative", height:"100%", width: "100%"}} image={background.default} height="100%" width="100%"
        />
        <Rover ref={this.rover}/>
        {this.renderBalls()}
      </a>

    );
  }
}

export default Map;
