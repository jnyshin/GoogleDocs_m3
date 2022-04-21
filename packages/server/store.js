import path from "path";
import { fileURLToPath } from "url";
export const clients = [];
export const DOMAIN_NAME =
  process.env.NODE_ENV === "production" ? "209.151.154.140" : "localhost:8000";
export const ERROR_MESSAGE = (message) => {
  return { error: true, message: message };
};
const __filename = fileURLToPath(import.meta.url);
// 👇️ "/home/john/Desktop/javascript"
export const __dirname = path.dirname(__filename);
export const currEditDoc = [];
