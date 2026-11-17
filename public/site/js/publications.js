(function () {
  "use strict";
  var root = document.querySelector(".pub");
  if (!root) return;

  // keep sticky toolbar below the site navbar
  var nav = document.querySelector(".sticky-top");
  function setNav() { if (nav) root.style.setProperty("--nav-h", nav.offsetHeight + "px"); }
  setNav(); window.addEventListener("resize", setNav);

  var cards = Array.prototype.slice.call(root.querySelectorAll(".pub-card"));
  var years = Array.prototype.slice.call(root.querySelectorAll(".pub-year"));
  var chips = Array.prototype.slice.call(root.querySelectorAll(".pub-chip"));
  var search = document.getElementById("pubSearch");
  var first = document.getElementById("pubFirst");
  var count = document.getElementById("pubCount");
  var empty = document.getElementById("pubEmpty");
  var reset = document.getElementById("pubReset");
  var topic = "all";

  function apply() {
    var q = (search.value || "").trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (c) {
      var ok = (topic === "all" || (" " + c.dataset.topics + " ").indexOf(" " + topic + " ") > -1) &&
               (!first.checked || c.dataset.first === "1") &&
               (!q || c.dataset.search.indexOf(q) > -1);
      c.hidden = !ok;
      if (ok) { shown++; c.classList.add("is-in"); }
    });
    years.forEach(function (y) {
      var n = y.querySelectorAll(".pub-card:not([hidden])").length;
      y.hidden = n === 0;
      var b = y.querySelector(".pub-year__count"); if (b) b.textContent = n;
      var s = y.querySelector(".pub-year__label small"); if (s && b) s.lastChild.textContent = n === 1 ? " paper" : " papers";
    });
    count.textContent = shown + " of " + cards.length;
    empty.hidden = shown !== 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      topic = chip.dataset.topic;
      chips.forEach(function (c) { var a = c === chip; c.classList.toggle("is-active", a); c.setAttribute("aria-pressed", a ? "true" : "false"); });
      apply();
    });
  });
  search.addEventListener("input", apply);
  first.addEventListener("change", apply);
  reset.addEventListener("click", function () {
    search.value = ""; first.checked = false; topic = "all";
    chips.forEach(function (c) { var a = c.dataset.topic === "all"; c.classList.toggle("is-active", a); c.setAttribute("aria-pressed", a ? "true" : "false"); });
    apply();
  });

  // reveal on scroll
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    cards.forEach(function (c) { io.observe(c); });
  } else { cards.forEach(function (c) { c.classList.add("is-in"); }); }

  // count-up stats
  root.querySelectorAll("[data-count]").forEach(function (el) {
    var end = +el.dataset.count, t0 = null;
    function step(t) { t0 = t0 || t; var p = Math.min((t - t0) / 1200, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  });
})();
