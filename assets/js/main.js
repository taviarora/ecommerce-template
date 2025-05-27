import { db } from "./firebase-config.js"; // Ensure db is correctly initialized

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
    const querySnapshot = await getDocs(collection(db, 'products'));
    querySnapshot.forEach((doc) => {
      console.log("Product ID:", doc);
      const product = doc.data();
      console.log("Product data:", product);
      const productCard = document.createElement('div');
      productCard.classList.add('product-card');
      productCard.innerHTML = `
  <div class="product-images">
    ${product.images
      .map(
        (image) =>
          `<img src="${image}" alt="${product.name}" class="product-image" />`
      )
      .join('')}
  </div>
  <h3>${product.name}</h3>
  <p>${product.description}</p>
  <p>Price: $${product.price}</p>
  <button onclick="addToCart('${doc.id}', '${encodeURIComponent(
        JSON.stringify(product)
      )}')">Add to Cart</button>
  <div class="query-section">
    <input type="text" id="query-${doc.id}" placeholder="Ask a question..." />
    <button onclick="raiseQuery('${doc.id}', '${encodeURIComponent(product.name)}')">Raise a Query</button>
  </div>
`;

      productList.appendChild(productCard);
    });
  } catch (error) {
    console.error("Error fetching products:", error);
  }
});

async function addToCart(productId, productData) {

  productData = JSON.parse(decodeURIComponent(productData));
  console.log("Adding to cart:", productId, productData);

  const user = auth.currentUser;
  if (!user) return alert("Please login first");

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

  alert("Added to cart!");
}

async function raiseQuery(productId, productNameEncoded) {
  const user = auth.currentUser;
  if (!user) return alert("Please login first");

  const productName = decodeURIComponent(productNameEncoded);
  const queryInput = document.getElementById(`query-${productId}`);
  const queryText = queryInput.value.trim();

  if (!queryText) {
    return alert("Please enter a query.");
  }

  // Example: sending via EmailJS
  // Requires initializing EmailJS on your page and creating a service/template
  emailjs.send("service_jitwsrj", "template_8wpg95p", {
    user_email: user.email,
    product_name: productName,
    query: queryText
  })
  .then(function () {
    alert("Query sent successfully!");
    queryInput.value = ""; // Clear input
  }, function (error) {
    console.error("Email send error:", error);
    alert("Failed to send query. Please try again.");
  });
}

// Attach addToCart to the global window object
window.addToCart = addToCart;
// Attach raiseQuery to the global window object
window.raiseQuery = raiseQuery;
