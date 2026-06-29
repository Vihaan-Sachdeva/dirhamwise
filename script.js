const body = document.body;
const toggleButton = document.querySelector("[data-mode-toggle]");
const COOKIE_MAX_AGE_DAYS = 180;

function setCookie(name, value, days = COOKIE_MAX_AGE_DAYS) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name) {
  const prefix = `${name}=`;
  const parts = document.cookie.split(";").map((part) => part.trim());
  const matched = parts.find((part) => part.startsWith(prefix));
  return matched ? decodeURIComponent(matched.slice(prefix.length)) : null;
}

function getJsonCookie(name, fallback) {
  const raw = getCookie(name);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setJsonCookie(name, value) {
  setCookie(name, JSON.stringify(value));
}

const savedMode = getCookie("dirhamwise-mode") || localStorage.getItem("dirhamwise-mode");

if (savedMode === "dark") {
  body.classList.add("dark");
}

if (toggleButton) {
  const syncToggleText = () => {
    toggleButton.innerHTML = body.classList.contains("dark")
      ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2v2.4M12 18.4v2.4M4.8 12H2.4M21.6 12h-2.4M6.4 6.4 4.8 4.8M19.2 19.2l-1.6-1.6M17.6 6.4l1.6-1.6M6.4 17.6l-1.6 1.6M12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" stroke="currentColor" fill="none" stroke-width="1.7" stroke-linecap="round"/></svg> Light`
      : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.6 8.6 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" stroke="currentColor" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg> Dark`;
  };

  syncToggleText();
  toggleButton.addEventListener("click", () => {
    body.classList.toggle("dark");
    const mode = body.classList.contains("dark") ? "dark" : "light";
    localStorage.setItem("dirhamwise-mode", mode);
    setCookie("dirhamwise-mode", mode);
    syncToggleText();
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("on");
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

const monthBudget = document.querySelector("#monthBudget");
const needSpend = document.querySelector("#needSpend");
const wantSpend = document.querySelector("#wantSpend");
const saveSpend = document.querySelector("#saveSpend");
const expenseName = document.querySelector("#expenseName");
const expenseCategory = document.querySelector("#expenseCategory");
const expenseAmount = document.querySelector("#expenseAmount");
const addExpenseBtn = document.querySelector("#addExpenseBtn");
const expenseList = document.querySelector("#expenseList");

const budgetNeedsText = document.querySelector("[data-stat='needs']");
const budgetWantsText = document.querySelector("[data-stat='wants']");
const budgetSaveText = document.querySelector("[data-stat='save']");
const budgetLeftText = document.querySelector("[data-stat='left']");
const filteredTotal = document.querySelector("#filteredTotal");
const pieChart = document.querySelector("#pieChart");
const pieLegend = document.querySelector("#pieLegend");
const filterList = document.querySelector("#filterList");
const newFilterInput = document.querySelector("#newFilterInput");
const newFilterAmount = document.querySelector("#newFilterAmount");
const addFilterBtn = document.querySelector("#addFilterBtn");

let nextInsightId = 1;

const plannerCookie = getJsonCookie("coino-planner", null);
if (plannerCookie) {
  if (monthBudget) monthBudget.value = String(Math.max(0, Number(plannerCookie.monthBudget) || 0));
  if (needSpend) needSpend.value = String(Math.max(0, Number(plannerCookie.needs) || 0));
  if (wantSpend) wantSpend.value = String(Math.max(0, Number(plannerCookie.wants) || 0));
  if (saveSpend) saveSpend.value = String(Math.max(0, Number(plannerCookie.savings) || 0));
}

function savePlannerCookie() {
  setJsonCookie("coino-planner", {
    monthBudget: Number(monthBudget?.value || 0),
    needs: Number(needSpend?.value || 0),
    wants: Number(wantSpend?.value || 0),
    savings: Number(saveSpend?.value || 0)
  });
}

function updateBudgetPlanner() {
  if (!monthBudget || !needSpend || !wantSpend || !saveSpend) return;
  const budget = Number(monthBudget.value) || 0;
  const needs = Number(needSpend.value) || 0;
  const wants = Number(wantSpend.value) || 0;
  const save = Number(saveSpend.value) || 0;
  const left = budget - (needs + wants + save);
  if (budgetNeedsText) budgetNeedsText.textContent = formatAed(needs);
  if (budgetWantsText) budgetWantsText.textContent = formatAed(wants);
  if (budgetSaveText) budgetSaveText.textContent = formatAed(save);
  if (budgetLeftText) budgetLeftText.textContent = `${left >= 0 ? "" : "-"}${formatAed(Math.abs(left))}`;
}

[monthBudget, needSpend, wantSpend, saveSpend].forEach((el) => {
  if (el)
    el.addEventListener("input", () => {
      updateBudgetPlanner();
      savePlannerCookie();
    });
});
updateBudgetPlanner();

const goalName = document.querySelector("#goalName");
const goalAmount = document.querySelector("#goalAmount");
const goalSaved = document.querySelector("#goalSaved");
const goalWeekly = document.querySelector("#goalWeekly");
const addGoalBtn = document.querySelector("#addGoalBtn");
const goalList = document.querySelector("#goalList");

const state = {
  expenses: [],
  goals: [],
  insightFilters: []
};

function saveExpensesCookie() {
  setJsonCookie("coino-expenses", state.expenses);
}

function saveGoalsCookie() {
  setJsonCookie("coino-goals", state.goals);
}

function saveInsightFiltersCookie() {
  setJsonCookie("coino-insight-filters", state.insightFilters);
}

const pieColors = ["#5d5fef", "#31c2ff", "#67dbac", "#ff7a99", "#f9b86a", "#a580ff", "#5ecfcf"];

function formatAed(value) {
  return `AED ${Math.round(value).toLocaleString()}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function drawPie(data) {
  if (!pieChart) return;
  pieChart.innerHTML = "";
  if (!data.length) {
    pieChart.innerHTML = `<circle cx="120" cy="120" r="90" fill="none" stroke="var(--line)" stroke-width="34"></circle><text x="120" y="125" text-anchor="middle" fill="var(--muted)" font-size="12">No data</text>`;
    return;
  }
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  let angle = -Math.PI / 2;
  data.forEach((item, i) => {
    const slice = (item.amount / total) * Math.PI * 2;
    const x1 = 120 + Math.cos(angle) * 90;
    const y1 = 120 + Math.sin(angle) * 90;
    angle += slice;
    const x2 = 120 + Math.cos(angle) * 90;
    const y2 = 120 + Math.sin(angle) * 90;
    const large = slice > Math.PI ? 1 : 0;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M 120 120 L ${x1} ${y1} A 90 90 0 ${large} 1 ${x2} ${y2} Z`);
    const fill = item.color || pieColors[i % pieColors.length];
    path.setAttribute("fill", fill);
    pieChart.appendChild(path);
  });
  const inner = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  inner.setAttribute("cx", "120");
  inner.setAttribute("cy", "120");
  inner.setAttribute("r", "54");
  inner.setAttribute("fill", "var(--surface-strong)");
  pieChart.appendChild(inner);
}

function renderInsights() {
  if (!pieLegend) return;
  const activeRows = state.insightFilters.filter((f) => f.active && f.name.trim());
  const pieData = activeRows.map((f, i) => ({
    category: f.name.trim(),
    amount: Math.max(0, f.amount),
    color: pieColors[i % pieColors.length]
  }));
  const drawData = pieData.filter((d) => d.amount > 0);
  drawPie(drawData);
  pieLegend.innerHTML = pieData
    .map(
      (item) =>
        `<div class="legend-item"><span><span class="legend-color" style="background:${item.color}"></span>${escapeHtml(item.category)}</span><strong>${formatAed(item.amount)}</strong></div>`
    )
    .join("");
  const total = activeRows.reduce((sum, f) => sum + Math.max(0, f.amount), 0);
  if (filteredTotal) filteredTotal.textContent = formatAed(total);
}

function renderInsightFilterRows() {
  if (!filterList) return;
  filterList.innerHTML = state.insightFilters
    .map(
      (f) => `
    <div class="filter-row-item" data-insight-id="${f.id}">
      <label>Name<input type="text" class="filter-name" value="${escapeHtml(f.name)}" data-insight-field="name" autocomplete="off" /></label>
      <label class="filter-amount">Amount (AED)<input type="number" class="filter-amount-input" min="0" step="1" value="${f.amount}" data-insight-field="amount" /></label>
      <label class="filter-include"><input type="checkbox" data-insight-field="active" ${f.active ? "checked" : ""} /> In chart</label>
      <button type="button" class="filter-delete" data-insight-delete="${f.id}">Delete</button>
    </div>`
    )
    .join("");
}

function syncInsightRowToState(row) {
  const id = Number(row.dataset.insightId);
  const f = state.insightFilters.find((x) => x.id === id);
  if (!f) return;
  const nameInput = row.querySelector('[data-insight-field="name"]');
  const amountInput = row.querySelector('[data-insight-field="amount"]');
  const activeInput = row.querySelector('[data-insight-field="active"]');
  if (nameInput instanceof HTMLInputElement) f.name = nameInput.value;
  if (amountInput instanceof HTMLInputElement) f.amount = Math.max(0, Number(amountInput.value) || 0);
  if (activeInput instanceof HTMLInputElement) f.active = activeInput.checked;
}

function renderExpenses() {
  if (!expenseList) return;
  expenseList.innerHTML = state.expenses
    .map(
      (item, index) => `
      <div class="list-item">
        <span>${item.name} • ${item.category} • ${formatAed(item.amount)}</span>
        <button type="button" data-remove-expense="${index}">Remove</button>
      </div>`
    )
    .join("");
  renderInsights();
}

function updateGoalCardFromSlider(card, goal) {
  const savedClamped = Math.min(Math.max(0, goal.saved), goal.amount);
  const progress = goal.amount > 0 ? Math.min(100, (savedClamped / goal.amount) * 100) : 0;
  const remaining = Math.max(0, goal.amount - savedClamped);
  const weeks = Math.ceil(remaining / Math.max(1, goal.weekly));
  const fill = card.querySelector(".goal-progress-fill");
  if (fill) fill.style.width = `${progress}%`;
  const amountLine = card.querySelector("[data-goal-amount-line]");
  if (amountLine) amountLine.textContent = `${formatAed(savedClamped)} / ${formatAed(goal.amount)}`;
  const pct = card.querySelector("[data-goal-pct]");
  if (pct) pct.textContent = `${progress.toFixed(0)}%`;
  const weeksEl = card.querySelector("[data-goal-weeks]");
  if (weeksEl) weeksEl.textContent = remaining === 0 ? "Goal complete" : `${weeks} week(s) left`;
}

function renderGoals() {
  if (!goalList) return;
  goalList.innerHTML = state.goals
    .map((goal, index) => {
      const savedClamped = Math.min(Math.max(0, goal.saved), goal.amount);
      const progress = goal.amount > 0 ? Math.min(100, (savedClamped / goal.amount) * 100) : 0;
      const remaining = Math.max(0, goal.amount - savedClamped);
      const weeks = Math.ceil(remaining / Math.max(1, goal.weekly));
      return `
      <article class="goal-card">
        <div class="metric">
          <strong>${escapeHtml(goal.name)}</strong>
          <button type="button" data-remove-goal="${index}">Remove</button>
        </div>
        <div class="metric"><span data-goal-amount-line>${formatAed(savedClamped)} / ${formatAed(goal.amount)}</span><span data-goal-pct>${progress.toFixed(0)}%</span></div>
        <div class="goal-slider-wrap">
          <label class="goal-slider-label">
            <span>Adjust saved amount</span>
            <input type="range" class="goal-slider" min="0" max="${goal.amount}" step="1" value="${savedClamped}" data-goal-slider="${index}" aria-label="Saved amount for ${escapeHtml(goal.name)}" />
          </label>
          <div class="progress" aria-hidden="true"><span class="goal-progress-fill" style="width:${progress}%"></span></div>
        </div>
        <div class="metric"><span data-goal-weeks>${remaining === 0 ? "Goal complete" : `${weeks} week(s) left`}</span><span>Weekly ${formatAed(goal.weekly)}</span></div>
      </article>`;
    })
    .join("");
}

if (addExpenseBtn) {
  addExpenseBtn.addEventListener("click", () => {
    const name = expenseName?.value.trim();
    const category = expenseCategory?.value.trim();
    const amount = Number(expenseAmount?.value || 0);
    if (!name || !category || amount <= 0) return;
    state.expenses.push({ name, category, amount });
    saveExpensesCookie();
    renderExpenses();
    if (expenseName) expenseName.value = "";
    if (expenseAmount) expenseAmount.value = "20";
  });
}

if (expenseList) {
  expenseList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const idx = target.dataset.removeExpense;
    if (idx === undefined) return;
    state.expenses.splice(Number(idx), 1);
    saveExpensesCookie();
    renderExpenses();
  });
}

