// assets/js/checkout.js
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
  const checkoutBtn = document.getElementById('checkout-btn');

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      checkoutBtn.disabled = true;
      checkoutBtn.innerText = 'Log in to checkout';
      return;
    }

    checkoutBtn.addEventListener('click', async () => {
      // 1. Fetch cart items
      const cartRef = collection(db, 'users', user.uid, 'cart');
      const snapshot = await getDocs(cartRef);
      if (snapshot.empty) {
        return alert('Your cart is empty.');
      }

      const items = [];
      let total = 0;
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const price = data.price ?? data.Price;
        items.push({
          id: docSnap.id,
          name: data.name,
          price,
          quantity: data.quantity
        });
        total += price * data.quantity;
      });

      // 2. Create order document
      try {
        await addDoc(collection(db, 'orders'), {
          userId: user.uid,
          items,
          total,
          createdAt: Timestamp.now()
        });

        // 3. Clear the cart
        const deletes = snapshot.docs.map(docSnap => {
          return deleteDoc(doc(db, 'users', user.uid, 'cart', docSnap.id));
        });
        await Promise.all(deletes);

        alert('Order placed successfully! Thank you for shopping.');
        // 4. Optionally redirect to a “Thank you” page
        window.location.href = 'thankyou.html';
      } catch (err) {
        console.error('Checkout error:', err);
        alert('There was a problem placing your order.');
      }
    });
  });
});
