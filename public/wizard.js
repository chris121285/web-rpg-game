// Character Creation Wizard Logic

const STANDARD_LANGUAGES = [
    'Common',
    'Dwarvish',
    'Elvish',
    'Giant',
    'Gnomish',
    'Goblin',
    'Halfling',
    'Orc',
    'Abyssal',
    'Celestial',
    'Draconic',
    'Deep Speech',
    'Infernal',
    'Primordial',
    'Sylvan',
    'Undercommon'
];

let currentStep = 1;
let characterData = {
    name: '',
    class: null,
    race: null,
    subrace: null,
    background: null,
    level: 1,
    abilities: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
    },
    selectedSkills: [],  // Skills chosen from class
    selectedAbilityBonuses: {},  // Ability bonuses chosen from race (if applicable)
    toolProficiencies: [],
    toolProficiencySources: {},
    languageChoices: {
        race: [],
        subrace: [],
        class: [],
        background: []
    },
    inventory: [],
    equipmentSelections: {
        classChoices: {},
        backgroundChoices: {}
    },
    expertise: [],
    spells: {
        cantrips: [],
        known: [],
        prepared: [],
        spellbook: [],
        slots: {},
        ability: null,
        mode: null
    },
    alignment: '',
    personality: '',
    ideals: '',
    bonds: '',
    flaws: ''
};

// Modal state for choices
let currentChoiceType = null;
let currentChoiceData = null;
let raceAdvancePending = false;
let classAdvancePending = false;
const TOTAL_WIZARD_STEPS = 8;
 
function setToolProficienciesForSource(source, values = []) {
    characterData.toolProficiencySources[source] = values;
    characterData.toolProficiencies = Object.values(characterData.toolProficiencySources).flat();
    if (typeof renderExpertisePanel === 'function') {
        renderExpertisePanel();
    }
}

function getToolProficienciesForSource(source) {
    return characterData.toolProficiencySources[source] || [];
}

function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

const LANGUAGE_SOURCE_LABELS = {
    race: 'Race Bonus Languages',
    subrace: 'Subrace Bonus Languages',
    class: 'Class Bonus Languages',
    background: 'Background Bonus Languages'
};

function ensureLanguageChoiceState() {
    if (!characterData.languageChoices) {
        characterData.languageChoices = { race: [], subrace: [], class: [], background: [] };
    }
    Object.keys(LANGUAGE_SOURCE_LABELS).forEach(source => {
        if (!Array.isArray(characterData.languageChoices[source])) {
            characterData.languageChoices[source] = [];
        }
    });
}

function resetLanguageChoicesForSource(source) {
    ensureLanguageChoiceState();
    if (characterData.languageChoices[source]) {
        characterData.languageChoices[source] = [];
    }
}

function getBaseLanguages() {
    const langs = [];
    if (characterData.race?.languages) {
        langs.push(...characterData.race.languages);
    }
    if (characterData.subrace?.languages) {
        langs.push(...characterData.subrace.languages);
    }
    return Array.from(new Set(langs.filter(Boolean)));
}

function getLanguageChoiceConfig() {
    return [
        {
            key: 'race',
            label: LANGUAGE_SOURCE_LABELS.race,
            count: characterData.race?.languageChoices || 0
        },
        {
            key: 'subrace',
            label: LANGUAGE_SOURCE_LABELS.subrace,
            count: characterData.subrace?.languageChoices || 0
        },
        {
            key: 'class',
            label: LANGUAGE_SOURCE_LABELS.class,
            count: characterData.class?.languageChoices || 0
        },
        {
            key: 'background',
            label: LANGUAGE_SOURCE_LABELS.background,
            count: typeof characterData.background?.languages === 'number' ? characterData.background.languages : 0
        }
    ];
}

function ensureLanguageChoiceSlots() {
    ensureLanguageChoiceState();
    const config = getLanguageChoiceConfig();
    config.forEach(({ key, count }) => {
        if (!characterData.languageChoices[key]) {
            characterData.languageChoices[key] = [];
        }
        if (characterData.languageChoices[key].length > count) {
            characterData.languageChoices[key] = characterData.languageChoices[key].slice(0, count);
        } else {
            while (characterData.languageChoices[key].length < count) {
                characterData.languageChoices[key].push({ type: '', value: '', other: '' });
            }
        }
    });
}

function getAllLanguages() {
    ensureLanguageChoiceState();
    const languages = new Set(getBaseLanguages());
    Object.values(characterData.languageChoices).forEach(choices => {
        choices.forEach(choice => {
            if (!choice) return;
            const value = choice.type === 'other'
                ? (choice.other || '').trim()
                : choice.value || '';
            if (value) {
                languages.add(value);
            }
        });
    });
    return Array.from(languages).filter(Boolean);
}

function updateLanguageSummaryDisplay() {
    const summaryEl = document.getElementById('languageKnownList');
    if (!summaryEl) return;
    const knownLanguages = getAllLanguages();
    summaryEl.textContent = knownLanguages.length
        ? knownLanguages.join(', ')
        : 'No languages selected yet.';
}

function renderLanguageSelectionPanel() {
    const panel = document.getElementById('languageSelectionPanel');
    if (!panel) return;

    ensureLanguageChoiceSlots();

    const baseLanguages = getBaseLanguages();
    const knownLanguages = getAllLanguages();
    const config = getLanguageChoiceConfig();
    const totalChoices = config.reduce((sum, cfg) => sum + cfg.count, 0);

    let html = `
        <div class="detail-title">Languages</div>
        <div class="language-summary" id="languageKnownList">
            ${knownLanguages.length
                ? knownLanguages.map(lang => escapeHtml(lang)).join(', ')
                : (characterData.race ? 'No languages selected yet.' : 'Select a race to determine your starting languages.')}
        </div>
    `;

    if (!characterData.race) {
        html += `<div class="detail-description">Choose a race to unlock your starting languages.</div>`;
    } else if (totalChoices === 0) {
        html += `<div class="detail-description">Your current race, class, and background grant only the languages listed above.</div>`;
    } else {
        html += `<div class="detail-description">Select the bonus languages granted by your race, subrace, class, or background. Choose "Other" to type in a custom language.</div>`;
        config.forEach(({ key, label, count }) => {
            if (!count) return;
            html += `
                <div class="language-source">
                    <div class="language-source-title">${label} (${count})</div>
                    <div class="language-choice-grid">
                        ${characterData.languageChoices[key].map((choice, index) => {
                            const selectValue = choice.type === 'other'
                                ? '__other__'
                                : (choice.value || '');
                            const otherValue = choice.other || '';
                            const optionList = STANDARD_LANGUAGES.map(lang => {
                                const disabled = baseLanguages.includes(lang) ? 'disabled' : '';
                                const selected = selectValue === lang ? 'selected' : '';
                                const safeLang = escapeHtml(lang);
                                return `<option value="${safeLang}" ${selected} ${disabled}>${safeLang}</option>`;
                            }).join('');
                            return `
                                <div class="language-choice-field">
                                    <select class="language-select" onchange="handleLanguageSelectChange('${key}', ${index}, this.value)">
                                        <option value="">Select language...</option>
                                        ${optionList}
                                        <option value="__other__" ${selectValue === '__other__' ? 'selected' : ''}>Other (specify)</option>
                                    </select>
                                    <input type="text"
                                           class="language-other-input ${selectValue === '__other__' ? 'visible' : ''}"
                                           placeholder="Enter language name"
                                           value="${escapeHtml(otherValue)}"
                                           oninput="handleLanguageOtherInput('${key}', ${index}, this.value)">
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        });
    }

    panel.innerHTML = html;
    panel.classList.add('active');
    updateLanguageSummaryDisplay();
}

function handleLanguageSelectChange(source, index, value) {
    ensureLanguageChoiceSlots();
    const slot = characterData.languageChoices[source][index] || { type: '', value: '', other: '' };
    if (value === '__other__') {
        slot.type = 'other';
        slot.value = '';
    } else if (value) {
        slot.type = 'standard';
        slot.value = value;
        slot.other = '';
    } else {
        slot.type = '';
        slot.value = '';
        slot.other = '';
    }
    characterData.languageChoices[source][index] = slot;
    renderLanguageSelectionPanel();
}

function handleLanguageOtherInput(source, index, value) {
    ensureLanguageChoiceSlots();
    const slot = characterData.languageChoices[source][index] || { type: 'other', value: '', other: '' };
    slot.type = 'other';
    slot.value = '';
    slot.other = value;
    characterData.languageChoices[source][index] = slot;
    updateLanguageSummaryDisplay();
}

function ensureSpellData() {
    if (!characterData.spells) {
        resetSpellSelections();
        return;
    }
    characterData.spells.cantrips = characterData.spells.cantrips || [];
    characterData.spells.known = characterData.spells.known || [];
    characterData.spells.prepared = characterData.spells.prepared || [];
    characterData.spells.spellbook = characterData.spells.spellbook || [];
    characterData.spells.slots = characterData.spells.slots || {};
}

function resetSpellSelections() {
    characterData.spells = {
        cantrips: [],
        known: [],
        prepared: [],
        spellbook: [],
        slots: {},
        ability: null,
        mode: null
    };
}

// --------------------------------------
// Equipment Data
// --------------------------------------

const EQUIPMENT_LIBRARY = {
    weapons: {
        club: { name: 'Club', type: 'weapon', damage: '1d4', damageType: 'bludgeoning', weaponType: 'melee', quantity: 1 },
        dagger: { name: 'Dagger', type: 'weapon', damage: '1d4', damageType: 'piercing', weaponType: 'finesse', quantity: 1 },
        greatclub: { name: 'Greatclub', type: 'weapon', damage: '1d8', damageType: 'bludgeoning', weaponType: 'melee', quantity: 1 },
        handaxe: { name: 'Handaxe', type: 'weapon', damage: '1d6', damageType: 'slashing', weaponType: 'thrown', quantity: 1 },
        javelin: { name: 'Javelin', type: 'weapon', damage: '1d6', damageType: 'piercing', weaponType: 'thrown', quantity: 1 },
        lightHammer: { name: 'Light Hammer', type: 'weapon', damage: '1d4', damageType: 'bludgeoning', weaponType: 'thrown', quantity: 1 },
        mace: { name: 'Mace', type: 'weapon', damage: '1d6', damageType: 'bludgeoning', weaponType: 'melee', quantity: 1 },
        quarterstaff: { name: 'Quarterstaff', type: 'weapon', damage: '1d6', damageType: 'bludgeoning', weaponType: 'melee', quantity: 1 },
        sickle: { name: 'Sickle', type: 'weapon', damage: '1d4', damageType: 'slashing', weaponType: 'melee', quantity: 1 },
        spear: { name: 'Spear', type: 'weapon', damage: '1d6', damageType: 'piercing', weaponType: 'thrown', quantity: 1 },
        lightCrossbow: { name: 'Light Crossbow', type: 'weapon', damage: '1d8', damageType: 'piercing', weaponType: 'ranged', quantity: 1 },
        dart: { name: 'Dart', type: 'weapon', damage: '1d4', damageType: 'piercing', weaponType: 'thrown', quantity: 1 },
        shortbow: { name: 'Shortbow', type: 'weapon', damage: '1d6', damageType: 'piercing', weaponType: 'ranged', quantity: 1 },
        sling: { name: 'Sling', type: 'weapon', damage: '1d4', damageType: 'bludgeoning', weaponType: 'ranged', quantity: 1 },
        battleaxe: { name: 'Battleaxe', type: 'weapon', damage: '1d8', damageType: 'slashing', weaponType: 'melee', quantity: 1 },
        flail: { name: 'Flail', type: 'weapon', damage: '1d8', damageType: 'bludgeoning', weaponType: 'melee', quantity: 1 },
        glaive: { name: 'Glaive', type: 'weapon', damage: '1d10', damageType: 'slashing', weaponType: 'melee', quantity: 1 },
        greataxe: { name: 'Greataxe', type: 'weapon', damage: '1d12', damageType: 'slashing', weaponType: 'melee', quantity: 1 },
        greatsword: { name: 'Greatsword', type: 'weapon', damage: '2d6', damageType: 'slashing', weaponType: 'melee', quantity: 1 },
        halberd: { name: 'Halberd', type: 'weapon', damage: '1d10', damageType: 'slashing', weaponType: 'melee', quantity: 1 },
        lance: { name: 'Lance', type: 'weapon', damage: '1d12', damageType: 'piercing', weaponType: 'melee', quantity: 1 },
        longsword: { name: 'Longsword', type: 'weapon', damage: '1d8', damageType: 'slashing', weaponType: 'melee', quantity: 1 },
        maul: { name: 'Maul', type: 'weapon', damage: '2d6', damageType: 'bludgeoning', weaponType: 'melee', quantity: 1 },
        morningstar: { name: 'Morningstar', type: 'weapon', damage: '1d8', damageType: 'piercing', weaponType: 'melee', quantity: 1 },
        pike: { name: 'Pike', type: 'weapon', damage: '1d10', damageType: 'piercing', weaponType: 'melee', quantity: 1 },
        rapier: { name: 'Rapier', type: 'weapon', damage: '1d8', damageType: 'piercing', weaponType: 'finesse', quantity: 1 },
        scimitar: { name: 'Scimitar', type: 'weapon', damage: '1d6', damageType: 'slashing', weaponType: 'finesse', quantity: 1 },
        shortsword: { name: 'Shortsword', type: 'weapon', damage: '1d6', damageType: 'piercing', weaponType: 'finesse', quantity: 1 },
        trident: { name: 'Trident', type: 'weapon', damage: '1d6', damageType: 'piercing', weaponType: 'thrown', quantity: 1 },
        warPick: { name: 'War Pick', type: 'weapon', damage: '1d8', damageType: 'piercing', weaponType: 'melee', quantity: 1 },
        warhammer: { name: 'Warhammer', type: 'weapon', damage: '1d8', damageType: 'bludgeoning', weaponType: 'melee', quantity: 1 },
        whip: { name: 'Whip', type: 'weapon', damage: '1d4', damageType: 'slashing', weaponType: 'finesse', quantity: 1 },
        blowgun: { name: 'Blowgun', type: 'weapon', damage: '1', damageType: 'piercing', weaponType: 'ranged', quantity: 1 },
        handCrossbow: { name: 'Hand Crossbow', type: 'weapon', damage: '1d6', damageType: 'piercing', weaponType: 'ranged', quantity: 1 },
        heavyCrossbow: { name: 'Heavy Crossbow', type: 'weapon', damage: '1d10', damageType: 'piercing', weaponType: 'ranged', quantity: 1 },
        longbow: { name: 'Longbow', type: 'weapon', damage: '1d8', damageType: 'piercing', weaponType: 'ranged', quantity: 1 },
        net: { name: 'Net', type: 'weapon', damage: '—', damageType: 'restraining', weaponType: 'ranged', quantity: 1 }
    },
    armor: {
        paddedArmor: { name: 'Padded Armor', type: 'armor', ac: 11, quantity: 1 },
        leatherArmor: { name: 'Leather Armor', type: 'armor', ac: 11, quantity: 1 },
        studdedLeatherArmor: { name: 'Studded Leather Armor', type: 'armor', ac: 12, quantity: 1 },
        hideArmor: { name: 'Hide Armor', type: 'armor', ac: 12, quantity: 1 },
        chainShirt: { name: 'Chain Shirt', type: 'armor', ac: 13, quantity: 1 },
        scaleMail: { name: 'Scale Mail', type: 'armor', ac: 14, quantity: 1 },
        breastplate: { name: 'Breastplate', type: 'armor', ac: 14, quantity: 1 },
        halfPlate: { name: 'Half Plate', type: 'armor', ac: 15, quantity: 1 },
        ringMail: { name: 'Ring Mail', type: 'armor', ac: 14, quantity: 1 },
        chainMail: { name: 'Chain Mail', type: 'armor', ac: 16, quantity: 1 },
        splintArmor: { name: 'Splint Armor', type: 'armor', ac: 17, quantity: 1 },
        shield: { name: 'Shield', type: 'armor', ac: 2, quantity: 1 }
    },
    gear: {
        explorersPack: { name: "Explorer's Pack", type: 'gear', quantity: 1 },
        dungeoneersPack: { name: "Dungeoneer's Pack", type: 'gear', quantity: 1 },
        burglarPack: { name: "Burglar's Pack", type: 'gear', quantity: 1 },
        diplomatsPack: { name: "Diplomat's Pack", type: 'gear', quantity: 1 },
        entertainersPack: { name: "Entertainer's Pack", type: 'gear', quantity: 1 },
        priestsPack: { name: "Priest's Pack", type: 'gear', quantity: 1 },
        scholarsPack: { name: "Scholar's Pack", type: 'gear', quantity: 1 },
        componentPouch: { name: 'Component Pouch', type: 'gear', quantity: 1 },
        arcaneFocus: { name: 'Arcane Focus', type: 'gear', quantity: 1 },
        druidicFocus: { name: 'Druidic Focus', type: 'gear', quantity: 1 },
        holySymbol: { name: 'Holy Symbol', type: 'gear', quantity: 1 },
        spellbook: { name: 'Spellbook', type: 'gear', quantity: 1 },
        backpack: { name: 'Backpack', type: 'gear', quantity: 1 },
        beltPouch10: { name: 'Belt Pouch (10 gp)', type: 'gear', quantity: 1 },
        beltPouch15: { name: 'Belt Pouch (15 gp)', type: 'gear', quantity: 1 },
        beltPouch25: { name: 'Belt Pouch (25 gp)', type: 'gear', quantity: 1 },
        commonClothes: { name: 'Common Clothes', type: 'gear', quantity: 1 },
        fineClothes: { name: 'Fine Clothes', type: 'gear', quantity: 1 },
        travelersClothes: { name: "Traveler's Clothes", type: 'gear', quantity: 1 },
        prayerBook: { name: 'Prayer Book', type: 'gear', quantity: 1 },
        incenseStick: { name: 'Incense Stick', type: 'gear', quantity: 1 },
        vestments: { name: 'Vestments', type: 'gear', quantity: 1 },
        disguiseKit: { name: 'Disguise Kit', type: 'tool', quantity: 1 },
        forgeryKit: { name: 'Forgery Kit', type: 'tool', quantity: 1 },
        thievesTools: { name: "Thieves' Tools", type: 'tool', quantity: 1 },
        crowbar: { name: 'Crowbar', type: 'gear', quantity: 1 },
        shovel: { name: 'Shovel', type: 'gear', quantity: 1 },
        ironPot: { name: 'Iron Pot', type: 'gear', quantity: 1 },
        signetRing: { name: 'Signet Ring', type: 'gear', quantity: 1 },
        scrollOfPedigree: { name: 'Scroll of Pedigree', type: 'gear', quantity: 1 },
        bottleOfInk: { name: 'Bottle of Black Ink', type: 'gear', quantity: 1 },
        quill: { name: 'Quill', type: 'gear', quantity: 1 },
        smallKnife: { name: 'Small Knife', type: 'gear', quantity: 1 },
        luckyCharm: { name: 'Lucky Charm', type: 'gear', quantity: 1 },
        silkRope50: { name: '50 ft. Silk Rope', type: 'gear', quantity: 1 },
        longbowArrows: { name: 'Arrows (20)', type: 'ammo', quantity: 20 },
        crossbowBolts: { name: 'Bolts (20)', type: 'ammo', quantity: 20 },
        javelinBundle: { name: 'Javelins', type: 'weapon', damage: '1d6', damageType: 'piercing', weaponType: 'thrown', quantity: 5 }
    },
    tools: {
        lute: { name: 'Lute', type: 'instrument', quantity: 1 },
        flute: { name: 'Flute', type: 'instrument', quantity: 1 },
        drum: { name: 'Drum', type: 'instrument', quantity: 1 },
        lyre: { name: 'Lyre', type: 'instrument', quantity: 1 },
        horn: { name: 'Horn', type: 'instrument', quantity: 1 },
        panFlute: { name: 'Pan Flute', type: 'instrument', quantity: 1 },
        shawm: { name: 'Shawm', type: 'instrument', quantity: 1 },
        dulcimer: { name: 'Dulcimer', type: 'instrument', quantity: 1 },
        diceSet: { name: 'Dice Set', type: 'tool', quantity: 1 },
        playingCardSet: { name: 'Playing Card Set', type: 'tool', quantity: 1 },
        alchemistsSupplies: { name: "Alchemist's Supplies", type: 'tool', quantity: 1 },
        brewersSupplies: { name: "Brewer's Supplies", type: 'tool', quantity: 1 },
        calligraphersSupplies: { name: "Calligrapher's Supplies", type: 'tool', quantity: 1 },
        carpentersTools: { name: "Carpenter's Tools", type: 'tool', quantity: 1 },
        cartographersTools: { name: "Cartographer's Tools", type: 'tool', quantity: 1 },
        cobblersTools: { name: "Cobbler's Tools", type: 'tool', quantity: 1 },
        cooksUtensils: { name: "Cook's Utensils", type: 'tool', quantity: 1 },
        glassblowersTools: { name: "Glassblower's Tools", type: 'tool', quantity: 1 },
        jewelersTools: { name: "Jeweler's Tools", type: 'tool', quantity: 1 },
        leatherworkersTools: { name: "Leatherworker's Tools", type: 'tool', quantity: 1 },
        masonsTools: { name: "Mason's Tools", type: 'tool', quantity: 1 },
        paintersSupplies: { name: "Painter's Supplies", type: 'tool', quantity: 1 },
        pottersTools: { name: "Potter's Tools", type: 'tool', quantity: 1 },
        smithsTools: { name: "Smith's Tools", type: 'tool', quantity: 1 },
        tinkersTools: { name: "Tinker's Tools", type: 'tool', quantity: 1 },
        weaversTools: { name: "Weaver's Tools", type: 'tool', quantity: 1 },
        woodcarversTools: { name: "Woodcarver's Tools", type: 'tool', quantity: 1 },
        navigatorsTools: { name: "Navigator's Tools", type: 'tool', quantity: 1 },
        vehiclesLand: { name: 'Vehicles (Land)', type: 'tool', quantity: 1 },
        vehiclesWater: { name: 'Vehicles (Water)', type: 'tool', quantity: 1 }
    }
};

