const fs = require("fs");
const path = require("path");

const ORDINAL_PATTERN = "(\\d+(?:st|nd|rd|th))";
const ROW_REGEX = new RegExp(
  `${ORDINAL_PATTERN}\\s+\\+(\\d)\\s+(.+?)(?=${ORDINAL_PATTERN}\\s+\\+\\d|$)`,
  "g"
);

const CLASS_TABLE_CONFIG = [
  {
    key: "barbarian",
    header: "The Barbarian",
    prefixColumns: [],
    suffixColumns: [
      { key: "rages", label: "Rages", type: "token" },
      { key: "rageDamage", label: "Rage Damage", type: "token" }
    ]
  },
  {
    key: "bard",
    header: "The Bard",
    prefixColumns: [],
    suffixColumns: [
      { key: "cantripsKnown", label: "Cantrips Known", type: "token" },
      { key: "spellsKnown", label: "Spells Known", type: "token" },
      { key: "slot1", label: "1st-Level Slots", type: "token" },
      { key: "slot2", label: "2nd-Level Slots", type: "token" },
      { key: "slot3", label: "3rd-Level Slots", type: "token" },
      { key: "slot4", label: "4th-Level Slots", type: "token" },
      { key: "slot5", label: "5th-Level Slots", type: "token" },
      { key: "slot6", label: "6th-Level Slots", type: "token" },
      { key: "slot7", label: "7th-Level Slots", type: "token" },
      { key: "slot8", label: "8th-Level Slots", type: "token" },
      { key: "slot9", label: "9th-Level Slots", type: "token" }
    ]
  },
  {
    key: "cleric",
    header: "The Cleric",
    prefixColumns: [],
    suffixColumns: [
      { key: "cantripsKnown", label: "Cantrips Known", type: "token" },
      { key: "slot1", label: "1st-Level Slots", type: "token" },
      { key: "slot2", label: "2nd-Level Slots", type: "token" },
      { key: "slot3", label: "3rd-Level Slots", type: "token" },
      { key: "slot4", label: "4th-Level Slots", type: "token" },
      { key: "slot5", label: "5th-Level Slots", type: "token" },
      { key: "slot6", label: "6th-Level Slots", type: "token" },
      { key: "slot7", label: "7th-Level Slots", type: "token" },
      { key: "slot8", label: "8th-Level Slots", type: "token" },
      { key: "slot9", label: "9th-Level Slots", type: "token" }
    ]
  },
  {
    key: "druid",
    header: "The Druid",
    prefixColumns: [],
    suffixColumns: [
      { key: "cantripsKnown", label: "Cantrips Known", type: "token" },
      { key: "slot1", label: "1st-Level Slots", type: "token" },
      { key: "slot2", label: "2nd-Level Slots", type: "token" },
      { key: "slot3", label: "3rd-Level Slots", type: "token" },
      { key: "slot4", label: "4th-Level Slots", type: "token" },
      { key: "slot5", label: "5th-Level Slots", type: "token" },
      { key: "slot6", label: "6th-Level Slots", type: "token" },
      { key: "slot7", label: "7th-Level Slots", type: "token" },
      { key: "slot8", label: "8th-Level Slots", type: "token" },
      { key: "slot9", label: "9th-Level Slots", type: "token" }
    ]
  },
  {
    key: "fighter",
    header: "The Fighter",
    prefixColumns: [],
    suffixColumns: []
  },
  {
    key: "monk",
    header: "The Monk",
    prefixColumns: [
      { key: "martialArts", label: "Martial Arts", type: "token" },
      { key: "kiPoints", label: "Ki Points", type: "token" },
      { key: "unarmoredMovement", label: "Unarmored Movement", type: "movement" }
    ],
    suffixColumns: []
  },
  {
    key: "paladin",
    header: "The Paladin",
    prefixColumns: [],
    suffixColumns: [
      { key: "slot1", label: "1st-Level Slots", type: "token" },
      { key: "slot2", label: "2nd-Level Slots", type: "token" },
      { key: "slot3", label: "3rd-Level Slots", type: "token" },
      { key: "slot4", label: "4th-Level Slots", type: "token" },
      { key: "slot5", label: "5th-Level Slots", type: "token" }
    ]
  },
  {
    key: "ranger",
    header: "The Ranger",
    prefixColumns: [],
    suffixColumns: [
      { key: "spellsKnown", label: "Spells Known", type: "token" },
      { key: "slot1", label: "1st-Level Slots", type: "token" },
      { key: "slot2", label: "2nd-Level Slots", type: "token" },
      { key: "slot3", label: "3rd-Level Slots", type: "token" },
      { key: "slot4", label: "4th-Level Slots", type: "token" },
      { key: "slot5", label: "5th-Level Slots", type: "token" }
    ]
  },
  {
    key: "rogue",
    header: "The Rogue",
    prefixColumns: [{ key: "sneakAttack", label: "Sneak Attack", type: "token" }],
    suffixColumns: []
  },
  {
    key: "sorcerer",
    header: "The Sorcerer",
    prefixColumns: [{ key: "sorceryPoints", label: "Sorcery Points", type: "token" }],
    suffixColumns: [
      { key: "cantripsKnown", label: "Cantrips Known", type: "token" },
      { key: "spellsKnown", label: "Spells Known", type: "token" },
      { key: "slot1", label: "1st-Level Slots", type: "token" },
      { key: "slot2", label: "2nd-Level Slots", type: "token" },
      { key: "slot3", label: "3rd-Level Slots", type: "token" },
      { key: "slot4", label: "4th-Level Slots", type: "token" },
      { key: "slot5", label: "5th-Level Slots", type: "token" },
      { key: "slot6", label: "6th-Level Slots", type: "token" },
      { key: "slot7", label: "7th-Level Slots", type: "token" },
      { key: "slot8", label: "8th-Level Slots", type: "token" },
      { key: "slot9", label: "9th-Level Slots", type: "token" }
    ]
  },
  {
    key: "warlock",
    header: "The Warlock",
    prefixColumns: [],
    suffixColumns: [
      { key: "cantripsKnown", label: "Cantrips Known", type: "token" },
      { key: "spellsKnown", label: "Spells Known", type: "token" },
      { key: "spellSlots", label: "Spell Slots", type: "token" },
      { key: "slotLevel", label: "Slot Level", type: "token" },
      { key: "invocationsKnown", label: "Invocations Known", type: "token" }
    ]
  },
  {
    key: "wizard",
    header: "The Wizard",
    prefixColumns: [],
    suffixColumns: [
      { key: "cantripsKnown", label: "Cantrips Known", type: "token" },
      { key: "slot1", label: "1st-Level Slots", type: "token" },
      { key: "slot2", label: "2nd-Level Slots", type: "token" },
      { key: "slot3", label: "3rd-Level Slots", type: "token" },
      { key: "slot4", label: "4th-Level Slots", type: "token" },
      { key: "slot5", label: "5th-Level Slots", type: "token" },
      { key: "slot6", label: "6th-Level Slots", type: "token" },
      { key: "slot7", label: "7th-Level Slots", type: "token" },
      { key: "slot8", label: "8th-Level Slots", type: "token" },
      { key: "slot9", label: "9th-Level Slots", type: "token" }
    ]
  }
];

