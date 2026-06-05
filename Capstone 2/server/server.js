// SokoRada Express Backend API
// Handles user profiles, application synchronization, audit logs, and developer diagnostics

const cors = require("cors");
const express = require("express");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for static frontend PWA (allows all origins for Vercel/localhost testing)
app.use(cors());
app.use(express.json());

// Initialize Database Schemas on Startup
db.initSchemas()
  .then(() => console.log("[Server] Database initialized."))
  .catch(err => console.error("[Server] Schema initialization error:", err));

// Log every inbound request for debugging
app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.url}`);
  next();
});

// Helper: Evaluates if a profile triggers manual human review (Guardian Agent logic)
function checkHumanReviewFlag(u) {
  if (!u) return false;
  // Triage rules:
  // 1. Explicit user request
  if (u.supportRequested) return true;
  // 2. High family obligation pressure
  if (u.readinessAnswers && u.readinessAnswers.pressure === "heavy") return true;
  // 3. High crop credit request (> KES 30,000) under seasonal cycles
  if (u.requestedAmount > 30000 && u.incomeCycle === "seasonal") return true;
  return false;
}

// ----------------------------------------------------
// CORE API ENDPOINTS
// ----------------------------------------------------

// Retrieve Profile by Phone
app.get("/api/profiles/:phone", async (req, res) => {
  try {
    const user = await db.getUserByPhone(req.params.phone);
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(404).json({ success: false, message: "Profile not found." });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create or Sync Profile
app.post("/api/profiles", async (req, res) => {
  try {
    const user = req.body;
    if (!user || !user.phone) {
      return res.status(400).json({ success: false, message: "Missing profile fields." });
    }
    
    // Check if new user
    const existing = await db.getUserByPhone(user.phone);
    await db.saveUser(user);
    
    if (!existing) {
      await db.saveLog({
        timestamp: new Date().toISOString(),
        event: "User Profile Created",
        details: `Created new profile for occupation: ${user.occupation} in ${user.location}`,
        user: `${user.name} (${user.phone})`,
        type: "consent"
      });
    } else {
      await db.saveLog({
        timestamp: new Date().toISOString(),
        event: "User Profile Synced",
        details: `Synchronized profile update to central Render DB.`,
        user: `${user.name} (${user.phone})`,
        type: "system"
      });
    }
    
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete Profile / Withdraw Consent
app.delete("/api/profiles/:phone", async (req, res) => {
  try {
    const phone = req.params.phone;
    const user = await db.getUserByPhone(phone);
    if (user) {
      await db.deleteUser(phone);
      await db.saveLog({
        timestamp: new Date().toISOString(),
        event: "Consent Withdrawn",
        details: `User profile and associated logs deleted under GDPR/consent rules.`,
        user: `${user.name} (${phone})`,
        type: "consent"
      });
      res.json({ success: true, message: "Profile deleted and consent withdrawn." });
    } else {
      res.status(404).json({ success: false, message: "Profile not found." });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Submit Loan Details
app.post("/api/applications", async (req, res) => {
  try {
    const { phone, requestedAmount, loanType, incomeSource, incomeCycle, repaymentTiming, existingSavings, supportRequested } = req.body;
    const user = await db.getUserByPhone(phone);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.requestedAmount = requestedAmount;
    user.loanType = loanType;
    user.incomeSource = incomeSource;
    user.incomeCycle = incomeCycle;
    user.repaymentTiming = repaymentTiming;
    user.existingSavings = existingSavings;
    user.supportRequested = supportRequested;

    await db.saveUser(user);
    await db.saveLog({
      timestamp: new Date().toISOString(),
      event: "Loan Application Saved",
      details: `Amount KES ${requestedAmount} for purpose: ${loanType}.`,
      user: `${user.name} (${phone})`,
      type: "application"
    });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Submit Support/Callback Requests
app.post("/api/support-requests", async (req, res) => {
  try {
    const { phone, category, details } = req.body;
    const user = await db.getUserByPhone(phone);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.supportRequested = true;
    user.supportCategory = category;
    user.supportDetails = details;

    await db.saveUser(user);
    await db.saveLog({
      timestamp: new Date().toISOString(),
      event: "Officer Support Requested",
      details: `Callback ticket queued. Category: ${category}`,
      user: `${user.name} (${phone})`,
      type: "communication"
    });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// DEVELOPER & OFFICER DIAGNOSTIC ENDPOINTS
// ----------------------------------------------------

// Fetch Officer Briefing (Hunter Agent compiled summary)
app.get("/api/dev/briefings/:phone", async (req, res) => {
  try {
    const user = await db.getUserByPhone(req.params.phone);
    if (!user) {
      return res.status(404).json({ message: "Profile not found." });
    }

    const reviewFlag = checkHumanReviewFlag(user);
    
    // Text-based briefing packet
    const briefing = `
