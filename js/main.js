/* КУ-2026 «Гейм-дизайнер» — логика изделия. Без зависимостей. */
"use strict";

const { MODULES, PROJECTS, QUIZ, ACCEPTANCE } = window.CV_DATA;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Тост ---------- */
let toastTimer = null;
function toast(msg, ms = 3400) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), ms);
}

/* ---------- ЭТАП 02. Модули компетенций ---------- */
function renderModules() {
  const root = $("#modulesList");
  root.innerHTML = MODULES.map((m) => `
    <article class="module reveal" role="button" tabindex="0" aria-expanded="false">
      <div class="module__head">
        <div class="module__level">${m.level}<small>УРОВЕНЬ</small></div>
        <div>
          <div class="module__code">${m.code} · МОДУЛЬ КОМПЕТЕНЦИЙ</div>
          <div class="module__name">${m.name}</div>
          <p class="module__desc">${m.desc}</p>
        </div>
      </div>
      <div class="module__body">
        <ul class="module__items">
          ${m.items.map(([name, note]) => `<li><b>${name}</b>${note}</li>`).join("")}
        </ul>
      </div>
    </article>
  `).join("");

  $$(".module", root).forEach((mod) => {
    const flip = () => {
      const open = mod.classList.toggle("open");
      mod.setAttribute("aria-expanded", open);
      if (open && !mod.dataset.played) {
        mod.dataset.played = "1";
      }
    };
    mod.addEventListener("click", flip);
    mod.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); }
    });
  });
}

/* ---------- ЭТАП 03. Наработки ---------- */
function renderProjects() {
  const root = $("#projectsList");
  root.innerHTML = PROJECTS.map((p) => `
    <article class="proj reveal">
      <div class="proj__num">${p.num.split(" ")[0]}<b>${p.num.split(" ")[1] || ""}</b></div>
      <div class="proj__main">
        <h3 class="proj__title">${p.title}</h3>
        <p class="proj__tagline">${p.tagline}</p>
        <span class="proj__prove">${p.prove}</span>
        <div class="proj__fields">
          <div class="proj__field"><span>ЗАДАЧА</span><p>${p.task}</p></div>
          <div class="proj__field"><span>РЕШЕНИЕ</span><p>${p.solution}</p></div>
          <div class="proj__field"><span>РЕЗУЛЬТАТ</span><p>${p.result}</p></div>
        </div>
        <div class="proj__razum"><b>Для «Разума»:</b> ${p.razum}</div>
      </div>
    </article>
  `).join("");
}

/* ---------- ЭТАП 06. Квиз ---------- */
function renderQuiz() {
  const root = $("#quiz");
  const KEYS = ["А", "Б", "В"];
  let i = 0;
  let score = 0;
  let answered = false;

  function questionView() {
    const q = QUIZ.questions[i];
    root.innerHTML = `
      <div class="quiz__head">
        <span>ТРЕНАЖЁР «ОХРАНА ТРУДА ГЕЙМДИЗАЙНА»</span>
        <span>ВОПРОС ${i + 1}/${QUIZ.questions.length} · СЧЁТ ${score}</span>
      </div>
      <p class="quiz__intro">${i === 0 ? QUIZ.intro : ""}</p>
      <p class="quiz__q">${q.q}</p>
      <div class="quiz__answers">
        ${q.answers.map((a, k) => `
          <button class="quiz__answer" type="button" data-k="${KEYS[k]}" data-ok="${a.ok}">${a.t}</button>
        `).join("")}
      </div>
    `;
    answered = false;
    $$(".quiz__answer", root).forEach((btn) => {
      btn.addEventListener("click", () => {
        if (answered) return;
        answered = true;
        const ok = btn.dataset.ok === "true";
        if (ok) score++;
        $$(".quiz__answer", root).forEach((b) => {
          b.disabled = true;
          if (b.dataset.ok === "true") b.classList.add("correct");
        });
        if (!ok) btn.classList.add("wrong");
        const why = document.createElement("p");
        why.className = "quiz__why";
        why.innerHTML = `<b>${ok ? "Верно." : "Не верно."}</b> ${q.why}`;
        $(".quiz__answers", root).after(why);
        const foot = document.createElement("div");
        foot.className = "quiz__foot";
        const next = document.createElement("button");
        next.className = "btn btn--primary";
        next.type = "button";
        next.textContent = i + 1 < QUIZ.questions.length ? "СЛЕДУЮЩИЙ ВОПРОС" : "ПОЛУЧИТЬ ВЕРДИКТ";
        next.addEventListener("click", () => {
          i++;
          i < QUIZ.questions.length ? questionView() : verdictView();
        });
        foot.appendChild(next);
        why.after(foot);
        next.focus();
      });
    });
  }

  function verdictView() {
    const v = QUIZ.verdicts.find((x) => score >= x.min);
    root.innerHTML = `
      <div class="quiz__head">
        <span>ТРЕНАЖЁР «ОХРАНА ТРУДА ГЕЙМДИЗАЙНА»</span>
        <span>ИТОГ ${score}/${QUIZ.questions.length}</span>
      </div>
      <div class="quiz__verdict">
        <p class="quiz__verdict-title ${score >= 3 ? "" : "fail"}">${v.title}</p>
        <p class="quiz__verdict-text">${v.text}</p>
        <button class="btn" type="button" id="quizRetry">${QUIZ.retry}</button>
      </div>
    `;
    $("#quizRetry").addEventListener("click", () => { i = 0; score = 0; questionView(); });
    if (score === 4) toast("Тренажёр зафиксировал: 4 из 4. Аттестат действителен 1 год.");
  }

  questionView();
}

