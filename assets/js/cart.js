// assets/js/cart.js
import { auth, db } from './firebase-config.js';
import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
  const cartItemsSection = document.getElementById('cart-items');

  // Wait for Firebase Auth to initialize and give us the current user
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      cartItemsSection.innerHTML = `<p>Please log in to view your cart.</p>`;
      return;
    }

    // User is signed in—now fetch their cart
    try {
      const cartRef = collection(db, 'users', user.uid, 'cart');
      const snapshot = await getDocs(cartRef);

      if (snapshot.empty) {
        cartItemsSection.innerHTML = `<p>Your cart is empty.</p>`;
        return;
      }

      // Clear any placeholder text
      cartItemsSection.innerHTML = '';

      snapshot.forEach(docSnap => {
        const item = docSnap.data();
        const price = item.price ?? item.Price; // handle either field name
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <p>Price: $${price}</p>
          <p>Quantity: ${item.quantity}</p>
          <button data-id="${docSnap.id}">Remove</button>
        `;
        // attach remove handler
        cartItem.querySelector('button').addEventListener('click', async () => {
          await deleteDoc(doc(db, 'users', user.uid, 'cart', docSnap.id));
          cartItem.remove();
          if (!cartItemsSection.children.length) {
            cartItemsSection.innerHTML = `<p>Your cart is empty.</p>`;
          }
        });
        cartItemsSection.appendChild(cartItem);
      });
    } catch (err) {
      console.error("Error loading cart:", err);
      cartItemsSection.innerHTML = `<p>Error loading cart.</p>`;
    }
  });
});
