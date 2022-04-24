import React, { useCallback, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

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
let version = 0;
const Test = (props) => {
  const params = useParams();
  const [quill, setQuill] = useState();
  const [id, setId] = useState();
  const [docId, setDocId] = useState();
  const [listening, setListening] = useState(false);
  // const currUsername = useStore();

  const [ack, setAck] = useState();
  useEffect(() => {
    setId(uuidv4());
    setDocId(params.docId);
  }, []);

  const quillRef = useCallback((wrapper) => {
    if (!wrapper) return;
    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, {
      modules: {
        toolbar: TOOLBAR,
      },
      formats: FORMAT,
      theme: "snow",
    });

    q.setText("loading..");
    q.setContents([
      { insert: "0-0-0\n\n1-1-1\n\n2-2-2\n\n3-3-3\n\n__4-4\n\n5-5-5" },
      { delete: 132996965 },
      { retain: 1 },
      { insert: "\n6-6-6\n\n_" },
      { retain: 1 },
      {
        insert:
          "7-7\n\n8-8-8\n\n9-9-9\n\n0-0-0\n\n1-1-1\n\n2-2-2\n\n_-3-3\n_4-4-4\n",
      },
      { delete: 1 },
      { retain: 1 },
      { insert: "5-5-5\n\n6-6-6\n\n7-7-7\n\n_-8-8\n\n_" },
      { delete: 1 },
      { retain: 1 },
      { insert: "9-9\n\n0-0-0" },
      { delete: 1 },
      { retain: 1 },
      {
        insert:
          "\n1-1-1\n\n2-2-2\n\n3-3-3\n\n4-4-4\n\n5-5-5\n\n6-6-6\n\n7-7-7\n\n8-8-8\n\n9-9-9\n\n",
      },
    ]);
    setQuill(q);
  }, []);
  const handleTest = () => {
    console.log(version);
  };

  return (
    <div className="App">
      <button onClick={handleTest}>Test</button>
      <div ref={quillRef} style={{ height: "1000px" }}></div>
    </div>
  );
};

export default Test;
