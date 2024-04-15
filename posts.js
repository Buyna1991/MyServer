const { getUserPostComments } = require("./comments");
const posts = require("./posts.json");
const fs = require("fs");

const getUserPost = (userId) => {
  return posts.filter((value) => value.owner == userId);
};

const createPosts = (myServer) => {
  myServer.get("/posts", (req, res) => {
    res.send(posts);
  });
  myServer.get("/users/:id/posts", (req, res) => {
    const userId = req.params.id;
    const userPosts = posts.filter((value) => value.owner == userId);
    res.send(userPosts);
  });
  myServer.get("/posts/:id", (request, response) => {
    const postid = request.params.id;
    const found = posts.find((value) => value.id == postid);
    if (found) {
      const comments = getUserPostComments(postid);
      response.json({ ...found, comments: comments });
    } else {
      response.send("post not found");
    }
  });

  myServer.post("/posts/create", (request, response) => {
    const newPost = request.body;
    const { text, likes, createdAt, owner } = newPost;

    posts.push({
      id: String(posts.length + 1),
      text: text,
      likes: likes,
      createdAt: createdAt,
      owner: owner,
    });
    fs.writeFileSync("./posts.json", JSON.stringify(posts));
    response.send(posts);
  });
  myServer.put("/posts/:id", (request, response) => {
    const userId = request.params.id;
    const newText = request.body.text;
    const newLikes = request.body.likes;

    const updatePost = posts.find((user) => user.id == userId);
    if (updatePost) {
      if (newText !== undefined) {
        updatePost.text = newText;
      }

      if (newLikes !== undefined) {
        updatePost.likes = newLikes;
      }
    }
    fs.writeFileSync("./posts.json", JSON.stringify(posts));
    response.json(updatePost);
  });

  myServer.delete("/posts/:id", (request, response) => {
    const userId = request.params.id;
    const updatedPost = posts.filter((user) => user.id !== userId);

    fs.writeFileSync("./users.json", JSON.stringify(updatedPost));
    response.send(updatedPost);
  });
};

module.exports = { createPosts, getUserPost };
