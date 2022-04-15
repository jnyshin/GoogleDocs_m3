import React, { useCallback, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import API from "./api";
import DOMAIN_NAME from "./store";
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
const Editor = (props) => {
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
          version += 1;
        } else if (dataFromServer.presence) {
          const { index, length, name } = dataFromServer.presence.cursor;
          console.log(index, length, name);
        } else {
          console.log("OP");
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
      }
    };
    quill.on("text-change", update);
  }, [quill]);

  useEffect(() => {
    if (!quill) return;
    const selectionChangeHandler = async (range, oldRange, source) => {
      if (source === "user") {
        const presence = {
          index: range.index,
          length: range.length,
        };
        console.log(id);
        const response = await API.post(
          `/doc/presence/${docId}/${id}`,
          presence
        );
        console.log(response);
      }
    };
    quill.on("selection-change", selectionChangeHandler);
  }, [quill]);

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

    q.disable();
    q.setText("loading..");
    setQuill(q);
  }, []);
  const handleTest = () => {
    console.log(version);
  };

  return (
    <div className="App">
      <div ref={quillRef} style={{ height: "100%" }}></div>
    </div>
  );
};

export default Editor;
