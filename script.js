(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var navbar = document.getElementById("navbar");
  var navLinks = document.getElementById("navLinks");
  var menuToggle = document.getElementById("menuToggle");
  var progressBar = document.getElementById("progressBar");

  /* ---------- Navbar + reading progress ---------- */
  function onScroll() {
    navbar.classList.toggle("scrolled", window.scrollY > 30);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  function setMenu(open) {
    navLinks.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  }
  menuToggle.addEventListener("click", function () {
    setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
  });
  navLinks.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  window.addEventListener("resize", function () { if (window.innerWidth > 1000) setMenu(false); });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("active"); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("reveal"); });
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("active"); ro.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { ro.observe(el); });
  }

  /* ---------- Active nav link ---------- */
  var navItems = document.querySelectorAll("[data-nav]");
  if ("IntersectionObserver" in window) {
    var no = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        navItems.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === "#" + id);
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    navItems.forEach(function (a) {
      var s = document.querySelector(a.getAttribute("href"));
      if (s) no.observe(s);
    });
  }

  /* ---------- Hero: query -> article ---------- */
  var QUERIES = [
    { q: "simple skincare routine for men", intent: "Informational", title: "Simple Skincare Routine for Men: A No-Stress Guide for Dry Skin" },
    { q: "cerave vs cetaphil cleanser", intent: "Commercial", title: "CeraVe vs Cetaphil Cleanser: Which One Is Better for Dry Skin?" },
    { q: "how to pick the right cleanser", intent: "Informational", title: "How to Pick the Right Cleanser (Without Wasting Money)" }
  ];
  var heroQuery = document.getElementById("heroQuery");
  var heroAnswer = document.getElementById("heroAnswer");
  var buttons = document.querySelectorAll(".query-btn");
  var current = 0, timer = null;

  function show(i) {
    current = i;
    var item = QUERIES[i];
    heroAnswer.classList.add("fade");
    setTimeout(function () {
      heroQuery.textContent = item.q;
      var tag = heroAnswer.querySelector(".intent-tag");
      tag.textContent = item.intent;
      tag.className = "intent-tag " + item.intent.toLowerCase();
      heroAnswer.querySelector(".answer-title").textContent = item.title;
      heroAnswer.classList.remove("fade");
    }, reduceMotion ? 0 : 220);
    buttons.forEach(function (b, n) { b.classList.toggle("active", n === i); });
  }
  function start() {
    if (reduceMotion) return;
    stop();
    timer = setInterval(function () { show((current + 1) % QUERIES.length); }, 4200);
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  buttons.forEach(function (b) {
    b.addEventListener("click", function () { stop(); show(+b.getAttribute("data-i")); });
  });
  start();

  /* ---------- Keyword table filters ---------- */
  var chips = document.querySelectorAll(".chip[data-filter]");
  var rows = document.querySelectorAll("#kwTable tbody tr");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var f = chip.getAttribute("data-filter");
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle("active", on);
        c.setAttribute("aria-pressed", String(on));
      });
      rows.forEach(function (r) {
        var show = f === "all" ||
          (f === "used" ? r.hasAttribute("data-used") : r.getAttribute("data-intent") === f);
        r.hidden = !show;
      });
    });
  });

  /* ---------- Image viewer ---------- */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lastFocus = null;

  document.querySelectorAll(".shot-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      lastFocus = btn;
      lbImg.src = btn.getAttribute("data-full");
      lbImg.alt = btn.getAttribute("data-alt") || "";
      if (typeof lb.showModal === "function") {
        lb.showModal();
      } else {
        window.open(btn.getAttribute("data-full"), "_blank", "noopener");
      }
    });
  });
  function closeLb() { if (lb.open) lb.close(); }
  document.getElementById("lbClose").addEventListener("click", closeLb);
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  lb.addEventListener("close", function () { if (lastFocus) lastFocus.focus(); });
})();