const EQUIPMENT_CATALOG_IDS = {
    club: 'club',
    dagger: 'dagger',
    greatclub: 'greatclub',
    handaxe: 'handaxe',
    javelin: 'javelin',
    lightHammer: 'light-hammer',
    mace: 'mace',
    quarterstaff: 'quarterstaff',
    sickle: 'sickle',
    spear: 'spear',
    lightCrossbow: 'light-crossbow',
    dart: 'dart',
    shortbow: 'shortbow',
    sling: 'sling',
    battleaxe: 'battleaxe',
    flail: 'flail',
    glaive: 'glaive',
    greataxe: 'greataxe',
    greatsword: 'greatsword',
    halberd: 'halberd',
    lance: 'lance',
    longsword: 'longsword',
    maul: 'maul',
    morningstar: 'morningstar',
    pike: 'pike',
    rapier: 'rapier',
    scimitar: 'scimitar',
    shortsword: 'shortsword',
    trident: 'trident',
    warPick: 'war-pick',
    warhammer: 'warhammer',
    whip: 'whip',
    blowgun: 'blowgun',
    handCrossbow: 'hand-crossbow',
    heavyCrossbow: 'heavy-crossbow',
    longbow: 'longbow',
    net: 'net',
    paddedArmor: 'padded-armor',
    leatherArmor: 'leather-armor',
    studdedLeatherArmor: 'studded-leather-armor',
    hideArmor: 'hide-armor',
    chainShirt: 'chain-shirt',
    scaleMail: 'scale-mail',
    breastplate: 'breastplate',
    halfPlate: 'half-plate',
    ringMail: 'ring-mail',
    chainMail: 'chain-mail',
    splintArmor: 'splint-armor',
    shield: 'shield',
    explorersPack: 'explorers-pack',
    dungeoneersPack: 'dungeoneers-pack',
    burglarPack: 'burglars-pack',
    diplomatsPack: 'diplomats-pack',
    entertainersPack: 'entertainers-pack',
    priestsPack: 'priests-pack',
    scholarsPack: 'scholars-pack',
    componentPouch: 'component-pouch',
    arcaneFocus: 'arcane-focus-crystal',
    druidicFocus: 'druidic-focus-wooden-staff',
    holySymbol: 'holy-symbol-amulet',
    spellbook: 'spellbook',
    backpack: 'backpack',
    beltPouch10: 'pouch',
    beltPouch15: 'pouch',
    beltPouch25: 'pouch',
    commonClothes: 'clothes-common',
    fineClothes: 'clothes-fine',
    travelersClothes: 'clothes-travelers',
    prayerBook: 'prayer-book',
    incenseStick: 'incense-stick',
    vestments: 'vestments',
    disguiseKit: 'disguise-kit',
    forgeryKit: 'forgery-kit',
    thievesTools: 'thieves-tools',
    crowbar: 'crowbar',
    shovel: 'shovel',
    ironPot: 'pot-iron',
    signetRing: 'signet-ring',
    scrollOfPedigree: 'scroll-of-pedigree',
    bottleOfInk: 'ink-bottle',
    quill: 'ink-pen',
    smallKnife: 'small-knife',
    luckyCharm: 'lucky-charm',
    silkRope50: 'rope-silk-50',
    longbowArrows: 'arrow',
    crossbowBolts: 'crossbow-bolt',
    javelinBundle: 'javelin',
    lute: 'lute',
    flute: 'flute',
    drum: 'drum',
    lyre: 'lyre',
    horn: 'horn',
    panFlute: 'pan-flute',
    shawm: 'shawm',
    dulcimer: 'dulcimer',
    diceSet: 'dice-set',
    playingCardSet: 'playing-card-set',
    alchemistsSupplies: 'alchemists-supplies',
    brewersSupplies: 'brewers-supplies',
    calligraphersSupplies: 'calligraphers-supplies',
    carpentersTools: 'carpenters-tools',
    cartographersTools: 'cartographers-tools',
    cobblersTools: 'cobblers-tools',
    cooksUtensils: 'cooks-utensils',
    glassblowersTools: 'glassblowers-tools',
    jewelersTools: 'jewelers-tools',
    leatherworkersTools: 'leatherworkers-tools',
    masonsTools: 'masons-tools',
    paintersSupplies: 'painters-supplies',
    pottersTools: 'potters-tools',
    smithsTools: 'smiths-tools',
    tinkersTools: 'tinkers-tools',
    weaversTools: 'weavers-tools',
    woodcarversTools: 'woodcarvers-tools',
    navigatorsTools: 'navigators-tools',
    vehiclesLand: 'vehicles-land',
    vehiclesWater: 'vehicles-water'
};

const EQUIPMENT_CATEGORIES = {
    simpleWeapon: ['club', 'dagger', 'greatclub', 'handaxe', 'javelin', 'lightHammer', 'mace', 'quarterstaff', 'sickle', 'spear', 'lightCrossbow', 'dart', 'shortbow', 'sling'],
    simpleMelee: ['club', 'dagger', 'greatclub', 'handaxe', 'javelin', 'lightHammer', 'mace', 'quarterstaff', 'sickle', 'spear'],
    simpleRanged: ['lightCrossbow', 'dart', 'shortbow', 'sling'],
    martialMelee: ['battleaxe', 'flail', 'glaive', 'greataxe', 'greatsword', 'halberd', 'lance', 'longsword', 'maul', 'morningstar', 'pike', 'rapier', 'scimitar', 'shortsword', 'trident', 'warPick', 'warhammer', 'whip'],
    martialRanged: ['blowgun', 'handCrossbow', 'heavyCrossbow', 'longbow', 'net'],
    martialWeapon: ['battleaxe', 'flail', 'glaive', 'greataxe', 'greatsword', 'halberd', 'lance', 'longsword', 'maul', 'morningstar', 'pike', 'rapier', 'scimitar', 'shortsword', 'trident', 'warPick', 'warhammer', 'whip', 'blowgun', 'handCrossbow', 'heavyCrossbow', 'longbow', 'net'],
    musicalInstrument: ['lute', 'flute', 'drum', 'lyre', 'horn', 'panFlute', 'shawm', 'dulcimer'],
    artisanTools: ['alchemistsSupplies', 'brewersSupplies', 'calligraphersSupplies', 'carpentersTools', 'cartographersTools', 'cobblersTools', 'cooksUtensils', 'glassblowersTools', 'jewelersTools', 'leatherworkersTools', 'masonsTools', 'paintersSupplies', 'pottersTools', 'smithsTools', 'tinkersTools', 'weaversTools', 'woodcarversTools'],
    gamingSet: ['diceSet', 'playingCardSet']
};

