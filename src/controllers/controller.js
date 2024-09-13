import { MongoClient, ServerApiVersion } from "mongodb";

const uri =
  "mongodb+srv://lauravalentc:rambo2118@rooms.lzscw.mongodb.net/?retryWrites=true&w=majority&appName=ROOMS";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export default client;
