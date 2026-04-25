// NexusShuffle - cleaned script.js

let slotData = [{ name: "", roles: [], rank: "" }];
let rotationIndex = 0;
let roleRotation = 0;
let considerLanes = true;
const STORAGE_KEY = 'nexusShuffleState';

function saveState() {
	const state = { slotData, rotationIndex, roleRotation };
	state.considerLanes = considerLanes;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch (e) {
		console.warn('Failed to save state', e);
	}
}

function loadState() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return;
		const s = JSON.parse(raw);
		if (s.slotData && Array.isArray(s.slotData)) slotData = s.slotData;
		rotationIndex = typeof s.rotationIndex === 'number' ? s.rotationIndex : 0;
		roleRotation = typeof s.roleRotation === 'number' ? s.roleRotation : 0;
		considerLanes = typeof s.considerLanes === 'boolean' ? s.considerLanes : true;
	} catch (e) {
		console.warn('Failed to load state', e);
	}
}

const roles = ["Top", "Jungle", "Mid", "Bot", "Support", "Fill"];
const roleIcons = {
	Top: "public/assets/roles/role-top.png",
	Jungle: "public/assets/roles/role-jgl.png",
	Mid: "public/assets/roles/role-mid.png",
	Bot: "public/assets/roles/role-bot.png",
	Support: "public/assets/roles/role-sup.png",
	Fill: "public/assets/roles/role-fill.png"
};
const roleNames = { Top: "Top", Jungle: "Jungle", Mid: "Mid", Bot: "Bot", Support: "Support", Fill: "Auto Fill" };
const rankIcons = {
	Iron: "public/assets/rank/rank-iron.png",
	Bronze: "public/assets/rank/rank-bronze.png",
	Silver: "public/assets/rank/rank-silver.png",
	Gold: "public/assets/rank/rank-gold.png",
	Platinum: "public/assets/rank/rank-platinum.png",
	Emerald: "public/assets/rank/rank-emerald.png",
	Diamond: "public/assets/rank/rank-diamond.png",
	Master: "public/assets/rank/rank-master.png",
	Grandmaster: "public/assets/rank/rank-grandmaster.png",
	Challenger: "public/assets/rank/rank-challenger.png"
};
const ranks = ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Emerald", "Diamond", "Master", "Grandmaster", "Challenger"];

function rankToScore(rank) {
	const idx = ranks.indexOf(rank);
	return idx === -1 ? 0 : idx;
}

// Fisher-Yates shuffle helper
function shuffleArray(arr) {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
}

// Slot helper functions
function updateSlotName(idx, val) {
	if (!slotData[idx]) slotData[idx] = { name: "", roles: [], rank: "" };
	slotData[idx].name = val;
	saveState();
}

function toggleSlotRole(idx, role, checked) {
	if (!slotData[idx]) slotData[idx] = { name: "", roles: [], rank: "" };

	// If user selects Fill, it should be exclusive: clear other roles.
	if (role === "Fill") {
		if (checked) {
			slotData[idx].roles = ["Fill"];
		} else {
			slotData[idx].roles = slotData[idx].roles.filter(r => r !== "Fill");
		}
	} else {
		// Selecting any normal role removes Fill if present
		if (checked) {
			slotData[idx].roles = slotData[idx].roles.filter(r => r !== "Fill");
			if (!slotData[idx].roles.includes(role)) slotData[idx].roles.push(role);
		} else {
			slotData[idx].roles = slotData[idx].roles.filter(r => r !== role);
		}
	}

	// Re-render to update disabled/selected states cleanly
	renderSlots();
	saveState();
}

function setSlotRank(idx, rank) {
	if (!slotData[idx]) slotData[idx] = { name: "", roles: [], rank: "" };
	slotData[idx].rank = rank;
	renderSlots();
	saveState();
}

function removeSlot(idx) {
	if (slotData.length === 1) {
		slotData = [{ name: "", roles: [], rank: "" }];
	} else {
		slotData.splice(idx, 1);
	}
	renderSlots();
	saveState();
}