if (addGoalBtn) {
  addGoalBtn.addEventListener("click", () => {
    if (state.goals.length >= 5) return;
    const name = goalName?.value.trim() || `Goal ${state.goals.length + 1}`;
    const amount = Number(goalAmount?.value || 0);
    const saved = Number(goalSaved?.value || 0);
    const weekly = Number(goalWeekly?.value || 0);
    if (amount <= 0 || weekly <= 0 || saved < 0) return;
    const savedClamped = Math.min(amount, saved);
    state.goals.push({ name, amount, saved: savedClamped, weekly });
    saveGoalsCookie();
    renderGoals();
    if (goalName) goalName.value = "";
  });
}

if (goalList) {
  goalList.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.classList.contains("goal-slider")) return;
    const idx = Number(target.dataset.goalSlider);
    const goal = state.goals[idx];
    if (!goal) return;
    goal.saved = Math.min(goal.amount, Math.max(0, Number(target.value) || 0));
    saveGoalsCookie();
    const card = target.closest(".goal-card");
    if (card) updateGoalCardFromSlider(card, goal);
  });

  goalList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const idx = target.dataset.removeGoal;
    if (idx === undefined) return;
    state.goals.splice(Number(idx), 1);
    saveGoalsCookie();
    renderGoals();
  });
}

