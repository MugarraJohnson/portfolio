/* ═══════════════════════════════════════
   script.js — Johnson Mugarra Portfolio
   ═══════════════════════════════════════ */
'use strict';

document.addEventListener('DOMContentLoaded', function () {

  /* ── 1. Scroll progress bar ─────────────────────────────── */
  var bar = document.getElementById('progress-bar');
  window.addEventListener('scroll', function () {
    var pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    if (bar) bar.style.width = pct + '%';
  }, { passive: true });


  /* ── 2. Mobile menu ─────────────────────────────────────── */
  var ham    = document.getElementById('ham');
  var mmenu  = document.getElementById('mob-menu');
  var mclose = document.getElementById('mob-close');
  if (ham)    ham.addEventListener('click',    function () { mmenu.classList.add('open'); });
  if (mclose) mclose.addEventListener('click', function () { mmenu.classList.remove('open'); });
  if (mmenu) {
    mmenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { mmenu.classList.remove('open'); });
    });
  }


  /* ── 3. Skill bars ──────────────────────────────────────── */
  var skillSection = document.getElementById('skill-bars');
  if (skillSection) {
    function animateBars() {
      skillSection.querySelectorAll('.sk-fill').forEach(function (fill) {
        fill.style.width = (fill.dataset.w || '0') + '%';
      });
    }
    if ('IntersectionObserver' in window) {
      var skObs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          setTimeout(animateBars, 150);
          skObs.unobserve(skillSection);
        }
      }, { threshold: 0.15 });
      skObs.observe(skillSection);
    } else {
      animateBars();
    }
  }


  /* ── 4. Metrics counter ─────────────────────────────────── */
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
      var mObs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting && !counted) {
          counted = true;
          countUp(document.getElementById('m1'), 18, 1500);
          countUp(document.getElementById('m2'), 80, 1700);
          countUp(document.getElementById('m3'), 95, 1600);
          countUp(document.getElementById('m4'),  6, 1300);
          mObs.disconnect();
        }
      }, { threshold: 0.35 });
      mObs.observe(metricsEl);
    } else {
      document.getElementById('m1').textContent = '18';
      document.getElementById('m2').textContent = '80';
      document.getElementById('m3').textContent = '95';
      document.getElementById('m4').textContent = '6';
    }
  }


  /* ── 5. Project filter ──────────────────────────────────────
     FIX: track pending timeouts per card so rapid clicking
     never leaves a card stuck invisible from an old timeout.
  ─────────────────────────────────────────────────────────── */
  var filterRow = document.getElementById('filter-row');
  if (filterRow) {

    /* Store one timeout handle per card so we can cancel it */
    var hideTimers = new WeakMap();

    filterRow.addEventListener('click', function (e) {
      var btn = e.target.closest('.filt');
      if (!btn) return;

      /* Update active button */
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
          /* SHOW: start from invisible, unhide, reflow, then fade in */
          card.classList.add('hiding');
          card.classList.remove('hidden');
          void card.offsetWidth;          /* force reflow — critical */
          card.classList.remove('hiding');
        } else {
          /* HIDE: fade out first, then set display:none after transition */
          card.classList.add('hiding');
          var t = setTimeout(function () {
            card.classList.add('hidden');
            hideTimers.delete(card);
          }, 300);
          hideTimers.set(card, t);
        }
      });
    });
  }


  /* ── 6. Contact form via EmailJS ────────────────────────────
     Your real credentials are set below.
     EmailJS sends directly from the browser — works locally
     AND when hosted. No server needed.
  ─────────────────────────────────────────────────────────── */
  var EJS_SERVICE  = 'service_51t4hfn';
  var EJS_TEMPLATE = 'template_tutr40i';
  var EJS_KEY      = '3gv1KyCeWi6c2wo8K';

  var form    = document.getElementById('contact-form');
  var sendBtn = document.getElementById('send-btn');
  var fMsg    = document.getElementById('f-msg');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name    = (form.querySelector('[name="name"]')    || {}).value || '';
      var email   = (form.querySelector('[name="email"]')   || {}).value || '';
      var subject = (form.querySelector('[name="subject"]') || {}).value || 'Portfolio enquiry';
      var message = (form.querySelector('[name="message"]') || {}).value || '';

      if (!name.trim() || !email.trim() || !message.trim()) {
        showMsg('error', '&#x26A0; Please fill in your name, email and message.');
        return;
      }

      if (sendBtn) { sendBtn.disabled = true; sendBtn.textContent = 'Sending\u2026'; }

      emailjs.send(EJS_SERVICE, EJS_TEMPLATE, {
        from_name:  name,
        from_email: email,
        subject:    subject,
        message:    message
      }, EJS_KEY)
      .then(function () {
        showMsg('success', '&#x2713; Message sent! I\'ll reply to ' + email + ' soon.');
        form.reset();
      })
      .catch(function (err) {
        console.error('EmailJS error:', err);
        /* FIX: use hidden <a> instead of window.location.href
           so the page URL never changes */
        openMailto(name, email, subject, message);
      })
      .finally(function () {
        if (sendBtn) {
          sendBtn.disabled = false;
          sendBtn.textContent = 'Send message \u2192';
        }
      });
    });
  }

  /* ── openMailto ─────────────────────────────────────────────
     FIX: creates a temporary invisible <a> and programmatically
     clicks it instead of changing window.location.href.
     This opens the email client WITHOUT touching the address bar
     or navigating away from the page.
  ─────────────────────────────────────────────────────────── */
  function openMailto(name, email, subject, message) {
    var body   = 'From: ' + name + ' <' + email + '>\n\n' + message;
    var mailto = 'mailto:mugarrajohnson4@gmail.com'
               + '?subject=' + encodeURIComponent(subject)
               + '&body='    + encodeURIComponent(body);

    var a = document.createElement('a');
    a.href   = mailto;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    showMsg('success', '&#x2713; Your email client has opened \u2014 just hit Send!');
    if (form) form.reset();
  }

  function showMsg(type, html) {
    if (!fMsg) return;
    fMsg.innerHTML = html;
    fMsg.className = 'f-msg show ' + (type || '');
    setTimeout(function () { fMsg.classList.remove('show'); }, 8000);
  }

}); /* end DOMContentLoaded */