/* ---------- ЭТАП 07. Приёмка ---------- */
function renderAcceptance() {
  const root = $("#acceptanceList");
  root.innerHTML = ACCEPTANCE.map((a) => `
    <div class="acc-row reveal">
      <p class="acc-row__req">${a.req}</p>
      <div class="acc-row__proof">
        ${a.proof}
        <span class="acc-row__where">подтверждение: ${a.where}</span>
      </div>
      <div class="acc-stamp">ПРИНЯТО<br>ГЭК·ГД</div>
    </div>
  `).join("");
}

/* ---------- Появление блоков + штампы ---------- */
function setupReveals() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      io.unobserve(en.target);
    });
  }, { threshold: 0.18 });
  $$(".reveal, .acc-row, .doc-sheet, .act__inner").forEach((el) => io.observe(el));
}

/* ---------- HUD: прогресс погружения + активная секция ---------- */
function setupHud() {
  const bar = $("#hudProgress");
  const pct = $("#hudPercent");
  const topBar = $("#topProgressBar");
  const label = $("#hudSection");
  const sections = $$("[data-title]");
  const leds = $$(".hud__leds li");
  const passed = new Set();

  function onScroll() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0;
    bar.style.width = p + "%";
    pct.textContent = p + "%";
    topBar.style.width = p + "%";

    let current = sections[0];
    for (const s of sections) {
      if (s.getBoundingClientRect().top <= window.innerHeight * 0.4) current = s;
    }
    if (current) {
      label.textContent = current.dataset.title;
      const id = current.id;
      passed.add(id);
      leds.forEach((li) => li.classList.toggle("passed", passed.has(li.dataset.led)));
      leds.forEach((li) => li.classList.toggle("active", li.dataset.led === id));
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ---------- Документация: слайдер листов ---------- */
function setupDocs() {
  const rail = $("#docsRail");
  const state = $("#docState");
  const sheets = $$(".doc-sheet", rail);
  function current() {
    return Math.round(rail.scrollLeft / (sheets[0].offsetWidth + 20));
  }
  function update() {
    state.textContent = `ЛИСТ ${Math.min(sheets.length, current() + 1)} / ${sheets.length}`;
  }
  function go(dir) {
    const w = sheets[0].offsetWidth + 20;
    rail.scrollTo({ left: (current() + dir) * w, behavior: reducedMotion ? "auto" : "smooth" });
  }
  $("#docPrev").addEventListener("click", () => go(-1));
  $("#docNext").addEventListener("click", () => go(1));
  rail.addEventListener("scroll", update, { passive: true });
  update();
}

/* ---------- Шильдик: фото → штамп ---------- */
function setupBadge() {
  const wrap = $("#heroPhotoWrap");
  wrap.addEventListener("click", () => {
    wrap.classList.toggle("stamped");
    if (wrap.classList.contains("stamped")) toast("Личное дело ГД-180 открыто. Допуск выдан: любое помещение, включая серверную.");
  });
}

/* ---------- VR-тумблер ---------- */
function setupVr() {
  const heroBadge = $("#heroBadge");
  const photo = $("#heroPhotoWrap");
  const nameplate = $(".hero__nameplate");
  const toggle = $("#vrToggle");
  toggle.addEventListener("change", () => {
    document.body.classList.toggle("vr", toggle.checked);
    if (toggle.checked) toast("VR-режим активен. Стереопара на 380 В — осторожнее с межфазным напряжением идей.");
  });
  if (reducedMotion) return;
  window.addEventListener("pointermove", (e) => {
    if (!toggle.checked) return;
    const dx = (e.clientX / window.innerWidth - 0.5);
    const dy = (e.clientY / window.innerHeight - 0.5);
    photo.style.transform = `translate(${dx * -14}px, ${dy * -10}px)`;
    nameplate.style.transform = `translate(${dx * 10}px, ${dy * 6}px)`;
  });
}

/* ---------- Пасхалка: трактор ---------- */
function tractorSvg() {
  return `
  <svg viewBox="0 0 100 70">
    <rect class="tr-body" x="14" y="18" width="52" height="22" rx="4"/>
    <rect class="tr-body" x="58" y="6" width="10" height="34" rx="2"/>
    <circle class="tr-wheel" cx="26" cy="48" r="14"/>
    <circle class="tr-wheel" cx="68" cy="52" r="9"/>
  </svg>`;
}
function rideTractor() {
  const el = $("#tractorRide");
  if (el.classList.contains("go")) return;
  el.innerHTML = tractorSvg();
  el.classList.add("go");
  toast("МОДУЛЬ «ТРАКТОРИСТ-ПРОФЕССИОНАЛ» АКТИВИРОВАН. BELARUS-3522 одобряет.");
  setTimeout(() => { el.classList.remove("go"); el.innerHTML = ""; }, 7300);
}

/* ---------- Konami → аварийная эвакуация ---------- */
function setupKonami() {
  const SEQ = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  let pos = 0;
  window.addEventListener("keydown", (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    pos = key === SEQ[pos] ? pos + 1 : (key === SEQ[0] ? 1 : 0);
    if (pos === SEQ.length) {
      pos = 0;
      const alarm = $("#alarm");
      alarm.classList.add("show");
      setTimeout(() => {
        alarm.classList.remove("show");
        $("#act").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
      }, 1600);
    }
  });
}

/* ---------- Кнопка «Пройти инструктаж» ---------- */
function setupStart() {
  $("#startBtn").addEventListener("click", () => {
    $("#briefing").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    toast("Инструктаж начат. Техника безопасности — на экране.");
  });
}

/* ---------- Инициализация ---------- */
renderModules();
renderProjects();
renderQuiz();
renderAcceptance();
setupReveals();
setupHud();
setupDocs();
setupBadge();
setupVr();
setupKonami();
setupStart();
