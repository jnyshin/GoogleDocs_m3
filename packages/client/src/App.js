import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import API from "./api";
function App() {
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState();

  const params = useParams();
  useEffect(() => {
    setLoading(true);
    const socket = io("http://localhost:8000");
    setSocket(socket);

    const getData = async () => {
      const response = await API.get(`connect/${params.id}`);
      const { data } = response;
      setBody(data);
      setLoading(false);
    };
    getData();
  }, []);

  const handleBody = (e) => {
    setBody(e);
  };

  function onTitleChange(e) {
    setTitle(e.target.value);
  }

  if (loading) {
    return <div className="loading">Loading</div>;
  }

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
      <ReactQuill
        placeholder="Start writing..."
        modules={App.modules}
        formats={App.formats}
        onChange={handleBody}
        style={{ height: "80vh" }}
        value={body}
      />
    </div>
  );
}

App.modules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { header: [3, 4, 5, 6] }, { font: [] }],
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