function renderSlots() {
	const container = document.getElementById("playerSlots");
	if (!container) return;
	container.innerHTML = "";
	slotData.forEach((slot, idx) => {
		const slotDiv = document.createElement("div");
		slotDiv.className = "player-slot";

			// Slot number
			const numDiv = document.createElement("div");
			numDiv.className = "slot-num";
			numDiv.textContent = (idx + 1).toString();
			slotDiv.appendChild(numDiv);

			// Name input
			const nameInput = document.createElement("input");
			nameInput.type = "text";
			nameInput.placeholder = "Spielername";
			nameInput.value = slot.name || "";
			nameInput.addEventListener("input", (e) => updateSlotName(idx, e.target.value));
			slotDiv.appendChild(nameInput);



		const rolesGroup = document.createElement("div");
		rolesGroup.className = "checkbox-group roles-icons";
		const rolesLabel = document.createElement("label");
		rolesGroup.appendChild(rolesLabel);
			roles.forEach(role => {
				const lbl = document.createElement("label");
				lbl.title = roleNames[role] || role;
				// Mark selected visually
				if (slot.roles.includes(role)) lbl.classList.add('selected');
				const cb = document.createElement("input");
				cb.type = "checkbox";
				cb.checked = slot.roles.includes(role);
				cb.addEventListener("change", (e) => toggleSlotRole(idx, role, e.target.checked));
				const img = document.createElement("img");
				img.src = roleIcons[role];
				img.alt = roleNames[role] || role;
				img.className = "role-icon";
				lbl.appendChild(cb);
				lbl.appendChild(img);
				rolesGroup.appendChild(lbl);
			});
			slotDiv.appendChild(rolesGroup);

		const rankGroup = document.createElement("div");
		rankGroup.className = "bullet-group ranks-icons";
		const rankLabel = document.createElement("label");
		rankGroup.appendChild(rankLabel);
			ranks.forEach(rank => {
				const lbl = document.createElement("label");
				lbl.className = "bullet-option";
				lbl.title = rank;
				if (slot.rank === rank) lbl.classList.add('selected');
				const radio = document.createElement("input");
				radio.type = "radio";
				radio.name = `rank${idx}`;
				radio.value = rank;
				radio.checked = slot.rank === rank;
				radio.addEventListener("change", () => setSlotRank(idx, rank));
				const img = document.createElement("img");
				img.src = rankIcons[rank];
				img.alt = rank;
				img.className = "rank-icon";
				lbl.appendChild(radio);
				lbl.appendChild(img);
				rankGroup.appendChild(lbl);
			});
			slotDiv.appendChild(rankGroup);

			// Delete button placed at the end (Font Awesome trash)
			const removeBtn = document.createElement("button");
			removeBtn.type = "button";
			removeBtn.className = "remove-slot-btn";
			removeBtn.title = "Slot entfernen";
			removeBtn.setAttribute("aria-label", "Slot entfernen");
			removeBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
			removeBtn.addEventListener("click", () => removeSlot(idx));
			slotDiv.appendChild(removeBtn);

			container.appendChild(slotDiv);
	});
}

// Buttons and actions (wait for DOM content to ensure elements exist)
document.addEventListener("DOMContentLoaded", () => {
	loadState();
	// wire the "consider lanes" checkbox
	const considerLanesChk = document.getElementById('considerLanesChk');
	if (considerLanesChk) {
		considerLanesChk.checked = considerLanes;
		considerLanesChk.addEventListener('change', (e) => {
			considerLanes = !!e.target.checked;
			saveState();
		});
	}
	const addBtn = document.getElementById("addPlayerBtn");
	if (addBtn) addBtn.addEventListener("click", () => {
		slotData.push({ name: "", roles: [], rank: "" });
		renderSlots();
		saveState();
	});

	const balanceBtn = document.getElementById("balanceBtn");
	if (balanceBtn) balanceBtn.addEventListener("click", () => {
		const players = slotData
			.map((s, i) => ({ name: s.name.trim(), roles: s.roles, rank: s.rank, slotIndex: i + 1 }))
			.filter(p => p.name && p.roles.length && p.rank);
		if (players.length < 2) {
			alert("At least 2 full players are required!");
			return;
		}
		// select next round with wrap-around so spectators rotate back in
		const sel = selectRound(players, rotationIndex, 10);
		const { playersToBalance, spectators, nextIndex } = sel;
		const { teamA, teamB } = balanceTeams(playersToBalance, { randomize: true, considerLanes });
		renderTeams(teamA, teamB, players.length, spectators);
		rotationIndex = nextIndex;
		saveState();
	});

	// NOTE: Removed separate "rebalance" button — single Balance action handles deterministic

	renderSlots();
});

