// routes/campaignRoutes.js
const express = require("express");
const router = express.Router();
const campaigns = require("../models/campaignModel");

// GET all campaigns for a user
router.get("/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const userCampaigns = campaigns.filter(
    c => c.dmId === userId || c.players.includes(userId)
  );
  res.json(userCampaigns);
});

// POST create campaign (user becomes DM)
router.post("/", (req, res) => {
  const { name, dmId } = req.body;

  const newCamp = {
    id: campaigns.length + 1,
    name,
    dmId,
    players: []
  };

  campaigns.push(newCamp);
  res.json({ success: true, campaign: newCamp });
});

// POST join campaign
router.post("/join", (req, res) => {
  const { campaignId, userId } = req.body;

  const camp = campaigns.find(c => c.id === campaignId);
  if (!camp) return res.status(404).json({ error: "Campaign not found" });

  if (!camp.players.includes(userId)) {
    camp.players.push(userId);
  }

  res.json({ success: true, campaign: camp });
});

module.exports = router;
