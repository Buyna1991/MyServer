const comments = require("./comments.json");
const fs = require("fs");

const getUserPostComments = (postid) => {
  return comments.filter((value) => value.postid == postid);
};
const createPostsComments = (myServer) => {
myServer.get("/comments", (req, res) => {
  res.send(comments);
});

myServer.get("/post/:id/comments", (req, res) => {
  const postid = req.params.id;
  const postComments = comments.filter((value) => value.postid == postid);
  res.send(postComments);
});
myServer.get("/users/:id/comments", (req, res) => {
  const userId = req.params.id;
  const userComments = comments.filter((value) => value.owner == userId);
  res.send(userComments);
});
myServer.post("/comments/create", (request, response) => {
  const newComments = request.body;
  const { text, createdAt, owner, postid } = newComments;

  comments.push({
    id: String(comments.length + 1),
    text: text,
    createdAt: Date.now(),
    owner: owner,
    postid: postid,
  });
  fs.writeFileSync("./comments.json", JSON.stringify(comments));
  response.send(comments);
});
myServer.delete("/comments/:id", (request, response) => {
  const userId = request.params.id;
  const updatedComments = comments.filter((user) => user.id !== userId);

  fs.writeFileSync("./comments.json", JSON.stringify(updatedComments));
  response.send(updatedComments);
});
};
module.exports = { getUserPostComments,createPostsComments };
