const express = require("express");
const router = express.Router();
const { load, save } = require("../utils/storage");
const PHYSICAL_DAMAGE_TYPES = new Set(['bludgeoning', 'piercing', 'slashing']);

function normalizeDamageTypeValue(value) {
    if (!value && value !== 0) return '';
    return String(value).trim().toLowerCase();
}

function extractDamageTypeSet(entity, key) {
    const source = entity?.[key];
    if (!source) return new Set();
    if (Array.isArray(source)) {
        return new Set(source.map(value => normalizeDamageTypeValue(value)).filter(Boolean));
    }
    if (typeof source === 'string') {
        return new Set(
            source.split(/[,;]+/)
                .map(value => normalizeDamageTypeValue(value))
                .filter(Boolean)
        );
    }
    return new Set();
}

function entityHasResistance(entity, damageType) {
    if (!entity || !damageType) return false;
    const normalizedType = normalizeDamageTypeValue(damageType);
    if (!normalizedType) return false;
    const resistances = extractDamageTypeSet(entity, 'resistances');
    if (resistances.size === 0) return false;
    if (resistances.has(normalizedType)) return true;
    if (PHYSICAL_DAMAGE_TYPES.has(normalizedType) && (resistances.has('physical') || resistances.has('nonmagical'))) {
        return true;
    }
    if (resistances.has('all')) return true;
    return false;
}

function entityHasImmunity(entity, damageType) {
    if (!entity || !damageType) return false;
    const normalizedType = normalizeDamageTypeValue(damageType);
    if (!normalizedType) return false;
    const immunities = extractDamageTypeSet(entity, 'immunities');
    if (immunities.size === 0) return false;
    if (immunities.has(normalizedType)) return true;
    if (PHYSICAL_DAMAGE_TYPES.has(normalizedType) && immunities.has('physical')) return true;
    if (immunities.has('all')) return true;
    return false;
}

function entityHasVulnerability(entity, damageType) {
    if (!entity || !damageType) return false;
    const normalizedType = normalizeDamageTypeValue(damageType);
    if (!normalizedType) return false;
    const vulnerabilities = extractDamageTypeSet(entity, 'vulnerabilities');
    if (vulnerabilities.size === 0) return false;
    if (vulnerabilities.has(normalizedType)) return true;
    if (PHYSICAL_DAMAGE_TYPES.has(normalizedType) && vulnerabilities.has('physical')) return true;
    if (vulnerabilities.has('all')) return true;
    return false;
}

function applyDamageModifiers(rawAmount, damageType, entity) {
    const normalizedType = normalizeDamageTypeValue(damageType);
    let amount = Number(rawAmount) || 0;
    const detail = {
        amount,
        raw: amount,
        damageType: normalizedType,
        immunity: false,
        vulnerability: false,
        resistance: false
    };
    if (amount <= 0 || !normalizedType) {
        return detail;
    }
    if (entityHasImmunity(entity, normalizedType)) {
        detail.amount = 0;
        detail.immunity = true;
        return detail;
    }
    if (entityHasVulnerability(entity, normalizedType)) {
        detail.amount = amount * 2;
        detail.vulnerability = true;
    }
    if (entityHasResistance(entity, normalizedType)) {
        detail.amount = Math.floor(detail.amount / 2);
        detail.resistance = true;
    }
    return detail;
}

function sumArrayValues(value) {
    if (Array.isArray(value)) {
        return value.reduce((sum, item) => sum + (Number(item) || 0), 0);
    }
    return Number(value) || 0;
}