const CLASS_STARTING_EQUIPMENT = {
    barbarian: {
        choices: [
            {
                id: 'barbarian-primary',
                label: 'Primary Weapon',
                options: [
                    { id: 'greataxe', label: 'Greataxe', items: [{ ref: 'greataxe' }] },
                    { id: 'martial-melee', label: 'Any martial melee weapon', items: [{ type: 'category', id: 'barbarianMartial', category: 'martialMelee', count: 1 }] }
                ]
            },
            {
                id: 'barbarian-secondary',
                label: 'Secondary Weapon',
                options: [
                    { id: 'handaxes', label: 'Two handaxes', items: [{ ref: 'handaxe', quantity: 2 }] },
                    { id: 'simple-weapon', label: 'Any simple weapon', items: [{ type: 'category', id: 'barbarianSimple', category: 'simpleWeapon', count: 1 }] }
                ]
            }
        ],
        fixed: [
            { ref: 'explorersPack' },
            { ref: 'javelin', quantity: 4 }
        ]
    },
    bard: {
        choices: [
            {
                id: 'bard-weapon',
                label: 'Weapon',
                options: [
                    { id: 'rapier', label: 'Rapier', items: [{ ref: 'rapier' }] },
                    { id: 'longsword', label: 'Longsword', items: [{ ref: 'longsword' }] },
                    { id: 'simple-weapon', label: 'Any simple weapon', items: [{ type: 'category', id: 'bardSimple', category: 'simpleWeapon', count: 1 }] }
                ]
            },
            {
                id: 'bard-pack',
                label: 'Pack',
                options: [
                    { id: 'diplomat', label: "Diplomat's pack", items: [{ ref: 'diplomatsPack' }] },
                    { id: 'entertainer', label: "Entertainer's pack", items: [{ ref: 'entertainersPack' }] }
                ]
            },
            {
                id: 'bard-instrument',
                label: 'Instrument',
                options: [
                    { id: 'lute', label: 'Lute', items: [{ ref: 'lute' }], grantsToolProficiency: true },
                    { id: 'instrument', label: 'Any musical instrument', items: [{ type: 'category', id: 'bardInstrument', category: 'musicalInstrument', count: 1 }], grantsToolProficiency: true }
                ]
            }
        ],
        fixed: [
            { ref: 'leatherArmor' },
            { ref: 'dagger' }
        ]
    },
    cleric: {
        choices: [
            {
                id: 'cleric-weapon',
                label: 'Weapon',
                options: [
                    { id: 'mace', label: 'Mace', items: [{ ref: 'mace' }] },
                    { id: 'warhammer', label: 'Warhammer', items: [{ ref: 'warhammer' }] }
                ]
            },
            {
                id: 'cleric-armor',
                label: 'Armor',
                options: [
                    { id: 'scale-mail', label: 'Scale mail', items: [{ ref: 'scaleMail' }] },
                    { id: 'leather', label: 'Leather armor', items: [{ ref: 'leatherArmor' }] },
                    { id: 'chain-mail', label: 'Chain mail', items: [{ ref: 'chainMail' }] }
                ]
            },
            {
                id: 'cleric-ranged',
                label: 'Ranged or Simple Weapon',
                options: [
                    { id: 'light-crossbow', label: 'Light crossbow and 20 bolts', items: [{ ref: 'lightCrossbow' }, { ref: 'crossbowBolts' }] },
                    { id: 'simple', label: 'Any simple weapon', items: [{ type: 'category', id: 'clericSimple', category: 'simpleWeapon', count: 1 }] }
                ]
            },
            {
                id: 'cleric-pack',
                label: 'Pack',
                options: [
                    { id: 'priests', label: "Priest's pack", items: [{ ref: 'priestsPack' }] },
                    { id: 'explorers', label: "Explorer's pack", items: [{ ref: 'explorersPack' }] }
                ]
            }
        ],
        fixed: [
            { ref: 'shield' },
            { ref: 'holySymbol' }
        ]
    },
    druid: {
        choices: [
            {
                id: 'druid-shield',
                label: 'Defensive Item',
                options: [
                    { id: 'wooden-shield', label: 'Wooden shield', items: [{ ref: 'shield' }] },
                    { id: 'simple-weapon', label: 'Any simple weapon', items: [{ type: 'category', id: 'druidSimple', category: 'simpleWeapon', count: 1 }] }
                ]
            },
            {
                id: 'druid-blade',
                label: 'Melee Weapon',
                options: [
                    { id: 'scimitar', label: 'Scimitar', items: [{ ref: 'scimitar' }] },
                    { id: 'simple-melee', label: 'Any simple melee weapon', items: [{ type: 'category', id: 'druidMelee', category: 'simpleMelee', count: 1 }] }
                ]
            }
        ],
        fixed: [
            { ref: 'leatherArmor' },
            { ref: 'explorersPack' },
            { ref: 'druidicFocus' }
        ]
    },
    fighter: {
        choices: [
            {
                id: 'fighter-armor',
                label: 'Armor Set',
                options: [
                    { id: 'chain-mail', label: 'Chain mail', items: [{ ref: 'chainMail' }] },
                    { id: 'leather-longbow', label: 'Leather armor, longbow, 20 arrows', items: [{ ref: 'leatherArmor' }, { ref: 'longbow' }, { ref: 'longbowArrows' }] }
                ]
            },
            {
                id: 'fighter-weapons',
                label: 'Martial Weapons',
                options: [
                    { id: 'martial-shield', label: 'Martial weapon and shield', items: [{ type: 'category', id: 'fighterMartialShield', category: 'martialWeapon', count: 1 }, { ref: 'shield' }] },
                    { id: 'two-martial', label: 'Two martial weapons', items: [{ type: 'category', id: 'fighterMartialDual', category: 'martialWeapon', count: 2 }] }
                ]
            },
            {
                id: 'fighter-ranged',
                label: 'Ranged Support',
                options: [
                    { id: 'light-crossbow', label: 'Light crossbow and 20 bolts', items: [{ ref: 'lightCrossbow' }, { ref: 'crossbowBolts' }] },
                    { id: 'handaxes', label: 'Two handaxes', items: [{ ref: 'handaxe', quantity: 2 }] }
                ]
            },
            {
                id: 'fighter-pack',
                label: 'Pack',
                options: [
                    { id: 'dungeoneer', label: "Dungeoneer's pack", items: [{ ref: 'dungeoneersPack' }] },
                    { id: 'explorer', label: "Explorer's pack", items: [{ ref: 'explorersPack' }] }
                ]
            }
        ],
        fixed: []
    },
    monk: {
        choices: [
            {
                id: 'monk-weapon',
                label: 'Weapon',
                options: [
                    { id: 'shortsword', label: 'Shortsword', items: [{ ref: 'shortsword' }] },
                    { id: 'simple-weapon', label: 'Any simple weapon', items: [{ type: 'category', id: 'monkSimple', category: 'simpleWeapon', count: 1 }] }
                ]
            },
            {
                id: 'monk-pack',
                label: 'Pack',
                options: [
                    { id: 'dungeoneer', label: "Dungeoneer's pack", items: [{ ref: 'dungeoneersPack' }] },
                    { id: 'explorer', label: "Explorer's pack", items: [{ ref: 'explorersPack' }] }
                ]
            }
        ],
        fixed: [
            { ref: 'dart', quantity: 10 }
        ]
    },
    paladin: {
        choices: [
            {
                id: 'paladin-weapon',
                label: 'Martial Weapons',
                options: [
                    { id: 'weapon-shield', label: 'Martial weapon and shield', items: [{ type: 'category', id: 'paladinMartialShield', category: 'martialWeapon', count: 1 }, { ref: 'shield' }] },
                    { id: 'two-martial', label: 'Two martial weapons', items: [{ type: 'category', id: 'paladinMartialDual', category: 'martialWeapon', count: 2 }] }
                ]
            },
            {
                id: 'paladin-secondary',
                label: 'Secondary Weapon',
                options: [
                    { id: 'javelins', label: 'Five javelins', items: [{ ref: 'javelin', quantity: 5 }] },
                    { id: 'simple-melee', label: 'Any simple melee weapon', items: [{ type: 'category', id: 'paladinSimpleMelee', category: 'simpleMelee', count: 1 }] }
                ]
            },
            {
                id: 'paladin-pack',
                label: 'Pack',
                options: [
                    { id: 'priests', label: "Priest's pack", items: [{ ref: 'priestsPack' }] },
                    { id: 'explorers', label: "Explorer's pack", items: [{ ref: 'explorersPack' }] }
                ]
            }
        ],
        fixed: [
            { ref: 'chainMail' },
            { ref: 'holySymbol' }
        ]
    },
    ranger: {
        choices: [
            {
                id: 'ranger-armor',
                label: 'Armor',
                options: [
                    { id: 'scale', label: 'Scale mail', items: [{ ref: 'scaleMail' }] },
                    { id: 'leather', label: 'Leather armor', items: [{ ref: 'leatherArmor' }] }
                ]
            },
            {
                id: 'ranger-weapons',
                label: 'Close Weapons',
                options: [
                    { id: 'shortswords', label: 'Two shortswords', items: [{ ref: 'shortsword', quantity: 2 }] },
                    { id: 'simple-melee', label: 'Two simple melee weapons', items: [{ type: 'category', id: 'rangerSimpleMelee', category: 'simpleMelee', count: 2 }] }
                ]
            },
            {
                id: 'ranger-pack',
                label: 'Pack',
                options: [
                    { id: 'dungeoneer', label: "Dungeoneer's pack", items: [{ ref: 'dungeoneersPack' }] },
                    { id: 'explorer', label: "Explorer's pack", items: [{ ref: 'explorersPack' }] }
                ]
            }
        ],
        fixed: [
            { ref: 'longbow' },
            { ref: 'longbowArrows' }
        ]
    },
    rogue: {
        choices: [
            {
                id: 'rogue-weapon',
                label: 'Main Weapon',
                options: [
                    { id: 'rapier', label: 'Rapier', items: [{ ref: 'rapier' }] },
                    { id: 'shortsword', label: 'Shortsword', items: [{ ref: 'shortsword' }] }
                ]
            },
            {
                id: 'rogue-secondary',
                label: 'Secondary',
                options: [
                    { id: 'shortbow', label: 'Shortbow and 20 arrows', items: [{ ref: 'shortbow' }, { ref: 'longbowArrows' }] },
                    { id: 'extra-shortsword', label: 'Shortsword', items: [{ ref: 'shortsword' }] }
                ]
            },
            {
                id: 'rogue-pack',
                label: 'Pack',
                options: [
                    { id: 'burglar', label: "Burglar's pack", items: [{ ref: 'burglarPack' }] },
                    { id: 'dungeoneer', label: "Dungeoneer's pack", items: [{ ref: 'dungeoneersPack' }] },
                    { id: 'explorer', label: "Explorer's pack", items: [{ ref: 'explorersPack' }] }
                ]
            }
        ],
        fixed: [
            { ref: 'leatherArmor' },
            { ref: 'dagger', quantity: 2 },
            { ref: 'thievesTools' }
        ]
    },
    sorcerer: {
        choices: [
            {
                id: 'sorcerer-weapon',
                label: 'Weapon',
                options: [
                    { id: 'light-crossbow', label: 'Light crossbow and 20 bolts', items: [{ ref: 'lightCrossbow' }, { ref: 'crossbowBolts' }] },
                    { id: 'simple-weapon', label: 'Any simple weapon', items: [{ type: 'category', id: 'sorcererSimple', category: 'simpleWeapon', count: 1 }] }
                ]
            },
            {
                id: 'sorcerer-focus',
                label: 'Focus',
                options: [
                    { id: 'component', label: 'Component pouch', items: [{ ref: 'componentPouch' }] },
                    { id: 'arcane-focus', label: 'Arcane focus', items: [{ ref: 'arcaneFocus' }] }
                ]
            },
            {
                id: 'sorcerer-pack',
                label: 'Pack',
                options: [
                    { id: 'dungeoneer', label: "Dungeoneer's pack", items: [{ ref: 'dungeoneersPack' }] },
                    { id: 'explorer', label: "Explorer's pack", items: [{ ref: 'explorersPack' }] }
                ]
            }
        ],
        fixed: [
            { ref: 'dagger', quantity: 2 }
        ]
    },
    warlock: {
        choices: [
            {
                id: 'warlock-weapon',
                label: 'Weapon',
                options: [
                    { id: 'light-crossbow', label: 'Light crossbow and 20 bolts', items: [{ ref: 'lightCrossbow' }, { ref: 'crossbowBolts' }] },
                    { id: 'simple-weapon', label: 'Any simple weapon', items: [{ type: 'category', id: 'warlockSimple', category: 'simpleWeapon', count: 1 }] }
                ]
            },
            {
                id: 'warlock-focus',
                label: 'Focus',
                options: [
                    { id: 'component', label: 'Component pouch', items: [{ ref: 'componentPouch' }] },
                    { id: 'arcane-focus', label: 'Arcane focus', items: [{ ref: 'arcaneFocus' }] }
                ]
            },
            {
                id: 'warlock-pack',
                label: 'Pack',
                options: [
                    { id: 'scholar', label: "Scholar's pack", items: [{ ref: 'scholarsPack' }] },
                    { id: 'dungeoneer', label: "Dungeoneer's pack", items: [{ ref: 'dungeoneersPack' }] }
                ]
            },
            {
                id: 'warlock-bonus-simple',
                label: 'Bonus Simple Weapon',
                options: [
                    { id: 'warlock-bonus-choice', label: 'Choose a simple weapon', items: [{ type: 'category', id: 'warlockBonusSimple', category: 'simpleWeapon', count: 1 }] }
                ]
            }
        ],
        fixed: [
            { ref: 'leatherArmor' },
            { ref: 'dagger', quantity: 2 }
        ]
    },
    wizard: {
        choices: [
            {
                id: 'wizard-weapon',
                label: 'Weapon',
                options: [
                    { id: 'quarterstaff', label: 'Quarterstaff', items: [{ ref: 'quarterstaff' }] },
                    { id: 'dagger', label: 'Dagger', items: [{ ref: 'dagger' }] }
                ]
            },
            {
                id: 'wizard-focus',
                label: 'Focus',
                options: [
                    { id: 'component', label: 'Component pouch', items: [{ ref: 'componentPouch' }] },
                    { id: 'arcane-focus', label: 'Arcane focus', items: [{ ref: 'arcaneFocus' }] }
                ]
            },
            {
                id: 'wizard-pack',
                label: 'Pack',
                options: [
                    { id: 'scholar', label: "Scholar's pack", items: [{ ref: 'scholarsPack' }] },
                    { id: 'explorer', label: "Explorer's pack", items: [{ ref: 'explorersPack' }] }
                ]
            }
        ],
        fixed: [
            { ref: 'spellbook' }
        ]
    }
};

const BACKGROUND_EQUIPMENT = {
    acolyte: {
        choices: [],
        fixed: [
            { ref: 'holySymbol' },
            { ref: 'prayerBook' },
            { ref: 'incenseStick', quantity: 5 },
            { ref: 'vestments' },
            { ref: 'commonClothes' },
            { ref: 'beltPouch15' }
        ]
    }
};


function initializeEquipmentSelections() {
    if (!characterData.equipmentSelections) {
        characterData.equipmentSelections = {
            classChoices: {},
            backgroundChoices: {}
        };
    }
    prepareClassEquipmentSelections();
    prepareBackgroundEquipmentSelections();
}

function prepareClassEquipmentSelections() {
    const classId = characterData.class?.id;
    if (!classId || !CLASS_STARTING_EQUIPMENT[classId]) return;
    const selections = characterData.equipmentSelections.classChoices || {};
    CLASS_STARTING_EQUIPMENT[classId].choices.forEach(choice => {
        if (!selections[choice.id]) {
            selections[choice.id] = createDefaultEquipmentSelection(choice.options[0]);
        }
    });
    characterData.equipmentSelections.classChoices = selections;
}

function prepareBackgroundEquipmentSelections() {
    const backgroundId = characterData.background?.id;
    if (!backgroundId || !BACKGROUND_EQUIPMENT[backgroundId]) return;
    const selections = characterData.equipmentSelections.backgroundChoices || {};
    BACKGROUND_EQUIPMENT[backgroundId].choices.forEach(choice => {
        if (!selections[choice.id]) {
            selections[choice.id] = createDefaultEquipmentSelection(choice.options[0]);
        }
    });
    characterData.equipmentSelections.backgroundChoices = selections;
}

function createDefaultEquipmentSelection(option) {
    const selection = {
        optionId: option.id,
        categorySelections: {}
    };
    if (option.items) {
        option.items
            .filter(entry => entry.type === 'category')
            .forEach(entry => {
                const count = entry.count || 1;
                const defaults = [];
                for (let i = 0; i < count; i++) {
                    defaults.push(getDefaultCategoryItem(entry.category));
                }
                selection.categorySelections[entry.id] = defaults;
            });
    }
    return selection;
}

function renderEquipmentStep() {
    const classContainer = document.getElementById('classEquipmentChoices');
    const backgroundContainer = document.getElementById('backgroundEquipmentChoices');
    const inventoryContainer = document.getElementById('inventoryPreview');

    if (!classContainer || !backgroundContainer || !inventoryContainer) {
        return;
    }

    if (!characterData.class || !characterData.background) {
        classContainer.innerHTML = `<div style="color: #94a3b8;">Select a class and background before choosing equipment.</div>`;
        backgroundContainer.innerHTML = `<div style="color: #94a3b8;">Complete earlier steps to view background gear.</div>`;
        inventoryContainer.innerHTML = `<div style="color: #94a3b8;">Inventory preview will appear once gear is selected.</div>`;
        return;
    }

    initializeEquipmentSelections();
    renderClassEquipmentChoices(classContainer);
    renderBackgroundEquipmentChoices(backgroundContainer);
    buildInventory();
    renderInventoryPreview(inventoryContainer);
}

function renderClassEquipmentChoices(container) {
    const classId = characterData.class?.id;
    const config = CLASS_STARTING_EQUIPMENT[classId];
    if (!config) {
        container.innerHTML = `<div style="color: #94a3b8;">No equipment data found for this class.</div>`;
        return;
    }

    const selections = characterData.equipmentSelections.classChoices || {};
    const html = config.choices.map(choice => renderEquipmentChoice('class', choice, selections[choice.id])).join('');
    container.innerHTML = html;
}

function renderBackgroundEquipmentChoices(container) {
    const backgroundId = characterData.background?.id;
    const config = BACKGROUND_EQUIPMENT[backgroundId];
    if (!config) {
        container.innerHTML = `<div style="color: #94a3b8;">No equipment data found for this background.</div>`;
        return;
    }

    const selections = characterData.equipmentSelections.backgroundChoices || {};
    let html = '';
    if (config.choices.length === 0) {
        html += `<div style="color: #94a3b8;">No additional choices. You automatically receive your background gear.</div>`;
    } else {
        html += config.choices.map(choice => renderEquipmentChoice('background', choice, selections[choice.id])).join('');
    }
    container.innerHTML = html;
}

function renderEquipmentChoice(groupType, choice, selection) {
    const optionsHtml = choice.options.map(option => {
        const selected = selection && selection.optionId === option.id;
        const description = describeEquipmentOption(option);
        const inputName = `${groupType}-${choice.id}`;
        let optionHtml = `
            <label class="selection-card ${selected ? 'selected' : ''}" style="cursor: pointer;">
                <input type="radio" name="${inputName}" value="${option.id}" ${selected ? 'checked' : ''} onchange="onEquipmentOptionChange('${groupType}', '${choice.id}', '${option.id}')" style="display:none;">
                <div class="selection-card-title" style="margin-bottom: 6px;">${option.label}</div>
                <div class="selection-card-description" style="color: #cbd5e1;">${description}</div>
        `;
        if (selected && option.items) {
            option.items
                .filter(entry => entry.type === 'category')
                .forEach(entry => {
                    optionHtml += renderCategorySelectors(groupType, choice.id, option.id, entry, selection.categorySelections?.[entry.id]);
                });
        }
        optionHtml += `</label>`;
        return optionHtml;
    }).join('');

    return `
        <div style="margin-bottom: 25px;">
            <h3 style="color: #a5b4fc; margin-bottom: 12px;">${choice.label}</h3>
            <div class="choice-grid">
                ${optionsHtml}
            </div>
        </div>
    `;
}

function describeEquipmentOption(option) {
    if (!option.items) return option.label;
    const parts = option.items.map(entry => {
        if (entry.type === 'category') {
            const count = entry.count || 1;
            const label = getCategoryLabel(entry.category);
            return `${count > 1 ? count + ' × ' : ''}${label}`;
        }
        if (entry.ref) {
            const def = getEquipmentDefinition(entry.ref);
            const qty = entry.quantity || (def && def.quantity) || 1;
            return `${qty > 1 ? qty + ' × ' : ''}${def ? def.name : entry.ref}`;
        }
        if (entry.name) {
            const qty = entry.quantity || 1;
            return `${qty > 1 ? qty + ' × ' : ''}${entry.name}`;
        }
        return '';
    }).filter(Boolean);
    return parts.join(', ');
}

function getCategoryLabel(category) {
    switch (category) {
        case 'simpleWeapon': return 'Simple weapon';
        case 'simpleMelee': return 'Simple melee weapon';
        case 'simpleRanged': return 'Simple ranged weapon';
        case 'martialMelee': return 'Martial melee weapon';
        case 'martialRanged': return 'Martial ranged weapon';
        case 'martialWeapon': return 'Martial weapon';
        case 'musicalInstrument': return 'Musical instrument';
        case 'artisanTools': return 'Artisan tools';
        case 'gamingSet': return 'Gaming set';
        default: return 'Selection';
    }
}

function renderCategorySelectors(groupType, choiceId, optionId, entry, selections = []) {
    const items = getCategoryItems(entry.category);
    if (items.length === 0) {
        return `<div style="margin-top: 10px; color: #f87171;">No items available for ${getCategoryLabel(entry.category)}.</div>`;
    }
    const count = entry.count || 1;
    let html = `<div style="margin-top: 10px;">`;
    for (let i = 0; i < count; i++) {
        const currentValue = selections[i] || items[0].key;
        const selectOptions = items.map(item => `<option value="${item.key}" ${item.key === currentValue ? 'selected' : ''}>${item.definition.name}</option>`).join('');
        html += `
            <div style="margin-bottom: 8px;">
                <label style="font-size: 13px; color: #94a3b8;">${getCategoryLabel(entry.category)} ${count > 1 ? i + 1 : ''}</label>
                <select onchange="onEquipmentCategoryChange('${groupType}', '${choiceId}', '${optionId}', '${entry.id}', ${i}, this.value)" style="width: 100%; margin-top: 4px;">
                    ${selectOptions}
                </select>
            </div>
        `;
    }
    html += `</div>`;
    return html;
}

