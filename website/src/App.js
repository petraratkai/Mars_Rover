import React, { Component } from 'react'
import NavBar from './navbar.js'
import Menu from './menu.js'
import { Switch, Route, Redirect } from 'react-router-dom'
import { BrowserRouter as Router} from 'react-router-dom'
import Home from './home.js'
import Other from './other.js'

class App extends Component {
  render() {
    return (
      <div>
        <Router>
          <div>
          <NavBar />
          <Menu />
          <Switch>
            <Route path='/home' component={Home} />
            <Route path='/aboutus' component={Other} />
            <Redirect from='*' to='/home' />
          </Switch>
          </div>
        </Router>
      </div>

    )
  }
}
export default App