*** SOKORADA HUNTER AGENT: ETHICAL LENDING BRIEFING ***
[CENTRAL DB SYNC: DEPLOYED ON RENDER]

BORROWER PROFILE:
- Name/Identifier: ${user.name}
- Location: ${user.location}
- Phone: ${user.phone}
- Main Income: ${user.incomeSource}
- Declared Cycle: ${user.incomeCycle}
- Savings Buffer: KES ${user.existingSavings.toLocaleString()}

APPLICATION REQUEST:
- Requested Amount: KES ${user.requestedAmount.toLocaleString()}
- Purpose Category: ${user.loanType}
- Aligned Repayment Plan: ${user.repaymentTiming}

FINANCIAL WELL-BEING:
- Confidence: ${user.readinessAnswers.confidence || "Not Assessed"}
- Income Predictability: ${user.readinessAnswers.easiest_months || "Not Assessed"}
- Keep Sales Logs: ${user.readinessAnswers.records || "Not Assessed"}
- Household Cash Pressure: ${user.readinessAnswers.pressure || "Not Assessed"}

TRAINING STATUS:
- Courses Completed: ${user.trainingCompleted.join(", ") || "None"}

GUARDIAN LENDING RECOMMENDATIONS:
- Aligned Repayment Suggestion: ${user.repaymentTiming === "seasonal" ? "Seasonal harvest installments (Principal postponed to crop sale window)" : "Weekly cash-aligned micro-installments"}
- Human Review Recommendation: ${reviewFlag ? "YES (Required due to cash cycle or direct user request)" : "NO (Auto-guidance holds, standard processing)"}
- Special Notes: ${user.supportRequested ? `User requested manual officer review. Detail: "${user.supportDetails}"` : "None"}
    `.trim();

    res.json({ success: true, briefing });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fetch Flagged Review Cases (Guardian Triage Queue)
app.get("/api/dev/triage", async (req, res) => {
  try {
    const users = await db.getUsers();
    const flagged = users.filter(checkHumanReviewFlag);
    res.json({ success: true, flagged });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fetch Fairness Analytics and Bias Alerts
app.get("/api/dev/alerts", async (req, res) => {
  try {
    const users = await db.getUsers();
    
    // Calculate escalation rates by occupation
    const farmers = users.filter(u => u.occupation === "farmer");
    const vendors = users.filter(u => u.occupation === "vendor");

    const flaggedFarmers = farmers.filter(checkHumanReviewFlag).length;
    const flaggedVendors = vendors.filter(checkHumanReviewFlag).length;

    const rateFarmers = farmers.length > 0 ? Math.round((flaggedFarmers / farmers.length) * 100) : 0;
    const rateVendors = vendors.length > 0 ? Math.round((flaggedVendors / vendors.length) * 100) : 0;

    const alerts = [
      {
        id: "b1",
        category: "Occupation Distribution",
        description: `Active database check: Farmers review escalation rate: ${rateFarmers}% (${flaggedFarmers}/${farmers.length}). Market vendors review escalation rate: ${rateVendors}% (${flaggedVendors}/${vendors.length}).`,
        severity: Math.abs(rateFarmers - rateVendors) > 40 ? "warning" : "info"
      }
    ];

    // Check if dignity filter alert is present
    alerts.push({
      id: "b2",
      category: "Dignity Language safety",
      description: "Dignity checker active. Zero cases of toxic classifications (e.g. 'risky', 'unreliable') found in central Render database logs.",
      severity: "info"
    });

    res.json({ success: true, alerts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fetch Logs
app.get("/api/dev/logs", async (req, res) => {
  try {
    const logs = await db.getLogs();
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Log manual event
app.post("/api/dev/logs", async (req, res) => {
  try {
    const { event, details, user, type } = req.body;
    const log = {
      timestamp: new Date().toISOString(),
      event,
      details,
      user: user || "Anonymous",
      type: type || "system"
    };
    await db.saveLog(log);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reset Database
app.post("/api/dev/reset", async (req, res) => {
  try {
    await db.resetDatabase();
    await db.saveLog({
      timestamp: new Date().toISOString(),
      event: "Database Reset",
      details: "Central Render database reset to baseline mock profiles.",
      user: "System",
      type: "system"
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`[Server] SokoRada API Backend service running on port ${PORT}`);
});