if (addFilterBtn) {
  addFilterBtn.addEventListener("click", () => {
    const name = newFilterInput?.value.trim() || "New filter";
    const amount = Math.max(0, Number(newFilterAmount?.value) || 0);
    state.insightFilters.push({ id: nextInsightId++, name, amount, active: true });
    saveInsightFiltersCookie();
    renderInsightFilterRows();
    renderInsights();
    if (newFilterInput) newFilterInput.value = "";
    if (newFilterAmount) newFilterAmount.value = "0";
  });
}

if (filterList) {
  filterList.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const row = target.closest("[data-insight-id]");
    if (!row) return;
    syncInsightRowToState(row);
    saveInsightFiltersCookie();
    renderInsights();
  });

  filterList.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.dataset.insightField !== "active") return;
    const row = target.closest("[data-insight-id]");
    if (!row) return;
    syncInsightRowToState(row);
    saveInsightFiltersCookie();
    renderInsights();
  });

  filterList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const del = target.closest("[data-insight-delete]");
    if (!del || !(del instanceof HTMLElement)) return;
    const id = Number(del.dataset.insightDelete);
    state.insightFilters = state.insightFilters.filter((f) => f.id !== id);
    saveInsightFiltersCookie();
    renderInsightFilterRows();
    renderInsights();
  });
}

