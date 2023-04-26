const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const server = http.createServer(app);

const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

const csrfState = Math.random().toString(36).substring(2);

const port = 3001 || process.env.port;
server.listen(port, () => {
  console.log(`server started on port ${port}`);
});

const CLIENT_KEY = "awujnpxn69c76n3p";
app.get("/oauth", (req, res) => {
  const csrfState = Math.random().toString(36).substring(2);
  res.cookie("csrfState", csrfState, { maxAge: 60000 });

  let url = "https://www.tiktok.com/auth/authorize/";

  url += `?client_key=${CLIENT_KEY}`;
  url += "&scope=user.info.basic,video.list";
  url += "&response_type=code";
  url += "&redirect_uri={SERVER_ENDPOINT_REDIRECT}";
  url += "&state=" + csrfState;

  res.redirect(url);
});
