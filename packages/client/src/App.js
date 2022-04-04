import React, { useCallback, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import API from "./api";
import DOMAIN_NAME from "./store";
import { useParams } from "react-router-dom";
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
function App(props) {
  const params = useParams();
  const [quill, setQuill] = useState();
  const [id, setId] = useState();
  const [title, setTitle] = useState("");
  const [listening, setListening] = useState(false);
  useEffect(() => {
    console.log(props.id);
    if (!props.id) {
      setId(params.id);
    } else {
      setId(props.id);
    }
  }, []);
  useEffect(() => {
    if (quill && !listening) {
      const evtSource = new EventSource(`http://${DOMAIN_NAME}/connect/${id}`);
      evtSource.onopen = function () {
        console.log("connection establised");
        setListening(true);
      };

      evtSource.onmessage = function (event) {
        console.log("message from server event push");
        const dataFromServer = JSON.parse(event.data);

        console.log("message from server event push (event.data): ");
        console.log(dataFromServer);
        if (dataFromServer.content) {
          quill.setContents(dataFromServer.content);
          quill.enable();
        } else {
          quill.setContents(dataFromServer[0]);
        }
      };
      evtSource.onerror = function (event) {
        console.log("Error occured");
      };
    }
  }, [quill]);

  // update
  useEffect(() => {
    if (!quill) return;
    const update = (delta, oldDelta, source) => {
      if (source === "user") {
        API.post(`op/${id}`, [delta]);
      }
    };
    quill.on("text-change", update);
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

  const handleTest = async () => {
    console.log("triggered");
    console.log(
      quill.setContents([
        {
          attributes: { bold: true },
          insert: "57fdf96c-8dac-4694-8ddd-d081181728ab",
        },
        { insert: "\n" },
        { delete: 6999936 },
      ])
    );
  };
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
          <button onClick={handleTest}>Test</button>
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
