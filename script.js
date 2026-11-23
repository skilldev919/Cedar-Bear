(function () {
  "use strict";

  var PRODUCTS = {
    energy: {
      tag: "Endocrine · Herbal Formula",
      title: "Energy & Stamina",
      desc: "Support for your active-day routine. A botanical blend made to help you keep moving from morning trail to evening walk.",
      points: ["Alcohol-free liquid extract", "2 fl oz (60 mL) dropper bottle", "Made in small batches"],
      retail: "$34.95", price: "$27.96", tint: "tint-green"
    },
    adrenal: {
      tag: "Herbal Formula",
      title: "Adrenal Balance",
      desc: "Support for everyday balance and resilience, so busy days feel a little more even.",
      points: ["Alcohol-free liquid extract", "2 fl oz (60 mL) dropper bottle", "Made in small batches"],
      retail: "$32.95", price: "$26.36", tint: "tint-lavender"
    },
    joint: {
      tag: "Structural · Herbal Formula",
      title: "Joint & Muscle",
      desc: "Support for movement and an active lifestyle, featuring warming botanicals like turmeric.",
      points: ["Alcohol-free liquid extract", "2 fl oz (60 mL) dropper bottle", "Made in small batches"],
      retail: "$34.95", price: "$27.96", tint: "tint-peach"
    }
  };

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Navigation ---------- */
  var nav = $("#main-nav");
  var toggle = $(".menu-toggle");
  var dropdowns = $$(".has-dropdown");
  var mobileQuery = window.matchMedia("(max-width: 760px)");

  function closeDropdowns(except) {
    dropdowns.forEach(function (d) {
      if (d !== except) {
        d.classList.remove("open");
        $(".nav-link", d).setAttribute("aria-expanded", "false");
      }
    });
  }
  function closeMenu() {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }

  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (!open) closeDropdowns();
  });

  dropdowns.forEach(function (d) {
    var btn = $(".nav-link", d);
    var hoverTimer;
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = !d.classList.contains("open");
      closeDropdowns(d);
      d.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
    d.addEventListener("mouseenter", function () {
      if (mobileQuery.matches) return;
      clearTimeout(hoverTimer);
      closeDropdowns(d);
      d.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
    });
    d.addEventListener("mouseleave", function () {
      if (mobileQuery.matches) return;
      hoverTimer = setTimeout(function () {
        d.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      }, 150);
    });
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".has-dropdown")) closeDropdowns();
  });

  $$(".main-nav a").forEach(function (a) {
    a.addEventListener("click", function (e) {
      closeDropdowns();
      closeMenu();
      var key = a.getAttribute("data-product");
      if (key) {
        e.preventDefault();
        var card = document.getElementById("product-" + key);
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        flash(card);
      }
    });
  });

  function flash(el) {
    el.animate(
      [{ boxShadow: "0 0 0 0 rgba(247,194,27,0)" }, { boxShadow: "0 0 0 6px rgba(247,194,27,.9)" }, { boxShadow: "0 0 0 0 rgba(247,194,27,0)" }],
      { duration: 1400, delay: 350, easing: "ease-out" }
    );
  }

  /* ---------- Product modal ---------- */
  var modal = $("#product-modal");
  var qty = $("#qty");
  var current = null;
  var lastFocus = null;

  function openModal(key) {
    var p = PRODUCTS[key];
    if (!p) return;
    current = key;
    lastFocus = document.activeElement;
    $("#modal-tag").textContent = p.tag;
    $("#modal-title").textContent = p.title;
    $("#modal-desc").textContent = p.desc;
    $("#modal-retail").textContent = p.retail;
    $("#modal-price").textContent = p.price;
    $("#modal-points").innerHTML = p.points.map(function (t) { return "<li>" + t + "</li>"; }).join("");
    var media = $("#modal-media");
    media.className = "modal-media " + p.tint;
    media.innerHTML = "";
    var bottle = $("#product-" + key + " .bottle").cloneNode(true);
    media.appendChild(bottle);
    qty.value = 1;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    $(".modal-close", modal).focus();
  }
  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  $$(".view-product").forEach(function (b) {
    b.addEventListener("click", function () { openModal(b.getAttribute("data-product")); });
  });
  $$("[data-close]", modal).forEach(function (el) { el.addEventListener("click", closeModal); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (!modal.hidden) closeModal();
      closeDropdowns();
    }
    if (e.key === "Tab" && !modal.hidden) {
      var f = $$("button, input", modal).filter(function (el) { return el.offsetParent !== null; });
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  function clampQty(v) { v = parseInt(v, 10); return isNaN(v) ? 1 : Math.min(10, Math.max(1, v)); }
  $("#qty-minus").addEventListener("click", function () { qty.value = clampQty(qty.value - 1); });
  $("#qty-plus").addEventListener("click", function () { qty.value = clampQty(+qty.value + 1); });
  qty.addEventListener("change", function () { qty.value = clampQty(qty.value); });

  $("#add-to-cart").addEventListener("click", function () {
    var n = clampQty(qty.value);
    closeModal();
    toast(n + " × " + PRODUCTS[current].title + " added to cart");
  });

  /* ---------- Toast ---------- */
  var toastEl = $("#toast"), toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }

  /* Offset anchor scroll for sticky header */
  document.documentElement.style.scrollPaddingTop = "80px";
})();
