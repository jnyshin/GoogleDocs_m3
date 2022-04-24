import { Client } from "@elastic/elasticsearch";
const ESclient = new Client({
  node: "http://localhost:9200",
}); //More configuration will be added after ES Cloud set up
