document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Mobile nav ---------- */
  (function () {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.querySelector('.nav-links');
    if (!toggle || !links) return;

    function close() {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('is-open')) { close(); toggle.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (!links.classList.contains('is-open')) return;
      if (links.contains(e.target) || toggle.contains(e.target)) return;
      close();
    });
  })();

  /* ---------- Reviews carousel ---------- */
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  Array.prototype.forEach.call(document.querySelectorAll('[data-rev-carousel]'), function (root) {
    var slides = root.querySelectorAll('[data-rev-slide]');
    var dots = root.querySelectorAll('[data-rev-dot]');
    var prev = root.querySelector('[data-rev-prev]');
    var next = root.querySelector('[data-rev-next]');
    var pauseBtn = root.querySelector('[data-rev-pause]');
    if (slides.length < 2) return;

    var index = 0;
    var delay = parseInt(root.getAttribute('data-rev-interval'), 10) || 7000;
    var timer = null;
    // Once the visitor navigates manually (or hits pause), autoplay stays off.
    var userStopped = false;

    function show(i) {
      index = (i + slides.length) % slides.length;
      Array.prototype.forEach.call(slides, function (s, n) {
        var on = n === index;
        s.classList.toggle('is-active', on);
        if (on) { s.removeAttribute('aria-hidden'); } else { s.setAttribute('aria-hidden', 'true'); }
      });
      Array.prototype.forEach.call(dots, function (d, n) {
        d.classList.toggle('is-active', n === index);
      });
    }

    function start() {
      if (reduceMotion || userStopped) return;
      stop();
      timer = setInterval(function () { show(index + 1); }, delay);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function haltAutoplay() {
      userStopped = true;
      stop();
      if (pauseBtn) {
        pauseBtn.setAttribute('aria-pressed', 'true');
        pauseBtn.setAttribute('aria-label', 'Resume automatic rotation');
        pauseBtn.textContent = '\u25B6';
      }
    }
    function jump(i) { show(i); haltAutoplay(); }

    if (prev) prev.addEventListener('click', function () { jump(index - 1); });
    if (next) next.addEventListener('click', function () { jump(index + 1); });
    Array.prototype.forEach.call(dots, function (d) {
      d.addEventListener('click', function () {
        jump(parseInt(d.getAttribute('data-rev-dot'), 10));
      });
    });
    if (pauseBtn) {
      pauseBtn.addEventListener('click', function () {
        if (userStopped) {
          userStopped = false;
          pauseBtn.setAttribute('aria-pressed', 'false');
          pauseBtn.setAttribute('aria-label', 'Pause automatic rotation');
          pauseBtn.textContent = '\u275A\u275A';
          start();
        } else {
          haltAutoplay();
        }
      });
    }

    // Pause while the visitor is reading or tabbing through
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { stop(); } else { start(); }
    });

    // Swipe on touch devices
    var x0 = null, y0 = null;
    root.addEventListener('touchstart', function (e) {
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; stop();
    }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      var dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
        show(dx < 0 ? index + 1 : index - 1);
        haltAutoplay();
      }
      x0 = null; y0 = null;
      start();
    }, { passive: true });

    // Arrow keys when the carousel has focus
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { jump(index - 1); }
      else if (e.key === 'ArrowRight') { jump(index + 1); }
    });

    show(0);
    start();
  });
});
