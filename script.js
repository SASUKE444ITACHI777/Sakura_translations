/* ============================================================
   SAKURA TRANSLATIONS — script.js
   VERSÃO CORRIGIDA — Sem interferência no layout mobile

   CORREÇÕES JS:
   FIX-JS #1 — initPetals: pétalas geradas com left em %, máximo 95%
               para não gerar scroll horizontal mesmo sem overflow:hidden
   FIX-JS #2 — initPetals: quantidade reduzida em mobile (menos reflow)
   FIX-JS #3 — Removido qualquer cálculo de innerWidth/innerHeight que
               poderia disparar layout thrashing no load
   FIX-JS #4 — Modal: usa overflow: hidden no body com padding compensation
               para não haver layout shift ao abrir/fechar
   FIX-JS #5 — Scroll reveal: threshold menor em mobile (0.08) para
               elementos visíveis não ficarem ocultos permanentemente
   ============================================================ */

'use strict';

/* ══════════════════════════════════════════════════════════════
   1. DADOS INICIAIS
   ══════════════════════════════════════════════════════════════ */

const DEFAULT_GAMES = [
  {
    id: 'g1',
    title: 'Katawa Shoujo',
    genre: 'romance',
    translator: 'hanako_pt',
    description: 'Uma visual novel que acompanha o jovem Hisao Nakai enquanto aprende a viver em uma escola especial, descobrindo laços profundos com pessoas incríveis.',
    cover: '',
    coverEmoji: '🌸',
    downloadLink: '#',
    likes: 142,
    status: 'aprovado'
  },
  {
    id: 'g2',
    title: 'Embriáo',
    genre: 'misterio',
    translator: 'miko_trans',
    description: 'Uma jornada surreal dentro de uma mente perturbada. Explore sonhos e pesadelos enquanto tenta desvendar os segredos de uma criatura misteriosa.',
    cover: '',
    coverEmoji: '🌙',
    downloadLink: '#',
    likes: 87,
    status: 'aprovado'
  },
  {
    id: 'g3',
    title: 'Doki Doki Literature Club',
    genre: 'misterio',
    translator: 'sakura_dev',
    description: 'Entre no clube de literatura e conheça garotas adoráveis. Mas este jogo não é o que aparenta ser... Prepare-se para o inesperado.',
    cover: '',
    coverEmoji: '📖',
    downloadLink: '#',
    likes: 311,
    status: 'aprovado'
  },
  {
    id: 'g4',
    title: 'Yume Nikki',
    genre: 'aventura',
    translator: 'luna_vn',
    description: 'Explore os sonhos fragmentados de Madotsuki em um mundo onírico repleto de criaturas estranhas, paisagens bizarras e segredos obscuros.',
    cover: '',
    coverEmoji: '🎆',
    downloadLink: '#',
    likes: 63,
    status: 'aprovado'
  },
  {
    id: 'g5',
    title: 'Butterfly Soup',
    genre: 'romance',
    translator: 'hanako_pt',
    description: 'Uma comédia romântica sobre garotas asiático-americanas, beisebol e amizades que se transformam em algo mais bonito. Fofo, engraçado e emocionante.',
    cover: '',
    coverEmoji: '🦋',
    downloadLink: '#',
    likes: 99,
    status: 'aprovado'
  },
  {
    id: 'g6',
    title: 'Highway Blossoms',
    genre: 'aventura',
    translator: 'miko_trans',
    description: 'Uma viagem pelo sudoeste dos EUA seguindo pistas deixadas pelo avô de uma garota. Uma história de encontros, mapas e tesouros inesperados.',
    cover: '',
    coverEmoji: '🌻',
    downloadLink: '#',
    likes: 45,
    status: 'aprovado'
  },
  {
    id: 'g7',
    title: 'Saya no Uta',
    genre: 'fantasia',
    translator: 'sakura_dev',
    description: 'Após um acidente terrível, Fuminori passa a enxergar o mundo de forma horrível — exceto pela adorável Saya. Um conto sombrio de amor e percepção.',
    cover: '',
    coverEmoji: '🩸',
    downloadLink: '#',
    likes: 178,
    status: 'aprovado'
  },
  {
    id: 'g8',
    title: 'Arcade Spirits',
    genre: 'comedia',
    translator: 'luna_vn',
    description: 'Trabalhe em um arcade retrô e faça amizades (e talvez algo mais) em um futuro alternativo onde os games nunca saíram de moda.',
    cover: '',
    coverEmoji: '🕹️',
    downloadLink: '#',
    likes: 57,
    status: 'aprovado'
  }
];

