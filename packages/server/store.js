export const clients = [];
<<<<<<< Updated upstream
export const deltas = [];
export const DOCUMENT_ID = "ONE_DOC";
=======
export const cursors = {};
export const DOMAIN_NAME =
  process.env.NODE_ENV === "production" ? "209.151.154.140" : "localhost:8000";
export const ERROR_MESSAGE = (message) => {
  return { error: true, message: message };
};

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
export const __dirname = path.dirname(__filename);
>>>>>>> Stashed changes
