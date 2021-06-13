import React, { Component, useState } from 'react';
import Map from "./Map.js";
import Pointinput from "./PointInput.js";
import Clearmap from "./clearmap.js"
import Notifications from "./notifications.js"
import Battery from "./battery.js"

export default function Dashboard() {
  /*constructor(props){
        super(props);
        this.state = {
            coords: {
              x:0,
              y:0
            }
        }
    }*/
    const [coords, setCoords] = useState({x:0, y:0});
  function handleCallback(coordinates)  {
    //pointinput state
    //alert(JSON.stringify(coordinates));
    setCoords(coordinates);
  }

    return (
      <div className="content" >
        <div className="container-fluid">
          <div className="row">

            <div className="col-md-5" style={{height: "100%"}}>
              <div className="card " >
                <div className="card-header ">
                  <h4 className="card-title">Map</h4>
                  <p className="card-category">Obstacles and rover position</p>
                </div>
                <div className="card-body ">
                  <div className="legend">
                  <div className = "board">
                    <Map parentCallback = {handleCallback} style={{height: "100%"}} />
                  </div>

                </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className = "row" >
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header ">
                      <h4 className="card-title">Commands</h4>
                      <p className="card-category">Input commands to control the rover</p>
                      </div>
                      <div className="card-body ">
                        <Pointinput coords = {coords}/>
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
                <div className="col-md-4" >
                  <div className="card">
                    <div className="card-header ">
                      <h4 className="card-title">Battery</h4>
                      <p className="card-category">current state of battery:</p>
                      </div>
                      <div className="card-body ">
                        <Battery/>
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
              <div className = "row" style={{height:"40%"}}>
              <div className = "col-md-7">
                <div className="card">
                  <div className="card-header ">
                    <h4 className="card-title">Notifications</h4>
                    <p className="card-category">messages from the control module</p>
                  </div>
                  <div className="card-body ">
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
      </div>
    );

}

//export default Dashboard;