function buildCombatSummary(encounter, players = []) {
    const playerMap = new Map();
    players.forEach(player => {
        if (player && typeof player.userId !== 'undefined') {
            playerMap.set(String(player.userId), player);
        }
    });

    const summary = {
        encounterId: encounter.id,
        campaignId: encounter.campaignId,
        rounds: encounter.round || encounter.currentRound || 1,
        totalParticipants: Array.isArray(encounter.participants) ? encounter.participants.length : 0,
        startedAt: encounter.created || null,
        endedAt: encounter.endedAt || new Date().toISOString(),
        generatedAt: new Date().toISOString(),
        durationSeconds: null,
        enemiesDefeated: 0,
        totalPlayerDamage: 0,
        totalPlayerHealing: 0,
        playerStats: [],
        topPerformers: {}
    };

    if (summary.startedAt && summary.endedAt) {
        const start = new Date(summary.startedAt).getTime();
        const end = new Date(summary.endedAt).getTime();
        if (!Number.isNaN(start) && !Number.isNaN(end)) {
            summary.durationSeconds = Math.max(0, Math.round((end - start) / 1000));
        }
    }

    const statsMap = new Map();

    function getPlayerStats(actorId, fallbackName = 'Unknown Hero') {
        const key = String(actorId);
        if (!statsMap.has(key)) {
            const playerRecord = playerMap.get(key);
            statsMap.set(key, {
                actorId,
                name: playerRecord?.name || fallbackName || 'Unknown Hero',
                totalDamage: 0,
                totalHealing: 0,
                hits: 0,
                misses: 0,
                attacks: 0,
                spellsCast: 0,
                defeats: 0
            });
        }
        return statsMap.get(key);
    }

    function addDamage(stats, amount) {
        const value = Math.max(0, Number(amount) || 0);
        stats.totalDamage += value;
        summary.totalPlayerDamage += value;
    }

    function addHealing(stats, amount) {
        const value = Math.max(0, Number(amount) || 0);
        stats.totalHealing += value;
        summary.totalPlayerHealing += value;
    }

    const logEntries = Array.isArray(encounter.combatLog) ? encounter.combatLog : [];
    logEntries.forEach(entry => {
        switch (entry.type) {
            case 'attack':
                if (entry.actorType === 'player') {
                    const stats = getPlayerStats(entry.actorId, entry.actorName);
                    stats.attacks++;
                    if (entry.isHit) {
                        stats.hits++;
                        addDamage(stats, entry.damage);
                    } else {
                        stats.misses++;
                    }
                }
                break;
            case 'spell':
                if (entry.actorType === 'player') {
                    const stats = getPlayerStats(entry.actorId, entry.actorName);
                    stats.spellsCast++;
                    const damage = sumArrayValues(entry.damage);
                    const healing = sumArrayValues(entry.healing);
                    if (damage > 0) addDamage(stats, damage);
                    if (healing > 0) addHealing(stats, healing);
                }
                break;
            case 'item':
                if (entry.actorType === 'player') {
                    const stats = getPlayerStats(entry.actorId, entry.actorName);
                    if (entry.itemEffect === 'damage' && entry.damageAmount) {
                        addDamage(stats, entry.damageAmount);
                    } else if (entry.itemEffect === 'healing' && entry.healAmount) {
                        addHealing(stats, entry.healAmount);
                    }
                }
                break;
            case 'defeat':
                if (entry.actorType === 'player') {
                    const stats = getPlayerStats(entry.actorId, entry.actorName);
                    stats.defeats++;
                }
                if (entry.targetType === 'npc') {
                    summary.enemiesDefeated++;
                }
                break;
            default:
                break;
        }
    });

    const statsList = Array.from(statsMap.values()).map(stats => {
        const attempts = stats.hits + stats.misses;
        return {
            ...stats,
            accuracy:
                attempts > 0
                    ? Number((stats.hits / attempts).toFixed(2))
                    : null
        };
    }).sort((a, b) => b.totalDamage - a.totalDamage);

    function pickTop(statKey, { mode = 'max', filter = () => true } = {}) {
        const filtered = statsList.filter(filter);
        if (!filtered.length) return null;
        let best = filtered[0];
        filtered.forEach(candidate => {
            const a = best[statKey] || 0;
            const b = candidate[statKey] || 0;
            if (mode === 'min') {
                if (b < a) best = candidate;
            } else {
                if (b > a) best = candidate;
            }
        });
        if (!best || (best[statKey] || 0) <= 0 && mode !== 'min') return null;
        return {
            actorId: best.actorId,
            name: best.name,
            value: best[statKey]
        };
    }

    summary.playerStats = statsList;
    summary.topPerformers = {
        mostDamage: pickTop('totalDamage'),
        mostHealing: pickTop('totalHealing'),
        mostDefeats: pickTop('defeats'),
        mostHits: pickTop('hits'),
        leastMisses: pickTop('misses', { mode: 'min', filter: player => (player.hits + player.misses) > 0 }),
        bestAccuracy: pickTop('accuracy', { filter: player => typeof player.accuracy === 'number' })
    };

    return summary;
}

function getParticipantHp(participant) {
    if (!participant) return 0;
    if (typeof participant.currentHp === "number") return participant.currentHp;
    const parsedCurrent = Number(participant.currentHp);
    if (!Number.isNaN(parsedCurrent)) return parsedCurrent;
    if (typeof participant.maxHp === "number") return participant.maxHp;
    const parsedMax = Number(participant.maxHp);
    if (!Number.isNaN(parsedMax)) return parsedMax;
    if (typeof participant.hp === "number") return participant.hp;
    const parsedHp = Number(participant.hp);
    return Number.isNaN(parsedHp) ? 0 : parsedHp;
}

function isParticipantAlive(participant) {
    if (!participant) return false;
    if (participant.type === "player") {
        // Players at 0 HP may still need to take death saves; only treat as defeated if explicitly flagged
        return !participant.defeated;
    }
    return getParticipantHp(participant) > 0 && !participant.defeated;
}

function resetActionEconomy(participant) {
    if (!participant) return;
    participant.actionUsed = false;
    participant.bonusActionUsed = false;
    participant.movementUsed = 0;
}

function stepTurnForward(encounter) {
    if (!encounter.participants || encounter.participants.length === 0) {
        encounter.currentTurn = 0;
        return null;
    }
    encounter.currentTurn++;
    if (encounter.currentTurn >= encounter.participants.length) {
        encounter.currentTurn = 0;
        encounter.round++;
        encounter.participants.forEach(p => {
            p.reactionUsed = false;
        });
    }
    return encounter.participants[encounter.currentTurn] || null;
}

function advanceToNextLivingParticipant(encounter) {
    if (!encounter.participants || encounter.participants.length === 0) return;
    const total = encounter.participants.length;
    for (let i = 0; i < total; i++) {
        const candidate = stepTurnForward(encounter);
        if (!candidate) return;
        if (isParticipantAlive(candidate)) {
            resetActionEconomy(candidate);
            return;
        }
    }
    encounter.currentTurn = 0;
}

