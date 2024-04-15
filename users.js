const { getUserPost } = require("./posts");
const user = require("./users.json");
const fs = require("fs");

module.exports = function (myServer) {
  myServer.get("/users", (request, response) => {
    response.json(user);
  });
  myServer.get("/users/:id", (request, response) => {
    const userId = request.params.id;
    const found = user.find((user) => user.id == userId);
    if (found) {
      const post = getUserPost(userId);
      response.json({...found, post:post});
       
    } else {
      response.send("User not found");
    }
  });
  myServer.post("/users/create", (request, response) => {
    const newUser = request.body;
    const { name } = newUser;
    console.log(newUser);
    user.push({ id: String(user.length + 1), name: name });
    fs.writeFileSync("./users.json", JSON.stringify(user));
    response.send(user);
  });
  myServer.put("/users/:id", (request, response) => {
    const userId = request.params.id;
    const newName = request.body.name;

    const updateUser = user.find((user) => user.id == userId);
    if (updateUser) {
      updateUser.name = newName;

      response.json(updateUser);
    }
    fs.writeFileSync("./users.json", JSON.stringify(user));
  });

  myServer.delete("/users/:id", (request, response) => {
    const userId = request.params.id;
    const updatedUsers = user.filter((user) => user.id !== userId);

    response.send(updatedUsers);

    fs.writeFileSync("./users.json", JSON.stringify(updatedUsers));
  });
};
