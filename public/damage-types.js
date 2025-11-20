// Shared reference for standard D&D 5e damage types.
const DAMAGE_TYPES = [
    { id: 'acid', label: 'Acid' },
    { id: 'bludgeoning', label: 'Bludgeoning' },
    { id: 'cold', label: 'Cold' },
    { id: 'fire', label: 'Fire' },
    { id: 'force', label: 'Force' },
    { id: 'lightning', label: 'Lightning' },
    { id: 'necrotic', label: 'Necrotic' },
    { id: 'piercing', label: 'Piercing' },
    { id: 'poison', label: 'Poison' },
    { id: 'psychic', label: 'Psychic' },
    { id: 'radiant', label: 'Radiant' },
    { id: 'slashing', label: 'Slashing' },
    { id: 'thunder', label: 'Thunder' }
];

function normalizeDamageTypeId(value) {
    if (!value && value !== 0) return '';
    return String(value).trim().toLowerCase();
}

function getDamageTypeLabel(value) {
    const normalized = normalizeDamageTypeId(value);
    const match = DAMAGE_TYPES.find(type => type.id === normalized);
    if (match) return match.label;
    if (!normalized) return '';
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

if (typeof window !== 'undefined') {
    window.DAMAGE_TYPES = DAMAGE_TYPES;
    window.getDamageTypeLabel = getDamageTypeLabel;
    window.normalizeDamageTypeId = normalizeDamageTypeId;
}