const CLASS_CONFIG_MAP = CLASS_TABLE_CONFIG.reduce((acc, cfg) => {
  acc[cfg.key] = cfg;
  return acc;
}, {});

const DND_TEXT = fs
  .readFileSync(path.join(__dirname, "..", "DNDOPEN.txt"), "utf8")
  .replace(/\u0336/g, "");

const tableCache = new Map();

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function ordinalToLevel(ordinal) {
  return parseInt(ordinal.replace(/\D/g, ""), 10);
}

function normalizeTokenValue(value) {
  if (!value) return null;
  const cleaned = value.replace(/—/g, "-").replace(/−/g, "-").trim();
  if (!cleaned || cleaned === "-" || cleaned === "0") {
    return null;
  }
  return cleaned;
}

function consumePrefix(value, descriptor) {
  let remaining = value.trim();
  if (!remaining) {
    return { value: null, rest: "" };
  }

  if (descriptor.type === "movement") {
    if (remaining.startsWith("—") || remaining.startsWith("-")) {
      const rest = remaining.slice(1).trim();
      return { value: null, rest };
    }
    const parts = remaining.split(/\s+/);
    if (!parts.length) {
      return { value: null, rest: "" };
    }
    let consumed = parts[0];
    let index = 1;
    if (parts[index] && parts[index].toLowerCase().startsWith("ft")) {
      consumed = `${consumed} ${parts[index]}`;
      index += 1;
    }
    const rest = parts.slice(index).join(" ");
    return { value: consumed, rest };
  }

  const match = remaining.match(/^([^\s]+)\s*(.*)$/);
  if (!match) {
    return { value: normalizeTokenValue(remaining), rest: "" };
  }
  return { value: normalizeTokenValue(match[1]), rest: match[2] };
}

