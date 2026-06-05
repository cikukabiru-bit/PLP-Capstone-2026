// SokoRada Database Adapter
// Connects to PostgreSQL if DATABASE_URL env var exists, otherwise falls back to local database.json file

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const JSON_DB_PATH = path.join(__dirname, "database.json");

let pool = null;
let usePg = false;

// Check if PostgreSQL environment variable exists
if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // Required for Render Postgres
      }
    });
    usePg = true;
    console.log("[Database] Using PostgreSQL database connection.");
  } catch (err) {
    console.error("[Database] PG Pool error, falling back to local file storage:", err);
    usePg = false;
  }
} else {
  console.log("[Database] No DATABASE_URL found. Using local JSON database.json file.");
}

// Default Seed Data
const DEFAULT_STATE = {
  users: [
    {
      id: "grace",
      name: "Grace",
      phone: "0712345678",
      occupation: "farmer",
      location: "Kakamega",
      requestedAmount: 28000,
      loanType: "school_fees",
      incomeSource: "Maize Farming",
      incomeCycle: "seasonal",
      repaymentTiming: "seasonal",
      existingSavings: 4500,
      saccoId: "ujima",
      readinessAnswers: {
        confidence: "medium",
        purpose: "yes",
        easiest_months: "march_august",
        records: "no",
        pressure: "manageable",
        training_need: "budgeting"
      },
      trainingCompleted: ["harvest_cycle", "school_fees_prep"],
      supportRequested: true,
      supportCategory: "repayment_schedule",
      supportDetails: "I need school fees now, but my maize sells in August. I need to pay when my crop is ready."
    },
    {
      id: "amina",
      name: "Amina",
      phone: "0723456789",
      occupation: "vendor",
      location: "Busia",
      requestedAmount: 15000,
      loanType: "business_stock",
      incomeSource: "Market Produce Vendor",
      incomeCycle: "daily",
      repaymentTiming: "weekly",
      existingSavings: 2000,
      saccoId: "kwft",
      readinessAnswers: {
        confidence: "high",
        purpose: "yes",
        easiest_months: "any",
        records: "yes",
        pressure: "manageable",
        training_need: "record_keeping"
      },
      trainingCompleted: ["record_keeping"],
      supportRequested: false,
      supportCategory: "",
      supportDetails: ""
    },
    {
      id: "peter",
      name: "Peter",
      phone: "0734567890",
      occupation: "farmer",
      location: "Meru",
      requestedAmount: 40000,
      loanType: "asset_equipment",
      incomeSource: "Dairy Farming",
      incomeCycle: "monthly",
      repaymentTiming: "monthly",
      existingSavings: 8000,
      saccoId: "stima",
      readinessAnswers: {
        confidence: "low",
        purpose: "yes",
        easiest_months: "any",
        records: "no",
        pressure: "heavy",
        training_need: "loan_terms"
      },
      trainingCompleted: [],
      supportRequested: true,
      supportCategory: "low_readiness",
      supportDetails: "I need feed for my cows, but I have other small debts. I want to speak to someone to help me budget."
    }
  ],
  auditLogs: [
    { timestamp: "2026-06-05T08:30:00Z", event: "Render Database Initialized", details: "SokoRada backend service live.", user: "System", type: "system" }
  ]
};

// JSON file helper methods
function readJsonDb() {
  if (!fs.existsSync(JSON_DB_PATH)) {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(DEFAULT_STATE, null, 2));
    return DEFAULT_STATE;
  }
  try {
    const content = fs.readFileSync(JSON_DB_PATH, "utf8");
    return JSON.parse(content);
  } catch (err) {
    console.error("[Database] Error reading json database, resetting to default:", err);
    return DEFAULT_STATE;
  }
}

function writeJsonDb(data) {
  try {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("[Database] Error writing to json database:", err);
  }
}

