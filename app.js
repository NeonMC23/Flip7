/***********************
 * DECK
 ***********************/
const deck = [
  { id: "second_chance", label: "2nd", count: 3, type: "bonus" },
  { id: "stop", label: "Stop", count: 3, type: "bonus" },
  { id: "three", label: "3x", count: 3, type: "bonus" },

  { id: "p2", label: "+2", count: 1, type: "score" },
  { id: "p4", label: "+4", count: 1, type: "score" },
  { id: "p6", label: "+6", count: 1, type: "score" },
  { id: "p8", label: "+8", count: 1, type: "score" },
  { id: "p10", label: "+10", count: 1, type: "score" },
  { id: "x2", label: "×2", count: 1, type: "multiplier" },

  ...Array.from({ length: 13 }, (_, v) => ({
    id: String(v),
    label: String(v),
    value: v,
    count: v <= 1 ? 1 : v,
    type: "number"
  }))
];

/***********************
 * STATE
 ***********************/
const state = {
  myCounts: {},
  otherCounts: {}
};

const myPileEl = document.getElementById("my-pile");
const selectEl = document.getElementById("add-card-select");
const addBtn = document.getElementById("add-card-btn");
const otherPileEl = document.getElementById("other-pile");

/***********************
 * TON TAS
 ***********************/
function refreshSelect() {
  selectEl.innerHTML = "";
  deck.forEach(card => {
    if (!state.myCounts[card.id]) {
      const opt = document.createElement("option");
      opt.value = card.id;
      opt.textContent = card.label;
      selectEl.appendChild(opt);
    }
  });
}

function renderMyPile() {
  myPileEl.innerHTML = "";
  Object.keys(state.myCounts).forEach(id => {
    const card = deck.find(c => c.id === id);
    const pill = document.createElement("div");
    pill.className = "pill";
    pill.innerHTML = `
      ${card.label}
      <button>×</button>
    `;
    pill.querySelector("button").onclick = () => {
      delete state.myCounts[id];
      refreshSelect();
      renderMyPile();
    };
    myPileEl.appendChild(pill);
  });
}

addBtn.onclick = () => {
  const id = selectEl.value;
  if (!id) return;
  state.myCounts[id] = 1;
  refreshSelect();
  renderMyPile();
};

refreshSelect();

/***********************
 * AUTRES / DÉFAUSSE
 ***********************/
deck.forEach(card => {
  const el = document.createElement("div");
  el.className = "other-card";

  let value = 0;

  el.innerHTML = `
    <span>${card.label}</span>
    <div class="counter">
      <button>-</button>
      <span>0</span>
      <button>+</button>
    </div>
  `;

  const [minus, plus] = el.querySelectorAll("button");
  const valueEl = el.querySelector(".counter span");

  function update(delta) {
    const my = state.myCounts[card.id] || 0;
    value = Math.max(0, Math.min(card.count - my, value + delta));
    state.otherCounts[card.id] = value;
    valueEl.textContent = value;
  }

  minus.onclick = () => update(-1);
  plus.onclick = () => update(1);

  otherPileEl.appendChild(el);
});

/***********************
 * PROBAS
 ***********************/
function calculate() {
  let total = 0, lose = 0, bonus = 0;

  deck.forEach(card => {
    const my = state.myCounts[card.id] || 0;
    const other = state.otherCounts[card.id] || 0;
    const remaining = card.count - my - other;
    if (remaining <= 0) return;

    total += remaining;

    if (card.type === "number" && my > 0) lose += remaining;
    if (card.type !== "number") bonus += remaining;
  });

  return {
    lose: lose / total,
    bonus: bonus / total
  };
}

document.getElementById("compute").onclick = () => {
  const { lose, bonus } = calculate();
  document.getElementById("lose-proba").textContent =
    (lose * 100).toFixed(2) + " %";
  document.getElementById("bonus-proba").textContent =
    (bonus * 100).toFixed(2) + " %";
};
