import React, { useCallback, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import API from "./api";
import DOMAIN_NAME from "./store";
import { useParams } from "react-router-dom";
import QuillCursors from "quill-cursors";
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
const Editor = (props) => {
  const params = useParams();
  const [quill, setQuill] = useState();
  const [id, setId] = useState();
  const [docId, setDocId] = useState();
  const [listening, setListening] = useState(false);
  const [cursor, setCursor] = useState();
  const [username, setUsername] = useState();

  Quill.register("modules/cursors", QuillCursors);

  const [ack, setAck] = useState();
  useEffect(() => {
    setId(params.id);
    setDocId(params.docId);
  }, []);

  useEffect(() => {
    if (quill && !listening) {
      const evtSource = new EventSource(
        `http://${DOMAIN_NAME}/doc/connect/${docId}/${id}`
      );
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
          version = dataFromServer.version;
          quill.enable();
        } else if (dataFromServer.ack) {
          setAck(dataFromServer.ack);
        } else {
          quill.updateContents(dataFromServer[0]);
          version += 1;
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
    const update = async (delta, oldDelta, source) => {
      if (source === "user") {
        const data = {
          version: version,
          op: [delta],
        };
        const response = await API.post(`/doc/op/${docId}/${id}`, data);
        if (response.data.status === "retry") {
          //do something
          console.log("RETRY!!!!!!!!!");
        }
        version += 1;
      }
    };
    quill.on("text-change", update);
  }, [quill]);

  useEffect(() => {
    if (!quill) return;
    if (cursor) {
      cursor.createCursor("cursor", "user1", "blue");
      function debounce(func, wait) {
        let timeout;
        return function (...args) {
          const context = this;
          const later = function () {
            timeout = null;
            func.apply(context, args);
          };
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
        };
      }
      function selectionChangeHandler(cursors) {
        const debouncedUpdate = debounce(updateCursor, 500);
        return function (range, oldRange, source) {
          if (source === "user") {
            updateCursor(range);
          } else {
            debouncedUpdate(range);
          }
        };
        function updateCursor(range) {
          setTimeout(() => cursors.moveCursor("cursor", range), 10);
        }
      }
      quill.on("selection-change", selectionChangeHandler(cursor));
    }
  }, [quill]);

  const quillRef = useCallback((wrapper) => {
    if (!wrapper) return;
    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, {
      modules: {
        toolbar: TOOLBAR,
        cursors: {
          hideDelayMs: 5000,
          hideSpeedMs: 0,
          selectionChangeSource: null,
          transformOnTextChange: true,
        },
      },
      formats: FORMAT,
      theme: "snow",
    });
    setCursor(q.getModule("cursors"));
    q.disable();
    q.setText("loading..");
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

export default Editor;
