import React, { Component } from 'react';
import axios from 'axios';

class Notifications extends React.Component {
  constructor(props) {
    super(props);
    this.state = { messages: [] };
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    axios.get('http://' + window.location.hostname + ':8000/clearnotif')
      .then(res => {
        //alert(this.rover.current);
        this.setState({messages: res.data});
      })
      .catch(err => {
        console.log(err);
      })
    //alert('clearing notifi');
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
          {notif}
        </li>
      );
    });
  }
  render () {
    return (
      <div className = "not-wrapper">
      <ul className = "notifications">
        {this.renderNotifications()}
      </ul>
      <button className = "clearmap" onClick={this.handleClick}>
        clear
      </button>
      </div>
    );
  }
}

export default Notifications;
