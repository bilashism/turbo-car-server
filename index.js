const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");

dotenv.config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

const server = app.listen(port, () => console.log(`Running on: ${port}`));

app.get("/", (req, res) => {
  res.sendStatus(200);
});
