// D&D 5e Character Data

const DND_CLASSES = [
    {
        id: 'barbarian',
        name: 'Barbarian',
        icon: '⚔️',
        description: 'Front-line warrior who fuels combat with Rage for extra damage and resilience.',
        longDescription: 'See DNDOPEN.txt (Barbarian class features) for the Rage, Unarmored Defense, Reckless Attack, Danger Sense, and Path of the Berserker progression that this builder exposes.',
        hitDie: 'd12',
        primaryAbility: 'Strength',
        saves: ['strength', 'constitution'],
        skillChoices: 2,
        skillOptions: ['animalhandling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'],
        armorProficiency: 'Light armor, medium armor, shields',
        weaponProficiency: 'Simple weapons, martial weapons',
        toolProficiency: 'None',
        startingEquipment: 'Greataxe or martial melee weapon, two handaxes or simple weapon, explorer\'s pack, four javelins',
        features: [
            {
                name: 'Rage',
                description: 'Enter a bonus-action fury a few times per long rest, gaining advantage on Strength checks/saves, bonus melee damage, and resistance to bludgeoning, piercing, and slashing while not in heavy armor.'
            },
            {
                name: 'Unarmored Defense',
                description: 'Without armor your AC equals 10 + Dexterity modifier + Constitution modifier; you can still use a shield.'
            },
            {
                name: 'Reckless Attack',
                description: 'Throw caution aside on your first attack each turn to gain advantage on Strength melee attacks at the cost of giving enemies advantage against you until your next turn.'
            },
            {
                name: 'Danger Sense',
                description: 'Gain advantage on Dexterity saving throws against effects you can see, such as traps and spells, while you aren\'t blinded, deafened, or incapacitated.'
            }
        ],
        subclasses: [
            {
                id: 'berserker',
                name: 'Path of the Berserker',
                description: 'Unleash a frenzy that trades exhaustion for extra attacks and terrifying retaliation.'
            }
        ]
    },
    {
        id: 'bard',
        name: 'Bard',
        icon: '🎵',
        description: 'Arcane performer who wields Bardic Inspiration and flexible spellcasting to support the party.',
        longDescription: 'Per DNDOPEN Bard entry, bards gain spellcasting, Bardic Inspiration dice, Jack of All Trades, Song of Rest, and College of Lore option; this data mirrors those features.',
        hitDie: 'd8',
        primaryAbility: 'Charisma',
        saves: ['dexterity', 'charisma'],
        skillChoices: 3,
        skillOptions: ['acrobatics', 'animalhandling', 'arcana', 'athletics', 'deception', 'history', 'insight', 'intimidation', 'investigation', 'medicine', 'nature', 'perception', 'performance', 'persuasion', 'religion', 'sleightofhand', 'stealth', 'survival'],
        armorProficiency: 'Light armor',
        weaponProficiency: 'Simple weapons, hand crossbows, longswords, rapiers, shortswords',
        toolProficiency: 'Three musical instruments of your choice',
        startingEquipment: 'Rapier, diplomat\'s pack or entertainer\'s pack, lute or other musical instrument, leather armor, dagger',
        features: [
            {
                name: 'Spellcasting',
                description: 'Use Charisma-based arcane magic fueled by lore and performance, preparing any spell known with flexible slots.'
            },
            {
                name: 'Bardic Inspiration',
                description: 'Bonus action grants an inspiration die (starting at d6) that allies can add to attacks, checks, or saves; dice scale with level.'
            },
            {
                name: 'Jack of All Trades',
                description: 'Add half your proficiency bonus to any ability check you make that doesn\'t already include your proficiency.'
            },
            {
                name: 'Song of Rest',
                description: 'During short rests, soothing music lets your resting allies regain extra hit points.'
            }
        ],
        subclasses: [
            {
                id: 'college-of-lore',
                name: 'College of Lore',
                description: 'Lore bards collect every tale, gaining additional skills, Cutting Words to undermine foes, and extra magical secrets.'
            }
        ]
    },
    {
        id: 'cleric',
        name: 'Cleric',
        icon: '✨',
        description: 'Prepared divine caster who channels a deity through spellcasting and domain features.',
        longDescription: 'Refer to DNDOPEN Cleric section for the spell preparation rules, Channel Divinity, and Life Domain benefits summarized in this object.',
        hitDie: 'd8',
        primaryAbility: 'Wisdom',
        saves: ['wisdom', 'charisma'],
        skillChoices: 2,
        skillOptions: ['history', 'insight', 'medicine', 'persuasion', 'religion'],
        armorProficiency: 'Light armor, medium armor, shields',
        weaponProficiency: 'Simple weapons',
        toolProficiency: 'None',
        startingEquipment: 'Mace or warhammer, scale mail or leather armor or chain mail, light crossbow or simple weapon, priest\'s pack, shield, holy symbol',
        features: [
            {
                name: 'Spellcasting',
                description: 'Prepare Wisdom-based divine spells each day, always ready with the entire cleric list plus cantrips granted by your deity.'
            },
            {
                name: 'Divine Domain',
                description: 'Choose the Life Domain to gain bonus spells and thematic features focused on protection and healing.'
            },
            {
                name: 'Channel Divinity',
                description: 'Starting at 2nd level, channel divine energy for effects like Turn Undead or domain-specific powers, refreshing on short rests.'
            },
            {
                name: 'Destroy Undead',
                description: 'At higher levels, Channel Divinity sweeps away undead of CR thresholds, eventually allowing Divine Intervention at 10+.'
            }
        ],
        subclasses: [
            { id: 'life-domain', name: 'Life Domain', description: 'Embody restorative power with potent healing magic and heavy armor.' }
        ]
    },
    {
        id: 'druid',
        name: 'Druid',
        icon: '🌿',
        description: 'Primal spellcaster tied to nature, versed in the Druidic language and Wild Shape.',
        longDescription: 'DNDOPEN describes druids as Wisdom-based prepared casters with Wild Shape and Circles such as the Circle of the Land; those rules drive this entry.',
        hitDie: 'd8',
        primaryAbility: 'Wisdom',
        saves: ['intelligence', 'wisdom'],
        skillChoices: 2,
        skillOptions: ['arcana', 'animalhandling', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'],
        armorProficiency: 'Light armor, medium armor, shields (druids will not wear armor or use shields made of metal)',
        weaponProficiency: 'Clubs, daggers, darts, javelins, maces, quarterstaffs, scimitars, sickles, slings, spears',
        toolProficiency: 'Herbalism kit',
        startingEquipment: 'Wooden shield or simple weapon, scimitar or simple melee weapon, leather armor, explorer\'s pack, druidic focus',
        features: [
            {
                name: 'Druidic',
                description: 'Know the secret Druidic language, which lets you leave hidden messages understood only by other druids.'
            },
            {
                name: 'Spellcasting',
                description: 'Prepare Wisdom-based spells from the druid list each day, shaping weather, healing allies, and commanding nature.'
            },
            {
                name: 'Wild Shape',
                description: 'As you advance, expend uses to magically transform into beasts you have seen, gaining their movement modes and senses.'
            }
        ],
        subclasses: [
            {
                id: 'circle-of-the-land',
                name: 'Circle of the Land',
                description: 'Mystics tied to specific biomes who gain extra spells and recover spell slots during short rests.'
            }
        ]
    },
    {
        id: 'fighter',
        name: 'Fighter',
        icon: '🛡️',
        description: 'Versatile martial expert gaining Fighting Style, Second Wind, Action Surge, and martial archetypes.',
        longDescription: 'This mirrors the Fighter chapter in DNDOPEN where champions gain Action Surge, Extra Attack, Indomitable, and the Champion archetype.',
        hitDie: 'd10',
        primaryAbility: 'Strength or Dexterity',
        saves: ['strength', 'constitution'],
        skillChoices: 2,
        skillOptions: ['acrobatics', 'animalhandling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'],
        armorProficiency: 'All armor, shields',
        weaponProficiency: 'Simple weapons, martial weapons',
        toolProficiency: 'None',
        startingEquipment: 'Chain mail or leather armor, longbow, and 20 arrows, martial weapon and shield or two martial weapons, light crossbow or two handaxes, dungeoneer\'s pack or explorer\'s pack',
        features: [
            {
                name: 'Fighting Style',
                description: 'Choose a combat specialty such as Defense, Archery, Great Weapon Fighting, or Protection to tailor your battlefield role.'
            },
            {
                name: 'Second Wind',
                description: 'Use a bonus action once per short rest to regain 1d10 + fighter level hit points, keeping you in the fight.'
            },
            {
                name: 'Action Surge',
                description: 'Push beyond limits to take one additional action on your turn, recharging on a short or long rest.'
            }
        ],
        subclasses: [
            {
                id: 'champion',
                name: 'Champion',
                description: 'Improve durability and physical prowess with expanded critical hits and superior athleticism.'
            }
        ]
    },
    {
        id: 'monk',
        name: 'Monk',
        icon: '🥋',
        description: 'Disciplined martial artist who spends ki on flurries, defense, and mobility tricks.',
        longDescription: 'DNDOPEN outlines Ki, Unarmored Movement, Deflect Missiles, Stunning Strike, and the Way of the Open Hand-our builder references those mechanics.',
        hitDie: 'd8',
        primaryAbility: 'Dexterity & Wisdom',
        saves: ['strength', 'dexterity'],
        skillChoices: 2,
        skillOptions: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'],
        armorProficiency: 'None',
        weaponProficiency: 'Simple weapons, shortswords',
        toolProficiency: 'One type of artisan\'s tools or one musical instrument',
        startingEquipment: 'Shortsword or simple weapon, dungeoneer\'s pack or explorer\'s pack, 10 darts',
        features: [
            {
                name: 'Martial Arts',
                description: 'Use Dexterity for unarmed strikes and monk weapons, roll Martial Arts die for damage, and make bonus unarmed attacks.'
            },
            {
                name: 'Ki',
                description: 'At 2nd level gain a pool of ki points for Flurry of Blows, Patient Defense, Step of the Wind, Stunning Strike, and other techniques.'
            },
            {
                name: 'Unarmored Movement',
                description: 'Increase your speed while not wearing armor or wielding shields, later gaining wall-running and water-walking.'
            }
        ],
        subclasses: [
            {
                id: 'open-hand',
                name: 'Way of the Open Hand',
                description: 'Masters of bare-handed combat who topple, push, and heal through ki manipulation.'
            }
        ]
    },
    {
        id: 'paladin',
        name: 'Paladin',
        icon: '⚡',
        description: 'Holy warrior who swears an oath, senses evil, prepares spells, and smites foes.',
        longDescription: 'Per DNDOPEN Paladin, Divine Sense, Lay on Hands, Fighting Styles, Divine Smite, and Oath of Devotion form the backbone captured here.',
        hitDie: 'd10',
        primaryAbility: 'Strength & Charisma',
        saves: ['wisdom', 'charisma'],
        skillChoices: 2,
        skillOptions: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'],
        armorProficiency: 'All armor, shields',
        weaponProficiency: 'Simple weapons, martial weapons',
        toolProficiency: 'None',
        startingEquipment: 'Martial weapon and shield or two martial weapons, five javelins or simple melee weapon, priest\'s pack or explorer\'s pack, chain mail, holy symbol',
        features: [
            {
                name: 'Divine Sense',
                description: 'Open yourself to the presence of celestials, fiends, and undead, sensing their location and consecrated or desecrated places.'
            },
            {
                name: 'Lay on Hands',
                description: 'Channel healing energy through touch, restoring a pool of hit points equal to 5 * paladin level, or curing disease/poison.'
            },
            {
                name: 'Fighting Style & Spellcasting',
                description: 'Adopt a combat style and prepare Charisma-based paladin spells for smites, buffs, and protective magic.'
            },
            {
                name: 'Divine Smite',
                description: 'Expend spell slots when you hit with a melee weapon to deal radiant damage, with extra power against undead and fiends.'
            }
        ],
        subclasses: [
            { id: 'oath-of-devotion', name: 'Oath of Devotion', description: 'Swear to ideals of honesty and courage, gaining sacred weapon blessings and turn-the-unholy power.' }
        ]
    },
    {
        id: 'ranger',
        name: 'Ranger',
        icon: '🏹',
        description: 'Hunter and tracker who picks favored enemies/terrains, fights with styles, and casts primal spells.',
        longDescription: 'DNDOPEN Ranger entry (Favored Enemy, Natural Explorer, Spellcasting, Fighting Style, Hunter archetype) informs this dataset.',
        hitDie: 'd10',
        primaryAbility: 'Dexterity & Wisdom',
        saves: ['strength', 'dexterity'],
        skillChoices: 3,
        skillOptions: ['animalhandling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'],
        armorProficiency: 'Light armor, medium armor, shields',
        weaponProficiency: 'Simple weapons, martial weapons',
        toolProficiency: 'None',
        startingEquipment: 'Scale mail or leather armor, two shortswords or two simple melee weapons, dungeoneer\'s pack or explorer\'s pack, longbow and quiver of 20 arrows',
        features: [
            {
                name: 'Favored Enemy',
                description: 'Choose creature types you have studied, gaining advantage on tracking them and learning one of their languages.'
            },
            {
                name: 'Natural Explorer',
                description: 'Excel in chosen terrain, ignoring common travel hazards while scouting, foraging, or navigating.'
            },
            {
                name: 'Spellcasting',
                description: 'At 2nd level begin casting limited Wisdom-based ranger spells that enhance senses, weapons, and beasts.'
            }
        ],
        subclasses: [
            {
                id: 'hunter',
                name: 'Hunter',
                description: 'Select defensive or offensive tactics such as Colossus Slayer, Giant Killer, or Horde Breaker to tailor your quarry control.'
            }
        ]
    },
    {
        id: 'rogue',
        name: 'Rogue',
        icon: '🗡️',
        description: 'Agile skill-specialist who leverages Sneak Attack, Expertise, and Cunning Action.',
        longDescription: 'This object references the Rogue write-up in DNDOPEN covering Thieves\' Cant, Sneak Attack, Cunning Action, Uncanny Dodge, and the Thief archetype.',
        hitDie: 'd8',
        primaryAbility: 'Dexterity',
        saves: ['dexterity', 'intelligence'],
        skillChoices: 4,
        skillOptions: ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'performance', 'persuasion', 'sleightofhand', 'stealth'],
        armorProficiency: 'Light armor',
        weaponProficiency: 'Simple weapons, hand crossbows, longswords, rapiers, shortswords',
        toolProficiency: 'Thieves\' tools',
        expertise: {
            count: 2,
            includeTools: ['Thieves\' Tools']
        },
        startingEquipment: 'Rapier or shortsword, shortbow and quiver of 20 arrows or shortsword, burglar\'s pack or dungeoneer\'s pack or explorer\'s pack, leather armor, two daggers, thieves\' tools',
        features: [
            {
                name: 'Sneak Attack',
                description: 'Once per turn deal extra damage when you have advantage (or an adjacent ally) on a finesse or ranged attack.'
            },
            {
                name: 'Thieves\' Cant',
                description: 'Learn a secret mix of dialect, jargon, and code that lets you pass hidden messages to other rogues.'
            },
            {
                name: 'Cunning Action',
                description: 'Starting at 2nd level, use your bonus action to Dash, Disengage, or Hide.'
            }
        ],
        subclasses: [
            {
                id: 'thief',
                name: 'Thief',
                description: 'Masters of stealth and agility who excel at climbing, sleight of hand, and using magic items.'
            }
        ]
    },
    {
        id: 'sorcerer',
        name: 'Sorcerer',
        icon: '🔥',
        description: 'Innate arcane caster with limited spells known, sorcery points, and draconic bloodline resilience.',
        longDescription: 'Our configuration reflects the SRD sorcerer in DNDOPEN: Spellcasting, Sorcery Points/Metamagic, Draconic Resilience, and Draconic Bloodline features.',
        hitDie: 'd6',
        primaryAbility: 'Charisma',
        saves: ['constitution', 'charisma'],
        skillChoices: 2,
        skillOptions: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'],
        armorProficiency: 'None',
        weaponProficiency: 'Daggers, darts, slings, quarterstaffs, light crossbows',
        toolProficiency: 'None',
        startingEquipment: 'Light crossbow and 20 bolts or simple weapon, component pouch or arcane focus, dungeoneer\'s pack or explorer\'s pack, two daggers',
        features: [
            {
                name: 'Spellcasting',
                description: 'Know a limited selection of spells fueled by Charisma; you do not prepare spells but learn them permanently.'
            },
            {
                name: 'Sorcerous Origin',
                description: 'At 1st level choose the Draconic Bloodline, gaining features tied to your scaled ancestors.'
            },
            {
                name: 'Font of Magic',
                description: 'Beginning at 2nd level you gain sorcery points to create additional spell slots or fuel metamagic.'
            },
            {
                name: 'Metamagic',
                description: 'Twist spells with options like Quickened, Twinned, or Subtle Spell to customize their effects.'
            }
        ],
        subclasses: [
            {
                id: 'draconic-bloodline',
                name: 'Draconic Bloodline',
                description: 'Manifest draconic ancestry with elemental resistance, wings, and extra resilience.'
            }
        ]
    },
    {
        id: 'warlock',
        name: 'Warlock',
        icon: '👁️',
        description: 'Pact-bound caster whose short-rest spell slots and invocations come from a patron.',
        longDescription: 'Per DNDOPEN Warlock, Pact Magic, Eldritch Invocations, Pact Boon, and the Fiend patron shape this data.',
        hitDie: 'd8',
        primaryAbility: 'Charisma',
        saves: ['wisdom', 'charisma'],
        skillChoices: 2,
        skillOptions: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'],
        armorProficiency: 'Light armor',
        weaponProficiency: 'Simple weapons',
        toolProficiency: 'None',
        startingEquipment: 'Light crossbow and 20 bolts or simple weapon, component pouch or arcane focus, scholar\'s pack or dungeoneer\'s pack, leather armor, simple weapon, two daggers',
        features: [
            {
                name: 'Otherworldly Patron',
                description: 'Forge a pact with a fiendish entity to gain bonus spells and powers.'
            },
            {
                name: 'Pact Magic',
                description: 'Cast Charisma-based spells using a small number of slots that recharge on a short rest.'
            },
            {
                name: 'Eldritch Invocations',
                description: 'Customize abilities with invocations like Agonizing Blast, Devil\'s Sight, or Mask of Many Faces.'
            },
            {
                name: 'Pact Boon',
                description: 'At 3rd level choose a pact-Blade, Chain, or Tome-to gain a special companion weapon, familiar, or grimoire.'
            }
        ],
        subclasses: [
            { id: 'fiend', name: 'The Fiend', description: 'Strike bargains with devils or demons for firepower, temp HP, and hurl through hell.' }
        ]
    },
    {
        id: 'wizard',
        name: 'Wizard',
        icon: '🧙',
        description: 'Scholar of arcane formulae who prepares spells from a spellbook and specializes through traditions.',
        longDescription: 'DNDOPEN\'s wizard rules (Spellbook, Arcane Recovery, spell preparation, and the School of Evocation) are the sole sources for this configuration.',
        hitDie: 'd6',
        primaryAbility: 'Intelligence',
        saves: ['intelligence', 'wisdom'],
        skillChoices: 2,
        skillOptions: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion'],
        armorProficiency: 'None',
        weaponProficiency: 'Daggers, darts, slings, quarterstaffs, light crossbows',
        toolProficiency: 'None',
        startingEquipment: 'Quarterstaff or dagger, component pouch or arcane focus, scholar\'s pack or explorer\'s pack, spellbook',
        features: [
            {
                name: 'Spellcasting',
                description: 'Copy spells into your spellbook and prepare a list each day, casting with Intelligence.'
            },
            {
                name: 'Arcane Recovery',
                description: 'Once per day during a short rest, recover expended spell slots of a combined level equal to half your wizard level (rounded up).'
            },
            {
                name: 'Arcane Tradition',
                description: 'At 2nd level specialize in the School of Evocation, gaining damage-focused features at later levels.'
            }
        ],
        subclasses: [
            { id: 'evocation', name: 'School of Evocation', description: 'Sculpt blasting spells to spare allies while maximizing damage.' }
        ]
    }
];

