const { Pool } = require("pg");

const {
  DB_HOST = "localhost",
  DB_PORT = 5432,
  DB_USER = "ayush",
  DB_PASSWORD = "",
  DB_NAME = "postgres"
} = process.env;

const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME
});

async function initializeDatabase() {
  try {
    await pool.query("SELECT 1");
    console.log("✅ PostgreSQL Connected");
  } catch (err) {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  }
}

module.exports = {
  pool,
  initializeDatabase
};