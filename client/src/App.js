import React, { Component } from "react";
import logo from './logo.svg';
import './App.css';
import Widget from './Widget';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Main from './components/Main'




/*function App() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    fetch("/api")
      .then((res) => res.json())
      .then((data) =>  setData(data.message));
  }, []);

  return (
    <div className = "App">
      <header className = "App-header">
      <div className = "wrapper">

        <Router>
          <Sidebar />
          <Route path='/' component = {Main} />
        </Router>
        </div>
        <img src ={logo} className="App-logo" alt = "logo" />
        <p>{!data ? "Loading..." : data} </p>
      </header>


    </div>
  );

}*/

function App() {
  const [data, setData] = React.useState(null);

    return (
      <div className="wrapper">
        <Router>
          <Route path='/' component={Main} />
          <Sidebar />
        </Router>

      </div>

    )

}


export default App;
