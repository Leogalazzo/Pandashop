// ==========================================================
// 🧩 CONFIGURACIÓN INICIAL
// ==========================================================
const PRODUCTS = [
  {id:'1',name:'Quilmes Bajo Cero 473ml',price:2500,image:'https://carrefourar.vtexassets.com/arquivos/ids/724085/7792798015290_02.jpg?v=638943243736070000',category:'Cervezas',isAlcohol:true,available:true,badge:'Oferta'},
  {id:'2',name:'Budweiser 473ml',price:3000,image:'https://http2.mlstatic.com/D_929316-MLA95637489525_102025-C.jpg',category:'Cervezas',isAlcohol:true,available:true,badge:'Nuevo'},
  {id:'3',name:'Coca Cola 1.5lts',price:2500,image:'https://acdn-us.mitiendanube.com/stores/001/144/141/products/coca-cola-15-litros-compra-online-en-colombia-exitocom1-84ca4402a6ae97030815868217747967-1024-1024.jpg',category:'Gaseosas',isAlcohol:false,available:true},
  {id:'4',name:'Gancia 473ml',price:1500,image:'https://statics.dinoonline.com.ar/imagenes/full_600x600_ma/3071209_f.jpg',category:'Aperitivo',isAlcohol:true,available:false,badge:'Sin stock'},
  {id:'5',name:'Dr.Lemon 473ml',price:1100,image:'https://masonlineprod.vtexassets.com/arquivos/ids/287040/Aperitivo-Dr-Lemon-Cherry-Vodka-473ml-Dr-Lemon-Halloween-Cherry-473ml-1-37173.jpg?v=638224725919870000',category:'Aperitivo',isAlcohol:true,available:true,badge:'Oferta'},
  {id:'6',name:'Monster 473ml',price:7900,image:'https://flaming.ar/wp-content/uploads/2022/08/Pedido-14.08-40-1-jpg.webp',category:'Energizantes',isAlcohol:false,available:true,badge:'Nuevo'},
  {id:'7',name:'Amstel 473ml',price:2200,image:'https://carrefourar.vtexassets.com/arquivos/ids/417336-170-170',category:'Cervezas',isAlcohol:true,available:true,badge:'Nuevo'},
  {id:'8',name:'Cepita 1500CC',price:1300,image:'https://atomoconviene.com/atomo-ecommerce/55118-medium_default/jugo-p-beber-cepita-bot-durazno-1500-cc--.jpg',category:'Jugos',isAlcohol:false,available:true},
  {id:'9',name:'Agua Villavicencio 500ml',price:1800,image:'https://jumboargentina.vtexassets.com/arquivos/ids/795828-800-600?v=638313501973800000&width=800&height=600&aspect=true',category:'Agua',isAlcohol:false,available:true}
];

const WHATSAPP_PHONE = '5493644539325'; // ← Reemplazar con número real
const AGE_KEY = 'panda_age_ok';
window.__PANDA_STATE__ = { products: PRODUCTS, cart: loadCart() };

// ==========================================================
// 🧩 FUNCIÓN PRINCIPAL
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  const ageStatus = localStorage.getItem(AGE_KEY);
  buildFilters(PRODUCTS);
  render(PRODUCTS);
  updateCartUI();
  document.getElementById('year').textContent = new Date().getFullYear();

  if (ageStatus === null) {
    showAgeGate();
  } else {
    applyAgeRestriction(ageStatus);
  }
});

// ==========================================================
// 🛒 FILTROS Y PRODUCTOS
// ==========================================================
function buildFilters(list){
  const cats = Array.from(new Set(list.map(p=>p.category))).sort();
  const filters = document.getElementById('filters');
  filters.innerHTML = '';
  const allBtn = pill('Todos', true, ()=>{setActivePill(allBtn); render(list)});
  filters.appendChild(allBtn);
  cats.forEach(c=>{
    const el = pill(c,false,()=>{setActivePill(el); render(list.filter(p=>p.category===c))});
    filters.appendChild(el);
  })
}
function pill(label,active,onclick){
  const el=document.createElement('button');
  el.className='pill'+(active?' active':'');
  el.textContent=label; el.onclick=onclick; return el;
}
function setActivePill(activeEl){
  document.querySelectorAll('.pill').forEach(b=>b.classList.remove('active'));
  activeEl.classList.add('active');
  document.getElementById('search').value='';
}

