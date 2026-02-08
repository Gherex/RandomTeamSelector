const playerInput = document.querySelector("#player-name");
const addPlayerBtn = document.querySelector("#add-player");
const playersList = document.querySelector("#players-list");
const playersCount = document.querySelector("#players-count");
const teamSizeSelect = document.querySelector("#team-size");
const generateBtn = document.querySelector("#generate");
const teamList = document.querySelector("#team-list");
const spectatorsList = document.querySelector("#spectators-list");
const statusLabel = document.querySelector("#status");
const errorLabel = document.querySelector("#error");

const STORAGE_KEYS = {
  players: "random-team-players",
  result: "random-team-result",
  teamSize: "random-team-size",
};

let players = [];
let isGenerating = false;

const updatePlayersView = () => {
  playersList.innerHTML = "";
  players.forEach((name, index) => {
    const item = document.createElement("li");
    const nameSpan = document.createElement("span");
    nameSpan.className = "player-name";
    nameSpan.textContent = name;

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove";
    removeBtn.type = "button";
    removeBtn.textContent = "Quitar";
    removeBtn.addEventListener("click", () => {
      players = players.filter((_, i) => i !== index);
      updatePlayersView();
    });

    item.append(nameSpan, removeBtn);
    playersList.appendChild(item);
  });

  playersCount.textContent = players.length;
  savePlayers();
};

const renderResult = (team, spectators) => {
  teamList.innerHTML = "";
  spectatorsList.innerHTML = "";

  team.forEach((name) => {
    const item = document.createElement("li");
    item.textContent = name;
    teamList.appendChild(item);
  });

  spectators.forEach((name) => {
    const item = document.createElement("li");
    item.textContent = name;
    spectatorsList.appendChild(item);
  });

  localStorage.setItem(
    STORAGE_KEYS.result,
    JSON.stringify({ team, spectators })
  );
};

const showError = (message) => {
  errorLabel.textContent = message;
  errorLabel.hidden = false;
};

const clearError = () => {
  errorLabel.hidden = true;
  errorLabel.textContent = "";
};

const normalizeNames = (value) =>
  value
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

const addPlayers = () => {
  const rawValue = playerInput.value;
  if (!rawValue.trim()) return;

  const newNames = normalizeNames(rawValue);
  const uniqueNames = newNames.filter((name) => !players.includes(name));

  players = [...players, ...uniqueNames];
  playerInput.value = "";
  updatePlayersView();
};

const shuffle = (array) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const setGeneratingState = (state) => {
  isGenerating = state;
  generateBtn.disabled = state;
  addPlayerBtn.disabled = state;
  playerInput.disabled = state;
  teamSizeSelect.disabled = state;
  statusLabel.textContent = state
    ? "Generando equipos..."
    : "Listo para generar";
};

const savePlayers = () => {
  localStorage.setItem(STORAGE_KEYS.players, JSON.stringify(players));
};

const loadPlayers = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.players));
    if (Array.isArray(saved)) {
      players = saved;
    }
  } catch (error) {
    players = [];
  }
};

const loadResult = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.result));
    if (saved?.team && saved?.spectators) {
      renderResult(saved.team, saved.spectators);
    }
  } catch (error) {
    renderResult([], []);
  }
};

const loadTeamSize = () => {
  const saved = Number(localStorage.getItem(STORAGE_KEYS.teamSize));
  if ([2, 3, 5].includes(saved)) {
    teamSizeSelect.value = String(saved);
  }
};

const generateTeams = () => {
  clearError();
  const teamSize = Number(teamSizeSelect.value);

  if (players.length < teamSize) {
    showError(
      `Necesitás al menos ${teamSize} jugadores para armar el team.`
    );
    return;
  }

  if (isGenerating) return;

  setGeneratingState(true);
  renderResult([], []);

  const shuffled = shuffle(players);
  const team = shuffled.slice(0, teamSize);
  const spectators = shuffled.slice(teamSize);

  setTimeout(() => {
    renderResult(team, spectators);
    setGeneratingState(false);
  }, 2000);
};

addPlayerBtn.addEventListener("click", addPlayers);
playerInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addPlayers();
  }
});

generateBtn.addEventListener("click", generateTeams);
teamSizeSelect.addEventListener("change", () => {
  localStorage.setItem(STORAGE_KEYS.teamSize, teamSizeSelect.value);
});

loadPlayers();
loadTeamSize();
updatePlayersView();
loadResult();