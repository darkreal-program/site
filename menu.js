// Страница меню: выбранное блюдо сверху и лента карточек под ним
const menuTabs = document.getElementById("menuTabs");
const dish = document.getElementById("dish");
const dishImg = document.getElementById("dishImg");
const dishName = document.getElementById("dishName");
const dishDesc = document.getElementById("dishDesc");
const dishPrice = document.getElementById("dishPrice");
const dishStage = document.getElementById("dishStage");
const dishPrev = document.getElementById("dishPrev");
const dishNext = document.getElementById("dishNext");
const flowTrack = document.getElementById("flowTrack");
const flowPrev = document.getElementById("flowPrev");
const flowNext = document.getElementById("flowNext");

const groups = Object.entries(MENU);
const VISIBLE_SIDE = 4; // сколько карточек видно с каждой стороны

let groupIndex = 0;
let current = 0;
let cards = [];

function setImage(node, url) {
  node.classList.toggle("placeholder", !url);
  node.style.backgroundImage = url ? `url("${url}")` : "";
}

// Блюда без фото — в конец группы; пустая группа показывает одну карточку-заглушку
function groupItems() {
  const items = groups[groupIndex][1];
  if (!items.length) return [{ name: "Скоро здесь появятся блюда", desc: "" }];
  return [...items.filter((item) => item.img), ...items.filter((item) => !item.img)];
}

function renderTabs() {
  groups.forEach(([name], i) => {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "menu-tab";
    tab.textContent = name;
    tab.addEventListener("click", () => selectGroup(i));
    menuTabs.appendChild(tab);
  });
}

function selectGroup(i) {
  groupIndex = i;
  current = 0;
  [...menuTabs.children].forEach((tab, j) => tab.classList.toggle("active", j === i));

  flowTrack.innerHTML = "";
  cards = groupItems().map((item, j) => {
    const card = document.createElement("div");
    card.className = "flow-card";
    setImage(card, item.img);
    card.addEventListener("click", () => select(j));
    flowTrack.appendChild(card);
    return card;
  });
  select(0, true);
}

function showDish(item) {
  setImage(dishImg, item.img);
  // Пометка в скобках, например «(блюдо от шефа)», не разрывается:
  // если не помещается в строку, целиком переносится на следующую
  const match = item.name.match(/^(.*?)\s*(\([^)]*\))$/);
  dishName.textContent = match ? match[1] + " " : item.name;
  if (match) {
    const note = document.createElement("span");
    note.className = "dish-note";
    note.textContent = match[2];
    dishName.appendChild(note);
  }
  dishDesc.textContent = item.desc || "";
  dishPrice.textContent = item.price ? `${item.price} ₽` : "";
}

function select(i, instant = false) {
  const items = groupItems();
  current = Math.max(0, Math.min(i, items.length - 1));

  // Плавная смена блюда сверху
  if (instant) {
    showDish(items[current]);
  } else {
    dish.classList.add("fading");
    setTimeout(() => {
      showDish(items[current]);
      dish.classList.remove("fading");
    }, 250);
  }

  showSides(items);
  layoutFlow();
  flowPrev.disabled = current === 0;
  flowNext.disabled = current === items.length - 1;
}

// Соседние блюда по бокам от основного (видны только на телефоне)
function showSides(items) {
  [[dishPrev, items[current - 1]], [dishNext, items[current + 1]]].forEach(([node, item]) => {
    node.classList.toggle("empty", !item);
    if (item) setImage(node, item.img);
  });
}

dishPrev.addEventListener("click", () => select(current - 1));
dishNext.addEventListener("click", () => select(current + 1));

// Чем дальше от центра — тем сильнее карточки заходят друг на друга,
// мельче, прозрачнее и размытее (уходят в туман)
function layoutFlow() {
  const cardW = cards[0] ? cards[0].offsetWidth : 190;
  const step = cardW * 0.8;

  cards.forEach((card, i) => {
    const offset = i - current;
    const dist = Math.abs(offset);
    const dir = Math.sign(offset);

    let x = 0;
    for (let k = 0; k < dist; k++) x += step * Math.pow(0.6, k);

    const scale = Math.max(1 - dist * 0.14, 0.4);
    card.style.transform = `translate(-50%, -50%) translateX(${dir * x}px) scale(${scale})`;
    card.style.zIndex = 100 - dist;
    card.style.opacity = dist > VISIBLE_SIDE ? 0 : 1 - dist * 0.18;
    card.style.filter = dist ? `blur(${dist * 1.2}px) grayscale(${Math.min(dist * 0.25, 1)})` : "none";
    card.style.pointerEvents = dist > VISIBLE_SIDE ? "none" : "auto";
    card.classList.toggle("current", dist === 0);
  });
}

flowPrev.addEventListener("click", () => select(current - 1));
flowNext.addEventListener("click", () => select(current + 1));

// Свайп на телефоне
let touchX = null;
[flowTrack, dishStage].forEach((area) => {
  area.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  area.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) select(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") select(current - 1);
  if (e.key === "ArrowRight") select(current + 1);
});
window.addEventListener("resize", layoutFlow);

renderTabs();
selectGroup(0);
