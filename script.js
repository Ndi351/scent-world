/* Replace this placeholder with the WhatsApp business number, country code included, no + or spaces. */
const BUSINESS_NUMBER = "27123456789";
const CART_KEY = "scent-world-cart";
const products = {
  perfumes: [
    // Swap these placeholder image URLs and product details for your real catalogue.
    { id: "amber-noir", name: "Amber Noir", description: "Warm amber, smoked vanilla and sandalwood.", price: 899, category: "Perfume", image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=700&q=85" },
    { id: "velvet-oud", name: "Velvet Oud", description: "A rich, modern oud with a soft rose finish.", price: 1099, category: "Perfume", image: "https://images.unsplash.com/photo-1610461888750-10bfc601b8a9?auto=format&fit=crop&w=700&q=85" },
    { id: "citrus-veil", name: "Citrus Veil", description: "Bright bergamot wrapped in clean white musk.", price: 749, category: "Perfume", image: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&w=700&q=85" },
    { id: "midnight-muse", name: "Midnight Muse", description: "Spiced plum, jasmine and a hint of leather.", price: 949, category: "Perfume", image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=700&q=85" }
  ],
  hubbly: [
    // Swap these placeholder image URLs and product details for your real hookah/shisha catalogue.
    { id: "onyx-hookah", name: "Onyx Hookah", description: "A sleek matte-black pipe with twin hoses and a weighted glass base.", price: 1899, category: "Hookah pipe", image: "assets/hub-pip089-black.png" },
    { id: "classic-tall", name: "Classic Tall Shisha", description: "A polished black stem, wide glass base and single hose.", price: 1599, category: "Shisha pipe", image: "assets/hookah-3.webp" },
    { id: "double-hose", name: "Double Hose Hookah", description: "A generous glass-base hookah with two sharing hoses.", price: 1799, category: "Hookah pipe", image: "assets/amapipe004-1.jpg" },
    { id: "blue-mosaic", name: "Blue Mosaic Hookah", description: "A striking blue-and-glass hookah with matching hose and tongs.", price: 2399, category: "Hookah pipe", image: "assets/hookah-blue.webp" }
  ]
};

const money = value => `R${value.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const getCart = () => JSON.parse(localStorage.getItem(CART_KEY) || "[]");
const saveCart = cart => { localStorage.setItem(CART_KEY, JSON.stringify(cart)); renderCart(); };
const allProducts = Object.values(products).flat();
const currentProducts = products[document.body.dataset.category];

function renderProducts() {
  document.querySelector(".product-total").textContent = `${currentProducts.length} pieces`;
  document.querySelector(".product-grid").innerHTML = currentProducts.map(product => `
    <article class="product-card">
      <div class="product-image-wrap"><img src="${product.image}" alt="${product.name}" loading="lazy"><span>${product.category}</span></div>
      <div class="product-info"><h3>${product.name}</h3><p>${product.description}</p><div class="product-buy"><strong>${money(product.price)}</strong><button class="add-button" type="button" data-id="${product.id}">Add to cart <span>+</span></button></div></div>
    </article>`).join("");
}

function renderCart() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelector(".cart-count").textContent = count;
  document.querySelector(".cart-empty").style.display = cart.length ? "none" : "flex";
  document.querySelector(".cart-summary").style.display = cart.length ? "block" : "none";
  document.querySelector(".cart-items").innerHTML = cart.map(item => `
    <div class="cart-item"><img src="${item.image}" alt=""><div class="cart-item-info"><h3>${item.name}</h3><span>${money(item.price)}</span><div class="quantity"><button type="button" data-action="decrease" data-id="${item.id}" aria-label="Decrease ${item.name} quantity">−</button><b>${item.quantity}</b><button type="button" data-action="increase" data-id="${item.id}" aria-label="Increase ${item.name} quantity">+</button></div></div><button class="remove-item" type="button" data-action="remove" data-id="${item.id}" aria-label="Remove ${item.name}">×</button></div>`).join("");
  document.querySelector(".cart-subtotal").textContent = money(cart.reduce((sum, item) => sum + item.price * item.quantity, 0));
}

function setCartOpen(open) {
  const panel = document.querySelector(".cart-panel");
  panel.classList.toggle("is-open", open);
  panel.setAttribute("aria-hidden", String(!open));
  document.querySelector(".cart-overlay").hidden = !open;
  document.body.classList.toggle("no-scroll", open);
}

function showToast(message) {
  const toast = document.querySelector(".toast");
  toast.textContent = message; toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 5500);
}

document.addEventListener("click", event => {
  const add = event.target.closest(".add-button");
  if (add) {
    const product = allProducts.find(item => item.id === add.dataset.id);
    const cart = getCart(); const existing = cart.find(item => item.id === product.id);
    existing ? existing.quantity++ : cart.push({ ...product, quantity: 1 });
    saveCart(cart); showToast(`${product.name} added to your cart`);
  }
  const action = event.target.closest("[data-action]");
  if (action) {
    const cart = getCart(); const item = cart.find(entry => entry.id === action.dataset.id);
    if (action.dataset.action === "remove") cart.splice(cart.indexOf(item), 1);
    if (action.dataset.action === "increase") item.quantity++;
    if (action.dataset.action === "decrease") item.quantity > 1 ? item.quantity-- : cart.splice(cart.indexOf(item), 1);
    saveCart(cart);
  }
  if (event.target.closest(".cart-trigger")) setCartOpen(true);
  if (event.target.closest(".close-cart, .cart-overlay")) setCartOpen(false);
  if (event.target.closest(".checkout-button")) {
    if (!getCart().length) return;
    document.querySelector(".modal-backdrop").hidden = false;
    document.querySelector('input[name="name"]').focus();
  }
  if (event.target.closest(".close-checkout") || event.target.classList.contains("modal-backdrop")) document.querySelector(".modal-backdrop").hidden = true;
});

document.querySelector(".checkout-modal").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget; const error = form.querySelector(".form-error");
  if (!form.checkValidity()) { error.textContent = "Please complete your name, phone number, and address."; form.reportValidity(); return; }
  const data = new FormData(form); const cart = getCart();
  const lines = cart.map(item => `• ${item.name} x${item.quantity} — ${money(item.price * item.quantity)}`).join("\n");
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const message = `Hello Scent World, I'd like to place an order:\n\n${lines}\n\nSubtotal: ${money(subtotal)}\n\nCustomer: ${data.get("name")}\nPhone: ${data.get("phone")}\nDelivery address: ${data.get("address")}\nOrder notes: ${data.get("notes") || "None"}\n\nPlease confirm availability and delivery details.`;
  const whatsappUrl = `https://wa.me/${BUSINESS_NUMBER}?text=${encodeURIComponent(message)}`;
  localStorage.removeItem(CART_KEY); renderCart(); setCartOpen(false); document.querySelector(".modal-backdrop").hidden = true; form.reset();
  const popup = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  if (!popup) window.location.href = whatsappUrl;
  showToast("Your order is ready — check WhatsApp to confirm it.");
});

renderProducts(); renderCart();
