
require("dotenv").config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const pgtools = require('pgtools');

// PostgreSQL configuration for the default connection (e.g., to the 'postgres' database)
const config = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.HOST,
  port: process.env.PORT_PG,
};

const dbName = process.env.DATABASE;

/**
 * Creates the database if it doesn't exist.
 */
const createDatabase = async () => {
  try {
    await pgtools.createdb(config, dbName);
    console.log(`Database '${dbName}' created successfully.`);
  } catch (err) {
    // If the database already exists, log the message and continue
    if (err.name === 'duplicate_database') {
      console.log(`Database '${dbName}' already exists.`);
    } else {
      throw err;
    }
  }
};


const pool =new Pool({
    user: config.user,
    host: config.host,
    database: dbName,
    password: config.password,
    port: config.port,
  });

/**
 * Executes the SQL command from a file.
 * @param {Pool} pool - The PostgreSQL connection pool.
 * @param {string} filePath - The path to the SQL file.
 */
const executeSQLFile = async (pool, filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', async (err, sql) => {
      if (err) return reject(err);
      try {
        await pool.query(sql);
        console.log(`Executed: ${path.basename(filePath)}`);
        resolve();
      } catch (queryErr) {
        reject(queryErr);
      }
    });
  });
};

/**
 * Sets up the database and creates tables from SQL files.
 */
const setupDatabase = async () => {
  // Step 1: Create the database if it doesn't exist
  await createDatabase();

  // Step 2: Connect to the newly created database
  const pool =new Pool({
    user: config.user,
    host: config.host,
    database: dbName,
    password: config.password,
    port: config.port,
  });

  // Step 3: Define the folder that contains your SQL files for each table
  const sqlFolder = path.join(__dirname, 'database');
  const files = fs
    .readdirSync(sqlFolder)
    .filter((file) => file.endsWith('.sql'))
    .sort(); // Sort files to maintain the correct order (e.g., based on dependencies)

  // Step 4: Execute each SQL file to create the tables
  for (const file of files) {
    const filePath = path.join(sqlFolder, file);
    await executeSQLFile(pool, filePath);
  }

  // Optionally close the pool if no further queries are needed
  await pool.end();
};

module.exports = {
  setupDatabase,
  query: (text, params) => pool.query(text, params)
};  