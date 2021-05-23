import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from 'axios';


class GoToButton extends React.Component {
  render() {
    return (
      <button className="goto">
        {"go to point"}
      </button>
    );
  }
}

class Square extends React.Component {
  render() {
    return (
      <button className="square">
        {/* TODO */}
      </button>
    );
  }
}

class Board extends React.Component {
  renderSquare(i) {
    return <Square />;
  }

  render() {
    const status = 'Map';

    return (
      <div>
        <div className="status">{status}</div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>

      </div>
    );
  }
}

class NameForm extends React.Component {
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
    //send the input to the http/mqtt http_server
    //console.log('alert not sent');
    alert('A destination point was submitted: ' + this.state.x + ', ' + this.state.y);
    //console.log("alert sent");
    //alert('point sent' + JSON.stringify(this.state));
    const test = { test: "This is a test" };
    const point = {
      x: this.state.x,
      y: this.state.y
    };
    //axios.get('http://localhost:3001/api');
    axios.post(
  'http://localhost:3001/sendInfo',
    //test

  //{ headers: { 'Content-Type': 'application/json' } }
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
            style={{ width: "50px" }}
            onChange={this.handleInputChange} />
        </label>
        <input type="submit" value="go to point" />
      </form>
    );
  }
}

class Game extends React.Component {
  renderGoto() {
    return <GoToButton />;
  }
  renderNameForm() {
    return <NameForm />;
  }
  render() {
    const title = 'MARS ROVER';
    return (
      <div className="game">
        <div className="title">{title}</div>
        <div className="game-board">
          <Board />
        </div>
        <div className="game-info">
          <div>{/* status */}</div>
          <ol>{/* TODO */}</ol>
        </div>
        <div className="nameform">
          <div> {this.renderNameForm()} </div>
        </div>
      </div>
    );
  }
}



// ========================================
ReactDOM.render(
  <React.StrictMode>
    <Game />
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
/*ReactDOM.render(
  <Game />,
  document.getElementById('root')
);*/


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
