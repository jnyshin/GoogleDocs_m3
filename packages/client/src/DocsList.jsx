import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "./api";
import { v4 as uuidV4 } from "uuid";

const DocsList = () => {
  const [docs, setDocs] = useState([{ _id: 1 }, { _id: 2 }]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const getDocuments = async () => {
      const docs = await API.get("/showlist");
      setDocs(docs.data);

      setLoading(false);
    };
    setLoading(true);
    getDocuments();
  }, []);
  const handleAddDocs = async () => {
    const documents = await API.post("/addDoc");
    setDocs(documents.data);
  };
  if (loading) {
    return <div>Loading..</div>;
  }

  return (
    <>
      <button onClick={handleAddDocs}>Add Docs</button>
      <div className="list">
        {docs.map((doc, i) => (
          <Link to={`/showdoc/${doc._id}/${uuidV4()}`} key={i} className="doc">
            {doc._id}
          </Link>
        ))}
      </div>
    </>
  );
};
export default DocsList;
