const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const VERIFY_TOKEN = "chatbot001";

app.set("port", process.env.PORT || 3000);

// Allows us to process the data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ROUTES
app.get("/", function (req, res) {
  res.send("Hello ^____^");
});

// Facebook GET
app.get("/webhook", async (req, res) => {
  // Parse the query params
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    res.send(challenge);
  } else {
    // Responds with '403 Forbidden' if verify tokens do not match
    console.log("WEBHOOK_VERIFIED");
    res.sendStatus(403);
  }
});

app.post("/webhook", async (req, res) => {
  const { body } = req;
  if (body.object === "page") {
    const events = body && body.entry && body.entry[0];
    await handleEvents(events);
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
  return res.sendStatus(200);
});

app.listen(app.get("port"), function () {
  console.log("🚀 Server ready ~~~~");
});
