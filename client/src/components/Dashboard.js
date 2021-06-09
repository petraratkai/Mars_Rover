import React, { Component } from 'react';
import Map from "./Map.js";
import Pointinput from "./PointInput.js";
import Clearmap from "./clearmap.js"
import Notifications from "./notifications.js"

class Dashboard extends Component {
  constructor(props){
        super(props);
        this.state = {
            coords: {
              x:0,
              y:0
            }
        }
    }
  handleCallback = (coordinates) => {
    //pointinput state
    //alert(JSON.stringify(coordinates));
    this.setState({coords: coordinates});
  }
  render() {
    return (
      <div className="content" >
        <div className="container-fluid">
          <div className="row" style={{height: "100%"}}>

            <div className="col-md-6" style={{height: "100%"}}>
              <div className="card " >
                <div className="card-header ">
                  <h4 className="card-title">Map</h4>
                  <p className="card-category">Obstacles and rover position</p>
                </div>
                <div className="card-body ">
                  <div className="legend">
                  <div className = "board">
                    <Map parentCallback = {this.handleCallback} style={{height: "100%"}} />
                  </div>
                  <div className = "card-footer">
                  <hr />
                  <div className ="stats">
                      <i className="fa fa-clock-o"></i>
                  </div>
                  </div>
                </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className = "row">
                <div className="card">
                  <div className="card-header ">
                    <h4 className="card-title">Commands</h4>
                    <p className="card-category">Input commands to control the rover</p>
                  </div>
                  <div className="card-body ">
                    <Pointinput coords = {this.state.coords}/>
                  </div>
                  <div>
                    <Clearmap/>
                  </div>
                  <div className="card-footer ">
                    <hr />
                    <div className="stats">
                      <i className="fa fa-history"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className = "row">
                <div className="card">
                  <div className="card-header ">
                    <h4 className="card-title">Notifications</h4>
                    <p className="card-category">messages from the control module</p>
                  </div>
                  <div className="card-body " style={{height: "80%"}}>
                    <Notifications/>
                  </div>
                  <div className="card-footer ">
                    <hr />
                    <div className="stats">
                      <i className="fa fa-history"></i>
                      </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    )
  }
}

export default Dashboard;
