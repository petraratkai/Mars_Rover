/*
file taken from https://www.digitalocean.com/community/tutorials/how-to-add-login-authentication-to-react-applications
last date accessed: 14/06/2021
not modified
*/
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

async function loginUser(credentials) {
 return     axios.post(
   'http://' + window.location.hostname + ':8000/login', credentials
 ).then(response => {
     //alert(response);
      if(response)
        return response;
   });
}

export default function Login ({ setToken }) {
  const [password, setPassword] = useState();

  const handleSubmit = async e => {
   e.preventDefault();
   const token = await loginUser({password:
     password
   });
   //alert(JSON.stringify(token));
   if(token.data.token)
    setToken(token.data);
 }
    return (
      <div className = "login">
        <h1>Please log in</h1>
        <form onSubmit={handleSubmit}>
          <label>
            <p className = "clearmap">Password:</p>
            <input  type="password" onChange={e => setPassword(e.target.value)}đ/>
          </label>
          <div>
            <button className = "clearmap b4" type="submit">Submit</button>
          </div>
        </form>
      </div>
    )

}

Login.propTypes = {
  setToken: PropTypes.func.isRequired
}
