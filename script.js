/* ─────────────────────────────────────────
   script.js — Portfolio JavaScript
   ───────────────────────────────────────── */

'use strict';

// ── Wait for DOM ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // ── 1. Particle Canvas Background ─────────────────────────────────────────
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];

  function resizeCanvas() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

  class Particle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x  = Math.random() * W;
      this.y  = initial ? Math.random() * H : H + 10;
      this.r  = Math.random() * 1.5 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = -(Math.random() * 0.4 + 0.1);
      this.alpha = Math.random() * 0.5 + 0.1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.y < -10) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(91,127,255,${this.alpha})`;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = Array.from({ length: 80 }, () => new Particle());
  }

  function drawConnections() {
    const maxDist = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(91,127,255,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animateParticles);
  }

  initParticles();
  animateParticles();


  // ── 2. Custom Cursor ───────────────────────────────────────────────────────
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let mouseX = -100, mouseY = -100;
  let ringX  = -100, ringY  = -100;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  // Smooth ring follow with lerp
  function lerp(a, b, t) { return a + (b - a) * t; }
  (function animateCursor() {
    ringX = lerp(ringX, mouseX, 0.12);
    ringY = lerp(ringY, mouseY, 0.12);
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateCursor);
  })();

  const hoverTargets = document.querySelectorAll('a, button, .badge, .project-card, .stat-card, .social-item');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => { dot.classList.add('hovering'); ring.classList.add('hovering'); });
    el.addEventListener('mouseleave', () => { dot.classList.remove('hovering'); ring.classList.remove('hovering'); });
  });


  // ── 3. Scroll Progress Bar ─────────────────────────────────────────────────
  const progressBar = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (scrolled / maxScroll * 100) + '%';
  }, { passive: true });


  // ── 4. Sticky Nav & Active Link ────────────────────────────────────────────
  const navbar   = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('stuck', window.scrollY > 60);

    // Highlight active nav link
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 200) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }, { passive: true });


  // ── 5. Hamburger Mobile Menu ────────────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('nav-links');

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navMenu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });


  // ── 6. Theme Toggle ────────────────────────────────────────────────────────
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon   = themeToggle.querySelector('.theme-icon');
  let isDark = true;

  themeToggle.addEventListener('click', () => {
    isDark = !isDark;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    themeIcon.textContent = isDark ? '☀' : '☾';
    showToast(isDark ? 'Switched to dark mode' : 'Switched to light mode');
  });


  // ── 7. Typewriter Effect ────────────────────────────────────────────────────
  const words = ['impact.', 'agriculture.', 'East Africa.', 'good.', 'scale.'];
  const tw    = document.getElementById('typewriter');
  let wordIdx = 0, charIdx = 0, deleting = false, twTimeout;

  function typeLoop() {
    const word    = words[wordIdx];
    const current = deleting ? word.slice(0, charIdx - 1) : word.slice(0, charIdx + 1);
    tw.textContent = current;
    deleting ? charIdx-- : charIdx++;

    let delay = deleting ? 60 : 100;
    if (!deleting && charIdx === word.length)  { delay = 1800; deleting = true; }
    if (deleting  && charIdx === 0)            { deleting = false; wordIdx = (wordIdx + 1) % words.length; delay = 300; }
    twTimeout = setTimeout(typeLoop, delay);
  }

  // Start after hero animation
  setTimeout(typeLoop, 1200);


  // ── 8. Scroll Reveal ──────────────────────────────────────────────────────
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger children of grids
        const siblings = entry.target.closest('.projects-grid, .stats-grid, .badges-grid');
        if (siblings) {
          const items = [...siblings.querySelectorAll('.reveal')];
          const idx   = items.indexOf(entry.target);
          entry.target.style.transitionDelay = (idx * 0.08) + 's';
        }
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


  // ── 9. Animated Counters ──────────────────────────────────────────────────
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const duration = 1400;
        const start    = performance.now();
        const update   = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target);
          if (progress < 1) requestAnimationFrame(update);
          else el.textContent = target;
        };
        requestAnimationFrame(update);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));


  // ── 10. Skill Bar Animation ───────────────────────────────────────────────
  const skillObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const pct  = entry.target.dataset.pct;
        const fill = entry.target.querySelector('.skill-fill');
        setTimeout(() => { fill.style.width = pct + '%'; }, 200);
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.skill-row').forEach(el => skillObserver.observe(el));


  // ── 11. Project Filter ───────────────────────────────────────────────────
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      projectCards.forEach((card, i) => {
        const tags = (card.dataset.tags || '').split(' ');
        const visible = filter === 'all' || tags.includes(filter);

        if (visible) {
          card.classList.remove('hidden');
          card.style.animationDelay = (i * 0.05) + 's';
          // Re-trigger reveal animation
          card.classList.remove('visible');
          void card.offsetWidth; // force reflow
          card.classList.add('visible');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });


  // ── 12. Contact Form Validation & Submission ─────────────────────────────
  const form       = document.getElementById('contact-form');
  const submitBtn  = document.getElementById('submit-btn');
  const btnText    = document.getElementById('btn-text');
  const formSuccess = document.getElementById('form-success');

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function setError(input, message) {
    input.classList.add('error');
    input.nextElementSibling.textContent = message;
  }
  function clearError(input) {
    input.classList.remove('error');
    input.nextElementSibling.textContent = '';
  }

  // Live validation
  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', () => {
      if (input.value.trim()) clearError(input);
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    let valid = true;

    const name    = form.querySelector('#name');
    const email   = form.querySelector('#email');
    const subject = form.querySelector('#subject');
    const message = form.querySelector('#message');

    if (!name.value.trim())              { setError(name, 'Name is required'); valid = false; }
    else clearError(name);

    if (!email.value.trim())             { setError(email, 'Email is required'); valid = false; }
    else if (!validateEmail(email.value)){ setError(email, 'Enter a valid email'); valid = false; }
    else clearError(email);

    if (!subject.value.trim())           { setError(subject, 'Subject is required'); valid = false; }
    else clearError(subject);

    if (!message.value.trim())           { setError(message, 'Message is required'); valid = false; }
    else if (message.value.trim().length < 20) { setError(message, 'Message too short (min 20 chars)'); valid = false; }
    else clearError(message);

    if (!valid) return;

    // Simulate sending
    submitBtn.disabled = true;
    btnText.textContent = 'Sending…';
    submitBtn.style.opacity = '0.7';

    await new Promise(r => setTimeout(r, 1500));

    submitBtn.style.display = 'none';
    formSuccess.classList.remove('hidden');
    form.reset();
    showToast('Message sent successfully! ✓');

    setTimeout(() => {
      submitBtn.style.display = '';
      submitBtn.disabled = false;
      btnText.textContent = 'Send message';
      submitBtn.style.opacity = '1';
      formSuccess.classList.add('hidden');
    }, 6000);
  });


  // ── 13. Back to Top ──────────────────────────────────────────────────────
  document.getElementById('back-to-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


  // ── 14. Toast Notification ───────────────────────────────────────────────
  let toastTimer;
  function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    clearTimeout(toastTimer);
    // Force reflow before adding class
    void toast.offsetWidth;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
  }


  // ── 15. Code Card Tilt effect ─────────────────────────────────────────────
  const codeCard = document.querySelector('.code-card');
  if (codeCard) {
    codeCard.addEventListener('mousemove', e => {
      const rect = codeCard.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      codeCard.style.transform = `perspective(600px) rotateY(${dx * 8}deg) rotateX(${-dy * 6}deg) scale(1.02)`;
      codeCard.style.transition = 'transform 0.1s';
    });
    codeCard.addEventListener('mouseleave', () => {
      codeCard.style.transform = '';
      codeCard.style.transition = 'transform 0.5s cubic-bezier(0.22,1,0.36,1)';
    });
  }


  // ── 16. Smooth anchor scrolling with offset for fixed nav ────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    });
  });

});
