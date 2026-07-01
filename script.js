function getYouTubeId(url) {
  const match = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `TC ${y}.${m}.${day}`;
}

function createCard(item) {
  const videoId = getYouTubeId(item.youtubeUrl);
  const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";

  const card = document.createElement("div");
  card.className = "card";

  const videoWrap = document.createElement("div");
  videoWrap.className = "video-wrap";
  videoWrap.innerHTML = `
    <img src="${thumbUrl}" alt="${item.title}のサムネイル" loading="lazy">
    <div class="play-icon"></div>
  `;
  videoWrap.addEventListener("click", () => {
    if (!videoId) return;
    videoWrap.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" title="${item.title}" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  });

  const body = document.createElement("div");
  body.className = "card-body";
  body.innerHTML = `
    <span class="category-tag">${item.category}</span>
    <h2>${item.title}</h2>
    <span class="meta">${formatDate(item.date)}</span>
    <p class="intent">${item.intent}</p>
  `;

  card.appendChild(videoWrap);
  card.appendChild(body);
  return card;
}

function sortItems(items, mode) {
  const sorted = [...items];
  switch (mode) {
    case "date-asc":
      sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case "title-asc":
      sorted.sort((a, b) => a.title.localeCompare(b.title, "ja"));
      break;
    case "category":
      sorted.sort((a, b) => a.category.localeCompare(b.category, "ja"));
      break;
    case "date-desc":
    default:
      sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  return sorted;
}

function render(items) {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";
  items.forEach((item) => gallery.appendChild(createCard(item)));
}

function applyFilters(items, activeType, sortMode) {
  const filtered = activeType === "all"
    ? items
    : items.filter((item) => item.type === activeType);
  return sortItems(filtered, sortMode);
}

async function init() {
  const res = await fetch("data.json");
  const items = await res.json();
  const select = document.getElementById("sort-select");
  const tabs = document.querySelectorAll("#type-tabs .tab-btn");
  let activeType = "all";

  const update = () => render(applyFilters(items, activeType, select.value));

  update();

  select.addEventListener("change", update);

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      activeType = tab.dataset.type;
      update();
    });
  });
}

init();
