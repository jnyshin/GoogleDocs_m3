import path from "path";
import { fileURLToPath } from "url";
export const clients = [];
export const DOMAIN_NAME = "localhost:8000";
// export const DOMAIN_NAME = '209.94.56.95'
export const ERROR_MESSAGE = (message) => {
  return { error: true, message: message };
};

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
export const __dirname = path.dirname(__filename);
