const DOMAIN_NAME =
  process.env.NODE_ENV === "production"
    ? "icloud.cse356.compas.cs.stonybrook.edu"
    : "localhost:8000";
export default DOMAIN_NAME;