const DEFAULT_PENDING = [
  {
    id: 'p1',
    title: 'A Little Lily Princess',
    genre: 'romance',
    translator: 'violeta_br',
    description: 'Uma adaptação do clássico "A Pequena Princesa" em formato de visual novel, com mecânicas de amizade e relacionamentos.',
    downloadLink: 'https://exemplo.com/download',
    coverUrl: '',
    status: 'pendente'
  }
];

/* ══════════════════════════════════════════════════════════════
   2. ESTADO DA APLICAÇÃO
   ══════════════════════════════════════════════════════════════ */

const State = {
  games: [],
  pending: [],
  likes: {},
  activeGenre: 'todos',
  searchQuery: '',
  isModLoggedIn: false,

  load() {
    try {
      this.games   = JSON.parse(localStorage.getItem('st_games'))   || [...DEFAULT_GAMES];
      this.pending = JSON.parse(localStorage.getItem('st_pending')) || [...DEFAULT_PENDING];
      this.likes   = JSON.parse(localStorage.getItem('st_likes'))   || {};
    } catch {
      this.games   = [...DEFAULT_GAMES];
      this.pending = [...DEFAULT_PENDING];
      this.likes   = {};
    }
  },

  save() {
    localStorage.setItem('st_games',   JSON.stringify(this.games));
    localStorage.setItem('st_pending', JSON.stringify(this.pending));
    localStorage.setItem('st_likes',   JSON.stringify(this.likes));
  },

  approvedGames() {
    return this.games.filter(g => g.status === 'aprovado');
  },

  translatorRanking() {
    const map = {};
    this.approvedGames().forEach(g => {
      if (!map[g.translator]) map[g.translator] = { name: g.translator, count: 0, points: 0 };
      map[g.translator].count++;
      map[g.translator].points += g.likes || 0;
    });
    return Object.values(map).sort((a, b) => b.points - a.points);
  }
};

/* ══════════════════════════════════════════════════════════════
   3. UTILITÁRIOS
   ══════════════════════════════════════════════════════════════ */

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '');
}

function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.add('hidden'), duration);
}

function uid() {
  return 'g' + Date.now() + Math.random().toString(36).slice(2, 6);
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1400;
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target).toLocaleString('pt-BR');
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ══════════════════════════════════════════════════════════════
   4. PÉTALAS CAINDO

   FIX-JS #1 e #2:
   - left limitado a 0–90% (não 0–110%) para pétalas não saírem
     da borda direita causando scroll horizontal
   - translateX na animação é pequeno (já fixado no CSS)
   - quantidade menor em mobile (window.innerWidth usado apenas
     para contar pétalas, não para cálculo de layout)
   ══════════════════════════════════════════════════════════════ */

function initPetals() {
  const container = document.getElementById('petals-container');

  /*
    FIX-JS #2 — em mobile usamos menos pétalas para economizar
    CPU (animações CSS em muitas pétalas podem causar jank no scroll).
    Verificamos com matchMedia em vez de innerWidth para não forçar
    um layout reflow logo no carregamento.
  */
  const isMobile = window.matchMedia('(max-width: 600px)').matches;
  const count = isMobile ? 10 : 20;

  for (let i = 0; i < count; i++) {
    const petal = document.createElement('div');
    petal.classList.add('petal');

    const size   = 10 + Math.random() * 14;
    /*
      FIX-JS #1 — left máximo 90% (não 100% ou 110%).
      Com pétalas de até 24px de largura e left até 90%, nenhuma
      pétala ultrapassa os 100% do container.
    */
    const left   = Math.random() * 90;
    const delay  = Math.random() * 14;
    const dur    = 9 + Math.random() * 8;
    const rotate = Math.random() * 360;
    const pink   = Math.round(185 + Math.random() * 55);

    petal.style.cssText = `
      left: ${left}%;
      width: ${size}px;
      height: ${size * 0.85}px;
      animation-duration: ${dur}s;
      animation-delay: -${delay}s;
      transform: rotate(${rotate}deg);
      background: radial-gradient(ellipse at 40% 30%,
        hsl(340, 100%, ${pink / 2.55}%) 55%,
        hsl(340, 80%, 70%) 100%);
    `;
    container.appendChild(petal);
  }
}