function renderTeams(teamA, teamB, totalPlayers, spectators = []) {
	const teamsDiv = document.getElementById("teams");
	if (!teamsDiv) return;
	teamsDiv.innerHTML = "";
	const makeTeam = (team, title) => {
		const div = document.createElement("div");
		div.className = "team";
		const h = document.createElement("h2");
		h.textContent = title;
		div.appendChild(h);
		// Order players so the display follows Top, Jungle, Mid, Bot, Support
		const roleDisplayOrder = ["Top", "Jungle", "Mid", "Bot", "Support"];
		const orderedTeam = [];
		roleDisplayOrder.forEach(r => orderedTeam.push(...team.filter(p => p.assignedRole === r)));
		// append any remaining players (Fill or others) after the five main roles
		orderedTeam.push(...team.filter(p => !roleDisplayOrder.includes(p.assignedRole)));

		orderedTeam.forEach((p, idx) => {
			const row = document.createElement("div");
			row.className = "player";

			const numSpan = document.createElement("span");
			numSpan.className = "player-number";
			numSpan.textContent = (p.slotIndex ? p.slotIndex.toString() : (idx + 1).toString());

			const nameSpan = document.createElement("span");
			nameSpan.className = "player-name";
			nameSpan.textContent = p.name;

			const laneSpan = document.createElement("span");
			laneSpan.className = "player-lane";
			const laneImg = document.createElement("img");
			laneImg.src = roleIcons[p.assignedRole] || "";
			laneImg.alt = roleNames[p.assignedRole] || "";
			laneImg.title = roleNames[p.assignedRole] || "";
			laneImg.className = "role-icon";
			laneImg.style.width = "22px";
			laneImg.style.height = "22px";
			if (laneImg.src) laneSpan.appendChild(laneImg);

			const rankSpan = document.createElement("span");
			rankSpan.className = "player-rank";
			const rankImg = document.createElement("img");
			rankImg.src = rankIcons[p.rank] || "";
			rankImg.alt = p.rank || "";
			rankImg.title = p.rank || "";
			rankImg.className = "rank-icon";
			rankImg.style.width = "22px";
			rankImg.style.height = "22px";
			if (rankImg.src) rankSpan.appendChild(rankImg);

			row.appendChild(numSpan);
			row.appendChild(nameSpan);
			row.appendChild(laneSpan);
			row.appendChild(rankSpan);
			div.appendChild(row);
		});
		return div;
	};
	teamsDiv.appendChild(makeTeam(teamA, "Team 1"));
	teamsDiv.appendChild(makeTeam(teamB, "Team 2"));

	// Render spectators (players beyond the first 10) into #specators
	const specDiv = document.getElementById('specators');
	if (specDiv) {
		specDiv.innerHTML = '';
		if (spectators && spectators.length) {
			const h = document.createElement('h3');
			h.textContent = 'Spectators';
			specDiv.appendChild(h);
			spectators.forEach(p => {
				const row = document.createElement('div');
				row.className = 'player spectator';
				const num = document.createElement('span');
				num.className = 'player-number';
				num.textContent = p.slotIndex ? p.slotIndex.toString() : '';
				const name = document.createElement('span');
				name.className = 'player-name';
				name.textContent = p.name;
				const rank = document.createElement('span');
				rank.className = 'player-rank';
				const rankImg = document.createElement('img');
				rankImg.src = rankIcons[p.rank] || '';
				rankImg.alt = p.rank || '';
				if (rankImg.src) rank.appendChild(rankImg);
				row.appendChild(num);
				row.appendChild(name);
				row.appendChild(rank);
				specDiv.appendChild(row);
			});
		} else {
			specDiv.innerHTML = '';
		}
	}

	// Scroll teams section into view so users see the generated teams immediately
	try {
		teamsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
	} catch (e) {
		// fallback: no-op
	}
}

function nextRotation() {
	const players = slotData
		.map((s, i) => ({ name: s.name.trim(), roles: s.roles, rank: s.rank, slotIndex: i + 1 }))
		.filter(p => p.name && p.roles.length && p.rank);
	rotationIndex += 10;
	if (rotationIndex >= players.length) rotationIndex = 0;
	const playersToBalance = players.slice(rotationIndex, rotationIndex + 10);
	const spectators = players.length > 10 ? players.slice(10) : [];
	const { teamA, teamB } = balanceTeams(playersToBalance, { randomize: true, considerLanes });
	renderTeams(teamA, teamB, players.length, spectators);
	saveState();
}

