const express = require("express");
const { load, save } = require("../utils/storage");

module.exports = function createCampaignRouter(broadcastQuest) {
    const router = express.Router();

// GET all campaigns
router.get("/", (req, res) => {
    const campaigns = load("campaigns.json");
    res.json(campaigns);
});

// Helper function to generate unique campaign code
function generateCampaignCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking chars
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// CREATE a new campaign
router.post("/", (req, res) => {
    const campaignData = req.body;
    const { name, dmUserId } = campaignData;

    if (!name || !dmUserId)
        return res.status(400).json({ error: "Missing required fields" });

    const campaigns = load("campaigns.json");

    // Generate unique campaign code
    let campaignCode;
    let isUnique = false;
    while (!isUnique) {
        campaignCode = generateCampaignCode();
        isUnique = !campaigns.find(c => c.code === campaignCode);
    }

    // Generate unique ID (find the highest existing ID and add 1)
    const maxId = campaigns.length > 0
        ? Math.max(...campaigns.map(c => c.id))
        : 0;

    const newCampaign = {
        id: maxId + 1,
        ...campaignData,
        code: campaignCode,
        players: [],
        npcs: [],
        quests: [],
        diceLog: [],
        created: campaignData.created || new Date().toISOString()
    };

    campaigns.push(newCampaign);
    save("campaigns.json", campaigns);

    res.json({ success: true, campaign: newCampaign });
});

// GET campaigns for a specific user
router.get("/user/:userId", (req, res) => {
    const userId = parseInt(req.params.userId);
    const campaigns = load("campaigns.json");

    // Find campaigns where user is DM or player
    const userCampaigns = campaigns
        .filter(c => c.dmUserId === userId || c.players.includes(userId))
        .map(c => ({
            ...c,
            role: c.dmUserId === userId ? 'dm' : 'player',
            playerCount: c.players.length,
            created: c.created || new Date().toISOString()
        }));

    res.json({ success: true, campaigns: userCampaigns });
});

// JOIN campaign via code
router.post("/join", (req, res) => {
    const { userId, code } = req.body;

    if (!userId || !code)
        return res.status(400).json({ error: "Missing user ID or campaign code" });

    const campaigns = load("campaigns.json");
    const campaign = campaigns.find(c => c.code === code.toUpperCase());

    if (!campaign)
        return res.status(404).json({ error: "Campaign not found. Please check the code." });

    // Check if campaign is full
    if (campaign.maxPlayers && campaign.players.length >= campaign.maxPlayers) {
        return res.status(400).json({ error: "Campaign is full" });
    }

    // Check if user is already in the campaign
    if (campaign.players.includes(userId)) {
        return res.status(400).json({ error: "You are already in this campaign" });
    }

    // Check if user is the DM
    if (campaign.dmUserId === userId) {
        return res.status(400).json({ error: "You are the DM of this campaign" });
    }

    // Add player to campaign
    campaign.players.push(userId);
    save("campaigns.json", campaigns);

    // Update any characters that belong to this user with null campaignId
    const players = load("players.json");
    let characterUpdated = false;
    players.forEach(player => {
        if (player.userId === userId && (player.campaignId === null || player.campaignId === undefined)) {
            player.campaignId = campaign.id;
            characterUpdated = true;
        }
    });

    if (characterUpdated) {
        save("players.json", players);
    }

    res.json({ success: true, campaign, campaignId: campaign.id });
});

// GET single campaign by ID
router.get("/:campaignId", (req, res) => {
    const campaignId = parseInt(req.params.campaignId);
    const campaigns = load("campaigns.json");
    const campaign = campaigns.find(c => c.id === campaignId);

    if (!campaign)
        return res.status(404).json({ error: "Campaign not found" });

    res.json({ success: true, campaign });
});

// UPDATE campaign (DM only)
router.put("/:campaignId", (req, res) => {
    const campaignId = parseInt(req.params.campaignId);
    const campaignData = req.body;
    const { dmUserId } = campaignData;

    if (!dmUserId)
        return res.status(400).json({ error: "User ID required" });

    const campaigns = load("campaigns.json");
    const campaignIndex = campaigns.findIndex(c => c.id === campaignId);

    if (campaignIndex === -1)
        return res.status(404).json({ error: "Campaign not found" });

    const campaign = campaigns[campaignIndex];

    // Only the DM can update the campaign
    if (campaign.dmUserId !== dmUserId)
        return res.status(403).json({ error: "Only the DM can edit this campaign" });

    // Update campaign while preserving ID, code, players, npcs, and created date
    campaigns[campaignIndex] = {
        ...campaignData,
        id: campaign.id,
        code: campaign.code,
        players: campaign.players,
        npcs: campaign.npcs,
        created: campaign.created
    };

    save("campaigns.json", campaigns);

    res.json({ success: true, campaign: campaigns[campaignIndex] });
});

// LEAVE campaign (remove player from campaign)
router.post("/:campaignId/leave", (req, res) => {
    const campaignId = parseInt(req.params.campaignId);
    const { userId } = req.body;

    if (!userId)
        return res.status(400).json({ error: "User ID required" });

    const campaigns = load("campaigns.json");
    const campaign = campaigns.find(c => c.id === campaignId);

    if (!campaign)
        return res.status(404).json({ error: "Campaign not found" });

    // Check if user is the DM
    if (campaign.dmUserId === userId)
        return res.status(400).json({ error: "DM cannot leave their own campaign. Delete it instead." });

    // Check if user is in the campaign
    if (!campaign.players.includes(userId))
        return res.status(400).json({ error: "You are not in this campaign" });

    // Remove player from campaign
    campaign.players = campaign.players.filter(id => id !== userId);
    save("campaigns.json", campaigns);

    res.json({ success: true, message: "Left campaign successfully" });
});

// GET quests for campaign
router.get("/:campaignId/quests", (req, res) => {
    const campaignId = parseInt(req.params.campaignId);
    const campaigns = load("campaigns.json");
    const campaign = campaigns.find(c => c.id === campaignId);

    if (!campaign)
        return res.status(404).json({ error: "Campaign not found" });

    res.json({ success: true, quests: campaign.quests || [] });
});

router.get("/:campaignId/dice-log", (req, res) => {
    const campaignId = parseInt(req.params.campaignId);
    const campaigns = load("campaigns.json");
    const campaign = campaigns.find(c => c.id === campaignId);

    if (!campaign)
        return res.status(404).json({ error: "Campaign not found" });

    res.json({ success: true, entries: campaign.diceLog || [] });
});

// POST quest (DM only)
router.post("/:campaignId/quests", (req, res) => {
    const campaignId = parseInt(req.params.campaignId);
    const { userId, title, description, rewards, turnInLocation } = req.body || {};

    if (!userId)
        return res.status(400).json({ error: "User ID required" });

    if (!title || !description)
        return res.status(400).json({ error: "Title and description are required" });

    const campaigns = load("campaigns.json");
    const campaignIndex = campaigns.findIndex(c => c.id === campaignId);

    if (campaignIndex === -1)
        return res.status(404).json({ error: "Campaign not found" });

    const campaign = campaigns[campaignIndex];

    if (campaign.dmUserId !== userId)
        return res.status(403).json({ error: "Only the DM can create quests" });

    const quest = {
        id: Date.now(),
        title,
        description,
        rewards: rewards || "",
        status: "Active",
        turnInLocation: turnInLocation || "",
        created: new Date().toISOString()
    };

    campaign.quests = [quest, ...(campaign.quests || [])];
    campaigns[campaignIndex] = campaign;
    save("campaigns.json", campaigns);

    res.json({ success: true, quest });
    if (typeof broadcastQuest === "function") {
        broadcastQuest(campaignId, quest);
    }
});

router.post("/:campaignId/dice-log", (req, res) => {
    const campaignId = parseInt(req.params.campaignId);
    const { userId, username, label, sides, roll, modifier, total, expression } = req.body || {};

    if (!userId || typeof roll === "undefined" || typeof total === "undefined")
        return res.status(400).json({ error: "Missing roll data" });

    const campaigns = load("campaigns.json");
    const campaignIndex = campaigns.findIndex(c => c.id === campaignId);

    if (campaignIndex === -1)
        return res.status(404).json({ error: "Campaign not found" });

    const entry = {
        id: Date.now(),
        userId,
        username: username || "Unknown",
        label: label || "",
        sides: sides || 20,
        expression: expression || null,
        roll,
        modifier: modifier || 0,
        total,
        timestamp: new Date().toISOString()
    };

    if (!Array.isArray(campaigns[campaignIndex].diceLog)) {
        campaigns[campaignIndex].diceLog = [];
    }
    campaigns[campaignIndex].diceLog.unshift(entry);
    if (campaigns[campaignIndex].diceLog.length > 30) {
        campaigns[campaignIndex].diceLog.length = 30;
    }

    save("campaigns.json", campaigns);

    res.json({ success: true, entry });
});

router.delete("/:campaignId/dice-log", (req, res) => {
    const campaignId = parseInt(req.params.campaignId);
    const { userId } = req.body || {};

    if (!userId)
        return res.status(400).json({ error: "User ID required" });

    const campaigns = load("campaigns.json");
    const campaignIndex = campaigns.findIndex(c => c.id === campaignId);

    if (campaignIndex === -1)
        return res.status(404).json({ error: "Campaign not found" });

    campaigns[campaignIndex].diceLog = [];
    save("campaigns.json", campaigns);

    res.json({ success: true });
});

router.patch("/:campaignId/quests/:questId", (req, res) => {
    const campaignId = parseInt(req.params.campaignId);
    const questId = parseInt(req.params.questId);
    const { status, userId } = req.body || {};

    if (!userId)
        return res.status(400).json({ error: "User ID required" });

    const campaigns = load("campaigns.json");
    const campaignIndex = campaigns.findIndex(c => c.id === campaignId);

    if (campaignIndex === -1)
        return res.status(404).json({ error: "Campaign not found" });

    const campaign = campaigns[campaignIndex];
    const questIndex = (campaign.quests || []).findIndex(q => q.id === questId);

    if (questIndex === -1)
        return res.status(404).json({ error: "Quest not found" });

    if (status === "abandoned") {
        const removedQuest = campaign.quests.splice(questIndex, 1)[0];
        save("campaigns.json", campaigns);
        res.json({ success: true, questId: removedQuest.id });
        if (typeof broadcastQuest === "function") {
            broadcastQuest(campaignId, { id: removedQuest.id, deleted: true });
        }
        return;
    }

    const newStatus = status === "completed" ? "Completed" : (status || campaign.quests[questIndex].status);
    campaign.quests[questIndex].status = newStatus;
    campaign.quests[questIndex].updated = new Date().toISOString();
    save("campaigns.json", campaigns);

    res.json({ success: true, quest: campaign.quests[questIndex] });
    if (typeof broadcastQuest === "function") {
        broadcastQuest(campaignId, campaign.quests[questIndex]);
    }
});

router.post("/:campaignId/quests/:questId/status", (req, res) => {
    const campaignId = parseInt(req.params.campaignId);
    const questId = parseInt(req.params.questId);
    const { action, userId } = req.body || {};

    if (!userId)
        return res.status(400).json({ error: "User ID required" });

    const campaigns = load("campaigns.json");
    const campaignIndex = campaigns.findIndex(c => c.id === campaignId);

    if (campaignIndex === -1)
        return res.status(404).json({ error: "Campaign not found" });

    const campaign = campaigns[campaignIndex];

    if (campaign.dmUserId !== userId)
        return res.status(403).json({ error: "Only the DM can update quests" });

    const questIndex = (campaign.quests || []).findIndex(q => q.id === questId);

    if (questIndex === -1)
        return res.status(404).json({ error: "Quest not found" });

    if (action === "abandon") {
        const removedQuest = campaign.quests.splice(questIndex, 1)[0];
        save("campaigns.json", campaigns);
        res.json({ success: true, questId: removedQuest.id });
        if (typeof broadcastQuest === "function") {
            broadcastQuest(campaignId, { id: removedQuest.id, deleted: true });
        }
        return;
    }

    if (action === "complete") {
        campaign.quests[questIndex].status = "Completed";
        campaign.quests[questIndex].updated = new Date().toISOString();
        save("campaigns.json", campaigns);
        res.json({ success: true, quest: campaign.quests[questIndex] });
        if (typeof broadcastQuest === "function") {
            broadcastQuest(campaignId, campaign.quests[questIndex]);
        }
        return;
    }

    res.status(400).json({ error: "Unknown quest action" });
});

// DELETE campaign (DM only)
router.delete("/:campaignId", (req, res) => {
    const campaignId = parseInt(req.params.campaignId);
    const { userId } = req.body;

    if (!userId)
        return res.status(400).json({ error: "User ID required" });

    const campaigns = load("campaigns.json");
    const campaignIndex = campaigns.findIndex(c => c.id === campaignId);

    if (campaignIndex === -1)
        return res.status(404).json({ error: "Campaign not found" });

    const campaign = campaigns[campaignIndex];

    // Only the DM can delete the campaign
    if (campaign.dmUserId !== userId)
        return res.status(403).json({ error: "Only the DM can delete this campaign" });

    // Remove the campaign
    campaigns.splice(campaignIndex, 1);
    save("campaigns.json", campaigns);

    res.json({ success: true, message: "Campaign deleted successfully" });
});

    return router;
}
