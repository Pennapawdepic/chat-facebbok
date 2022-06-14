const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const VERIFY_TOKEN = "chatbot001";
const { get } = require("lodash");
const request = require("request");

app.set("port", process.env.PORT || 4000);

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

const PAGE_ACCESS_TOKEN =
  "EAADvAyOmQCcBAE7XhFlGvcLgNhvbZC1X4WR7MMpPVZCFCbZBHuinhRZCdlxn9UDYXwwdtBQOXJrWzm1kOjNBaWDkPBcjRpCZCCbm2sl29hJs11ugr2xQtPaJ6B5IBVfR8ZAbLFW2YC12pNarkZA7D4Ro6RSa8QZCiNmVgC4K6YOzqSCDMv9b073spEtRYjZBouagBQ9UwyH0BgPeZAtpxZB2ZAVLOZCcAba0l46oaN1zNug7b80rDmEl3lZCN5";

const handleEvents = (events) => {
  const text = get(events, ["messaging", 0, "message", "text"]);
  const sender = get(events, ["messaging", 0, "sender", "id"]);
  const requestBody = {
    messaging_type: "RESPONSE",
    recipient: {
      id: sender,
    },
    message: { text },
  };

  const config = {
    method: "post",
    uri: "https://graph.facebook.com/v12.0/me/messages",
    json: requestBody,
    qs: {
      access_token: `${PAGE_ACCESS_TOKEN}`,
    },
  };
  return request(config, (err, res, body) => {
    if (!body.error) {
      console.log("message sent!", body);
      return body;
    } else {
      return new Error("Unable to send message:" + body.error);
    }
  });
};