// ==========================================================
// 🧩 RENDER DE PRODUCTOS (con badges y animaciones)
// ==========================================================
function render(list){
  const grid=document.getElementById('grid');
  const q = document.getElementById('search').value.trim().toLowerCase();
  const filtered = list.filter(p=>p.name.toLowerCase().includes(q));
  grid.innerHTML='';
  filtered.forEach(p=>{
    const card=document.createElement('article');
    card.className='card';
    
    let badgeClass = '';
    if (p.badge?.includes('🔥')) badgeClass = 'offer';
    if (p.badge?.includes('🆕')) badgeClass = 'new';
    if (!p.available) badgeClass = 'out';

    card.innerHTML=`
      <div class="card-img" onclick='openModal(${JSON.stringify(p).replace(/"/g,"&quot;")})'>
        ${p.badge ? `<span class="badge ${badgeClass}">${p.badge}</span>` : ''}
        ${p.image ? `<img src="${p.image}" alt="${p.name}">` : '🧃'}
      </div>
      <div class="card-body">
        <div class="title" onclick='openModal(${JSON.stringify(p).replace(/"/g,"&quot;")})'>${p.name}</div>
        <div class="price-row">
          <div>
            <div class="price">$${formatNumber(p.price)}</div>
            <div class="muted">${p.category}${p.isAlcohol?' · 18+':''}</div>
          </div>
          <span class="tag">${p.available?'En stock':'Sin stock'}</span>
        </div>
        <button class="btn" ${p.available?'' :'disabled'}>Agregar</button>
      </div>`;
    
    const btn = card.querySelector(".btn");
    btn.onclick = (e) => {
      const rect = e.target.getBoundingClientRect();
      animateToCart(p.image, rect.left, rect.top);
      addToCart(p);
    };
    grid.appendChild(card);
  });
}
window.applyFilters = () => render(PRODUCTS);

// ==========================================================
// 🧩 MODAL DE DETALLE DE PRODUCTO
// ==========================================================
function openModal(p) {
  const modal = document.getElementById("productModal");
  modal.classList.add("show");
  document.body.style.overflow = "hidden";
  document.getElementById("modalImage").src = p.image;
  document.getElementById("modalTitle").textContent = p.name;
  document.getElementById("modalCategory").textContent = p.category + (p.isAlcohol ? " · 18+" : "");
  document.getElementById("modalPrice").textContent = "$" + formatNumber(p.price);
  const addBtn = document.getElementById("modalAddBtn");
  addBtn.onclick = () => { addToCart(p); closeModal(); };
}
function closeModal() {
  const modal = document.getElementById("productModal");
  modal.classList.remove("show");
  document.body.style.overflow = "";
}

// ==========================================================
// ✨ ANIMACIÓN DE PRODUCTO AL CARRITO
// ==========================================================
function animateToCart(imgSrc, startX, startY) {
  const flyImg = document.createElement("img");
  flyImg.src = imgSrc;
  flyImg.className = "fly-img";
  flyImg.style.left = `${startX}px`;
  flyImg.style.top = `${startY}px`;
  document.body.appendChild(flyImg);
  flyImg.addEventListener("animationend", () => flyImg.remove());
}

