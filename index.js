const express = require("express");
const port = 8000;
const myServer = express();

myServer.get('/', (request, response) => {
    response.send("Hello Buyna watch out bro");
})

myServer.listen(port,()=> {
    console.log("My server running");
}); 