import { auth } from "../global.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

export function requireAuth(redirectTo = "/auth/") {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user);
      } else {
        window.location.href = redirectTo;
        reject(new Error("Not authenticated"));
      }
    });
  });
}
