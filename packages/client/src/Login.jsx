import React, { useState } from "react";
import API from "./api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = {
      email: email,
      password: password,
    };
    const user = await API.post("/users/login", body);
    if (user.data.error) {
      console.log(user.data.message);
    }
    console.log(user);
  };

  return (
    <div class="wrapper">
      <div class="container">
        <form method="post" action="/users/login" onSubmit={handleSubmit}>
          <lable for="email">email:</lable>
          <input
            type="text"
            id="email"
            name="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <lable for="password">Password:</lable>
          <input
            type="text"
            id="password"
            name="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <input type="submit" value="Login" />
        </form>
        <form method="post" action="/users/logout">
          <button type="submit">LOGOUT</button>
        </form>
      </div>
    </div>
  );
};
export default Login;
