var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var server = require("http").createServer(app);
const { v4: uuidv4 } = require("uuid");
var cors = require("cors");
const axios = require("axios");
const moment = require("moment");

const solarEdgeApiKey = "P5MEFLB5Z66IQT4YHE0B96FQ5DLUMIHJ";
const frounierAccessKeyId = "FKIAA3AF393D96BC4D69B1436F363E0780EF";
const frounierAccessKeyValue = "e2cbb0b5-9dd4-4f67-b70c-e29318aa1240";

app.use(
  bodyParser.json({
    limit: "1mb",
    extended: true,
  })
);

app.set("port", process.env.PORT || 5000);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// 2409852
// 1d79cf00-f427-49e5-ac0c-f01a392997a0
// db6a0414-34cb-474f-b177-1e31e21ced75


app.get("/solaredge-enery-production2", async (req, res) => {
  await axios
    .get(
      `http://monitoringapi.solaredge.com/site/${req.query.siteId}/energy?api_key=${solarEdgeApiKey}&timeUnit=DAY&endDate=${req.query.endDate}&startDate=${req.query.startDate}`
    )
    .then(function (resp) {
      var array = resp.data.energy.values;
      res.send({ provider: "Solaredge", data: array });
    })
    .catch(function (err) {
      console.log(err);
    });
});

app.get("/frounier-enery-production2", async (req, res) => {
  await axios
    .get(
      `https://api.solarweb.com/swqapi/pvsystems/${req.query.pvSystemId}/devices/${req.query.deviceId}/aggrdata?from=${req.query.startDate}&to=${req.query.endDate}`,
      {
        headers: {
          accessKeyID: frounierAccessKeyId,
          accessKeyValue: frounierAccessKeyValue,
        },
      }
    )
    .then(function (resp) {
      var array = resp.data.data;
      var newDataPoints = [];
      for (var i = 0; i < array.length; i++) {
        newDataPoints.push({
          x: new Date(array[i].logDateTime),
          y: array[i].channels[2].value,
        });
      }
      res.send({ provider: "Fronius", data: array });
    })
    .catch(function (err) {
      console.log(err);
    });
});

// app.get("/solaredge-enery-timeFrame", async (req, res) => {
//   await axios
//     .get(
//       `http://monitoringapi.solaredge.com/site/2409852/timeFrameEnergy?api_key=P5MEFLB5Z66IQT4YHE0B96FQ5DLUMIHJ&timeUnit=DAY&endDate=2022-04-14&startDate=2022-01-10`
//     )
//     .then(function (resp) {
//       var array = resp.data.timeFrameEnergy.energy;
//       res.send(array);
//     })
//     .catch(function (err) {
//       console.log(err);
//     });
// });

server.listen(app.get("port"), function () {
  console.log("Node app is running at localhost:" + app.get("port"));
});
