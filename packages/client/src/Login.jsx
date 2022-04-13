import React, { useEffect, useState } from "react";
import API from "./api";
import { useHistory } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = {
      email: email,
      password: password,
    };
    localStorage.setItem("email", email);
    const user = await API.post("/users/login", body);
    if (user.data.error) {
      console.log(user.data.message);
    }
    if (user.data.status === "OK") {
      history.push("/collection/list");
    }
  };

  return (
    <div className="wrapper">
      <div className="container">
        <form method="post" action="/users/login" onSubmit={handleSubmit}>
          <label htmlFor="email">email:</label>
          <input
            type="text"
            id="email"
            name="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="password">Password:</label>
          <input
            type="text"
            id="password"
            name="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
        <form method="post" action="/users/logout">
          <button type="submit">LOGOUT</button>
        </form>
      </div>
    </div>
  );
};
export default Login;
