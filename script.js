/* ═══════════════════════════════════════════════════
   script.js — Johnson Mugarra Portfolio (Enhanced)
   ═══════════════════════════════════════════════════ */
'use strict';

document.addEventListener('DOMContentLoaded', function () {
  
  /* ── Page Loader ─────────────────────────────────────── */
  window.addEventListener('load', function() {
    const loader = document.getElementById('page-loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(function() {
        loader.style.display = 'none';
      }, 300);
    }
  });

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
    
    // Track theme change
    if (typeof dataLayer !== 'undefined') {
  dataLayer.push({
    'event': 'theme_change',
    'theme': theme
  });
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
    ham.addEventListener('click', function () { 
      mmenu.classList.add('open'); 
      
      // Track mobile menu open
      if (typeof gtag !== 'undefined') {
        gtag('event', 'mobile_menu_open');
      }
    });
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
          countUp(document.getElementById('m1'), 95, 1500);
          countUp(document.getElementById('m2'), 90, 1500);
          countUp(document.getElementById('m3'), 85, 1600);
          countUp(document.getElementById('m4'), 6, 1200);
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

      // Track filter usage
      if (typeof gtag !== 'undefined') {
        gtag('event', 'project_filter', {
          'filter': f
        });
      }

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

      // Basic email validation
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showMsg('error', '&#x26A0; Please enter a valid email address.');
        return;
      }

      setBusy(true);

      // Track form submission attempt
      if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submission_attempt', {
          'form_name': 'contact_form'
        });
      }

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
          
          // Track successful submission
          if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submission_success', {
              'method': 'emailjs'
            });
          }
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
        
        // Track successful submission
        if (typeof gtag !== 'undefined') {
          gtag('event', 'form_submission_success', {
            'method': 'formspree'
          });
        }
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
    
    // Track mailto fallback
    if (typeof gtag !== 'undefined') {
      gtag('event', 'form_submission_mailto', {
        'method': 'mailto'
      });
    }
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


  /* ── 8. Scroll Reveal Animations ────────────────────────
     Animate elements as they enter viewport
  ──────────────────────────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    var observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-up');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all elements that should animate in
    var animateElements = document.querySelectorAll('.proj-card, .cert-card, .testimonial-card, .highlight-card, .pub-item, .trust-item');
    animateElements.forEach(function(el) {
      observer.observe(el);
    });
  }


  /* ── 9. Track Outbound Links ────────────────────────────
     Track clicks on external links
  ──────────────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="http"], a[href^="//"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      var href = link.getAttribute('href');
      
      if (typeof gtag !== 'undefined') {
        gtag('event', 'click', {
          'event_category': 'outbound',
          'event_label': href,
          'transport_type': 'beacon'
        });
      }
    });
  });


  /* ── 10. Track Download Links ───────────────────────────
     Track CV downloads
  ──────────────────────────────────────────────────────── */
  document.querySelectorAll('a[download], a[href$=".pdf"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      var filename = link.getAttribute('href').split('/').pop();
      
      if (typeof gtag !== 'undefined') {
        gtag('event', 'file_download', {
          'file_name': filename,
          'link_text': link.textContent.trim()
        });
      }
    });
  });


  /* ── 11. Track Section Views ────────────────────────────
     Track when users view different sections
  ──────────────────────────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var sectionId = entry.target.id;
          
          if (typeof gtag !== 'undefined') {
            gtag('event', 'section_view', {
              'section_id': sectionId
            });
          }
        }
      });
    }, { threshold: 0.5 });

    // Observe all major sections
    document.querySelectorAll('section[id]').forEach(function(section) {
      sectionObserver.observe(section);
    });
  }


  /* ── 12. Performance Monitoring ─────────────────────────
     Track page performance metrics
  ──────────────────────────────────────────────────────── */
  if (window.performance && window.performance.timing) {
    window.addEventListener('load', function() {
      setTimeout(function() {
        var perfData = window.performance.timing;
        var pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        
        if (typeof gtag !== 'undefined') {
          gtag('event', 'timing_complete', {
            'name': 'page_load',
            'value': pageLoadTime,
            'event_category': 'Performance'
          });
        }
      }, 0);
    });
  }


  /* ── 13. Smooth Scroll Enhancement ──────────────────────
     Enhanced smooth scroll with offset for fixed nav
  ──────────────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#' || href === '') return;
      
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        var offsetTop = target.offsetTop - 80; // Account for fixed nav
        
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
        
        // Track internal navigation
        if (typeof gtag !== 'undefined') {
          gtag('event', 'click', {
            'event_category': 'internal_navigation',
            'event_label': href
          });
        }
      }
    });
  });


  /* ── 14. Lazy Load Images ───────────────────────────────
     Additional lazy loading for images that don't have loading="lazy"
  ──────────────────────────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    var lazyImages = document.querySelectorAll('img:not([loading])');
    
    var imageObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          imageObserver.unobserve(img);
        }
      });
    });

    lazyImages.forEach(function(img) {
      imageObserver.observe(img);
    });
  }


  /* ── 15. Browser/Device Detection ───────────────────────
     Track visitor browser and device info
  ──────────────────────────────────────────────────────── */
  if (typeof gtag !== 'undefined') {
    var ua = navigator.userAgent;
    var browserName = 'Unknown';
    
    if (ua.indexOf('Firefox') > -1) browserName = 'Firefox';
    else if (ua.indexOf('Chrome') > -1) browserName = 'Chrome';
    else if (ua.indexOf('Safari') > -1) browserName = 'Safari';
    else if (ua.indexOf('Edge') > -1) browserName = 'Edge';
    
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    
    gtag('event', 'visitor_info', {
      'browser': browserName,
      'device_type': isMobile ? 'mobile' : 'desktop',
      'screen_width': window.innerWidth,
      'screen_height': window.innerHeight
    });
  }


  /* ── 16. Copy Email on Click (UX Enhancement) ───────────
     Allow users to copy email by clicking on it
  ──────────────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="mailto:"]').forEach(function(emailLink) {
    emailLink.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      var email = this.getAttribute('href').replace('mailto:', '').split('?')[0];
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(function() {
          // Show temporary tooltip or notification
          var originalText = emailLink.textContent;
          emailLink.textContent = 'Email copied!';
          setTimeout(function() {
            emailLink.textContent = originalText;
          }, 2000);
          
          if (typeof gtag !== 'undefined') {
            gtag('event', 'email_copy', {
              'method': 'right_click'
            });
          }
        });
      }
    });
  });


  /* ── 17. Keyboard Navigation Enhancement ────────────────
     Better keyboard accessibility
  ──────────────────────────────────────────────────────── */
  document.addEventListener('keydown', function(e) {
    // Escape key closes mobile menu
    if (e.key === 'Escape' && mmenu && mmenu.classList.contains('open')) {
      mmenu.classList.remove('open');
    }
  });


  /* ── 18. Print Optimization ─────────────────────────────
     Prepare page for printing
  ──────────────────────────────────────────────────────── */
  window.addEventListener('beforeprint', function() {
    // Track print events
    if (typeof gtag !== 'undefined') {
      gtag('event', 'print', {
        'event_category': 'engagement'
      });
    }
  });


  /* ── 19. Visibility Change Tracking ─────────────────────
     Track when users leave/return to page
  ──────────────────────────────────────────────────────── */
  var hiddenTime = 0;
  var visibilityStart = Date.now();

  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      visibilityStart = Date.now();
    } else {
      hiddenTime += Date.now() - visibilityStart;
    }
  });


  /* ── 20. Page Exit Intent ───────────────────────────────
     Track engagement before leaving
  ──────────────────────────────────────────────────────── */
  window.addEventListener('beforeunload', function() {
    var timeOnPage = Math.floor((Date.now() - performance.timing.navigationStart - hiddenTime) / 1000);
    
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_exit', {
        'time_on_page': timeOnPage,
        'scroll_depth': Math.floor((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
      });
    }
  });


}); /* end DOMContentLoaded */


/* ═══════════════════════════════════════════════════
   Service Worker Registration (PWA Support)
   ═══════════════════════════════════════════════════ */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('ServiceWorker registration successful');
      })
      .catch(function(err) {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}
