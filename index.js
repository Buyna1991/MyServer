require("./mongodb");
const { response } = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const port = 3001;
const myServer = express();
require("./countries");
const { WorldEndPoints } = require("./countries");
const { NflixEndPoints } = require("./mongodb");
const { createPosts } = require("./posts");
const { createPostsComments } = require("./comments");
const cors = require("cors");
var { expressjwt } = require("express-jwt");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const uri = process.env.Mongo_Url;

const JWT_SECRET = "shhhhhhared-secret";

myServer.use(express.json());
myServer.use(cors());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
myServer.get("/", (req, res) => {
  res.status(200).json("working");
});
myServer.get("/getToken", (req, res) => {
  res.send(
    jwt.sign({ email: "test@mail.com" }, JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: "3hr",
    })
  );
});

myServer.post("/register", async (req, res) => {
  try {
    const { userName, userPassword } = req.body;
    const hashedPassword = await bcrypt.hash(userPassword, 10);
    const credentials = await client.db("users").collection("credentials");
    const userCredentials = await credentials.findOne({
      userName,
    });
    console.log(userCredentials);
    if (!userCredentials) {
      const data = await credentials.insertOne({
        userName,
        userPassword: hashedPassword,
      });
      const id = data.insertedId;
      const token = jwt.sign({ id }, JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: "2hr",
      });
      res.json({ token });
      console.log(token);
    } else {
      res.json("Already registered");
    }
  } catch (e) {
    res.json(e.message);
  }
});
myServer.post("/forgot-password", async (req, res) => {
  try {
    const { userName } = req.body;
    const credentials = await client.db("users").collection("credentials");
    const userCredentials = await credentials.findOne({
      userName,
    });
    if (!userCredentials) {
      res.status(401).json("You have not Registered");
    }
    if (userCredentials) {
      const userID = userCredentials._id.toString();
      const token = jwt.sign({ userID }, JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: "24hr",
      });
      const hashedtoken = await bcrypt.hash(token, 10);
      const tokendb = await client.db("users").collection("passwordtoken");
      const data = await tokendb.insertOne({ hashedtoken, userID });

      res.json({ token });
      return;
    }
  } catch (error) {
    console.error("Error occured:", error);
  }
});
myServer.post("/reset-password", async (req, res) => {
  try {
    const { userPassword, token } = req.body;
    const data = jwt.verify(token, JWT_SECRET, { algorithms: "HS256" });
    await client.connect();
    const userID = data.userID;
    const hashedtoken = await client
      .db("users")
      .collection("passwordtoken")
      .findOne({ userID: userID });
    console.log(hashedtoken);
    if (!hashedtoken) {
      res.status(401).json("Your token does not exist");
      return;
    } else {
      const match = await bcrypt.compare(token, hashedtoken.hashedtoken);
      if (match) {
        const hashedpassword = await bcrypt.hash(userPassword, 10);
        const updated = await client
          .db("users")
          .collection("credentials")
          .updateOne(
            { _id: new ObjectId(String(userID)) },
            { $set: { userPassword: hashedpassword } }
          );
        res.json(updated);

        return;
      } else {
        res.status(401).json("Your token does not match");
        return;
      }
    }
  } catch (error) {
    console.error("Error occured:", error);
    res.status(500).json(error);
  }
});

myServer.post("/login", async (req, res) => {
  try {
    const { userName, userPassword } = req.body;
    const credentials = await client.db("users").collection("credentials");
    const userCredentials = await credentials.findOne({
      userName,
    });
    console.log(userCredentials);
    if (!userCredentials) {
      res.status(401).json("You have not Registered");
    } else {
      const correctUser = await bcrypt.compare(
        userPassword,
        userCredentials.userPassword
      );
      console.log(correctUser);
      if (correctUser) {
        const id = userCredentials._id.toString();
        const token = jwt.sign({ id }, JWT_SECRET, {
          algorithm: "HS256",
          expiresIn: "10hr",
        });
        res.json({ token });
      } else {
        res.status(401).json("Password is Wrong");
      }
    }
  } catch (error) {
    console.error("Error occurred:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
});
myServer.use(expressjwt({ secret: JWT_SECRET, algorithms: ["HS256"] }));

WorldEndPoints(myServer);
NflixEndPoints(myServer);
require("./users")(myServer);
createPosts(myServer);
createPostsComments(myServer);

myServer.listen(port, () => {
  console.log("My server running");
});
