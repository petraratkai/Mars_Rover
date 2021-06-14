import React, { Component } from 'react'
import Roverfeatures from './roverfeatures.js'

class Home extends Component {
  render() {
    return (
      <div className = "content">
        <div className = "container-fluid">
          <div className = "row">
            <div className="col-md-12">
            <div className = "card" >
              <div className = "card-header">
                <h4 className="card-title">About us</h4>
              </div>
              <div className = "card-body p3">
              We are a group of EEE and EIE students at Imperial College London and our summer project was to
              build a Mars Rover that can identify obstacles and can be controlled remotely. This website is the user interface of the rover.
              Our goal was to develop a rover that is efficient and to create an interface that makes sure that the user has an
              amazing experience controlling the rover.

              </div>
            </div>
            </div>
          </div>
          <div className = "row">
            <div className="col-md-12">

            </div>
          </div>
          <div className = "row">
            <div className = "col-md-6">
              <div className = "card" >
                <div className = "card-header">
                  <h4 className="card-title ">The team</h4>
                </div>
                <div className = "card-body">
                  img
                </div>
              </div>
            </div>
            <div className = "col-md-6">
            <div className = "card" >
              <div className = "card-header">
                <h4 className="card-title">Rover features</h4>
              </div>
              <div className = "card-body">
                <Roverfeatures/>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
  )
  }
}

export default Home;
