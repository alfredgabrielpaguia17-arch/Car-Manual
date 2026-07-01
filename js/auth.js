import { db, collection, query, where, getDocs, setDoc, doc, serverTimestamp } from "./firebase.js";

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const authMessage = document.getElementById("auth-message");

function showMessage(message, isError = false) {
  if (!authMessage) return;
  authMessage.textContent = message;
  authMessage.style.color = isError ? "#F87171" : "#34D399";
}

async function usernameExists(username) {
  const q = query(collection(db, "users"), where("username", "==", username.toLowerCase()));
  const result = await getDocs(q);
  return !result.empty;
}

async function emailExists(email) {
  const q = query(collection(db, "users"), where("email", "==", email.toLowerCase()));
  const result = await getDocs(q);
  return !result.empty;
}

async function findUserByIdentifier(identifier) {
  const normalized = identifier.trim().toLowerCase();
  let q = query(collection(db, "users"), where("username", "==", normalized));
  let result = await getDocs(q);
  if (!result.empty) return result.docs[0];
  q = query(collection(db, "users"), where("email", "==", normalized));
  result = await getDocs(q);
  if (!result.empty) return result.docs[0];
  return null;
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function saveSession(userDoc) {
  const userData = userDoc && typeof userDoc.data === "function"
    ? {
        id: userDoc.id,
        fullname: userDoc.data().fullname,
        username: userDoc.data().username,
        email: userDoc.data().email,
      }
    : userDoc
    ? {
        id: userDoc.id,
        fullname: userDoc.fullname,
        username: userDoc.username,
        email: userDoc.email,
      }
    : null;

  if (!userData) return;
  localStorage.setItem("aaUser", JSON.stringify(userData));
}

if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const fullname = document.getElementById("fullName").value.trim();
    const username = document.getElementById("username").value.trim().toLowerCase();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!fullname || !username || !email || !password || !confirmPassword) {
      showMessage("All fields are required.", true);
      return;
    }

    if (password !== confirmPassword) {
      showMessage("Passwords do not match.", true);
      return;
    }

    try {
      if (await usernameExists(username)) {
        showMessage("That username is already in use.", true);
        return;
      }
      if (await emailExists(email)) {
        showMessage("That email is already in use.", true);
        return;
      }

      const hashedPassword = await hashPassword(password);
      const userRef = doc(collection(db, "users"));
      await setDoc(userRef, {
        fullname,
        username,
        email,
        password: hashedPassword,
        createdAt: serverTimestamp(),
      });

      saveSession({
        id: userRef.id,
        fullname,
        username,
        email,
      });
      showMessage("Account created successfully. Redirecting to dashboard...");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1200);
    } catch (error) {
      showMessage(error.message || "Unable to register user.", true);
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const identifier = document.getElementById("identifier").value.trim();
    const password = document.getElementById("password").value;

    if (!identifier || !password) {
      showMessage("Username/email and password are required.", true);
      return;
    }

    try {
      const userDoc = await findUserByIdentifier(identifier);
      if (!userDoc) {
        showMessage("Invalid username/email or password.", true);
        return;
      }
      const storedPassword = userDoc.data().password;
      const hashedPassword = await hashPassword(password);
      const passwordMatch = storedPassword === hashedPassword || storedPassword === password;

      if (!passwordMatch) {
        showMessage("Invalid username/email or password.", true);
        return;
      }

      if (storedPassword === password) {
        const userRef = doc(db, "users", userDoc.id);
        await setDoc(userRef, {
          ...userDoc.data(),
          password: hashedPassword,
        });
      }

      saveSession(userDoc);
      showMessage("Login successful. Redirecting...");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 800);
    } catch (error) {
      showMessage(error.message || "Unable to login.", true);
    }
  });
}

export { showMessage };
