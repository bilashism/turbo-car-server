const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@cluster0.3ackybm.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1
});

const run = async () => {
  try {
    const serviceCollection = client.db("turboCar").collection("services");

    // get all services
    app.get("/services", async (req, res) => {
      const query = {};
      const options = {};

      const cursor = serviceCollection.find(query, options);

      const services = await cursor.toArray();

      res.send(services);
    });

    // get single service
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: ObjectId(id) };
      const options = {};

      const service = await serviceCollection.findOne(query, options);

      res.send(service);
    });
  } catch (error) {
    console.error(error);
  } finally {
  }
};

run().catch(err => console.error(err));

// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

app.listen(port, () => console.log(`Running on: ${port}`));

app.get("/", (req, res) => {
  res.sendStatus(200);
});
