import React, { useState } from "react"
import ReactQuill from "react-quill"
import "../node_modules/react-quill/dist/quill.snow.css"
import './App.css';

function App() {
  const [body, setBody ] = useState("");
  const [title, setTitle ] = useState("");

  const handleBody = e => {
    setBody(e);
  }

  function onTitleChange(e){
    setTitle(e.target.value)
  }

  return (
    <div className="App">
      <div className="header">
        <img src={require("./docs.png")} alt="homepage" width="40px"/>
        <div className="header-options">
          <input type="text" onChange={onTitleChange} placeHolder="Untitled"/>
          <div className="header-btns">
            <a href="/">File</a>
            <a href="/">Edit</a>
            <a href="/">View</a>
            <a href="/">Help</a>
          </div>
        </div>
        
      </div>
      <ReactQuill
        placeholder="Start writing..."
        modules={App.modules}
        formats={App.formats}
        onChange={handleBody}
        value={body}
      />
    </div>
  );
}

App.modules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { header: [3, 4, 5, 6]}, { font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image", "video"],
    ["clean"],
    ["code-block"],
  ],
};

App.formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "image",
  "video",
  "code-block",
];

export default App;
