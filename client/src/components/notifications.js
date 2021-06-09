import React, { Component } from 'react';

class Notifications extends React.Component {
  render () {
    return (
      <div className = "not-wrapper">
      <div>
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
      <button className = "clearmap">
        clear
      </button>
      </div>
    );
  }
}

export default Notifications;
