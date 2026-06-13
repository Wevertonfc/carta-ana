/* ============================================================
   CARTA DE AMOR PARA ANA — script.js  (versão otimizada)
   ============================================================ */

/* ── Data de início do relacionamento ─────────────────────── */
const START_DATE = new Date(2025, 3, 19, 0, 0, 0); // 19 de abril de 2025

/* === TEXTO DA CARTA (parágrafos) === */
const LETTER_PARAGRAPHS = [
  "Hoje é Dia dos Namorados e eu queria aproveitar este momento para lembrar o quanto você é importante para mim.",
  "Você trouxe mais alegria, carinho e significado para a minha vida. Cada conversa, cada sorriso e cada momento ao seu lado se tornaram lembranças que guardo com muito carinho.",
  "Sou grato por ter você ao meu lado e por tudo o que estamos construindo juntos.",
  "Que esta seja apenas mais uma página da nossa história, uma história escrita com amor, respeito, companheirismo e felicidade.",
  "Eu te amo e espero viver muitos outros momentos especiais ao seu lado."
];

/* ────────────────────────────────────────────────────────────
   PARTICLES — corações flutuantes no canvas
──────────────────────────────────────────────────────────── */
const canvas = document.getElementById('particle-canvas');
const ctx    = canvas.getContext('2d', { alpha: true, willReadFrequently: false });
let particles = [];
let animFrameId = null;
let isPageVisible = true;

/* ── Debounce do resize para não sobrecarregar ── */
let resizeTimer = null;
function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resizeCanvas, 150);
}, { passive: true });

/* ── Pausa a animação quando a aba fica em segundo plano ── */
document.addEventListener('visibilitychange', () => {
  isPageVisible = !document.hidden;
  if (isPageVisible && !animFrameId) {
    animFrameId = requestAnimationFrame(animateParticles);
  }
});

const EMOJIS = ['❤️','💕','💗','💓','🌹','✨','💫','💖'];

function createParticle(x, y) {
  return {
    x: x ?? Math.random() * canvas.width,
    y: y ?? canvas.height + 30,
    vx: (Math.random() - 0.5) * 0.9,
    vy: -(Math.random() * 1.4 + 0.6),
    size: Math.random() * 18 + 10,
    opacity: Math.random() * 0.6 + 0.4,
    emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.04,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: Math.random() * 0.03 + 0.01,
    dead: false,
  };
}

/* Spawn gradual — máx 40 partículas (menos que 55 anterior) */
let particleInterval = null;
function startParticles() {
  if (particleInterval) return;
  particleInterval = setInterval(() => {
    if (particles.length < 40) particles.push(createParticle());
  }, 400); // era 320ms
}
startParticles();

/* ── Loop de animação otimizado ──
   • ctx.font / textAlign configurados UMA vez antes do loop
   • Marcação de mortos com flag, remoção por splice (evita filter+novo array)       */
