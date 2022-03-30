import React, { useState } from "react"
import ReactQuill from "react-quill"
import "../node_modules/react-quill/dist/quill.snow.css"
import './App.css';

function App() {
  const [body, setBody ] = useState("");

  const handleBody = e => {
    setBody(e);
  }

  return (
    <div className="App">
      <h2>Text Editor</h2>
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
