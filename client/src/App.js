//template source from: https://antonyorenge.com/simple-dashboard-in-react/
//last date accessed: 23/05/2021
//not modified
import React, { Component } from "react";
import './App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Main from './components/Main'


function App() {
  const [data, setData] = React.useState(null);

    return (
      <div className="wrapper">
        <Router>
          <Sidebar />
          <Route path='/' component={Main} />
        </Router>

      </div>

    )

}


export default App;
