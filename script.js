(function () {
  "use strict";


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

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDropdowns();
  });

  /* Offset anchor scroll for sticky header */
  document.documentElement.style.scrollPaddingTop = "80px";
})();
