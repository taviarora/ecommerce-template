import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { auth, db } from './firebase-config.js';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";


document.addEventListener('DOMContentLoaded', () => {
  const cartContainer = document.getElementById('cart-container');
  const subtotalElem = document.getElementById('subtotal');
  const taxElem = document.getElementById('tax');
  const totalElem = document.getElementById('total');
  const paymentMethod = document.getElementById('payment-method');
  const checkoutBtn = document.getElementById('checkout-btn');

  if (!checkoutBtn || !cartContainer || !subtotalElem) {
    console.error('DOM elements not found. Check your HTML.');
    return;
  }

  function formatCurrency(num) {
    // return `₹${num.toFixed(2)}`;
    return `₹${num}`;

  }


  function displayCart(items, total) {
    cartContainer.innerHTML = '';
    items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'cart-item';
      itemDiv.innerHTML = `
        <p><strong>${item.name}</strong> × ${item.quantity} — ${formatCurrency(item.price)} each</p>
        <p>Total: ${formatCurrency(item.price * item.quantity)}</p>
      `;
      cartContainer.appendChild(itemDiv);
    });

    const tax = total * 0.05;
    const finalTotal = total + tax;

    subtotalElem.innerText = formatCurrency(total);
    taxElem.innerText = formatCurrency(tax);
    totalElem.innerText = formatCurrency(finalTotal);
  }

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      checkoutBtn.disabled = true;
      checkoutBtn.innerText = 'Log in to checkout';
      return;
    }

    checkoutBtn.addEventListener('click', async () => {
      const cartRef = collection(db, 'users', user.uid, 'cart');
      const snapshot = await getDocs(cartRef);
      if (snapshot.empty) {
        return alert('Your cart is empty.');
      }

      const items = [];
      let subtotal = 0;
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const price = data.price ?? data.Price;
        items.push({
          id: docSnap.id,
          name: data.name,
          price,
          quantity: data.quantity
        });
        subtotal += price * data.quantity;
      });

      displayCart(items, subtotal); // Update UI again if needed

      const tax = subtotal * 0.05;
      const total = subtotal + tax;
      const payment = paymentMethod.value;

      try {
        await addDoc(collection(db, 'orders'), {
          userId: user.uid,
          items,
          subtotal,
          tax,
          total,
          paymentMethod: payment,
          createdAt: Timestamp.now()
        });

        const deletes = snapshot.docs.map(docSnap =>
          deleteDoc(doc(db, 'users', user.uid, 'cart', docSnap.id))
        );

        // Build order summary using existing variable names
        const orderSummary = items.map(item =>
          `${item.name} × ${item.quantity} — ₹${item.price * item.quantity}`
        ).join('\n');

        const paymentInfo = `Subtotal: ₹${subtotal}\nTax: ₹${tax}\nTotal: ₹${total}\nPayment Method: ${payment}`;

        // 1. Send email to user
        const userEmailData = {
          user_email: "malikaarora2202@gmail.com", // change to user.email in production
          product_name: "Order Confirmation:\n" + orderSummary,
          query: paymentInfo
        };

        console.log("Attempting to send user confirmation email with data:", userEmailData);

        emailjs.send("service_jitwsrj", "template_8wpg95p", userEmailData)
          .then((response) => {
            console.log("✅ Confirmation email sent to user successfully.");
            console.log("EmailJS response:", response.status, response.text);
          })
          .catch((err) => {
            console.error("❌ Failed to send confirmation email to user.");
            console.error("Error object:", err);
            if (err?.status) console.error("Status code:", err.status);
            if (err?.text) console.error("Error text:", err.text);
            if (err?.stack) console.error("Stack trace:", err.stack);
          });


        // 2. Send email to store owner (e.g., your business email)
        emailjs.send("service_jitwsrj", "template_8wpg95p", {
          user_email: "malikaarora2202@gmail.com", // Replace with your actual store email
          product_name: `New Order by ${user.email}:\n` + orderSummary,
          query: paymentInfo
        })
          .then(() => console.log("Order alert email sent to owner."))
          .catch((err) => console.error("Owner email send error:", err));

        await Promise.all(deletes);


        // window.location.href = 'thankyou.html';
      } catch (err) {
        console.error('Checkout error:', err);
        alert('There was a problem placing your order.');
      }
    });

    // // Initial cart rendering
    // (async () => {
    //   const cartRef = collection(db, 'users', user.uid, 'cart');
    //   const snapshot = await getDocs(cartRef);
    //   const items = [];
    //   let subtotal = 0;
    //   snapshot.forEach(docSnap => {
    //     const data = docSnap.data();
    //     const price = Number(data.price ?? data.Price);
    //     const quantity = Number(data.quantity);
    //     items.push({
    //       id: docSnap.id,
    //       name: data.name,
    //       price,
    //       quantity
    //     });
    //     subtotal += price * quantity;
    //   });

    //   displayCart(items, subtotal);
    // })();

    (async () => {
      const cartRef = collection(db, 'users', user.uid, 'cart');
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
      displayCart(items, subtotal); // Updates cart + ₹subtotal/tax/total
    })();

  });
});