function ensureCurrentParticipantIsAlive(encounter) {
    if (!encounter.participants || encounter.participants.length === 0) return;
    const current = encounter.participants[encounter.currentTurn];
    if (current && isParticipantAlive(current)) return;
    const total = encounter.participants.length;
    for (let i = 0; i < total; i++) {
        const candidate = stepTurnForward(encounter);
        if (!candidate) return;
        if (isParticipantAlive(candidate)) {
            resetActionEconomy(candidate);
            return;
        }
    }
    encounter.currentTurn = 0;
}

function handleNpcDefeat(encounter, target, targetName, killerInfo = {}) {
    if (!target || target.type !== "npc") return;
    if (target.defeated) return;

    target.currentHp = 0;
    target.defeated = true;

    if (!encounter.combatLog) encounter.combatLog = [];
    const killerName = killerInfo.name || "Unknown hero";
    const victimName = targetName || "an enemy";

    encounter.combatLog.push({
        round: encounter.round,
        type: "defeat",
        actorId: killerInfo.id || null,
        actorType: killerInfo.type || null,
        actorName: killerName,
        targetId: target.id,
        targetType: target.type,
        targetName: victimName,
        message: `${killerName} defeats ${victimName}!`,
        timestamp: new Date().toISOString()
    });

    ensureCurrentParticipantIsAlive(encounter);
}

// GET active encounter for a campaign
router.get("/campaign/:campaignId/active", (req, res) => {
    const campaignId = parseInt(req.params.campaignId);
    const encounters = load("encounters.json");

    const activeEncounter = encounters.find(e =>
        e.campaignId === campaignId && e.status === 'active'
    );

    if (!activeEncounter) {
        const completed = encounters
            .filter(e => e.campaignId === campaignId && e.status === 'completed' && e.lastSummary)
            .sort((a, b) => {
                const aTime = new Date(a.lastSummary?.endedAt || a.endedAt || a.created || 0).getTime();
                const bTime = new Date(b.lastSummary?.endedAt || b.endedAt || b.created || 0).getTime();
                return bTime - aTime;
            });
        const latestSummary = completed.length
            ? { encounterId: completed[0].id, summary: completed[0].lastSummary }
            : null;
        return res.json({ success: true, encounter: null, lastSummary: latestSummary });
    }

    res.json({ success: true, encounter: activeEncounter, lastSummary: null });
});

// START new encounter
router.post("/start", (req, res) => {
    const { campaignId, dmUserId } = req.body;

    if (!campaignId || !dmUserId)
        return res.status(400).json({ error: "Missing required fields" });

    const encounters = load("encounters.json");

    // Check if there's already an active encounter
    const existing = encounters.find(e =>
        e.campaignId === campaignId && e.status === 'active'
    );

    if (existing) {
        return res.status(400).json({ error: "An encounter is already active" });
    }

    // Generate unique ID
    const maxId = encounters.length > 0 ? Math.max(...encounters.map(e => e.id)) : 0;

    const newEncounter = {
        id: maxId + 1,
        campaignId: campaignId,
        dmUserId: dmUserId,
        status: 'active',
        round: 1,
        currentTurn: 0,
        participants: [],
        initiativeRolls: {},
        combatLog: [], // Track all actions in combat
        created: new Date().toISOString()
    };

    encounters.push(newEncounter);
    save("encounters.json", encounters);

    res.json({ success: true, encounter: newEncounter });
});

// ADD participant to encounter (NPC)
router.post("/:encounterId/participant", (req, res) => {
    const encounterId = parseInt(req.params.encounterId);
    const { npcId, initiative, hidden } = req.body;

    const encounters = load("encounters.json");
    const encounterIndex = encounters.findIndex(e => e.id === encounterId);

    if (encounterIndex === -1)
        return res.status(404).json({ error: "Encounter not found" });

    const encounter = encounters[encounterIndex];

    // Get NPC max HP to initialize current HP
    const npcs = load("npcs.json");
    const npc = npcs.find(n => n.id === npcId);
    const maxHp = npc ? (npc.maxHp ?? npc.maxHP ?? npc.hp ?? 10) : 10;

    // Add NPC to participants
    encounter.participants.push({
        type: 'npc',
        id: npcId,
        initiative: initiative || 10,
        hidden: hidden || false,
        currentHp: maxHp, // Initialize current HP to max
        maxHp: maxHp,
        actionUsed: false,
        bonusActionUsed: false,
        reactionUsed: false,
        movementUsed: 0
    });

    // Sort participants by initiative (highest first)
    encounter.participants.sort((a, b) => b.initiative - a.initiative);

    save("encounters.json", encounters);

    res.json({ success: true, encounter: encounters[encounterIndex] });
});

