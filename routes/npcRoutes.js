const express = require("express");
const router = express.Router();
const { load, save } = require("../utils/storage");

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

// GET all NPCs
router.get("/", (req, res) => {
    const npcs = load("npcs.json");
    res.json(npcs);
});

// GET NPCs by campaign
router.get("/campaign/:campaignId", (req, res) => {
    const campaignId = parseInt(req.params.campaignId);
    const npcs = load("npcs.json");
    const campaignNpcs = npcs.filter(npc => npc.campaignId === campaignId);
    res.json({ success: true, npcs: campaignNpcs });
});

// GET single NPC
router.get("/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const npcs = load("npcs.json");
    const npc = npcs.find(n => n.id === id);

    if (!npc)
        return res.status(404).json({ error: "NPC not found" });

    res.json({ success: true, npc });
});

// ADD NPC
router.post("/", (req, res) => {
    const npcData = req.body;
    npcData.resistances = normalizeDamageTypeList(npcData.resistances);
    npcData.immunities = normalizeDamageTypeList(npcData.immunities);
    npcData.vulnerabilities = normalizeDamageTypeList(npcData.vulnerabilities);
    const { name, campaignId } = npcData;

    if (!name || !campaignId)
        return res.status(400).json({ error: "Missing required fields" });

    const npcs = load("npcs.json");

    // Generate unique ID
    const maxId = npcs.length > 0 ? Math.max(...npcs.map(n => n.id)) : 0;

    const newNpc = {
        id: maxId + 1,
        name: name,
        type: npcData.type || "Humanoid",
        campaignId: campaignId,
        hp: npcData.hp || 10,
        maxHp: npcData.maxHp || 10,
        ac: npcData.ac || 10,
        initiative: npcData.initiative || 0,
        stats: npcData.stats || {
            str: 10,
            dex: 10,
            con: 10,
            int: 10,
            wis: 10,
            cha: 10
        },
        resistances: npcData.resistances || [],
        immunities: npcData.immunities || [],
        vulnerabilities: npcData.vulnerabilities || [],
        notes: npcData.notes || "",
        created: new Date().toISOString()
    };

    npcs.push(newNpc);
    save("npcs.json", npcs);

    res.json({ success: true, npc: newNpc });
});

// UPDATE NPC
router.put("/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const npcData = req.body;
    npcData.resistances = normalizeDamageTypeList(npcData.resistances);
    npcData.immunities = normalizeDamageTypeList(npcData.immunities);
    npcData.vulnerabilities = normalizeDamageTypeList(npcData.vulnerabilities);

    const npcs = load("npcs.json");
    const npcIndex = npcs.findIndex(n => n.id === id);

    if (npcIndex === -1)
        return res.status(404).json({ error: "NPC not found" });

    const npc = npcs[npcIndex];

    // Update NPC while preserving id and created date
    npcs[npcIndex] = {
        ...npcData,
        id: npc.id,
        created: npc.created
    };

    save("npcs.json", npcs);
    res.json({ success: true, npc: npcs[npcIndex] });
});

// DELETE NPC
router.delete("/:id", (req, res) => {
    const id = parseInt(req.params.id);

    let npcs = load("npcs.json");
    npcs = npcs.filter(n => n.id !== id);

    save("npcs.json", npcs);

    res.json({ success: true });
});

module.exports = router;
