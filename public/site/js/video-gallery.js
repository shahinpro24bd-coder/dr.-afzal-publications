(function () {
  "use strict";
  var root = document.querySelector(".vid");
  if (!root) return;
  var cards = Array.prototype.slice.call(root.querySelectorAll(".vid-card"));
  var chips = Array.prototype.slice.call(root.querySelectorAll(".vid-chip"));
  var search = document.getElementById("vidSearch");
  var empty = document.getElementById("vidEmpty");
  var note = document.getElementById("vidNote");
  var cat = "all";

  function apply() {
    var q = (search.value || "").trim().toLowerCase(), shown = 0;
    cards.forEach(function (c) {
      var ok = (cat === "all" || c.dataset.cat === cat) && (!q || c.dataset.search.indexOf(q) > -1);
      c.hidden = !ok;
      if (ok) { shown++; c.classList.add("is-in"); }
    });
    empty.hidden = shown !== 0;
    note.hidden = cat !== "surgery";
  }
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      cat = chip.dataset.cat;
      chips.forEach(function (c) { var a = c === chip; c.classList.toggle("is-active", a); c.setAttribute("aria-pressed", a ? "true" : "false"); });
      apply();
    });
  });
  search.addEventListener("input", apply);

  // fallback thumbnails
  root.querySelectorAll("img[src*='i.ytimg.com']").forEach(function (img) {
    img.addEventListener("error", function () {
      if (img.src.indexOf("hqdefault") === -1) img.src = img.src.replace(/\/[a-z]+default\.jpg$/, "/hqdefault.jpg");
    }, { once: true });
  });

  // modal player
  var modal = document.getElementById("vidModal");
  var frame = document.getElementById("vidFrame");
  var title = document.getElementById("vidModalTitle");
  function open(id, t) {
    frame.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1" title="' + (t || "YouTube video").replace(/"/g, "&quot;") + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>';
    title.textContent = t || "";
    if (modal.showModal) modal.showModal(); else modal.setAttribute("open", "");
    document.body.style.overflow = "hidden";
  }
  function close() { if (modal.open) modal.close(); }
  modal.addEventListener("close", function () { frame.innerHTML = ""; document.body.style.overflow = ""; });
  modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
  document.getElementById("vidClose").addEventListener("click", close);
  root.querySelectorAll("[data-yt]").forEach(function (b) {
    b.addEventListener("click", function () { open(b.dataset.yt, b.dataset.title); });
  });

  // reveal
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -6% 0px" });
    cards.forEach(function (c) { io.observe(c); });
  } else cards.forEach(function (c) { c.classList.add("is-in"); });
})();