function balanceTeams(playerList, opts = { randomize: false, considerLanes: true }) {
	// Ensure 1v1 per role (Top/Jungle/Mid/Bot/Support) as far as possible.
	const consider = opts.considerLanes !== false;
	// If lane consideration is disabled, balance purely by rank sums
	if (!consider) {
		// Create a sort key that primarily sorts by rank but can use a tiny random tiebreaker
		const keyed = playerList.slice().map(p => ({ p, score: rankToScore(p.rank), rand: (opts.randomize ? Math.random() : 0) }));
		keyed.sort((a, b) => {
			if (b.score !== a.score) return b.score - a.score;
			return b.rand - a.rand;
		});
		const sorted = keyed.map(k => k.p);
		let teamA = [], teamB = [];
		let aScore = 0, bScore = 0;
		while (sorted.length) {
			const p = sorted.shift();
			const score = rankToScore(p.rank);
			if (teamA.length >= 5) {
				p.assignedRole = p.roles.find(r => r !== 'Fill') || p.roles[0] || 'Fill';
				teamB.push(p); bScore += score;
			} else if (teamB.length >= 5) {
				p.assignedRole = p.roles.find(r => r !== 'Fill') || p.roles[0] || 'Fill';
				teamA.push(p); aScore += score;
			} else if (aScore <= bScore) {
				p.assignedRole = p.roles.find(r => r !== 'Fill') || p.roles[0] || 'Fill';
				teamA.push(p); aScore += score;
			} else {
				p.assignedRole = p.roles.find(r => r !== 'Fill') || p.roles[0] || 'Fill';
				teamB.push(p); bScore += score;
			}
		}
		return { teamA: teamA.slice(0, 5), teamB: teamB.slice(0, 5) };
	}

	let playerPool = playerList.map(p => ({ ...p, assignedRole: null }));
	if (opts.randomize) shuffleArray(playerPool);
	let teamA = [], teamB = [];
	const playRoles = roles.filter(r => r !== "Fill");

	// Rotate which role we start assigning first to avoid always favoring the same lane (e.g., Top)
	const start = roleRotation % playRoles.length;
	roleRotation = (roleRotation + 1) % playRoles.length;
	const orderedRoles = playRoles.slice(start).concat(playRoles.slice(0, start));

	const pickBestForRole = (role) => {
		let candidates = playerPool.filter(p => p.assignedRole === null);
		if (!candidates.length) return null;
		// Score: prefer players who selected the role, then Fill, then others; also weight by rank
		const scored = candidates.map(p => {
			let score = rankToScore(p.rank) * 2; // rank baseline
			if (p.roles.includes(role)) score += 50; // strong preference bonus
			else if (p.roles.includes("Fill")) score += 20; // flexible bonus
			else score -= 20; // penalize assigning a non-preferred role when possible
			// tiny randomness as tie-breaker so assignments vary over repeated shuffles
			score += (opts.randomize ? Math.random() * 6 : Math.random() * 1);
			return { p, score };
		});
		scored.sort((a, b) => b.score - a.score);
		return scored.length ? scored[0].p : null;
	};

	// First, ensure each role has one player in each team if possible (using rotated order)
	orderedRoles.forEach(role => {
		const aCand = pickBestForRole(role);
		if (aCand) { aCand.assignedRole = role; teamA.push(aCand); }
		const bCand = pickBestForRole(role);
		if (bCand) { bCand.assignedRole = role; teamB.push(bCand); }
	});

	// Remaining players
	let rest = playerPool.filter(p => p.assignedRole === null);
	// Assign remaining to fill missing roles first, otherwise balance by total rank
	while (rest.length) {
		let aScore = teamA.reduce((s, p) => s + rankToScore(p.rank), 0);
		let bScore = teamB.reduce((s, p) => s + rankToScore(p.rank), 0);
		let next = rest.shift();

		const aMissing = playRoles.filter(r => !teamA.some(p => p.assignedRole === r));
		const bMissing = playRoles.filter(r => !teamB.some(p => p.assignedRole === r));

		if (aMissing.length || bMissing.length) {
			// Prefer to assign someone to a missing role they prefer, otherwise take any missing role
			if (aScore <= bScore && aMissing.length) {
				let role = aMissing.find(r => next.roles.includes(r)) || aMissing[0];
				next.assignedRole = role;
				teamA.push(next);
			} else if (bMissing.length) {
				let role = bMissing.find(r => next.roles.includes(r)) || bMissing[0];
				next.assignedRole = role;
				teamB.push(next);
			} else {
				next.assignedRole = next.roles[0] || "Fill";
				(aScore <= bScore ? teamA : teamB).push(next);
			}
		} else {
			// All role slots taken; assign by balancing total rank
			next.assignedRole = next.roles.find(r => r !== "Fill") || next.roles[0] || "Fill";
			(aScore <= bScore ? teamA : teamB).push(next);
		}
	}

	teamA = teamA.slice(0, 5);
	teamB = teamB.slice(0, 5);
	return { teamA, teamB };
}

// Select a round of players with wrap-around starting at rotationIndex
function selectRound(players, startIndex = 0, size = 10) {
	if (players.length <= size) {
		return { playersToBalance: players.slice(), spectators: [], nextIndex: 0 };
	}
	const playersToBalance = [];
	const used = new Set();
	for (let i = 0; i < size; i++) {
		const idx = (startIndex + i) % players.length;
		playersToBalance.push(players[idx]);
		used.add(idx);
	}
	const spectators = players.filter((_, idx) => !used.has(idx));
	const nextIndex = (startIndex + size) % players.length;
	return { playersToBalance, spectators, nextIndex };
}