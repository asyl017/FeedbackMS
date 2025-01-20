const { Pool } = require('pg');

const fmsdb = new Pool({
  user: 'asyl',
  host: 'localhost',
  database: 'fmsdb',
  password: '1234',
  port: 5432,
});

module.exports = fmsdb;

//mongo db connect snippet
const { MongoClient } = require('mongodb');

const uri = "your_mongodb_atlas_connection_string"; // Replace with your MongoDB Atlas connection string
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");
    const database = client.db('fmsdb'); // Replace 'fmsdb' with your database name
    return database;
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas", error);
    throw error;
  }
}

module.exports = connectToDatabase;