function consumeSuffix(value, descriptor) {
  let remaining = value.trim();
  if (!remaining) {
    return { value: null, rest: "" };
  }

  const match = remaining.match(/(.*)\s+([^\s]+)\s*$/);
  if (!match) {
    return { value: normalizeTokenValue(remaining), rest: "" };
  }
  return { value: normalizeTokenValue(match[2]), rest: match[1] };
}

function parseRowColumns(rowText, config) {
  let working = rowText.trim();
  const values = {};

  (config.prefixColumns || []).forEach(desc => {
    const { value, rest } = consumePrefix(working, desc);
    values[desc.key] = value;
    working = rest;
  });

  const suffixValues = {};
  (config.suffixColumns || [])
    .slice()
    .reverse()
    .forEach(desc => {
      const { value, rest } = consumeSuffix(working, desc);
      suffixValues[desc.key] = value;
      working = rest;
    });

  const features = normalizeWhitespace(working);
  const orderedSuffix = {};
  (config.suffixColumns || []).forEach(desc => {
    orderedSuffix[desc.key] = suffixValues[desc.key] ?? null;
  });

  return {
    features,
    values: {
      ...(config.prefixColumns || []).reduce((acc, desc) => {
        acc[desc.key] = values[desc.key] ?? null;
        return acc;
      }, {}),
      ...orderedSuffix
    }
  };
}

function getTableBlock(config) {
  const start = DND_TEXT.indexOf(config.header);
  if (start === -1) {
    return null;
  }
  const levelIndex = DND_TEXT.indexOf("Level", start);
  if (levelIndex === -1) {
    return null;
  }
  const afterSection = DND_TEXT.slice(levelIndex);
  const lastRowIndex = afterSection.indexOf("20th");
  if (lastRowIndex === -1) {
    return null;
  }
  const absoluteLast = levelIndex + lastRowIndex;
  const endBreak = DND_TEXT.indexOf("\n\n", absoluteLast);
  const endIndex = endBreak === -1 ? absoluteLast + 400 : endBreak;
  return DND_TEXT.slice(levelIndex, endIndex);
}

function parseTable(config) {
  const block = getTableBlock(config);
  if (!block) return null;
  const rows = {};
  const normalized = normalizeWhitespace(block);
  ROW_REGEX.lastIndex = 0;
  let match;
  while ((match = ROW_REGEX.exec(normalized))) {
    const ordinal = match[1];
    const level = ordinalToLevel(ordinal);
    const proficiencyBonus = `+${match[2]}`;
    const rowBody = match[3];
    const parsed = parseRowColumns(rowBody, config);
    rows[level] = {
      level,
      ordinal,
      proficiencyBonus,
      features: parsed.features,
      columns: (config.prefixColumns || [])
        .concat(config.suffixColumns || [])
        .map(desc => ({
          key: desc.key,
          label: desc.label,
          value: parsed.values[desc.key] ?? null
        }))
    };
  }
  return rows;
}

function getClassLevelData(classKey, level) {
  const cfg = CLASS_CONFIG_MAP[classKey];
  if (!cfg) {
    return null;
  }
  if (!tableCache.has(classKey)) {
    const table = parseTable(cfg);
    tableCache.set(classKey, table);
  }
  const table = tableCache.get(classKey);
  if (!table) return null;
  return table[level] || null;
}

module.exports = {
  getClassLevelData
};