/* ══════════════════════════════════════════════════════════════
   5. NAVBAR
   ══════════════════════════════════════════════════════════════ */

function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const toggle   = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  toggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* FIX — fecha menu ao clicar fora */
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   6. ESTATÍSTICAS ANIMADAS
   ══════════════════════════════════════════════════════════════ */

function initStats() {
  const counters = document.querySelectorAll('.stat-number');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  counters.forEach(c => observer.observe(c));
}

/* ══════════════════════════════════════════════════════════════
   7. CARDS DE JOGOS
   ══════════════════════════════════════════════════════════════ */

function buildGameCard(game) {
  const card = document.createElement('div');
  card.classList.add('game-card');
  card.dataset.id = game.id;

  const coverHTML = game.cover
    ? `<img src="${game.cover}" alt="Capa de ${game.title}" class="game-cover" loading="lazy" />`
    : `<div class="game-cover-placeholder">${game.coverEmoji || '🎮'}</div>`;

  card.innerHTML = `
    <div class="game-cover-wrap">
      ${coverHTML}
      <span class="game-genre-badge">${capitalize(game.genre)}</span>
    </div>
    <div class="game-info">
      <h3 class="game-title">${game.title}</h3>
      <p class="game-translator">por ${game.translator}</p>
      <p class="game-desc">${game.description}</p>
    </div>
    <div class="game-footer">
      <span class="game-likes">👍 ${(game.likes || 0).toLocaleString('pt-BR')}</span>
      <span class="game-cta">Ver detalhes →</span>
    </div>
  `;

  card.addEventListener('click', () => openModal(game.id));
  return card;
}

function renderGames() {
  const grid     = document.getElementById('gamesGrid');
  const noResult = document.getElementById('noResults');
  const query    = normalize(State.searchQuery);
  const genre    = State.activeGenre;

  grid.innerHTML = '';

  const filtered = State.approvedGames().filter(g => {
    const matchGenre  = genre === 'todos' || g.genre === genre;
    const searchText  = normalize(`${g.title} ${g.description} ${g.translator} ${g.genre}`);
    const matchSearch = !query || searchText.includes(query);
    return matchGenre && matchSearch;
  });

  if (filtered.length === 0) {
    noResult.classList.remove('hidden');
    return;
  }

  noResult.classList.add('hidden');
  filtered.forEach((g, i) => {
    const card = buildGameCard(g);
    card.style.animationDelay = `${i * 0.04}s`;
    grid.appendChild(card);
  });
}

/* ══════════════════════════════════════════════════════════════
   8. BUSCA INTELIGENTE
   ══════════════════════════════════════════════════════════════ */

function initSearch() {
  const input = document.getElementById('searchInput');
  const clear = document.getElementById('searchClear');
  let debounce;

  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      State.searchQuery = input.value.trim();
      clear.classList.toggle('visible', State.searchQuery.length > 0);
      renderGames();
    }, 280);
  });

  clear.addEventListener('click', () => {
    input.value = '';
    State.searchQuery = '';
    clear.classList.remove('visible');
    input.focus();
    renderGames();
  });
}

/* ══════════════════════════════════════════════════════════════
   9. FILTROS POR GÊNERO
   ══════════════════════════════════════════════════════════════ */

function initFilters() {
  document.getElementById('filterPills').addEventListener('click', e => {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    State.activeGenre = pill.dataset.genre;
    renderGames();
  });
}

/* ══════════════════════════════════════════════════════════════
   10. MODAL DE DETALHES

   FIX-JS #4 — Ao abrir o modal bloqueamos o scroll do body com
   overflow:hidden. Sem compensar o scrollbar, a página "pula"
   porque o scrollbar (≈17px) some. Corrigido com padding-right.
   ══════════════════════════════════════════════════════════════ */

let currentModalId = null;

/* Calcula largura do scrollbar para compensar ao bloquear body */
function getScrollbarWidth() {
  return window.innerWidth - document.documentElement.clientWidth;
}

