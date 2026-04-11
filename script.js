/* ═══════════════════════════════════════════════════
   script.js — Johnson Mugarra Portfolio
   ═══════════════════════════════════════════════════ */
'use strict';

document.addEventListener('DOMContentLoaded', function () {
  /* ── Theme toggle ────────────────────────────────────── */
  var root        = document.documentElement;
  var toggleBtn   = document.getElementById('theme-toggle');
  var STORAGE_KEY = 'jm-theme';

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (toggleBtn) {
      toggleBtn.textContent = theme === 'light' ? '🔆' : '🔅';
      toggleBtn.setAttribute('aria-label',
        theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    }
  }

  /* Start with saved preference, or OS preference, or dark */
  var saved  = localStorage.getItem(STORAGE_KEY);
  var osDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (osDark ? 'dark' : 'dark'));

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
  /* ── End theme toggle ───────────────────────────────── */

  /* ── EmailJS ─────────────────────────────────────────────
     Credentials — all three values come from your dashboard.

     !! IMPORTANT — email not arriving? Check this in EmailJS:
        Dashboard → Email Templates → template_tutr40i → Edit
        Make sure "To Email" field is:  johnsonmugarra@yahoo.com
        (NOT left blank or set to a dynamic variable)
        Save the template and test again.
  ─────────────────────────────────────────────────────── */
  var EJS_SERVICE  = 'service_51t4hfn';
  var EJS_TEMPLATE = 'template_tutr40i';
  var EJS_KEY      = 'i8KrO_W-JbnVbaLqL';

  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EJS_KEY });
  }


  /* ── 1. Scroll progress ──────────────────────────────── */
  var progressBar = document.getElementById('progress-bar');
  window.addEventListener('scroll', function () {
    if (!progressBar) return;
    var pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    progressBar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });


  /* ── 2. Nav glass on scroll ──────────────────────────── */
  var navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function () {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });


  /* ── 3. Mobile menu ──────────────────────────────────── */
  var ham    = document.getElementById('ham');
  var mmenu  = document.getElementById('mob-menu');
  var mclose = document.getElementById('mob-close');
  if (ham && mmenu) {
    ham.addEventListener('click', function () { mmenu.classList.add('open'); });
  }
  if (mclose && mmenu) {
    mclose.addEventListener('click', function () { mmenu.classList.remove('open'); });
  }
  if (mmenu) {
    mmenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { mmenu.classList.remove('open'); });
    });
  }


  /* ── 4. Skill bars animate in ────────────────────────── */
  var skillSection = document.getElementById('skill-bars');
  if (skillSection) {
    var animateBars = function () {
      skillSection.querySelectorAll('.sk-fill').forEach(function (fill) {
        fill.style.width = (fill.dataset.w || '0') + '%';
      });
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries, obs) {
        if (entries[0].isIntersecting) {
          setTimeout(animateBars, 100);
          obs.disconnect();
        }
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
          countUp(document.getElementById('m1'), 95, 15000);
          countUp(document.getElementById('m2'), 90, 15000);
          countUp(document.getElementById('m3'), 85, 16000);
          countUp(document.getElementById('m4'), 6, 12000);
          obs.disconnect();
        }
      }, { threshold: 0.4 }).observe(metricsEl);
    } else {
      ['m1','m2','m3','m4'].forEach(function (id, i) {
        var el = document.getElementById(id);
        if (el) el.textContent = [95,90,85,6][i];
      });
    }
  }


  /* ── 6. Project filter — spring animation ────────────────
     Uses WeakMap to track per-card hide timers.
     Rapid clicking cancels stale timers so no card
     gets stuck invisible.
  ─────────────────────────────────────────────────────── */
  var filterRow = document.getElementById('filter-row');
  if (filterRow) {
    var hideTimers = new WeakMap();

    filterRow.addEventListener('click', function (e) {
      var btn = e.target.closest('.filt');
      if (!btn) return;

      document.querySelectorAll('.filt').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      var f = btn.getAttribute('data-f');

      document.querySelectorAll('.proj-card').forEach(function (card) {
        var cats  = (card.getAttribute('data-cat') || '').split(' ');
        var match = (f === 'all' || cats.indexOf(f) !== -1);

        /* Cancel any pending hide timer for this card */
        if (hideTimers.has(card)) {
          clearTimeout(hideTimers.get(card));
          hideTimers.delete(card);
        }

        if (match) {
          /* SHOW: set invisible state → unhide → reflow → spring in */
          card.classList.add('hiding');
          card.classList.remove('hidden');
          void card.offsetWidth;         /* force reflow — critical */
          card.classList.remove('hiding');
        } else {
          /* HIDE: spring out → display:none after transition */
          card.classList.add('hiding');
          var t = setTimeout(function () {
            card.classList.add('hidden');
            hideTimers.delete(card);
          }, 360);
          hideTimers.set(card, t);
        }
      });
    });
  }


  /* ── 7. Contact form — EmailJS with triple fallback ──────
     Order of attempts:
       1. EmailJS  (works on localhost:8080 and hosted)
       2. Formspree (secondary fallback)
       3. mailto hidden-link (never changes address bar)
  ─────────────────────────────────────────────────────── */
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

      setBusy(true);

      /* ── Try EmailJS first ── */
      if (typeof emailjs !== 'undefined') {
        emailjs.send(EJS_SERVICE, EJS_TEMPLATE, {
          from_name:  name,
          from_email: email,
          reply_to:   email,
          to_email:   CONTACT_EMAIL,
          subject:    subject,
          message:    message
        })
        .then(function (res) {
          console.log('[EmailJS] success', res.status);
          showMsg('success', '&#x2713; Message sent! I\'ll reply to ' + email + ' soon.');
          form.reset();
          setBusy(false);
        })
        .catch(function (err) {
          console.warn('[EmailJS] failed, trying Formspree:', err);
          tryFormspree(name, email, subject, message);
        });
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
      } else {
        openMailto(name, email, subject, message);
      }
    })
    .catch(function () {
      openMailto(name, email, subject, message);
    })
    .finally(function () { setBusy(false); });
  }

  /* Opens email client WITHOUT changing the address bar */
  function openMailto(name, email, subject, message) {
    var body   = 'From: ' + name + ' <' + email + '>\n\n' + message;
    var mailto = 'mailto:' + CONTACT_EMAIL
               + '?subject=' + encodeURIComponent(subject)
               + '&body='    + encodeURIComponent(body);
    var a = document.createElement('a');
    a.href = mailto; a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showMsg('success', '&#x2713; Your email client opened &#x2014; just hit Send!');
    if (form) form.reset();
    setBusy(false);
  }

  function setBusy(busy) {
    if (!sendBtn) return;
    sendBtn.disabled    = busy;
    sendBtn.textContent = busy ? 'Sending\u2026' : 'Send message \u2192';
  }

  function showMsg(type, html) {
    if (!fMsg) return;
    fMsg.innerHTML = html;
    fMsg.className = 'f-msg show ' + (type || '');
    setTimeout(function () { fMsg.className = 'f-msg'; }, 8000);
  }

}); /* end DOMContentLoaded */
