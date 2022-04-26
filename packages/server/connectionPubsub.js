import IORedis from "ioredis";
import { connection } from "./app.js";
import logging from "./logging.js";
import { fetchDoc } from "./store.js";
const startPubsub = () => {
  const connectionSub = new IORedis();
  connectionSub.subscribe(connection.id, (err, count) => {
    if (err) {
      logging.error(`Failed to subscribe to connection ${connection.id}`);
    } else {
      logging.info(
        `Subscribed successfully! This client is currently subscribed ${connection.id}`
      );
    }
  });
  connectionSub.on("message", async (channel, message) => {
    const { docId, preventCompose } = JSON.parse(message);
    const document = await fetchDoc(docId);
    document.preventCompose = preventCompose;
  });
};
export default startPubsub;
