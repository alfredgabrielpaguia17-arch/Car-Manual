import { db, collection, getDocs, query, where } from "./firebase.js";

async function fetchSearchData() {
  const [brandSnapshot, modelSnapshot, manualSnapshot] = await Promise.all([
    getDocs(collection(db, "brands")),
    getDocs(collection(db, "models")),
    getDocs(collection(db, "manuals")),
  ]);

  const brands = brandSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const models = modelSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const manuals = manualSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return { brands, models, manuals };
}

function normalizeText(text) {
  return String(text || "").toLowerCase();
}

function buildResultLink(item) {
  if (item.type === "brand") {
    return `./brand.html?brandId=${item.id}`;
  }
  if (item.type === "model") {
    return `./model.html?modelId=${item.id}`;
  }
  if (item.type === "manual") {
    return item.manualType === "maintenance"
      ? `./maintenance.html?modelId=${item.modelId}`
      : `./troubleshooting.html?modelId=${item.modelId}`;
  }
  return "./dashboard.html";
}

export async function searchDocuments(queryText) {
  const normalized = normalizeText(queryText);
  if (!normalized) return [];
  const { brands, models, manuals } = await fetchSearchData();
  const results = [];

  brands.forEach((brand) => {
    if (normalizeText(brand.name).includes(normalized) || normalizeText(brand.description).includes(normalized)) {
      results.push({ type: "brand", id: brand.id, title: brand.name, subtitle: brand.description });
    }
  });

  models.forEach((model) => {
    if (normalizeText(model.name).includes(normalized) || normalizeText(model.brandId).includes(normalized)) {
      results.push({ type: "model", id: model.id, title: model.name, subtitle: `${model.brandId} model`, brandId: model.brandId });
    }
  });

  manuals.forEach((manual) => {
    const titleSearch = normalizeText(manual.title);
    const sectionText = normalizeText((manual.sections || []).map((section) => section.title + " " + section.steps.join(" ")).join(" "));
    if (titleSearch.includes(normalized) || sectionText.includes(normalized)) {
      results.push({
        type: "manual",
        id: manual.id,
        title: `${manual.title} · ${manual.modelId}`,
        subtitle: manual.type === "maintenance" ? "Maintenance topic" : "Troubleshooting guide",
        manualType: manual.type,
        modelId: manual.modelId,
      });
    }
  });

  return results;
}

export function renderSearchResults(items, targetElement) {
  if (!targetElement) return;
  targetElement.innerHTML = "";
  if (items.length === 0) {
    targetElement.innerHTML = `<div class=alert>No matching results found. Try another keyword.</div>`;
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "cards-grid";
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "result-card";
    card.innerHTML = `
      <div class="brand-logo">${item.type === "brand" ? "🏁" : item.type === "model" ? "🚗" : "🛠️"}</div>
      <h3>${item.title}</h3>
      <p>${item.subtitle}</p>
      <a class="btn primary-btn" href="${buildResultLink(item)}">View</a>
    `;
    wrapper.appendChild(card);
  });
  targetElement.appendChild(wrapper);
}
