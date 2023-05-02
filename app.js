const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const server = http.createServer(app);
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/term-of-service", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});
app.get("/privacy-policy", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

const port = process.env.port || 3000;
server.listen(port, () => {
  console.log(`server started on port ${port}`);
});
const SERVER_ENDPOINT_REDIRECT =
  process.env.SERVER_ENDPOINT_REDIRECT || "localhost:3000";
const CALLBACK_URL =
  process.env.CALLBACK_URL ||
  "https://adsgency-take-home.onrender.com/authCallback";

app.get("/oauth", (req, res) => {
  const CLIENT_KEY = "awbpei30wwvrdl6a";
  const DOMAIN = "adsgency-take-home.onrender.com";
  const csrfState = Math.random().toString(36).substring(2);
  res.cookie("csrfState", csrfState, { maxAge: 60000 });
  const redirect = encodeURIComponent(`https://${DOMAIN}/tiktok`);

  let url = "https://www.tiktok.com/auth/authorize/";

  url += "?client_key=" + CLIENT_KEY;
  url += "&scope=user.info.basic";
  url += "&response_type=code";
  url += "&redirect_uri=" + redirect;
  url += "&state=" + csrfState;

  res.redirect(url);
  // const csrfState = Math.random().toString(36).substring(2);
  // res.cookie("csrfState", csrfState, { maxAge: 60000 });

  // let url = "https://www.tiktok.com/auth/authorize/";

  // url += `?client_key=${CLIENT_KEY}`;
  // url += "&scope=user.info.basic";
  // url += "&response_type=code";
  // url += `&redirect_uri=${encodeURIComponent(SERVER_ENDPOINT_REDIRECT)}`;
  // url += "&state=" + csrfState;

  // res.redirect(url);
});
app.post("/authCallback", (req, res) => {
  console.log(req.body);
  res.send(200);
});

app.get("/tiktok", (req, res) => {
  const { code, scopes, state } = req.query;

  // Log the received information
  console.log("Code:", code);
  console.log("Scopes:", scopes);
  console.log("State:", state);

  // Do any further processing, such as verifying the state parameter, exchanging the code for an access token, or storing the received data

  // Send a response to the client
  res.status(200).send("Received TikTok authentication data");
});
