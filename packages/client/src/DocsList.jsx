import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "./api";
import { v4 as uuidV4 } from "uuid";

const DocsList = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  useEffect(() => {
    const getDocuments = async () => {
      const docs = await API.get("/collection/list");
      console.log(docs.data);
      setDocs(docs.data);
      setLoading(false);
    };
    setLoading(true);
    getDocuments();
  }, []);
  const handleAddDocs = async () => {
    const data = {
      name: name,
    };
    const newDoc = await API.post("/collection/create", data);

    if (newDoc.data.error) {
      console.log(newDoc.data.message);
    } else {
      setDocs([{ id: newDoc.data.docid, name: data.name }, ...docs]);
    }
  };

  const handleDelete = async (id) => {
    const data = { docid: id };
    await API.post("/collection/delete", data);
    setDocs(docs.filter((doc) => doc.id !== id));
  };
  if (loading) {
    return <div>Loading..</div>;
  }

  return (
    <>
      <input onChange={(e) => setName(e.target.value)}></input>
      <button onClick={handleAddDocs}>Add Docs</button>
      <div className="list">
        {docs.map((doc, i) => (
          <Link
            to={`/doc/edit/${doc.id}`}
            key={i}
            className="doc"
            onContextMenu={(e) => {
              e.preventDefault();
              handleDelete(doc.id);
            }}
          >
            {doc.name}
          </Link>
        ))}
      </div>
    </>
  );
};
export default DocsList;
