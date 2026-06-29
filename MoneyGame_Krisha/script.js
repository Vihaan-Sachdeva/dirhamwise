// DirhamWise main script – clean version

document.addEventListener('DOMContentLoaded', () => {
  // =======================
  // 1. XP + PROFILE SYSTEM
  // =======================

  const xpLevelEl = document.getElementById('xpLevel');
  const xpTotalEl = document.getElementById('xpTotal');
  const xpCounterEl = document.querySelector('.xp-counter');

  let xp = 2450;
  let level = 4;

  function updateXpDisplay() {
    if (!xpLevelEl || !xpTotalEl) return;
    xpLevelEl.textContent = level;
    xpTotalEl.textContent = xp;
  }

  const avatarSmall = document.querySelector('.avatar');
  const profileAvatarLarge = document.getElementById('profileAvatarLarge');
  const profileLevelEl = document.getElementById('profileLevel');
  const profileXpEl = document.getElementById('profileXp');

  const profileNameInput = document.getElementById('profileName');
  const profileInitialsInput = document.getElementById('profileInitials');
  const profileBioInput = document.getElementById('profileBio');
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  const resetProfileBtn = document.getElementById('resetProfileBtn');

  let profileName = 'Student';
  let profileInitials = 'SK';
  let profileBio = '';

  function syncProfileDisplay() {
    if (avatarSmall) avatarSmall.textContent = profileInitials || 'SK';
    if (profileAvatarLarge) profileAvatarLarge.textContent = profileInitials || 'SK';
    if (profileLevelEl) profileLevelEl.textContent = level;
    if (profileXpEl) profileXpEl.textContent = xp;
    if (profileNameInput && !profileNameInput.value) profileNameInput.value = profileName;
    if (profileInitialsInput && !profileInitialsInput.value) profileInitialsInput.value = profileInitials;
    if (profileBioInput && !profileBioInput.value) profileBioInput.value = profileBio;
  }

  function addXp(amount) {
    xp += amount;
    const newLevel = Math.floor(xp / 1000);
    if (newLevel !== level) {
      level = newLevel;
    }
    updateXpDisplay();
    syncProfileDisplay();
    if (xpCounterEl) {
      xpCounterEl.classList.add('pulse');
      setTimeout(() => xpCounterEl.classList.remove('pulse'), 600);
    }
  }

  function saveProfile() {
    if (profileNameInput) profileName = profileNameInput.value || 'Student';
    if (profileInitialsInput) profileInitials = profileInitialsInput.value.toUpperCase() || 'SK';
    if (profileBioInput) profileBio = profileBioInput.value || '';
    syncProfileDisplay();
    alert('Profile updated!');
  }

  function resetProfile() {
    profileName = 'Student';
    profileInitials = 'SK';
    profileBio = '';
    if (profileNameInput) profileNameInput.value = profileName;
    if (profileInitialsInput) profileInitialsInput.value = profileInitials;
    if (profileBioInput) profileBioInput.value = profileBio;
    syncProfileDisplay();
  }

  if (saveProfileBtn) saveProfileBtn.addEventListener('click', saveProfile);
  if (resetProfileBtn) resetProfileBtn.addEventListener('click', resetProfile);

  updateXpDisplay();
  syncProfileDisplay();

  // =======================
  // 2. HERO BUTTONS / QUICK BUDGET
  // =======================

  const startPlayingBtn = document.getElementById('startPlayingBtn');
  const leaderboardBtn = document.getElementById('leaderboardBtn');
  const fullLeaderboardBtn = document.getElementById('fullLeaderboardBtn');
  const xpMessage = document.getElementById('xpMessage');

  if (startPlayingBtn && xpMessage) {
    startPlayingBtn.addEventListener('click', () => {
      xpMessage.textContent = '🔥 Nice! Your first mission is loaded · Start with the Budget Simulator below.';
      xpMessage.style.background = 'linear-gradient(135deg, #22C55E, #10B981)';
      xpMessage.style.color = '#ffffff';
      startPlayingBtn.textContent = '✅ You’re In · Start Budgeting';
      addXp(25);
    });
  }

  if (leaderboardBtn) {
    leaderboardBtn.addEventListener('click', () => {
      const leaderboardSection = document.querySelector('.leaderboard-preview');
      if (leaderboardSection) {
        leaderboardSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  if (fullLeaderboardBtn) {
    fullLeaderboardBtn.addEventListener('click', () => {
      alert('Full leaderboard coming soon in the app version. For now, see this week’s top 3 above!');
    });
  }

  const spendingAmountEl = document.getElementById('spendingAmount');
  const savingsAmountEl = document.getElementById('savingsAmount');
  const entertainmentAmountEl = document.getElementById('entertainmentAmount');
  const budgetTotalEl = document.getElementById('budgetTotal');

  function parseAED(text) {
    if (!text) return 0;
    return parseInt(text.replace(/[^\d]/g, ''), 10) || 0;
  }

  function formatAED(num) {
    return 'AED ' + num;
  }

  function updateBudgetTotal() {
    if (!spendingAmountEl || !savingsAmountEl || !entertainmentAmountEl || !budgetTotalEl) return;
    const spending = parseAED(spendingAmountEl.textContent);
    const savings = parseAED(savingsAmountEl.textContent);
    const entertainment = parseAED(entertainmentAmountEl.textContent);
    const total = spending + savings + entertainment;
    budgetTotalEl.textContent = formatAED(total);
  }

  updateBudgetTotal();

  // =======================
  // 3. BUDGET SIMULATOR
  // =======================

  const spendingSlider = document.getElementById('spendingSlider');
  const savingsSlider = document.getElementById('savingsSlider');
  const simSpendingAmount = document.getElementById('simSpendingAmount');
  const simSavingsAmount = document.getElementById('simSavingsAmount');
  const budgetScoreMsg = document.getElementById('budgetScoreMsg');

  function updateSimAmounts() {
    if (!spendingSlider || !savingsSlider || !simSpendingAmount || !simSavingsAmount || !budgetScoreMsg) return;

    const spending = Number(spendingSlider.value);
    const savings = Number(savingsSlider.value);

    simSpendingAmount.innerHTML = 'AED ' + spending + ' <small>/ week</small>';
    simSavingsAmount.innerHTML = 'AED ' + savings + ' <small>/ week</small>';

    const maxSavings = 500;
    const maxSpending = 500;

    const savingsScore = (savings / maxSavings) * 70;
    const spendingScore = (1 - spending / maxSpending) * 30;

    let score = Math.round(savingsScore + spendingScore);
    if (score < 0) score = 0;
    if (score > 100) score = 100;

    let xpAward = 0;
    let message = '';

    if (score >= 85) {
      xpAward = 75;
      message = '⚡ Pro-level budget!';
    } else if (score >= 60) {
      xpAward = 50;
      message = '👍 Solid budget, you’re on track.';
    } else {
      xpAward = 25;
      message = '👀 Try saving a bit more and lowering spending.';
    }

    budgetScoreMsg.textContent = '⚡ Your budget score: ' + score +
      '/100 · +' + xpAward + ' XP if you lock in for a week · ' + message;
  }

  if (spendingSlider) spendingSlider.addEventListener('input', updateSimAmounts);
  if (savingsSlider) savingsSlider.addEventListener('input', updateSimAmounts);
  updateSimAmounts();

  // =======================
  // 4. STREAK
  // =======================

  const streakRewardMsg = document.getElementById('streakRewardMsg');
  const claimStreakBtn = document.getElementById('claimStreakBtn');
  const streakDaysContainer = document.getElementById('streakDaysContainer');

  let streakClaimed = false;

  if (claimStreakBtn && streakRewardMsg && streakDaysContainer) {
    claimStreakBtn.addEventListener('click', () => {
      if (streakClaimed) return;
      streakClaimed = true;

      streakRewardMsg.textContent = '✅ 500 XP added to your account!';
      claimStreakBtn.textContent = 'Claimed';
      claimStreakBtn.disabled = true;
      claimStreakBtn.style.opacity = '0.6';
      claimStreakBtn.style.cursor = 'default';

      streakDaysContainer.classList.add('streak-claimed');
      setTimeout(() => {
        streakDaysContainer.classList.remove('streak-claimed');
      }, 800);

      addXp(500);
    });
  }

  // =======================
  // 5. GOALS + ADD TO SAVINGS + MODAL
  // =======================

  const goalsGrid = document.getElementById('goalsGrid');
  const createGoalBtn = document.getElementById('createGoalBtn');
  const goalSelect = document.getElementById('goalSelect');
  const goalAddAmount = document.getElementById('goalAddAmount');
  const goalAddBtn = document.getElementById('goalAddBtn');

  const goalsData = {
    iphone: { target: 3500, savedEl: 'iphoneSaved', percentEl: 'iphonePercent', fillEl: 'iphoneFill' },
    mall: { target: 500, savedEl: 'mallSaved', percentEl: 'mallPercent', fillEl: 'mallFill' },
    game: { target: 250, savedEl: 'gameSaved', percentEl: 'gamePercent', fillEl: 'gameFill' }
  };

  function updateGoalDisplay(key, savedAmount) {
    const data = goalsData[key];
    if (!data) return;

    const savedSpan = document.getElementById(data.savedEl);
    const percentSpan = document.getElementById(data.percentEl);
    const fillDiv = document.getElementById(data.fillEl);

    if (!savedSpan || !percentSpan || !fillDiv) return;

    savedSpan.textContent = 'AED ' + savedAmount + ' saved';
    const percent = Math.min(100, Math.round((savedAmount / data.target) * 100));
    percentSpan.textContent = percent + '%';
    fillDiv.style.width = percent + '%';
  }

  function readCurrentSaved(key) {
    const data = goalsData[key];
    if (!data) return 0;
    const el = document.getElementById(data.savedEl);
    if (!el) return 0;
    return parseAED(el.textContent);
  }

  if (goalsGrid) {
    Object.keys(goalsData).forEach(key => {
      updateGoalDisplay(key, readCurrentSaved(key));
    });

    goalsGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.goal-card');
      if (!card) return;

      const goalKey = card.getAttribute('data-goal');

      goalsGrid.querySelectorAll('.goal-card').forEach(c => {
        c.classList.remove('active-goal');
      });
      card.classList.add('active-goal');

      let msg;
      switch (goalKey) {
        case 'iphone':
          msg = '📱 iPhone goal selected · Try increasing your weekly savings in the simulator to reach 3,500 AED faster.';
          break;
        case 'mall':
          msg = '🛍️ Dubai Mall goal selected · Test a lower spending slider to see if you can still have fun under budget.';
          break;
        case 'game':
          msg = '🎮 New Game goal selected · You’re close already, a small weekly saving bump will finish this.';
          break;
        default:
          msg = '🎯 Goal selected · Adjust the budget simulator to see how quickly you can reach it.';
      }
      alert(msg);
    });
  }

  if (goalSelect && goalAddAmount && goalAddBtn) {
    goalAddBtn.addEventListener('click', () => {
      const key = goalSelect.value;
      const addVal = parseInt(goalAddAmount.value || '0', 10);
      if (!addVal || addVal <= 0) {
        alert('Enter a positive amount in AED to add.');
        return;
      }
      const current = readCurrentSaved(key);
      const newSaved = current + addVal;
      updateGoalDisplay(key, newSaved);
      goalAddAmount.value = '';
      addXp(Math.round(addVal / 10));
      alert('Added AED ' + addVal + ' to your savings for "' +
        goalSelect.options[goalSelect.selectedIndex].text + '".');
    });
  }

  // Modal elements
  const goalModalBackdrop = document.getElementById('goalModalBackdrop');
  const modalGoalName = document.getElementById('modalGoalName');
  const modalGoalTarget = document.getElementById('modalGoalTarget');
  const modalGoalIcon = document.getElementById('modalGoalIcon');
  const cancelGoalBtn = document.getElementById('cancelGoalBtn');
  const saveGoalBtn = document.getElementById('saveGoalBtn');

  function openGoalModal() {
    if (!goalModalBackdrop) return;
    modalGoalName.value = '';
    modalGoalTarget.value = '';
    modalGoalIcon.value = '';
    goalModalBackdrop.classList.add('show');
  }

  function closeGoalModal() {
    if (!goalModalBackdrop) return;
    goalModalBackdrop.classList.remove('show');
  }

  if (createGoalBtn) createGoalBtn.addEventListener('click', openGoalModal);
  if (cancelGoalBtn) cancelGoalBtn.addEventListener('click', closeGoalModal);

  if (saveGoalBtn && goalsGrid) {
    saveGoalBtn.addEventListener('click', () => {
      const name = modalGoalName.value.trim();
      const target = parseInt(modalGoalTarget.value || '0', 10);
      const icon = modalGoalIcon.value.trim() || '🎯';

      if (!name) {
        alert('Please enter a goal name.');
        return;
      }
      if (!target || target <= 0) {
        alert('Goal target should be a positive number in AED.');
        return;
      }

      const id = 'goal-' + Date.now();

      const card = document.createElement('div');
      card.className = 'goal-card';
      card.setAttribute('data-goal', id);
      card.innerHTML = `
        <div class="goal-icon">${icon}</div>
        <h4>${name}</h4>
        <div class="goal-target">AED ${target}</div>
        <div class="goal-progress">
          <div class="progress-stats">
            <span id="${id}-saved">AED 0 saved</span>
            <span id="${id}-percent">0%</span>
          </div>
          <div class="goal-bar">
            <div class="goal-fill" id="${id}-fill" style="width: 0%"></div>
          </div>
        </div>
        <div class="goal-badge">New goal · Start saving!</div>
      `;
      goalsGrid.appendChild(card);

      goalsData[id] = {
        target: target,
        savedEl: id + '-saved',
        percentEl: id + '-percent',
        fillEl: id + '-fill'
      };

      if (goalSelect) {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = name;
        goalSelect.appendChild(option);
        goalSelect.value = id;
      }

      addXp(50);
      closeGoalModal();
      alert('Goal created: ' + name + ' · Target: AED ' + target +
        '. Use "Add to Savings" and choose this goal from the dropdown.');
    });
  }

  // =======================
  // UAE CHALLENGES – ID-BASED HANDLERS
  // =======================

  function playChallenge(challengeKey, xpAmount) {
    const xpNum = Number(xpAmount) || 0;

    if (challengeKey === 'dubai-mall') {
      const budgetStr = prompt('Dubai Mall Trip: Your budget is AED 300.\nHow much do you plan to spend? (AED)');
      if (!budgetStr) return;
      const amount = parseInt(budgetStr, 10);
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount.');
        return;
      }
      if (amount <= 300) {
        alert('Nice! You stayed within budget. + ' + xpNum + ' XP');
        addXp(xpNum);
      } else {
        alert('You went over budget. Try again!');
        return;
      }

    } else if (challengeKey === 'eidiya') {
      const totalStr = prompt('Eidiya Saver: How much Eidiya did you get in total? (AED)');
      if (!totalStr) return;
      const total = parseInt(totalStr, 10);
      if (isNaN(total) || total <= 0) {
        alert('Please enter a valid amount.');
        return;
      }
      const saveStr = prompt('How much will you save from your Eidiya? (AED)');
      if (!saveStr) return;
      const saved = parseInt(saveStr, 10);
      if (isNaN(saved) || saved <= 0) {
        alert('Please enter a valid amount.');
        return;
      }
      if (saved >= total * 0.5) {
        alert('Legend! You saved at least 50%. + ' + xpNum + ' XP');
        addXp(xpNum);
      } else {
        alert('That is less than 50%. Try saving more next time!');
        return;
      }

    } else if (challengeKey === 'friends-dinner') {
      const billStr = prompt('Friends Dinner: What is the total bill? (AED)');
      if (!billStr) return;
      const bill = parseInt(billStr, 10);
      if (isNaN(bill) || bill <= 0) {
        alert('Please enter a valid amount.');
        return;
      }
      const peopleStr = prompt('How many friends are splitting?');
      if (!peopleStr) return;
      const people = parseInt(peopleStr, 10);
      if (isNaN(people) || people <= 0) {
        alert('Please enter a valid number of people.');
        return;
      }
      const perPerson = Math.round(bill / people);
      alert('Each person pays about AED ' + perPerson +
        '.\nIf that fits your budget, you win this challenge! + ' + xpNum + ' XP');
      addXp(xpNum);

    } else if (challengeKey === 'game-release') {
      const weeksStr = prompt('Game Release: Game drops in 4 weeks.\nHow much will you save per week? (AED)');
      if (!weeksStr) return;
      const perWeek = parseInt(weeksStr, 10);
      if (isNaN(perWeek) || perWeek <= 0) {
        alert('Please enter a valid amount.');
        return;
      }
      const totalSaved = perWeek * 4;
      alert('In 4 weeks, you will have AED ' + totalSaved +
        ' saved.\nIf that covers the game, you crush this challenge! + ' + xpNum + ' XP');
      addXp(xpNum);

    } else if (challengeKey === 'abu-dhabi') {
      const budgetStr = prompt('Abu Dhabi Weekend: Total budget for the trip? (AED)');
      if (!budgetStr) return;
      const budget = parseInt(budgetStr, 10);
      if (isNaN(budget) || budget <= 0) {
        alert('Please enter a valid amount.');
        return;
      }
      const transport = Math.round(budget * 0.35);
      const food = Math.round(budget * 0.3);
      const fun = budget - transport - food;
      alert('Suggested plan:\nTransport: AED ' + transport +
        '\nFood: AED ' + food +
        '\nActivities: AED ' + fun +
        '\n+ ' + xpNum + ' XP for planning ahead!');
      addXp(xpNum);

    } else if (challengeKey === 'phone-upgrade') {
      const monthsStr = prompt('Phone Upgrade: You want to save AED 1200 in 6 months.\nHow much will you save per month?');
      if (!monthsStr) return;
      const perMonth = parseInt(monthsStr, 10);
      if (isNaN(perMonth) || perMonth <= 0) {
        alert('Please enter a valid amount.');
        return;
      }
      const total = perMonth * 6;
      if (total >= 1200) {
        alert('Perfect! You will hit your target or more. + ' + xpNum + ' XP');
        addXp(xpNum);
      } else {
        alert('You will only reach AED ' + total + '. Try increasing your monthly savings.');
        return;
      }
    }
  }

  function wireChallenge(id, key, xpVal) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', () => {
      playChallenge(key, xpVal);
      el.classList.add('completed');
    });
  }

  wireChallenge('challenge-dubai-mall', 'dubai-mall', 150);
  wireChallenge('challenge-eidiya', 'eidiya', 200);
  wireChallenge('challenge-friends-dinner', 'friends-dinner', 100);
  wireChallenge('challenge-game-release', 'game-release', 175);
  wireChallenge('challenge-abu-dhabi', 'abu-dhabi', 225);
  wireChallenge('challenge-phone-upgrade', 'phone-upgrade', 500);
});
