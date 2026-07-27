const app = document.getElementById("app");
const cartDrawer = document.getElementById("cartDrawer");
const cartItems = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const cartCountEl = document.getElementById("cartCount");
const productModal = document.getElementById("productModal");
const productModalContent = document.getElementById("productModalContent");

const categories = ["All", "Lipstick", "Foundation", "Skincare", "Perfume", "Eye Makeup", "Brushes", "Gift Sets"]
const products = [
{
id:1,
name:"Strawberry 🍓 Pink Lipstick",
category:"Lipstick",
price:265,
desc:"",
icon:""
},
{
id:2,
name:"Unbox the Glow",
category:"Gift Sets",
price:499,
desc:"",
icon:""
},
{
id:3,
name:"Glow Starts in the Shower ✨🩷",
category:"Skincare",
price:365,
desc:"",
icon:""
},
{
id:4,
name:"Chocolate Vibes. Soft Lips. 🤎",
category:"Lipstick",
price:285,
desc:"",
icon:""
}
];
  };
});

const STORAGE_KEYS = {
  cart: "pl_cart",
  orders: "pl_orders"
};

let state = {
  page: "home",
  search: "",
  category: "All",
  selectedProductId: null,
  cart: loadJSON(STORAGE_KEYS.cart, [])
};

function loadJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function money(value) {
  return "₹" + Number(value).toLocaleString("en-IN");
}

function cartCount() {
  return state.cart.reduce((sum, item) => sum + item.qty, 0);
}

function getProduct(id) {
  return products.find(p => p.id === id);
}

function cartTotal() {
  return state.cart.reduce((sum, item) => {
    const product = getProduct(item.id);
    return sum + product.price * item.qty;
  }, 0);
}

function setActiveNav(page) {
  document.querySelectorAll(".navlinks a").forEach(a => {
    a.classList.toggle("active", a.dataset.link === page);
  });
}

function render() {
  const route = location.hash.replace("#", "") || "home";
  if (["home", "shop", "categories", "checkout", "admin"].includes(route)) {
    state.page = route;
  } else {
    state.page = "home";
  }

  setActiveNav(state.page === "categories" ? "shop" : state.page);

  if (state.page === "home") app.innerHTML = homeView();
  if (state.page === "shop") app.innerHTML = shopView();
  if (state.page === "categories") app.innerHTML = categoriesView();
  if (state.page === "checkout") app.innerHTML = checkoutView();
  if (state.page === "admin") app.innerHTML = adminView();

  updateCartUI();
  bindPageEvents();
}

function homeView() {
  const featured = products.slice(0, 8);
  return `
    <section class="hero">
      <div class="container hero-grid">
        <div class="hero-card">
          <div class="eyebrow">Luxury cosmetics</div>
          <h1>Beauty that feels exclusive.</h1>
          <p>
            Pink&Liss is a premium cosmetics storefront built for a polished
            shopping experience with elegant presentation, smooth navigation,
            and mobile-first design.
          </p>
          <div class="hero-actions">
            <a class="primary-btn" href="#shop">Shop Collection</a>
            <a class="secondary-btn" href="#admin">Admin Dashboard</a>
          </div>
          <div class="hero-stats">
            <div class="stat"><strong>120+</strong><span>Products</span></div>
            <div class="stat"><strong>Responsive</strong><span>Mobile + Desktop</span></div>
            <div class="stat"><strong>Static</strong><span>GitHub Pages Ready</span></div>
          </div>
        </div>
        <div class="hero-visual panel">
          <div class="hero-visual-text">LUXURY BEAUTY</div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <div>
            <h2>Featured products</h2>
            <p>Quick access to popular premium picks.</p>
          </div>
          <a class="secondary-btn" href="#shop">View all products</a>
        </div>
        ${productGrid(featured)}
      </div>
    </section>
  `;
}

