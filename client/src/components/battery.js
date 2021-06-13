import React from 'react';
import ReactDOM from 'react-dom';
import Image from "react-bootstrap/Image"

class Battery extends React.Component {


  render() {
    var battery = require('../assets/img/battery100.jpg');
    return(
      <Image

          src = {battery.default} width = "50px"
      />
    );
  }
}

export default Battery;
