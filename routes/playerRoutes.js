const express = require("express");
const { load, save } = require("../utils/storage");

function findPlayerIndex(players, id) {
    return players.findIndex(p => p.id === id);
}

function normalizeDamageTypeList(input) {
    if (!input && input !== 0) return [];
    const source = Array.isArray(input)
        ? input
        : String(input).split(/[,;]+/);
    const cleaned = source
        .map(value => (value && typeof value === 'string') ? value.trim().toLowerCase() : '')
        .filter(Boolean);
    return [...new Set(cleaned)];
}

module.exports = function createPlayerRouter(broadcastCampaignEvent = () => {}) {
    const router = express.Router();

    function emitLevelEvent(campaignId, payload = {}) {
        if (!campaignId) return;
        broadcastCampaignEvent(campaignId, "level", {
            campaignId,
            ...payload
        });
    }

    // GET all players
    router.get("/", (req, res) => {
        const players = load("players.json");
        res.json(players);
    });

    // GET player by userId and campaignId
    router.get("/campaign/:campaignId/user/:userId", (req, res) => {
        const campaignId = parseInt(req.params.campaignId);
        const userId = parseInt(req.params.userId);

        const players = load("players.json");
        const player = players.find(p => p.campaignId === campaignId && p.userId === userId);

        if (!player)
            return res.status(404).json({ error: "Character not found" });

        res.json({ success: true, player });
    });

    // GET player by ID (for editing unassigned characters)
    router.get("/:id", (req, res) => {
        const id = parseInt(req.params.id);
        const players = load("players.json");
        const player = players.find(p => p.id === id);

        if (!player)
            return res.status(404).json({ error: "Character not found" });

        res.json({ success: true, player });
    });

    // ADD player (character)
    router.post("/", (req, res) => {
        const characterData = req.body;
        characterData.resistances = normalizeDamageTypeList(characterData.resistances);
        characterData.immunities = normalizeDamageTypeList(characterData.immunities);
        characterData.vulnerabilities = normalizeDamageTypeList(characterData.vulnerabilities);
        const { name, race, class: charClass, level, userId, campaignId } = characterData;

        // campaignId is now optional - characters can be created without a campaign
        if (!name || !race || !charClass || !level || !userId)
            return res.status(400).json({ error: "Missing required fields" });

        const players = load("players.json");

        // Generate unique ID (find the highest existing ID and add 1)
        const maxId = players.length > 0
            ? Math.max(...players.map(p => p.id))
            : 0;

        const newPlayer = {
            id: maxId + 1,
            ...characterData,
            class: charClass, // Ensure class is set correctly
            campaignId: campaignId || null, // Allow null campaignId
            created: new Date().toISOString()
        };

        players.push(newPlayer);
        save("players.json", players);

        res.json({ success: true, player: newPlayer });
    });

    // EDIT player (update character)
    router.put("/:id", (req, res) => {
        const id = parseInt(req.params.id);
        const characterData = req.body;
        characterData.resistances = normalizeDamageTypeList(characterData.resistances);
        characterData.immunities = normalizeDamageTypeList(characterData.immunities);
        characterData.vulnerabilities = normalizeDamageTypeList(characterData.vulnerabilities);

        const players = load("players.json");
        const playerIndex = findPlayerIndex(players, id);

        if (playerIndex === -1)
            return res.status(404).json({ error: "Character not found" });

        const player = players[playerIndex];

        // Update character while preserving id, userId, campaignId, and created date
        players[playerIndex] = {
            ...characterData,
            id: player.id,
            userId: player.userId,
            campaignId: player.campaignId,
            created: player.created
        };

        save("players.json", players);
        res.json({ success: true, player: players[playerIndex] });
    });

    // DELETE player
    router.delete("/:id", (req, res) => {
        const id = parseInt(req.params.id);

        let players = load("players.json");
        players = players.filter(p => p.id !== id);

        save("players.json", players);

        res.json({ success: true });
    });

    // DM can request a level-up for a specific character
    router.post("/:id/request-level", (req, res) => {
        const id = parseInt(req.params.id);
        const { campaignId, dmUserId } = req.body || {};

        if (!campaignId || !dmUserId) {
            return res.status(400).json({ error: "Campaign and DM are required" });
        }

        const players = load("players.json");
        const playerIndex = findPlayerIndex(players, id);
        if (playerIndex === -1) {
            return res.status(404).json({ error: "Character not found" });
        }

        const player = players[playerIndex];
        if (!player.campaignId || player.campaignId !== parseInt(campaignId)) {
            return res.status(400).json({ error: "Character is not part of this campaign" });
        }

        if (player.pendingLevelUp && player.pendingLevelUp.targetLevel > player.level) {
            return res.status(400).json({ error: "Level-up already pending" });
        }

        if ((player.level || 1) >= 20) {
            return res.status(400).json({ error: "Character has reached the maximum level" });
        }

        const campaigns = load("campaigns.json");
        const campaign = campaigns.find(c => c.id === player.campaignId);
        if (!campaign || campaign.dmUserId !== parseInt(dmUserId)) {
            return res.status(403).json({ error: "Only the campaign DM can request a level-up" });
        }

        const targetLevel = (player.level || 1) + 1;
        players[playerIndex] = {
            ...player,
            pendingLevelUp: {
                targetLevel,
                requestedBy: dmUserId,
                requestedAt: new Date().toISOString()
            }
        };

        save("players.json", players);
        emitLevelEvent(player.campaignId, {
            action: "requested",
            characterId: players[playerIndex].id,
            playerId: players[playerIndex].userId,
            character: players[playerIndex],
            initiatedBy: dmUserId
        });
        res.json({ success: true, player: players[playerIndex] });
    });

    // Player completes the pending level-up
    router.post("/:id/complete-level", (req, res) => {
        const id = parseInt(req.params.id);
        const { updates = {}, summary = {} } = req.body || {};
        const players = load("players.json");
        const playerIndex = findPlayerIndex(players, id);

        if (playerIndex === -1) {
            return res.status(404).json({ error: "Character not found" });
        }

        const player = players[playerIndex];
        if (!player.pendingLevelUp) {
            return res.status(400).json({ error: "No pending level-up request" });
        }

        const targetLevel = player.pendingLevelUp.targetLevel;
        if (parseInt(updates.level, 10) !== targetLevel) {
            return res.status(400).json({ error: "Level must match the approved request" });
        }

        if (targetLevel > 20) {
            return res.status(400).json({ error: "Invalid level" });
        }

        const mergedPlayer = {
            ...player,
            ...updates,
            abilities: updates.abilities || player.abilities,
            currentHp: updates.currentHp ?? updates.hp ?? player.currentHp,
            hp: updates.hp ?? player.hp,
            maxHp: updates.maxHp ?? player.maxHp,
            pendingLevelUp: null
        };

        const historyEntry = {
            fromLevel: player.level,
            toLevel: targetLevel,
            summary: summary || null,
            completedAt: new Date().toISOString()
        };

        mergedPlayer.levelUpHistory = Array.isArray(player.levelUpHistory)
            ? [...player.levelUpHistory, historyEntry]
            : [historyEntry];

        players[playerIndex] = mergedPlayer;
        save("players.json", players);
        emitLevelEvent(player.campaignId, {
            action: "completed",
            characterId: mergedPlayer.id,
            playerId: mergedPlayer.userId,
            character: mergedPlayer,
            initiatedBy: mergedPlayer.userId
        });
        res.json({ success: true, player: mergedPlayer });
    });

    return router;
};