// SUBMIT initiative roll (from player)
router.post("/:encounterId/initiative", (req, res) => {
    const encounterId = parseInt(req.params.encounterId);
    const { userId, roll, modifier, total } = req.body;

    if (!userId || roll === undefined || total === undefined)
        return res.status(400).json({ error: "Missing required fields" });

    const encounters = load("encounters.json");
    const encounterIndex = encounters.findIndex(e => e.id === encounterId);

    if (encounterIndex === -1)
        return res.status(404).json({ error: "Encounter not found" });

    const encounter = encounters[encounterIndex];

    // Store the initiative roll
    encounter.initiativeRolls[userId] = {
        roll: roll,
        modifier: modifier || 0,
        total: total,
        timestamp: new Date().toISOString()
    };

    // Get player max HP to initialize current HP
    const players = load("players.json");
    const player = players.find(p => p.userId === userId);
    const maxHp = player ? (player.maxHp ?? player.maxHP ?? player.hp ?? 10) : 10;

    // Check if this player is already in participants
    const existingIndex = encounter.participants.findIndex(
        p => p.type === 'player' && p.id === userId
    );

    if (existingIndex >= 0) {
        // Update existing participant
        encounter.participants[existingIndex].initiative = total;
        // Initialize currentHp if not set
        if (encounter.participants[existingIndex].currentHp === undefined) {
            encounter.participants[existingIndex].currentHp = maxHp;
        }
        if (encounter.participants[existingIndex].maxHp === undefined) {
            encounter.participants[existingIndex].maxHp = maxHp;
        }
    } else {
        // Add new participant
        encounter.participants.push({
            type: 'player',
            id: userId,
            initiative: total,
            currentHp: maxHp, // Initialize current HP to max
            maxHp: maxHp,
            actionUsed: false,
            bonusActionUsed: false,
            reactionUsed: false,
            movementUsed: 0
        });
    }

    // Sort participants by initiative (highest first)
    encounter.participants.sort((a, b) => b.initiative - a.initiative);

    save("encounters.json", encounters);

    res.json({ success: true, encounter: encounters[encounterIndex] });
});

// UPDATE participant HP
router.put("/:encounterId/participant/:participantId/hp", (req, res) => {
    const encounterId = parseInt(req.params.encounterId);
    const participantId = parseInt(req.params.participantId);
    const { hp, type, defeated, deathFails, deathSuccesses } = req.body;

    console.log('HP Update Request:', { encounterId, participantId, hp, type });

    if (hp === undefined || !type)
        return res.status(400).json({ error: "Missing required fields" });

    const encounters = load("encounters.json");
    const encounterIndex = encounters.findIndex(e => e.id === encounterId);

    if (encounterIndex === -1) {
        console.log('Encounter not found:', encounterId);
        return res.status(404).json({ error: "Encounter not found" });
    }

    const encounter = encounters[encounterIndex];

    // Find the participant
    const participant = encounter.participants.find(
        p => p.id === participantId && p.type === type
    );

    if (!participant) {
        console.log('Participant not found:', participantId, type);
        console.log('Available participants:', encounter.participants);
        return res.status(404).json({ error: "Participant not found" });
    }

    // Store current HP in the encounter participant, NOT in player/NPC stat sheet
    const participantIndex = encounter.participants.findIndex(
        p => p.id === participantId && p.type === type
    );

    if (participantIndex >= 0) {
        // Update HP in the encounter participant data
        encounter.participants[participantIndex].currentHp = hp;
        const isNpc = type === 'npc';
        const isPlayer = type === 'player';

        if (isNpc && hp <= 0) {
            encounter.participants[participantIndex].currentHp = 0;
            encounter.participants[participantIndex].defeated = true;
        } else if (isNpc) {
            encounter.participants[participantIndex].defeated = false;
        }

        if (isPlayer) {
            if (typeof deathFails === 'number') {
                encounter.participants[participantIndex].deathFails = Math.max(0, Math.min(3, parseInt(deathFails, 10)));
            }
            if (typeof deathSuccesses === 'number') {
                encounter.participants[participantIndex].deathSuccesses = Math.max(0, Math.min(3, parseInt(deathSuccesses, 10)));
            }
            if (defeated === true || (hp <= 0 && (encounter.participants[participantIndex].deathFails || 0) >= 3)) {
                encounter.participants[participantIndex].defeated = true;
            } else if (hp > 0 || defeated === false) {
                encounter.participants[participantIndex].defeated = false;
            }
        }

        console.log(`Updated ${type} (${participantId}) HP in encounter to:`, hp, 'defeated:', encounter.participants[participantIndex].defeated);
    }

    // NPCs: Combat HP is stored in encounter data only
    // DO NOT modify npcs.json during combat - stat sheets should remain unchanged
    console.log(`Combat HP update complete. Type: ${type}, ID: ${participantId}, Current HP: ${hp}`);

    save("encounters.json", encounters);

    ensureCurrentParticipantIsAlive(encounters[encounterIndex]);

    res.json({ success: true, encounter: encounters[encounterIndex] });
});

// NEXT turn
router.post("/:encounterId/next-turn", (req, res) => {
    const encounterId = parseInt(req.params.encounterId);

    const encounters = load("encounters.json");
    const encounterIndex = encounters.findIndex(e => e.id === encounterId);

    if (encounterIndex === -1)
        return res.status(404).json({ error: "Encounter not found" });

    const encounter = encounters[encounterIndex];

    if (!encounter.participants || encounter.participants.length === 0) {
        return res.status(400).json({ error: "No participants in encounter" });
    }

    advanceToNextLivingParticipant(encounter);

    save("encounters.json", encounters);

    res.json({ success: true, encounter: encounters[encounterIndex] });
});

// Helper function to calculate ability modifier
function getAbilityModifier(abilityScore) {
    return Math.floor((abilityScore - 10) / 2);
}

