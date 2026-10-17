(() => {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const SVG_ASSETS = new Set(['flag', 'yurt', 'dombra', 'beshbarmak', 'kazy', 'baursak', 'shanyrak']);
  const IMG = (n) => `assets/img/${n}.${SVG_ASSETS.has(n) ? 'svg' : 'png'}`;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================= Данные ================= */

  const POOL = ['flag', 'flag', 'flag', 'horse', 'horse', 'yurt', 'dombra', 'dombra', 'beshbarmak', 'beshbarmak', 'kazy', 'baursak', 'baursak',
    'eagle', 'ram', 'sheep', 'tea', 'teapot', 'kumys', 'camel', 'apple', 'tulip', 'flatbread', 'meat', 'crown'];
  POOL.forEach((n) => { const i = new Image(); i.src = IMG(n); });

  // forms: [на 1 …, на 2–4 …, на 5–0 …]
  const UNITS = [
    { w: 4, forms: ['коня', 'коня', 'коней'], of: 'юрт', icon: 'horse' },
    { w: 1, forms: ['баурсак', 'баурсака', 'баурсаков'], of: 'казанов', icon: 'baursak' },
    { w: 1, forms: ['бешбармак', 'бешбармака', 'бешбармаков'], of: 'дастарханов', icon: 'beshbarmak' },
    { w: 1, forms: ['домбру', 'домбры', 'домбр'], of: 'аулов', icon: 'dombra' },
    { w: 1, forms: ['палку казы', 'палки казы', 'палок казы'], of: 'тоев', icon: 'kazy' },
    { w: 1, forms: ['беркута', 'беркута', 'беркутов'], of: 'вершин Алатау', icon: 'eagle' },
    { w: 1, forms: ['барашка', 'барашка', 'барашков'], of: 'отар', icon: 'ram' },
    { w: 1, forms: ['яблоко', 'яблока', 'яблок'], of: 'садов Алматы', icon: 'apple' },
    { w: 1, forms: ['тюльпан', 'тюльпана', 'тюльпанов'], of: 'весенних степей', icon: 'tulip' },
    { w: 1, forms: ['лепёшку', 'лепёшки', 'лепёшек'], of: 'тандыров', icon: 'flatbread' },
    { w: 1, forms: ['кесе чая', 'кесе чая', 'кесе чая'], of: 'самоваров', icon: 'tea' },
    { w: 1, forms: ['пиалу кумыса', 'пиалы кумыса', 'пиал кумыса'], of: 'торсыков', icon: 'kumys' },
    { w: 1, forms: ['верблюда', 'верблюда', 'верблюдов'], of: 'караванов', icon: 'camel' },
    { w: 1, forms: ['юрту', 'юрты', 'юрт'], of: 'аулов', icon: 'yurt' },
  ];

  const COMMENTS = [
    ['Вайба нет. Срочно к апе на баурсаки — это лечится.', 'Ноль. Даже ветер в степи затих от неловкости.'],
    ['Ой бай… Даже конь отвернулся.', 'Один. Как последний баурсак, который никто не решается взять.'],
    ['Вайб как остывший чай. Подлей молока и попробуй снова.', 'Слабо. Аташка вздохнул и пошёл смотреть новости.'],
    ['Скромно. Включи кюй на полную громкость.', 'Вайб ещё запрягает коня. Подожди немного.'],
    ['Почти середина степи. Едем дальше, не сворачиваем.', 'Как будто приехал на той, а бешбармак ещё варится.'],
    ['Ровно половина. Как дастархан до прихода гостей.', 'Пять из десяти — стабильность, как цены на базаре. Ну почти.'],
    ['Неплохо! Аташка одобрительно кивает.', 'Твёрдая шестёрка. Апа говорит: «Молодец, но ешь больше».'],
    ['Хороший вайб. Можно смело идти на той.', 'Семь! Чай налит, баурсаки горячие.'],
    ['Мощно! Тебя уже зовут быть тамадой.', 'Восемь. Кони сами выстраиваются в очередь.'],
    ['Почти легенда. Беркут сел тебе на плечо.', 'Девять! Соседний аул завидует.'],
    ['МАКСИМАЛЬНЫЙ ВАЙБ. Ты сегодня — хан степи. Жарайсың!', 'ДЕСЯТЬ! Вся степь стоя аплодирует. Жарайсың!'],
    ['Вайб пробил шанырак! Такого даже аташка не помнит.'],
  ];

  // Иногда вайбометр отвечает вообще не по теме
  const WEIRD = [
    'Я скучаю по жене… и по бешбармаку.',
    'Не знаю… спроси у коня.',
    'Сначала чай с молоком, вайб потом.',
    'Ма-а-а-а-а-ожет быть…',
    'Апа звонит. Перезвоню.',
    'Мен бешбармак жеп отырмын, не отвлекай.',
  ];

  const STATUSES = [
    'Опрашиваем аташек…', 'Считаем коней в табуне…', 'Завариваем чай с молоком…', 'Нарезаем казы…',
    'Настраиваем домбру…', 'Звоним апе…', 'Сверяемся с беркутом…', 'Пересчитываем баурсаки…',
    'Ставим казан на огонь…', 'Спрашиваем у ветра в степи…', 'Раскладываем асыки…',
  ];
  const WORDS = { 3: 'үш', 2: 'екі', 1: 'бір' };

  const plural = (n, f) => {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return f[0];
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return f[1];
    return f[2];
  };

  function weightedUnit() {
    const total = UNITS.reduce((s, u) => s + u.w, 0);
    let r = Math.random() * total;
    for (const u of UNITS) { if ((r -= u.w) < 0) return u; }
    return UNITS[0];
  }

  function rollOutcome() {
    const r = Math.random();
    if (r < 0.06) return { weird: true, text: pick(WEIRD) };
    const score = r < 0.08 ? 11 : Math.floor(Math.random() * 11); // 0..10 поровну, изредка 11
    const unit = weightedUnit();
    return { score, unit, text: `${plural(score, unit.forms)} из 10 ${unit.of}`, comment: pick(COMMENTS[score]) };
  }

  /* ================= Звук (WebAudio, без файлов) ================= */

  const Sound = {
    ctx: null, on: true, master: null, volume: 80,
    init() {
      if (!this.ctx) {
        try {
          this.ctx = new (window.AudioContext || window.webkitAudioContext)();
          this.master = this.ctx.createGain();
          this.master.connect(this.ctx.destination);
          this.applyVolume();
        } catch (e) { this.ctx = null; }
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },
    // громкость 0–100 → усиление по квадрату (ухо слышит громкость логарифмически)
    applyVolume() {
      if (!this.master) return;
      const g = this.on ? Math.pow(this.volume / 100, 2) : 0;
      this.master.gain.setTargetAtTime(g, this.ctx.currentTime, 0.02);
    },
    ok() { return this.on && this.volume > 0 && this.ctx; },
    // Щипок струны (Karplus–Strong) — почти домбра
    pluck(freq, when = 0, vol = 0.5, dur = 1.6) {
      if (!this.ok()) return;
      const c = this.ctx, sr = c.sampleRate, len = Math.floor(sr * dur);
      const buf = c.createBuffer(1, len, sr), d = buf.getChannelData(0);
      const N = Math.max(2, Math.round(sr / freq)), ring = new Float32Array(N);
      for (let i = 0; i < N; i++) ring[i] = Math.random() * 2 - 1;
      let idx = 0;
      for (let i = 0; i < len; i++) {
        const nx = (idx + 1) % N, v = ring[idx];
        ring[idx] = (v + ring[nx]) * 0.5 * 0.996;
        d[i] = v; idx = nx;
      }
      const src = c.createBufferSource(); src.buffer = buf;
      const g = c.createGain(); g.gain.value = vol;
      src.connect(g).connect(this.master);
      src.start(c.currentTime + when);
    },
    noiseBuf() {
      if (this._nb) return this._nb;
      const c = this.ctx, b = c.createBuffer(1, c.sampleRate * 0.2, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      return (this._nb = b);
    },
    hit(when, vol = 0.25, freq = 1100) {
      const c = this.ctx, s = c.createBufferSource(); s.buffer = this.noiseBuf();
      const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 0.8;
      const g = c.createGain(), t = c.currentTime + when;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
      s.connect(f).connect(g).connect(this.master);
      s.start(t); s.stop(t + 0.1);
    },
    // Нарастающая барабанная дробь (как дауылпаз)
    drumroll(dur) {
      if (!this.ok()) return;
      let t = 0, step = 0.13;
      while (t < dur) {
        const k = t / dur;
        this.hit(t, 0.08 + k * 0.28, 900 + k * 600);
        step = Math.max(0.035, 0.13 - k * 0.11);
        t += step;
      }
    },
    boom(when = 0, vol = 0.9) {
      if (!this.ok()) return;
      const c = this.ctx, o = c.createOscillator(), g = c.createGain(), t = c.currentTime + when;
      o.frequency.setValueAtTime(140, t);
      o.frequency.exponentialRampToValueAtTime(40, t + 0.4);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      o.connect(g).connect(this.master); o.start(t); o.stop(t + 0.55);
    },
    tick() { if (this.ok()) this.hit(0, 0.12, 2500); },
    // Победный перебор по пентатонике; чем выше оценка — тем длиннее
    fanfare(score) {
      if (!this.ok()) return;
      const scale = [220, 246.9, 293.7, 329.6, 370, 440, 493.9, 587.3, 659.3, 740, 880];
      const n = 3 + Math.min(score, 10);
      for (let i = 0; i < n; i++) this.pluck(scale[i % scale.length], i * 0.07, 0.35);
      const end = n * 0.07;
      [440, 554.4, 659.3, 880].forEach((f, i) => this.pluck(f, end + i * 0.015, 0.4, 2.2));
      if (score >= 10) { this.boom(end, 0.8); [880, 1108.7, 1318.5].forEach((f, i) => this.pluck(f, end + 0.35 + i * 0.09, 0.3)); }
    },
    // Грустный тромбон «ва-ва-ва-ваааа»
    sad() {
      if (!this.ok()) return;
      const c = this.ctx, notes = [311, 294, 277, 262];
      notes.forEach((f, i) => {
        const t = c.currentTime + i * 0.42, len = i === 3 ? 1.1 : 0.38;
        const o = c.createOscillator(), lp = c.createBiquadFilter(), g = c.createGain();
        o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t);
        if (i === 3) { o.frequency.linearRampToValueAtTime(f * 0.94, t + len); }
        lp.type = 'lowpass'; lp.frequency.setValueAtTime(500, t); lp.frequency.linearRampToValueAtTime(1300, t + 0.1); lp.frequency.linearRampToValueAtTime(600, t + len);
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.22, t + 0.04); g.gain.linearRampToValueAtTime(0.0001, t + len);
        o.connect(lp).connect(g).connect(this.master); o.start(t); o.stop(t + len + 0.05);
      });
    },
    hmm() { // для странных ответов
      if (!this.ok()) return;
      [330, 392, 349].forEach((f, i) => this.pluck(f, i * 0.18, 0.35));
    },
  };

  /* ================= Частицы ================= */

  const fx = $('#fx');
  const parts = [];
  let raf = 0, last = 0;
  const MAX_PARTS = reduceMotion ? 25 : 220;

  function spawn(o) {
    if (parts.length >= MAX_PARTS) return;
    const el = document.createElement('img');
    const size = o.size || rand(34, 78);
    el.src = IMG(o.name || pick(POOL));
    el.alt = '';
    el.style.width = el.style.height = size + 'px';
    el.style.marginLeft = el.style.marginTop = -size / 2 + 'px';
    fx.appendChild(el);
    parts.push({ el, x: o.x, y: o.y, vx: o.vx, vy: o.vy, g: o.g ?? 0.38, r: rand(0, 360), vr: rand(-9, 9), drag: o.drag ?? 0.992, sway: o.sway || 0, t: 0 });
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
  }

  function loop(now) {
    const dt = Math.min(2.5, (now - last) / 16.67); last = now;
    const H = innerHeight, W = innerWidth;
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.t += dt;
      p.vy += p.g * dt;
      p.vx *= Math.pow(p.drag, dt); p.vy *= Math.pow(p.drag, dt);
      p.x += (p.vx + Math.sin(p.t * 0.05) * p.sway) * dt;
      p.y += p.vy * dt;
      p.r += p.vr * dt;
      p.el.style.transform = `translate3d(${p.x}px,${p.y}px,0) rotate(${p.r}deg)`;
      if (p.y > H + 120 || p.x < -150 || p.x > W + 150) { p.el.remove(); parts.splice(i, 1); }
    }
    raf = parts.length ? requestAnimationFrame(loop) : 0;
  }

  function burst(n, x, y, names, power = 1) {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.3;
      const s = rand(9, 21) * power;
      spawn({ name: names ? pick(names) : undefined, x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s });
    }
  }

  function cannons(n) { // залпы из нижних углов
    const H = innerHeight, W = innerWidth;
    for (let i = 0; i < n; i++) {
      const left = i % 2 === 0, s = rand(16, 27);
      const a = left ? rand(-1.35, -0.95) : Math.PI - rand(-1.35, -0.95);
      spawn({ x: left ? -20 : W + 20, y: H - 40, vx: Math.cos(a) * s, vy: -Math.abs(Math.sin(a) * s) });
    }
  }

  function rain(ms, perTick, names, gentle) {
    const end = performance.now() + ms;
    const id = setInterval(() => {
      if (performance.now() > end) return clearInterval(id);
      for (let i = 0; i < perTick; i++) {
        spawn({ name: names ? pick(names) : undefined, x: rand(0, innerWidth), y: -60, vx: rand(-1, 1), vy: rand(1, 4), g: gentle ? 0.04 : 0.18, drag: gentle ? 0.99 : 0.995, sway: gentle ? 1.5 : 0, size: rand(30, 60) });
      }
    }, 120);
  }

  /* ================= Анимированная иконка вкладки ================= */

  const favLink = $('#favicon');
  const fav = { mode: 'sun', text: '', angle: 0 };
  const fc = document.createElement('canvas'); fc.width = fc.height = 64;
  const fctx = fc.getContext('2d');

  function drawFav() {
    const c = fctx;
    c.clearRect(0, 0, 64, 64);
    c.fillStyle = '#00AFCA';
    c.beginPath(); if (c.roundRect) c.roundRect(0, 0, 64, 64, 14); else c.rect(0, 0, 64, 64); c.fill();
    if (fav.mode === 'text') {
      c.save(); c.translate(32, 32); c.rotate(fav.angle); c.fillStyle = 'rgba(254,197,12,.55)';
      for (let i = 0; i < 12; i++) { c.rotate(Math.PI / 6); c.beginPath(); c.moveTo(-3, 18); c.lineTo(0, 31); c.lineTo(3, 18); c.fill(); }
      c.restore();
      c.fillStyle = '#FEC50C'; c.beginPath(); c.arc(32, 32, 21, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#5a2e00';
      c.font = `900 ${fav.text.length > 1 ? 24 : 32}px Unbounded, Arial Black, sans-serif`;
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(fav.text, 32, 34);
    } else {
      c.save(); c.translate(32, 32); c.rotate(fav.angle); c.fillStyle = '#FEC50C';
      for (let i = 0; i < 16; i++) { c.rotate(Math.PI / 8); c.beginPath(); c.moveTo(-3.2, 15); c.lineTo(0, 29); c.lineTo(3.2, 15); c.fill(); }
      c.restore();
      const pulse = 12 + Math.sin(fav.angle * 6) * 1.2;
      c.beginPath(); c.arc(32, 32, pulse, 0, Math.PI * 2); c.fill();
    }
    favLink.href = fc.toDataURL('image/png');
  }
  setInterval(() => { if (document.hidden) return; fav.angle += fav.mode === 'text' ? 0.25 : 0.09; drawFav(); }, 110);

  /* ================= Экраны ================= */

  const screens = { start: $('#start'), count: $('#count'), result: $('#result') };
  function show(name) {
    Object.values(screens).forEach((s) => s.classList.remove('is-active'));
    screens[name].classList.add('is-active');
  }

  const countNum = $('#countNum'), countWord = $('#countWord'), countStatus = $('#countStatus');
  const rLead = $('#rLead'), rNum = $('#rNum'), rUnit = $('#rUnit'), rIcons = $('#rIcons'), rComment = $('#rComment');
  const actions = document.querySelector('.actions'), flashEl = $('#flash'), body = document.body;
  const BASE_TITLE = 'Казахский Вайбометр';
  let busy = false;

  function restartAnim(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

  async function run() {
    if (busy) return;
    busy = true;
    Sound.init();
    body.classList.remove('gloomy', 'epic');
    actions.classList.remove('show');
    show('count');

    const statuses = [...STATUSES].sort(() => Math.random() - 0.5);
    Sound.drumroll(3.1);
    fav.mode = 'text';
    for (const n of [3, 2, 1]) {
      countNum.textContent = n;
      countWord.textContent = WORDS[n];
      countStatus.textContent = statuses[3 - n];
      restartAnim(countNum, 'tick');
      restartAnim(countWord, 'tick');
      fav.text = String(n);
      document.title = `${n}… · ${BASE_TITLE}`;
      Sound.pluck([196, 247, 294][3 - n], 0, 0.45);
      await wait(1000);
    }

    const out = rollOutcome();
    restartAnim(flashEl, 'on');
    show('result');
    await reveal(out);
    busy = false;
  }

  async function reveal(out) {
    rIcons.innerHTML = '';
    rComment.classList.remove('show');
    rComment.textContent = '';
    rNum.classList.remove('land', 'small');
    rUnit.classList.remove('quote');
    rLead.textContent = out.weird ? 'Вайбометр подумал и ответил:' : 'Сегодня казахский вайб на';
    rUnit.textContent = '';

    // «Слот-машина» из цифр
    rNum.classList.add('spinning');
    const spins = 14;
    for (let i = 0; i < spins; i++) {
      rNum.textContent = Math.floor(Math.random() * 11);
      Sound.tick();
      await wait(30 + i * i * 1.1);
    }
    rNum.classList.remove('spinning');

    const cx = innerWidth / 2, cy = rNum.getBoundingClientRect().top + rNum.offsetHeight / 2;

    if (out.weird) {
      rNum.textContent = '?';
      rNum.classList.add('small');
      restartAnim(rNum, 'land');
      rUnit.classList.add('quote');
      rUnit.textContent = `«${out.text}»`;
      Sound.hmm();
      burst(10, cx, cy, ['tea', 'baursak', 'sheep'], 0.7);
      fav.text = '?';
      document.title = `?/10 · ${BASE_TITLE}`;
      rComment.textContent = 'Вайбометр сегодня с характером. Спроси ещё раз.';
    } else {
      const s = out.score;
      rNum.textContent = s;
      restartAnim(rNum, 'land');
      rUnit.textContent = out.text;
      fav.text = String(s);
      document.title = `${s}/10 · ${BASE_TITLE}`;

      // Ряд иконок
      const total = Math.max(10, s);
      for (let i = 0; i < total; i++) {
        const img = document.createElement('img');
        img.src = IMG(out.unit.icon); img.alt = '';
        if (i >= s) img.classList.add('off');
        if (i >= 10) img.classList.add('bonus');
        rIcons.appendChild(img);
        setTimeout(() => img.classList.add('show'), 120 + i * 70);
      }

      if (s <= 2) {
        body.classList.add('gloomy');
        Sound.sad();
        rain(1800, 1, [out.unit.icon, 'tea'], true);
      } else {
        Sound.fanfare(s);
        Sound.boom(0, 0.35 + s * 0.05);
        body.classList.remove('shake'); void body.offsetWidth;
        if (s >= 6) body.classList.add('shake');
        const names = Math.random() < 0.5 ? null : [out.unit.icon, out.unit.icon, 'flag', 'horse'];
        burst(10 + s * 7, cx, cy, names, 0.8 + s * 0.04);
        if (s >= 7) setTimeout(() => cannons(12 + (s - 7) * 8), 250);
        if (s >= 10) {
          body.classList.add('epic');
          setTimeout(() => cannons(30), 900);
          rain(4500, 3, null, false);
        }
      }
      rComment.textContent = out.comment;
    }

    await wait(500);
    rComment.classList.add('show');
    actions.classList.add('show');
  }

  /* ================= Кнопки ================= */

  $('#vibeBtn').addEventListener('click', run);
  $('#againBtn').addEventListener('click', run);

  const soundBtn = $('#soundBtn');
  const volEl = $('#volume'), volVal = $('#volVal'), soundBox = $('#soundBox');
  // На тач-экранах наведения нет: первый тап открывает панель, следующие — мут
  const noHover = window.matchMedia('(hover: none)').matches;
  document.addEventListener('pointerdown', (e) => {
    if (soundBox.contains(e.target)) return;
    soundBox.classList.remove('open');
    if (soundBox.contains(document.activeElement)) document.activeElement.blur();
  });
  try {
    if (localStorage.getItem('kv-sound') === 'off') Sound.on = false;
    const v = parseInt(localStorage.getItem('kv-volume'), 10);
    if (!Number.isNaN(v)) Sound.volume = Math.min(100, Math.max(0, v));
  } catch (e) {}
  volEl.value = Sound.volume;

  const syncSound = () => {
    const silent = !Sound.on || Sound.volume === 0;
    soundBtn.textContent = silent ? '🔇' : Sound.volume < 34 ? '🔈' : Sound.volume < 67 ? '🔉' : '🔊';
    soundBtn.setAttribute('aria-label', Sound.on ? 'Выключить звук' : 'Включить звук');
    soundBtn.setAttribute('aria-pressed', String(!Sound.on));
    volEl.style.setProperty('--v', (Sound.on ? Sound.volume : 0) + '%');
    volVal.textContent = Sound.on ? Sound.volume + '%' : 'выкл';
    volEl.classList.toggle('is-muted', !Sound.on);
    Sound.applyVolume();
  };
  syncSound();

  soundBtn.addEventListener('click', () => {
    if (noHover && !soundBox.classList.contains('open')) { soundBox.classList.add('open'); return; }
    Sound.on = !Sound.on;
    if (Sound.on && Sound.volume === 0) { Sound.volume = 50; volEl.value = 50; }
    syncSound();
    try { localStorage.setItem('kv-sound', Sound.on ? 'on' : 'off'); localStorage.setItem('kv-volume', Sound.volume); } catch (e) {}
    if (Sound.on) { Sound.init(); Sound.applyVolume(); Sound.pluck(440, 0, 0.3); }
  });

  let previewT = 0;
  volEl.addEventListener('input', () => {
    Sound.volume = parseInt(volEl.value, 10);
    Sound.on = Sound.volume > 0;  // двигаешь ползунок — звук включается
    Sound.init();
    syncSound();
    // короткий «щипок» для пробы громкости, не чаще раза в 120 мс
    const now = performance.now();
    if (now - previewT > 120) { previewT = now; Sound.pluck(330 + Sound.volume * 3, 0, 0.3, 0.6); }
  });
  volEl.addEventListener('change', () => {
    try { localStorage.setItem('kv-volume', Sound.volume); localStorage.setItem('kv-sound', Sound.on ? 'on' : 'off'); } catch (e) {}
  });

  // Пробел / Enter на стартовом экране
  document.addEventListener('keydown', (e) => {
    if ((e.key === ' ' || e.key === 'Enter') && !busy && document.activeElement === body) {
      e.preventDefault(); run();
    }
  });

  // Лучи солнца как на флаге — 32 штуки
  const rays = $('#sunRays');
  let poly = '';
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2, w = 0.07;
    const p = (r, ang) => `${(Math.cos(ang) * r).toFixed(2)},${(Math.sin(ang) * r).toFixed(2)}`;
    poly += `<polygon points="${p(34, a - w)} ${p(98, a)} ${p(34, a + w)}"/>`;
  }
  rays.innerHTML = poly;
})();