// Database helper functions exported to Express
const db = {
  // Initialize SQL schemas if PG is used
  async initSchemas() {
    if (!usePg) {
      // Create local file if not exists
      readJsonDb();
      return;
    }
    const client = await pool.connect();
    try {
      // Create table for users
      await client.query(`
        CREATE TABLE IF NOT EXISTS sokorada_users (
          phone VARCHAR(20) PRIMARY KEY,
          data JSONB NOT NULL
        )
      `);
      // Create table for logs
      await client.query(`
        CREATE TABLE IF NOT EXISTS sokorada_logs (
          id SERIAL PRIMARY KEY,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          event VARCHAR(100),
          details TEXT,
          username VARCHAR(100),
          log_type VARCHAR(20)
        )
      `);
      
      // Check if users table is empty, if so, seed
      const res = await client.query("SELECT COUNT(*) FROM sokorada_users");
      if (parseInt(res.rows[0].count) === 0) {
        console.log("[Database] Seeding PostgreSQL database with default mock profiles.");
        for (const u of DEFAULT_STATE.users) {
          await client.query(
            "INSERT INTO sokorada_users (phone, data) VALUES ($1, $2)",
            [u.phone, JSON.stringify(u)]
          );
        }
      }
      console.log("[Database] SQL Tables initialized successfully.");
    } catch (err) {
      console.error("[Database] SQL Initialization failed:", err);
    } finally {
      client.release();
    }
  },

  async getUsers() {
    if (usePg) {
      const res = await pool.query("SELECT data FROM sokorada_users");
      return res.rows.map(r => r.data);
    } else {
      return readJsonDb().users;
    }
  },

  async getUserByPhone(phone) {
    if (usePg) {
      const res = await pool.query("SELECT data FROM sokorada_users WHERE phone = $1", [phone]);
      return res.rows.length > 0 ? res.rows[0].data : null;
    } else {
      const data = readJsonDb();
      return data.users.find(u => u.phone === phone) || null;
    }
  },

  async saveUser(user) {
    if (usePg) {
      await pool.query(
        `INSERT INTO sokorada_users (phone, data) VALUES ($1, $2)
         ON CONFLICT (phone) DO UPDATE SET data = $2`,
        [user.phone, JSON.stringify(user)]
      );
    } else {
      const data = readJsonDb();
      const idx = data.users.findIndex(u => u.phone === user.phone);
      if (idx !== -1) {
        data.users[idx] = user;
      } else {
        data.users.push(user);
      }
      writeJsonDb(data);
    }
  },

  async deleteUser(phone) {
    if (usePg) {
      await pool.query("DELETE FROM sokorada_users WHERE phone = $1", [phone]);
    } else {
      const data = readJsonDb();
      data.users = data.users.filter(u => u.phone !== phone);
      writeJsonDb(data);
    }
  },

  async getLogs() {
    if (usePg) {
      const res = await pool.query("SELECT timestamp, event, details, username as user, log_type as type FROM sokorada_logs ORDER BY id DESC LIMIT 50");
      return res.rows;
    } else {
      return readJsonDb().auditLogs;
    }
  },

  async saveLog(log) {
    if (usePg) {
      await pool.query(
        "INSERT INTO sokorada_logs (event, details, username, log_type) VALUES ($1, $2, $3, $4)",
        [log.event, log.details, log.user, log.type]
      );
    } else {
      const data = readJsonDb();
      data.auditLogs.unshift({
        timestamp: log.timestamp || new Date().toISOString(),
        event: log.event,
        details: log.details,
        user: log.user,
        type: log.type
      });
      if (data.auditLogs.length > 50) data.auditLogs.pop();
      writeJsonDb(data);
    }
  },

  async resetDatabase() {
    if (usePg) {
      await pool.query("TRUNCATE TABLE sokorada_users");
      await pool.query("TRUNCATE TABLE sokorada_logs");
      for (const u of DEFAULT_STATE.users) {
        await pool.query(
          "INSERT INTO sokorada_users (phone, data) VALUES ($1, $2)",
          [u.phone, JSON.stringify(u)]
        );
      }
    } else {
      writeJsonDb(DEFAULT_STATE);
    }
  }
};

module.exports = db;
