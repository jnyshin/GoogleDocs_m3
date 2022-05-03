import logging from "../logging.js";

export default async (fastify, opts) => {
  fastify.get("/", async (req, res) => {
    res.header("X-CSE356", "61f9f57373ba724f297db6ba");
    return res.sendFile(
      process.env.NODE_ENV === "production"
        ? "/var/www/html/index.html"
        : "index.html"
    );
  });
};
