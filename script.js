/* ============================================================
   SAKURA TRANSLATIONS — script.js
   Lógica completa: jogos, busca, ranking, avaliações,
   envio de formulário, moderação, pétalas, animações.
   ============================================================ */

'use strict';

/* ══════════════════════════════════════════════════════════════
   1. DADOS INICIAIS (substituem banco de dados para demo)
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
    description: 'Trabalhe em um arcade retrô e faça amizades (e talvez algo mais) em um futuro alternativo onde os games nunca saíram de moda. Divertido e carismático!',
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
  likes: {},        // { gameId: true/false }
  activeGenre: 'todos',
  searchQuery: '',
  isModLoggedIn: false,

  /** Carrega dados do localStorage ou usa defaults */
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

  /** Persiste estado no localStorage */
  save() {
    localStorage.setItem('st_games',   JSON.stringify(this.games));
    localStorage.setItem('st_pending', JSON.stringify(this.pending));
    localStorage.setItem('st_likes',   JSON.stringify(this.likes));
  },

  /** Retorna jogos aprovados */
  approvedGames() {
    return this.games.filter(g => g.status === 'aprovado');
  },

  /** Calcula ranking de tradutores */
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

/** Remove acentos e normaliza string para busca tolerante */
function normalize(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // remove diacríticos
    .replace(/[^a-z0-9\s]/g, '');    // remove caracteres especiais
}

/** Mostra toast de notificação */
function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.add('hidden'), duration);
}

/** Gera ID único */
function uid() {
  return 'g' + Date.now() + Math.random().toString(36).slice(2, 6);
}

/** Capitaliza primeira letra */
function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

/** Anima contador numérico */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1500;
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(ease * target).toLocaleString('pt-BR');
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ══════════════════════════════════════════════════════════════
   4. PÉTALAS CAINDO
   ══════════════════════════════════════════════════════════════ */

function initPetals() {
  const container = document.getElementById('petals-container');
  const count = window.innerWidth < 600 ? 12 : 22;

  for (let i = 0; i < count; i++) {
    const petal = document.createElement('div');
    petal.classList.add('petal');

    // Variação visual: tamanho, rotação inicial, tom
    const size   = 12 + Math.random() * 18;
    const left   = Math.random() * 110 - 5;
    const delay  = Math.random() * 15;
    const dur    = 8 + Math.random() * 10;
    const rotate = Math.random() * 360;
    const pink   = Math.round(180 + Math.random() * 60);

    petal.style.cssText = `
      left: ${left}%;
      width: ${size}px;
      height: ${size * 0.85}px;
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
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
  const navbar    = document.getElementById('navbar');
  const toggle    = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  // Sombra ao rolar
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Menu mobile
  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Fecha menu ao clicar em link
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
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
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}

/* ══════════════════════════════════════════════════════════════
   7. CARDS DE JOGOS
   ══════════════════════════════════════════════════════════════ */

function buildGameCard(game) {
  const card = document.createElement('div');
  card.classList.add('game-card');
  card.dataset.id = game.id;

  const hasLiked  = State.likes[game.id];
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
    card.style.animationDelay = `${i * 0.05}s`;
    card.classList.add('fade-in');
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
    }, 250);
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
   ══════════════════════════════════════════════════════════════ */

let currentModalId = null;

function openModal(id) {
  const game = State.games.find(g => g.id === id);
  if (!game) return;
  currentModalId = id;

  const modal       = document.getElementById('gameModal');
  const cover       = document.getElementById('modalCover');
  const coverWrap   = cover.parentElement;

  // Capa ou placeholder
  if (game.cover) {
    cover.src = game.cover;
    cover.alt = `Capa de ${game.title}`;
    cover.style.display = 'block';
    // Remove placeholder se existir
    const ph = coverWrap.querySelector('.game-cover-placeholder');
    if (ph) ph.remove();
  } else {
    cover.style.display = 'none';
    let ph = coverWrap.querySelector('.modal-placeholder');
    if (!ph) {
      ph = document.createElement('div');
      ph.className = 'game-cover-placeholder modal-placeholder';
      ph.style.width = '100%';
      ph.style.height = '100%';
      ph.style.position = 'absolute';
      ph.style.inset = '0';
      coverWrap.appendChild(ph);
    }
    ph.textContent = game.coverEmoji || '🎮';
  }

  document.getElementById('modalGenre').textContent        = capitalize(game.genre);
  document.getElementById('modalTitle').textContent        = game.title;
  document.getElementById('modalTranslator').textContent   = game.translator;
  document.getElementById('modalDesc').textContent         = game.description;
  document.getElementById('modalLikeCount').textContent    = (game.likes || 0).toLocaleString('pt-BR');
  document.getElementById('modalDownload').href            = game.downloadLink || '#';

  // Estado do botão like
  const likeBtn = document.getElementById('modalLike');
  likeBtn.classList.toggle('liked', !!State.likes[id]);

  document.getElementById('modalStatus').textContent =
    `Status: ${game.status === 'aprovado' ? '✅ Aprovado' : '⏳ Pendente'}`;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('gameModal').classList.add('hidden');
  document.body.style.overflow = '';
  currentModalId = null;
}

function initModal() {
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('gameModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Fechar com ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // Avaliação (like) no modal
  document.getElementById('modalLike').addEventListener('click', () => {
    if (!currentModalId) return;
    const game = State.games.find(g => g.id === currentModalId);
    if (!game) return;

    const alreadyLiked = State.likes[currentModalId];
    if (alreadyLiked) {
      // Toggle off
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

    // Atualiza card na grid e ranking
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
    list.innerHTML = '<p style="text-align:center;opacity:0.5;padding:40px 0">Nenhuma tradução aprovada ainda.</p>';
    return;
  }

  list.innerHTML = ranking.map((t, i) => {
    const medal  = i < 3 ? MEDALS[i] : '';
    const emoji  = i < 3 ? EMOJIS[i] : `#${i + 1}`;
    const delay  = i * 0.07;

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
    { id: 'gameTitle',     errId: 'err-gameTitle',     msg: 'Informe o nome do jogo.' },
    { id: 'genre',         errId: 'err-genre',         msg: 'Selecione um gênero.' },
    { id: 'translatorName',errId: 'err-translatorName',msg: 'Informe seu nome ou apelido.' },
    { id: 'downloadLink',  errId: 'err-downloadLink',  msg: 'Informe um link válido de download.' },
    { id: 'description',   errId: 'err-description',   msg: 'Adicione uma descrição do jogo.' }
  ];

  let valid = true;

  fields.forEach(f => {
    const el  = document.getElementById(f.id);
    const err = document.getElementById(f.errId);

    // Validação especial para URL
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
    document.getElementById(id).classList.remove('error');
    document.getElementById('err-' + id).textContent = '';
  });
}

