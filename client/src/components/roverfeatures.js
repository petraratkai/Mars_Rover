import React from 'react';

export default class Roverfeatures extends React.Component {
  render() {
    return (
      <ul className ="p3">
        <li> Build a map of surroundings and store this information </li>
        <li> Be sent to pre-set co-ordinates through the use of the map or (x,y) value </li>
        <li> Track movement of rover on the map </li>
        <li> Show obstacles on the map  </li>
        <li> Find an optimal path from point A and B </li>
        <li> Quick reaction to disturbance</li>
        <li> Evaluate when to stop the motors if there is an obstruction and thus conserve power</li>
        <li> Send battery status to server</li>
      </ul>

    )
  }
}