const navLinks = [...document.querySelectorAll(".top-links a")];
const sections = ["home", "planner", "goals", "insights"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

window.addEventListener("scroll", () => {
  const y = window.scrollY;
  document.querySelectorAll(".parallax-soft").forEach((el) => {
    el.style.setProperty("--parallax-y", `${Math.min(20, y * 0.03)}px`);
  });
  let current = "home";
  sections.forEach((section) => {
    if (section.offsetTop - 140 <= y) current = section.id;
  });
  navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${current}`));
});

const defaultExpenses = [
  { name: "Lunch", category: "Food", amount: 35 },
  { name: "Metro card", category: "Transport", amount: 40 },
  { name: "Notebook", category: "School", amount: 25 }
];
const defaultInsightFilters = [
  { id: 1, name: "Food", amount: 35, active: true },
  { id: 2, name: "Transport", amount: 40, active: true },
  { id: 3, name: "School", amount: 25, active: true }
];
const defaultGoals = [{ name: "Headphones", amount: 350, saved: 80, weekly: 25 }];

state.expenses = getJsonCookie("coino-expenses", defaultExpenses);
state.insightFilters = getJsonCookie("coino-insight-filters", defaultInsightFilters);
state.goals = getJsonCookie("coino-goals", defaultGoals);
nextInsightId = state.insightFilters.reduce((max, f) => Math.max(max, Number(f.id) || 0), 0) + 1;
renderGoals();
renderInsightFilterRows();
renderExpenses();

savePlannerCookie();
saveExpensesCookie();
saveGoalsCookie();
saveInsightFiltersCookie();