// ==========================================================
// 🛍️ CARRITO DE COMPRAS
// ==========================================================
function loadCart(){ try{ return JSON.parse(localStorage.getItem('panda_cart')||'[]'); }catch{ return [] } }
function saveCart(){ localStorage.setItem('panda_cart', JSON.stringify(window.__PANDA_STATE__.cart)); }
window.addToCart = (p)=>{
  const cart = window.__PANDA_STATE__.cart;
  const idx = cart.findIndex(i=>i.id===p.id);
  if(idx>-1) cart[idx].qty += 1; else cart.push({...p, qty:1});
  saveCart(); updateCartUI(); bounceMiniCount();
}
function bounceMiniCount(){
  const el=document.getElementById('miniCount');
  el.style.transform='scale(1.2)';
  setTimeout(()=>el.style.transform='scale(1)',140);
}
window.toggleCart = (open)=>{
  const d=document.getElementById('cartDrawer');
  d.classList.toggle('open', !!open);
  d.setAttribute('aria-hidden', !open);
}
window.clearCart = ()=>{ window.__PANDA_STATE__.cart = []; saveCart(); updateCartUI(); }
function updateCartUI(){
  const cart = window.__PANDA_STATE__.cart;
  const list = document.getElementById('cartList'); list.innerHTML='';
  const empty = document.getElementById('cartEmpty'); empty.style.display = cart.length? 'none':'block';
  let subtotal = 0, count = 0;
  cart.forEach(item=>{
    subtotal += (item.price * item.qty);
    count += item.qty;
    const row=document.createElement('div'); row.className='cart-item';
    row.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div>
        <div style="font-weight:600">${item.name}</div>
        <div class="muted">$${formatNumber(item.price)} · ${item.category}</div>
        <div class="qty" style="margin-top:6px">
          <button onclick='decr("${item.id}")'>−</button>
          <span>${item.qty}</span>
          <button onclick='incr("${item.id}")'>+</button>
          <button style="margin-left:8px" class="icon-btn" onclick='removeItem("${item.id}")'>🗑️</button>
        </div>
      </div>
      <div style="font-weight:700">$${formatNumber(item.price * item.qty)}</div>`;
    list.appendChild(row);
  });
  document.getElementById('subtotal').textContent = `$${formatNumber(subtotal)}`;
  document.getElementById('itemsCount').textContent = count;
  document.getElementById('miniCount').textContent = count>0? count:'';
  document.getElementById('checkoutBtn').disabled = count===0;
}
window.incr = (id)=>{ const c=window.__PANDA_STATE__.cart; const i=c.find(x=>x.id===id); if(i){i.qty++; saveCart(); updateCartUI()} }
window.decr = (id)=>{ const c=window.__PANDA_STATE__.cart; const i=c.find(x=>x.id===id); if(i){ i.qty--; if(i.qty<=0){window.removeItem(id)} else {saveCart(); updateCartUI()} } }
window.removeItem = (id)=>{ const c=window.__PANDA_STATE__.cart; window.__PANDA_STATE__.cart = c.filter(x=>x.id!==id); saveCart(); updateCartUI(); }

// ==========================================================
// 💬 PEDIDO POR WHATSAPP (con validación y limpieza)
// ==========================================================
window.checkoutWhatsApp = () => {
  const { cart } = window.__PANDA_STATE__;
  if (cart.length === 0) {
    alert("Tu carrito está vacío 🛒");
    return;
  }

  const name = document.getElementById("buyerName").value.trim();
  const address = document.getElementById("buyerAddress").value.trim();
  const method = document.getElementById("buyerMethod").value;
  const notes = document.getElementById("buyerNotes").value.trim();

  // 🔹 Validación de campos obligatorios
  if (!name || !address) {
    alert("Por favor, completá tu nombre y dirección antes de enviar el pedido 📦");
    return;
  }

  const lines = [];
  lines.push("*Panda · Nuevo pedido*");
  lines.push("");
  cart.forEach((i) =>
    lines.push(`• ${i.name} x${i.qty} — $${formatNumber(i.price * i.qty)}`)
  );

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  lines.push(`\n*Total:* $${formatNumber(total)}`);
  lines.push("\n———");
  lines.push(`*Nombre:* ${name}`);
  lines.push(`*Dirección:* ${address}`);
  lines.push(`*Pago:* ${method}`);
  if (notes) lines.push(`*Notas:* ${notes}`);
  lines.push("\nEnviado desde *panda.shop*");

  const text = encodeURIComponent(lines.join("\n"));
  const url = `https://wa.me/${WHATSAPP_PHONE}?text=${text}`;

  // 🔹 Abrir WhatsApp
  window.open(url, "_blank");

  // 🔹 Vaciar carrito y actualizar UI
  window.__PANDA_STATE__.cart = [];
  saveCart();
  updateCartUI();

  // 🔹 Limpiar formulario
  document.getElementById("buyerName").value = "";
  document.getElementById("buyerAddress").value = "";
  document.getElementById("buyerNotes").value = "";
};


// ==========================================================
// 🔞 VERIFICACIÓN DE EDAD (sin bloqueo permanente)
// ==========================================================
function showAgeGate(){ document.getElementById('ageBackdrop').classList.add('show'); }
function hideAgeGate(){ document.getElementById('ageBackdrop').classList.remove('show'); }

window.acceptAge = ()=>{ 
  localStorage.setItem(AGE_KEY,'1'); 
  hideAgeGate(); 
  applyAgeRestriction('1');
}

window.denyAge = ()=>{ 
  hideAgeGate(); 
  applyAgeRestriction('0'); // No guardamos nada para no bloquearlo
}

// ==========================================================
// 👶 FILTRO AUTOMÁTICO SI ES MENOR
// ==========================================================
function applyAgeRestriction(value){
  if(value === '0'){
    const noAlcohol = PRODUCTS.filter(p => !p.isAlcohol);
    buildFilters(noAlcohol);
    render(noAlcohol);

    const search = document.getElementById('search');
    search.placeholder = "Buscar productos sin alcohol...";
    search.oninput = () => {
      const q = search.value.trim().toLowerCase();
      const filtered = noAlcohol.filter(p => p.name.toLowerCase().includes(q));
      render(filtered);
    };

    const filters = document.getElementById('filters');
    const notice = document.createElement('div');
    notice.style.padding = '10px';
    notice.style.background = '#222';
    notice.style.borderRadius = '10px';
    notice.style.marginBottom = '12px';
    notice.style.fontSize = '14px';
    notice.style.color = '#ff5a5a';
    notice.textContent = 'Modo restringido: solo se muestran productos sin alcohol 🍹';
    filters.before(notice);
  } else {
    buildFilters(PRODUCTS);
    render(PRODUCTS);
  }
}

// ==========================================================
// 🧮 UTILIDADES
// ==========================================================
function formatNumber(n){ return new Intl.NumberFormat('es-AR').format(Math.round(n)); }

