const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

document.getElementById('year').textContent = new Date().getFullYear();

const dateInput = document.getElementById('date');
if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

const loader = document.querySelector('.loader');
const loaderCount = document.querySelector('.loader-meta b');
const hero = document.querySelector('.hero');
let loadProgress = 0;
let loadTimer;

if (!reducedMotion) {
  loadTimer = window.setInterval(() => {
    loadProgress = Math.min(loadProgress + Math.ceil(Math.random() * 12), 92);
    if (loaderCount) loaderCount.textContent = String(loadProgress).padStart(2, '0');
  }, 85);
}

function completeLoad() {
  window.clearInterval(loadTimer);
  if (loaderCount) loaderCount.textContent = '100';
  window.setTimeout(() => {
    loader?.classList.add('is-hidden');
    document.body.classList.remove('is-loading');
    hero?.classList.add('is-ready');
  }, reducedMotion ? 0 : 280);
}

if (document.readyState === 'complete') completeLoad();
else window.addEventListener('load', completeLoad, { once: true });

const levelRack = document.querySelector('.hero-levels');
for (let index = 0; index < 52; index += 1) {
  const bar = document.createElement('i');
  const amplitude = 18 + Math.abs(Math.sin(index * 0.43)) * 70 + (index % 4) * 3;
  bar.style.setProperty('--h', `${Math.min(amplitude, 100)}%`);
  levelRack?.appendChild(bar);
}

const spectrum = document.querySelector('.monitor-spectrum');
for (let index = 0; index < 64; index += 1) {
  const bar = document.createElement('i');
  const amplitude = 12 + Math.abs(Math.sin(index * 0.34) * Math.cos(index * 0.11)) * 82;
  bar.style.setProperty('--h', `${amplitude}%`);
  bar.style.setProperty('--delay', `${(index % 9) * -0.08}s`);
  spectrum?.appendChild(bar);
}

document.querySelectorAll('.vector-draw path, .vector-draw rect, .vector-draw circle').forEach((shape) => {
  if (typeof shape.getTotalLength !== 'function') return;
  const length = shape.getTotalLength();
  shape.style.strokeDasharray = `${length}`;
  shape.style.strokeDashoffset = `${length}`;
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    entry.target.querySelectorAll?.('.vector-draw path, .vector-draw rect, .vector-draw circle').forEach((shape) => {
      shape.style.strokeDashoffset = '0';
    });
    if (entry.target.matches('.vector-draw')) {
      entry.target.querySelectorAll('path, rect, circle').forEach((shape) => { shape.style.strokeDashoffset = '0'; });
    }
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('.reveal-block, .vector-draw').forEach((element) => revealObserver.observe(element));

const header = document.querySelector('.site-header');
const heroSequence = document.querySelector('.hero-sequencer');
const parallaxItems = [...document.querySelectorAll('.parallax-media')];
let ticking = false;

function updateScrollEffects() {
  const maximum = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const progress = Math.min(Math.max(window.scrollY / maximum, 0), 1);
  root.style.setProperty('--scroll', progress.toFixed(4));
  header?.classList.toggle('is-scrolled', window.scrollY > 36);

  if (!reducedMotion) {
    parallaxItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (rect.bottom < -120 || rect.top > window.innerHeight + 120) return;
      const speed = Number(item.dataset.speed || 0.05);
      const offset = Math.max(-45, Math.min(45, (rect.top + rect.height / 2 - window.innerHeight / 2) * speed));
      item.style.setProperty('--parallax', `${offset}px`);
    });
    if (heroSequence) heroSequence.style.transform = `translate3d(${progress * -28}px, ${progress * 10}px, 0)`;
  }
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    ticking = true;
    window.requestAnimationFrame(updateScrollEffects);
  }
}, { passive: true });
updateScrollEffects();

const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
function setMenu(open) {
  menuToggle?.setAttribute('aria-expanded', String(open));
  menuToggle?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  mobileNav?.setAttribute('aria-hidden', String(!open));
  mobileNav?.classList.toggle('is-open', open);
  document.body.style.overflow = open ? 'hidden' : '';
}
menuToggle?.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
mobileNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

if (finePointer && !reducedMotion) {
  const cursor = document.querySelector('.cursor');
  window.addEventListener('pointermove', (event) => {
    root.style.setProperty('--cursor-x', `${event.clientX}px`);
    root.style.setProperty('--cursor-y', `${event.clientY}px`);
  }, { passive: true });

  document.querySelectorAll('a, button, input, select, textarea').forEach((element) => {
    element.addEventListener('pointerenter', () => cursor?.classList.add('is-active'));
    element.addEventListener('pointerleave', () => cursor?.classList.remove('is-active'));
  });

  document.querySelectorAll('.magnetic').forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.13;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.13;
      element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
    element.addEventListener('pointerleave', () => { element.style.transform = ''; });
  });
}

