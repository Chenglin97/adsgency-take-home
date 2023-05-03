const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const server = http.createServer(app);
require("dotenv").config();
const session = require("express-session");
const axios = require("axios");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const CLIENT_KEY = "awbpei30wwvrdl6a";
const CLIENT_SECRET = "b43bc7181680b12b83f67c99d9970a5f";

app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(
  session({
    secret: "b43bc7181680b12b83f67c99d9970a5f",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 }, // 1 hour
  })
);

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

app.get("/oauth", (req, res) => {
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
});
app.post("/authCallback", (req, res) => {
  console.log(req.body);
  res.send(200);
});

app.get("/redirect", async (req, res) => {
  const { code, state } = req.query;
  const { csrfState } = req.cookies;

  if (state !== csrfState) {
    res.status(422).send("Invalid state");
    return;
  }

  let url_access_token = "https://open-api.tiktok.com/oauth/access_token/";
  url_access_token += "?client_key=" + CLIENT_KEY;
  url_access_token += "&client_secret=" + CLIENT_SECRET;
  url_access_token += "&code=" + code;
  url_access_token += "&grant_type=authorization_code";

  axios
    .post(url_access_token)
    .then((response) => {
      console.log(response.data);
      res.send(response.data);
    })
    .catch((error) => {
      console.error("Error fetching access token:", error);
      res.status(500).send("Error fetching access token.");
    });
});

app.get("/tiktok", async (req, res) => {
  const { code, scopes, state } = req.query;
  const DOMAIN = "adsgency-take-home.onrender.com";
  const redirect = encodeURIComponent(`https://${DOMAIN}/tiktok`);

  try {
    const response = await axios.post(
      "https://www.tiktok.com/oauth/access_token/",
      {
        client_key: CLIENT_KEY,
        client_secret: CLIENT_SECRET,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: redirect,
      }
    );

    const { access_token, refresh_token } = response.data;

    req.session.user = {
      access_token,
      refresh_token,
      scopes,
      state,
    };

    res.redirect("/?login=success");
  } catch (error) {
    console.error("Error fetching access token:", error);
    res.redirect("/?login=error");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error logging out.");
    }
    res.clearCookie("connect.sid");
    res.status(200).send("Logged out successfully.");
  });
});

app.get("/checkLogin", (req, res) => {
  const isLoggedIn = req.session && req.session.user;
  res.json({ isLoggedIn });
});
