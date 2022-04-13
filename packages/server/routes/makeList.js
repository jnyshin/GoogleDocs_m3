//import express from "express";
//const { getTen } = require("./collection");
import { getTen } from "./collection.js";
// import cors from "cors";

// app.use(cors());

const docs = getTen();
console.log(docs);
let list = document.getElementById("demo");

docs.forEach((item) => {
  let li = document.createElement("li");
  li.innerText = item;
  list.appendChild(li);
});
