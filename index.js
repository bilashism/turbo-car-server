const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  const token = authHeader.split(" ").pop();
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@cluster0.3ackybm.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1
});

const run = async () => {
  try {
    const serviceCollection = client.db("turboCar").collection("services");
    const orderCollection = client.db("turboCar").collection("orders");

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "10h"
      });
      res.send({ token });
    });

    // get all services
    app.get("/services", async (req, res) => {
      const search = req?.query?.search;
      console.log(search);
      const query = {};
      if (search.trim()) {
        query.$text = {
          $search: search
        };
      }
      const options = {};
      const order = req?.query?.order === "asc" ? -1 : 1;
      const cursor = serviceCollection
        .find(query, options)
        .sort({ price: order });

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

    // get all orders
    app.get("/orders", verifyToken, async (req, res) => {
      const decoded = req.decoded;
      console.log(decoded);
      let query;

      if (req.query.email) {
        query = {
          email: req.query.email
        };
      }

      const options = {};

      const cursor = orderCollection.find(query, options);

      const orders = await cursor.toArray();

      res.send(orders);
    });

    // create an order
    app.post("/orders", verifyToken, async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });
    // patch an order
    app.put("/orders/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const status = req.body.status;
      const query = { _id: ObjectId(id) };

      // create a document that sets the plot of the movie
      const updateDoc = {
        $set: {
          status: status
        }
      };

      const result = await orderCollection.updateOne(query, updateDoc);
      console.log(result);
      res.send(result);
    });
    // delete an order
    app.delete("/orders/:id", verifyToken, async (req, res) => {
      const id = req.params.id;

      const query = { _id: ObjectId(id) };
      const options = {};

      const result = await orderCollection.deleteOne(query, options);

      res.send(result);
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
