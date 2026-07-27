const products = [
  {
    name: "Strawberry 🍓 Pink Lipstick",
    price: "₹265"
  },
  {
    name: "Unbox the Glow",
    price: "₹499"
  },
  {
    name: "Glow Starts in the Shower ✨🩷",
    price: "₹365"
  },
  {
    name: "Chocolate Vibes. Soft Lips. 🤎",
    price: "₹285"
  }
];

const container = document.getElementById("products");

products.forEach(product => {
  container.innerHTML += `
    <div class="card">
      <h2>${product.name}</h2>
      <h3>${product.price}</h3>
      <button>Add to Cart</button>
      <button>Details</button>
    </div>
  `;
});