// Helper function to get weapon ability modifier based on weapon type
function getWeaponAbilityModifier(weaponType, stats) {
    const str = stats.strength || 10;
    const dex = stats.dexterity || 10;
    const strMod = getAbilityModifier(str);
    const dexMod = getAbilityModifier(dex);

    if (weaponType === 'finesse') {
        return Math.max(strMod, dexMod);
    } else if (weaponType === 'ranged') {
        return dexMod;
    } else if (weaponType === 'thrown') {
        return strMod;
    } else {
        // Default to STR for melee weapons
        return strMod;
    }
}

// ATTACK action
router.post("/:encounterId/action/attack", (req, res) => {
    const encounterId = parseInt(req.params.encounterId);
    let { actorId, actorType, targetId, targetType, attackRoll, damage, damageType, weaponName, actionType, attackBonus, isCrit, rageBonus } = req.body;
    let resolvedDamageType = normalizeDamageTypeValue(damageType);
    const parsedRageBonus = Number(rageBonus) || 0;

    const encounters = load("encounters.json");
    const encounterIndex = encounters.findIndex(e => e.id === encounterId);

    if (encounterIndex === -1)
        return res.status(404).json({ error: "Encounter not found" });

    const encounter = encounters[encounterIndex];

    // Find actor participant
    const actor = encounter.participants.find(p => p.id === actorId && p.type === actorType);
    if (!actor) return res.status(404).json({ error: "Actor not found" });

    // Check if action is available
    if (actionType === 'action' && actor.actionUsed) {
        return res.status(400).json({ error: "Action already used this turn" });
    }
    if (actionType === 'bonus' && actor.bonusActionUsed) {
        return res.status(400).json({ error: "Bonus action already used this turn" });
    }

    // Mark action as used
    if (actionType === 'action') actor.actionUsed = true;
    if (actionType === 'bonus') actor.bonusActionUsed = true;

    // Get actor and target names
    const players = load("players.json");
    const npcs = load("npcs.json");

    let actorName = 'Unknown';
    let actorNPC = null;
    if (actorType === 'player') {
        const player = players.find(p => p.userId === actorId);
        actorName = player ? player.name : 'Unknown Player';
    } else {
        actorNPC = npcs.find(n => n.id === actorId);
        actorName = actorNPC ? actorNPC.name : 'Unknown NPC';

        // If NPC has equipped weapon, use its stats
        if (actorNPC && actorNPC.inventory && Array.isArray(actorNPC.inventory)) {
            const equippedWeapon = actorNPC.inventory.find(item => item.type === 'weapon' && item.equipped);
            if (equippedWeapon) {
                weaponName = equippedWeapon.name;
                resolvedDamageType = normalizeDamageTypeValue(equippedWeapon.damageType) || 'bludgeoning';

                // Calculate ability modifier based on weapon type
                const abilityMod = getWeaponAbilityModifier(equippedWeapon.weaponType || 'melee', actorNPC.stats || {});

                // Recalculate attack bonus: weapon's attack bonus + ability modifier
                attackBonus = (equippedWeapon.attackBonus || 0) + abilityMod;

                console.log(`NPC ${actorName} using equipped weapon: ${weaponName}, type: ${equippedWeapon.weaponType}, ability mod: ${abilityMod}, attack bonus: ${attackBonus}`);
            }
        }
    }

    let targetName = 'Unknown';
    let targetAC = 10; // Default AC
    let targetNPC = null;
    let targetPlayer = null;
    if (targetType === 'player') {
        const player = players.find(p => p.userId === targetId);
        targetPlayer = player || null;
        targetName = player ? player.name : 'Unknown Player';
        targetAC = player ? (player.ac || 10) : 10;
    } else {
        targetNPC = npcs.find(n => n.id === targetId);
        targetName = targetNPC ? targetNPC.name : 'Unknown NPC';
        targetAC = targetNPC ? (targetNPC.ac || 10) : 10;

        // If target NPC has equipped armor, add its AC bonus
        if (targetNPC && targetNPC.inventory && Array.isArray(targetNPC.inventory)) {
            const equippedArmor = targetNPC.inventory.find(item => item.type === 'armor' && item.equipped);
            if (equippedArmor && equippedArmor.acBonus) {
                targetAC = equippedArmor.acBonus;
                console.log(`Target NPC ${targetName} has equipped armor: ${equippedArmor.name}, AC: ${targetAC}`);
            }
        }
    }

    // Check if attack hits (attack roll + bonus >= target AC)
    const totalAttack = attackRoll + attackBonus;
    const isHit = totalAttack >= targetAC || isCrit; // Crits always hit

    const baseDamage = Number(damage) || 0;
    const totalBaseDamage = baseDamage + parsedRageBonus;
    const finalDamageType = resolvedDamageType || 'physical';

    // Apply damage to target only if hit
    const target = encounter.participants.find(p => p.id === targetId && p.type === targetType);
    let appliedDamage = 0;
    const damageAdjustments = [];
    if (target && isHit && totalBaseDamage > 0) {
        const previousHp = getParticipantHp(target);
        const receiver = targetType === 'player' ? targetPlayer : targetNPC;
        const modifier = applyDamageModifiers(totalBaseDamage, finalDamageType, receiver);
        appliedDamage = modifier.amount;
        if ((modifier.immunity || modifier.vulnerability || modifier.resistance) && targetName) {
            damageAdjustments.push({
                targetName,
                raw: modifier.raw,
                adjusted: modifier.amount,
                damageType: modifier.damageType,
                immunity: modifier.immunity,
                vulnerability: modifier.vulnerability,
                resistance: modifier.resistance
            });
        }
        target.currentHp = Math.max(0, previousHp - appliedDamage);
        if (target.maxHp === undefined) {
            target.maxHp = targetNPC ? (targetNPC.maxHp || targetNPC.hp || previousHp) : previousHp;
        }
        console.log(`Applied ${appliedDamage} damage to ${targetName}. New HP: ${target.currentHp}`);
        if (targetType === 'npc' && previousHp > 0 && target.currentHp <= 0) {
            handleNpcDefeat(encounter, target, targetName, { id: actorId, type: actorType, name: actorName });
        }
    }

    // Add to combat log
    if (!encounter.combatLog) encounter.combatLog = [];
    encounter.combatLog.push({
        round: encounter.round,
        type: 'attack',
        actorId, actorType, actorName,
        targetId, targetType, targetName,
        weaponName,
        attackRoll,
        attackBonus,
        totalAttack,
        targetAC,
        isHit,
        damage: isHit ? appliedDamage : 0,
        rawDamage: totalBaseDamage,
        damageType: finalDamageType,
        resisted: isHit ? (damageAdjustments.some(detail => detail.resistance || detail.immunity || detail.vulnerability)) : false,
        damageAdjustments,
        isCrit,
        timestamp: new Date().toISOString()
    });

    save("encounters.json", encounters);

    res.json({ success: true, encounter: encounters[encounterIndex] });
});

