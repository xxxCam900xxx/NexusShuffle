// NexusShuffle - cleaned script.js

let slotData = [{ name: "", roles: [], rank: "" }];
let rotationIndex = 0;

const roles = ["Top", "Jungle", "Mid", "Bot", "Support", "Fill"];
const roleIcons = {
	Top: "assets/roles/role-top.png",
	Jungle: "assets/roles/role-jgl.png",
	Mid: "assets/roles/role-mid.png",
	Bot: "assets/roles/role-bot.png",
	Support: "assets/roles/role-sup.png",
	Fill: "assets/roles/role-fill.png"
};
const roleNames = { Top: "Top", Jungle: "Jungle", Mid: "Mid", Bot: "Bot", Support: "Support", Fill: "Auto Fill" };
const rankIcons = {
	Iron: "assets/rank/rank-iron.png",
	Bronze: "assets/rank/rank-bronze.png",
	Silver: "assets/rank/rank-silver.png",
	Gold: "assets/rank/rank-gold.png",
	Platinum: "assets/rank/rank-platinum.png",
	Diamond: "assets/rank/rank-diamond.png",
	Master: "assets/rank/rank-master.png",
	Grandmaster: "assets/rank/rank-grandmaster.png",
	Challenger: "assets/rank/rank-challenger.png"
};
const ranks = ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster", "Challenger"];

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
}

function setSlotRank(idx, rank) {
	if (!slotData[idx]) slotData[idx] = { name: "", roles: [], rank: "" };
	slotData[idx].rank = rank;
	renderSlots();
}

function removeSlot(idx) {
	if (slotData.length === 1) {
		slotData = [{ name: "", roles: [], rank: "" }];
	} else {
		slotData.splice(idx, 1);
	}
	renderSlots();
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
		rolesLabel.textContent = "Rollen:";
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
		rankLabel.textContent = "Rang:";
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
	const addBtn = document.getElementById("addPlayerBtn");
	if (addBtn) addBtn.addEventListener("click", () => {
		slotData.push({ name: "", roles: [], rank: "" });
		renderSlots();
	});

	const balanceBtn = document.getElementById("balanceBtn");
	if (balanceBtn) balanceBtn.addEventListener("click", () => {
		const players = slotData
			.map(s => ({ name: s.name.trim(), roles: s.roles, rank: s.rank }))
			.filter(p => p.name && p.roles.length && p.rank);
		if (players.length < 2) {
			alert("Mindestens 2 vollständige Spieler benötigt!");
			return;
		}
		rotationIndex = 0;
		const { teamA, teamB } = balanceTeams(players.slice(rotationIndex, rotationIndex + 10), { randomize: false });
		renderTeams(teamA, teamB, players.length);
	});

	// Rebalance (randomized) button - produces alternate assignments
	const rebalanceBtn = document.getElementById("rebalanceBtn");
	if (rebalanceBtn) rebalanceBtn.addEventListener("click", () => {
		const players = slotData
			.map(s => ({ name: s.name.trim(), roles: s.roles, rank: s.rank }))
			.filter(p => p.name && p.roles.length && p.rank);
		if (players.length < 2) {
			alert("Mindestens 2 vollständige Spieler benötigt!");
			return;
		}
		rotationIndex = 0;
		const { teamA, teamB } = balanceTeams(players.slice(rotationIndex, rotationIndex + 10), { randomize: true });
		renderTeams(teamA, teamB, players.length);
	});

	renderSlots();
});

function renderTeams(teamA, teamB, totalPlayers) {
	const teamsDiv = document.getElementById("teams");
	if (!teamsDiv) return;
	teamsDiv.innerHTML = "";
	const makeTeam = (team, title) => {
		const div = document.createElement("div");
		div.className = "team";
		const h = document.createElement("h2");
		h.textContent = title;
		div.appendChild(h);
		team.forEach(p => {
			const row = document.createElement("div");
			row.className = "player";
			const nameSpan = document.createElement("span");
			nameSpan.textContent = p.name;
			const iconSpan = document.createElement("span");
			const roleImg = document.createElement("img");
			roleImg.src = roleIcons[p.assignedRole] || "";
			roleImg.alt = roleNames[p.assignedRole] || "";
			roleImg.title = roleNames[p.assignedRole] || "";
			roleImg.className = "role-icon";
			roleImg.style.width = "22px";
			roleImg.style.height = "22px";
			const rankImg = document.createElement("img");
			rankImg.src = rankIcons[p.rank] || "";
			rankImg.alt = p.rank || "";
			rankImg.title = p.rank || "";
			rankImg.className = "rank-icon";
			rankImg.style.width = "22px";
			rankImg.style.height = "22px";
			iconSpan.appendChild(roleImg);
			iconSpan.appendChild(rankImg);
			row.appendChild(nameSpan);
			row.appendChild(iconSpan);
			div.appendChild(row);
		});
		return div;
	};
	teamsDiv.appendChild(makeTeam(teamA, "Team 1"));
	teamsDiv.appendChild(makeTeam(teamB, "Team 2"));
	if (totalPlayers > 10) {
		const nextBtn = document.createElement("button");
		nextBtn.id = "nextRotationBtn";
		nextBtn.style.marginTop = "20px";
		nextBtn.textContent = "Nächste Spieler-Rotation";
		nextBtn.addEventListener("click", nextRotation);
		teamsDiv.appendChild(nextBtn);
	}
}