function shopView() {
  const filtered = products.filter(p => {
    const matchesCategory = state.category === "All" || p.category === state.category;
    const query = `${p.name} ${p.category}`.toLowerCase();
    const matchesSearch = query.includes(state.search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <div>
            <h2>Shop</h2>
            <p>Search and browse the full Pink&Liss catalog.</p>
          </div>
          <div class="notice">Supports 100+ products dynamically.</div>
        </div>

        <div class="controls">
          <input id="searchInput" class="input" type="search" placeholder="Search products..." value="${escapeHtml(state.search)}" />
          <select id="categorySelect" class="select">
            ${categories.map(c => `<option value="${c}" ${state.category === c ? "selected" : ""}>${c}</option>`).join("")}
          </select>
          <button class="primary-btn" id="resetFiltersBtn" type="button">Reset Filters</button>
        </div>

        <div class="chips" id="categoryChips">
          ${categories.map(c => `<button class="chip ${state.category === c ? "active" : ""}" data-category="${c}" type="button">${c}</button>`).join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        ${productGrid(filtered)}
      </div>
    </section>
  `;
}

function categoriesView() {
  return `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <div>
            <h2>Categories</h2>
            <p>Shop by collection.</p>
          </div>
        </div>

        <div class="chips">
          ${categories.filter(c => c !== "All").map(c => `
            <button class="chip ${state.category === c ? "active" : ""}" data-category="${c}" type="button">${c}</button>
          `).join("")}
        </div>

        <div style="height:18px"></div>
        ${productGrid(products.filter(p => state.category === "All" ? true : p.category === state.category).slice(0, 24))}
      </div>
    </section>
  `;
}

function checkoutView() {
  return `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <div>
            <h2>Checkout</h2>
            <p>Enter customer details to place the order.</p>
          </div>
        </div>

        <div class="checkout-grid">
          <div class="section-card">
            <form class="form" id="checkoutForm">
              <input class="input" name="name" placeholder="Customer Name" required />
              <input class="input" name="phone" placeholder="Phone Number" required />
              <textarea class="textarea" name="address" placeholder="Address" required></textarea>
              <button class="primary-btn" type="submit">Place Order</button>
            </form>
          </div>

          <div class="section-card">
            <h3 style="margin-top:0">Order Summary</h3>
            <div id="checkoutSummary"></div>
            <div class="totals" style="margin-top:14px">
              <div class="row">
                <span>Total</span>
                <strong>${money(cartTotal())}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function adminView() {
  const orders = loadJSON(STORAGE_KEYS.orders, []);

  return `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <div>
            <h2>Admin Dashboard</h2>
            <p>View all saved orders from checkout.</p>
          </div>
          <button class="secondary-btn" id="clearOrdersBtn" type="button">Clear Orders</button>
        </div>

        <div class="section-card" style="overflow:auto">
          ${
            orders.length
              ? `
                <table class="orders-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Phone</th>
                      <th>Address</th>
                      <th>Items</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${orders.map(order => `
                      <tr>
                        <td>#${order.id}</td>
                        <td>${escapeHtml(order.name)}</td>
                        <td>${escapeHtml(order.phone)}</td>
                        <td>${escapeHtml(order.address)}</td>
                        <td>${escapeHtml(order.items)}</td>
                        <td>${money(order.total)}</td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              `
              : `<p style="color:var(--muted)">No orders saved yet.</p>`
          }
        </div>
      </div>
    </section>
  `;
}

function productGrid(list) {
  if (!list.length) {
    return `<div class="section-card"><p style="color:var(--muted)">No products found.</p></div>`;
  }

  return `
    <div class="grid">
      ${list.map(product => `
        <article class="card">
          <div class="thumb" data-open-product="${product.id}">${product.icon}</div>
          <div class="card-body">
            <div class="meta">
              <strong>${product.name}</strong>
              <span class="tag">${product.category}</span>
            </div>
            <div class="meta">
              <span class="price">${money(product.price)}</span>
            </div>
            <p style="margin:0;color:var(--muted);line-height:1.5">${product.desc}</p>
            <div class="card-actions">
              <button class="primary-btn" data-add-to-cart="${product.id}" type="button">Add to Cart</button>
              <button class="secondary-btn" data-open-product="${product.id}" type="button">Details</button>
            </div>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function openProductModal(productId) {
  const product = getProduct(productId);
  productModalContent.innerHTML = `
    <div class="detail-layout">
      <div class="detail-image">${product.icon}</div>
      <div class="detail-box">
        <div class="eyebrow">${product.category}</div>
        <h3>${product.name}</h3>
        <p>${product.desc}</p>
        <div class="meta" style="margin:18px 0">
          <span class="price">${money(product.price)}</span>
          <span class="tag">Premium</span>
        </div>
        <div class="hero-actions">
          <button class="primary-btn" type="button" data-add-to-cart="${product.id}">Add to Cart</button>
          <button class="secondary-btn" type="button" id="closeDetailsBtn">Close</button>
        </div>
      </div>
    </div>
  `;
  productModal.classList.add("open");
  productModal.setAttribute("aria-hidden", "false");
}

function closeProductModal() {
  productModal.classList.remove("open");
  productModal.setAttribute("aria-hidden", "true");
}

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

function addToCart(productId) {
  const existing = state.cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ id: productId, qty: 1 });
  }
  saveJSON(STORAGE_KEYS.cart, state.cart);
  updateCartUI();
  openCart();
}

function changeQty(productId, delta) {
  const item = state.cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    state.cart = state.cart.filter(i => i.id !== productId);
  }
  saveJSON(STORAGE_KEYS.cart, state.cart);
  updateCartUI();
  renderCartItems();
  render();
}

function renderCartItems() {
  if (!state.cart.length) {
    cartItems.innerHTML = `<p style="color:var(--muted)">Cart is empty.</p>`;
    cartTotalEl.textContent = money(0);
    return;
  }

  cartItems.innerHTML = state.cart.map(item => {
    const product = getProduct(item.id);
    return `
      <div class="cart-item">
        <div class="mini">${product.icon}</div>
        <div>
          <strong>${product.name}</strong>
          <div style="color:var(--muted);margin-top:4px">${money(product.price)} each</div>
          <div class="qty">
            <button type="button" data-qty-minus="${product.id}">-</button>
            <span>${item.qty}</span>
            <button type="button" data-qty-p
