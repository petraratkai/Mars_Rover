import React, { Component } from 'react';
import axios from 'axios';

class Notifications extends React.Component {
  constructor(props) {
    super(props);
    this.state = { messages: [] };
  }
  componentDidMount() {
    this.interval = setInterval(()=> {
      axios.get('http://' + window.location.hostname + ':8000/notifications')
        .then(res => {
          //alert(this.rover.current);
           this.setState({messages: res.data});
        })
        .catch(err => {
          console.log(err);
        })
    }, 500);
  }
  renderNotifications() {
    return !this.state.messages ? null : this.state.messages.map((notif) => {
      return (
        <li>
          notif
        </li>
      );
    });
  }
  render () {
    return (
      <div className = "not-wrapper">
      <div>
        {this.renderNotifications()}
      </div>
      <button className = "clearmap">
        clear
      </button>
      </div>
    );
  }
}

export default Notifications;
