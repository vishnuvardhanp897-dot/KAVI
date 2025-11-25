/* script.js
   Handles products listing, search/filter, add-to-cart, cart persistence (localStorage),
   remove/clear items, totals, checkout and order flow.
*/

/* -------------------------
   Product Data (editable)
   ------------------------- */
(function(){
  // product list available to all pages via window.getProducts()
  const products = [
    // Statues
    { id: 's1', name: 'Bronze Temple Idol', price: 18500, category: 'Statues', image: 'https://c8.alamy.com/comp/C55B57/antique-pieces-on-sale-in-india-C55B57.jpg' },
    { id: 's2', name: 'Vintage Wooden Krishna Statue', price: 12000, category: 'Statues', image: 'https://ashtok.com/cdn/shop/files/IMG20231104140218_800x.jpg?v=1699423285' },
    { id: 's3', name: 'Brass Ganesha Idol', price: 9500, category: 'Statues', image: 'https://www.jaipurcraftonline.com/cdn/shop/files/CPP00175_450x.jpg?v=1688231125' },

    // Coins & Currency
    { id: 'c1', name: 'Ancient Roman Coin Replica', price: 3200, category: 'Coins & Currency', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJmTt1wDI-mQT9FaTF4T34RH-0W0I-D4gfQnveiD5mGHMD6A24YIUTn6zt6PYiEx9IvnU&usqp=CAU' },
    { id: 'c2', name: 'Old Indian 1 Rupee Coin (1950s Collection)', price: 2800, category: 'Coins & Currency', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSt6pn0dc_uMQcP5jXypX3gfYZvvYlNzDUoYqxUJzUxhZlvIjWb5iD84N_rdyOLHcVfFa0&usqp=CAU' },
    { id: 'c3', name: 'Vintage World Currency Set', price: 4500, category: 'Coins & Currency', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSXx47fHXo8XdIF03kdiQ9pTrzr-FzklZjPBDqGAdf6DQ78nFL0wkvZxnHfqzjB_aT4z4&usqp=CAU' },

    // Vintage Décor
    { id: 'v1', name: 'Classic Gramophone Showpiece', price: 7800, category: 'Vintage Décor', image: 'https://tiimg.tistatic.com/fp/1/002/787/antique-finish-musical-show-piece-926.jpg' },
    { id: 'v2', name: 'Antique Wall Clock', price: 6900, category: 'Vintage Décor', image: 'https://www.shutterstock.com/image-photo/kochi-kerala-indiaoctober-6-2022-260nw-2329822385.jpg' },
    { id: 'v3', name: 'Vintage Lantern Lamp', price: 3600, category: 'Vintage Décor', image: 'https://www.proantic.com/galerie/florin-antiques/img/1398403-main-66e00a5c186db.jpg' },

    // Collectible Items
    { id: 'k1', name: 'Old Classic Book (Collector’s Edition)', price: 2200, category: 'Collectible Items', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8p8Ybp6y5_aZS4fprgXy7pa4m9j9KyP2SPslEgF6gT2Wz3zkh9HwbrXn8euGH4xgKe8o&usqp=CAU' },
    { id: 'k2', name: 'Vintage Ink Pen Set', price: 1900, category: 'Collectible Items', image: 'https://m.media-amazon.com/images/I/71NIc8VkeEL._AC_UF894,1000_QL80_.jpg' },
    { id: 'k3', name: 'Handcrafted Wooden Jewelry Box', price: 3300, category: 'Collectible Items', image: 'https://craftzone.in/backend/uploads/products/SKU0000003816/18554198aa9649b137dd2008aba4e5a7.webp' }
  ];

  // Expose getter
  window.getProducts = function(){
    return products.slice(); // return copy
  };
})();

/* -------------------------
   Utilities
   ------------------------- */
function formatINR(n){
  return '₹' + n.toLocaleString('en-IN');
}
function uid(){
  return 'id-' + Math.random().toString(36).slice(2,9);
}
function escapeHtml(text){
  var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, function(m){ return map[m]; });
}

/* -------------------------
   Cart operations (localStorage)
   ------------------------- */
const CART_KEY = 'vishnu_antq_cart';

function getCart(){
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch(e){
    console.error('Failed to parse cart', e);
    return [];
  }
}
function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
function addToCart(productId, qty){
  const products = window.getProducts();
  const p = products.find(x => x.id === productId);
  if(!p) return;
  const cart = getCart();
  const item = cart.find(it => it.id === productId);
  if(item){
    item.quantity = (item.quantity || 1) + (qty || 1);
  } else {
    cart.push({ id: productId, quantity: qty || 1, name: p.name, price: p.price, image: p.image });
  }
  saveCart(cart);
}
function removeFromCart(productId){
  let cart = getCart();
  cart = cart.filter(it => it.id !== productId);
  saveCart(cart);
}
function updateQuantity(productId, newQty){
  const cart = getCart();
  const it = cart.find(i => i.id === productId);
  if(!it) return;
  it.quantity = Math.max(1, parseInt(newQty) || 1);
  saveCart(cart);
}
function clearCart(){
  localStorage.removeItem(CART_KEY);
}

/* -------------------------
   Totals and helpers
   ------------------------- */
function cartTotalAmount(){
  const cart = getCart();
  return cart.reduce((sum, it) => sum + (it.price * (it.quantity || 1)), 0);
}
function cartTotalItems(){
  const cart = getCart();
  return cart.reduce((sum, it) => sum + (it.quantity || 1), 0);
}
function updateNavCartCount(){
  const el = document.getElementById('nav-cart-count');
  if(el) el.textContent = cartTotalItems();
}

/* -------------------------
   Products Page: render & filters
   ------------------------- */
function initProductsPage(){
  const products = window.getProducts();
  const listEl = document.getElementById('products-list');
  const searchInput = document.getElementById('search-input');
  const catButtons = document.querySelectorAll('.cat-btn');

  function render(items){
    listEl.innerHTML = '';
    if(!items.length){
      listEl.innerHTML = '<p class="muted">No products match your search.</p>';
      return;
    }
    items.forEach(p => {
      const div = document.createElement('div');
      div.className = 'product-card';
      div.innerHTML = `
        <img src="${p.image}" alt="${escapeHtml(p.name)}">
        <div class="product-info">
          <h4>${escapeHtml(p.name)}</h4>
          <p class="price">${formatINR(p.price)}</p>
          <div style="display:flex;gap:8px;align-items:center;margin-top:8px;">
            <button class="btn add-to-cart" data-id="${p.id}">Add to Cart</button>
            <button class="btn btn-sm" onclick="window.location='products.html#${p.id}'">View</button>
          </div>
        </div>
      `;
      listEl.appendChild(div);
    });
  }

  // initial render
  render(products);

  // search
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    const activeCat = document.querySelector('.cat-btn.active')?.dataset.cat || 'all';
    const filtered = products.filter(p => {
      const matchQ = p.name.toLowerCase().includes(q);
      const matchCat = (activeCat === 'all') || (p.category === activeCat);
      return matchQ && matchCat;
    });
    render(filtered);
  });

  // category buttons
  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // trigger search input's listener to re-render
      searchInput.dispatchEvent(new Event('input'));
    });
  });

  // add-to-cart handler (event delegation)
  listEl.addEventListener('click', function(e){
    const btn = e.target.closest('.add-to-cart');
    if(!btn) return;
    addToCart(btn.dataset.id, 1);
    updateNavCartCount();
    // small feedback
    btn.textContent = 'Added ✓';
    setTimeout(()=> btn.textContent = 'Add to Cart', 900);
  });
}

