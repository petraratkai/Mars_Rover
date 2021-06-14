import React, { Component } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import { Switch, Route, Redirect } from 'react-router-dom'
import Dashboard from './Dashboard'
import Other from './Other'
import Home from './homepage.js'

class Main extends Component {
  render() {
    return (
      <div className="main-panel">
        <Navbar />
        <Switch>
          <Route path = "/home" component = {Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/profile" component={Other} />
          <Redirect from='*' to='/home' />
        </Switch>

      </div>
    )
  }
}


export default Main;