// SPELL action
router.post("/:encounterId/action/spell", (req, res) => {
    const encounterId = parseInt(req.params.encounterId);
    const { actorId, actorType, targetIds, targetTypes, spellName, spellLevel, damage, damageType, healing, actionType, saveDC, saveType } = req.body;
    const finalDamageType = normalizeDamageTypeValue(damageType);

    const encounters = load("encounters.json");
    const encounterIndex = encounters.findIndex(e => e.id === encounterId);

    if (encounterIndex === -1)
        return res.status(404).json({ error: "Encounter not found" });

    const encounter = encounters[encounterIndex];

    // Find actor participant
    const actor = encounter.participants.find(p => p.id === actorId && p.type === actorType);
    if (!actor) return res.status(404).json({ error: "Actor not found" });

    // Check if action is available
    if (actionType === 'action' && actor.actionUsed) {
        return res.status(400).json({ error: "Action already used this turn" });
    }
    if (actionType === 'bonus' && actor.bonusActionUsed) {
        return res.status(400).json({ error: "Bonus action already used this turn" });
    }

    // Mark action as used
    if (actionType === 'action') actor.actionUsed = true;
    if (actionType === 'bonus') actor.bonusActionUsed = true;

    // Get names
    const players = load("players.json");
    const npcs = load("npcs.json");

    let actorName = 'Unknown';
    if (actorType === 'player') {
        const player = players.find(p => p.userId === actorId);
        actorName = player ? player.name : 'Unknown Player';
    } else {
        const npc = npcs.find(n => n.id === actorId);
        actorName = npc ? npc.name : 'Unknown NPC';
    }

    // Apply effects to targets
    const targetNames = [];
    const adjustedDamageByTarget = [];
    const resistedTargetNames = [];
    const resistedFlags = [];
    const damageAdjustments = [];
    const damageModifiersByIndex = [];
    let hasDamageEntries = false;
    const rawDamageTracker = Array.isArray(damage)
        ? damage.map(value => Number(value) || 0)
        : (damage !== undefined && damage !== null ? Number(damage) || 0 : 0);
    if (targetIds && targetIds.length > 0) {
        targetIds.forEach((targetId, index) => {
            const targetType = targetTypes[index];
            const target = encounter.participants.find(p => p.id === targetId && p.type === targetType);

            if (target) {
                const previousHp = getParticipantHp(target);
                const pool = targetType === 'player'
                    ? players.find(p => p.userId === targetId)
                    : npcs.find(n => n.id === targetId);
                const baseDamage = Array.isArray(damage)
                    ? Number(damage[index]) || 0
                    : Number(damage) || 0;
                if (baseDamage > 0) {
                    hasDamageEntries = true;
                    const modifier = applyDamageModifiers(baseDamage, finalDamageType, pool);
                    adjustedDamageByTarget[index] = modifier.amount;
                    resistedFlags[index] = modifier.immunity || modifier.vulnerability || modifier.resistance;
                    damageModifiersByIndex[index] = modifier;
                    target.currentHp = Math.max(0, previousHp - modifier.amount);
                }
                if (healing && healing[index]) {
                    const maxValue = target.maxHp || pool?.maxHp || pool?.hp || previousHp || 999;
                    target.maxHp = target.maxHp || maxValue;
                    target.currentHp = Math.min((target.currentHp || previousHp) + healing[index], maxValue || 999);
                }

                // Get target name
                let targetName = 'Unknown';
                if (targetType === 'player') {
                    const player = players.find(p => p.userId === targetId);
                    targetName = player ? player.name : 'Unknown Player';
                } else {
                    const npc = npcs.find(n => n.id === targetId);
                    targetName = npc ? npc.name : 'Unknown NPC';
                    if (target && target.maxHp === undefined && npc) {
                        target.maxHp = npc.maxHp || npc.hp || previousHp;
                    }
                }
                targetNames.push(targetName);

                if (resistedFlags[index] && targetName) {
                    resistedTargetNames.push(targetName);
                    const modifier = damageModifiersByIndex[index];
                    damageAdjustments.push({
                        targetName,
                        raw: modifier?.raw ?? baseDamage,
                        adjusted: modifier?.amount ?? adjustedDamageByTarget[index],
                        damageType: modifier?.damageType || finalDamageType || '',
                        immunity: !!modifier?.immunity,
                        vulnerability: !!modifier?.vulnerability,
                        resistance: !!modifier?.resistance && !modifier?.immunity
                    });
                }

                if (targetType === 'npc' && baseDamage > 0 && previousHp > 0 && target.currentHp <= 0) {
                    handleNpcDefeat(encounter, target, targetName, { id: actorId, type: actorType, name: actorName });
                }
            }
        });
    }

    const damageLogEntry = hasDamageEntries ? adjustedDamageByTarget : damage;

    // Add to combat log
    if (!encounter.combatLog) encounter.combatLog = [];
    encounter.combatLog.push({
        round: encounter.round,
        type: 'spell',
        actorId, actorType, actorName,
        spellName,
        spellLevel,
        targetNames,
        damage: damageLogEntry,
        rawDamage: rawDamageTracker,
        damageType: finalDamageType || null,
        healing,
        saveDC,
        saveType,
        resistedTargets: resistedTargetNames,
        damageAdjustments,
        timestamp: new Date().toISOString()
    });

    save("encounters.json", encounters);

    res.json({ success: true, encounter: encounters[encounterIndex] });
});