const form = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');
const serviceSelect = document.querySelector('[data-service-select]');
const serviceNative = document.getElementById('service');
const serviceTrigger = document.getElementById('service-trigger');
const serviceValue = document.getElementById('service-value');
const serviceMenu = document.getElementById('service-menu');
const serviceOptions = [...(serviceMenu?.querySelectorAll('[role="option"]') || [])];

function validateField(field) {
  const wrapper = field.closest('.field');
  const valid = field.checkValidity();
  wrapper?.classList.toggle('is-invalid', !valid);
  field.setAttribute('aria-invalid', String(!valid));
  if (field === serviceNative) serviceTrigger?.setAttribute('aria-invalid', String(!valid));
  return valid;
}

function setServiceMenu(open, focusOption = false) {
  if (!serviceMenu || !serviceTrigger) return;
  serviceMenu.hidden = !open;
  serviceTrigger.setAttribute('aria-expanded', String(open));
  if (open && focusOption) {
    const selected = serviceOptions.find((option) => option.getAttribute('aria-selected') === 'true');
    (selected || serviceOptions[0])?.focus();
  }
}

function chooseService(option) {
  if (!serviceNative || !serviceValue || !option) return;
  serviceNative.value = option.dataset.value || '';
  serviceValue.textContent = option.dataset.value || 'Choose a service';
  serviceOptions.forEach((item) => item.setAttribute('aria-selected', String(item === option)));
  serviceNative.dispatchEvent(new Event('input', { bubbles: true }));
  serviceNative.dispatchEvent(new Event('change', { bubbles: true }));
  validateField(serviceNative);
  setServiceMenu(false);
  serviceTrigger?.focus();
}

serviceTrigger?.addEventListener('click', () => {
  setServiceMenu(serviceTrigger.getAttribute('aria-expanded') !== 'true');
});

serviceTrigger?.addEventListener('keydown', (event) => {
  if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
  event.preventDefault();
  setServiceMenu(true, true);
});

serviceOptions.forEach((option, index) => {
  option.addEventListener('click', () => chooseService(option));
  option.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setServiceMenu(false);
      serviceTrigger?.focus();
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let target = index;
    if (event.key === 'ArrowDown') target = (index + 1) % serviceOptions.length;
    if (event.key === 'ArrowUp') target = (index - 1 + serviceOptions.length) % serviceOptions.length;
    if (event.key === 'Home') target = 0;
    if (event.key === 'End') target = serviceOptions.length - 1;
    serviceOptions[target]?.focus();
  });
});

document.addEventListener('pointerdown', (event) => {
  if (!serviceSelect?.contains(event.target)) setServiceMenu(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && serviceTrigger?.getAttribute('aria-expanded') === 'true') {
    setServiceMenu(false);
    serviceTrigger.focus();
  }
});

form?.querySelectorAll('input, select, textarea').forEach((field) => {
  field.addEventListener('blur', () => validateField(field));
  field.addEventListener('input', () => {
    if (field.closest('.field')?.classList.contains('is-invalid')) validateField(field);
  });
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const requiredFields = [...form.querySelectorAll('[required]')];
  const valid = requiredFields.map(validateField).every(Boolean);
  if (!valid) {
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    if (firstInvalid === serviceNative) serviceTrigger?.focus();
    else firstInvalid?.focus();
    return;
  }

  const data = new FormData(form);
  const name = String(data.get('name') || '').trim();
  const email = String(data.get('email') || '').trim();
  const phone = String(data.get('phone') || '').trim();
  const service = String(data.get('service') || '').trim();
  const date = String(data.get('date') || '').trim();
  const message = String(data.get('message') || '').trim();
  const subject = `Studio enquiry — ${service} — ${name}`;
  const body = [
    'Hi The Eclipse Studios,',
    '',
    `I’d like to enquire about ${service}.`,
    date ? `Preferred session date: ${date}` : 'Preferred session date: Flexible',
    '',
    message,
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || 'Not provided'}`
  ].join('\n');

  formSuccess?.classList.add('is-visible');
  window.setTimeout(() => {
    window.location.href = `mailto:bhavyasatija2540@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, reducedMotion ? 0 : 650);
});
