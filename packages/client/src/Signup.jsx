import React, { useState } from "react";
import API from "./api";

const Signup = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = {
      name: name,
      password: password,
      email: email,
    };
    const newUser = await API.post("/users/signup", body);
    if (newUser.data.error) {
      console.log(newUser.data.message);
    }
    console.log(newUser);
  };

  return (
    <div className="wrapper">
      <div className="container">
        <form method="post" action="/users/signup" onSubmit={handleSubmit}>
          <label htmlFor="name">name:</label>
          <input
            type="text"
            id="username"
            name="username"
            onChange={(e) => setName(e.target.value)}
          />
          <label htmlFor="password">Password:</label>
          <input
            type="text"
            id="password"
            name="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <label htmlFor="email">Email</label>
          <input
            type="text"
            id="email"
            name="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input type="submit" value="Submit" />
        </form>
      </div>
    </div>
  );
};
export default Signup;
