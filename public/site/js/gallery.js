/* ==========================================================
   Photo gallery slideshow — Dr. Md. Afzal Mahfuzullah
   Mount: <div data-pgal="home|full"></div> inside section.pgal
   ========================================================== */
(function () {
  "use strict";
  var BASE = "../images/gallery/";
  var DURATION = 5600;

  var CATS = {
    conference: "Conferences",
    training: "Surgical Training",
    portrait: "Portraits",
    travel: "Travel"
  };

  // f = file number, c = category, t = title, p = place / sub-line
  var ITEMS = [
    { f: 1,  c: "conference", t: "Speaking at the BVRS Conference 2026", p: "8th Bangladesh Vitreo-Retina Society Conference" },
    { f: 2,  c: "conference", t: "At the APVRS 2026 Congress", p: "Asia-Pacific Vitreo-Retina Society · Gold Coast, Australia" },
    { f: 3,  c: "conference", t: "8th BVRS Conference 2026", p: "Bangladesh Vitreo-Retina Society" },
    { f: 4,  c: "portrait",   t: "Dr. Md. Afzal Mahfuzullah", p: "Vitreo-Retina Specialist & Phaco Surgeon" },
    { f: 5,  c: "training",   t: "Hands-on surgical training", p: "Vitreo-retinal microsurgery skills lab" },
    { f: 6,  c: "training",   t: "With fellow surgeons", p: "Advanced vitreo-retina training" },
    { f: 7,  c: "training",   t: "Microsurgical practice session", p: "Advanced vitreo-retina training" },
    { f: 8,  c: "training",   t: "Surgical skills lab", p: "With faculty & fellow surgeons" },
    { f: 9,  c: "conference", t: "At the congress exhibition", p: "International vitreo-retina meeting" },
    { f: 10, c: "travel",     t: "Between congress sessions", p: "Australia" },
    { f: 11, c: "portrait",   t: "Dr. Md. Afzal Mahfuzullah", p: "Associate Professor (Vitreo-Retina), BMU" },
    { f: 12, c: "travel",     t: "Sydney Harbour Bridge", p: "Sydney, Australia" },
    { f: 13, c: "travel",     t: "Sydney Harbour", p: "Sydney, Australia" },
    { f: 14, c: "travel",     t: "By the waterfront", p: "Gold Coast, Australia" },
    { f: 15, c: "travel",     t: "Riverside walk", p: "Gold Coast, Australia" },
    { f: 16, c: "travel",     t: "City by the water", p: "Gold Coast, Australia" },
    { f: 17, c: "travel",     t: "Among the towers", p: "Gold Coast, Australia" },
    { f: 18, c: "travel",     t: "Morning stroll", p: "Gold Coast, Australia" },
    { f: 19, c: "travel",     t: "Spring in the park", p: "Australia" },
    { f: 20, c: "travel",     t: "By the beach", p: "Australia" },
    { f: 21, c: "travel",     t: "Out in nature", p: "Australia" },
    { f: 22, c: "travel",     t: "Ocean breeze", p: "Australia" },
    { f: 23, c: "travel",     t: "Afternoon in the park", p: "Australia" },
    { f: 24, c: "travel",     t: "Out & about", p: "Australia" },
    { f: 25, c: "travel",     t: "Golden hour", p: "Australia" },
    { f: 26, c: "travel",     t: "Coastal view", p: "Australia" },
    { f: 27, c: "travel",     t: "In bloom", p: "Australia" },
    { f: 28, c: "travel",     t: "Riverside", p: "Australia" },
    { f: 29, c: "travel",     t: "Lakeside", p: "Australia" },
    { f: 30, c: "travel",     t: "Cloudy afternoon", p: "Australia" }
  ];
  var HOME = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 14];

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function file(n) { return "afzal-" + pad(n) + ".webp"; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function init(mount) {
    var mode = mount.getAttribute("data-pgal");
    var root = mount.closest(".pgal") || mount;
    var source = mode === "home" ? ITEMS.filter(function (it) { return HOME.indexOf(it.f) > -1; }) : ITEMS.slice();
    var list = source.slice();
    var index = 0, dir = 1, timer = null, t0 = 0, remaining = DURATION;
    var pauses = {};
    if (reduceMotion) pauses.user = true;

    // ---------- skeleton ----------
    var filters = "";
    if (mode === "full") {
      filters = '<div class="pgal__filters" role="tablist" aria-label="Filter photos">' +
        '<button type="button" role="tab" class="pgal__chip is-active" data-cat="all" aria-selected="true">All <span>' + ITEMS.length + "</span></button>" +
        Object.keys(CATS).map(function (k) {
          var n = ITEMS.filter(function (it) { return it.c === k; }).length;
          return '<button type="button" role="tab" class="pgal__chip" data-cat="' + k + '" aria-selected="false"><i class="pgal__dot pgal--' + k + '"></i>' + CATS[k] + " <span>" + n + "</span></button>";
        }).join("") + "</div>";
    }
    mount.innerHTML = filters +
      '<div class="pgal__viewer" role="region" aria-roledescription="carousel" aria-label="Photo slideshow">' +
        '<div class="pgal__stage" tabindex="0">' +
          '<div class="pgal__slides"></div>' +
          '<div class="pgal__shade" aria-hidden="true"></div>' +
          '<div class="pgal__bar" aria-hidden="true"><i></i></div>' +
          '<div class="pgal__tools">' +
            '<button type="button" class="pgal__tool pgal__play" aria-label="Pause slideshow"><i class="fas fa-pause"></i></button>' +
            '<button type="button" class="pgal__tool pgal__full" aria-label="View full screen"><i class="fas fa-expand"></i></button>' +
          "</div>" +
          '<button type="button" class="pgal__nav pgal__nav--prev" aria-label="Previous photo"><i class="fas fa-arrow-left"></i></button>' +
          '<button type="button" class="pgal__nav pgal__nav--next" aria-label="Next photo"><i class="fas fa-arrow-right"></i></button>' +
          '<div class="pgal__caption" aria-live="polite"></div>' +
          '<div class="pgal__count" aria-hidden="true"><b>01</b><span>/ 01</span></div>' +
        "</div>" +
        '<div class="pgal__strip"><div class="pgal__thumbs" role="tablist" aria-label="Choose photo"></div></div>' +
      "</div>";

    var viewer = mount.querySelector(".pgal__viewer");
    var stage = mount.querySelector(".pgal__stage");
    var slidesEl = mount.querySelector(".pgal__slides");
    var thumbsEl = mount.querySelector(".pgal__thumbs");
    var strip = mount.querySelector(".pgal__strip");
    var caption = mount.querySelector(".pgal__caption");
    var countB = mount.querySelector(".pgal__count b");
    var countS = mount.querySelector(".pgal__count span");
    var bar = mount.querySelector(".pgal__bar i");
    var playBtn = mount.querySelector(".pgal__play");
    var fullBtn = mount.querySelector(".pgal__full");
    var slides = [], thumbs = [];

    function render() {
      slidesEl.innerHTML = list.map(function (it, i) {
        return '<figure class="pgal__slide" aria-roledescription="slide" aria-label="' + (i + 1) + " of " + list.length + '">' +
          '<div class="pgal__backdrop" style="background-image:url(' + BASE + "thumbs/" + file(it.f) + ')"></div>' +
          '<div class="pgal__frame"><img alt="' + esc(it.t + " — " + it.p) + '" data-src="' + BASE + file(it.f) + '" decoding="async"/></div>' +
          "</figure>";
      }).join("");
      thumbsEl.innerHTML = list.map(function (it, i) {
        return '<button type="button" role="tab" class="pgal__thumb" aria-label="Show photo ' + (i + 1) + ": " + esc(it.t) + '">' +
          '<img alt="" loading="lazy" decoding="async" src="' + BASE + "thumbs/" + file(it.f) + '"/></button>';
      }).join("");
      slides = [].slice.call(slidesEl.children);
      thumbs = [].slice.call(thumbsEl.children);
      thumbs.forEach(function (b, i) { b.addEventListener("click", function () { go(i); }); });
      countS.textContent = "/ " + pad(list.length);
    }

    function load(i) {
      var s = slides[(i + list.length) % list.length];
      if (!s) return;
      var img = s.querySelector("img[data-src]");
      if (!img) return;
      img.onload = function () { s.classList.add("is-loaded"); };
      img.src = img.getAttribute("data-src");
      img.removeAttribute("data-src");
      if (img.complete) s.classList.add("is-loaded");
    }

    function go(i, d) {
      var n = list.length;
      var next = (i + n) % n;
      dir = d || (next >= index ? 1 : -1);
      var prev = slides[index];
      index = next;
      root.style.setProperty("--pgal-dir", dir);
      slides.forEach(function (s, k) {
        s.classList.toggle("is-active", k === index);
        s.classList.toggle("is-leaving", s === prev && k !== index);
        s.setAttribute("aria-hidden", k === index ? "false" : "true");
      });
      thumbs.forEach(function (b, k) {
        b.classList.toggle("is-active", k === index);
        b.setAttribute("aria-selected", k === index ? "true" : "false");
      });
      load(index); load(index + 1); load(index - 1);

      var it = list[index];
      caption.innerHTML = '<span class="pgal__tag"><i class="pgal__dot pgal--' + it.c + '"></i>' + CATS[it.c] + "</span>" +
        "<h3>" + esc(it.t) + "</h3>" +
        '<p><i class="fas fa-map-marker-alt"></i>' + esc(it.p) + "</p>";
      caption.classList.remove("is-in"); void caption.offsetWidth; caption.classList.add("is-in");
      countB.textContent = pad(index + 1);

      var th = thumbs[index];
      if (th) strip.scrollTo({ left: th.offsetLeft - strip.clientWidth / 2 + th.clientWidth / 2, behavior: reduceMotion ? "auto" : "smooth" });

      // restart autoplay
      remaining = DURATION;
      bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = "";
      clearTimeout(timer); timer = null;
      run();
    }

    function isPaused() { for (var k in pauses) if (pauses[k]) return true; return false; }
    function run() {
      root.classList.toggle("is-paused", isPaused());
      if (isPaused() || timer) return;
      t0 = Date.now();
      timer = setTimeout(function () { timer = null; go(index + 1, 1); }, remaining);
    }
    function hold(reason, on) {
      var was = isPaused();
      pauses[reason] = on;
      if (!was && isPaused() && timer) {
        clearTimeout(timer); timer = null;
        remaining = Math.max(400, remaining - (Date.now() - t0));
      }
      run();
    }
    function setUserPause(on) {
      hold("user", on);
      playBtn.innerHTML = on ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
      playBtn.setAttribute("aria-label", on ? "Play slideshow" : "Pause slideshow");
    }

    // ---------- expanded (lightbox) ----------
    function setExpanded(on) {
      root.classList.toggle("is-expanded", on);
      document.documentElement.classList.toggle("pgal-lock", on);
      fullBtn.innerHTML = on ? '<i class="fas fa-compress"></i>' : '<i class="fas fa-expand"></i>';
      fullBtn.setAttribute("aria-label", on ? "Exit full screen" : "View full screen");
      if (on) stage.focus({ preventScroll: true });
      setTimeout(function () { go(index, dir); }, 30);
    }

    // ---------- events ----------
    mount.querySelector(".pgal__nav--prev").addEventListener("click", function () { go(index - 1, -1); });
    mount.querySelector(".pgal__nav--next").addEventListener("click", function () { go(index + 1, 1); });
    playBtn.addEventListener("click", function () { setUserPause(!pauses.user); });
    fullBtn.addEventListener("click", function () { setExpanded(!root.classList.contains("is-expanded")); });

    viewer.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1, -1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1, 1); }
      else if (e.key === "Escape" && root.classList.contains("is-expanded")) setExpanded(false);
    });

    stage.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") hold("hover", true); });
    stage.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") hold("hover", false); });

    // swipe + tap to open
    var sx = 0, sy = 0, down = false;
    stage.addEventListener("pointerdown", function (e) {
      if (e.target.closest("button")) return;
      down = true; sx = e.clientX; sy = e.clientY;
    });
    stage.addEventListener("pointerup", function (e) {
      if (!down) return; down = false;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      else if (Math.abs(dx) < 8 && Math.abs(dy) < 8 && e.target.closest(".pgal__frame") && !root.classList.contains("is-expanded")) setExpanded(true);
    });
    stage.addEventListener("pointercancel", function () { down = false; });

    document.addEventListener("visibilitychange", function () { hold("hidden", document.hidden); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        if (!root.classList.contains("is-expanded")) hold("offscreen", !en[0].isIntersecting);
      }, { threshold: 0.25 }).observe(stage);
    }

    var chips = [].slice.call(mount.querySelectorAll(".pgal__chip"));
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var cat = chip.getAttribute("data-cat");
        chips.forEach(function (c) { var on = c === chip; c.classList.toggle("is-active", on); c.setAttribute("aria-selected", on ? "true" : "false"); });
        list = cat === "all" ? source.slice() : source.filter(function (it) { return it.c === cat; });
        index = 0; render(); go(0, 1);
      });
    });

    render();
    setUserPause(!!pauses.user);
    go(0, 1);
  }

  function boot() { [].forEach.call(document.querySelectorAll("[data-pgal]"), init); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
