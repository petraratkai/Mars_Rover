import React from 'react';

export default class TeamMembers extends React.Component{
  render() {
    return(
      <div className ="p3">
      <p className ="p3">This rover was designed to be sent to Mars in order to explore and build maps of the Mars terrain. In order to do this, the Rover system must include six submodules; command to remotely control the rover, control to communicate between submodules, drive to build a suitable and robust driving system, vision to spot obstacles that may harm the rover, energy  to power the exploration of the rover and integration to connect every module together.
Although submodules are easily intertwined, each submodule was led by one student. </p>
    <ul>
      <li>Control: David Cormier</li>
      <li> Drive: Miles Grist</li>
      <li> Vision: Thomas Loureio van Issum</li>
      <li> Energy: Jeamima Khan</li>
      <li> Integration: Bernard Benz</li>
      <li>Command: Petra Ratkai </li>
    </ul>
  </div>

);
  }
}
