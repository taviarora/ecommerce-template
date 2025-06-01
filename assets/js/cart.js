// assets/js/cart.js
import { auth, db } from './firebase-config.js';
import {
  collection,
  getDocs,
  setDoc,
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
          <p> 
            Quantity:
            <button class="decrease" data-id="${docSnap.id}">−</button>
            <span class="qty" id="qty-${docSnap.id}">${item.quantity}</span>
            <button class="increase" data-id="${docSnap.id}">+</button>
          </p>
          <button class="remove" data-id="${docSnap.id}">Remove</button>
          <button data-id="${docSnap.id}">Remove</button>
        `;

        const qtySpan = cartItem.querySelector(`#qty-${docSnap.id}`);

        cartItem.querySelector('.increase').addEventListener('click', async () => {
          const currentQty = Number(qtySpan.textContent);
          const newQty = currentQty + 1;

          try {
            await setDoc(doc(db, 'users', user.uid, 'cart', docSnap.id), {
              ...item,
              quantity: newQty
            });

            qtySpan.textContent = newQty;
            updateSummary(user.uid);
          } catch (err) {
            console.error("Error updating quantity:", err);
          }
        });


        cartItem.querySelector('.decrease').addEventListener('click', async () => {
          const currentQty = Number(qtySpan.textContent);
          if (currentQty > 1) {
            const newQty = currentQty - 1;

            try {
              await setDoc(doc(db, 'users', user.uid, 'cart', docSnap.id), {
                ...item,
                quantity: newQty
              });

              qtySpan.textContent = newQty;
              updateSummary(user.uid);
            } catch (err) {
              console.error("Error updating quantity:", err);
            }
          }
        });


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

      await updateSummary(user.uid);




    } catch (err) {
      console.error("Error loading cart:", err);
      cartItemsSection.innerHTML = `<p>Error loading cart.</p>`;
    }
  });
});

async function updateSummary(uid) {
  const cartRef = collection(db, 'users', uid, 'cart');
  const snapshot = await getDocs(cartRef);
  const items = [];
  let subtotal = 0;

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const price = Number(data.price ?? data.Price);
    const quantity = Number(data.quantity);
    items.push({ id: docSnap.id, name: data.name, price, quantity });
    subtotal += price * quantity;
  });

  displayCart(items, subtotal);
}


function displayCart(items, subtotal) {
  const subtotalEl = document.getElementById("subtotal");
  const taxEl = document.getElementById("tax");
  const totalEl = document.getElementById("total");

  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
  taxEl.textContent = `₹${tax.toFixed(2)}`;
  totalEl.textContent = `₹${total.toFixed(2)}`;
}


document.getElementById('checkout-btn').addEventListener('click', () => {
  window.location.href = 'checkout.html';
});
