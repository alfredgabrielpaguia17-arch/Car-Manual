import { db, seedData, collection, getDocs } from "./firebase.js";
import { searchDocuments, renderSearchResults } from "./search.js";

const brandGrid = document.getElementById("brand-grid");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");
const logoutButton = document.getElementById("logout-button");
const userBadge = document.getElementById("user-badge");

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

function renderBrandCards(brands) {
  if (!brandGrid) return;
  brandGrid.innerHTML = "";
  brands.forEach((brand) => {
    const card = document.createElement("article");
    card.className = "brand-card";
    card.innerHTML = `
      <div class="brand-logo">${brand.name.charAt(0)}</div>
      <h3>${brand.name}</h3>
      <p>${brand.description}</p>
      <a class="btn outline" href="./brand.html?brandId=${brand.id}">View Manuals</a>
    `;
    brandGrid.appendChild(card);
  });
}

async function loadBrandData() {
  const brandsSnapshot = await getDocs(collection(db, "brands"));
  const brands = brandsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  renderBrandCards(brands);
}

async function handleSearch(event) {
  event.preventDefault();
  const queryText = searchInput.value.trim();
  if (!queryText) {
    searchResults.innerHTML = `<div class=alert>Enter a brand, model, problem, or maintenance topic.</div>`;
    return;
  }
  searchResults.innerHTML = `<div class="loader"><div class="spinner"></div></div>`;
  const results = await searchDocuments(queryText);
  renderSearchResults(results, searchResults);
}

function attachLogout() {
  if (!logoutButton) return;
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("aaUser");
    window.location.href = "login.html";
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  const user = ensureSession();
  if (!user) return;
  if (userBadge) {
    userBadge.textContent = `Welcome, ${user.fullname}`;
  }
  attachLogout();
  await seedData();
  await loadBrandData();
  if (searchForm) {
    searchForm.addEventListener("submit", handleSearch);
  }
});