function animateParticles() {
  if (!isPageVisible) {
    animFrameId = null;
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Configurações globais do canvas — definidas uma vez por frame
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  let i = particles.length;
  while (i--) {
    const p = particles[i];

    p.wobble  += p.wobbleSpeed;
    p.x       += p.vx + Math.sin(p.wobble) * 0.4;
    p.y       += p.vy;
    p.rotation += p.rotSpeed;
    p.opacity -= 0.0018;

    if (p.y < -60 || p.opacity <= 0) {
      particles.splice(i, 1); // remove in-place, sem criar novo array
      continue;
    }

    ctx.save();
    ctx.globalAlpha = p.opacity;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.font = `${p.size}px serif`;
    ctx.fillText(p.emoji, 0, 0);
    ctx.restore();
  }

  animFrameId = requestAnimationFrame(animateParticles);
}
animFrameId = requestAnimationFrame(animateParticles);

/* Burst de partículas ao clicar no CTA */
function burstParticles(originX, originY, count = 18) {
  for (let i = 0; i < count; i++) {
    const p = createParticle(originX, originY);
    p.vx = (Math.random() - 0.5) * 4;
    p.vy = -(Math.random() * 4 + 2);
    p.size = Math.random() * 22 + 12;
    p.opacity = 1;
    particles.push(p);
  }
}

/* ────────────────────────────────────────────────────────────
   CONTADOR DE TEMPO — cache de elementos para evitar
   querySelector repetido a cada segundo
──────────────────────────────────────────────────────────── */
const timerEls = {
  years:   document.getElementById('t-years'),
  months:  document.getElementById('t-months'),
  days:    document.getElementById('t-days'),
  hours:   document.getElementById('t-hours'),
  minutes: document.getElementById('t-minutes'),
  seconds: document.getElementById('t-seconds'),
};

/* Último valor exibido — só atualiza o DOM se mudou */
const timerLast = { years:-1, months:-1, days:-1, hours:-1, minutes:-1, seconds:-1 };

function updateTimer() {
  const now  = new Date();
  let diff   = Math.floor((now - START_DATE) / 1000);
  if (diff < 0) diff = 0;

  const seconds = diff % 60; diff = Math.floor(diff / 60);
  const minutes = diff % 60; diff = Math.floor(diff / 60);
  const hours   = diff % 24;

  let years  = now.getFullYear() - START_DATE.getFullYear();
  let months = now.getMonth()    - START_DATE.getMonth();
  let days   = now.getDate()     - START_DATE.getDate();

  if (days < 0) {
    months--;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) { years--; months += 12; }

  /* Atualiza o DOM apenas quando o valor muda */
  if (timerLast.years   !== years)   { timerEls.years.textContent   = years;                       timerLast.years   = years;   }
  if (timerLast.months  !== months)  { timerEls.months.textContent  = months;                      timerLast.months  = months;  }
  if (timerLast.days    !== days)    { timerEls.days.textContent    = days;                        timerLast.days    = days;    }
  if (timerLast.hours   !== hours)   { timerEls.hours.textContent   = String(hours).padStart(2,'0');   timerLast.hours   = hours;   }
  if (timerLast.minutes !== minutes) { timerEls.minutes.textContent = String(minutes).padStart(2,'0'); timerLast.minutes = minutes; }
  if (timerLast.seconds !== seconds) { timerEls.seconds.textContent = String(seconds).padStart(2,'0'); timerLast.seconds = seconds; }
}
updateTimer();
setInterval(updateTimer, 1000);

/* ────────────────────────────────────────────────────────────
   MÚSICA
──────────────────────────────────────────────────────────── */
const music       = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
const musicLabel  = musicToggle.querySelector('.music-label');
let isPlaying = false;

musicToggle.addEventListener('click', () => {
  if (!music.src || music.src === window.location.href) {
    showToast('🎵 Adicione um arquivo MP3 em assets/musica.mp3 para ativar a música!');
    return;
  }
  if (isPlaying) {
    music.pause();
    isPlaying = false;
    musicLabel.textContent = 'Ativar Música';
    musicToggle.classList.remove('playing');
  } else {
    music.play().then(() => {
      isPlaying = true;
      musicLabel.textContent = 'Pausar Música';
      musicToggle.classList.add('playing');
    }).catch(() => showToast('Não foi possível reproduzir o áudio.'));
  }
});

/* ────────────────────────────────────────────────────────────
   MINIMIZAR CONTADOR
──────────────────────────────────────────────────────────── */
const timerMinimizeBtn = document.getElementById('timer-minimize-btn');
let timerMinimized = false;

timerMinimizeBtn.addEventListener('click', () => {
  timerMinimized = !timerMinimized;
  timerCard.classList.toggle('minimized', timerMinimized);
  timerMinimizeBtn.setAttribute('aria-label', timerMinimized ? 'Expandir contador' : 'Minimizar contador');
  timerMinimizeBtn.title = timerMinimized ? 'Expandir' : 'Minimizar';
});

/* ────────────────────────────────────────────────────────────
   NAVEGAÇÃO ENTRE TELAS
──────────────────────────────────────────────────────────── */
const introScreen  = document.getElementById('intro-screen');
const letterScreen = document.getElementById('letter-screen');
const openBtn      = document.getElementById('open-letter-btn');
const backBtn      = document.getElementById('back-btn');
const timerCard    = document.getElementById('timer-card');

openBtn.addEventListener('click', (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  burstParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);

  introScreen.classList.add('fade-out');

  setTimeout(() => {
    introScreen.classList.remove('active', 'fade-out');
    letterScreen.classList.add('active');
    letterScreen.scrollTop = 0;
    startTypewriting();
  }, 600);
});