function onEquipmentOptionChange(groupType, choiceId, optionId) {
    const config = groupType === 'class'
        ? CLASS_STARTING_EQUIPMENT[characterData.class?.id]
        : BACKGROUND_EQUIPMENT[characterData.background?.id];
    if (!config) return;
    const choice = config.choices.find(c => c.id === choiceId);
    if (!choice) return;
    const option = choice.options.find(o => o.id === optionId);
    if (!option) return;
    if (groupType === 'class') {
        characterData.equipmentSelections.classChoices[choiceId] = createDefaultEquipmentSelection(option);
    } else {
        characterData.equipmentSelections.backgroundChoices[choiceId] = createDefaultEquipmentSelection(option);
    }
    renderEquipmentStep();
}

function onEquipmentCategoryChange(groupType, choiceId, optionId, categoryId, index, value) {
    if (!value) return;
    const selections = groupType === 'class'
        ? characterData.equipmentSelections.classChoices
        : characterData.equipmentSelections.backgroundChoices;
    if (!selections[choiceId]) return;
    if (!selections[choiceId].categorySelections[categoryId]) {
        selections[choiceId].categorySelections[categoryId] = [];
    }
    selections[choiceId].categorySelections[categoryId][index] = value;
    renderEquipmentStep();
}

function renderInventoryPreview(container) {
    if (!characterData.inventory.length) {
        container.innerHTML = `<div style="color: #94a3b8;">No equipment selected yet.</div>`;
        return;
    }

    const rows = characterData.inventory.map(item => {
        const detailParts = [];
        if (item.damage || item.damageDice) {
            if (typeof item.damage === 'string') {
                detailParts.push(`Damage ${item.damage}`);
            } else if (item.damage?.dice) {
                const damageType = item.damage.type ? ` ${item.damage.type}` : '';
                detailParts.push(`Damage ${item.damage.dice}${damageType}`);
            } else if (item.damageDice) {
                detailParts.push(`Damage ${item.damageDice}`);
            }
        }
        if (item.acBase || item.ac || item.acBonus) {
            if (item.acBase || item.ac) {
                detailParts.push(`AC ${item.acBase || item.ac}`);
            }
            if (item.acBonus) {
                detailParts.push(`Shield +${item.acBonus}`);
            }
        }
        if (item.effect?.dice) {
            const label = item.effect.type === 'healing' ? 'Heals' : 'Effect';
            detailParts.push(`${label} ${item.effect.dice}`);
        }
        if (item.description) {
            detailParts.push(item.description);
        }
        const detailText = detailParts.join(' • ');
        const typeLabel = (item.category || item.type || 'gear');
        return `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 6px;">
                <div>
                    <strong>${item.name}</strong>
                    <div style="color: #94a3b8; font-size: 13px;">${typeLabel}${detailText ? ' • ' + detailText : ''}</div>
                </div>
                <div style="color: #a5b4fc;">x${item.quantity || 1}</div>
            </div>
        `;
    }).join('');

    container.innerHTML = rows;
}

function handleEquipmentContinue() {
    if (!characterData.class || !characterData.background) {
        alert('Please select a class and background first.');
        return;
    }
    const classConfig = CLASS_STARTING_EQUIPMENT[characterData.class.id];
    if (!classConfig) {
        alert('Missing class equipment data.');
        return;
    }
    for (const choice of classConfig.choices) {
        if (!characterData.equipmentSelections.classChoices[choice.id]) {
            alert(`Please select an option for ${choice.label}.`);
            return;
        }
        const selection = characterData.equipmentSelections.classChoices[choice.id];
        const option = choice.options.find(o => o.id === selection.optionId);
        if (!option) {
            alert(`Please select an option for ${choice.label}.`);
            return;
        }
        if (option.items) {
            const categoryEntries = option.items.filter(entry => entry.type === 'category');
            for (const entry of categoryEntries) {
                const picks = selection.categorySelections[entry.id] || [];
                if (picks.some(p => !p)) {
                    alert(`Please select ${getCategoryLabel(entry.category)} choices for ${choice.label}.`);
                    return;
                }
            }
        }
    }

    const backgroundConfig = BACKGROUND_EQUIPMENT[characterData.background.id];
    if (backgroundConfig) {
        for (const choice of backgroundConfig.choices) {
            if (!characterData.equipmentSelections.backgroundChoices[choice.id]) {
                alert(`Please select an option for ${choice.label}.`);
                return;
            }
            const selection = characterData.equipmentSelections.backgroundChoices[choice.id];
            const option = choice.options.find(o => o.id === selection.optionId);
            if (!option) {
                alert(`Please select an option for ${choice.label}.`);
                return;
            }
            if (option.items) {
                const categoryEntries = option.items.filter(entry => entry.type === 'category');
                for (const entry of categoryEntries) {
                    const picks = selection.categorySelections[entry.id] || [];
                    if (picks.some(p => !p)) {
                        alert(`Please select ${getCategoryLabel(entry.category)} choices for ${choice.label}.`);
                        return;
                    }
                }
            }
        }
    }

    buildInventory();
    nextStep();
}

window.onEquipmentOptionChange = onEquipmentOptionChange;
window.onEquipmentCategoryChange = onEquipmentCategoryChange;
window.toggleSpellSelection = toggleSpellSelection;
window.handleSpellsContinue = handleSpellsContinue;

function buildInventory() {
    if (!characterData.class || !characterData.background) {
        characterData.inventory = [];
        updateEquipmentToolProficiencies();
        return [];
    }

    initializeEquipmentSelections();

    const items = [];
    const classId = characterData.class.id;
    const backgroundId = characterData.background.id;
    const classConfig = CLASS_STARTING_EQUIPMENT[classId];
    const backgroundConfig = BACKGROUND_EQUIPMENT[backgroundId];

    if (classConfig) {
        classConfig.fixed.forEach(entry => {
            items.push(...resolveEquipmentEntry(entry, null));
        });
        classConfig.choices.forEach(choice => {
            const selection = characterData.equipmentSelections.classChoices[choice.id];
            if (!selection) return;
            const option = choice.options.find(o => o.id === selection.optionId);
            if (!option) return;
            items.push(...resolveEquipmentOptionItems(option, selection));
        });
    }

    if (backgroundConfig) {
        backgroundConfig.fixed.forEach(entry => {
            items.push(...resolveEquipmentEntry(entry, null));
        });
        backgroundConfig.choices.forEach(choice => {
            const selection = characterData.equipmentSelections.backgroundChoices[choice.id];
            if (!selection) return;
            const option = choice.options.find(o => o.id === selection.optionId);
            if (!option) return;
            items.push(...resolveEquipmentOptionItems(option, selection));
        });
    }

    const raceTools = getToolProficienciesForSource('race');
    raceTools.forEach(toolName => {
        const toolItem = convertToolNameToItem(toolName);
        if (toolItem) {
            items.push(toolItem);
        }
    });

    const merged = mergeInventoryItems(items);
    characterData.inventory = merged;
    updateEquipmentToolProficiencies();
    return merged;
}

function resolveEquipmentOptionItems(option, selection) {
    if (!option.items) return [];
    return option.items.flatMap(entry => resolveEquipmentEntry(entry, selection?.categorySelections?.[entry.id]));
}

function resolveEquipmentEntry(entry, selectedKeys) {
    const results = [];
    if (entry.type === 'category') {
        const count = entry.count || (selectedKeys ? selectedKeys.length : 1);
        for (let i = 0; i < count; i++) {
            const key = (selectedKeys && selectedKeys[i]) || getDefaultCategoryItem(entry.category);
            const def = getEquipmentDefinition(key);
            if (def) {
                results.push(cloneEquipmentItem(def));
            }
        }
        return results;
    }
    if (entry.ref) {
        const def = getEquipmentDefinition(entry.ref);
        if (def) {
            results.push(cloneEquipmentItem(def, entry.quantity));
        }
        return results;
    }
    if (entry.name) {
        results.push({
            name: entry.name,
            type: entry.type || 'gear',
            quantity: entry.quantity || 1,
            description: entry.description || ''
        });
        return results;
    }
    return results;
}

function mergeInventoryItems(items) {
    const map = new Map();
    items.forEach(item => {
        if (!item || !item.name) return;
        const damageDice = item.damage?.dice || item.damage || item.damageDice || '';
        const damageType = item.damage?.type || item.damageType || '';
        const key = [
            item.catalogId || '',
            item.name,
            item.type || item.category || '',
            damageDice,
            damageType,
            item.weaponType || '',
            item.acBase || item.ac || '',
            item.acBonus || '',
            item.effect?.dice || ''
        ].join('|');
        if (!map.has(key)) {
            map.set(key, { ...item, quantity: item.quantity || 1 });
        } else {
            const existing = map.get(key);
            existing.quantity += item.quantity || 1;
        }
    });
    return Array.from(map.values());
}

function updateEquipmentToolProficiencies() {
    const classId = characterData.class?.id;
    const backgroundId = characterData.background?.id;
    const classConfig = CLASS_STARTING_EQUIPMENT[classId];
    const backgroundConfig = BACKGROUND_EQUIPMENT[backgroundId];
    const classSelections = characterData.equipmentSelections.classChoices || {};
    const backgroundSelections = characterData.equipmentSelections.backgroundChoices || {};

    const classTools = [];
    if (classConfig) {
        classConfig.choices.forEach(choice => {
            const selection = classSelections[choice.id];
            if (!selection) return;
            const option = choice.options.find(o => o.id === selection.optionId);
            if (!option || !option.grantsToolProficiency) return;
            option.items?.forEach(entry => {
                if (entry.type === 'category') {
                    const picks = selection.categorySelections?.[entry.id] || [];
                    picks.forEach(key => {
                        const def = getEquipmentDefinition(key);
                        if (def) classTools.push(def.name);
                    });
                } else if (entry.ref) {
                    const def = getEquipmentDefinition(entry.ref);
                    if (def) classTools.push(def.name);
                } else if (entry.name) {
                    classTools.push(entry.name);
                }
            });
        });
    } else {
        classTools.length = 0;
    }
    setToolProficienciesForSource('classEquipment', classTools);

    const backgroundChoiceTools = [];
    if (backgroundConfig) {
        backgroundConfig.choices.forEach(choice => {
            const selection = backgroundSelections[choice.id];
            if (!selection) return;
            const option = choice.options.find(o => o.id === selection.optionId);
            if (!option || !option.grantsToolProficiency) return;
            option.items?.forEach(entry => {
                if (entry.type === 'category') {
                    const picks = selection.categorySelections?.[entry.id] || [];
                    picks.forEach(key => {
                        const def = getEquipmentDefinition(key);
                        if (def) backgroundChoiceTools.push(def.name);
                    });
                } else if (entry.ref) {
                    const def = getEquipmentDefinition(entry.ref);
                    if (def) backgroundChoiceTools.push(def.name);
                } else if (entry.name) {
                    backgroundChoiceTools.push(entry.name);
                }
            });
        });
    } else {
        backgroundChoiceTools.length = 0;
    }
    setToolProficienciesForSource('backgroundChoice', backgroundChoiceTools);
    validateAlignmentRequirement();
}

function convertToolNameToItem(name) {
    if (!name) return null;
    const normalized = name.toLowerCase();
    const mapping = {
        "smith's tools": 'smithsTools',
        "brewer's supplies": 'brewersSupplies',
        "mason's tools": 'masonsTools',
        "tinker's tools": 'tinkersTools',
        "leatherworker's tools": 'leatherworkersTools',
        "alchemist's supplies": 'alchemistsSupplies',
        "calligrapher's supplies": 'calligraphersSupplies',
        "carpenter's tools": 'carpentersTools',
        "cartographer's tools": 'cartographersTools',
        "cobbler's tools": 'cobblersTools',
        "navigator's tools": 'navigatorsTools',
        "vehicles (land)": 'vehiclesLand',
        "vehicles (water)": 'vehiclesWater',
        "thieves' tools": 'thievesTools',
        "disguise kit": 'disguiseKit',
        "forgery kit": 'forgeryKit',
        "dice set": 'diceSet',
        "playing card set": 'playingCardSet',
        "cook's utensils": 'cooksUtensils',
        "jeweler's tools": 'jewelersTools',
        "painter's supplies": 'paintersSupplies',
        "woodcarver's tools": 'woodcarversTools',
        "glassblower's tools": 'glassblowersTools'
    };
    const key = mapping[normalized];
    if (key) {
        const def = getEquipmentDefinition(key);
        if (def) return cloneEquipmentItem(def);
    }
    return { name, type: 'tool', quantity: 1 };
}

function updateBackgroundToolProficiencies(bg) {
    if (!bg) {
        setToolProficienciesForSource('backgroundFixed', []);
        setToolProficienciesForSource('backgroundChoice', []);
        return;
    }
    const base = (bg.tools || []).filter(tool => tool && !tool.toLowerCase().includes('one type'));
    const config = BACKGROUND_EQUIPMENT[bg.id];
    if (config?.fixedToolProficiencies) {
        base.push(...config.fixedToolProficiencies);
    }
    setToolProficienciesForSource('backgroundFixed', base);
    setToolProficienciesForSource('backgroundChoice', []);
    validateAlignmentRequirement();
}
function getEquipmentDefinition(key) {
    for (const section of Object.values(EQUIPMENT_LIBRARY)) {
        if (section[key]) {
            const definition = { ...section[key] };
            if (!definition.catalogId && EQUIPMENT_CATALOG_IDS[key]) {
                definition.catalogId = EQUIPMENT_CATALOG_IDS[key];
            }
            return definition;
        }
    }
    return null;
}

function cloneEquipmentItem(definition, quantityOverride) {
    if (!definition) return null;
    const clone = { ...definition };
    if (typeof quantityOverride === 'number') {
        clone.quantity = quantityOverride;
    } else if (!clone.quantity) {
        clone.quantity = 1;
    }
    if (clone.damage && typeof clone.damage === 'string') {
        clone.damage = { dice: clone.damage, type: clone.damageType || '' };
    }
    if (clone.catalogId && typeof window.getEquipmentCatalogItem === 'function') {
        const catalogItem = window.getEquipmentCatalogItem(clone.catalogId);
        if (catalogItem) {
            clone.mode = 'catalog';
            clone.category = catalogItem.category || clone.type || clone.category || 'gear';
            clone.type = clone.type || clone.category;
            clone.subcategory = catalogItem.subcategory || clone.subcategory || '';
            if (catalogItem.damage) {
                clone.damage = catalogItem.damage;
                clone.damageType = catalogItem.damage.type || clone.damageType || '';
            }
            clone.properties = catalogItem.properties || clone.properties || [];
            clone.weaponType = catalogItem.weaponType || clone.weaponType || null;
            clone.ammo = catalogItem.ammo || clone.ammo || null;
            clone.acBase = catalogItem.acBase ?? clone.acBase ?? null;
            clone.acBonus = catalogItem.acBonus ?? clone.acBonus ?? null;
            clone.ac = clone.ac ?? clone.acBase ?? null;
            clone.stealthDisadvantage = catalogItem.stealthDisadvantage ?? clone.stealthDisadvantage ?? false;
            clone.strengthRequirement = catalogItem.strengthRequirement ?? clone.strengthRequirement ?? null;
            clone.effect = catalogItem.effect || clone.effect || null;
            clone.cost = catalogItem.cost || clone.cost || '';
            clone.weight = catalogItem.weight ?? clone.weight ?? 0;
            if (!clone.description && catalogItem.description) {
                clone.description = catalogItem.description;
            }
        } else {
            clone.category = clone.type || clone.category || 'gear';
        }
    } else {
        clone.category = clone.type || clone.category || 'gear';
    }
    if (!clone.mode) {
        clone.mode = clone.catalogId ? 'catalog' : 'custom';
    }
    return clone;
}

function getCategoryItems(categoryKey) {
    const keys = EQUIPMENT_CATEGORIES[categoryKey] || [];
    return keys.map(key => ({ key, definition: getEquipmentDefinition(key) })).filter(item => item.definition);
}

function getDefaultCategoryItem(categoryKey) {
    const items = getCategoryItems(categoryKey);
    return items.length ? items[0].key : null;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if returning from ability score roller
    const urlParams = new URLSearchParams(window.location.search);
    const resumeStep = urlParams.get('step');

    if (resumeStep) {
        // Restore wizard progress
        const savedProgress = localStorage.getItem('wizardProgress');
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            characterData = { ...characterData, ...progress };
        }

        // Restore rolled abilities
        const rolledAbilities = localStorage.getItem('rolledAbilities');
        if (rolledAbilities) {
            characterData.abilities = JSON.parse(rolledAbilities);
        }

        // Set current step
        currentStep = parseInt(resumeStep);

        // Show the correct step
        document.querySelectorAll('.wizard-step').forEach(step => {
            step.classList.remove('active');
        });
        document.querySelector(`.wizard-step[data-step="${currentStep}"]`).classList.add('active');

        // If on final step, show summary
        if (currentStep === TOTAL_WIZARD_STEPS) {
            showCharacterSummary();
        }
    }

    ensureSpellData();
    ensureLanguageChoiceState();

    initializeNameStep();
    renderClasses();
    renderRaces();
    renderBackgrounds();
    renderLanguageSelectionPanel();
    initializeNarrativeInputs();
    renderExpertisePanel();
    renderSpellsStep();
    validateAlignmentRequirement();
    if (currentStep >= 5) {
        renderEquipmentStep();
    }
    if (currentStep >= 7) {
        renderSpellsStep();
    }
    updateProgressBar();
});

