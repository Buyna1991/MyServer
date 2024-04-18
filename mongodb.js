const { response } = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require("dotenv").config();
const uri = process.env.Mongo_Url


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const getCollection = async (db, collection) => {
  return await client.db(db).collection(collection);
};
const NflixEndPoints = (myServer) => {
  myServer.get("/netflix/sessions", async (request, response) => {
    await client.connect();
    const sessionCollection = await getCollection("sample_mflix", "sessions");
    const allValues = await sessionCollection.find().toArray();
    response.json(allValues);
  });
  myServer.get("/netflix/movies/:id", async (request, response) => {
    const movieId = request.params.id;
  
    await client.connect();
    const movieData = await client.db("sample_mflix").collection("movies");
    const data = await movieData
      .find({ _id: new ObjectId(String(movieId)) })
      .toArray();
    response.json(data);
  });
  myServer.delete("/netflix/movies/:id", async (request, response) => {
    const movieId = request.params.id;
    await client.connect();
    const movieData = await client.db("sample_mflix").collection("movies");
    const deleteMovie = await movieData.deleteOne({
      _id: new ObjectId(String(movieId)),
    });

    response.json(deleteMovie);
  });
  myServer.post("/netflix/movies/create", async (request, response) => {
    try {
      const newMovie = request.body;
      const requiredFields = ["title", "plot", "year", "genre", "director"];
      const { title, plot, year , genre, director } = newMovie;
      const values = Object.keys(newMovie);
      const missingFields = requiredFields.filter(
        (value) => !values.includes(value)
      );

      if (missingFields.length > 0) {
        throw new Error(
          `${missingFields.join(", ")}- fields are missing value`
        );
      }

      const movieData = await client.db("sample_mflix").collection("movies");
      const createData = await movieData.insertOne(newMovie);

      response.send(createData);
    } catch (error) {
      response.status(400).send(error.message);
    }
  });
  
 
};

module.exports = { NflixEndPoints };
