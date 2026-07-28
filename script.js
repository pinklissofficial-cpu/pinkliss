const PRODUCTS = {
    "Strawberry 🍓 Pink Lipstick": { name: "Strawberry 🍓 Pink Lipstick", price: 265 },
    "Unbox the Glow": { name: "Unbox the Glow", price: 499 },
    "Glow Starts in the Shower ✨🩷": { name: "Glow Starts in the Shower ✨🩷", price: 365 },
    "Chocolate Vibes. Soft Lips. 🤎": { name: "Chocolate Vibes. Soft Lips. 🤎", price: 285 }
  };

  const STORAGE_KEY = "pinkliss_cart_v1";

  const navToggle = document.querySelector(".nav-toggle");
  const primaryNav = document.querySelector(".primary-nav");
  const addToCartButtons = document.querySelectorAll(".add-to-cart");
  const cartItemsEl = document.getElementById("cart-items");
  const cartCountEl = document.getElementById("cart-count");
  const cartTotalEl = document.getElementById("cart-total");
  const checkoutForm = document.querySelector(".checkout-form");

  let cart = loadCart();

  function loadCart() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter(item => PRODUCTS[item.name]) : [];
    } catch {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  function formatCurrency(value) {
    return `₹${value.toLocaleString("en-IN")}`;
  }

  function getCartCount() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function getCartTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  function addToCart(productName) {
    const product = PRODUCTS[productName];
    if (!product) return;

    const existing = cart.find(item => item.name === productName);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ name: product.name, price: product.price, quantity: 1 });
    }

    saveCart();
    renderCart();
  }

  function removeFromCart(productName) {
    cart = cart.filter(item => item.name !== productName);
    saveCart();
    renderCart();
  }

  function updateQuantity(productName, delta) {
    const item = cart.find(entry => entry.name === productName);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(productName);
      return;
    }

    saveCart();
    renderCart();
  }

  function clearCart() {
    cart = [];
    saveCart();
    renderCart();
  }

  function renderCart() {
    const count = getCartCount();
    const total = getCartTotal();

    cartCountEl.textContent = String(count);
    cartTotalEl.textContent = formatCurrency(total);

    if (!cart.length) {
      cartItemsEl.innerHTML = '<p class="empty-state">Your cart is empty. Add a product to begin.</p>';
      return;
    }

    cartItemsEl.innerHTML = cart.map(item => `
      <div class="cart-item" style="display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:1rem;border:1px solid rgba(240,216,227,0.9);border-radius:18px;background:#fff;">
        <div>
          <strong style="display:block;color:#2f1d28;margin-bottom:.25rem;">${item.name}</strong>
          <span>${formatCurrency(item.price)} × ${item.quantity}</span>
        </div>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:flex-end;">
          <button type="button" class="btn btn-secondary qty-btn" data-action="decrease" data-product="${item.name}">-</button>
          <button type="button" class="btn btn-secondary qty-btn" data-action="increase" data-product="${item.name}">+</button>
          <button type="button" class="btn btn-primary remove-btn" data-product="${item.name}">Remove</button>
        </div>
      </div>
    `).join("");
  }

  addToCartButtons.forEach(button => {
    button.addEventListener("click", () => {
      addToCart(button.dataset.product);
    });
  });

  cartItemsEl.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const productName = target.dataset.product;
    const action = target.dataset.action;

    if (!productName) return;

    if (action === "increase") updateQuantity(productName, 1);
    if (action === "decrease") updateQuantity(productName, -1);
    if (target.classList.contains("remove-btn")) removeFromCart(productName);
  });

  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = document.getElementById("name");
      const phone = document.getElementById("phone");
      const address = document.getElementById("address");
      const payment = document.getElementById("payment");

      const customerName = name.value.trim();
      const customerPhone = phone.value.trim();
      const customerAddress = address.value.trim();

      if (!cart.length) {
        alert("Your cart is empty. Please add products before placing an order.");
        return;
      }

      if (!customerName || !customerPhone || !customerAddress) {
        alert("Please fill in your name, phone, and address before placing the order.");
        return;
      }

      const orderSummary = cart.map(item => `${item.name} x ${item.quantity}`).join(", ");
      const message = [
        "Order placed successfully!",
        `Name: ${customerName}`,
        `Phone: ${customerPhone}`,
        `Payment: ${payment.value}`,
        `Items: ${orderSummary}`,
        `Total: ${formatCurrency(getCartTotal())}`
      ].join("\n");

      alert(message);
      clearCart();
      checkoutForm.reset();
      location.hash = "#home";
    });
  }

  if (navToggle && primaryNav) {
    const closeNav = () => {
      primaryNav.style.display = "";
      navToggle.setAttribute("aria-expanded", "false");
    };

    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      primaryNav.style.display = isOpen ? "" : "grid";
    });

    primaryNav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 768) closeNav();
      });
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) closeNav();
    });
  }

  renderCart();
});