// Name Step
function initializeNameStep() {
    const nameInput = document.getElementById('characterName');
    const nextBtn = document.getElementById('nameNextBtn');

    nameInput.addEventListener('input', (e) => {
        characterData.name = e.target.value.trim();
        nextBtn.disabled = characterData.name.length === 0;
    });

    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && characterData.name.length > 0) {
            nextStep();
        }
    });
}

// Render Classes
function renderClasses() {
    const grid = document.getElementById('classGrid');
    const nextBtn = document.getElementById('classNextBtn');

    grid.innerHTML = DND_CLASSES.map(cls => `
        <div class="selection-card" data-id="${cls.id}" onclick="selectClass('${cls.id}')">
            <div class="selection-card-icon">${cls.icon}</div>
            <div class="selection-card-title">${cls.name}</div>
            <div class="selection-card-bonuses">
                <div class="bonus-item">
                    <span class="bonus-label">Hit Die:</span> ${cls.hitDie}
                </div>
                <div class="bonus-item">
                    <span class="bonus-label">Primary:</span> ${cls.primaryAbility}
                </div>
                <div class="bonus-item">
                    <span class="bonus-label">Saves:</span> ${cls.saves.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}
                </div>
            </div>
        </div>
    `).join('');
}

function selectClass(classId) {
    const cls = DND_CLASSES.find(c => c.id === classId);
    if (!cls) return;

    // Update selection
    document.querySelectorAll('#classGrid .selection-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelector(`#classGrid [data-id="${classId}"]`).classList.add('selected');

    // Show detail panel
    const detailPanel = document.getElementById('classDetailPanel');
    detailPanel.innerHTML = `
        <div class="detail-title">${cls.icon} ${cls.name}</div>
        <div class="detail-description">${cls.longDescription || cls.description}</div>
        <div class="detail-bonuses">
            <div class="detail-bonus-box">
                <div class="detail-bonus-title">Hit Die</div>
                <div class="detail-bonus-value">${cls.hitDie}</div>
            </div>
            <div class="detail-bonus-box">
                <div class="detail-bonus-title">Primary Ability</div>
                <div class="detail-bonus-value">${cls.primaryAbility}</div>
            </div>
            <div class="detail-bonus-box">
                <div class="detail-bonus-title">Saving Throws</div>
                <div class="detail-bonus-value">${cls.saves.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}</div>
            </div>
            <div class="detail-bonus-box">
                <div class="detail-bonus-title">Skill Proficiencies</div>
                <div class="detail-bonus-value">Choose ${cls.skillChoices} from ${cls.skillOptions.length} options</div>
            </div>
            <div class="detail-bonus-box">
                <div class="detail-bonus-title">Armor Proficiency</div>
                <div class="detail-bonus-value">${cls.armorProficiency}</div>
            </div>
            <div class="detail-bonus-box">
                <div class="detail-bonus-title">Weapon Proficiency</div>
                <div class="detail-bonus-value">${cls.weaponProficiency}</div>
            </div>
            ${cls.toolProficiency ? `
            <div class="detail-bonus-box">
                <div class="detail-bonus-title">Tools</div>
                <div class="detail-bonus-value">${cls.toolProficiency}</div>
            </div>` : ''}
            <div class="detail-bonus-box">
                <div class="detail-bonus-title">Starting Gear</div>
                <div class="detail-bonus-value">${cls.startingEquipment}</div>
            </div>
            ${cls.features ? `
            <div class="detail-bonus-box" style="grid-column: 1 / -1;">
                <div class="detail-bonus-title">Key Features</div>
                <div class="detail-bonus-value">
                    ${cls.features.map(feature => `
                        <div style="margin-bottom: 10px;">
                            <strong>${feature.name}:</strong> ${feature.description}
                        </div>
                    `).join('')}
                </div>
            </div>` : ''}
            ${cls.subclasses ? `
            <div class="detail-bonus-box" style="grid-column: 1 / -1;">
                <div class="detail-bonus-title">Subclass Paths</div>
                <div class="detail-bonus-value">
                    ${cls.subclasses.map(sub => `
                        <div style="margin-bottom: 10px;">
                            <strong>${sub.name}:</strong> ${sub.description}
                        </div>
                    `).join('')}
                </div>
            </div>` : ''}
        </div>
    `;
    detailPanel.classList.add('active');

    // Store class selection
    characterData.class = cls;
    resetLanguageChoicesForSource('class');
    renderLanguageSelectionPanel();
    characterData.selectedSkills = [];
    characterData.expertise = [];
    resetSpellSelections();
    classAdvancePending = false;
    characterData.equipmentSelections.classChoices = {};
    const classFeatureTools = cls.toolProficiency && cls.toolProficiency.toLowerCase() !== 'none'
        ? [cls.toolProficiency]
        : [];
    setToolProficienciesForSource('classFeature', classFeatureTools);
    setToolProficienciesForSource('classEquipment', []);

    const classNextBtn = document.getElementById('classNextBtn');
    if (classNextBtn) {
        classNextBtn.disabled = false;
    }
    if (currentStep >= 5) {
        renderEquipmentStep();
    }
    renderExpertisePanel();
    renderSpellsStep();
}

// Render Races
function renderRaces() {
    const grid = document.getElementById('raceGrid');

    grid.innerHTML = DND_RACES.map(race => {
        const bonuses = Object.entries(race.abilityBonuses)
            .map(([ability, bonus]) => `${ability.charAt(0).toUpperCase() + ability.slice(1).substring(0, 2).toUpperCase()} +${bonus}`)
            .join(', ');

        return `
            <div class="selection-card" data-id="${race.id}" onclick="selectRace('${race.id}')">
                <div class="selection-card-icon">${race.icon}</div>
                <div class="selection-card-title">${race.name}</div>
                <div class="selection-card-bonuses">
                    <div class="bonus-item">
                        <span class="bonus-label">Ability Bonuses:</span> ${bonuses}
                    </div>
                    <div class="bonus-item">
                        <span class="bonus-label">Speed:</span> ${race.speed} ft
                    </div>
                    <div class="bonus-item">
                        <span class="bonus-label">Size:</span> ${race.size}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function selectRace(raceId) {
    const race = DND_RACES.find(r => r.id === raceId);
    if (!race) return;

    // Update selection
    document.querySelectorAll('#raceGrid .selection-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelector(`#raceGrid [data-id="${raceId}"]`).classList.add('selected');

    // Format traits (handle both string and object formats)
    const formatTraits = (traits) => {
        if (!traits) return '';
        return traits.map(trait => {
            if (typeof trait === 'string') {
                return `<div style="margin-bottom: 8px;">• ${trait}</div>`;
            } else {
                return `<div style="margin-bottom: 8px;"><strong>• ${trait.name}:</strong> ${trait.description}</div>`;
            }
        }).join('');
    };
    const hasSubraces = race.subraces && race.subraces.length > 0;
    const requiresSubraceSelection = race.subraces && race.subraces.length > 1;

    // Build detail panel HTML
    let detailHTML = `
        <div class="detail-title">${race.icon} ${race.name}</div>
        <div class="detail-description">${race.description}</div>
        ${race.longDescription ? `<div class="detail-description" style="margin-top: 10px; font-size: 0.9em; opacity: 0.9;">${race.longDescription}</div>` : ''}
        <div class="detail-bonuses">
            <div class="detail-bonus-box">
                <div class="detail-bonus-title">Ability Score Increases</div>
                <div class="detail-bonus-value">
                    ${Object.entries(race.abilityBonuses)
                        .map(([ability, bonus]) => `${ability.charAt(0).toUpperCase() + ability.slice(1)} +${bonus}`)
                        .join(', ')}
                    ${race.chooseTwo ? ' (and choose +1 to two other abilities)' : ''}
                    ${race.subraces ? ' (plus subrace bonuses)' : ''}
                </div>
            </div>
            <div class="detail-bonus-box">
                <div class="detail-bonus-title">Speed</div>
                <div class="detail-bonus-value">${race.speed} feet${race.speedNote ? `<br><small>${race.speedNote}</small>` : ''}</div>
            </div>
            <div class="detail-bonus-box">
                <div class="detail-bonus-title">Size</div>
                <div class="detail-bonus-value">${race.size}${race.sizeDescription ? `<br><small>${race.sizeDescription}</small>` : ''}</div>
            </div>
            ${race.age ? `
            <div class="detail-bonus-box">
                <div class="detail-bonus-title">Age</div>
                <div class="detail-bonus-value">${race.age}</div>
            </div>` : ''}
            ${race.alignment ? `
            <div class="detail-bonus-box">
                <div class="detail-bonus-title">Alignment</div>
                <div class="detail-bonus-value">${race.alignment}</div>
            </div>` : ''}
            ${race.languages ? `
            <div class="detail-bonus-box">
                <div class="detail-bonus-title">Languages</div>
                <div class="detail-bonus-value">
                    ${race.languages.join(', ')}
                    ${race.languageDescription ? `<br><small>${race.languageDescription}</small>` : ''}
                    ${race.languageChoices ? `<br><small>Bonus: choose ${race.languageChoices} additional language${race.languageChoices > 1 ? 's' : ''}.</small>` : ''}
                </div>
            </div>` : ''}
            <div class="detail-bonus-box" style="grid-column: 1 / -1;">
                <div class="detail-bonus-title">Racial Traits</div>
                <div class="detail-bonus-value">
                    ${formatTraits(race.traits)}
                </div>
            </div>
    `;

    // Add subraces section if they exist
    if (hasSubraces) {
        detailHTML += `
            <div class="detail-bonus-box" style="grid-column: 1 / -1;">
                <div class="detail-bonus-title">Subraces</div>
                <div class="detail-bonus-value">
                    ${race.subraces.map(subrace => `
                        <div style="margin-bottom: 15px; padding: 10px; background: rgba(129, 140, 248, 0.1); border-radius: 8px;">
                            <div style="font-weight: bold; margin-bottom: 5px;">${subrace.name}</div>
                            <div style="margin-bottom: 8px; font-size: 0.9em;">${subrace.description}</div>
                            <div style="font-size: 0.9em;">
                                <strong>Ability Bonuses:</strong> ${Object.entries(subrace.abilityBonuses)
                                    .map(([ability, bonus]) => `${ability.charAt(0).toUpperCase() + ability.slice(1)} +${bonus}`)
                                    .join(', ')}
                            </div>
                            ${formatTraits(subrace.traits)}
                            ${subrace.languageChoices ? `<div style="margin-top: 6px;"><strong>Bonus Languages:</strong> Choose ${subrace.languageChoices} additional language${subrace.languageChoices > 1 ? 's' : ''}.</div>` : ''}
                        </div>
                    `).join('')}
                    ${requiresSubraceSelection ? `
                        <div style="margin-top: 10px; font-style: italic; font-size: 0.9em;">
                            You'll choose your subrace after clicking Continue.
                        </div>
                    ` : race.subraces.length === 1 ? `
                        <div style="margin-top: 10px; font-style: italic; font-size: 0.9em;">
                            ${race.subraces[0].name} is automatically applied to your character.
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    detailHTML += `</div>`;

    // Show detail panel
    const detailPanel = document.getElementById('raceDetailPanel');
    detailPanel.innerHTML = detailHTML;
    detailPanel.classList.add('active');

    // Store race and reset dependent selections
    characterData.race = race;
    resetLanguageChoicesForSource('race');
    resetLanguageChoicesForSource('subrace');
    characterData.subrace = null;
    setToolProficienciesForSource('race', []);
    raceAdvancePending = false;

    if (race.subraces && race.subraces.length === 1) {
        characterData.subrace = race.subraces[0];
    }
    renderLanguageSelectionPanel();

    // Enable continue once a race is selected
    const raceNextBtn = document.getElementById('raceNextBtn');
    if (raceNextBtn) {
        raceNextBtn.disabled = false;
    }
    if (currentStep >= 5) {
        renderEquipmentStep();
    }
}

// Render Backgrounds
function renderBackgrounds() {
    const grid = document.getElementById('backgroundGrid');

    grid.innerHTML = DND_BACKGROUNDS.map(bg => `
        <div class="selection-card" data-id="${bg.id}" onclick="selectBackground('${bg.id}')">
            <div class="selection-card-icon">${bg.icon}</div>
            <div class="selection-card-title">${bg.name}</div>
            <div class="selection-card-bonuses">
                <div class="bonus-item">
                    <span class="bonus-label">Skills:</span> ${bg.skillProficiencies.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}
                </div>
                ${bg.tools ? `<div class="bonus-item"><span class="bonus-label">Tools:</span> ${bg.tools.join(', ')}</div>` : ''}
                ${bg.languages ? `<div class="bonus-item"><span class="bonus-label">Languages:</span> ${bg.languages} additional</div>` : ''}
            </div>
        </div>
    `).join('');
}

function selectBackground(backgroundId) {
    const bg = DND_BACKGROUNDS.find(b => b.id === backgroundId);
    if (!bg) return;

    // Update selection
    document.querySelectorAll('#backgroundGrid .selection-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelector(`#backgroundGrid [data-id="${backgroundId}"]`).classList.add('selected');

    // Show detail panel
    const detailPanel = document.getElementById('backgroundDetailPanel');
    detailPanel.innerHTML = `
        <div class="detail-title">${bg.icon} ${bg.name}</div>
        <div class="detail-description">${bg.longDescription || bg.description}</div>
        <div class="detail-bonuses">
            <div class="detail-bonus-box">
                <div class="detail-bonus-title">Skill Proficiencies</div>
                <div class="detail-bonus-value">
                    ${bg.skillProficiencies.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}
                </div>
            </div>
            ${bg.tools ? `
                <div class="detail-bonus-box">
                    <div class="detail-bonus-title">Tool Proficiencies</div>
                    <div class="detail-bonus-value">${bg.tools.join(', ')}</div>
                </div>
            ` : ''}
            ${bg.languages ? `
                <div class="detail-bonus-box">
                    <div class="detail-bonus-title">Languages</div>
                    <div class="detail-bonus-value">${bg.languages} additional language${bg.languages > 1 ? 's' : ''}</div>
                </div>
            ` : ''}
            <div class="detail-bonus-box" style="grid-column: 1 / -1;">
                <div class="detail-bonus-title">Equipment</div>
                <div class="detail-bonus-value">${bg.equipment}</div>
            </div>
            <div class="detail-bonus-box" style="grid-column: 1 / -1;">
                <div class="detail-bonus-title">Background Feature</div>
                <div class="detail-bonus-value">${bg.feature}</div>
            </div>
        </div>
    `;
    detailPanel.classList.add('active');

    // Enable next button
    characterData.background = bg;
    resetLanguageChoicesForSource('background');
    renderLanguageSelectionPanel();
    characterData.equipmentSelections.backgroundChoices = {};
    updateBackgroundToolProficiencies(bg);
    validateAlignmentRequirement();
    renderExpertisePanel();
    if (currentStep >= 5) {
        renderEquipmentStep();
    }
}

function initializeNarrativeInputs() {
    const mappings = [
        { id: 'alignmentSelect', key: 'alignment', event: 'change' },
        { id: 'personalityInput', key: 'personality', event: 'input' },
        { id: 'idealsInput', key: 'ideals', event: 'input' },
        { id: 'bondsInput', key: 'bonds', event: 'input' },
        { id: 'flawsInput', key: 'flaws', event: 'input' }
    ];

    mappings.forEach(({ id, key, event }) => {
        const el = document.getElementById(id);
        if (!el) return;
        const updateValue = (value) => {
            characterData[key] = value;
            if (key === 'alignment') {
                validateAlignmentRequirement();
            }
        };
        el.value = characterData[key] || '';
        el.addEventListener(event || 'input', (e) => {
            updateValue(e.target.value);
        });
    });
}

function validateAlignmentRequirement() {
    const alignmentFilled = !!(characterData.alignment && characterData.alignment.trim());
    const backgroundFilled = !!characterData.background;
    const expertiseReady = getExpertiseContext().satisfied;
    const btn = document.getElementById('backgroundNextBtn');
    if (!btn) return;
    btn.disabled = !(alignmentFilled && backgroundFilled && expertiseReady);
}

function handleClassContinue() {
    if (!characterData.class) {
        alert('Please select a class before continuing.');
        return;
    }

    if (!classAdvancePending) {
        classAdvancePending = true;
    }

    const cls = characterData.class;
    if ((characterData.selectedSkills || []).length < cls.skillChoices) {
        showSkillSelectionModal(cls);
        return;
    }

    classAdvancePending = false;
    nextStep();
}

function handleRaceContinue() {
    if (!characterData.race) {
        alert('Please select a race before continuing.');
        return;
    }

    if (!raceAdvancePending) {
        raceAdvancePending = true;
    }

    const race = characterData.race;
    const requiresSubraceSelection = race.subraces && race.subraces.length > 1;
    if (requiresSubraceSelection && !characterData.subrace) {
        showSubraceSelectionModal(race);
        return;
    }

    const needsToolChoice = race.traits && race.traits.some(t => t.choice && t.options && t.options.length > 0);
    if (needsToolChoice && getToolProficienciesForSource('race').length === 0) {
        showToolProficiencyModal(race);
        return;
    }

    raceAdvancePending = false;
    nextStep();
}

function getExpertiseContext() {
    const expertiseConfig = characterData.class?.expertise;
    if (!expertiseConfig) {
        return {
            config: null,
            available: [],
            selections: [],
            enforceSelection: false,
            satisfied: true,
            active: false
        };
    }

    const currentSelections = Array.isArray(characterData.expertise) ? characterData.expertise : [];
    const available = getAvailableExpertiseOptions(expertiseConfig);
    const availableMap = new Map(available.map(option => [option.id, option]));
    const selections = currentSelections
        .map(id => availableMap.get(id))
        .filter(Boolean);
    const enforceSelection = expertiseConfig.count > 0 && available.length >= expertiseConfig.count;
    const satisfied = !enforceSelection || selections.length >= expertiseConfig.count;

    return {
        config: expertiseConfig,
        available,
        selections,
        enforceSelection,
        satisfied,
        active: available.length > 0
    };
}

function renderExpertisePanel() {
    const panel = document.getElementById('expertisePanel');
    const container = document.getElementById('expertiseChoicesContainer');
    const desc = document.getElementById('expertiseDescription');
    if (!panel || !container || !desc) return;

    const context = getExpertiseContext();
    if (!context.config || !context.active) {
        panel.style.display = 'none';
        container.innerHTML = '';
        desc.textContent = '';
        characterData.expertise = [];
        validateAlignmentRequirement();
        return;
    }

    const { config: expertiseConfig, available, enforceSelection } = context;
    characterData.expertise = characterData.expertise.filter(opt => available.some(a => a.id === opt));

    panel.style.display = 'block';
    const maxSelectable = Math.min(expertiseConfig.count, available.length);
    if (enforceSelection) {
        desc.textContent = `Select ${expertiseConfig.count} proficiency${expertiseConfig.count > 1 ? 'ies' : ''} to gain expertise (double proficiency).`;
    } else if (maxSelectable > 0) {
        desc.textContent = `Choose up to ${maxSelectable} proficiency${maxSelectable > 1 ? 'ies' : ''} to gain expertise (optional).`;
    } else {
        desc.textContent = 'Gain proficiency in skills or tools to choose expertise.';
    }

    const cards = available.map(option => {
        const selected = characterData.expertise.includes(option.id);
        return `
            <label class="selection-card ${selected ? 'selected' : ''}" style="cursor:pointer;" onclick="toggleExpertise('${option.id.replace(/'/g, "\\'")}')">
                <div class="selection-card-title">${option.label}</div>
                <div class="selection-card-description" style="color:#94a3b8;">${option.type === 'tool' ? 'Tool' : 'Skill'} proficiency</div>
            </label>
        `;
    }).join('');

    container.innerHTML = `<div class="choice-grid">${cards}</div>`;
    validateAlignmentRequirement();
}

function getAvailableExpertiseOptions(config) {
    const options = [];
    const skillSet = new Set([
        ...(characterData.selectedSkills || []),
        ...(characterData.background?.skillProficiencies || [])
    ]);
    skillSet.forEach(skill => {
        options.push({
            id: skill,
            label: formatSkillName(skill),
            type: 'skill'
        });
    });

    if (config.includeTools && characterData.toolProficiencies) {
        config.includeTools.forEach(toolName => {
            const hasTool = characterData.toolProficiencies.some(tp => tp.toLowerCase() === toolName.toLowerCase());
            if (hasTool) {
                options.push({
                    id: toolName,
                    label: toolName,
                    type: 'tool'
                });
            }
        });
    }

    return options.sort((a, b) => a.label.localeCompare(b.label));
}

function toggleExpertise(optionId) {
    const config = characterData.class?.expertise;
    if (!config) return;
    const idx = characterData.expertise.indexOf(optionId);
    if (idx >= 0) {
        characterData.expertise.splice(idx, 1);
    } else {
        if (characterData.expertise.length >= config.count) {
            alert(`You can select only ${config.count} expertise option${config.count > 1 ? 's' : ''}.`);
            return;
        }
        characterData.expertise.push(optionId);
    }
    renderExpertisePanel();
}

// --------------------------------------
// Spellcasting
// --------------------------------------

function getSpellcastingConfig() {
    if (typeof SPELLCASTING_CONFIG === 'undefined') return null;
    const classId = characterData.class?.id;
    if (!classId) return null;
    return SPELLCASTING_CONFIG[classId] || null;
}

function getFinalAbilityScore(ability) {
    if (!ability) return 0;
    let score = characterData.abilities?.[ability] || 0;
    if (characterData.race?.abilityBonuses?.[ability]) {
        score += characterData.race.abilityBonuses[ability];
    }
    if (characterData.subrace?.abilityBonuses?.[ability]) {
        score += characterData.subrace.abilityBonuses[ability];
    }
    return score;
}

function getAbilityModifierFromScore(score) {
    return Math.floor((score - 10) / 2);
}

function getSpellsForClassAndLevel(classId, level) {
    if (typeof SPELL_LIST === 'undefined') return [];
    return SPELL_LIST.filter(spell => spell.level === level && spell.classes.includes(classId));
}

function getSpellDefinition(spellId) {
    if (typeof SPELL_LIST === 'undefined') return null;
    return SPELL_LIST.find(spell => spell.id === spellId) || null;
}

function getKnownSpellRequirement(config) {
    if (!config?.spellsKnown) return 0;
    return config.spellsKnown[characterData.level] || config.spellsKnown[1] || 0;
}

function calculatePreparedSpellCount(config, abilityMod) {
    if (!config?.prepared) return 0;
    const levelFactor = config.prepared.levelFactor || 'full';
    let total = abilityMod;
    if (levelFactor === 'full') {
        total += characterData.level;
    } else if (levelFactor === 'half') {
        total += Math.floor(characterData.level / 2);
    } else if (levelFactor === 'third') {
        total += Math.floor(characterData.level / 3);
    }
    total += config.prepared.bonus || 0;
    const minimum = config.prepared.min || 1;
    return Math.max(minimum, total);
}

function renderSpellsStep() {
    const summary = document.getElementById('spellCastingSummary');
    const container = document.getElementById('spellSelectionContainer');
    const nextBtn = document.getElementById('spellsNextBtn');
    if (!summary || !container || !nextBtn) return;

    ensureSpellData();

    if (!characterData.class) {
        summary.innerHTML = `
            <div class="detail-title">Spellcasting Overview</div>
            <div class="detail-description">Choose a class to see its spell options.</div>
        `;
        container.style.display = 'none';
        container.innerHTML = '';
        nextBtn.disabled = true;
        return;
    }

    const config = getSpellcastingConfig();
    if (!config) {
        summary.innerHTML = `
            <div class="detail-title">${characterData.class.name} Spellcasting</div>
            <div class="detail-description">This class does not prepare spells at 1st level. You can continue to the next step.</div>
        `;
        container.style.display = 'none';
        container.innerHTML = '';
        nextBtn.disabled = false;
        return;
    }

    const requiredLevel = config.enabledLevel || 1;
    if (characterData.level < requiredLevel) {
        summary.innerHTML = `
            <div class="detail-title">${characterData.class.name} Spellcasting</div>
            <div class="detail-description">
                ${characterData.class.name}s learn spells starting at level ${requiredLevel}. Reach that level to unlock these options.
            </div>
        `;
        container.style.display = 'none';
        container.innerHTML = '';
        nextBtn.disabled = false;
        return;
    }

    const abilityScore = getFinalAbilityScore(config.ability);
    const abilityMod = getAbilityModifierFromScore(abilityScore);
    const slotEntries = Object.entries(config.slots || {}).filter(([, count]) => count && count > 0);
    const slotDisplay = slotEntries.length
        ? slotEntries.map(([lvl, count]) => `<span style="margin-right: 12px;">Level ${lvl}: ${count} slot${count > 1 ? 's' : ''}</span>`).join('')
        : '<span>No spell slots yet</span>';

    summary.innerHTML = `
        <div class="detail-title">${characterData.class.name} Spellcasting</div>
        <div style="display:flex; flex-wrap:wrap; gap:20px; margin-top:15px;">
            <div>
                <div style="font-size:12px; color:#94a3b8;">Spellcasting Ability</div>
                <div style="font-size:22px; color:#c7d2fe; font-weight:700; text-transform:capitalize;">${config.ability || '—'} (${abilityMod >= 0 ? '+' : ''}${abilityMod})</div>
            </div>
            <div>
                <div style="font-size:12px; color:#94a3b8;">Spell Slots</div>
                <div style="font-size:16px; color:#c7d2fe;">${slotDisplay}</div>
            </div>
        </div>
    `;

    let sectionsHtml = '';
    const classId = characterData.class.id;

    if (config.cantripsKnown > 0) {
        const cantripOptions = getSpellsForClassAndLevel(classId, 0);
        sectionsHtml += buildSpellSelectionSection({
            title: 'Cantrips',
            subtitle: `Select ${config.cantripsKnown} cantrip${config.cantripsKnown > 1 ? 's' : ''} to know.`,
            required: config.cantripsKnown,
            selected: characterData.spells.cantrips,
            spells: cantripOptions,
            category: 'cantrip'
        });
    }

    const levelOneOptions = getSpellsForClassAndLevel(classId, 1);
    if (config.mode === 'known') {
        const knownRequirement = getKnownSpellRequirement(config);
        sectionsHtml += buildSpellSelectionSection({
            title: '1st-Level Spells',
            subtitle: `Select ${knownRequirement} spell${knownRequirement > 1 ? 's' : ''} to learn. Known spells can be cast using your available slots.`,
            required: knownRequirement,
            selected: characterData.spells.known,
            spells: levelOneOptions,
            category: 'known'
        });
    } else if (config.mode === 'prepared') {
        if (config.spellbookCount) {
            sectionsHtml += buildSpellSelectionSection({
                title: 'Spellbook Entries',
                subtitle: `Record ${config.spellbookCount} spells in your spellbook. Prepared spells must come from this list.`,
                required: config.spellbookCount,
                selected: characterData.spells.spellbook,
                spells: levelOneOptions,
                category: 'spellbook'
            });
        }
        const preparedCount = calculatePreparedSpellCount(config, abilityMod);
        sectionsHtml += buildSpellSelectionSection({
            title: 'Prepared Spells',
            subtitle: `Select ${preparedCount} spell${preparedCount > 1 ? 's' : ''} you have ready today.`,
            required: preparedCount,
            selected: characterData.spells.prepared,
            spells: levelOneOptions,
            category: 'prepared',
            enforceSpellbook: !!config.spellbookCount
        });
    }

    if (!sectionsHtml) {
        container.style.display = 'none';
        container.innerHTML = '';
    } else {
        container.style.display = 'block';
        container.innerHTML = sectionsHtml;
    }

    nextBtn.disabled = !areSpellsValid(config, abilityMod);
}

function buildSpellSelectionSection({ title, subtitle, required, selected, spells, category }) {
    if (!spells || !spells.length) {
        return `
            <div class="detail-panel active">
                <div class="detail-title">${title}</div>
                <div class="detail-description">No spells available for this class at this level.</div>
            </div>
        `;
    }
    const requirementMet = !required || selected.length === required;
    const cards = spells.map(spell => {
        const isSelected = selected.includes(spell.id);
        const safeId = spell.id.replace(/'/g, "\\'");
        return `
            <div class="selection-card ${isSelected ? 'selected' : ''}" onclick="toggleSpellSelection('${category}', '${safeId}')">
                <div class="selection-card-title">${spell.name}</div>
                <div class="selection-card-description" style="color:#94a3b8;">
                    ${spell.school} • ${spell.castingTime}
                </div>
                <div class="choice-sublabel" style="margin-top:8px;">${spell.shortDescription}</div>
            </div>
        `;
    }).join('');

    return `
        <div class="detail-panel active">
            <div class="detail-title">${title}</div>
            <p class="detail-description">${subtitle}</p>
            <div class="choice-count ${requirementMet ? '' : 'error'}">
                Selected: ${selected.length} / ${required || selected.length}
            </div>
            <div class="selection-grid">
                ${cards}
            </div>
        </div>
    `;
}

function getSpellSelectionLimit(category, config, abilityMod) {
    switch (category) {
        case 'cantrip':
            return config.cantripsKnown || 0;
        case 'known':
            return getKnownSpellRequirement(config);
        case 'spellbook':
            return config.spellbookCount || 0;
        case 'prepared':
            return calculatePreparedSpellCount(config, abilityMod);
        default:
            return 0;
    }
}

function areSpellsValid(config, abilityMod) {
    if (!config) return true;
    const requiredLevel = config.enabledLevel || 1;
    if (characterData.level < requiredLevel) return true;

    if (config.cantripsKnown && characterData.spells.cantrips.length !== config.cantripsKnown) {
        return false;
    }

    if (config.mode === 'known') {
        const knownRequirement = getKnownSpellRequirement(config);
        return knownRequirement ? characterData.spells.known.length === knownRequirement : true;
    }

    if (config.mode === 'prepared') {
        if (config.spellbookCount && characterData.spells.spellbook.length !== config.spellbookCount) {
            return false;
        }
        const preparedRequirement = calculatePreparedSpellCount(config, abilityMod);
        return preparedRequirement ? characterData.spells.prepared.length === preparedRequirement : true;
    }

    return true;
}

function toggleSpellSelection(category, spellId) {
    ensureSpellData();
    const config = getSpellcastingConfig();
    if (!config) return;
    const abilityMod = getAbilityModifierFromScore(getFinalAbilityScore(config.ability));
    const listMap = {
        cantrip: characterData.spells.cantrips,
        known: characterData.spells.known,
        prepared: characterData.spells.prepared,
        spellbook: characterData.spells.spellbook
    };
    const targetList = listMap[category];
    if (!targetList) return;

    const idx = targetList.indexOf(spellId);
    if (idx >= 0) {
        targetList.splice(idx, 1);
        if (category === 'spellbook') {
            const preparedIdx = characterData.spells.prepared.indexOf(spellId);
            if (preparedIdx >= 0) {
                characterData.spells.prepared.splice(preparedIdx, 1);
            }
        }
    } else {
        const limit = getSpellSelectionLimit(category, config, abilityMod);
        if (limit && targetList.length >= limit) {
            alert(`You can select only ${limit} ${category === 'cantrip' ? 'cantrip' : 'spell'}${limit > 1 ? 's' : ''} here.`);
            return;
        }
        if (category === 'prepared' && config.spellbookCount && !characterData.spells.spellbook.includes(spellId)) {
            alert('Add the spell to your spellbook before preparing it.');
            return;
        }
        targetList.push(spellId);
    }

    renderSpellsStep();
}

function handleSpellsContinue() {
    const config = getSpellcastingConfig();
    const requiredLevel = config?.enabledLevel || 1;
    if (!config || characterData.level < requiredLevel) {
        nextStep();
        return;
    }
    const abilityMod = getAbilityModifierFromScore(getFinalAbilityScore(config.ability));
    if (!areSpellsValid(config, abilityMod)) {
        alert('Please complete your spell selections before continuing.');
        return;
    }
    characterData.spells.slots = config.slots || {};
    characterData.spells.ability = config.ability || null;
    characterData.spells.mode = config.mode || null;
    nextStep();
}

// Navigation
function nextStep() {
    if (currentStep === 4) {
        const alignment = characterData.alignment && characterData.alignment.trim();
        if (!alignment) {
            alert('Please select an alignment before continuing.');
            return;
        }
        const expertiseStatus = getExpertiseContext();
        if (!expertiseStatus.satisfied) {
            alert('Please select the required expertise options for your class before continuing.');
            return;
        }
    }
    // After equipment step (5), redirect to ability score roller
    if (currentStep === 5) {
        // Save current progress to localStorage
        localStorage.setItem('wizardProgress', JSON.stringify(characterData));
        localStorage.setItem('wizardStep', currentStep);
        // Redirect to ability score roller
        window.location.href = '/ability-score-roller.html';
        return;
    }

    if (currentStep < TOTAL_WIZARD_STEPS) {
        // Hide current step
        document.querySelector(`.wizard-step[data-step="${currentStep}"]`).classList.remove('active');

        // Show next step
        currentStep++;
        document.querySelector(`.wizard-step[data-step="${currentStep}"]`).classList.add('active');

        if (currentStep === 5) {
            renderEquipmentStep();
        }
        if (currentStep === 7) {
            renderSpellsStep();
        }

        // Update progress
        updateProgressBar();

        // If final step, show summary
        if (currentStep === TOTAL_WIZARD_STEPS) {
            showCharacterSummary();
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function goBack() {
    if (currentStep > 1) {
        // Hide current step
        document.querySelector(`.wizard-step[data-step="${currentStep}"]`).classList.remove('active');

        // Show previous step
        let targetStep = currentStep - 1;

        // Step 6 is handled externally (ability score roller), so skip to equipment
        if (targetStep === 6) {
            targetStep = 5;
        }

        currentStep = targetStep;
        document.querySelector(`.wizard-step[data-step="${currentStep}"]`).classList.add('active');
        if (currentStep === 5) {
            renderEquipmentStep();
        }
        if (currentStep === 4) {
            initializeNarrativeInputs();
        }
        if (currentStep === 7) {
            renderSpellsStep();
        }

        // Update progress
        updateProgressBar();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        // Go back to dashboard or campaign page
        const urlParams = new URLSearchParams(window.location.search);
        const campaignId = urlParams.get('campaignId');
        if (campaignId) {
            window.location.href = `/campaign.html?id=${campaignId}`;
        } else {
            window.location.href = '/dashboard.html';
        }
    }
}

function updateProgressBar() {
    // Update active step
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 === currentStep) {
            step.classList.add('active');
        } else if (index + 1 < currentStep) {
            step.classList.add('completed');
        }
    });

    // Update progress line
    const progressLine = document.getElementById('progressLine');
    const progressPercent = ((currentStep - 1) / (TOTAL_WIZARD_STEPS - 1)) * 100;
    progressLine.style.width = `${progressPercent}%`;
}

// Show Character Summary
function showCharacterSummary() {
    if (!characterData.inventory.length) {
        buildInventory();
    }
    // Apply racial bonuses to abilities
    const finalAbilities = { ...characterData.abilities };
    if (characterData.race && characterData.race.abilityBonuses) {
        Object.entries(characterData.race.abilityBonuses).forEach(([ability, bonus]) => {
            finalAbilities[ability] += bonus;
        });
    }
    // Apply subrace bonuses
    if (characterData.subrace && characterData.subrace.abilityBonuses) {
        Object.entries(characterData.subrace.abilityBonuses).forEach(([ability, bonus]) => {
            finalAbilities[ability] += bonus;
        });
    }

    // Calculate modifiers
    const getModifier = (ability) => Math.floor((finalAbilities[ability] - 10) / 2);
    const formatBonus = (value) => value >= 0 ? `+${value}` : `${value}`;

    const strMod = getModifier('strength');
    const dexMod = getModifier('dexterity');
    const conMod = getModifier('constitution');
    const intMod = getModifier('intelligence');
    const wisMod = getModifier('wisdom');
    const chaMod = getModifier('charisma');

    // Proficiency bonus
    const profBonus = Math.floor((characterData.level - 1) / 4) + 2;

    // Check for racial HP bonuses (e.g., Dwarven Toughness)
    const hasDwarvenToughness = characterData.subrace?.traits?.some(trait =>
        (typeof trait === 'object' && trait.name === 'Dwarven Toughness') ||
        (typeof trait === 'string' && trait.includes('Dwarven Toughness'))
    );
    const toughnessBonus = hasDwarvenToughness ? characterData.level : 0;

    // Calculate HP (hit die max + CON mod + racial bonuses)
    const hitDieMax = parseInt(characterData.class.hitDie.substring(1));
    const suggestedHP = hitDieMax + conMod + toughnessBonus;

    // AC (unarmored)
    const baseAC = 10 + dexMod;

    // Initiative
    const initiative = dexMod;

    // Spell stats if applicable
    const spellConfig = getSpellcastingConfig();
    const spellLevelUnlocked = spellConfig ? characterData.level >= (spellConfig.enabledLevel || 1) : false;
    const storedSpellAbility = characterData.spells?.ability;
    const spellAbility = storedSpellAbility || (spellLevelUnlocked ? spellConfig?.ability : null) || null;
    const fallbackSlots = spellLevelUnlocked ? (spellConfig?.slots || {}) : {};
    const spellSlots = (characterData.spells?.slots && Object.keys(characterData.spells.slots).length)
        ? characterData.spells.slots
        : fallbackSlots;
    const spellMod = spellAbility ? getModifier(spellAbility) : 0;
    const spellDC = spellAbility ? 8 + profBonus + spellMod : null;
    const spellAttack = spellAbility ? profBonus + spellMod : null;

    // All skill proficiencies
    const allSkillProfs = [
        ...(characterData.selectedSkills || []),
        ...(characterData.background?.skillProficiencies || [])
    ];
    const expertiseContext = getExpertiseContext();
    const expertiseDetails = expertiseContext.selections;
    const expertiseIds = characterData.expertise || [];

    // Skill mapping to abilities
    const SKILL_MAP = {
        'acrobatics': 'dexterity',
        'animalhandling': 'wisdom',
        'arcana': 'intelligence',
        'athletics': 'strength',
        'deception': 'charisma',
        'history': 'intelligence',
        'insight': 'wisdom',
        'intimidation': 'charisma',
        'investigation': 'intelligence',
        'medicine': 'wisdom',
        'nature': 'intelligence',
        'perception': 'wisdom',
        'performance': 'charisma',
        'persuasion': 'charisma',
        'religion': 'intelligence',
        'sleightofhand': 'dexterity',
        'stealth': 'dexterity',
        'survival': 'wisdom'
    };

    // Calculate passive perception
    const perceptionProf = allSkillProfs.some(s => s.toLowerCase().replace(/\s+/g, '') === 'perception');
    const passivePerception = 10 + wisMod + (perceptionProf ? profBonus : 0);

    // Combine all proficiencies
    const allSkills = [
        ...(characterData.class?.saves || []),
        ...(characterData.selectedSkills || []),  // Skills chosen from class
        ...(characterData.background?.skillProficiencies || [])
    ];

    const summaryLanguages = getAllLanguages();
    const summary = document.getElementById('characterSummary');
    summary.innerHTML = `
        <div style="background: rgba(129, 140, 248, 0.08); border: 2px solid rgba(129, 140, 248, 0.3); border-radius: 16px; padding: 30px; margin-bottom: 20px;">
            <h2 style="font-size: 36px; color: #a5b4fc; margin-bottom: 20px; text-align: center;">
                ${characterData.name}
            </h2>
            <p style="text-align: center; color: #94a3b8; font-size: 18px; margin-bottom: 30px;">
                Level ${characterData.level} ${characterData.race?.name} ${characterData.class?.name}
            </p>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
                <div style="background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 10px;">
                    <div style="font-size: 12px; color: #94a3b8; margin-bottom: 5px;">CLASS</div>
                    <div style="font-size: 18px; color: #a5b4fc; font-weight: 600;">${characterData.class?.icon} ${characterData.class?.name}</div>
                </div>
                <div style="background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 10px;">
                    <div style="font-size: 12px; color: #94a3b8; margin-bottom: 5px;">RACE</div>
                    <div style="font-size: 18px; color: #a5b4fc; font-weight: 600;">${characterData.race?.icon} ${characterData.race?.name}</div>
                    ${characterData.subrace ? `<div style="font-size: 14px; color: #94a3b8; margin-top: 3px;">${characterData.subrace.name}</div>` : ''}
                </div>
                <div style="background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 10px;">
                    <div style="font-size: 12px; color: #94a3b8; margin-bottom: 5px;">BACKGROUND</div>
                    <div style="font-size: 18px; color: #a5b4fc; font-weight: 600;">${characterData.background?.icon} ${characterData.background?.name}</div>
                </div>
                <div style="background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 10px;">
                    <div style="font-size: 12px; color: #94a3b8; margin-bottom: 5px;">HIT DIE</div>
                    <div style="font-size: 18px; color: #a5b4fc; font-weight: 600;">${characterData.class?.hitDie}</div>
                </div>
            </div>

            <div style="background: rgba(0, 0, 0, 0.2); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="color: #818cf8; margin-bottom: 15px;">Ability Scores (with Racial Bonuses)</h3>
                <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px;">
                    ${Object.entries(finalAbilities).map(([ability, score]) => {
                        const modifier = Math.floor((score - 10) / 2);
                        const modStr = modifier >= 0 ? `+${modifier}` : modifier;
                        return `
                            <div style="text-align: center; background: rgba(129, 140, 248, 0.1); padding: 10px; border-radius: 8px;">
                                <div style="font-size: 10px; color: #94a3b8;">${ability.substring(0, 3).toUpperCase()}</div>
                                <div style="font-size: 24px; color: #a5b4fc; font-weight: 700;">${score}</div>
                                <div style="font-size: 14px; color: #818cf8;">${modStr}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <div style="background: rgba(0, 0, 0, 0.2); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="color: #818cf8; margin-bottom: 15px;">Calculated Statistics</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                    <div style="background: rgba(129, 140, 248, 0.1); padding: 15px; border-radius: 8px;">
                        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 5px;">PROFICIENCY BONUS</div>
                        <div style="font-size: 20px; color: #a5b4fc; font-weight: 700;">${formatBonus(profBonus)}</div>
                    </div>
                    <div style="background: rgba(129, 140, 248, 0.1); padding: 15px; border-radius: 8px;">
                        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 5px;">INITIATIVE</div>
                        <div style="font-size: 20px; color: #a5b4fc; font-weight: 700;">${formatBonus(initiative)}</div>
                    </div>
                    <div style="background: rgba(129, 140, 248, 0.1); padding: 15px; border-radius: 8px;">
                        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 5px;">PASSIVE PERCEPTION</div>
                        <div style="font-size: 20px; color: #a5b4fc; font-weight: 700;">${passivePerception}</div>
                    </div>
                    <div style="background: rgba(129, 140, 248, 0.1); padding: 15px; border-radius: 8px;">
                        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 5px;">SUGGESTED HP</div>
                        <div style="font-size: 20px; color: #a5b4fc; font-weight: 700;">${Math.max(1, suggestedHP)}</div>
                        ${toughnessBonus ? `<div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Includes +${toughnessBonus} HP from Dwarven Toughness</div>` : ''}
                    </div>
                    <div style="background: rgba(129, 140, 248, 0.1); padding: 15px; border-radius: 8px;">
                        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 5px;">BASE AC (UNARMORED)</div>
                        <div style="font-size: 20px; color: #a5b4fc; font-weight: 700;">${baseAC}</div>
                    </div>
                    <div style="background: rgba(129, 140, 248, 0.1); padding: 15px; border-radius: 8px;">
                        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 5px;">SPEED</div>
                        <div style="font-size: 20px; color: #a5b4fc; font-weight: 700;">${characterData.race?.speed} ft</div>
                    </div>
                </div>
            </div>

            <div style="background: rgba(0, 0, 0, 0.2); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="color: #818cf8; margin-bottom: 15px;">Combat Statistics</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                    <div style="background: rgba(139, 92, 246, 0.1); padding: 15px; border-radius: 8px;">
                        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 5px;">MELEE ATTACK</div>
                        <div style="font-size: 20px; color: #c4b5fd; font-weight: 700;">${formatBonus(strMod + profBonus)}</div>
                        <div style="font-size: 10px; color: #a78bfa; margin-top: 3px;">STR + Proficiency</div>
                    </div>
                    <div style="background: rgba(139, 92, 246, 0.1); padding: 15px; border-radius: 8px;">
                        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 5px;">RANGED ATTACK</div>
                        <div style="font-size: 20px; color: #c4b5fd; font-weight: 700;">${formatBonus(dexMod + profBonus)}</div>
                        <div style="font-size: 10px; color: #a78bfa; margin-top: 3px;">DEX + Proficiency</div>
                    </div>
                    ${spellDC !== null ? `
                        <div style="background: rgba(139, 92, 246, 0.1); padding: 15px; border-radius: 8px;">
                            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 5px;">SPELL SAVE DC</div>
                            <div style="font-size: 20px; color: #c4b5fd; font-weight: 700;">${spellDC}</div>
                            <div style="font-size: 10px; color: #a78bfa; margin-top: 3px;">${spellAbility.substring(0, 3).toUpperCase()} spells</div>
                        </div>
                        <div style="background: rgba(139, 92, 246, 0.1); padding: 15px; border-radius: 8px;">
                            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 5px;">SPELL ATTACK</div>
                            <div style="font-size: 20px; color: #c4b5fd; font-weight: 700;">${formatBonus(spellAttack)}</div>
                            <div style="font-size: 10px; color: #a78bfa; margin-top: 3px;">${spellAbility.substring(0, 3).toUpperCase()} + Proficiency</div>
                        </div>
                    ` : ''}
                </div>
            </div>

            <div style="background: rgba(0, 0, 0, 0.2); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="color: #818cf8; margin-bottom: 15px;">Saving Throws</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                    ${['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map(ability => {
                        const abilityMod = getModifier(ability);
                        const isProficient = characterData.class?.saves.includes(ability);
                        const totalBonus = abilityMod + (isProficient ? profBonus : 0);
                        return `
                            <div style="background: rgba(129, 140, 248, 0.05); padding: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                                <span style="color: ${isProficient ? '#10b981' : '#94a3b8'};">
                                    ${isProficient ? '●' : '○'} ${ability.charAt(0).toUpperCase() + ability.slice(1, 3).toUpperCase()}
                                </span>
                                <span style="color: #a5b4fc; font-weight: 600;">${formatBonus(totalBonus)}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <div style="background: rgba(0, 0, 0, 0.2); padding: 20px; border-radius: 10px;">
                <h3 style="color: #818cf8; margin-bottom: 15px;">Skills</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                    ${Object.entries(SKILL_MAP).map(([skill, ability]) => {
                        const skillName = skill.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        const displayName = skill === 'sleightofhand' ? 'Sleight of Hand' :
                                          skill === 'animalhandling' ? 'Animal Handling' :
                                          skillName.charAt(0).toUpperCase() + skillName.slice(1);
                        const abilityMod = getModifier(ability);
                        const isProficient = allSkillProfs.some(s => s.toLowerCase().replace(/\s+/g, '') === skill);
                        const hasExpertise = expertiseIds.includes(skill);
                        const totalBonus = abilityMod + (isProficient ? profBonus : 0) + (hasExpertise ? profBonus : 0);
                        const indicatorColor = hasExpertise ? '#fbbf24' : (isProficient ? '#10b981' : '#94a3b8');
                        const indicatorSymbol = hasExpertise ? '✦' : (isProficient ? '●' : '○');
                        const expertiseBadge = hasExpertise ? `<span style="font-size: 11px; color: #facc15; margin-left: 6px;">Expertise</span>` : '';
                        return `
                            <div style="background: rgba(129, 140, 248, 0.05); padding: 8px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; font-size: 14px;">
                                <span style="color: ${indicatorColor}; display:flex; align-items:center; gap:6px;">
                                    ${indicatorSymbol} ${displayName} <span style="font-size: 11px;">(${ability.substring(0, 3).toUpperCase()})</span> ${expertiseBadge}
                                </span>
                                <span style="color: #a5b4fc; font-weight: 600;">${formatBonus(totalBonus)}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
                ${expertiseDetails.length ? `
                <div style="margin-top: 18px; background: rgba(0, 0, 0, 0.25); padding: 12px 16px; border-radius: 8px;">
                    <div style="color: #facc15; font-weight: 600; margin-bottom: 6px;">Expertise Focus</div>
                    ${expertiseDetails.map(entry => `
                        <div style="color: #fde68a; font-size: 14px; margin-bottom: 4px;">
                            • ${entry.label}${entry.type === 'tool' ? ' (Tool)' : ''}
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            </div>

            <div style="background: rgba(0, 0, 0, 0.2); padding: 20px; border-radius: 10px; margin-top: 20px;">
                <h3 style="color: #818cf8; margin-bottom: 15px;">Racial Features & Proficiencies</h3>
                <div style="color: #cbd5e1; line-height: 1.6;">
                    ${characterData.race?.traits ? characterData.race.traits.map(trait => {
                        if (typeof trait === 'string') {
                            return `<div style="margin-bottom: 10px;">• ${trait}</div>`;
                        } else if (!trait.choice) {
                            return `<div style="margin-bottom: 10px;"><strong>• ${trait.name}:</strong> ${trait.description}</div>`;
                        }
                        return '';
                    }).join('') : ''}
                    ${characterData.subrace?.traits ? characterData.subrace.traits.map(trait => {
                        if (typeof trait === 'string') {
                            return `<div style="margin-bottom: 10px;">• ${trait}</div>`;
                        } else {
                            return `<div style="margin-bottom: 10px;"><strong>• ${trait.name}:</strong> ${trait.description}</div>`;
                        }
                    }).join('') : ''}
                    ${characterData.toolProficiencies.length ? `<div style="margin-bottom: 10px;"><strong>• Tool Proficiencies:</strong> ${characterData.toolProficiencies.join(', ')}</div>` : ''}
                    ${summaryLanguages.length ? `<div style="margin-bottom: 10px;"><strong>• Languages:</strong> ${summaryLanguages.map(lang => escapeHtml(lang)).join(', ')}</div>` : ''}
                </div>
            </div>

            <div style="background: rgba(0, 0, 0, 0.2); padding: 20px; border-radius: 10px; margin-top: 20px;">
                <h3 style="color: #818cf8; margin-bottom: 15px;">Alignment & Personality</h3>
                <div style="color: #cbd5e1;">
                    <div style="margin-bottom: 10px;">
                        <strong>Alignment:</strong> ${characterData.alignment || 'Not specified'}
                    </div>
                    ${characterData.personality ? `<div style="margin-bottom: 8px;"><strong>Personality:</strong> ${characterData.personality}</div>` : ''}
                    ${characterData.ideals ? `<div style="margin-bottom: 8px;"><strong>Ideals:</strong> ${characterData.ideals}</div>` : ''}
                    ${characterData.bonds ? `<div style="margin-bottom: 8px;"><strong>Bonds:</strong> ${characterData.bonds}</div>` : ''}
                    ${characterData.flaws ? `<div><strong>Flaws:</strong> ${characterData.flaws}</div>` : ''}
                </div>
            </div>

            <div style="background: rgba(0, 0, 0, 0.2); padding: 20px; border-radius: 10px; margin-top: 20px;">
                <h3 style="color: #818cf8; margin-bottom: 15px;">Starting Inventory</h3>
                <div style="color: #cbd5e1; line-height: 1.6;">
                    ${(characterData.inventory && characterData.inventory.length) ? characterData.inventory.map(item => `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>${item.name}${item.type ? ` <span style="color:#94a3b8;">(${item.type})</span>` : ''}</span>
                            <span style="color: #a5b4fc;">x${item.quantity || 1}</span>
                        </div>
                    `).join('') : '<div>No starting equipment selected.</div>'}
                </div>
            </div>
        </div>
    `;

    const resolvedSpellMode = characterData.spells?.mode || (spellLevelUnlocked ? spellConfig?.mode : null) || 'known';
    const cantripDetails = (characterData.spells?.cantrips || []).map(getSpellDefinition).filter(Boolean);
    const leveledIds = resolvedSpellMode === 'known'
        ? (characterData.spells?.known || [])
        : (characterData.spells?.prepared || []);
    const leveledDetails = (leveledIds || []).map(getSpellDefinition).filter(Boolean);
    const slotSummary = Object.entries(spellSlots || {})
        .filter(([, count]) => count && count > 0)
        .map(([lvl, count]) => `Level ${lvl}: ${count}`)
        .join(' • ');

    if (spellAbility || cantripDetails.length || leveledDetails.length) {
        summary.innerHTML += `
            <div style="background: rgba(0, 0, 0, 0.2); padding: 20px; border-radius: 10px; margin-top: 20px;">
                <h3 style="color: #818cf8; margin-bottom: 15px;">Spellcasting</h3>
                <div style="color:#cbd5e1; margin-bottom: 10px;">
                    ${spellAbility ? `<div><strong>Ability:</strong> ${spellAbility.charAt(0).toUpperCase() + spellAbility.slice(1)} (${formatBonus(spellMod)})</div>` : '<div><strong>Ability:</strong> —</div>'}
                    ${slotSummary ? `<div><strong>Slots:</strong> ${slotSummary}</div>` : '<div><strong>Slots:</strong> —</div>'}
                </div>
                ${cantripDetails.length ? `
                <div style="margin-bottom: 12px;">
                    <div style="font-size:13px; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">Cantrips</div>
                    ${cantripDetails.map(spell => `
                        <div style="margin-top:6px;">
                            <strong>${spell.name}</strong> — ${spell.shortDescription}
                        </div>
                    `).join('')}
                </div>` : ''}
                ${leveledDetails.length ? `
                <div>
                    <div style="font-size:13px; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">1st-Level Spells ${resolvedSpellMode === 'known' ? '(Known)' : '(Prepared)'}</div>
                    ${leveledDetails.map(spell => `
                        <div style="margin-top:6px;">
                            <strong>${spell.name}</strong> — ${spell.shortDescription}
                        </div>
                    `).join('')}
                </div>` : ''}
            </div>
        `;
    }
}

// Create Character
async function createCharacter() {
    try {
        // Get user info
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            alert('Please log in first');
            window.location.href = '/login.html';
            return;
        }
        const user = JSON.parse(userStr);

        const urlParams = new URLSearchParams(window.location.search);
        const campaignId = urlParams.get('campaignId') ? parseInt(urlParams.get('campaignId')) : null;

        // Calculate final ability scores with racial bonuses
        const finalAbilities = { ...characterData.abilities };
        if (characterData.race && characterData.race.abilityBonuses) {
            Object.entries(characterData.race.abilityBonuses).forEach(([ability, bonus]) => {
                finalAbilities[ability] += bonus;
            });
        }
        // Apply subrace bonuses
        if (characterData.subrace && characterData.subrace.abilityBonuses) {
            Object.entries(characterData.subrace.abilityBonuses).forEach(([ability, bonus]) => {
                finalAbilities[ability] += bonus;
            });
        }

        // Calculate HP (Hit die max value + CON modifier + racial bonuses)
        const hitDieMax = parseInt(characterData.class.hitDie.substring(1));
        const conMod = Math.floor((finalAbilities.constitution - 10) / 2);
        const hasDwarvenToughness = characterData.subrace?.traits?.some(trait =>
            (typeof trait === 'object' && trait.name === 'Dwarven Toughness') ||
            (typeof trait === 'string' && trait.includes('Dwarven Toughness'))
        );
        const toughnessBonus = hasDwarvenToughness ? characterData.level : 0;
        const startingHP = Math.max(1, hitDieMax + conMod + toughnessBonus);

        // Prepare character data
        // Combine all skills (from class selection and background)
        const allSkills = [
            ...(characterData.selectedSkills || []),
            ...(characterData.background.skillProficiencies || [])
        ];
        const expertiseDetails = getExpertiseContext().selections;

        // Build proficiencies string
        let proficienciesStr = `Armor: ${characterData.class.armorProficiency}\nWeapons: ${characterData.class.weaponProficiency}`;

        // Add racial weapon proficiencies (e.g., Dwarven Combat Training)
        const racialWeaponTrait = characterData.race.traits?.find(t =>
            (typeof t === 'object' && t.name === 'Dwarven Combat Training') ||
            (typeof t === 'string' && t.includes('Combat Training'))
        );
        if (racialWeaponTrait) {
            const description = typeof racialWeaponTrait === 'string' ? racialWeaponTrait : racialWeaponTrait.description;
            proficienciesStr += `\nRacial Weapons: ${description}`;
        }

        // Add subrace armor proficiencies (e.g., Dwarven Armor Training)
        if (characterData.subrace?.traits) {
            const armorTrait = characterData.subrace.traits.find(t =>
                (typeof t === 'object' && t.name === 'Dwarven Armor Training')
            );
            if (armorTrait) {
                proficienciesStr += `\nRacial Armor: ${armorTrait.description}`;
            }
        }

        // Add tool proficiency
        if (characterData.toolProficiencies.length) {
            proficienciesStr += `\nTools: ${characterData.toolProficiencies.join(', ')}`;
        }
        if (expertiseDetails.length) {
            const expertiseList = expertiseDetails
                .map(entry => `${entry.label}${entry.type === 'tool' ? ' (Tool)' : ''}`)
                .join(', ');
            proficienciesStr += `\nExpertise: ${expertiseList}`;
        }

        const newCharacter = {
            userId: user.id,
            campaignId: campaignId, // Can be null if creating character first
            name: characterData.name,
            race: characterData.subrace ? `${characterData.race.name} (${characterData.subrace.name})` : characterData.race.name,
            class: characterData.class.name,
            level: characterData.level,
            background: characterData.background.name,
            alignment: characterData.alignment || '',
            abilities: finalAbilities,
            savingThrows: characterData.class.saves,
            skills: allSkills,  // All skills from class + background
            maxHp: startingHP,
            hp: startingHP,
            ac: 10 + Math.floor((finalAbilities.dexterity - 10) / 2), // Base AC
            speed: characterData.race.speed,
            languages: getAllLanguages(),
            proficiencies: proficienciesStr,
            equipment: characterData.inventory,
            inventory: characterData.inventory,
            personality: characterData.personality || '',
            ideals: characterData.ideals || '',
            bonds: characterData.bonds || '',
            flaws: characterData.flaws || '',
            backstory: characterData.background.feature,
            expertise: characterData.expertise,
            spells: characterData.spells,
            profileImage: null,
            initiative: Math.floor(((finalAbilities.dexterity ?? 10) - 10) / 2)
        };

        // Send to server
        const response = await fetch('/player', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCharacter)
        });

        const data = await response.json();

        if (data.success) {
            // If character was created with a campaign, go to that campaign
            if (campaignId) {
                alert('Character created successfully!');
                window.location.href = `/campaign.html?id=${campaignId}`;
            } else {
                // If no campaign, show the join campaign modal
                showJoinCampaignModal();
            }
        } else {
            alert('Failed to create character: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error creating character:', error);
        alert('Failed to create character. Please try again.');
    }
}

// Show Join Campaign Modal
function showJoinCampaignModal() {
    const modal = document.getElementById('joinCampaignModal');
    modal.classList.add('show');
}

// Close Join Campaign Modal
function closeJoinCampaignModal() {
    const modal = document.getElementById('joinCampaignModal');
    modal.classList.remove('show');
}

// Join Campaign from Modal
async function joinCampaignFromModal() {
    const campaignCode = document.getElementById('campaignCodeInput').value.trim().toUpperCase();

    if (!campaignCode) {
        alert('Please enter a campaign code');
        return;
    }

    try {
        const userStr = localStorage.getItem('user');
        const user = JSON.parse(userStr);

        const response = await fetch('/campaigns/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: campaignCode,
                userId: user.id
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('Successfully joined campaign!');
            window.location.href = `/campaign.html?id=${data.campaignId}`;
        } else {
            alert(data.error || 'Failed to join campaign');
        }
    } catch (error) {
        console.error('Error joining campaign:', error);
        alert('Failed to join campaign. Please try again.');
    }
}

// Skip joining campaign and go to dashboard
function skipJoinCampaign() {
    alert('Character created successfully! You can join a campaign later from the dashboard.');
    window.location.href = '/dashboard.html';
}

function cancelCharacterCreation() {
    if (confirm('Cancel character creation and return to the dashboard? Unsaved progress will be lost.')) {
        window.location.href = '/dashboard.html';
    }
}

// Skill mapping for display names
const SKILL_ABILITY_MAP = {
    'acrobatics': 'DEX', 'animalhandling': 'WIS', 'arcana': 'INT', 'athletics': 'STR',
    'deception': 'CHA', 'history': 'INT', 'insight': 'WIS', 'intimidation': 'CHA',
    'investigation': 'INT', 'medicine': 'WIS', 'nature': 'INT', 'perception': 'WIS',
    'performance': 'CHA', 'persuasion': 'CHA', 'religion': 'INT', 'sleightofhand': 'DEX',
    'stealth': 'DEX', 'survival': 'WIS'
};

function formatSkillName(skill) {
    // Convert camelCase to Title Case
    return skill.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

// Show skill selection modal
function showSkillSelectionModal(cls) {
    currentChoiceType = 'skills';
    currentChoiceData = {
        count: cls.skillChoices,
        options: cls.skillOptions
    };

    document.getElementById('choiceModalTitle').textContent = `Choose ${cls.skillChoices} Skills`;
    document.getElementById('choiceModalDescription').textContent =
        `Select ${cls.skillChoices} skill proficiencies for your ${cls.name}`;

    const content = document.getElementById('choiceModalContent');
    content.innerHTML = `
        <div class="choice-count" id="choiceCount">
            Selected: <span id="selectedCount">0</span> / ${cls.skillChoices}
        </div>
        <div class="choice-grid">
            ${cls.skillOptions.map(skill => `
                <div class="choice-item" data-choice="${skill}" onclick="toggleChoice(this)">
                    <div class="choice-checkbox"></div>
                    <div>
                        <div class="choice-label">${formatSkillName(skill)}</div>
                        <div class="choice-sublabel">${SKILL_ABILITY_MAP[skill.toLowerCase()]}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Pre-select previously selected skills if any
    if (characterData.selectedSkills.length > 0) {
        characterData.selectedSkills.forEach(skill => {
            const item = content.querySelector(`[data-choice="${skill}"]`);
            if (item) item.classList.add('selected');
        });
        updateChoiceCount();
    }

    document.getElementById('choiceModal').classList.add('show');
}

// Toggle choice selection
function toggleChoice(choiceOrElement) {
    const item = typeof choiceOrElement === 'string'
        ? document.querySelector(`[data-choice="${(typeof CSS !== 'undefined' && CSS.escape) ? CSS.escape(choiceOrElement) : choiceOrElement.replace(/"/g, '\\"')}"]`)
        : choiceOrElement;
    if (!item) return;

    const isSelected = item.classList.contains('selected');
    const count = currentChoiceData.count;
    const currentSelected = document.querySelectorAll('.choice-item.selected').length;

    // For single-selection (count === 1), deselect all others first
    if (count === 1 && !isSelected) {
        document.querySelectorAll('.choice-item.selected').forEach(el => {
            el.classList.remove('selected');
        });
        item.classList.add('selected');
    } else if (isSelected) {
        // Deselect
        item.classList.remove('selected');
    } else {
        // Select if under limit (multi-select)
        if (currentSelected < count) {
            item.classList.add('selected');
        }
    }

    updateChoiceCount();
}

// Update choice count display
function updateChoiceCount() {
    const selected = document.querySelectorAll('.choice-item.selected').length;
    const countEl = document.getElementById('choiceCount');
    const selectedCountEl = document.getElementById('selectedCount');

    if (selectedCountEl) {
        selectedCountEl.textContent = selected;
    } else if (countEl) {
        // For single-selection prompts, show current selection status inline
        countEl.textContent = selected === currentChoiceData.count
            ? 'Selection complete'
            : 'Select one option';
    }

    if (selected === currentChoiceData.count) {
        if (countEl) countEl.classList.remove('error');
        document.getElementById('confirmChoicesBtn').disabled = false;
    } else {
        if (countEl) countEl.classList.add('error');
        document.getElementById('confirmChoicesBtn').disabled = true;
    }
}

// Close choice modal
function closeChoiceModal() {
    document.getElementById('choiceModal').classList.remove('show');
    currentChoiceType = null;
    currentChoiceData = null;
}

// Confirm choices
function confirmChoices() {
    const selectedItems = document.querySelectorAll('.choice-item.selected');
    const selected = Array.from(selectedItems).map(item => item.dataset.choice);

    if (currentChoiceType === 'skills') {
        characterData.selectedSkills = selected;
        renderExpertisePanel();
        closeChoiceModal();
        // Enable the next button after skills are selected
        if (classAdvancePending) {
            handleClassContinue();
        } else {
            document.getElementById('classNextBtn').disabled = false;
        }
    } else if (currentChoiceType === 'subrace') {
        if (selected.length === 1) {
            const subrace = characterData.race.subraces.find(sr => sr.id === selected[0]);
            characterData.subrace = subrace;
            resetLanguageChoicesForSource('subrace');
            renderLanguageSelectionPanel();
            closeChoiceModal();
            if (raceAdvancePending) {
                handleRaceContinue();
            }
        }
    } else if (currentChoiceType === 'toolProficiency') {
        if (selected.length >= 1) {
            setToolProficienciesForSource('race', selected);
            closeChoiceModal();
            if (raceAdvancePending) {
                handleRaceContinue();
            }
        }
    }
}

// Show subrace selection modal
function showSubraceSelectionModal(race) {
    if (!race.subraces || race.subraces.length === 0) return;

    currentChoiceType = 'subrace';
    currentChoiceData = {
        count: 1,
        options: race.subraces.map(sr => sr.id)
    };

    document.getElementById('choiceModalTitle').textContent = `Choose Your ${race.name} Subrace`;
    document.getElementById('choiceModalDescription').textContent =
        `Select your subrace to determine additional abilities and bonuses`;

    const content = document.getElementById('choiceModalContent');
    content.innerHTML = `
        <div class="choice-count" id="choiceCount">
            Select one subrace
        </div>
        <div class="choice-grid">
            ${race.subraces.map(subrace => `
                <div class="choice-item" data-choice="${subrace.id}" onclick="toggleChoice(this)">
                    <div class="choice-checkbox"></div>
                    <div style="width: 100%;">
                        <div class="choice-label">${subrace.name}</div>
                        <div class="choice-sublabel" style="margin-top: 5px; white-space: normal;">${subrace.description}</div>
                        <div style="margin-top: 8px; font-size: 0.85em; color: #a5b4fc;">
                            <strong>Bonuses:</strong> ${Object.entries(subrace.abilityBonuses)
                                .map(([ability, bonus]) => `${ability.charAt(0).toUpperCase() + ability.slice(1)} +${bonus}`)
                                .join(', ')}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Pre-select if previously selected
    if (characterData.subrace) {
        const item = content.querySelector(`[data-choice="${characterData.subrace.id}"]`);
        if (item) item.classList.add('selected');
        document.getElementById('confirmChoicesBtn').disabled = false;
    } else {
        document.getElementById('confirmChoicesBtn').disabled = true;
    }

    document.getElementById('choiceModal').classList.add('show');
}

// Show tool proficiency selection modal
function showToolProficiencyModal(race) {
    // Find tool proficiency trait
    const toolTrait = race.traits.find(t => t.choice && t.options);
    if (!toolTrait) return;

    currentChoiceType = 'toolProficiency';
    currentChoiceData = {
        count: 1,
        options: toolTrait.options
    };

    document.getElementById('choiceModalTitle').textContent = 'Choose Tool Proficiency';
    document.getElementById('choiceModalDescription').textContent = toolTrait.description;

    const content = document.getElementById('choiceModalContent');
    content.innerHTML = `
        <div class="choice-count" id="choiceCount">
            Select one tool proficiency
        </div>
        <div class="choice-grid">
            ${toolTrait.options.map(tool => `
                <div class="choice-item" data-choice="${tool}" onclick="toggleChoice(this)">
                    <div class="choice-checkbox"></div>
                    <div>
                        <div class="choice-label">${tool}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Pre-select if previously selected
    const raceTools = getToolProficienciesForSource('race');
    if (raceTools.length) {
        raceTools.forEach(tool => {
            const item = content.querySelector(`[data-choice="${tool}"]`);
            if (item) item.classList.add('selected');
        });
        document.getElementById('confirmChoicesBtn').disabled = false;
    } else {
        document.getElementById('confirmChoicesBtn').disabled = true;
    }

    document.getElementById('choiceModal').classList.add('show');
}
