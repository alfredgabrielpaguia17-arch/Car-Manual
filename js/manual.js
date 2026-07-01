import { db, seedData, collection, doc, getDoc, getDocs, query, where } from "./firebase.js";

const brandTitle = document.getElementById("brand-title");
const brandDescription = document.getElementById("brand-description");
const modelGrid = document.getElementById("model-grid");
const modelTitle = document.getElementById("model-title");
const modelDescription = document.getElementById("model-description");
const fuelTypeEl = document.getElementById("fuel-type");
const engineEl = document.getElementById("engine");
const transmissionEl = document.getElementById("transmission");
const maintenanceScheduleEl = document.getElementById("maintenance-schedule");
const commonProblemsEl = document.getElementById("common-problems");
const modelImage = document.getElementById("model-image");
const troubleshootingLink = document.getElementById("troubleshooting-link");
const maintenanceLink = document.getElementById("maintenance-link");
const manualTitle = document.getElementById("manual-title");
const manualContent = document.getElementById("manual-content");
const logoutButton = document.getElementById("logout-button");
const breadcrumbs = document.querySelector(".breadcrumbs");

function getQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

function getSessionUser() {
  try {
    return JSON.parse(localStorage.getItem("aaUser"));
  } catch {
    return null;
  }
}

function ensureSession() {
  const currentUser = getSessionUser();
  if (!currentUser) {
    window.location.href = "login.html";
    return null;
  }
  return currentUser;
}

function attachLogout() {
  if (!logoutButton) return;
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("aaUser");
    window.location.href = "login.html";
  });
}

function renderBreadcrumbs(items) {
  if (!breadcrumbs) return;
  breadcrumbs.innerHTML = items
    .map((item, index) => {
      if (item.href) {
        return `<a href="${item.href}">${item.label}</a>`;
      }
      return `<span>${item.label}</span>`;
    })
    .join("");
}

function renderBrandPage(brand, models) {
  if (brandTitle) brandTitle.textContent = `${brand.name} Manuals`;
  if (brandDescription) brandDescription.textContent = brand.description;
  renderBreadcrumbs([
    { href: "dashboard.html", label: "Dashboard" },
    { label: brand.name },
  ]);

  const brandTipsContainer = document.getElementById("brand-tips");
  if (brandTipsContainer) {
    brandTipsContainer.innerHTML = `
      <div class="brand-tip-block">
        <h3>Basic Maintenance</h3>
        <ul>${(brand.maintenanceTips || []).map((tip) => `<li>${tip}</li>`).join("")}</ul>
      </div>
      <div class="brand-tip-block">
        <h3>Basic Repairs</h3>
        <ul>${(brand.repairTips || []).map((tip) => `<li>${tip}</li>`).join("")}</ul>
      </div>
    `;
  }

  if (!modelGrid) return;
  modelGrid.innerHTML = "";
  models.forEach((model) => {
    const card = document.createElement("article");
    card.className = "model-card";
    card.innerHTML = `
      <div class="brand-logo">${model.name.charAt(0)}</div>
      <h3>${model.name}</h3>
      <p>Body Style: ${model.bodyType || "Unknown"}</p>
      <p>Fuel Type: ${model.fuelType}</p>
      <div class="model-actions">
        <a class="btn outline" href="model.html?modelId=${model.id}">Model Details</a>
        <a class="btn primary-btn" href="troubleshooting.html?modelId=${model.id}">Troubleshooting</a>
        <a class="btn secondary" href="maintenance.html?modelId=${model.id}">Maintenance</a>
      </div>
    `;
    modelGrid.appendChild(card);
  });
}

function renderModelPage(model) {
  if (modelTitle) modelTitle.textContent = model.name;
  if (modelDescription) modelDescription.textContent = model.description || "Detailed model information is available here.";
  if (fuelTypeEl) fuelTypeEl.textContent = model.fuelType;
  if (engineEl) engineEl.textContent = model.engine;
  if (transmissionEl) transmissionEl.textContent = model.transmission;
  if (modelImage) modelImage.textContent = model.image || model.name;
  if (maintenanceScheduleEl) maintenanceScheduleEl.textContent = model.maintenanceNote || `Recommended maintenance is based on mileage and manufacturer intervals for the ${model.name}.`;
  if (commonProblemsEl) commonProblemsEl.textContent = model.commonIssues || `Common problems include battery concerns, engine overheating, brake noise, and tire wear for the ${model.name}.`;
  if (troubleshootingLink) troubleshootingLink.href = `troubleshooting.html?modelId=${model.id}`;
  if (maintenanceLink) maintenanceLink.href = `maintenance.html?modelId=${model.id}`;
  renderBreadcrumbs([
    { href: "dashboard.html", label: "Dashboard" },
    { href: `brand.html?brandId=${model.brandId}`, label: model.brandId.charAt(0).toUpperCase() + model.brandId.slice(1) },
    { label: model.name },
  ]);
}

