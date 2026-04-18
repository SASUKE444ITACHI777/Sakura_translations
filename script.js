/* ============================================================
   SAKURA TRANSLATIONS — script.js (CORRIGIDO MOBILE)
   ============================================================ */

/* ================= NAVBAR ================= */
const navbar = document.getElementById('navbar');

function updateNavHeight() {
  if (!navbar) return;

  const navHeight = navbar.getBoundingClientRect().height;
  document.documentElement.style.setProperty('--nav-h', navHeight + 'px');
}

// 🔥 FIX MOBILE
window.addEventListener('load', updateNavHeight);
window.addEventListener('resize', updateNavHeight);

// iOS fix extra
setTimeout(updateNavHeight, 100);


/* ================= MENU MOBILE ================= */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
}


/* ================= BUSCA ================= */
const searchInput = document.getElementById('searchInput');
const searchClear = document.getElementById('searchClear');

if (searchInput) {
  searchInput.addEventListener('input', () => {
    const value = searchInput.value.toLowerCase();
    filterGames(value);
  });
}

if (searchClear) {
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    filterGames('');
  });
}

function filterGames(term) {
  const cards = document.querySelectorAll('.game-card');

  cards.forEach(card => {
    const title = card.dataset.title?.toLowerCase() || '';

    if (title.includes(term)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}


/* ================= MODAL ================= */
const modal = document.getElementById('gameModal');
const modalClose = document.getElementById('modalClose');

if (modalClose) {
  modalClose.addEventListener('click', () => {
    modal.classList.add('hidden');
  });
}

function openModal(data) {
  document.getElementById('modalTitle').textContent = data.title;
  document.getElementById('modalDesc').textContent = data.description;
  document.getElementById('modalTranslator').textContent = data.translator;
  document.getElementById('modalDownload').href = data.link;

  modal.classList.remove('hidden');
}


/* ================= RANKING ================= */
function updateRanking() {
  const list = document.getElementById('rankingList');
  if (!list) return;

  const items = [...list.children];

  items.sort((a, b) => {
    const aScore = parseInt(a.dataset.score || 0);
    const bScore = parseInt(b.dataset.score || 0);
    return bScore - aScore;
  });

  list.innerHTML = '';
  items.forEach(item => list.appendChild(item));
}


/* ================= FORM ================= */
const form = document.getElementById('submitForm');
const success = document.getElementById('formSuccess');

if (form) {
  form.addEventListener('submit', function () {
    form.classList.add('hidden');
    success.classList.remove('hidden');
  });
}


/* ================= TOAST ================= */
const toast = document.getElementById('toast');

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}


/* ================= STATS ANIMATION ================= */
const stats = document.querySelectorAll('.stat-number');

function animateStats() {
  stats.forEach(stat => {
    const target = +stat.dataset.target;
    let count = 0;

    const interval = setInterval(() => {
      count += Math.ceil(target / 50);

      if (count >= target) {
        stat.textContent = target;
        clearInterval(interval);
      } else {
        stat.textContent = count;
      }
    }, 30);
  });
}

window.addEventListener('load', animateStats);