const DND_RACES = [
    {
        id: 'human',
        name: 'Human',
        icon: '👤',
        description: 'Versatile folk whose ability scores each increase by 1 per the SRD.',
        longDescription: 'Refer to DNDOPEN Human Traits for age, alignment flexibility, 30-foot speed, Common plus one extra language, and the Extra Language feature summarized here.',
        abilityBonuses: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
        speed: 30,
        size: 'Medium',
        sizeDescription: 'Typically 5 to a little over 6 feet tall, weighing roughly 125 to 250 pounds.',
        age: 'Humans reach adulthood in their late teens and rarely live even a single century.',
        alignment: 'No single ethos defines them-humans run the gamut from the noblest of heroes to the vilest of villains.',
        languages: ['Common'],
        languageChoices: 1,
        languageDescription: 'Humans usually learn the tongues of the peoples around them, happily borrowing words and phrases from every culture they meet. You can choose one additional language to represent that adaptability.',
        traits: [
            {
                name: 'Extra Language',
                description: 'Your adaptable nature lets you speak, read, and write one additional language of your choice beyond Common.'
            }
        ]
    },
    {
        id: 'dwarf',
        name: 'Dwarf',
        icon: '⛏️',
        description: 'Stout folk gaining +2 Constitution, poison resilience, and stonework expertise from the SRD.',
        longDescription: 'DNDOPEN (Dwarf Traits) lists the 25-foot speed that ignores heavy armor penalties, darkvision, Dwarven Resilience, Combat Training, tool proficiency choice, Stonecunning, and Common/Dwarvish languages captured here; only the Hill Dwarf subrace noted there is included.',
        abilityBonuses: { constitution: 2 },
        speed: 25,
        speedNote: 'Your speed is not reduced by wearing heavy armor',
        size: 'Medium',
        sizeDescription: '4 to 5 feet tall, averaging about 150 pounds',
        age: 'Dwarves mature at the same rate as humans, but they\'re considered young until they reach the age of 50. On average, they live about 350 years.',
        alignment: 'Most dwarves are lawful, believing firmly in the benefits of a well-ordered society. They tend toward good as well, with a strong sense of fair play and a belief that everyone deserves to share in the benefits of a just order.',
        languages: ['Common', 'Dwarvish'],
        languageDescription: 'You can speak, read, and write Common and Dwarvish. Dwarvish is full of hard consonants and guttural sounds, and those characteristics spill over into whatever other language a dwarf might speak.',
        traits: [
            {
                name: 'Darkvision',
                description: 'Accustomed to life underground, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can\'t discern color in darkness, only shades of gray.'
            },
            {
                name: 'Dwarven Resilience',
                description: 'You have advantage on saving throws against poison, and you have resistance against poison damage.'
            },
            {
                name: 'Dwarven Combat Training',
                description: 'You have proficiency with the battleaxe, handaxe, throwing hammer, and warhammer.'
            },
            {
                name: 'Tool Proficiency',
                description: 'You gain proficiency with the artisan\'s tools of your choice: smith\'s tools, brewer\'s supplies, or mason\'s tools.',
                choice: true,
                options: ['Smith\'s Tools', 'Brewer\'s Supplies', 'Mason\'s Tools']
            },
            {
                name: 'Stonecunning',
                description: 'Whenever you make an Intelligence (History) check related to the origin of stonework, you are considered proficient in the History skill and add double your proficiency bonus to the check, instead of your normal proficiency bonus.'
            }
        ],
        subraces: [
            {
                id: 'hill-dwarf',
                name: 'Hill Dwarf',
                description: 'As a hill dwarf, you have keen senses, deep intuition, and remarkable resilience.',
                abilityBonuses: { wisdom: 1 },
                traits: [
                    {
                        name: 'Dwarven Toughness',
                        description: 'Your hit point maximum increases by 1, and it increases by 1 every time you gain a level.'
                    }
                ]
            }
        ]
    },
    {
        id: 'elf',
        name: 'Elf',
        icon: '🧝',
        description: 'Graceful elves gain +2 Dexterity, 30-foot speed, darkvision, Keen Senses, Fey Ancestry, and Trance per DNDOPEN.',
        longDescription: 'This entry mirrors the SRD elf traits in DNDOPEN, including Perception proficiency, charm resistance, trance, and the High Elf subrace (Intelligence +1, elf weapon training, one wizard cantrip, and an extra language).',
        abilityBonuses: { dexterity: 2 },
        speed: 30,
        size: 'Medium',
        sizeDescription: 'Slightly shorter and more slender than humans, ranging from just under 5 feet to just over 6 feet tall.',
        age: 'Elves mature physically at a rate similar to humans but claim adulthood and an adult name around the age of 100. They can live to be 750 years old.',
        alignment: 'Elves love freedom, variety, and self-expression, so they lean toward the gentler aspects of chaos while remaining more often good than not.',
        languages: ['Common', 'Elvish'],
        languageDescription: 'You can speak, read, and write Common and Elvish. Elven speech is fluid with subtle intonations, and its songs and poems are famous throughout the realms.',
        traits: [
            {
                name: 'Darkvision',
                description: 'Accustomed to twilit forests and night skies, you can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light. You can\'t discern color in darkness, only shades of gray.'
            },
            {
                name: 'Keen Senses',
                description: 'You have proficiency in the Perception skill.'
            },
            {
                name: 'Fey Ancestry',
                description: 'You have advantage on saving throws against being charmed, and magic can\'t put you to sleep.'
            },
            {
                name: 'Trance',
                description: 'Elves don\'t need to sleep. Instead, they meditate deeply for 4 hours a day and gain the same benefit a human does from 8 hours of sleep.'
            }
        ],
        subraces: [
            {
                id: 'high-elf',
                name: 'High Elf',
                description: 'As a high elf, you have a keen mind and a mastery of at least the basics of magic. One strain can be haughty and reclusive, while another is more common and friendly.',
                languageChoices: 1,
                abilityBonuses: { intelligence: 1 },
                traits: [
                    {
                        name: 'Elf Weapon Training',
                        description: 'You have proficiency with the longsword, shortsword, shortbow, and longbow.'
                    },
                    {
                        name: 'Cantrip',
                        description: 'You know one cantrip of your choice from the wizard spell list. Intelligence is your spellcasting ability for it.'
                    },
                    {
                        name: 'Extra Language',
                        description: 'You can speak, read, and write one extra language of your choice.'
                    }
                ]
            }
        ]
    },
    {
        id: 'halfling',
        name: 'Halfling',
        icon: '🏡',
        description: 'Small, lucky explorers with +2 Dexterity, 25-foot speed, Lucky, Brave, and Halfling Nimbleness from the SRD.',
        longDescription: 'DNDOPEN covers halfling age, lawful-good tendencies, Common/Halfling languages, and provides only the Lightfoot subrace (Charisma +1, Naturally Stealthy) that we include here.',
        abilityBonuses: { dexterity: 2 },
        speed: 25,
        size: 'Small',
        sizeDescription: 'Roughly 3 feet tall and about 40 pounds, with sturdy builds despite their height.',
        age: 'Halflings reach adulthood at 20 and comfortably live into the middle of their second century.',
        alignment: 'They lean toward lawful good-friendly, generous, and anchored by community traditions.',
        languages: ['Common', 'Halfling'],
        languageDescription: 'Halflings guard their lilting tongue closely, sharing it mainly among themselves while learning Common to interact with their neighbors.',
        traits: [
            {
                name: 'Lucky',
                description: 'When you roll a 1 on an attack roll, ability check, or saving throw, you can reroll the die but must use the new roll.'
            },
            {
                name: 'Brave',
                description: 'You have advantage on saving throws against being frightened.'
            },
            {
                name: 'Halfling Nimbleness',
                description: 'You can move through the space of any creature that is of a size larger than yours.'
            }
        ],
        subraces: [
            {
                id: 'lightfoot-halfling',
                name: 'Lightfoot Halfling',
                description: 'As a lightfoot halfling, you can easily hide from notice-even using other folk as cover-and you tend to travel widely.',
                abilityBonuses: { charisma: 1 },
                traits: [
                    {
                        name: 'Naturally Stealthy',
                        description: 'You can attempt to hide even when you are obscured only by a creature that is at least one size larger than you.'
                    }
                ]
            }
        ]
    },
    {
        id: 'dragonborn',
        name: 'Dragonborn',
        icon: '🐉',
        description: 'Dragonborn receive +2 Strength, +1 Charisma, Draconic Ancestry, a breath weapon, and matching resistance via the SRD tables.',
        longDescription: 'The ancestry table, breath weapon save/DC math, damage scaling, and resistance rules all come straight from DNDOPEN\'s dragonborn section.',
        abilityBonuses: { strength: 2, charisma: 1 },
        speed: 30,
        size: 'Medium',
        sizeDescription: 'Towering well over 6 feet tall and averaging close to 250 pounds.',
        age: 'Dragonborn grow with blazing speed-walking hours after hatching, reaching adulthood by 15, and living to about 80.',
        alignment: 'Dragonborn tend to extremes, consciously choosing a path of good or evil; most are good, but those who side with evil can be terrible villains.',
        languages: ['Common', 'Draconic'],
        languageDescription: 'Draconic is one of the world\'s oldest tongues, full of hissing sibilants and hard consonants, and often used in arcane study.',
        traits: [
            {
                name: 'Draconic Ancestry',
                description: 'Choose a dragon type (black, blue, brass, bronze, copper, gold, green, red, silver, or white) to determine your breath weapon\'s damage type and shape as listed in the DNDOPEN ancestry table.'
            },
            {
                name: 'Breath Weapon',
                description: 'As an action you exhale destructive energy in a line or cone based on your ancestry. Creatures make a Dexterity or Constitution save (set by ancestry) against a DC of 8 + CON mod + proficiency bonus, taking 2d6 damage (scaling with level).'
            },
            {
                name: 'Damage Resistance',
                description: 'You have resistance to the damage type associated with your draconic ancestry.'
            }
        ]
    },
    {
        id: 'gnome',
        name: 'Gnome',
        icon: '🎩',
        description: "Curious gnomes gain +2 Intelligence, 25-foot speed, darkvision, and Gnome Cunning per DNDOPEN.",
        longDescription: 'This data mirrors the SRD gnome traits (lifespan, Common/Gnomish languages) and only the Rock Gnome subrace with Artificer\'s Lore and Tinker as listed in DNDOPEN.',
        abilityBonuses: { intelligence: 2 },
        speed: 25,
        size: 'Small',
        sizeDescription: 'Between 3 and 4 feet tall and about 40 pounds, with expressive features and animated gestures.',
        age: 'Gnomes mature around 40 and commonly live 350 to almost 500 years.',
        alignment: 'They are most often good-curious sages, playful tricksters, or imaginative artisans.',
        languages: ['Common', 'Gnomish'],
        languageDescription: 'Gnomish uses the Dwarvish script and is filled with technical terminology and precise descriptions of the natural world.',
        traits: [
            {
                name: 'Darkvision',
                description: 'Accustomed to life underground, you can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.'
            },
            {
                name: 'Gnome Cunning',
                description: 'You have advantage on all Intelligence, Wisdom, and Charisma saving throws against magic.'
            }
        ],
        subraces: [
            {
                id: 'rock-gnome',
                name: 'Rock Gnome',
                description: 'As a rock gnome, you have a natural inventiveness and hardiness beyond that of other gnomes.',
                abilityBonuses: { constitution: 1 },
                traits: [
                    {
                        name: 'Artificer\'s Lore',
                        description: 'Add twice your proficiency bonus to Intelligence (History) checks related to magic items, alchemical objects, or technological devices.'
                    },
                    {
                        name: 'Tinker',
                        description: "Using tinker\'s tools, you can craft Small clockwork devices (toy, fire starter, or music box) with 1 hour of work and 10 gp in materials."
                    }
                ]
            }
        ]
    },
    {
        id: 'half-elf',
        name: 'Half-Elf',
        icon: '🌟',
        description: 'Half-elves gain +2 Charisma, +1 to two other ability scores, darkvision, Fey Ancestry, and Skill Versatility just as described in DNDOPEN.',
        longDescription: 'We reference the SRD half-elf entry for lifespan, alignment, 30-foot speed, Common/Elvish plus one extra language, and the customization options allowed here.',
        abilityBonuses: { charisma: 2 },
        chooseTwo: true,
        speed: 30,
        size: 'Medium',
        sizeDescription: 'Stand between 5 and 6 feet tall with builds falling between slender elves and sturdier humans.',
        age: 'Half-elves mature around 20 and can live longer than 180 years.',
        alignment: 'They favor personal freedom and creative expression, often leaning toward chaotic alignments.',
        languages: ['Common', 'Elvish'],
        languageChoices: 1,
        languageDescription: 'Half-elves grow up speaking both their parents\' tongues and often learn a third language to emphasize their adaptability.',
        traits: [
            {
                name: 'Darkvision',
                description: 'Thanks to your elf blood you can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.'
            },
            {
                name: 'Fey Ancestry',
                description: 'You have advantage on saving throws against being charmed, and magic can\'t put you to sleep.'
            },
            {
                name: 'Skill Versatility',
                description: 'You gain proficiency in two skills of your choice.'
            }
        ]
    },
    {
        id: 'half-orc',
        name: 'Half-Orc',
        icon: '⚔️',
        description: 'Half-orcs gain +2 Strength, +1 Constitution, darkvision, Menacing, Relentless Endurance, and Savage Attacks from DNDOPEN.',
        longDescription: 'Age, alignment tendencies, size, and Common/Orc languages follow the SRD half-orc traits detailed in DNDOPEN.',
        abilityBonuses: { strength: 2, constitution: 1 },
        speed: 30,
        size: 'Medium',
        sizeDescription: 'Muscular frames standing between 5 and well over 6 feet tall, often 180-250 pounds.',
        age: 'They mature slightly faster than humans, reaching adulthood at 14 and seldom living beyond 75 years.',
        alignment: 'Most half-orcs lean toward chaotic alignments and many embrace the brutal outlook of their orc kin, though some rebel against that darkness.',
        languages: ['Common', 'Orc'],
        languageDescription: 'Orc is a harsh tongue filled with guttural consonants; it uses the Dwarvish script.',
        traits: [
            {
                name: 'Darkvision',
                description: 'Thanks to your orc blood, you can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.'
            },
            {
                name: 'Menacing',
                description: 'You gain proficiency in the Intimidation skill.'
            },
            {
                name: 'Relentless Endurance',
                description: 'When you are reduced to 0 HP but not killed outright, you can drop to 1 HP instead (once per long rest).'
            },
            {
                name: 'Savage Attacks',
                description: 'When you score a critical hit with a melee weapon attack, you can roll one of the weapon\'s damage dice one additional time and add it to the extra damage.'
            }
        ]
    },
    {
        id: 'tiefling',
        name: 'Tiefling',
        icon: '😈',
        description: 'Tieflings receive +2 Charisma, +1 Intelligence, darkvision, Hellish Resistance, and Infernal Legacy spells per DNDOPEN.',
        longDescription: 'All remaining tiefling details-age, alignment, 30-foot speed, Common/Infernal languages, thaumaturgy cantrip, hellish rebuke, and darkness-come directly from the SRD block in DNDOPEN.',
        abilityBonuses: { intelligence: 1, charisma: 2 },
        speed: 30,
        size: 'Medium',
        sizeDescription: 'Comparable to humans in height and build, though adorned with horns, tails, and sharply pointed teeth.',
        age: 'Tieflings mature at the same rate as humans but live a few years longer.',
        alignment: 'Many embrace a chaotic streak or are pushed toward evil by prejudice, though each individual chooses their own path.',
        languages: ['Common', 'Infernal'],
        languageDescription: 'Infernal is a precise, formal language of the Nine Hells, etched into tiefling bloodlines.',
        traits: [
            {
                name: 'Darkvision',
                description: 'Accustomed to the gloam, you can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.'
            },
            {
                name: 'Hellish Resistance',
                description: 'You have resistance to fire damage.'
            },
            {
                name: 'Infernal Legacy',
                description: 'You know the thaumaturgy cantrip. At 3rd level you can cast hellish rebuke (2nd level) once per long rest, and at 5th level you can also cast darkness once per long rest. Charisma is your spellcasting ability for these spells.'
            }
        ]
    }
];

const DND_BACKGROUNDS = [
    {
        id: 'acolyte',
        name: 'Acolyte',
        icon: '✨',
        description: 'You have spent your life in the service of a temple to a specific god or pantheon of gods.',
        longDescription: 'Years spent performing sacred rites and offering sacrifices have steeped you in the customs of your faith. Whether you tended humble shrines or commanded grand cathedrals, you understand religious hierarchies and can call on your co-religionists for aid.',
        skillProficiencies: ['insight', 'religion'],
        languages: 2,
        equipment: 'Holy symbol, prayer book, 5 sticks of incense, vestments, common clothes, belt pouch with 15gp',
        feature: 'Shelter of the Faithful: You and your companions can receive free healing and care at temples of your faith'
    }
];