function renderManualSections(manual, model, type) {
  if (!manualContent) return;
  const title = type === "maintenance" ? "Maintenance Guide" : "Basic Troubleshooting";
  if (manualTitle) manualTitle.textContent = `${title} · ${model.name}`;
  renderBreadcrumbs([
    { href: "dashboard.html", label: "Dashboard" },
    { href: `brand.html?brandId=${model.brandId}`, label: model.brandId.charAt(0).toUpperCase() + model.brandId.slice(1) },
    { href: `model.html?modelId=${model.id}`, label: model.name },
    { label: title },
  ]);
  manualContent.innerHTML = "";
  if (!manual || !manual.sections || manual.sections.length === 0) {
    manualContent.innerHTML = `<div class="alert">Manual content is unavailable for this model.</div>`;
    return;
  }

  manual.sections.forEach((section) => {
    const card = document.createElement("article");
    card.className = "manual-card";
    card.innerHTML = `
      <h3>${section.title}</h3>
      <p>${section.description || "Follow these steps to complete the task."}</p>
      <ol>
        ${section.steps.map((step) => `<li>${step}</li>`).join("")}
      </ol>
    `;
    manualContent.appendChild(card);
  });
}

async function loadBrandPage() {
  const brandId = getQueryParam("brandId");
  if (!brandId) {
    window.location.href = "dashboard.html";
    return;
  }
  const brandDoc = await getDoc(doc(db, "brands", brandId));
  if (!brandDoc.exists()) {
    brandTitle.textContent = "Brand not found";
    brandDescription.textContent = "Please select a valid brand from the dashboard.";
    return;
  }

  const modelsQuery = query(collection(db, "models"), where("brandId", "==", brandId));
  const modelsSnapshot = await getDocs(modelsQuery);
  const models = modelsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  renderBrandPage({ id: brandDoc.id, ...brandDoc.data() }, models);
}

async function loadModelPage() {
  const modelId = getQueryParam("modelId");
  if (!modelId) {
    window.location.href = "dashboard.html";
    return;
  }
  const modelDoc = await getDoc(doc(db, "models", modelId));
  if (!modelDoc.exists()) {
    modelTitle.textContent = "Model not found";
    return;
  }
  renderModelPage({ id: modelDoc.id, ...modelDoc.data() });
}

async function loadManualPage(type) {
  const modelId = getQueryParam("modelId");
  if (!modelId) {
    window.location.href = "dashboard.html";
    return;
  }
  const modelDoc = await getDoc(doc(db, "models", modelId));
  if (!modelDoc.exists()) {
    manualTitle.textContent = "Model not found";
    manualContent.innerHTML = `<div class="alert">Unable to load manual. Please return to the dashboard.</div>`;
    return;
  }
  const model = { id: modelDoc.id, ...modelDoc.data() };
  const manualId = `${modelId}-${type}`;
  const manualDoc = await getDoc(doc(db, "manuals", manualId));
  if (!manualDoc.exists()) {
    manualContent.innerHTML = `<div class="alert">This manual is not available yet.</div>`;
    return;
  }
  renderManualSections({ id: manualDoc.id, ...manualDoc.data() }, model, type);
}

window.addEventListener("DOMContentLoaded", async () => {
  const user = ensureSession();
  if (!user) return;
  attachLogout();
  await seedData();
  if (window.location.pathname.includes("brand.html")) {
    await loadBrandPage();
  } else if (window.location.pathname.includes("model.html")) {
    await loadModelPage();
  } else if (window.location.pathname.includes("troubleshooting.html")) {
    await loadManualPage("troubleshooting");
  } else if (window.location.pathname.includes("maintenance.html")) {
    await loadManualPage("maintenance");
  }
});
