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
  return (
    <>
      <div className="list">
        <DocsList />
      </div>
      <button onClick={() => handleLogout()}>Logout</button>
    </>
  );
};

export default Home;
