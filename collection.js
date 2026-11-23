(function () {
  "use strict";

  var PRODUCTS = {
    energy:  { name: "Energy & Stamina", price: 27.96, keywords: "energy stamina endocrine activating exercise endurance gotu kola ginkgo guarana ashwagandha yerba mate hawthorn green tea eleuthero bupleurum tongkat ali" },
    adrenal: { name: "Adrenal Balance",  price: 26.36, keywords: "adrenal balance stress endocrine building astragalus wood betony ginkgo eleuthero gotu kola rhodiola licorice lavender spearmint passionflower" },
    joint:   { name: "Joint & Muscle",   price: 27.96, keywords: "joint muscle structural tissue alfalfa nettle cat's claw cats claw devil's claw devils claw turmeric horsetail cornsilk fenugreek cinnamon cassia yucca black walnut" }
  };
  var BUNDLE_MIN = 3, BUNDLE_RATE = 0.05, MAX_QTY = 12;
  var CART_KEY = "cbn_cart_v1";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var money = function (n) { return "$" + n.toFixed(2); };
  var round2 = function (n) { return Math.round(n * 100) / 100; };

  $("#year").textContent = new Date().getFullYear();

  /* =========================================================
     Navigation (dropdowns + mobile menu)
     ========================================================= */
  var nav = $("#main-nav");
  var menuToggle = $(".menu-toggle");
  var dropdowns = $$(".has-dropdown");
  var mobileQuery = window.matchMedia("(max-width: 760px)");

  function closeDropdowns(except) {
    dropdowns.forEach(function (d) {
      if (d !== except) { d.classList.remove("open"); $(".nav-link", d).setAttribute("aria-expanded", "false"); }
    });
  }
  function closeMenu() {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
  }
  menuToggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open) { closeCart(); closeSearch(); } else closeDropdowns();
  });
  dropdowns.forEach(function (d) {
    var btn = $(".nav-link", d), timer;
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = !d.classList.contains("open");
      closeDropdowns(d);
      d.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
    d.addEventListener("mouseenter", function () {
      if (mobileQuery.matches) return;
      clearTimeout(timer); closeDropdowns(d);
      d.classList.add("open"); btn.setAttribute("aria-expanded", "true");
    });
    d.addEventListener("mouseleave", function () {
      if (mobileQuery.matches) return;
      timer = setTimeout(function () { d.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }, 150);
    });
  });
  $$(".main-nav a").forEach(function (a) {
    a.addEventListener("click", function (e) {
      closeDropdowns(); closeMenu();
      var key = a.getAttribute("data-open");
      if (key) { e.preventDefault(); openDetails(key, true); }
    });
  });

  /* =========================================================
     Product details (one open at a time)
     ========================================================= */
  function openDetails(key, scroll) {
    var card = document.getElementById(key);
    var panel = document.getElementById("details-" + key);
    if (!card || !panel) return;
    $$(".shop-card").forEach(function (c) {
      var k = c.getAttribute("data-product");
      var p = document.getElementById("details-" + k);
      var btn = $(".details-btn", c);
      var on = k === key;
      c.classList.toggle("is-open", on);
      p.hidden = !on;
      btn.setAttribute("aria-expanded", String(on));
    });
    if (history.replaceState) history.replaceState(null, "", "#" + key);
    if (scroll) card.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function closeDetails(key) {
    var card = document.getElementById(key);
    card.classList.remove("is-open");
    document.getElementById("details-" + key).hidden = true;
    $(".details-btn", card).setAttribute("aria-expanded", "false");
    if (history.replaceState) history.replaceState(null, "", location.pathname);
  }
  $$(".shop-card").forEach(function (card) {
    var key = card.getAttribute("data-product");
    $(".details-btn", card).addEventListener("click", function () {
      if (card.classList.contains("is-open")) closeDetails(key); else openDetails(key, false);
    });
  });

  /* =========================================================
     Quantity steppers
     ========================================================= */
  function clampQty(v) { v = parseInt(v, 10); return isNaN(v) ? 1 : Math.min(MAX_QTY, Math.max(1, v)); }
  $$(".stepper").forEach(function (s) {
    var input = $(".step-input", s);
    $(".step-minus", s).addEventListener("click", function () { input.value = clampQty(+input.value - 1); });
    $(".step-plus", s).addEventListener("click", function () { input.value = clampQty(+input.value + 1); });
    input.addEventListener("change", function () { input.value = clampQty(input.value); });
  });

  /* =========================================================
     Pricing helpers (bundle: any 3+ bottles → extra 5% off + free shipping)
     ========================================================= */
  function totals(items) {
    var count = 0, subtotal = 0;
    Object.keys(items).forEach(function (k) { count += items[k]; subtotal += items[k] * PRODUCTS[k].price; });
    subtotal = round2(subtotal);
    var bundle = count >= BUNDLE_MIN;
    var savings = bundle ? round2(subtotal * BUNDLE_RATE) : 0;
    return { count: count, subtotal: subtotal, savings: savings, total: round2(subtotal - savings), bundle: bundle };
  }
  function bottles(n) { return n + (n === 1 ? " Bottle" : " Bottles"); }

  /* =========================================================
     "Your Selection" — built with each card's Add to Cart button
     ========================================================= */
  var selection = {};
  var selBar = $(".selection-bar");
  var addSelectedBtn = $("#add-selected");
  var bundleBox = $(".bundle-box");

  function renderSelection() {
    var t = totals(selection);
    $("#sel-count").textContent = bottles(t.count);
    $("#sel-subtotal").textContent = money(t.total);
    var hint = $("#sel-hint");
    if (t.count === 0) hint.textContent = "Add any 3 bottles to save an extra 5% + free shipping.";
    else if (!t.bundle) hint.textContent = "Add " + (BUNDLE_MIN - t.count) + " more for an extra 5% off + free shipping.";
    else hint.textContent = "Bundle unlocked: you save " + money(t.savings) + " + free shipping!";
    addSelectedBtn.classList.toggle("is-empty", t.count === 0);
    bundleBox.classList.toggle("unlocked", t.bundle);
  }

  $$(".shop-card").forEach(function (card) {
    var key = card.getAttribute("data-product");
    var input = $(".step-input", card);
    var btn = $(".add-btn", card);
    btn.addEventListener("click", function () {
      var qty = clampQty(input.value);
      selection[key] = Math.min(MAX_QTY * 3, (selection[key] || 0) + qty);
      renderSelection();
      selBar.classList.remove("pulse"); void selBar.offsetWidth; selBar.classList.add("pulse");
      btn.classList.add("added");
      setTimeout(function () { btn.classList.remove("added"); }, 600);
      toast(qty + " × " + PRODUCTS[key].name + " added to your selection");
      input.value = 1;
    });
  });

  addSelectedBtn.addEventListener("click", function () {
    var t = totals(selection);
    if (!t.count) { toast("Choose a formula and press Add to Cart first."); return; }
    Object.keys(selection).forEach(function (k) { cart[k] = (cart[k] || 0) + selection[k]; });
    selection = {};
    saveCart(); renderSelection(); renderCart();
    var badge = $("#cart-count");
    badge.classList.remove("bump"); void badge.offsetWidth; badge.classList.add("bump");
    toast(bottles(t.count) + " added to your cart" + (t.bundle ? " — 5% bundle savings applied" : ""));
  });

  /* =========================================================
     Cart (header badge + mini cart), remembered in this browser
     ========================================================= */
  var cart = loadCart();
  var miniCart = $("#mini-cart");
  var cartToggle = $("#cart-toggle");

  function loadCart() {
    try {
      var raw = JSON.parse(localStorage.getItem(CART_KEY) || "{}"), out = {};
      Object.keys(raw).forEach(function (k) { if (PRODUCTS[k] && raw[k] > 0) out[k] = raw[k] | 0; });
      return out;
    } catch (e) { return {}; }
  }
  function saveCart() { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {} }

  function renderCart() {
    var t = totals(cart);
    $("#cart-count").textContent = t.count;
    cartToggle.setAttribute("aria-label", "Cart, " + bottles(t.count).toLowerCase());
    var list = $("#mc-list");
    list.innerHTML = "";
    Object.keys(cart).forEach(function (k) {
      var li = document.createElement("li");
      li.innerHTML = '<span class="mc-name"></span><span class="mc-qty"></span><button type="button" class="mc-remove">Remove</button>';
      $(".mc-name", li).textContent = PRODUCTS[k].name;
      $(".mc-qty", li).textContent = cart[k] + " × " + money(PRODUCTS[k].price);
      $(".mc-remove", li).addEventListener("click", function () { delete cart[k]; saveCart(); renderCart(); });
      list.appendChild(li);
    });
    $("#mc-empty").hidden = t.count > 0;
    $("#mc-checkout").hidden = t.count === 0;
    var tot = $("#mc-totals");
    if (!t.count) { tot.innerHTML = ""; return; }
    tot.innerHTML =
      "<div><span>Subtotal</span><span>" + money(t.subtotal) + "</span></div>" +
      (t.bundle ? '<div class="save"><span>Extra 5% Bundle Savings</span><span>−' + money(t.savings) + "</span></div>" : "") +
      "<div><span>Shipping</span><span>" + (t.bundle ? "FREE" : "Calculated at checkout") + "</span></div>" +
      '<div class="grand"><span>Total</span><span>' + money(t.total) + "</span></div>";
  }

  function openCart() { miniCart.hidden = false; cartToggle.setAttribute("aria-expanded", "true"); closeSearch(); closeMenu(); }
  function closeCart() { miniCart.hidden = true; cartToggle.setAttribute("aria-expanded", "false"); }
  cartToggle.addEventListener("click", function (e) { e.stopPropagation(); if (miniCart.hidden) openCart(); else closeCart(); });
  $("#mc-close").addEventListener("click", closeCart);
  miniCart.addEventListener("click", function (e) { e.stopPropagation(); });
  $("#mc-checkout").addEventListener("click", function () { toast("Checkout isn’t connected yet — your cart is saved."); });

  /* =========================================================
     Search (filters the product cards by name or ingredient)
     ========================================================= */
  var searchBar = $("#search-bar"), searchInput = $("#search-input"), searchToggle = $("#search-toggle");
  function openSearch() { searchBar.hidden = false; searchToggle.setAttribute("aria-expanded", "true"); closeCart(); searchInput.focus(); }
  function closeSearch() {
    searchBar.hidden = true; searchToggle.setAttribute("aria-expanded", "false");
    if (searchInput.value) { searchInput.value = ""; filter(""); }
  }
  function filter(q) {
    q = q.trim().toLowerCase();
    var shown = 0;
    $$(".shop-card").forEach(function (c) {
      var k = c.getAttribute("data-product");
      var hit = !q || (PRODUCTS[k].name.toLowerCase() + " " + PRODUCTS[k].keywords).indexOf(q) !== -1;
      c.hidden = !hit;
      if (!hit && c.classList.contains("is-open")) closeDetails(k);
      if (hit) shown++;
    });
    $("#no-results").hidden = shown > 0;
  }
  searchToggle.addEventListener("click", function () { if (searchBar.hidden) openSearch(); else closeSearch(); });
  $("#search-close").addEventListener("click", closeSearch);
  searchInput.addEventListener("input", function () { filter(searchInput.value); });

  /* ---------- Global close handlers ---------- */
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".has-dropdown")) closeDropdowns();
    if (!e.target.closest("#mini-cart") && !e.target.closest("#cart-toggle")) closeCart();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeDropdowns(); closeCart(); if (!searchBar.hidden) closeSearch(); }
  });

  /* ---------- Toast ---------- */
  var toastEl = $("#toast"), toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }

  /* ---------- Init ---------- */
  document.documentElement.style.scrollPaddingTop = "96px";
  renderSelection();
  renderCart();
  function openFromHash(e) {
    var key = location.hash.replace("#", "");
    if (!PRODUCTS[key]) return;
    openDetails(key, false);
    var card = document.getElementById(key);
    var panel = document.getElementById("details-" + key);
    // Wait for layout (fonts/images) so the scroll lands on the opened product.
    setTimeout(function () {
      card.scrollIntoView({ behavior: (e && e.type === "hashchange") ? "smooth" : "auto", block: "start" });
      if (panel.animate) {
        panel.animate(
          [{ boxShadow: "0 0 0 0 rgba(247,194,27,0)" }, { boxShadow: "0 0 0 5px rgba(247,194,27,.85)" }, { boxShadow: "0 0 0 0 rgba(247,194,27,0)" }],
          { duration: 1500, delay: 500, easing: "ease-out" }
        );
      }
    }, 120);
  }
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.addEventListener("hashchange", openFromHash);
  if (document.readyState === "complete") openFromHash();
  else window.addEventListener("load", openFromHash);
})();
