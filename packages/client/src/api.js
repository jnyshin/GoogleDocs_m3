import axios from "axios";
import { DOMAIN_NAME } from "./store";
export default axios.create({
  baseURL: `//${DOMAIN_NAME}`,
});