// OTHER action (Dash, Disengage, Dodge, Help, Hide, Ready, Search, Use Object, etc.)
router.post("/:encounterId/action/other", (req, res) => {
    const encounterId = parseInt(req.params.encounterId);
    const { actorId, actorType, actionName, actionType, description } = req.body;

    const encounters = load("encounters.json");
    const encounterIndex = encounters.findIndex(e => e.id === encounterId);

    if (encounterIndex === -1)
        return res.status(404).json({ error: "Encounter not found" });

    const encounter = encounters[encounterIndex];

    // Find actor participant
    const actor = encounter.participants.find(p => p.id === actorId && p.type === actorType);
    if (!actor) return res.status(404).json({ error: "Actor not found" });

    // Check if action is available
    if (actionType === 'action' && actor.actionUsed) {
        return res.status(400).json({ error: "Action already used this turn" });
    }
    if (actionType === 'bonus' && actor.bonusActionUsed) {
        return res.status(400).json({ error: "Bonus action already used this turn" });
    }

    // Mark action as used
    if (actionType === 'action') actor.actionUsed = true;
    if (actionType === 'bonus') actor.bonusActionUsed = true;

    // Get actor name
    const players = load("players.json");
    const npcs = load("npcs.json");

    let actorName = 'Unknown';
    if (actorType === 'player') {
        const player = players.find(p => p.userId === actorId);
        actorName = player ? player.name : 'Unknown Player';
    } else {
        const npc = npcs.find(n => n.id === actorId);
        actorName = npc ? npc.name : 'Unknown NPC';
    }

    // Add to combat log
    if (!encounter.combatLog) encounter.combatLog = [];
    encounter.combatLog.push({
        round: encounter.round,
        type: 'other',
        actorId, actorType, actorName,
        actionName,
        description,
        timestamp: new Date().toISOString()
    });

    save("encounters.json", encounters);

    res.json({ success: true, encounter: encounters[encounterIndex] });
});

// END TURN (player/DM manually ending turn)
router.post("/:encounterId/end-turn", (req, res) => {
    const encounterId = parseInt(req.params.encounterId);

    const encounters = load("encounters.json");
    const encounterIndex = encounters.findIndex(e => e.id === encounterId);

    if (encounterIndex === -1)
        return res.status(404).json({ error: "Encounter not found" });

    const encounter = encounters[encounterIndex];

    if (!encounter.participants || encounter.participants.length === 0) {
        return res.status(400).json({ error: "No participants in encounter" });
    }

    advanceToNextLivingParticipant(encounter);

    save("encounters.json", encounters);

    res.json({ success: true, encounter: encounters[encounterIndex] });
});