/* -------------------------
   Cart Page: init
   ------------------------- */
function initCartPage(){
  const container = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  const clearBtn = document.getElementById('clear-cart');

  function renderCart(){
    const cart = getCart();
    container.innerHTML = '';
    if(!cart.length){
      container.innerHTML = '<p class="muted">Your cart is empty. <a href="products.html">Browse collections</a></p>';
      totalEl.textContent = formatINR(0);
      updateNavCartCount();
      return;
    }
    cart.forEach(item => {
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <img src="${item.image}" alt="${escapeHtml(item.name)}">
        <div class="ci-info">
          <h4>${escapeHtml(item.name)}</h4>
          <p>${formatINR(item.price)} each</p>
        </div>
        <div class="ci-actions">
          <label>Qty <input type="number" class="qty-input" data-id="${item.id}" value="${item.quantity||1}" min="1"></label>
          <div style="margin-top:8px;">
            <button class="btn remove-item" data-id="${item.id}">Remove</button>
          </div>
        </div>
      `;
      container.appendChild(row);
    });
    totalEl.textContent = formatINR(cartTotalAmount());
    updateNavCartCount();
  }

  // initial render
  renderCart();

  // remove handler & qty change (delegation)
  container.addEventListener('click', function(e){
    const rem = e.target.closest('.remove-item');
    if(rem){
      const id = rem.dataset.id;
      removeFromCart(id);
      renderCart();
      return;
    }
  });
  container.addEventListener('change', function(e){
    const qty = e.target.closest('.qty-input');
    if(qty){
      const id = qty.dataset.id;
      updateQuantity(id, qty.value);
      // update total
      document.getElementById('cart-total').textContent = formatINR(cartTotalAmount());
      updateNavCartCount();
    }
  });

  // clear cart
  clearBtn.addEventListener('click', function(){
    if(!confirm('Clear entire cart?')) return;
    clearCart();
    renderCart();
    updateNavCartCount();
  });
}

/* -------------------------
   Payment Page: init
   ------------------------- */
function initPaymentPage(){
  const itemsEl = document.getElementById('checkout-items');
  const totalEl = document.getElementById('checkout-total');
  const form = document.getElementById('checkout-form');

  function renderSummary(){
    const cart = getCart();
    itemsEl.innerHTML = '';
    if(!cart.length){
      itemsEl.innerHTML = '<li>Your cart is empty. <a href="products.html">Shop now</a></li>';
      totalEl.textContent = formatINR(0);
      document.querySelector('.place-order').disabled = true;
      return;
    }
    cart.forEach(it => {
      const li = document.createElement('li');
      li.textContent = `${it.name} x ${it.quantity || 1} — ${formatINR(it.price * (it.quantity || 1))}`;
      itemsEl.appendChild(li);
    });
    totalEl.textContent = formatINR(cartTotalAmount());
  }

  renderSummary();

  form.addEventListener('submit', function(e){
    e.preventDefault();
    // basic validation
    const fullname = document.getElementById('fullname').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const address = document.getElementById('address').value.trim();
    const area = document.getElementById('delivery-area').value;
    const payment = form.querySelector('input[name="payment"]:checked');

    if(!area || !fullname || !mobile || !address || !payment){
      alert('Please complete all required fields.');
      return;
    }

    // simulate order placement: clear cart and redirect
    // we could store an order record in localStorage (optional)
    const order = {
      id: uid(),
      createdAt: new Date().toISOString(),
      fullname, mobile, address, area, payment: payment.value,
      items: getCart(),
      total: cartTotalAmount()
    };
    // optionally save last order for reference
    try {
      localStorage.setItem('vishnu_last_order', JSON.stringify(order));
    } catch(e){}
    clearCart();
    updateNavCartCount();
    // redirect to thank you
    window.location = 'thankyou.html';
  });
}

/* -------------------------
   Small helpers for other pages
   ------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // ensure nav cart count updates early
  updateNavCartCount();
});

/* Expose some helpers to global for inline scripts in HTML */
window.addToCart = addToCart;
window.updateNavCartCount = updateNavCartCount;
window.removeFromCart = removeFromCart;
window.getCart = getCart;
window.clearCart = clearCart;
window.initProductsPage = initProductsPage;
window.initCartPage = initCartPage;
window.initPaymentPage = initPaymentPage;
window.formatINR = formatINR;
window.escapeHtml = escapeHtml;
