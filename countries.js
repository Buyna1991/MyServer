const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { response } = require("express");
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
const WorldEndPoints = (myServer) => {
  myServer.get("/world/countries", async (request, response) => {
    await client.connect();
    const countryCollection = await getCollection(
      "world_countries",
      "countries_info"
    );
    const allCountry = await countryCollection.find().toArray();
    response.json(allCountry);
  });
  myServer.get("/world/countriesbyName/:name", async (request, response) => {
    const name = request.params.name;
    console.log(name);
    await client.connect();
    const countryCollection = await getCollection(
      "world_countries",
      "countries_info"
    );
    const country = await countryCollection
      .find({ "name.common": name })
      .toArray();
    response.json(country);
  });
  myServer.get("/world/countries/:id", async (request, response) => {
    const countryId = request.params.id;

    await client.connect();
    const countryCollection = await getCollection(
      "world_countries",
      "countries_info"
    );
    const foundCountry = await countryCollection.findOne({
      _id: new ObjectId(String(countryId)),
    });
    response.json(foundCountry);
  });
  myServer.get("/world/:continents", async (request, response) => {
    const continents = request.params.continents;
    await client.connect();
    const countryCollection = await getCollection(
      "world_countries",
      "countries_info"
    );
    const withinContinents = await countryCollection
      .find({ continents: continents })
      .toArray();
    response.json(withinContinents);
  });
  myServer.get(
    "/world/countriesbyLanguage/:language",
    async (request, response) => {
      const language = request.params.language;
      try {
        await client.connect();

        const countryCollection = await getCollection(
          "world_countries",
          "countries_info"
        );

        const countries = await countryCollection.find().toArray();

        const filteredCountries = countries.filter((country) => {
          if (!country.languages) {
            console.log("Country has no languages:", country);
          }
          return (
            country.languages &&
            Object.values(country.languages).some((langValue) => {
              return langValue === language;
            })
          );
        });

        if (filteredCountries.length > 0) {
          response.json(filteredCountries);
        } else {
          response
            .status(404)
            .json({ error: "No countries found with the specified language." });
        }
      } catch (error) {
        console.error("Error retrieving countries:", error);
        response.status(500).json({ error: "Internal server error" });
      }
    }
  );
  myServer.put("/world/countries/:id", async (request, response) => {
    const countryId = request.params.id;
    const newLanguage = request.body.languages;
    const newPopulation = request.body.population;
    const newCapital = request.body.capital;
    const newName = request.body.name;
    const newRegion = request.body.region;
    const newLandlocked = request.body.landlocked;
    const newIndependent = request.body.independent;
    const newFlag = request.body.flag;
    await client.connect();
    const countryCollection = await getCollection(
      "world_countries",
      "countries_info"
    );
    const updateCountry = await countryCollection.findOneAndUpdate(
      { _id: new ObjectId(String(countryId)) },
      {
        $set: {
          languages: newLanguage,
          population: newPopulation,
          capital: newCapital,
          name: newName,
          region: newRegion,
          landlocked: newLandlocked,
          independent: newIndependent,
          flag: newFlag,
        },
      }
    );
    response.json(updateCountry);
  });

  myServer.delete("/world/countries/:id", async (request, response) => {
    const countryId = request.params.id;
    console.log(countryId);
    await client.connect();
    const countryCollection = await getCollection(
      "world_countries",
      "countries_info"
    );
    const deleteCountry = await countryCollection.deleteOne({
      _id: new ObjectId(String(countryId)),
    });

    response.json(deleteCountry);
  });
  myServer.post("/world/countries/create", async (request, response) => {
    try {
      const newCountry = request.body;

      console.log(newCountry);
      const requiredFields = [
        "name",
        "languages",
        "region",
        "population",
        "capital",
        "landlocked",
        "independent",
        "flag",
      ];
      const {
        name,
        languages,
        region,
        population,
        capital,
        landlocked,
        independent,
        flag,
      } = newCountry;

      const values = Object.keys(newCountry);
      const missingFields = requiredFields.filter(
        (value) => !values.includes(value)
      );

      if (missingFields.length > 0) {
        throw new Error(
          `${missingFields.join(", ")}- fields are missing value`
        );
      }
      const countryCollection = await getCollection(
        "world_countries",
        "countries_info"
      );
      const createdCountry = await countryCollection.insertOne(newCountry);
      const insertedId = createdCountry.insertedId;
      const res = await countryCollection.findOne({
        _id: new ObjectId(String(insertedId)),
      });

      response.send({ res });
    } catch (error) {
      response.status(400).send(error.message);
    }
  });
  myServer.get("/world/countries/:id", async (request, response) => {
    const countryId = request.params.id;

    await client.connect();
    const countryCollection = await getCollection(
      "world_countries",
      "countries_info"
    );
    const foundCountry = await countryCollection.findOne({
      _id: new ObjectId(String(countryId)),
    });
    response.json(foundCountry);
  });
};

module.exports = { WorldEndPoints };
