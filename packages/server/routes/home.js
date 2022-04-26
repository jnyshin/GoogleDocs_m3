import logging from "../logging.js";

export default async (fastify, opts) => {
  fastify.get("/", async (req, res) => {
    logging.info("[/home] Route");
    res.header("X-CSE356", "61f9f57373ba724f297db6ba");
    // return res.sendFile("index.html");
    return res.sendFile("/var/www/html/index.html");
  });
};
