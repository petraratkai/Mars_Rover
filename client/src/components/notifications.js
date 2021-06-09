import React, { Component } from 'react';

class Notifications extends React.Component {
  render () {
    return (
      <div className = "not-wrapper">
      <button style={{float: "right"}}>
        clear
      </button>
      <ul className = "notifications">
        <li>
          hello
        </li>
        <li>
          how are you
        </li>
        <li>
          :)
        </li>
        <li>
          hello
        </li>
        <li>
          how are you
        </li>
        <li>
          :)
        </li>
        <li>
          hello
        </li>
        <li>
          how are you
        </li>
        <li>
          :)
        </li>
      </ul>
      </div>
    );
  }
}

export default Notifications;