function openModal(id) {
  const game = State.games.find(g => g.id === id);
  if (!game) return;
  currentModalId = id;

  const modal     = document.getElementById('gameModal');
  const cover     = document.getElementById('modalCover');
  const coverWrap = cover.parentElement;

  /* Limpa placeholder anterior se existir */
  const oldPh = coverWrap.querySelector('.modal-placeholder');
  if (oldPh) oldPh.remove();

  if (game.cover) {
    cover.src = game.cover;
    cover.alt = `Capa de ${game.title}`;
    cover.style.display = 'block';
  } else {
    cover.style.display = 'none';
    const ph = document.createElement('div');
    ph.className = 'game-cover-placeholder modal-placeholder';
    ph.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
    ph.textContent = game.coverEmoji || '🎮';
    coverWrap.appendChild(ph);
  }

  document.getElementById('modalGenre').textContent      = capitalize(game.genre);
  document.getElementById('modalTitle').textContent      = game.title;
  document.getElementById('modalTranslator').textContent = game.translator;
  document.getElementById('modalDesc').textContent       = game.description;
  document.getElementById('modalLikeCount').textContent  = (game.likes || 0).toLocaleString('pt-BR');
  document.getElementById('modalDownload').href          = game.downloadLink || '#';

  const likeBtn = document.getElementById('modalLike');
  likeBtn.classList.toggle('liked', !!State.likes[id]);

  document.getElementById('modalStatus').textContent =
    `Status: ${game.status === 'aprovado' ? '✅ Aprovado' : '⏳ Pendente'}`;

  /* FIX-JS #4 — Compensa o scroll bar ao travar o body */
  const sbWidth = getScrollbarWidth();
  document.body.style.paddingRight = sbWidth + 'px';
  document.body.style.overflow = 'hidden';

  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('gameModal').classList.add('hidden');
  /* FIX-JS #4 — Restaura scroll */
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  currentModalId = null;
}

function initModal() {
  document.getElementById('modalClose').addEventListener('click', closeModal);

  document.getElementById('gameModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  document.getElementById('modalLike').addEventListener('click', () => {
    if (!currentModalId) return;
    const game = State.games.find(g => g.id === currentModalId);
    if (!game) return;

    const alreadyLiked = State.likes[currentModalId];
    if (alreadyLiked) {
      game.likes = Math.max(0, (game.likes || 0) - 1);
      delete State.likes[currentModalId];
      showToast('Avaliação removida.');
    } else {
      game.likes = (game.likes || 0) + 1;
      State.likes[currentModalId] = true;
      showToast('👍 Obrigado pela avaliação!');
    }

    State.save();
    document.getElementById('modalLikeCount').textContent = game.likes.toLocaleString('pt-BR');
    document.getElementById('modalLike').classList.toggle('liked', !alreadyLiked);
    renderGames();
    renderRanking();
  });
}

/* ══════════════════════════════════════════════════════════════
   11. RANKING DE TRADUTORES
   ══════════════════════════════════════════════════════════════ */

const MEDALS = ['gold', 'silver', 'bronze'];
const EMOJIS = ['🥇', '🥈', '🥉'];

function renderRanking() {
  const list    = document.getElementById('rankingList');
  const ranking = State.translatorRanking();

  if (ranking.length === 0) {
    list.innerHTML = '<p style="text-align:center;opacity:0.5;padding:32px 0">Nenhuma tradução aprovada ainda.</p>';
    return;
  }

  list.innerHTML = ranking.map((t, i) => {
    const medal = i < 3 ? MEDALS[i] : '';
    const emoji = i < 3 ? EMOJIS[i] : `#${i + 1}`;
    const delay = i * 0.06;

    return `
      <div class="rank-item" style="animation-delay:${delay}s">
        <div class="rank-position ${medal}">${emoji}</div>
        <div class="rank-avatar">🌸</div>
        <div class="rank-info">
          <div class="rank-name">${t.name}</div>
          <div class="rank-meta">${t.count} tradução${t.count !== 1 ? 'ões' : ''} publicada${t.count !== 1 ? 's' : ''}</div>
        </div>
        <div class="rank-score">
          <div class="rank-points">${t.points.toLocaleString('pt-BR')}</div>
          <div class="rank-points-label">pontos</div>
        </div>
      </div>
    `;
  }).join('');
}

