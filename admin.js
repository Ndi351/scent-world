const PRODUCTS_KEY = "scent-world-products";
const supabaseClient = window.supabase?.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);
const defaultProducts = {
  perfumes: [
    { id: "amber-noir", name: "Amber Noir", description: "Warm amber, smoked vanilla and sandalwood.", price: 899, category: "Perfume", image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=700&q=85", visible: true },
    { id: "velvet-oud", name: "Velvet Oud", description: "A rich, modern oud with a soft rose finish.", price: 1099, category: "Perfume", image: "https://images.unsplash.com/photo-1610461888750-10bfc601b8a9?auto=format&fit=crop&w=700&q=85", visible: true },
    { id: "citrus-veil", name: "Citrus Veil", description: "Bright bergamot wrapped in clean white musk.", price: 749, category: "Perfume", image: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&w=700&q=85", visible: true },
    { id: "midnight-muse", name: "Midnight Muse", description: "Spiced plum, jasmine and a hint of leather.", price: 949, category: "Perfume", image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=700&q=85", visible: true }
  ],
  hubbly: [
    { id: "onyx-hookah", name: "Onyx Hookah", description: "A sleek matte-black pipe with twin hoses and a weighted glass base.", price: 1899, category: "Hookah pipe", image: "assets/hub-pip089-black.png", visible: true },
    { id: "classic-tall", name: "Classic Tall Shisha", description: "A polished black stem, wide glass base and single hose.", price: 1599, category: "Shisha pipe", image: "assets/hookah-3.webp", visible: true },
    { id: "double-hose", name: "Double Hose Hookah", description: "A generous glass-base hookah with two sharing hoses.", price: 1799, category: "Hookah pipe", image: "assets/amapipe004-1.jpg", visible: true },
    { id: "blue-mosaic", name: "Blue Mosaic Hookah", description: "A striking blue-and-glass hookah with matching hose and tongs.", price: 2399, category: "Hookah pipe", image: "assets/hookah-blue.webp", visible: true }
  ]
};
let products = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || JSON.stringify(defaultProducts));
const allProducts = () => Object.entries(products).flatMap(([type, items]) => items.map(item => ({ ...item, type })));
const money = value => `R${Number(value).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const elements = { list: document.querySelector("#product-list"), empty: document.querySelector("#empty-products"), search: document.querySelector("#product-search"), filter: document.querySelector("#product-filter"), modal: document.querySelector("#product-modal"), form: document.querySelector("#product-form"), toast: document.querySelector("#admin-toast") };

function setAuthenticated(authenticated) { document.body.classList.toggle("admin-locked", !authenticated); document.querySelector("#admin-auth-backdrop").hidden = authenticated; if (authenticated) document.querySelector("#product-search").focus(); }
async function initializeAuth() {
  const form = document.querySelector("#admin-auth-form");
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) { setAuthenticated(true); await loadCloudProducts(); return; }
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const error = document.querySelector("#auth-error"); error.textContent = "";
    const email = document.querySelector("#admin-email").value.trim(); const password = document.querySelector("#admin-password").value;
    const { error: signInError } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (signInError) { error.textContent = signInError.message; return; }
    form.reset(); setAuthenticated(true); await loadCloudProducts();
  });
}
async function loadCloudProducts() {
  const { data, error } = await supabaseClient.from("products").select("*").order("created_at");
  if (error) { showToast("Could not load Supabase products. Run supabase-schema.sql first."); renderProducts(); return; }
  if (data?.length) products = { perfumes: data.filter(item => item.product_type === "perfumes"), hubbly: data.filter(item => item.product_type === "hubbly") };
  renderProducts();
}
function productRow(item) { return { id: item.id, name: item.name, description: item.description, price: Number(item.price), category: item.category, product_type: item.type || item.product_type, image: item.image, visible: item.visible !== false }; }
async function saveProduct(product) { const { error } = await supabaseClient.from("products").upsert(productRow(product)); if (error) throw error; localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products)); }
async function deleteProduct(product) { const { error } = await supabaseClient.from("products").delete().eq("id", product.id); if (error) throw error; localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products)); }
function showToast(message) { elements.toast.textContent = message; elements.toast.classList.add("show"); window.setTimeout(() => elements.toast.classList.remove("show"), 3500); }
function updateStats() { const items = allProducts(); document.querySelector("#total-products").textContent = items.length; document.querySelector("#live-products").textContent = items.filter(item => item.visible !== false).length; document.querySelector("#hidden-products").textContent = items.filter(item => item.visible === false).length; }
function renderProducts() {
  const query = elements.search.value.trim().toLowerCase(); const filter = elements.filter.value;
  const rows = allProducts().filter(item => (!query || `${item.name} ${item.category}`.toLowerCase().includes(query)) && (filter === "all" || (filter === "visible" && item.visible !== false) || (filter === "hidden" && item.visible === false)));
  elements.list.innerHTML = rows.map(item => `<tr><td><div class="admin-product"><img src="${item.image}" alt=""><div><strong>${item.name}</strong><small>${item.description}</small></div></div></td><td>${item.category}</td><td>${money(item.price)}</td><td><button class="status-toggle ${item.visible === false ? "is-hidden" : ""}" type="button" data-action="toggle" data-id="${item.id}">${item.visible === false ? "Hidden" : "Live"}</button></td><td><div class="table-actions"><button type="button" data-action="edit" data-id="${item.id}">Edit</button><button class="delete-action" type="button" data-action="delete" data-id="${item.id}">Delete</button></div></td></tr>`).join("");
  elements.empty.hidden = rows.length > 0; updateStats();
}
function findProduct(id) { return allProducts().find(item => item.id === id); }
function openForm(product) { elements.form.reset(); document.querySelector("#product-id").value = product?.id || ""; document.querySelector("#form-eyebrow").textContent = product ? "Edit product" : "New product"; document.querySelector("#form-title").textContent = product ? "Edit product" : "Add a product"; if (product) { document.querySelector("#product-name").value = product.name; document.querySelector("#product-category").value = product.type; document.querySelector("#product-price").value = product.price; document.querySelector("#product-label").value = product.category; document.querySelector("#product-description").value = product.description; document.querySelector("#product-image").value = product.image; document.querySelector("#product-visible").checked = product.visible !== false; } elements.modal.hidden = false; document.querySelector("#product-name").focus(); }
function closeForm() { elements.modal.hidden = true; document.querySelector("#form-error").textContent = ""; }
document.addEventListener("click", async event => {
  const button = event.target.closest("[data-action]");
  if (button) { const product = findProduct(button.dataset.id); try { if (button.dataset.action === "edit") openForm(product); if (button.dataset.action === "toggle") { product.visible = product.visible === false; await saveProduct(product); renderProducts(); showToast(`${product.name} is now ${product.visible ? "visible" : "hidden"}.`); } if (button.dataset.action === "delete" && window.confirm(`Delete ${product.name}?`)) { products[product.type] = products[product.type].filter(item => item.id !== product.id); await deleteProduct(product); renderProducts(); showToast("Product deleted."); } } catch (error) { showToast(error.message); } }
  if (event.target.closest("#new-product")) openForm(); if (event.target.closest("#close-product-modal, #cancel-product") || event.target === elements.modal) closeForm();
});
elements.form.addEventListener("submit", async event => {
  event.preventDefault(); const idField = document.querySelector("#product-id"); const type = document.querySelector("#product-category").value; const name = document.querySelector("#product-name").value.trim(); const error = document.querySelector("#form-error");
  const product = { id: idField.value || `${type}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now()}`, name, description: document.querySelector("#product-description").value.trim(), price: Number(document.querySelector("#product-price").value), category: document.querySelector("#product-label").value.trim(), image: document.querySelector("#product-image").value.trim(), visible: document.querySelector("#product-visible").checked, type };
  if (!name || !product.description || !product.category || !product.image || product.price < 0) { error.textContent = "Please complete every product field."; return; }
  try { const oldProduct = idField.value && findProduct(idField.value); if (oldProduct) products[oldProduct.type] = products[oldProduct.type].filter(item => item.id !== oldProduct.id); products[type].push(product); await saveProduct(product); closeForm(); renderProducts(); showToast(oldProduct ? "Product updated." : "Product added."); } catch (saveError) { error.textContent = saveError.message; }
});
elements.search.addEventListener("input", renderProducts); elements.filter.addEventListener("change", renderProducts); renderProducts();
document.querySelector("#admin-logout").addEventListener("click", async () => { await supabaseClient.auth.signOut(); setAuthenticated(false); document.querySelector("#admin-email").focus(); });
initializeAuth();
