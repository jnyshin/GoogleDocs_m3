import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import API from "./api";
import DocsList from "./DocsList";

const Home = () => {
  const history = useHistory();

  const handleLogout = async () => {
    await API.post("/users/logout");
    history.push("/users/login");
  };

  const handleDeleteAll = async () => {
    API.post("/deleteAll");
  };
  return (
    <>
      <div className="list">
        <DocsList />
      </div>
      <button onClick={() => handleLogout()}>Logout</button>
      <button onClick={() => handleDeleteAll()}>Delete All Be careful!</button>
    </>
  );
};

export default Home;
