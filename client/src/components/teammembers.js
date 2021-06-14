import React from 'react';

export default class TeamMembers extends React.Component{
  render() {
    return(
      <div className ="p3">
      <p className ="p3">In order to do build the Rover, the system must include six modules; command to remotely control the rover, control to communicate between modules, drive to build a suitable and robust driving system, vision to spot obstacles that may harm the rover, energy  to power the exploration of the rover and integration to connect every module together.
Although submodules are easily intertwined, each submodule was led by one student. </p>
    <ul>
      <li>Control: David Cormier</li>
      <li> Drive: Miles Grist</li>
      <li> Vision: Thomas Loureiro van Issum</li>
      <li> Energy: Jeamima Khan</li>
      <li> Integration: Bernard Benz</li>
      <li>Command: Petra Ratkai </li>
    </ul>
  </div>

);
  }
}
