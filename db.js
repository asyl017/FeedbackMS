const { Pool } = require('pg');

const fmsdb = new Pool({
  user: 'asyl',
  host: 'localhost',
  database: 'fmsdb',
  password: '1234',
  port: 5432,
});

module.exports = fmsdb;

