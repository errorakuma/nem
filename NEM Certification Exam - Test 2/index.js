const { mongoose } = require("./database/db");
const express = require("express");
const app = express();

const bodyParser = require("body-parser");

const gameseller = require("./routers/gamerseller.router");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(gameseller);

app.listen(process.env.PORT, () => {
  console.log(`server is on ${process.env.PORT}`);
});
