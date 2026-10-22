// При перезагрузке всегда открываем сайт с самого верха
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);

const images = [
  "https://avatars.mds.yandex.net/get-altay/16411237/2a0000019c0a7de3a295d19a424eb91fbca4/XXXL",
  "https://avatars.mds.yandex.net/get-altay/16420800/2a0000019e41a97f7ba320b350a45036e3d5/XXXL",
  "https://avatars.mds.yandex.net/get-altay/16158716/2a0000019c160f9f095149c43502c80c8232/XXXL",
  "https://avatars.mds.yandex.net/get-altay/17863912/2a0000019b218a80cbbeb497d49de28fc189/XXXL",
  "https://avatars.mds.yandex.net/get-altay/16874376/2a0000019b9cf14934b72cbabb5e7aaede47/XXXL",
];

const INTERVAL = 5000; // смена фото каждые 5 секунд

// ---------- Слайдшоу ----------
const container = document.getElementById("slides");

const slides = images.map((url, i) => {
  const slide = document.createElement("div");
  slide.className = "slide" + (i === 0 ? " active" : "");
  slide.style.backgroundImage = `url("${url}")`;
  container.appendChild(slide);
  return slide;
});

let currentSlide = 0;

setInterval(() => {
  slides[currentSlide].classList.remove("active");
  currentSlide = (currentSlide + 1) % slides.length;
  slides[currentSlide].classList.add("active");
}, INTERVAL);

// ---------- Название при прокрутке ----------
const title = document.getElementById("title");
const titleMain = document.getElementById("titleMain");
const subtitle = document.getElementById("subtitle");
const topbar = document.getElementById("topbar");
const callBtn = document.getElementById("callBtn");
const menuBtn = document.getElementById("menuBtn");

const MIN_SCALE = 0.45; // насколько уменьшается название
const TOP_OFFSET = 16;  // отступ сверху в конечном положении

const lerp = (a, b, t) => a + (b - a) * t;

function update() {
  const heroH = window.innerHeight * 0.9;
  const titleH = title.offsetHeight;
  const mainH = titleMain.offsetHeight;
  const scrollY = window.scrollY;

  // 0 — в начале страницы, 1 — белый фон доехал до верха экрана
  const progress = Math.min(Math.max(scrollY / heroH, 0), 1);

  const startY = heroH / 2 - titleH / 2;
  const y = lerp(startY, TOP_OFFSET, progress);
  const scale = lerp(1, MIN_SCALE, progress);

  title.style.transform = `translateY(${y}px) scale(${scale})`;

  // Подзаголовок плавно исчезает в первой половине прокрутки
  subtitle.style.opacity = Math.max(1 - progress * 2, 0);

  // Где сейчас верхний край белого фона и середина названия
  const whiteTop = heroH - scrollY;
  const titleCenter = y + (mainH * scale) / 2;
  title.classList.toggle("dark", whiteTop <= titleCenter);

  // Белая полоса под названием, когда фото полностью уехали
  const barH = TOP_OFFSET * 2 + mainH * MIN_SCALE;
  topbar.style.height = `${barH}px`;
  topbar.classList.toggle("visible", whiteTop <= barH);

  // Кнопки «Позвонить» и «Меню» темнеют, когда под ними белый фон
  const btnRect = callBtn.getBoundingClientRect();
  const btnCenter = btnRect.top + btnRect.height / 2;
  callBtn.classList.toggle("dark", whiteTop <= btnCenter);
  menuBtn.classList.toggle("dark", whiteTop <= btnCenter);
}

// ---------- Анимации при прокрутке ----------
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.2 });

document.querySelectorAll(".reveal").forEach((node) => revealObserver.observe(node));

window.addEventListener("scroll", update, { passive: true });
window.addEventListener("resize", update);
document.fonts.ready.then(update);
update();
