import Docs from "schema/docs";
import cors from "cors";
import express from "express";
const app = express();
app.use(cors());

const docs = await Docs.find().sort({ updatedAt: -1 }).limit(10);
const ret = [];
for (const doc of docs) {
  const ele = {
    id: doc.id,
    name: doc.name,
  };
  ret.push(ele);
}
console.log(ret);
let list = document.getElementById("myList");

ret.forEach((item) => {
  let li = document.createElement("li");
  li.innerText = item;
  list.appendChild(li);
});
