import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dbModel from "./dbModel.js";
import Pusher from "pusher";

// app config
const app = express();
const port = process.env.PORT || 8080;

const pusher = new Pusher({
  appId: "1186425",
  key: "b7e10c8e64a5b6dd33e4",
  secret: "1f5b0da57bb704417c5c",
  cluster: "ap2",
  useTLS: true,
});

//middleware
app.use(express.json());
app.use(cors());

// api routes
app.get("/", (req, res) => res.status(200).send("Hello world"));
app.post("/upload", (req, res) => {
  const body = req.body;

  dbModel.create(body, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

app.get("/sync", (req, res) => {
  dbModel.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

// listen
app.listen(port, () => console.log(`listenming to ${port}`));

// DB config
const connection_url =
  "mongodb+srv://admin:uSHCg5rISouxoL2v@cluster0.na7pc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log("DB connected");

  const changeStream = mongoose.connection.collection("posts").watch();

  changeStream.on("change", (change) => {
    console.log("Change Triggred on pusher");
    console.log(change);
    console.log("End of change");

    if (change.operationType === "insert") {
      console.log("Triggering Pusher ***IMG UPLOSD***");

      const postDetails = change.fullDocument;
      pusher.trigger("posts", "inserted", {
        user: postDetails.user,
        caption: postDetails.caption,
        image: postDetails.image,
      });
    }
  });
});
