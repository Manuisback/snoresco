'use strict';

const products = {
  tartan: { id: 'tartan', title: 'MAKE IT TARTAN', price: 39.95, image: 'assets/brazil.webp', alt: 'Models in pink and black SNÖRES graphic tees' },
  arabic: { id: 'arabic', title: 'ARABIC HOODIE AND TEE', price: 39.95, image: 'assets/hoodies.webp', alt: 'Olive and gray hoodies and joggers' },
  scarface: { id: 'scarface', title: 'SCARFACE TEES WHITE AND BLACK', price: 39.95, image: 'assets/tees.webp', alt: 'Black and cream SNÖRES printed T-shirts' },
};
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const money = (value) => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(value);
const announce = (message) => { $('#announcement').textContent = ''; requestAnimationFrame(() => { $('#announcement').textContent = message; }); };

const menuToggle = $('#menuToggle');
const mainNav = $('#mainNav');
const closeMenu = () => { menuToggle.setAttribute('aria-expanded', 'false'); mainNav.classList.remove('is-open'); };
menuToggle.addEventListener('click', () => {
  const next = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(next));
  mainNav.classList.toggle('is-open', next);
});
$$('#mainNav a').forEach((link) => link.addEventListener('click', closeMenu));

const searchPanel = $('#siteSearch');
const searchToggle = $('#searchToggle');
const searchInput = $('#searchInput');
const openSearch = () => { searchPanel.hidden = false; searchToggle.setAttribute('aria-expanded', 'true'); searchInput.focus(); };
const closeSearch = () => { searchPanel.hidden = true; searchToggle.setAttribute('aria-expanded', 'false'); searchToggle.focus(); };
searchToggle.addEventListener('click', () => searchPanel.hidden ? openSearch() : closeSearch());
$('#searchClose').addEventListener('click', closeSearch);
const filterProducts = () => {
  const query = searchInput.value.trim().toLocaleLowerCase('en');
  const cards = $$('.product-card');
  let shown = 0;
  cards.forEach((card) => {
    const isMatch = !query || card.dataset.search.toLowerCase().includes(query) || card.textContent.toLowerCase().includes(query);
    card.hidden = !isMatch;
    if (isMatch) shown++;
  });
  $('#searchStatus').textContent = query ? (shown === 0 ? 'No pieces match your search.' : shown + (shown === 1 ? ' piece found.' : ' pieces found.')) : '';
};
searchInput.addEventListener('input', filterProducts);
searchPanel.addEventListener('submit', (event) => { event.preventDefault(); filterProducts(); $('#shop').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); });

const productDialog = $('#productDialog');
const bagDialog = $('#bagDialog');
let selectedProduct = products.scarface;
let previousFocus = null;
const bag = [];
function openProduct(id) {
  const item = products[id];
  if (!item) return;
  selectedProduct = item;
  previousFocus = document.activeElement;
  $('#dialogTitle').textContent = item.title;
  $('#dialogPrice').textContent = money(item.price);
  $('#dialogImage').src = item.image;
  $('#dialogImage').alt = item.alt;
  productDialog.querySelector('input[value="M"]').checked = true;
  productDialog.showModal();
}
$$('[data-open-product]').forEach((button) => button.addEventListener('click', () => openProduct(button.dataset.openProduct)));
$$('[data-close-dialog]').forEach((button) => button.addEventListener('click', () => { const dialog = document.getElementById(button.dataset.closeDialog); if (dialog?.open) dialog.close(); }));
for (const dialog of [productDialog, bagDialog]) {
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { previousFocus?.focus?.(); });
}
$('#addToBag').addEventListener('click', () => {
  const size = productDialog.querySelector('input[name="productSize"]:checked').value;
  bag.push({ id: selectedProduct.id, size });
  $('#bagCount').textContent = String(bag.length);
  productDialog.close();
  announce(selectedProduct.title + ', size ' + size + ', added to the demo bag.');
});
function renderBag() {
  const list = $('#bagItems');
  list.replaceChildren();
  if (!bag.length) {
    const empty = document.createElement('li');
    empty.textContent = 'Your bag is empty.';
    list.append(empty);
  } else {
    bag.forEach((entry, index) => {
      const product = products[entry.id];
      const li = document.createElement('li');
      li.className = 'bag-item';
      const image = document.createElement('img');
      image.src = product.image;
      image.alt = '';
      const details = document.createElement('div');
      details.className = 'bag-item-info';
      const title = document.createElement('strong');
      title.textContent = product.title;
      const sub = document.createElement('small');
      sub.textContent = 'Size ' + entry.size + ' · ' + money(product.price);
      details.append(title, sub);
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'bag-remove';
      remove.textContent = 'Remove';
      remove.setAttribute('aria-label', 'Remove ' + product.title + ', size ' + entry.size);
      remove.addEventListener('click', () => {
        bag.splice(index, 1);
        $('#bagCount').textContent = String(bag.length);
        renderBag();
        announce(product.title + ' removed from bag.');
      });
      li.append(image, details, remove);
      list.append(li);
    });
  }
  $('#bagTotal').textContent = money(bag.reduce((total, entry) => total + products[entry.id].price, 0));
}
$('#bagToggle').addEventListener('click', () => { previousFocus = document.activeElement; renderBag(); bagDialog.showModal(); });
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (menuToggle.getAttribute('aria-expanded') === 'true') { closeMenu(); menuToggle.focus(); }
  if (!searchPanel.hidden) closeSearch();
});
window.addEventListener('resize', () => { if (innerWidth > 760) closeMenu(); });

