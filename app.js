/**
 * CATAN Mobile Beginner Guide Application Logic
 */

let currentStep = 1;
const totalSteps = 7;

// Calculator State
const calcState = {
  settlements: 2, // starting settlements
  cities: 0,
  longestRoad: false,
  largestArmy: false,
  vpCards: 0
};

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initCalculator();
  initTouchGestures();
});

/* ================= Navigation ================= */
function initNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const step = parseInt(tab.getAttribute('data-step'), 10);
      goToStep(step);
    });
  });
  updateStepUI();
}

function goToStep(step) {
  if (step < 1 || step > totalSteps) return;
  currentStep = step;
  updateStepUI();
  
  // Scroll to top of content
  const contentArea = document.getElementById('contentArea');
  if (contentArea) {
    contentArea.scrollTop = 0;
  }
}

function navigateStep(delta) {
  let next = currentStep + delta;
  if (next < 1) next = 1;
  if (next > totalSteps) next = 1; // loop or stay
  goToStep(next);
}

function updateStepUI() {
  // Update step cards
  for (let i = 1; i <= totalSteps; i++) {
    const card = document.getElementById(`step-${i}`);
    if (card) {
      if (i === currentStep) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    }
  }

  // Update nav tabs
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    const step = parseInt(tab.getAttribute('data-step'), 10);
    if (step === currentStep) {
      tab.classList.add('active');
      // Scroll tab into view smoothly
      tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    } else {
      tab.classList.remove('active');
    }
  });

  // Update progress bar
  const progressBar = document.getElementById('progressBar');
  if (progressBar) {
    const percentage = (currentStep / totalSteps) * 100;
    progressBar.style.width = `${percentage}%`;
  }

  // Update step indicator
  const indicator = document.getElementById('currentStepNum');
  if (indicator) {
    indicator.textContent = currentStep;
  }

  // Update footer buttons
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  if (prevBtn) {
    if (currentStep === 1) {
      prevBtn.classList.add('disabled');
    } else {
      prevBtn.classList.remove('disabled');
    }
  }
  if (nextBtn) {
    if (currentStep === totalSteps) {
      nextBtn.innerHTML = '처음으로 <span class="arrow">🔄</span>';
    } else {
      nextBtn.innerHTML = '다음 <span class="arrow">▶</span>';
    }
  }
}

/* ================= Touch Swipe Gestures ================= */
function initTouchGestures() {
  const contentArea = document.getElementById('contentArea');
  if (!contentArea) return;

  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;

  contentArea.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  contentArea.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    // Horizontal swipe threshold: 60px, must be more horizontal than vertical
    if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
      if (diffX < 0) {
        // Swiped left -> Next
        if (currentStep < totalSteps) {
          navigateStep(1);
        }
      } else {
        // Swiped right -> Prev
        if (currentStep > 1) {
          navigateStep(-1);
        }
      }
    }
  }
}

/* ================= Victory Point Calculator ================= */
function initCalculator() {
  updateCalculatorUI();
}

function changeScore(type, delta) {
  if (type === 'settlements') {
    const newVal = calcState.settlements + delta;
    if (newVal >= 0 && newVal <= 5) {
      calcState.settlements = newVal;
    }
  } else if (type === 'cities') {
    const newVal = calcState.cities + delta;
    if (newVal >= 0 && newVal <= 4) {
      calcState.cities = newVal;
    }
  } else if (type === 'vpCards') {
    const newVal = calcState.vpCards + delta;
    if (newVal >= 0 && newVal <= 5) {
      calcState.vpCards = newVal;
    }
  }
  updateCalculatorUI();
}

function toggleBonus(type, checked) {
  if (type === 'road') {
    calcState.longestRoad = checked;
  } else if (type === 'army') {
    calcState.largestArmy = checked;
  }
  updateCalculatorUI();
}

function updateCalculatorUI() {
  // Update counter numbers
  const setEl = document.getElementById('val-settlements');
  const cityEl = document.getElementById('val-cities');
  const vpEl = document.getElementById('val-vpCards');
  if (setEl) setEl.textContent = calcState.settlements;
  if (cityEl) cityEl.textContent = calcState.cities;
  if (vpEl) vpEl.textContent = calcState.vpCards;

  // Calculate total score
  const total = (calcState.settlements * 1) +
                (calcState.cities * 2) +
                (calcState.longestRoad ? 2 : 0) +
                (calcState.largestArmy ? 2 : 0) +
                (calcState.vpCards * 1);

  const totalEl = document.getElementById('totalScore');
  const circleEl = document.getElementById('calcCircle');
  const statusEl = document.getElementById('calcStatus');

  if (totalEl) totalEl.textContent = total;

  if (total >= 10) {
    if (circleEl) circleEl.classList.add('victory-reach');
    if (statusEl) {
      statusEl.innerHTML = `
        <div class="status-msg" style="color: #d32f2f;">🎉 10점 달성! 승리 선언 가능!</div>
        <div class="status-sub">내 차례에 카드를 공개하고 승리를 선언하세요!</div>
      `;
    }
  } else {
    if (circleEl) circleEl.classList.remove('victory-reach');
    const remaining = 10 - total;
    if (statusEl) {
      statusEl.innerHTML = `
        <div class="status-msg">개척 진행 중입니다!</div>
        <div class="status-sub">승리(10점)까지 <strong>${remaining}점</strong> 남았습니다.</div>
      `;
    }
  }
}

function resetCalculator() {
  calcState.settlements = 2;
  calcState.cities = 0;
  calcState.longestRoad = false;
  calcState.largestArmy = false;
  calcState.vpCards = 0;

  const roadBox = document.getElementById('check-road');
  const armyBox = document.getElementById('check-army');
  if (roadBox) roadBox.checked = false;
  if (armyBox) armyBox.checked = false;

  updateCalculatorUI();
}

/* ================= Lightbox Modal ================= */
function openLightbox(src, title) {
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbTitle = document.getElementById('lbTitle');
  if (lb && lbImg) {
    lbImg.src = src;
    if (lbTitle) lbTitle.textContent = title || '이미지 확대 보기';
    lb.classList.add('open');
  }
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('open');
}
