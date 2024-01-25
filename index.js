const express = require("express");
const port = 8000;
const myServer = express();
const fs=require("fs");

const user = require("./users.json");
myServer.use(express.json());

myServer.get("/users", (request, response) => {
  response.json(user);
});
myServer.get("/users/:id", (request, response) => {
  const userId = request.params.id;
  const found = user.find((user) => user.id == userId);
  if (found) {
    response.json(found);
  } else {
    response.send("User not found");
  }
});
myServer.post("/users/create", (request, response) => {
  const newUser = request.body;
  const { name } = newUser;
  console.log(newUser);
  user.push({ id: String (user.length + 1), name: name });
  fs.writeFileSync("./users.json",JSON.stringify(user));
  response.send(user);
});

myServer.listen(port, () => {
  console.log("My server running");
});
