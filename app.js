/* app.js - ClickMart Application
   Handles: product rendering, cart, localStorage persistence, checkout
*/

// Sample product catalog (you can add/remove items)
const products = [
  { id:1, name:"Professional Drill Set", category:"equipment", price:89.99, icon:"fas fa-tools" },
  { id:2, name:"Office Paper (500 sheets)", category:"supplies", price:24.99, icon:"fas fa-file-alt" },
  { id:3, name:"Remote Control Car", category:"toys", price:39.99, icon:"fas fa-car" },
  { id:4, name:"Organic Coffee Beans (1kg)", category:"foods", price:18.99, icon:"fas fa-coffee" },
  { id:5, name:"Wireless Headphones", category:"equipment", price:129.99, icon:"fas fa-headphones" },
  { id:6, name:"Printer Ink (set)", category:"supplies", price:49.99, icon:"fas fa-print" },
  { id:7, name:"Building Blocks (1000 pcs)", category:"toys", price:59.99, icon:"fas fa-cubes" },
  { id:8, name:"Gourmet Chocolate Box", category:"foods", price:29.99, icon:"fas fa-cookie-bite" },
  { id:9, name:"Kitchen Blender", category:"equipment", price:79.99, icon:"fas fa-blender" },
  { id:10, name:"Sticky Notes (10 pack)", category:"supplies", price:14.99, icon:"fas fa-sticky-note" },
  { id:11, name:"Board Game Collection", category:"toys", price:44.99, icon:"fas fa-dice" },
  { id:12, name:"Assorted Snacks Pack", category:"foods", price:19.99, icon:"fas fa-burrito" }
];

// persistent cart (stored in localStorage)
let cart = JSON.parse(localStorage.getItem('cm_cart') || '[]');

// DOM refs
let productGrid, cartCountEl, cartOverlay, cartSidebar, cartItemsEl, cartEmptyEl, totalPriceEl;

// initialize app
function init(){
  productGrid = document.querySelector('.product-grid');
  cartCountEl = document.querySelector('.cart-count');
  cartOverlay = document.querySelector('.cart-overlay');
  cartSidebar = document.querySelector('.cart-sidebar');
  cartItemsEl = document.querySelector('.cart-items');
  cartEmptyEl = document.querySelector('.cart-empty');
  totalPriceEl = document.querySelector('.total-price');

  displayProducts('all');
  updateCartUI();
  setupBanner();
}

// render products by category
function displayProducts(category){
  productGrid.innerHTML = '';
  const list = (category === 'all') ? products : products.filter(p => p.category === category);
  list.forEach(p => productGrid.appendChild(buildCard(p)));
}

// build a product card element
function buildCard(p){
  const card = document.createElement('div');
  card.className = 'product-card';
  card.innerHTML = `
    <div class="product-image"><i class="${p.icon}"></i></div>
    <div class="product-title">${p.name}</div>
    <div class="product-price">₱${p.price.toFixed(2)}</div>
    <button class="add-to-cart">Add to Cart</button>
  `;
  card.querySelector('.add-to-cart').addEventListener('click', () => {
    addToCart(p.id);
  });
  return card;
}

// add product to cart
function addToCart(productId){
  const prod = products.find(p => p.id === productId);
  if(!prod) return;
  cart.push(prod);
  persistCart();
  updateCartUI();
  toast(`${prod.name} added to cart`);
}

// persist cart to localStorage
function persistCart(){
  localStorage.setItem('cm_cart', JSON.stringify(cart));
}

// update cart UI
function updateCartUI(){
  cartCountEl.textContent = cart.length;
  cartItemsEl.innerHTML = '';
  if(cart.length === 0){
    cartEmptyEl.style.display = 'block';
  } else {
    cartEmptyEl.style.display = 'none';
    let total = 0;
    cart.forEach((it, idx) => {
      total += it.price;
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `<div>${it.name}</div><div>₱${it.price.toFixed(2)} <button onclick="removeFromCart(${idx})" style="margin-left:8px">Remove</button></div>`;
      cartItemsEl.appendChild(div);
    });
    totalPriceEl.textContent = '₱' + total.toFixed(2);
  }
}

// remove item by index
function removeFromCart(index){
  cart.splice(index,1);
  persistCart();
  updateCartUI();
}

// open/close cart
function toggleCart(){
  if(cartSidebar.classList.contains('open')) closeCart(); else openCart();
}
function openCart(){
  cartOverlay.style.display = 'block';
  cartSidebar.classList.add('open');
}
function closeCart(){
  cartOverlay.style.display = 'none';
  cartSidebar.classList.remove('open');
}

// navigate to checkout (opens checkout.html)
function goCheckout(){
  if(cart.length === 0){ toast('Cart is empty'); return; }
  // store checkout snapshot for the checkout page
  localStorage.setItem('cm_checkout', JSON.stringify(cart));
  window.location.href = 'checkout.html';
}

// checkout page loader
function loadCheckout(){
  const items = JSON.parse(localStorage.getItem('cm_checkout') || '[]');
  const container = document.getElementById('checkout-items');
  const totalEl = document.getElementById('checkout-total');
  container.innerHTML = '';
  if(items.length === 0){ container.innerHTML = '<p>Your cart is empty.</p>'; totalEl.textContent = '₱0.00'; return; }
  let total = 0;
  items.forEach(it => {
    total += it.price;
    const div = document.createElement('div');
    div.className = 'checkout-item';
    div.innerHTML = `<div>${it.name}</div><div>₱${it.price.toFixed(2)}</div>`;
    container.appendChild(div);
  });
  totalEl.textContent = '₱' + total.toFixed(2);
}

// handle order submission
function submitOrder(e){
  e.preventDefault();
  // simple simulated order process
  const name = document.getElementById('name').value.trim();
  const address = document.getElementById('address').value.trim();
  if(!name || !address){ toast('Please complete the form'); return; }
  // clear cart and checkout
  localStorage.removeItem('cm_cart');
  localStorage.removeItem('cm_checkout');
  cart = [];
  toast('Order placed! Thank you.');
  // redirect to main after short delay
  setTimeout(()=> window.location.href = 'index.html', 1200);
}

// search products
function searchProducts(){
  const q = (document.getElementById('searchInput') || {}).value || '';
  if(!q) { displayProducts('all'); return; }
  const found = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
  productGrid.innerHTML = '';
  found.forEach(f => productGrid.appendChild(buildCard(f)));
}

// small toast notifier
function toast(msg){
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.position = 'fixed';
  t.style.bottom = '20px';
  t.style.left = '50%';
  t.style.transform = 'translateX(-50%)';
  t.style.background = '#333';
  t.style.color = '#fff';
  t.style.padding = '8px 12px';
  t.style.borderRadius = '8px';
  t.style.zIndex = 9999;
  document.body.appendChild(t);
  setTimeout(()=> t.remove(), 1600);
}

/* banner rotation support */
function setupBanner(){
  const slides = document.querySelectorAll('.banner-slide');
  const dots = document.querySelectorAll('.dot');
  let idx = 0;
  if(slides.length === 0) return;
  setInterval(()=>{
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    idx = (idx + 1) % slides.length;
    slides[idx].classList.add('active');
    dots[idx].classList.add('active');
  }, 3500);
}

/* support setSlide called by dots */
function setSlide(i){
  const slides = document.querySelectorAll('.banner-slide');
  const dots = document.querySelectorAll('.dot');
  slides.forEach(s => s.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  if(slides[i]) slides[i].classList.add('active');
  if(dots[i]) dots[i].classList.add('active');
}
