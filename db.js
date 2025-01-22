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

const uri = "mongodb+srv://sanek001:12345678987654321@sensh1.l0lry.mongodb.net/?retryWrites=true&w=majority&appName=Sensh1";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");
    const database = client.db('users'); 
    return database;
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas", error);
    throw error;
  }
}

module.exports = connectToDatabase;