/* ══════════════════════════════════════════════════════════════
   12. FORMULÁRIO DE ENVIO
   ══════════════════════════════════════════════════════════════ */

function validateForm() {
  const fields = [
    { id: 'gameTitle',      errId: 'err-gameTitle',      msg: 'Informe o nome do jogo.' },
    { id: 'genre',          errId: 'err-genre',          msg: 'Selecione um gênero.' },
    { id: 'translatorName', errId: 'err-translatorName', msg: 'Informe seu nome ou apelido.' },
    { id: 'downloadLink',   errId: 'err-downloadLink',   msg: 'Informe um link válido de download.' },
    { id: 'description',    errId: 'err-description',    msg: 'Adicione uma descrição do jogo.' }
  ];

  let valid = true;

  fields.forEach(f => {
    const el  = document.getElementById(f.id);
    const err = document.getElementById(f.errId);

    if (f.id === 'downloadLink' && el.value.trim()) {
      try { new URL(el.value.trim()); }
      catch {
        el.classList.add('error');
        err.textContent = 'Insira uma URL válida (ex: https://...).';
        valid = false;
        return;
      }
    }

    if (!el.value.trim()) {
      el.classList.add('error');
      err.textContent = f.msg;
      valid = false;
    } else {
      el.classList.remove('error');
      err.textContent = '';
    }
  });

  return valid;
}

function clearFormErrors() {
  ['gameTitle','genre','translatorName','downloadLink','description'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('error');
    const errEl = document.getElementById('err-' + id);
    if (errEl) errEl.textContent = '';
  });
}

function initForm() {
  const form       = document.getElementById('submitForm');
  const submitBtn  = document.getElementById('submitBtn');
  const successDiv = document.getElementById('formSuccess');
  const sendAnother= document.getElementById('sendAnother');

  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => {
      el.classList.remove('error');
      const errEl = document.getElementById('err-' + el.id);
      if (errEl) errEl.textContent = '';
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormErrors();

    if (!validateForm()) {
      showToast('⚠️ Corrija os campos destacados.');
      return;
    }

    const title      = document.getElementById('gameTitle').value.trim();
    const genre      = document.getElementById('genre').value;
    const translator = document.getElementById('translatorName').value.trim();
    const link       = document.getElementById('downloadLink').value.trim();
    const desc       = document.getElementById('description').value.trim();
    const coverUrl   = document.getElementById('coverUrl').value.trim();

    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Enviando...';

    const formAction = form.action;
    if (formAction && !formAction.includes('YOUR_FORM_ID')) {
      try {
        const response = await fetch(formAction, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) throw new Error('Formspree error');
      } catch (err) {
        console.warn('Formspree offline ou não configurado. Salvando localmente.', err);
      }
    }

    const newEntry = {
      id:           uid(),
      title,
      genre,
      translator,
      description:  desc,
      downloadLink: link,
      cover:        coverUrl,
      coverEmoji:   '🎮',
      likes:        0,
      status:       'pendente'
    };

    State.pending.push(newEntry);
    State.save();

    form.classList.add('hidden');
    successDiv.classList.remove('hidden');
    submitBtn.disabled = false;
    submitBtn.textContent = '🌸 Enviar Tradução';
    showToast('🌸 Tradução enviada! Aguardando aprovação.');
    renderPendingList();
  });

  sendAnother.addEventListener('click', () => {
    form.reset();
    successDiv.classList.add('hidden');
    form.classList.remove('hidden');
  });
}

/* ══════════════════════════════════════════════════════════════
   13. PAINEL DE MODERAÇÃO
   ══════════════════════════════════════════════════════════════ */

const MOD_PASSWORD = 'sakura2025';

