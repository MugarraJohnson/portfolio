/* ═══════════════════════════════════════════════════
   script.js — Johnson Mugarra Portfolio
   ═══════════════════════════════════════════════════ */
'use strict';

document.addEventListener('DOMContentLoaded', function () {

  /* ── Page Loader ─────────────────────────────────────── */
  window.addEventListener('load', function () {
    var loader = document.getElementById('page-loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(function () { loader.style.display = 'none'; }, 300);
    }
  });


  /* ── Theme toggle ────────────────────────────────────── */
  var root        = document.documentElement;
  var toggleBtn   = document.getElementById('theme-toggle');
  var STORAGE_KEY = 'jm-theme';

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (toggleBtn) {
      toggleBtn.textContent = theme === 'light' ? '🌙' : '☀️'; /* 🌙 / ☀️ */
      toggleBtn.setAttribute('aria-label',
        theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    }
    if (typeof dataLayer !== 'undefined') {
      dataLayer.push({ event: 'theme_change', theme: theme });
    }
  }

  /* Respect saved preference → OS preference → default dark */
  var saved  = localStorage.getItem(STORAGE_KEY);
  var osDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (osDark ? 'dark' : 'light'));

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      localStorage.setItem(STORAGE_KEY, next);
    });
  }

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!localStorage.getItem(STORAGE_KEY)) applyTheme(e.matches ? 'dark' : 'light');
    });
  }


  /* ── EmailJS ─────────────────────────────────────────── */
  var EJS_SERVICE  = 'service_51t4hfn';
  var EJS_TEMPLATE = 'template_tutr40i';
  var EJS_KEY      = 'i8KrO_W-JbnVbaLqL';

  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EJS_KEY });
  }


  /* ── 1. Scroll progress bar ──────────────────────────── */
  var progressBar = document.getElementById('progress-bar');
  window.addEventListener('scroll', function () {
    if (!progressBar) return;
    var pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    progressBar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });


  /* ── 2. Nav glass + active section highlight ─────────── */
  var navbar   = document.getElementById('navbar');
  var navLinks = document.querySelectorAll('.nav-links a');
  var sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', function () {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);

    var current = '';
    sections.forEach(function (sec) {
      if (window.scrollY >= sec.offsetTop - 130) current = sec.id;
    });
    navLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      link.classList.toggle('active', href === '#' + current);
    });
  }, { passive: true });


  /* ── 3. Mobile menu ──────────────────────────────────── */
  var ham    = document.getElementById('ham');
  var mmenu  = document.getElementById('mob-menu');
  var mclose = document.getElementById('mob-close');

  function openMenu() {
    if (mmenu) mmenu.classList.add('open');
    if (ham)   ham.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    if (mmenu) mmenu.classList.remove('open');
    if (ham)   ham.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (ham)    ham.addEventListener('click', openMenu);
  if (mclose) mclose.addEventListener('click', closeMenu);
  if (mmenu) {
    mmenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }


  /* ── 4. Skill bars ───────────────────────────────────── */
  var skillSection = document.getElementById('skill-bars');
  if (skillSection) {
    var animateBars = function () {
      skillSection.querySelectorAll('.sk-fill').forEach(function (fill) {
        fill.style.width = (fill.dataset.w || '0') + '%';
      });
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries, obs) {
        if (entries[0].isIntersecting) { setTimeout(animateBars, 100); obs.disconnect(); }
      }, { threshold: 0.15 }).observe(skillSection);
    } else {
      animateBars();
    }
  }


  /* ── 5. Metrics counter ──────────────────────────────── */
  function countUp(el, target, duration) {
    if (!el) return;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p    = Math.min((ts - start) / duration, 1);
      var ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(ease * target);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  var metricsEl = document.getElementById('metrics');
  if (metricsEl) {
    var counted = false;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries, obs) {
        if (entries[0].isIntersecting && !counted) {
          counted = true;
          countUp(document.getElementById('m1'), 95, 1500);
          countUp(document.getElementById('m2'), 90, 1500);
          countUp(document.getElementById('m3'), 85, 1600);
          countUp(document.getElementById('m4'), 6,  1200);
          obs.disconnect();
        }
      }, { threshold: 0.4 }).observe(metricsEl);
    } else {
      [['m1',95],['m2',90],['m3',85],['m4',6]].forEach(function (pair) {
        var el = document.getElementById(pair[0]);
        if (el) el.textContent = pair[1];
      });
    }
  }


  /* ── 6. Project filter ───────────────────────────────── */
  var filterRow = document.getElementById('filter-row');
  if (filterRow) {
    var hideTimers = new WeakMap();

    filterRow.addEventListener('click', function (e) {
      var btn = e.target.closest('.filt');
      if (!btn) return;

      document.querySelectorAll('.filt').forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      var f = btn.getAttribute('data-f');

      document.querySelectorAll('.proj-card').forEach(function (card) {
        var cats  = (card.getAttribute('data-cat') || '').split(' ');
        var match = f === 'all' || cats.indexOf(f) !== -1;

        if (hideTimers.has(card)) { clearTimeout(hideTimers.get(card)); hideTimers.delete(card); }

        if (match) {
          card.classList.add('hiding');
          card.classList.remove('hidden');
          void card.offsetWidth;
          card.classList.remove('hiding');
        } else {
          card.classList.add('hiding');
          var t = setTimeout(function () { card.classList.add('hidden'); hideTimers.delete(card); }, 360);
          hideTimers.set(card, t);
        }
      });
    });
  }


  /* ── 7. Contact form — EmailJS → Formspree → mailto ─────
     Three-layer fallback so messages always get through.
  ──────────────────────────────────────────────────────── */
  var FORMSPREE_ID  = 'xpqyjjbq';
  var CONTACT_EMAIL = 'johnsonmugarra@yahoo.com';

  var form    = document.getElementById('contact-form');
  var sendBtn = document.getElementById('send-btn');
  var fMsg    = document.getElementById('f-msg');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name    = form.querySelector('[name="name"]').value.trim();
      var email   = form.querySelector('[name="email"]').value.trim();
      var subject = (form.querySelector('[name="subject"]').value.trim()) || 'Portfolio enquiry';
      var message = form.querySelector('[name="message"]').value.trim();

      if (!name || !email || !message) {
        showMsg('error', '&#x26A0; Please fill in your name, email and message.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMsg('error', '&#x26A0; Please enter a valid email address.');
        return;
      }

      setBusy(true);

      if (typeof emailjs !== 'undefined') {
        emailjs.send(EJS_SERVICE, EJS_TEMPLATE, {
          from_name:  name,
          from_email: email,
          reply_to:   email,
          to_email:   CONTACT_EMAIL,
          subject:    subject,
          message:    message
        })
        .then(function () {
          showMsg('success', '&#x2713; Message sent! I\'ll reply to ' + email + ' soon.');
          form.reset();
          setBusy(false);
          trackEvent('form_submission_success', { method: 'emailjs' });
        })
        .catch(function () { tryFormspree(name, email, subject, message); });
      } else {
        tryFormspree(name, email, subject, message);
      }
    });
  }

  function tryFormspree(name, email, subject, message) {
    var data = new FormData();
    data.append('name',    name);
    data.append('email',   email);
    data.append('subject', subject);
    data.append('message', message);

    fetch('https://formspree.io/f/' + FORMSPREE_ID, {
      method: 'POST', body: data,
      headers: { 'Accept': 'application/json' }
    })
    .then(function (res) {
      if (res.ok) {
        showMsg('success', '&#x2713; Message sent! I\'ll reply to ' + email + ' soon.');
        if (form) form.reset();
        trackEvent('form_submission_success', { method: 'formspree' });
      } else {
        openMailto(name, email, subject, message);
      }
    })
    .catch(function () { openMailto(name, email, subject, message); })
    .finally(function () { setBusy(false); });
  }

  function openMailto(name, email, subject, message) {
    var body   = 'From: ' + name + ' <' + email + '>\n\n' + message;
    var mailto = 'mailto:' + CONTACT_EMAIL
               + '?subject=' + encodeURIComponent(subject)
               + '&body='    + encodeURIComponent(body);
    var a = document.createElement('a');
    a.href = mailto; a.style.display = 'none';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    showMsg('success', '&#x2713; Your email client opened &#x2014; just hit Send!');
    if (form) form.reset();
    setBusy(false);
  }

  function setBusy(busy) {
    if (!sendBtn) return;
    sendBtn.disabled    = busy;
    sendBtn.textContent = busy ? 'Sending…' : 'Send message →';
  }

  function showMsg(type, html) {
    if (!fMsg) return;
    fMsg.innerHTML = html;
    fMsg.className = 'f-msg show ' + (type || '');
    setTimeout(function () { fMsg.className = 'f-msg'; }, 8000);
  }


  /* ── 8. Scroll reveal with stagger ──────────────────── */
  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-up');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll(
      '.proj-card, .cert-card, .testimonial-card, .highlight-card, .pub-item, .trust-item, .metric'
    ).forEach(function (el, i) {
      el.style.setProperty('--stagger', i % 4);
      revealObs.observe(el);
    });
  }


  /* ── 9. Outbound link tracking ───────────────────────── */
  document.querySelectorAll('a[href^="http"], a[href^="//"]').forEach(function (link) {
    link.addEventListener('click', function () {
      trackEvent('outbound_click', { url: link.getAttribute('href') });
    });
  });


  /* ── 10. CV download tracking ────────────────────────── */
  document.querySelectorAll('a[download], a[href$=".pdf"]').forEach(function (link) {
    link.addEventListener('click', function () {
      trackEvent('file_download', {
        file_name: link.getAttribute('href').split('/').pop(),
        link_text: link.textContent.trim()
      });
    });
  });


  /* ── 11. Section view tracking ───────────────────────── */
  if ('IntersectionObserver' in window) {
    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) trackEvent('section_view', { section_id: entry.target.id });
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('section[id]').forEach(function (s) { sectionObs.observe(s); });
  }


  /* ── 12. Smooth scroll (fixed-nav offset) ────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (!href || href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
        trackEvent('internal_nav', { href: href });
      }
    });
  });


  /* ── 13. Right-click email address to copy ───────────── */
  document.querySelectorAll('a[href^="mailto:"]').forEach(function (emailLink) {
    emailLink.addEventListener('contextmenu', function (e) {
      var address = this.getAttribute('href').replace('mailto:', '').split('?')[0];
      if (!navigator.clipboard || !navigator.clipboard.writeText) return;
      e.preventDefault();
      navigator.clipboard.writeText(address).then(function () {
        var valEl  = emailLink.querySelector('.c-val');
        var target = valEl || emailLink;
        var orig   = target.textContent;
        target.textContent = 'Copied!';
        setTimeout(function () { target.textContent = orig; }, 2000);
      });
    });
  });


  /* ── 14. Keyboard: Escape closes mobile menu ─────────── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mmenu && mmenu.classList.contains('open')) {
      closeMenu();
      if (ham) ham.focus();
    }
  });


  /* ── 15. Page performance (Navigation Timing Level 2) ── */
  window.addEventListener('load', function () {
    if (!window.performance) return;
    var navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length) {
      trackEvent('timing_complete', {
        name: 'page_load',
        value: Math.round(navEntries[0].loadEventEnd),
        event_category: 'Performance'
      });
    }
  });


  /* ── 16. Page exit + time-on-page ───────────────────── */
  var hiddenTime = 0;
  var lastHide   = 0;
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { lastHide = Date.now(); }
    else { hiddenTime += Date.now() - lastHide; }
  });

  window.addEventListener('beforeunload', function () {
    var navEntries = window.performance ? performance.getEntriesByType('navigation') : [];
    var navStart   = navEntries.length ? navEntries[0].startTime : 0;
    var timeOnPage = Math.floor((Date.now() - navStart - hiddenTime) / 1000);
    var scrollPct  = document.body.scrollHeight > window.innerHeight
      ? Math.floor(window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100)
      : 100;
    trackEvent('page_exit', { time_on_page: timeOnPage, scroll_depth: scrollPct });
  });

  window.addEventListener('beforeprint', function () {
    trackEvent('print', { event_category: 'engagement' });
  });


  /* ── Shared analytics helper ─────────────────────────── */
  function trackEvent(name, params) {
    if (typeof gtag !== 'undefined') gtag('event', name, params || {});
    else if (typeof dataLayer !== 'undefined') dataLayer.push({ event: name });
  }

}); /* end DOMContentLoaded */


/* ── Service Worker (PWA) ────────────────────────────────
   Relative path (./sw.js) works on both user-page roots
   and GitHub Pages project-site subdirectories.
──────────────────────────────────────────────────────── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('./sw.js').catch(function () {
      /* SW unavailable — site still works fully without it */
    });
  });
}
