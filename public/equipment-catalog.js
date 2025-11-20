// Core equipment catalog derived solely from the D&D 5.1 SRD published in DNDOPEN.txt
// Each entry contains the data needed to drive inventory, combat, and consumable effects.

(function () {
    const simpleMeleeWeapons = [
        { id: 'club', name: 'Club', category: 'weapon', subcategory: 'simple-melee', cost: '1 sp', weight: 2, damage: { dice: '1d4', type: 'bludgeoning' }, properties: ['light'], weaponType: 'melee' },
        { id: 'dagger', name: 'Dagger', category: 'weapon', subcategory: 'simple-melee', cost: '2 gp', weight: 1, damage: { dice: '1d4', type: 'piercing' }, properties: ['finesse', 'light', 'thrown (20/60)'], weaponType: 'finesse' },
        { id: 'greatclub', name: 'Greatclub', category: 'weapon', subcategory: 'simple-melee', cost: '2 sp', weight: 10, damage: { dice: '1d8', type: 'bludgeoning' }, properties: ['two-handed'], weaponType: 'melee' },
        { id: 'handaxe', name: 'Handaxe', category: 'weapon', subcategory: 'simple-melee', cost: '5 gp', weight: 2, damage: { dice: '1d6', type: 'slashing' }, properties: ['light', 'thrown (20/60)'], weaponType: 'thrown' },
        { id: 'javelin', name: 'Javelin', category: 'weapon', subcategory: 'simple-melee', cost: '5 sp', weight: 2, damage: { dice: '1d6', type: 'piercing' }, properties: ['thrown (30/120)'], weaponType: 'thrown' },
        { id: 'light-hammer', name: 'Light Hammer', category: 'weapon', subcategory: 'simple-melee', cost: '2 gp', weight: 2, damage: { dice: '1d4', type: 'bludgeoning' }, properties: ['light', 'thrown (20/60)'], weaponType: 'thrown' },
        { id: 'mace', name: 'Mace', category: 'weapon', subcategory: 'simple-melee', cost: '5 gp', weight: 4, damage: { dice: '1d6', type: 'bludgeoning' }, weaponType: 'melee' },
        { id: 'quarterstaff', name: 'Quarterstaff', category: 'weapon', subcategory: 'simple-melee', cost: '2 sp', weight: 4, damage: { dice: '1d6', type: 'bludgeoning' }, properties: ['versatile (1d8)'], weaponType: 'melee' },
        { id: 'sickle', name: 'Sickle', category: 'weapon', subcategory: 'simple-melee', cost: '1 gp', weight: 2, damage: { dice: '1d4', type: 'slashing' }, properties: ['light'], weaponType: 'melee' },
        { id: 'spear', name: 'Spear', category: 'weapon', subcategory: 'simple-melee', cost: '1 gp', weight: 3, damage: { dice: '1d6', type: 'piercing' }, properties: ['thrown (20/60)', 'versatile (1d8)'], weaponType: 'thrown' }
    ];

    const simpleRangedWeapons = [
        { id: 'light-crossbow', name: 'Light Crossbow', category: 'weapon', subcategory: 'simple-ranged', cost: '25 gp', weight: 5, damage: { dice: '1d8', type: 'piercing' }, properties: ['ammunition (80/320)', 'loading', 'two-handed'], ammo: 'crossbow-bolt', weaponType: 'ranged' },
        { id: 'dart', name: 'Dart', category: 'weapon', subcategory: 'simple-ranged', cost: '5 cp', weight: 0.25, damage: { dice: '1d4', type: 'piercing' }, properties: ['finesse', 'thrown (20/60)'], weaponType: 'finesse' },
        { id: 'shortbow', name: 'Shortbow', category: 'weapon', subcategory: 'simple-ranged', cost: '25 gp', weight: 2, damage: { dice: '1d6', type: 'piercing' }, properties: ['ammunition (80/320)', 'two-handed'], ammo: 'arrow', weaponType: 'ranged' },
        { id: 'sling', name: 'Sling', category: 'weapon', subcategory: 'simple-ranged', cost: '1 sp', weight: 0, damage: { dice: '1d4', type: 'bludgeoning' }, properties: ['ammunition (30/120)'], ammo: 'sling-bullet', weaponType: 'ranged' }
    ];

    const martialMeleeWeapons = [
        { id: 'battleaxe', name: 'Battleaxe', category: 'weapon', subcategory: 'martial-melee', cost: '10 gp', weight: 4, damage: { dice: '1d8', type: 'slashing' }, properties: ['versatile (1d10)'], weaponType: 'melee' },
        { id: 'flail', name: 'Flail', category: 'weapon', subcategory: 'martial-melee', cost: '10 gp', weight: 2, damage: { dice: '1d8', type: 'bludgeoning' }, weaponType: 'melee' },
        { id: 'glaive', name: 'Glaive', category: 'weapon', subcategory: 'martial-melee', cost: '20 gp', weight: 6, damage: { dice: '1d10', type: 'slashing' }, properties: ['heavy', 'reach', 'two-handed'], weaponType: 'melee' },
        { id: 'greataxe', name: 'Greataxe', category: 'weapon', subcategory: 'martial-melee', cost: '30 gp', weight: 7, damage: { dice: '1d12', type: 'slashing' }, properties: ['heavy', 'two-handed'], weaponType: 'melee' },
        { id: 'greatsword', name: 'Greatsword', category: 'weapon', subcategory: 'martial-melee', cost: '50 gp', weight: 6, damage: { dice: '2d6', type: 'slashing' }, properties: ['heavy', 'two-handed'], weaponType: 'melee' },
        { id: 'halberd', name: 'Halberd', category: 'weapon', subcategory: 'martial-melee', cost: '20 gp', weight: 6, damage: { dice: '1d10', type: 'slashing' }, properties: ['heavy', 'reach', 'two-handed'], weaponType: 'melee' },
        { id: 'lance', name: 'Lance', category: 'weapon', subcategory: 'martial-melee', cost: '10 gp', weight: 6, damage: { dice: '1d12', type: 'piercing' }, properties: ['reach', 'special'], weaponType: 'melee' },
        { id: 'longsword', name: 'Longsword', category: 'weapon', subcategory: 'martial-melee', cost: '15 gp', weight: 3, damage: { dice: '1d8', type: 'slashing' }, properties: ['versatile (1d10)'], weaponType: 'melee' },
        { id: 'maul', name: 'Maul', category: 'weapon', subcategory: 'martial-melee', cost: '10 gp', weight: 10, damage: { dice: '2d6', type: 'bludgeoning' }, properties: ['heavy', 'two-handed'], weaponType: 'melee' },
        { id: 'morningstar', name: 'Morningstar', category: 'weapon', subcategory: 'martial-melee', cost: '15 gp', weight: 4, damage: { dice: '1d8', type: 'piercing' }, weaponType: 'melee' },
        { id: 'pike', name: 'Pike', category: 'weapon', subcategory: 'martial-melee', cost: '5 gp', weight: 18, damage: { dice: '1d10', type: 'piercing' }, properties: ['heavy', 'reach', 'two-handed'], weaponType: 'melee' },
        { id: 'rapier', name: 'Rapier', category: 'weapon', subcategory: 'martial-melee', cost: '25 gp', weight: 2, damage: { dice: '1d8', type: 'piercing' }, properties: ['finesse'], weaponType: 'finesse' },
        { id: 'scimitar', name: 'Scimitar', category: 'weapon', subcategory: 'martial-melee', cost: '25 gp', weight: 3, damage: { dice: '1d6', type: 'slashing' }, properties: ['finesse', 'light'], weaponType: 'finesse' },
        { id: 'shortsword', name: 'Shortsword', category: 'weapon', subcategory: 'martial-melee', cost: '10 gp', weight: 2, damage: { dice: '1d6', type: 'piercing' }, properties: ['finesse', 'light'], weaponType: 'finesse' },
        { id: 'trident', name: 'Trident', category: 'weapon', subcategory: 'martial-melee', cost: '5 gp', weight: 4, damage: { dice: '1d6', type: 'piercing' }, properties: ['thrown (20/60)', 'versatile (1d8)'], weaponType: 'thrown' },
        { id: 'war-pick', name: 'War Pick', category: 'weapon', subcategory: 'martial-melee', cost: '5 gp', weight: 2, damage: { dice: '1d8', type: 'piercing' }, weaponType: 'melee' },
        { id: 'warhammer', name: 'Warhammer', category: 'weapon', subcategory: 'martial-melee', cost: '15 gp', weight: 2, damage: { dice: '1d8', type: 'bludgeoning' }, properties: ['versatile (1d10)'], weaponType: 'melee' },
        { id: 'whip', name: 'Whip', category: 'weapon', subcategory: 'martial-melee', cost: '2 gp', weight: 3, damage: { dice: '1d4', type: 'slashing' }, properties: ['finesse', 'reach'], weaponType: 'finesse' }
    ];

    const martialRangedWeapons = [
        { id: 'blowgun', name: 'Blowgun', category: 'weapon', subcategory: 'martial-ranged', cost: '10 gp', weight: 1, damage: { dice: '1', type: 'piercing' }, properties: ['ammunition (25/100)', 'loading'], ammo: 'blowgun-needle', weaponType: 'ranged' },
        { id: 'hand-crossbow', name: 'Hand Crossbow', category: 'weapon', subcategory: 'martial-ranged', cost: '75 gp', weight: 3, damage: { dice: '1d6', type: 'piercing' }, properties: ['ammunition (30/120)', 'light', 'loading'], ammo: 'crossbow-bolt', weaponType: 'ranged' },
        { id: 'heavy-crossbow', name: 'Heavy Crossbow', category: 'weapon', subcategory: 'martial-ranged', cost: '50 gp', weight: 18, damage: { dice: '1d10', type: 'piercing' }, properties: ['ammunition (100/400)', 'heavy', 'loading', 'two-handed'], ammo: 'crossbow-bolt', weaponType: 'ranged' },
        { id: 'longbow', name: 'Longbow', category: 'weapon', subcategory: 'martial-ranged', cost: '50 gp', weight: 2, damage: { dice: '1d8', type: 'piercing' }, properties: ['ammunition (150/600)', 'heavy', 'two-handed'], ammo: 'arrow', weaponType: 'ranged' },
        { id: 'net', name: 'Net', category: 'weapon', subcategory: 'martial-ranged', cost: '1 gp', weight: 3, damage: null, properties: ['special', 'thrown (5/15)'], description: 'On a hit, restrains a Large or smaller target (DC 10 Strength to escape).', weaponType: 'ranged' }
    ];

    const armorAndShields = [
        { id: 'padded-armor', name: 'Padded Armor', category: 'armor', subcategory: 'light', cost: '5 gp', weight: 8, acBase: 11, stealthDisadvantage: true },
        { id: 'leather-armor', name: 'Leather Armor', category: 'armor', subcategory: 'light', cost: '10 gp', weight: 10, acBase: 11 },
        { id: 'studded-leather-armor', name: 'Studded Leather Armor', category: 'armor', subcategory: 'light', cost: '45 gp', weight: 13, acBase: 12 },
        { id: 'hide-armor', name: 'Hide Armor', category: 'armor', subcategory: 'medium', cost: '10 gp', weight: 12, acBase: 12 },
        { id: 'chain-shirt', name: 'Chain Shirt', category: 'armor', subcategory: 'medium', cost: '50 gp', weight: 20, acBase: 13 },
        { id: 'scale-mail', name: 'Scale Mail', category: 'armor', subcategory: 'medium', cost: '50 gp', weight: 45, acBase: 14, stealthDisadvantage: true },
        { id: 'breastplate', name: 'Breastplate', category: 'armor', subcategory: 'medium', cost: '400 gp', weight: 20, acBase: 14 },
        { id: 'half-plate', name: 'Half Plate', category: 'armor', subcategory: 'medium', cost: '750 gp', weight: 40, acBase: 15, stealthDisadvantage: true },
        { id: 'ring-mail', name: 'Ring Mail', category: 'armor', subcategory: 'heavy', cost: '30 gp', weight: 40, acBase: 14, stealthDisadvantage: true },
        { id: 'chain-mail', name: 'Chain Mail', category: 'armor', subcategory: 'heavy', cost: '75 gp', weight: 55, acBase: 16, stealthDisadvantage: true, strengthRequirement: 13 },
        { id: 'splint-armor', name: 'Splint Armor', category: 'armor', subcategory: 'heavy', cost: '200 gp', weight: 60, acBase: 17, stealthDisadvantage: true, strengthRequirement: 15 },
        { id: 'plate-armor', name: 'Plate Armor', category: 'armor', subcategory: 'heavy', cost: '1500 gp', weight: 65, acBase: 18, stealthDisadvantage: true, strengthRequirement: 15 },
        { id: 'shield', name: 'Shield', category: 'shield', subcategory: 'shield', cost: '10 gp', weight: 6, acBonus: 2 }
    ];

    const ammunition = [
        { id: 'arrow', name: 'Arrows (20)', category: 'ammo', subcategory: 'arrow', cost: '1 gp', weight: 1 },
        { id: 'blowgun-needle', name: 'Blowgun Needles (50)', category: 'ammo', subcategory: 'needle', cost: '1 gp', weight: 1 },
        { id: 'crossbow-bolt', name: 'Crossbow Bolts (20)', category: 'ammo', subcategory: 'bolt', cost: '1 gp', weight: 1.5 },
        { id: 'sling-bullet', name: 'Sling Bullets (20)', category: 'ammo', subcategory: 'sling', cost: '4 cp', weight: 1.5 }
    ];

    const adventuringGear = [
        { id: 'abacus', name: 'Abacus', category: 'gear', cost: '2 gp', weight: 2 },
        { id: 'acid-vial', name: 'Acid (vial)', category: 'consumable', cost: '25 gp', weight: 1, effect: { type: 'damage', dice: '2d6', damageType: 'acid', description: 'Throw (range 20 ft.) as an improvised weapon; on hit target takes 2d6 acid damage.' } },
        { id: 'alchemists-fire', name: "Alchemist's Fire (flask)", category: 'consumable', cost: '50 gp', weight: 1, effect: { type: 'damage', dice: '1d4', damageType: 'fire', description: 'On a hit target takes 1d4 fire damage at the start of each turn (Dex check DC 10 to end).' } },
        { id: 'antitoxin', name: 'Antitoxin (vial)', category: 'consumable', cost: '50 gp', weight: 0, effect: { type: 'buff', duration: '1 hour', description: 'Advantage on saving throws against poison.' } },
        { id: 'backpack', name: 'Backpack', category: 'gear', cost: '2 gp', weight: 5 },
        { id: 'ball-bearings', name: 'Ball Bearings (bag of 1,000)', category: 'gear', cost: '1 gp', weight: 2, description: 'Covers a 10-foot square; creatures moving through must succeed on DC 10 Dex save or fall prone.' },
        { id: 'barrel', name: 'Barrel', category: 'gear', cost: '2 gp', weight: 70 },
        { id: 'basket', name: 'Basket', category: 'gear', cost: '4 sp', weight: 2 },
        { id: 'bedroll', name: 'Bedroll', category: 'gear', cost: '1 gp', weight: 7 },
        { id: 'bell', name: 'Bell', category: 'gear', cost: '1 gp', weight: 0 },
        { id: 'blanket', name: 'Blanket', category: 'gear', cost: '5 sp', weight: 3 },
        { id: 'block-and-tackle', name: 'Block and Tackle', category: 'gear', cost: '1 gp', weight: 5, description: 'Use to hoist up to four times the normal lifting weight.' },
        { id: 'book', name: 'Book', category: 'gear', cost: '25 gp', weight: 5 },
        { id: 'bottle-glass', name: 'Bottle, Glass', category: 'gear', cost: '2 gp', weight: 2 },
        { id: 'bucket', name: 'Bucket', category: 'gear', cost: '5 cp', weight: 2 },
        { id: 'caltrops', name: 'Caltrops (bag of 20)', category: 'gear', cost: '1 gp', weight: 2, description: 'Covers a 5-foot square; creatures entering must succeed on DC 15 Dex save or stop and take 1 piercing damage.' },
        { id: 'candle', name: 'Candle', category: 'gear', cost: '1 cp', weight: 0, description: 'Burns for 1 hour with dim light in a 5-foot radius.' },
        { id: 'case-bolt', name: 'Case, Crossbow Bolt', category: 'gear', cost: '1 gp', weight: 1 },
        { id: 'case-map', name: 'Case, Map or Scroll', category: 'gear', cost: '1 gp', weight: 1 },
        { id: 'chain-10ft', name: 'Chain (10 feet)', category: 'gear', cost: '5 gp', weight: 10 },
        { id: 'chalk-piece', name: 'Chalk (1 piece)', category: 'gear', cost: '1 cp', weight: 0 },
        { id: 'chest', name: 'Chest', category: 'gear', cost: '5 gp', weight: 25 },
        { id: 'climbers-kit', name: "Climber's Kit", category: 'gear', cost: '25 gp', weight: 12, description: 'Includes pitons, boot tips, gloves, and a harness. Advantage on checks to climb.' },
        { id: 'clothes-common', name: 'Clothes, Common', category: 'gear', cost: '5 sp', weight: 3 },
        { id: 'clothes-costume', name: 'Clothes, Costume', category: 'gear', cost: '5 gp', weight: 4 },
        { id: 'clothes-fine', name: 'Clothes, Fine', category: 'gear', cost: '15 gp', weight: 6 },
        { id: 'clothes-travelers', name: "Clothes, Traveler's", category: 'gear', cost: '2 gp', weight: 4 },
        { id: 'component-pouch', name: 'Component Pouch', category: 'gear', cost: '25 gp', weight: 2 },
        { id: 'crowbar', name: 'Crowbar', category: 'gear', cost: '2 gp', weight: 5, description: 'Gain advantage on Strength checks made to force open objects.' },
        { id: 'prayer-book', name: 'Prayer Book', category: 'gear', cost: '5 gp', weight: 5 },
        { id: 'incense-stick', name: 'Incense Stick', category: 'gear', cost: '1 sp', weight: 0 },
        { id: 'vestments', name: 'Vestments', category: 'gear', cost: '1 gp', weight: 4 },
        { id: 'fishing-tackle', name: 'Fishing Tackle', category: 'gear', cost: '1 gp', weight: 4 },
        { id: 'flask', name: 'Flask or Tankard', category: 'gear', cost: '2 cp', weight: 1 },
        { id: 'grappling-hook', name: 'Grappling Hook', category: 'gear', cost: '2 gp', weight: 4 },
        { id: 'hammer', name: 'Hammer', category: 'gear', cost: '1 gp', weight: 3 },
        { id: 'sledgehammer', name: 'Hammer, Sledge', category: 'gear', cost: '2 gp', weight: 10 },
        { id: 'healers-kit', name: "Healer's Kit", category: 'gear', cost: '5 gp', weight: 3, effect: { type: 'utility', description: 'Contains 10 uses; action to stabilize a creature at 0 HP without a Medicine check.' } },
        { id: 'holy-water', name: 'Holy Water (flask)', category: 'consumable', cost: '25 gp', weight: 1, effect: { type: 'damage', dice: '2d6', damageType: 'radiant', description: 'Splash or throw (range 20 ft.). Deals damage to fiends and undead.' } },
        { id: 'hourglass', name: 'Hourglass', category: 'gear', cost: '25 gp', weight: 1 },
        { id: 'hunting-trap', name: 'Hunting Trap', category: 'gear', cost: '5 gp', weight: 25, description: 'Steel jaws (DC 13 Dex save) deal 1d4 piercing and restrain the creature.' },
        { id: 'ink-bottle', name: 'Ink (1-ounce bottle)', category: 'gear', cost: '10 gp', weight: 0 },
        { id: 'ink-pen', name: 'Ink Pen', category: 'gear', cost: '2 cp', weight: 0 },
        { id: 'small-knife', name: 'Small Knife', category: 'gear', cost: '1 gp', weight: 0.5 },
        { id: 'jug', name: 'Jug or Pitcher', category: 'gear', cost: '2 cp', weight: 4 },
        { id: 'ladder-10ft', name: 'Ladder (10-foot)', category: 'gear', cost: '1 sp', weight: 25 },
        { id: 'lamp', name: 'Lamp', category: 'gear', cost: '5 sp', weight: 1, description: 'Burns 1 pint of oil for 6 hours, bright light 15 ft., dim light additional 30 ft.' },
        { id: 'lantern-bullseye', name: 'Lantern, Bullseye', category: 'gear', cost: '10 gp', weight: 2, description: 'Burns 1 pint of oil for 6 hours, bright light 60 ft. cone, dim for additional 60 ft.' },
        { id: 'lantern-hooded', name: 'Lantern, Hooded', category: 'gear', cost: '5 gp', weight: 2, description: 'Burns 1 pint of oil for 6 hours, bright light 30 ft., dim 30 ft.; close shutters to reduce to dim 5 ft.' },
        { id: 'lock', name: 'Lock', category: 'gear', cost: '10 gp', weight: 1, description: 'DC 15 Dexterity check with thieves’ tools to pick or 10 minutes to break with thieves’ tools.' },
        { id: 'magnifying-glass', name: 'Magnifying Glass', category: 'gear', cost: '100 gp', weight: 0, description: 'Advantage on checks to appraise small items; can focus sunlight to ignite tinder.' },
        { id: 'manacles', name: 'Manacles', category: 'gear', cost: '2 gp', weight: 6, description: 'Escape DC 20 Dexterity; 60 hit points (AC 19).' },
        { id: 'mess-kit', name: 'Mess Kit', category: 'gear', cost: '2 sp', weight: 1 },
        { id: 'mirror-steel', name: 'Mirror, Steel', category: 'gear', cost: '5 gp', weight: 0.5 },
        { id: 'oil-flask', name: 'Oil (flask)', category: 'consumable', cost: '1 sp', weight: 1, effect: { type: 'utility', description: 'Covers a 5-ft area; if lit, target takes 5 fire damage.' } },
        { id: 'paper-sheet', name: 'Paper (one sheet)', category: 'gear', cost: '2 sp', weight: 0 },
        { id: 'parchment-sheet', name: 'Parchment (one sheet)', category: 'gear', cost: '1 sp', weight: 0 },
        { id: 'perfume-vial', name: 'Perfume (vial)', category: 'gear', cost: '5 gp', weight: 0 },
        { id: 'pick-miners', name: "Pick, Miner's", category: 'gear', cost: '2 gp', weight: 10 },
        { id: 'piton', name: 'Piton', category: 'gear', cost: '5 cp', weight: 0.25 },
        { id: 'poison-basic', name: 'Poison, Basic (vial)', category: 'consumable', cost: '100 gp', weight: 0, effect: { type: 'damage', dice: '1d4', damageType: 'poison', description: 'Apply to weapon; next hit deals 1d4 poison damage (DC 10 Con halves).' } },
        { id: 'pole-10ft', name: 'Pole (10-foot)', category: 'gear', cost: '5 cp', weight: 7 },
        { id: 'pot-iron', name: 'Pot, Iron', category: 'gear', cost: '2 gp', weight: 10 },
        { id: 'potion-healing', name: 'Potion of Healing', category: 'potion', cost: '50 gp', weight: 0.5, effect: { type: 'healing', dice: '2d4+2', description: 'Drink to regain 2d4 + 2 hit points.' } },
        { id: 'pouch', name: 'Pouch', category: 'gear', cost: '5 sp', weight: 1, description: 'Holds 1/5 cubic foot or 6 pounds of gear.' },
        { id: 'quiver', name: 'Quiver', category: 'gear', cost: '1 gp', weight: 1 },
        { id: 'ram-portable', name: 'Ram, Portable', category: 'gear', cost: '4 gp', weight: 35, description: 'Gain +4 bonus on Strength checks to break doors (ally can grant advantage).' },
        { id: 'rations', name: 'Rations (1 day)', category: 'gear', cost: '5 sp', weight: 2 },
        { id: 'robes', name: 'Robes', category: 'gear', cost: '1 gp', weight: 4 },
        { id: 'rope-hemp-50', name: 'Rope, Hempen (50 ft.)', category: 'gear', cost: '1 gp', weight: 10 },
        { id: 'rope-silk-50', name: 'Rope, Silk (50 ft.)', category: 'gear', cost: '10 gp', weight: 5 },
        { id: 'sack', name: 'Sack', category: 'gear', cost: '1 cp', weight: 0.5 },
        { id: 'scale-merchants', name: "Scale, Merchant's", category: 'gear', cost: '5 gp', weight: 3 },
        { id: 'sealing-wax', name: 'Sealing Wax', category: 'gear', cost: '5 sp', weight: 0 },
        { id: 'shovel', name: 'Shovel', category: 'gear', cost: '2 gp', weight: 5 },
        { id: 'signal-whistle', name: 'Signal Whistle', category: 'gear', cost: '5 cp', weight: 0 },
        { id: 'signet-ring', name: 'Signet Ring', category: 'gear', cost: '5 gp', weight: 0 },
        { id: 'lucky-charm', name: 'Lucky Charm', category: 'gear', cost: '—', weight: 0 },
        { id: 'soap', name: 'Soap', category: 'gear', cost: '2 cp', weight: 0 },
        { id: 'spellbook', name: 'Spellbook', category: 'gear', cost: '50 gp', weight: 3 },
        { id: 'scroll-of-pedigree', name: 'Scroll of Pedigree', category: 'gear', cost: '5 gp', weight: 0 },
        { id: 'spikes-iron', name: 'Spikes, Iron (10)', category: 'gear', cost: '1 gp', weight: 5 },
        { id: 'spyglass', name: 'Spyglass', category: 'gear', cost: '1000 gp', weight: 1 },
        { id: 'tent', name: 'Tent, Two-Person', category: 'gear', cost: '2 gp', weight: 20 },
        { id: 'tinderbox', name: 'Tinderbox', category: 'gear', cost: '5 sp', weight: 1, description: 'Action to light torch or similar; 1 minute to light other fires.' },
        { id: 'torch', name: 'Torch', category: 'gear', cost: '1 cp', weight: 1, effect: { type: 'utility', description: 'Burns for 1 hour, bright light 20 ft., dim 20 ft.' } },
        { id: 'vial', name: 'Vial', category: 'gear', cost: '1 gp', weight: 0 },
        { id: 'waterskin', name: 'Waterskin', category: 'gear', cost: '2 sp', weight: 5 },
        { id: 'whetstone', name: 'Whetstone', category: 'gear', cost: '1 cp', weight: 1 }
    ];

    const packs = [
        { id: 'burglars-pack', name: "Burglar's Pack", category: 'pack', cost: '16 gp', weight: 49, description: 'Includes backpack, bag of 1,000 ball bearings, 10 feet of string, bell, 5 candles, crowbar, hammer, 10 pitons, hooded lantern, 2 flasks of oil, 5 days rations, tinderbox, waterskin, 50 ft. hempen rope.' },
        { id: 'diplomats-pack', name: "Diplomat's Pack", category: 'pack', cost: '39 gp', weight: 36, description: 'Includes chest, 2 cases for maps, set of fine clothes, bottle of ink, ink pen, lamp, 2 flasks oil, 5 sheets paper, vial perfume, sealing wax, soap.' },
        { id: 'dungeoneers-pack', name: "Dungeoneer's Pack", category: 'pack', cost: '12 gp', weight: 61, description: 'Includes backpack, crowbar, hammer, 10 pitons, 10 torches, tinderbox, 10 days rations, waterskin, 50 ft. hempen rope.' },
        { id: 'entertainers-pack', name: "Entertainer's Pack", category: 'pack', cost: '40 gp', weight: 38, description: 'Includes backpack, bedroll, 2 costumes, 5 candles, 5 days rations, waterskin, disguise kit.' },
        { id: 'explorers-pack', name: "Explorer's Pack", category: 'pack', cost: '10 gp', weight: 59, description: 'Includes backpack, bedroll, mess kit, tinderbox, 10 torches, 10 days rations, waterskin, 50 ft. hempen rope.' },
        { id: 'priests-pack', name: "Priest's Pack", category: 'pack', cost: '19 gp', weight: 24, description: 'Includes backpack, blanket, 10 candles, tinderbox, alms box, 2 blocks incense, censer, vestments, 2 days rations, waterskin.' },
        { id: 'scholars-pack', name: "Scholar's Pack", category: 'pack', cost: '40 gp', weight: 10, description: 'Includes backpack, book of lore, bottle of ink, ink pen, 10 sheets parchment, little bag of sand, small knife.' }
    ];

    const focuses = [
        { id: 'arcane-focus-crystal', name: 'Arcane Focus (Crystal)', category: 'focus', subcategory: 'arcane', cost: '10 gp', weight: 1 },
        { id: 'arcane-focus-orb', name: 'Arcane Focus (Orb)', category: 'focus', subcategory: 'arcane', cost: '20 gp', weight: 3 },
        { id: 'arcane-focus-rod', name: 'Arcane Focus (Rod)', category: 'focus', subcategory: 'arcane', cost: '10 gp', weight: 2 },
        { id: 'arcane-focus-staff', name: 'Arcane Focus (Staff)', category: 'focus', subcategory: 'arcane', cost: '5 gp', weight: 4 },
        { id: 'arcane-focus-wand', name: 'Arcane Focus (Wand)', category: 'focus', subcategory: 'arcane', cost: '10 gp', weight: 1 },
        { id: 'druidic-focus-mistletoe', name: 'Druidic Focus (Mistletoe)', category: 'focus', subcategory: 'druidic', cost: '1 gp', weight: 0 },
        { id: 'druidic-focus-totem', name: 'Druidic Focus (Totem)', category: 'focus', subcategory: 'druidic', cost: '1 gp', weight: 0 },
        { id: 'druidic-focus-wooden-staff', name: 'Druidic Focus (Wooden Staff)', category: 'focus', subcategory: 'druidic', cost: '5 gp', weight: 4 },
        { id: 'druidic-focus-yew-wand', name: 'Druidic Focus (Yew Wand)', category: 'focus', subcategory: 'druidic', cost: '10 gp', weight: 1 },
        { id: 'holy-symbol-amulet', name: 'Holy Symbol (Amulet)', category: 'focus', subcategory: 'divine', cost: '5 gp', weight: 1 },
        { id: 'holy-symbol-emblem', name: 'Holy Symbol (Emblem)', category: 'focus', subcategory: 'divine', cost: '5 gp', weight: 0 },
        { id: 'holy-symbol-reliquary', name: 'Holy Symbol (Reliquary)', category: 'focus', subcategory: 'divine', cost: '5 gp', weight: 2 }
    ];

    const artisanTools = [
        { id: 'alchemists-supplies', name: "Alchemist's Supplies", category: 'tool', subcategory: 'artisan', cost: '50 gp', weight: 8 },
        { id: 'brewers-supplies', name: "Brewer's Supplies", category: 'tool', subcategory: 'artisan', cost: '20 gp', weight: 9 },
        { id: 'calligraphers-supplies', name: "Calligrapher's Supplies", category: 'tool', subcategory: 'artisan', cost: '10 gp', weight: 5 },
        { id: 'carpenters-tools', name: "Carpenter's Tools", category: 'tool', subcategory: 'artisan', cost: '8 gp', weight: 6 },
        { id: 'cartographers-tools', name: "Cartographer's Tools", category: 'tool', subcategory: 'artisan', cost: '15 gp', weight: 6 },
        { id: 'cobblers-tools', name: "Cobbler's Tools", category: 'tool', subcategory: 'artisan', cost: '5 gp', weight: 5 },
        { id: 'cooks-utensils', name: "Cook's Utensils", category: 'tool', subcategory: 'artisan', cost: '1 gp', weight: 8 },
        { id: 'glassblowers-tools', name: "Glassblower's Tools", category: 'tool', subcategory: 'artisan', cost: '30 gp', weight: 5 },
        { id: 'jewelers-tools', name: "Jeweler's Tools", category: 'tool', subcategory: 'artisan', cost: '25 gp', weight: 2 },
        { id: 'leatherworkers-tools', name: "Leatherworker's Tools", category: 'tool', subcategory: 'artisan', cost: '5 gp', weight: 5 },
        { id: 'masons-tools', name: "Mason's Tools", category: 'tool', subcategory: 'artisan', cost: '10 gp', weight: 8 },
        { id: 'painters-supplies', name: "Painter's Supplies", category: 'tool', subcategory: 'artisan', cost: '10 gp', weight: 5 },
        { id: 'potters-tools', name: "Potter's Tools", category: 'tool', subcategory: 'artisan', cost: '10 gp', weight: 3 },
        { id: 'smiths-tools', name: "Smith's Tools", category: 'tool', subcategory: 'artisan', cost: '20 gp', weight: 8 },
        { id: 'tinkers-tools', name: "Tinker's Tools", category: 'tool', subcategory: 'artisan', cost: '50 gp', weight: 10 },
        { id: 'weavers-tools', name: "Weaver's Tools", category: 'tool', subcategory: 'artisan', cost: '1 gp', weight: 5 },
        { id: 'woodcarvers-tools', name: "Woodcarver's Tools", category: 'tool', subcategory: 'artisan', cost: '1 gp', weight: 5 }
    ];

    const otherTools = [
        { id: 'disguise-kit', name: 'Disguise Kit', category: 'tool', subcategory: 'kit', cost: '25 gp', weight: 3 },
        { id: 'forgery-kit', name: 'Forgery Kit', category: 'tool', subcategory: 'kit', cost: '15 gp', weight: 5 },
        { id: 'herbalism-kit', name: 'Herbalism Kit', category: 'tool', subcategory: 'kit', cost: '5 gp', weight: 3 },
        { id: 'navigators-tools', name: "Navigator's Tools", category: 'tool', subcategory: 'specialty', cost: '25 gp', weight: 2 },
        { id: 'poisoners-kit', name: "Poisoner's Kit", category: 'tool', subcategory: 'kit', cost: '50 gp', weight: 2 },
        { id: 'thieves-tools', name: "Thieves' Tools", category: 'tool', subcategory: 'specialty', cost: '25 gp', weight: 1 },
        { id: 'vehicles-land', name: 'Vehicles (Land)', category: 'tool', subcategory: 'proficiency', cost: '—', weight: 0 },
        { id: 'vehicles-water', name: 'Vehicles (Water)', category: 'tool', subcategory: 'proficiency', cost: '—', weight: 0 }
    ];

    const gamingSets = [
        { id: 'dice-set', name: 'Gaming Set (Dice)', category: 'tool', subcategory: 'gaming', cost: '1 sp', weight: 0 },
        { id: 'dragonchess-set', name: 'Gaming Set (Dragonchess)', category: 'tool', subcategory: 'gaming', cost: '1 gp', weight: 0.5 },
        { id: 'playing-card-set', name: 'Gaming Set (Playing Cards)', category: 'tool', subcategory: 'gaming', cost: '5 sp', weight: 0 },
        { id: 'three-dragon-ante', name: 'Gaming Set (Three-Dragon Ante)', category: 'tool', subcategory: 'gaming', cost: '1 gp', weight: 0 }
    ];

    const musicalInstruments = [
        { id: 'bagpipes', name: 'Bagpipes', category: 'tool', subcategory: 'instrument', cost: '30 gp', weight: 6 },
        { id: 'drum', name: 'Drum', category: 'tool', subcategory: 'instrument', cost: '6 gp', weight: 3 },
        { id: 'dulcimer', name: 'Dulcimer', category: 'tool', subcategory: 'instrument', cost: '25 gp', weight: 10 },
        { id: 'flute', name: 'Flute', category: 'tool', subcategory: 'instrument', cost: '2 gp', weight: 1 },
        { id: 'horn', name: 'Horn', category: 'tool', subcategory: 'instrument', cost: '3 gp', weight: 2 },
        { id: 'lute', name: 'Lute', category: 'tool', subcategory: 'instrument', cost: '35 gp', weight: 2 },
        { id: 'lyre', name: 'Lyre', category: 'tool', subcategory: 'instrument', cost: '30 gp', weight: 2 },
        { id: 'pan-flute', name: 'Pan Flute', category: 'tool', subcategory: 'instrument', cost: '12 gp', weight: 2 },
        { id: 'shawm', name: 'Shawm', category: 'tool', subcategory: 'instrument', cost: '2 gp', weight: 1 },
        { id: 'viol', name: 'Viol', category: 'tool', subcategory: 'instrument', cost: '30 gp', weight: 1 }
    ];

    const advancedPotions = [
        { id: 'potion-greater-healing', name: 'Potion of Greater Healing', category: 'potion', cost: '150 gp', weight: 0.5, effect: { type: 'healing', dice: '4d4+4', description: 'Drink to regain 4d4 + 4 hit points.' } },
        { id: 'potion-superior-healing', name: 'Potion of Superior Healing', category: 'potion', cost: '450 gp', weight: 0.5, effect: { type: 'healing', dice: '8d4+8', description: 'Drink to regain 8d4 + 8 hit points.' } },
        { id: 'potion-supreme-healing', name: 'Potion of Supreme Healing', category: 'potion', cost: '1350 gp', weight: 0.5, effect: { type: 'healing', dice: '10d4+20', description: 'Drink to regain 10d4 + 20 hit points.' } },
        { id: 'potion-climbing', name: 'Potion of Climbing', category: 'potion', cost: '75 gp', weight: 0.5, effect: { type: 'buff', duration: '1 hour', description: 'Gain climbing speed equal to walking speed and advantage on Athletics checks to climb.' } },
        { id: 'potion-heroism', name: 'Potion of Heroism', category: 'potion', cost: '200 gp', weight: 0.5, effect: { type: 'buff', duration: '1 hour', description: 'Gain 10 temporary hit points and bless effect (no concentration).' } }
    ];

    const mounts = [
        { id: 'camel', name: 'Camel', category: 'mount', cost: '50 gp', weight: 0, description: 'Speed 50 ft.; carrying capacity 480 lb.' },
        { id: 'donkey-mule', name: 'Donkey or Mule', category: 'mount', cost: '8 gp', description: 'Speed 40 ft.; carrying capacity 420 lb.' },
        { id: 'draft-horse', name: 'Horse, Draft', category: 'mount', cost: '50 gp', description: 'Speed 40 ft.; carrying capacity 540 lb.' },
        { id: 'riding-horse', name: 'Horse, Riding', category: 'mount', cost: '75 gp', description: 'Speed 60 ft.; carrying capacity 480 lb.' },
        { id: 'elephant', name: 'Elephant', category: 'mount', cost: '200 gp', description: 'Speed 40 ft.; carrying capacity 1,320 lb.' },
        { id: 'mastiff', name: 'Mastiff', category: 'mount', cost: '25 gp', description: 'Speed 40 ft.; carrying capacity 195 lb.' },
        { id: 'pony', name: 'Pony', category: 'mount', cost: '30 gp', description: 'Speed 40 ft.; carrying capacity 225 lb.' },
        { id: 'warhorse', name: 'Warhorse', category: 'mount', cost: '400 gp', description: 'Speed 60 ft.; carrying capacity 540 lb.' }
    ];

    const tackAndVehicles = [
        { id: 'barding', name: 'Barding', category: 'vehicle', cost: 'Armor cost ×4', weight: 0, description: 'Armor for a mount (weight ×2 of normal armor).' },
        { id: 'bit-bridle', name: 'Bit and Bridle', category: 'vehicle', cost: '2 gp', weight: 1 },
        { id: 'carriage', name: 'Carriage', category: 'vehicle', cost: '100 gp', weight: 600 },
        { id: 'cart', name: 'Cart', category: 'vehicle', cost: '15 gp', weight: 200 },
        { id: 'chariot', name: 'Chariot', category: 'vehicle', cost: '250 gp', weight: 100 },
        { id: 'feed', name: 'Feed (per day)', category: 'vehicle', cost: '5 cp', weight: 10 },
        { id: 'saddle-exotic', name: 'Saddle, Exotic', category: 'vehicle', cost: '60 gp', weight: 40 },
        { id: 'saddle-military', name: 'Saddle, Military', category: 'vehicle', cost: '20 gp', weight: 30 },
        { id: 'saddle-pack', name: 'Saddle, Pack', category: 'vehicle', cost: '5 gp', weight: 15 },
        { id: 'saddle-riding', name: 'Saddle, Riding', category: 'vehicle', cost: '10 gp', weight: 25 },
        { id: 'saddlebags', name: 'Saddlebags', category: 'vehicle', cost: '4 gp', weight: 8 },
        { id: 'sled', name: 'Sled', category: 'vehicle', cost: '20 gp', weight: 300 },
        { id: 'stabling', name: 'Stabling (per day)', category: 'vehicle', cost: '5 sp', weight: 0 },
        { id: 'wagon', name: 'Wagon', category: 'vehicle', cost: '35 gp', weight: 400 }
    ];

    const waterVehicles = [
        { id: 'galley', name: 'Galley', category: 'vehicle', subcategory: 'water', cost: '30,000 gp', description: 'Speed 4 mph (sailing).' },
        { id: 'keelboat', name: 'Keelboat', category: 'vehicle', subcategory: 'water', cost: '3,000 gp', description: 'Speed 1 mph.' },
        { id: 'longship', name: 'Longship', category: 'vehicle', subcategory: 'water', cost: '10,000 gp', description: 'Speed 3 mph.' },
        { id: 'rowboat', name: 'Rowboat', category: 'vehicle', subcategory: 'water', cost: '50 gp', description: 'Speed 1½ mph.' },
        { id: 'sailing-ship', name: 'Sailing Ship', category: 'vehicle', subcategory: 'water', cost: '10,000 gp', description: 'Speed 2 mph.' },
        { id: 'warship', name: 'Warship', category: 'vehicle', subcategory: 'water', cost: '25,000 gp', description: 'Speed 2½ mph.' }
    ];

    const catalog = [
        ...simpleMeleeWeapons,
        ...simpleRangedWeapons,
        ...martialMeleeWeapons,
        ...martialRangedWeapons,
        ...armorAndShields,
        ...ammunition,
        ...adventuringGear,
        ...packs,
        ...focuses,
        ...artisanTools,
        ...otherTools,
        ...gamingSets,
        ...musicalInstruments,
        ...advancedPotions,
        ...mounts,
        ...tackAndVehicles,
        ...waterVehicles
    ];

    const catalogIndex = {};
    catalog.forEach(item => {
        catalogIndex[item.id] = item;
    });

    window.EQUIPMENT_CATALOG = catalog;
    window.getEquipmentCatalogItem = function (id) {
        return catalogIndex[id] ? { ...catalogIndex[id] } : null;
    };
    window.getEquipmentCatalogGroups = function () {
        return catalog.reduce((groups, item) => {
            const group = item.category || 'other';
            if (!groups[group]) groups[group] = [];
            groups[group].push(item);
            return groups;
        }, {});
    };
})();
