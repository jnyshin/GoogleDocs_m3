import express from "express";
import Docs from "../schema/docs";

const router = express.Router();

// router.get("/", (req, res) =>{
//     res.sendFile("")
// })
// - 10 most recently modified files, with editor links
// - delete button next to each doc
// - logout button

router.get("/", async (req, res) => {
  console.log("home router reached");
  const docs = await Docs.find().sort({ updatedAt: -1 }).limit(10);
  const ret = [];
  for (const doc of docs) {
    const ele = {
      id: doc.id,
      name: doc.name,
    };
    ret.push(ele);
  }
  //console.log(ret);
  res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
  res.write(`
    <div>
    check script
    <p id="demo"></p>

    <script>
    const fruits = ["Banana", "Orange", "Apple", "Mango"];
    const docs = [${ret}]
    let fLen = docs.length;
    
    let text = "<ul>";
    for (let i = 0; i < fLen; i++) {
      text += "<li>" + "check" + "</li>";
    }
    text += "</ul>";
    
    document.getElementById("demo").innerHTML = text;
    </script>
    </div>
    `);
});

export default router;
// ret.forEach((item) => {
//     let li = document.createElement("li");
//     li.innerText = item;
//     list.appendChild(li);
//   });

//<p id='myList'></p>
{
  /* <script>
let doc = ${ret}
let text = "<ol>"
doc.forEach(text += "<li>" + doc.name + "</li>")
text += "</ol>";
document.getElementById("myList").innerHTML = text;
</script> */
}
