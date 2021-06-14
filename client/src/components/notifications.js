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
    //var notcnt = 0;
    //var sum = 0;
    this.interval = setInterval(()=> {
      //var startTime = new Date();
      //var endTime;
      axios.get('http://' + window.location.hostname + ':8000/notifications')
        .then(res => {
          //alert(this.rover.current);
          /*endTime = new Date();
          notcnt += 1;
          sum += (endTime-startTime)/1000;
          if(notcnt == 1000) {
            axios.post('http://' + window.location.hostname + ':8000/test', 'notifications took on avg ' + sum/notcnt + 'ms');
          }*/
           this.setState({messages: res.data});
        })
        .catch(err => {
          console.log(err);
        })
    }, 300);
  }
  renderNotifications() {
    var i = 0;
    return !this.state.messages ? null : this.state.messages.map((notif) => {
      i+=1;
      return (
        <li key={i.toString()}>
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
      <button className = "clearmap b4" onClick={this.handleClick}>
        clear
      </button >
      </div>
    );
  }
}

export default Notifications;