// USE ITEM action
router.post("/:encounterId/action/use-item", (req, res) => {
    const encounterId = parseInt(req.params.encounterId);
    const {
        actorId,
        actorType,
        itemName,
        itemType,
        itemEffect,
        effectDescription,
        effectDice,
        effectDamageType,
        healAmount,
        healBreakdown,
        damageAmount,
        targetId,
        targetType,
        actionType
    } = req.body;
    const finalEffectDamageType = normalizeDamageTypeValue(effectDamageType) || '';
    const rawDamageAmount = Number(damageAmount) || 0;

    const encounters = load("encounters.json");
    const encounterIndex = encounters.findIndex(e => e.id === encounterId);

    if (encounterIndex === -1)
        return res.status(404).json({ error: "Encounter not found" });

    const encounter = encounters[encounterIndex];
    const npcs = load("npcs.json");
    const players = load("players.json");

    // Find the actor
    const actor = encounter.participants.find(p => p.id === actorId && p.type === actorType);
    if (!actor)
        return res.status(404).json({ error: "Actor not found in encounter" });

    // Check if action is available
    if (actionType === 'action' && actor.actionUsed) {
        return res.status(400).json({ error: "Action already used this turn" });
    }
    if (actionType === 'bonus' && actor.bonusActionUsed) {
        return res.status(400).json({ error: "Bonus action already used this turn" });
    }

    // Mark action as used
    if (actionType === 'action') {
        actor.actionUsed = true;
    } else if (actionType === 'bonus') {
        actor.bonusActionUsed = true;
    }

    // Get actor name
    let actorName = 'Unknown';
    if (actorType === 'npc') {
        const npc = npcs.find(n => n.id === actorId);
        if (npc) actorName = npc.name;
    } else if (actorType === 'player') {
        const character = players.find(c => c.userId === actorId);
        if (character) actorName = character.name;
    }

    // Apply item effect
    let targetName = 'Unknown';
    if (itemEffect === 'healing' && targetId && targetType) {
        const target = encounter.participants.find(p => p.id === targetId && p.type === targetType);
        if (target) {
            const oldHP = getParticipantHp(target);
            const pool = targetType === 'npc'
                ? npcs.find(n => n.id === targetId)
                : players.find(c => c.userId === targetId);
            const maxValue = target.maxHp || pool?.maxHp || pool?.hp || oldHP + (healAmount || 0);
            target.maxHp = target.maxHp || maxValue;
            target.currentHp = Math.min(oldHP + (healAmount || 0), maxValue || (oldHP + (healAmount || 0)));

            // Get target name
            if (targetType === 'npc') {
                targetName = pool ? pool.name : targetName;
            } else if (targetType === 'player') {
                targetName = pool ? pool.name : targetName;
            }
        }
    }
    const resistedTargets = [];
    const damageAdjustments = [];
    let finalDamageAmount = rawDamageAmount;
    if (itemEffect === 'damage' && targetId && targetType) {
        const target = encounter.participants.find(p => p.id === targetId && p.type === targetType);
        if (target) {
            const oldHP = getParticipantHp(target);
            const pool = targetType === 'player'
                ? players.find(c => c.userId === targetId)
                : npcs.find(n => n.id === targetId);
            const modifier = applyDamageModifiers(damageAmount || 0, finalEffectDamageType, pool);
            finalDamageAmount = modifier.amount;
            target.currentHp = Math.max(0, oldHP - finalDamageAmount);
            if (targetType === 'npc') {
                if (pool) {
                    targetName = pool.name;
                    if (target.maxHp === undefined) {
                        target.maxHp = pool.maxHp || pool.hp || oldHP;
                    }
                }
            } else if (targetType === 'player') {
                if (pool) targetName = pool.name;
            }
            if ((modifier.immunity || modifier.vulnerability || modifier.resistance) && targetName) {
                resistedTargets.push(targetName);
                damageAdjustments.push({
                    targetName,
                    raw: modifier.raw,
                    adjusted: modifier.amount,
                    damageType: modifier.damageType || finalEffectDamageType || '',
                    immunity: !!modifier.immunity,
                    vulnerability: !!modifier.vulnerability,
                    resistance: !!modifier.resistance && !modifier.immunity
                });
            }
            if (targetType === 'npc' && oldHP > 0 && target.currentHp <= 0) {
                handleNpcDefeat(encounter, target, targetName, { id: actorId, type: actorType, name: actorName });
            }
        }
    }

    // Log to combat log
    encounter.combatLog.push({
        round: encounter.round,
        type: 'item',
        actorId,
        actorType,
        actorName,
        itemName,
        itemType,
        itemEffect,
        effectDescription: effectDescription || '',
        effectDice: effectDice || '',
        effectDamageType: finalEffectDamageType || '',
        healAmount: healAmount || 0,
        healBreakdown: healBreakdown || '',
        damageAmount: finalDamageAmount || 0,
        rawDamageAmount: rawDamageAmount || 0,
        targetId,
        targetType,
        targetName,
        resistedTargets,
        damageAdjustments,
        timestamp: new Date().toISOString()
    });

    save("encounters.json", encounters);

    res.json({ success: true, encounter: encounters[encounterIndex] });
});

// END encounter
router.post("/:encounterId/end", (req, res) => {
    const encounterId = parseInt(req.params.encounterId);

    const encounters = load("encounters.json");
    const encounterIndex = encounters.findIndex(e => e.id === encounterId);

    if (encounterIndex === -1)
        return res.status(404).json({ error: "Encounter not found" });

    const encounter = encounters[encounterIndex];
    encounter.status = 'completed';
    encounter.endedAt = new Date().toISOString();

    const players = load("players.json");
    encounter.lastSummary = buildCombatSummary(encounter, players);

    save("encounters.json", encounters);

    res.json({ success: true, summary: encounter.lastSummary });
});

// DELETE encounter
router.delete("/:encounterId", (req, res) => {
    const encounterId = parseInt(req.params.encounterId);

    let encounters = load("encounters.json");
    encounters = encounters.filter(e => e.id !== encounterId);

    save("encounters.json", encounters);

    res.json({ success: true });
});

module.exports = router;