function renderPendingList() {
  const list = document.getElementById('pendingList');
  if (!list) return;

  if (State.pending.length === 0) {
    list.innerHTML = '<p class="no-pending">Nenhuma tradução pendente no momento. ✨</p>';
    return;
  }

  list.innerHTML = State.pending.map(p => `
    <div class="pending-item" data-id="${p.id}">
      <div class="pending-title">${p.title}</div>
      <div class="pending-meta">
        👤 ${p.translator} &nbsp;|&nbsp; 🎭 ${capitalize(p.genre)}
      </div>
      <div class="pending-meta">
        🔗 <a href="${p.downloadLink}" target="_blank" rel="noopener" style="color:var(--sakura-500);word-break:break-all">${p.downloadLink}</a>
      </div>
      <div class="pending-meta">${p.description.slice(0, 120)}${p.description.length > 120 ? '…' : ''}</div>
      <div class="pending-actions">
        <button class="btn-approve" data-action="approve" data-id="${p.id}">✅ Aprovar</button>
        <button class="btn-reject"  data-action="reject"  data-id="${p.id}">❌ Rejeitar</button>
      </div>
    </div>
  `).join('');
}

function initModeration() {
  const openBtn    = document.getElementById('openMod');
  const modPanel   = document.getElementById('modPanel');
  const modAuth    = document.getElementById('modAuth');
  const modContent = document.getElementById('modContent');
  const modLogin   = document.getElementById('modLogin');
  const modPassEl  = document.getElementById('modPassword');
  const pendingList= document.getElementById('pendingList');

  openBtn.addEventListener('click', () => {
    modPanel.classList.toggle('hidden');
    if (!modPanel.classList.contains('hidden')) {
      if (State.isModLoggedIn) {
        modAuth.classList.add('hidden');
        modContent.classList.remove('hidden');
        renderPendingList();
      } else {
        modAuth.classList.remove('hidden');
        modContent.classList.add('hidden');
      }
    }
  });

  modLogin.addEventListener('click', () => {
    if (modPassEl.value === MOD_PASSWORD) {
      State.isModLoggedIn = true;
      modAuth.classList.add('hidden');
      modContent.classList.remove('hidden');
      renderPendingList();
      showToast('🔐 Bem-vindo, moderador!');
    } else {
      modPassEl.style.borderColor = '#e85555';
      showToast('❌ Senha incorreta.');
      setTimeout(() => { modPassEl.style.borderColor = ''; }, 1500);
    }
  });

  modPassEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') modLogin.click();
  });

  pendingList.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const id     = btn.dataset.id;
    const action = btn.dataset.action;
    const idx    = State.pending.findIndex(p => p.id === id);
    if (idx === -1) return;

    if (action === 'approve') {
      const approved = { ...State.pending[idx], status: 'aprovado' };
      State.games.push(approved);
      State.pending.splice(idx, 1);
      showToast(`✅ "${approved.title}" aprovado e publicado!`);
    } else {
      const title = State.pending[idx].title;
      State.pending.splice(idx, 1);
      showToast(`❌ "${title}" rejeitado.`);
    }

    State.save();
    renderPendingList();
    renderGames();
    renderRanking();
  });
}

/* ══════════════════════════════════════════════════════════════
   14. SCROLL REVEAL

   FIX-JS #5 — threshold menor (0.08) em mobile.
   Com threshold: 0.15, elementos perto do final da tela em
   mobile podiam nunca atingir 15% de visibilidade (viewport
   menor), ficando invisíveis permanentemente.
   ══════════════════════════════════════════════════════════════ */

function initScrollReveal() {
  const targets = document.querySelectorAll('.section-header, .about-card, .stats-bar');

  /*
    FIX-JS #5 — threshold adaptativo:
    Em mobile (tela pequena) os elementos ocupam proporcionalmente
    mais espaço, mas o viewport vê menos de cada vez.
    0.08 garante que o reveal dispara assim que 8% do elemento fica visível.
  */
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const threshold = isMobile ? 0.08 : 0.15;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold });

  targets.forEach(t => { t.classList.add('reveal'); obs.observe(t); });
}

/* ══════════════════════════════════════════════════════════════
   15. INICIALIZAÇÃO PRINCIPAL
   ══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  State.load();
  initPetals();
  initNavbar();
  initStats();
  initSearch();
  initFilters();
  initModal();
  initForm();
  initModeration();
  initScrollReveal();
  renderGames();
  renderRanking();
  renderPendingList();

  console.log('%c🌸 Sakura Translations', 'color:#e8618a;font-size:18px;font-weight:bold;font-family:serif');
  console.log('%cModeradores: senha sakura2025', 'color:#888;font-size:12px');
});