function nextRotation() {
	const players = slotData
		.map(s => ({ name: s.name.trim(), roles: s.roles, rank: s.rank }))
		.filter(p => p.name && p.roles.length && p.rank);
	rotationIndex += 10;
	if (rotationIndex >= players.length) rotationIndex = 0;
	const { teamA, teamB } = balanceTeams(players.slice(rotationIndex, rotationIndex + 10));
	renderTeams(teamA, teamB, players.length);
}

function balanceTeams(playerList, opts = { randomize: false }) {
	// playerList: array of {name, roles[], rank}
	let playerPool = playerList.map(p => ({ ...p, assignedRole: null }));
	if (opts.randomize) shuffleArray(playerPool);
	let teamA = [], teamB = [];

	// 1. Cover each lane if possible (non-Fill). When randomize=true, pick randomly among the top candidates.
	roles.filter(r => r !== "Fill").forEach(role => {
		let candidates = playerPool.filter(p => p.assignedRole === null && p.roles.includes(role));
		if (candidates.length === 0) return;
		candidates.sort((a, b) => rankToScore(b.rank) - rankToScore(a.rank));
		if (!opts.randomize) {
			if (candidates[0]) { candidates[0].assignedRole = role; teamA.push(candidates[0]); }
			if (candidates[1]) { candidates[1].assignedRole = role; teamB.push(candidates[1]); }
		} else {
			const topN = Math.min(4, candidates.length);
			const pool = candidates.slice(0, topN);
			const aIdx = Math.floor(Math.random() * pool.length);
			const chosenA = pool.splice(aIdx, 1)[0];
			chosenA.assignedRole = role; teamA.push(chosenA);
			let chosenB = null;
			if (pool.length > 0) {
				const bIdx = Math.floor(Math.random() * pool.length);
				chosenB = pool.splice(bIdx, 1)[0];
			} else {
				chosenB = candidates.find(c => c.assignedRole === null && c !== chosenA);
			}
			if (chosenB) { chosenB.assignedRole = role; teamB.push(chosenB); }
		}
	});

	// 2. Assign remaining players trying to balance total rank; when randomize=true choose among available roles randomly
	let rest = playerPool.filter(p => p.assignedRole === null);
	rest.sort((a, b) => rankToScore(b.rank) - rankToScore(a.rank));
	while (rest.length) {
		let aScore = teamA.reduce((s, p) => s + rankToScore(p.rank), 0);
		let bScore = teamB.reduce((s, p) => s + rankToScore(p.rank), 0);
		let next = rest.shift();
		let freeRolesA = roles.filter(r => r !== "Fill" && !teamA.some(p => p.assignedRole === r) && next.roles.includes(r));
		let freeRolesB = roles.filter(r => r !== "Fill" && !teamB.some(p => p.assignedRole === r) && next.roles.includes(r));

		const pickRoleFrom = (roleList) => {
			if (!roleList || roleList.length === 0) return null;
			if (opts.randomize) return roleList[Math.floor(Math.random() * roleList.length)];
			return roleList[0];
		};

		if (aScore <= bScore && freeRolesA.length) {
			next.assignedRole = pickRoleFrom(freeRolesA);
			teamA.push(next);
		} else if (freeRolesB.length) {
			next.assignedRole = pickRoleFrom(freeRolesB);
			teamB.push(next);
		} else if (aScore <= bScore && next.roles.includes("Fill")) {
			let openA = roles.filter(r => r !== "Fill" && !teamA.some(p => p.assignedRole === r));
			next.assignedRole = pickRoleFrom(openA) || "Fill";
			teamA.push(next);
		} else if (next.roles.includes("Fill")) {
			let openB = roles.filter(r => r !== "Fill" && !teamB.some(p => p.assignedRole === r));
			next.assignedRole = pickRoleFrom(openB) || "Fill";
			teamB.push(next);
		} else {
			next.assignedRole = next.roles[0] || "Fill";
			(aScore <= bScore ? teamA : teamB).push(next);
		}
	}

	teamA = teamA.slice(0, 5);
	teamB = teamB.slice(0, 5);
	return { teamA, teamB };
}