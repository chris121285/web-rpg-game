// server.js
const express = require("express");
const path = require("path");
const { DATA_DIR, ensureDataFiles } = require("./utils/dataDir");

const app = express();

const campaignClients = new Map();
const pendingCampaignEvents = new Map();

function registerCampaignClient(campaignId, res) {
  if (!campaignClients.has(campaignId)) {
    campaignClients.set(campaignId, new Set());
  }
  campaignClients.get(campaignId).add(res);
}

function unregisterCampaignClient(campaignId, res) {
  if (!campaignClients.has(campaignId)) return;
  campaignClients.get(campaignId).delete(res);
  if (campaignClients.get(campaignId).size === 0) {
    campaignClients.delete(campaignId);
  }
}

function broadcastCampaignEvent(campaignId, eventName, payload) {
  if (!campaignClients.has(campaignId)) {
    if (!pendingCampaignEvents.has(campaignId)) {
      pendingCampaignEvents.set(campaignId, []);
    }
    pendingCampaignEvents.get(campaignId).push({ eventName, payload });
    return;
  }
  const serialized = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;
  campaignClients.get(campaignId).forEach(res => res.write(serialized));
}

const broadcastQuest = (campaignId, quest) => broadcastCampaignEvent(campaignId, "quest", quest);

// ---------------------------
// 1. ENSURE PERSISTENT STORAGE
// ---------------------------
ensureDataFiles();

// Make DATA_DIR available to all routes
app.locals.dataDir = DATA_DIR;

// ---------------------------
// 2. MIDDLEWARE
// ---------------------------
// Increase body size limit to handle base64 images (default is 100kb)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get("/events/campaign/:campaignId", (req, res) => {
  const campaignId = parseInt(req.params.campaignId, 10);
  if (!campaignId) {
    return res.status(400).end();
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  registerCampaignClient(campaignId, res);

  if (pendingCampaignEvents.has(campaignId)) {
    pendingCampaignEvents.get(campaignId).forEach(event => {
      res.write(`event: ${event.eventName}\ndata: ${JSON.stringify(event.payload)}\n\n`);
    });
    pendingCampaignEvents.delete(campaignId);
  }

  req.on("close", () => {
    unregisterCampaignClient(campaignId, res);
  });
});

app.use(express.static(path.join(__dirname, "public")));


// ---------------------------
// 3. ROUTES
// ---------------------------

// persistent-storage versions
app.use("/users", require("./routes/usersRoutes"));
app.use("/campaigns", require("./routes/campaignsRoutes")(broadcastQuest));
app.use("/player", require("./routes/playerRoutes")(broadcastCampaignEvent));
app.use("/npc", require("./routes/npcRoutes"));
app.use("/encounter", require("./routes/encounterRoutes"));
app.use("/leveling", require("./routes/levelingRoutes"));

// legacy DM route (still works)
app.use("/dm", require("./routes/dmRoutes"));



// ---------------------------
// 4. ROOT ROUTE
// ---------------------------
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


// ---------------------------
// 5. START SERVER
// ---------------------------
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});
