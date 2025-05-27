// login.js
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { auth } from './firebase-config.js';  // ✅ import the already-initialized auth

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("login-btn").addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        alert("Login successful!");
        window.location.href = "index.html";
      })
      .catch((error) => {
        alert("Login failed: " + error.message);
      });
  });

  document.getElementById("signup-btn").addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        alert("Signup successful!");
        window.location.href = "index.html";
      })
      .catch((error) => {
        alert("Signup failed: " + error.message);
      });
  });
});
