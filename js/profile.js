const nameField = document.getElementById("profile-name");
const emailField = document.getElementById("profile-email");
const dateField = document.getElementById("profile-date");
const logoutButton = document.getElementById("logout-button");

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

function loadProfile() {
  const user = ensureSession();
  if (!user) return;
  if (nameField) nameField.textContent = user.fullname;
  if (emailField) emailField.textContent = `Email: ${user.email}`;
  if (dateField) dateField.textContent = `Username: ${user.username}`;
}

window.addEventListener("DOMContentLoaded", () => {
  attachLogout();
  loadProfile();
});
