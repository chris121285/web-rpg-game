// ======================================
// Global player class list
// ======================================
const CLASS_OPTIONS = ["Warrior", "Mage", "Rogue", "Cleric"];

// ======================================
// Load All Players
// ======================================
async function loadPlayers() {
    const list = document.getElementById("playerList");
    list.innerHTML = "Loading...";

    try {
        const res = await fetch("/player");
        const players = await res.json();

        list.innerHTML = "";

        players.forEach(player => {
            const div = document.createElement("div");
            div.className = "item-card";

            div.innerHTML = `
                <strong>${player.name}</strong>
                <div>Class: ${player.class} | Level: ${player.level}</div>

                <div class="actions">
                    <button onclick="editPlayer(${player.id}, '${player.name}', '${player.class}', ${player.level})">✏️</button>
                    <button onclick="deletePlayer(${player.id})">🗑️</button>
                </div>
            `;

            list.appendChild(div);
        });

    } catch (err) {
        list.innerHTML = "Error loading players.";
    }
}

// ======================================
// EDIT PLAYER (dropdown version)
// ======================================
function editPlayer(id, name, classType, level) {
    const list = document.getElementById("playerList");
    const cards = [...list.children];

    const card = cards.find(c => 
        c.innerHTML.includes(`editPlayer(${id}`)
    );

    // Build dropdown options safely
    const classDropdown = CLASS_OPTIONS.map(c =>
        `<option value="${c}" ${c === classType ? "selected" : ""}>${c}</option>`
    ).join("");

    card.innerHTML = `
        <div class="edit-container">
            <input class="edit-input" id="editName${id}" value="${name}">

            <select class="edit-input" id="editClass${id}">
                ${classDropdown}
            </select>

            <input class="edit-input" id="editLevel${id}" type="number" min="1" value="${level}">
        </div>

        <div class="edit-actions">
            <button class="save-btn" onclick="savePlayer(${id})">Save</button>
            <button class="cancel-btn" onclick="loadPlayers()">Cancel</button>
        </div>
    `;
}

// ======================================
// SAVE PLAYER
// ======================================
async function savePlayer(id) {
    const name = document.getElementById(`editName${id}`).value;
    const classType = document.getElementById(`editClass${id}`).value;
    const level = document.getElementById(`editLevel${id}`).value;

    await fetch(`/player/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, classType, level })
    });

    loadPlayers();
}

// ======================================
// DELETE PLAYER
// ======================================
async function deletePlayer(id) {
    await fetch(`/player/${id}`, { method: "DELETE" });
    loadPlayers();
}

// ======================================
// ADD PLAYER
// ======================================
async function addPlayer() {
    const name = document.getElementById("newPlayerName").value;
    const classType = document.getElementById("newPlayerClass").value;
    const level = document.getElementById("newPlayerLevel").value;

    await fetch("/player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, classType, level })
    });

    document.getElementById("newPlayerName").value = "";
    loadPlayers();
}

// ======================================
// Load NPCs (unchanged)
// ======================================
async function loadNPCs() {
    const list = document.getElementById("npcList");
    list.innerHTML = "Loading...";

    try {
        const res = await fetch("/dm");
        const data = await res.json();

        list.innerHTML = "";

        data.npcs.forEach(npc => {
            const div = document.createElement("div");
            div.className = "item-card";

            div.innerHTML = `
                <strong>${npc.name}</strong>
                <div>Role: ${npc.role}</div>
            `;

            list.appendChild(div);
        });
    } catch {
        list.innerHTML = "Error loading NPCs.";
    }
}

// ======================================
// Initialize
// ======================================
window.onload = () => {
    loadPlayers();
    loadNPCs();
};