backBtn.addEventListener('click', () => {
  letterScreen.classList.remove('active');
  letterScreen.classList.add('fade-out');
  stopTypewriting();

  setTimeout(() => {
    letterScreen.classList.remove('fade-out');
    introScreen.classList.add('active');
    document.getElementById('letter-text').innerHTML = '';
  }, 600);
});

/* ────────────────────────────────────────────────────────────
   EFEITO DE DIGITAÇÃO
──────────────────────────────────────────────────────────── */
let typeTimeout  = null;
let typingActive = false;

function stopTypewriting() {
  typingActive = false;
  if (typeTimeout) { clearTimeout(typeTimeout); typeTimeout = null; }
}

function startTypewriting() {
  typingActive = true;
  const container = document.getElementById('letter-text');
  container.innerHTML = '';
  let pIdx = 0, cIdx = 0;

  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  container.appendChild(cursor);

  /* Cache do parágrafo atual para evitar getElementById repetido */
  let currentP = null;

  function typeNext() {
    if (!typingActive) return;

    if (pIdx >= LETTER_PARAGRAPHS.length) {
      cursor.style.transition = 'opacity 0.5s';
      cursor.style.opacity = '0';
      setTimeout(() => cursor.remove(), 600);
      return;
    }

    const para = LETTER_PARAGRAPHS[pIdx];

    if (cIdx === 0) {
      currentP = document.createElement('p');
      currentP.id = `para-${pIdx}`;
      container.insertBefore(currentP, cursor);
    }

    currentP.textContent = para.slice(0, cIdx + 1);
    cIdx++;

    if (cIdx >= para.length) {
      pIdx++;
      cIdx = 0;
      currentP = null;
      typeTimeout = setTimeout(typeNext, 380);
    } else {
      const ch = para[cIdx];
      const delay = ['.','!','?'].includes(ch) ? 220 : (ch === ',' ? 100 : 28);
      typeTimeout = setTimeout(typeNext, delay);
    }
  }

  typeTimeout = setTimeout(typeNext, 1600);
}

/* ────────────────────────────────────────────────────────────
   TOAST
──────────────────────────────────────────────────────────── */
function showToast(msg) {
  const old = document.querySelector('.toast');
  if (old) old.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  Object.assign(toast.style, {
    position: 'fixed', bottom: '5rem', left: '50%',
    transform: 'translateX(-50%) translateY(20px)',
    background: 'rgba(60,10,20,0.9)', color: '#fff',
    padding: '0.7rem 1.4rem', borderRadius: '50px',
    fontSize: '0.85rem', fontFamily: 'Poppins, sans-serif',
    zIndex: '9999', opacity: '0',
    transition: 'opacity 0.4s, transform 0.4s',
    backdropFilter: 'blur(10px)',
    maxWidth: 'calc(100vw - 3rem)', textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  });
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

/* ────────────────────────────────────────────────────────────
   CLIQUE NA FOTO — burst de corações
──────────────────────────────────────────────────────────── */
const letterPhoto = document.getElementById('letter-photo');
if (letterPhoto) {
  letterPhoto.addEventListener('click', (e) => burstParticles(e.clientX, e.clientY, 24));
  letterPhoto.style.cursor = 'pointer';
  letterPhoto.title = 'Clique para um momento especial 💕';
}

/* ────────────────────────────────────────────────────────────
   CLIQUE NA TELA — spawna partículas interativas
──────────────────────────────────────────────────────────── */
document.addEventListener('click', (e) => {
  const ignore = ['open-letter-btn','back-btn','music-toggle','letter-photo'];
  if (ignore.some(id => e.target.closest?.(`#${id}`))) return;
  for (let i = 0; i < 5; i++) {
    const p = createParticle(e.clientX, e.clientY);
    p.vy = -(Math.random() * 3 + 1.5);
    p.vx = (Math.random() - 0.5) * 2.5;
    p.opacity = 1;
    p.size = Math.random() * 16 + 10;
    particles.push(p);
  }
}, { passive: true });
