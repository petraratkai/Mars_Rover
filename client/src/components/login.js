import React, {useState} from 'react';

async function loginUser(credentials) {
 return fetch('http://localhost:8000/login', {
   method: 'POST',
   headers: {
     'Content-Type': 'application/json'
   },
   body: JSON.stringify(credentials)
 })
   .then(data => data.json())
}

export default function Login ({ setToken }) {
  const [password, setPassword] = useState();
  const handleSubmit = async e => {
   e.preventDefault();
   const token = await loginUser(
     password
   );
   setToken(token);
 }
    return (
      <div className = "login">
        <h1>Please log in</h1>
        <form onSubmit={handleSubmit}>
          <label>
            <p>Password</p>
            <input type="password" onChange={e => setPassword(e.target.value)}đ/>
          </label>
          <div>
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
    )
  
}

Login.propTypes = {
  setToken: PropTypes.func.isRequired
}
