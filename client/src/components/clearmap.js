import React from 'react';
import ReactDOM from 'react-dom';
//import App from './App';
import "../index.css";
import axios from 'axios';

class Clearmap extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    axios.post(
  'http://' + window.location.hostname + ':8000/clearmap'
);
  alert('resetting map');
  }
  render() {
    return (
      <button className = "clearmap" onClick = {this.handleClick} >
        clear map
      </button>
    );
  }
}

export default Clearmap;
