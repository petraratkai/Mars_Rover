import React from 'react';
import ReactDOM from 'react-dom';
import '../index.css';
import App from '../App';
import reportWebVitals from '../reportWebVitals';
import axios from 'axios';
import '../assets/css/bootstrap.min.css'
import '../assets/css/light-bootstrap-dashboard.css'
import '../assets/css/dashboard.css'

class Pointinput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {x: '', y: ''};

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  handleSubmit() {
    alert('A destination point was submitted: ' + this.state.x + ', ' + this.state.y);
    const test = { test: "This is a test" };
    const point = {
      x: this.state.x,
      y: this.state.y
    };
    axios.post(
  'http://localhost:3001/sendInfo',
).then(response => {
    console.log(response);
    return response.json();
  });

  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          x:
          <input
            name="x"
            type="number"
            value={this.state.x}
            style={{ width: "50px" }}
            onChange={this.handleInputChange} />
        </label>
        <label>
          y:
          <input
            name = "y"
            type="number"
            value={this.state.y}
            style={{ width: "50px"}}
            onChange={this.handleInputChange} />
        </label>
        <input type="submit" value="go to point" />
      </form>
    );
  }
}

export default Pointinput;