function initForm() {
  const form       = document.getElementById('submitForm');
  const submitBtn  = document.getElementById('submitBtn');
  const successDiv = document.getElementById('formSuccess');
  const sendAnother= document.getElementById('sendAnother');

  // Remove erro ao digitar
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

    const title       = document.getElementById('gameTitle').value.trim();
    const genre       = document.getElementById('genre').value;
    const translator  = document.getElementById('translatorName').value.trim();
    const link        = document.getElementById('downloadLink').value.trim();
    const desc        = document.getElementById('description').value.trim();
    const coverUrl    = document.getElementById('coverUrl').value.trim();

    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Enviando...';

    // Tenta enviar para Formspree se configurado
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
        console.warn('Formspree não configurado ou offline. Salvando localmente.', err);
      }
    }

    // Salva como pendente no localStorage (funciona sem backend)
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

    // UI feedback
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
        👤 ${p.translator} &nbsp;|&nbsp; 🎭 ${capitalize(p.genre)} &nbsp;|&nbsp;
        🔗 <a href="${p.downloadLink}" target="_blank" rel="noopener" style="color:var(--sakura-500)">Ver link</a>
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

  // Abre/fecha painel
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

  // Login
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

  // Aprovar / Rejeitar
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
   14. SCROLL REVEAL (IntersectionObserver)
   ══════════════════════════════════════════════════════════════ */

function initScrollReveal() {
  const style = document.createElement('style');
  style.textContent = `
    .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.6s ease, transform 0.6s ease; }
    .reveal.visible { opacity: 1; transform: none; }
  `;
  document.head.appendChild(style);

  const targets = document.querySelectorAll('.section-header, .about-card, .stats-bar');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

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

  console.log(
    '%c🌸 Sakura Translations',
    'color:#e8618a;font-size:18px;font-weight:bold;font-family:serif'
  );
  console.log(
    '%cPara acessar o painel de moderação, use a senha: sakura2025',
    'color:#888;font-size:12px'
  );
});
