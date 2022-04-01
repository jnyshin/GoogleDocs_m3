import React, { useCallback, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import API from "./api";
const TOOLBAR = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ size: [] }],
  ["bold", "italic", "underline", "strike", "blockquote"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link", "image", "video"],
  ["clean"],
  ["code-block"],
];

const FORMAT = [
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
function App({ id }) {
  const [quill, setQuill] = useState();
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!quill) return;
    const startConnection = async () => {
      const evtSource = new EventSource(`http://localhost:8000/connect/${id}`, {
        withCredentials: true,
      });
      evtSource.onopen = function () {
        console.log("connection establised");
      };
      evtSource.onmessage = function (event) {
        quill.setContents(JSON.parse(event.data));
      };
    };
    startConnection();
    quill.enable();
  }, [quill]);

  // update
  useEffect(() => {
    if (!quill) return;
    const handler = (delta, content, source) => {};
    quill.on("text-change", handler);
  }, [quill]);

  function onTitleChange(e) {
    setTitle(e.target.value);
  }

  const quillRef = useCallback((wrapper) => {
    if (!wrapper) return;
    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, {
      modules: { toolbar: TOOLBAR },
      formats: FORMAT,
      theme: "snow",
    });
    q.disable();
    q.setText("loading..");
    setQuill(q);
  }, []);

  return (
    <div className="App">
      <div className="header">
        <img src={require("./docs.png")} alt="homepage" width="40px" />
        <div className="header-options">
          <input
            type="text"
            onChange={onTitleChange}
            placeholder="Untitled"
            disabled
          />
          <div className="header-btns">
            <a href="/">File</a>
            <a href="/">Edit</a>
            <a href="/">View</a>
            <a href="/">Help</a>
          </div>
        </div>
      </div>
      <div ref={quillRef} style={{ height: "1000px" }}></div>
    </div>
  );
}

export default App;
