import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

import { auth } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async function () {
  const productList = document.getElementById('product-list');

  try {
    showLoader();
    const querySnapshot = await getDocs(collection(db, 'products'));
    querySnapshot.forEach((docSnap) => {
      const product = docSnap.data();
      const productCard = document.createElement('div');
      productCard.classList.add('product-card');

      productCard.innerHTML = `
        <div class="product-images">
          ${product.images && product.images.length
          ? product.images.map((img) =>
            `<img src="../assets/images/${product.name}.png" alt="${product.name}" class="product-image" />`
          ).join('')
          : `<img src="../assets/images/${product.name}.png" alt="${product.name}" class="product-image" />`}
        </div>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <p>Price: ₹${product.price}</p>
        <button class="add-to-cart-button" onclick="addToCart('${docSnap.id}', '${encodeURIComponent(JSON.stringify(product))}')">Add to Cart</button>
        <div class="query-section">
          <input type="text" id="query-${docSnap.id}" placeholder="Ask a question..." />
          <button onclick="raiseQuery('${docSnap.id}', '${encodeURIComponent(product.name)}')">Raise a Query</button>
        </div>
      `;

      productList.appendChild(productCard);
    });
    hideLoader();
  } catch (error) {
    hideLoader();
    console.error("Error fetching products:", error);
  }

  // ✅ Carousel logic moved inside DOMContentLoaded
  let currentIndex = 0;
  const images = document.querySelectorAll('.carousel-image');

  if (images.length > 0) {
    images[currentIndex].classList.add('active');
    setInterval(() => {
      images[currentIndex].classList.remove('active');
      currentIndex = (currentIndex + 1) % images.length;
      images[currentIndex].classList.add('active');
    }, 3000);
  }
});

async function addToCart(productId, productData) {
  productData = JSON.parse(decodeURIComponent(productData));
  const user = auth.currentUser;
  if (!user) return showToast("Please login first", "error");

  try {
    showLoader();
    const cartRef = doc(db, "users", user.uid, "cart", productId);
    const existing = await getDoc(cartRef);

    if (existing.exists()) {
      await setDoc(cartRef, {
        ...productData,
        quantity: existing.data().quantity + 1
      });
    } else {
      await setDoc(cartRef, {
        ...productData,
        quantity: 1
      });
    }

    showToast("Added to cart!", "success");
  } catch (err) {
    showToast("Failed to add to cart.", "error");
    console.error(err);
  } finally {
    hideLoader();
  }
}

async function raiseQuery(productId, productNameEncoded) {
  const user = auth.currentUser;
  if (!user) return alert("Please login first");

  const productName = decodeURIComponent(productNameEncoded);
  const queryInput = document.getElementById(`query-${productId}`);
  const queryText = queryInput.value.trim();

  if (!queryText) return alert("Please enter a query.");

  try {
    showLoader();

    await emailjs.send("service_jitwsrj", "template_8wpg95p", {
      user_email: user.email,
      product_name: productName,
      query: queryText
    });

    alert("Query sent successfully!");
    queryInput.value = "";
  } catch (error) {
    console.error("Email send error:", error);
    alert("Failed to send query. Please try again.");
  } finally {
    hideLoader();
  }
}

function showLoader() {
  document.getElementById('loader').classList.remove('hidden');
}

function hideLoader() {
  document.getElementById('loader').classList.add('hidden');
}

function showToast(message, type = "success") {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000); // Toast disappears after 3s
}

window.addToCart = addToCart;
window.raiseQuery = raiseQuery;
