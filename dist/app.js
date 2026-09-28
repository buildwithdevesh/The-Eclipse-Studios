const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.body.classList.add('loading');
window.addEventListener('load', () => {
  window.setTimeout(() => {
    document.querySelector('.loader')?.classList.add('is-hidden');
    document.body.classList.remove('loading');
  }, reducedMotion ? 0 : 650);
});

document.getElementById('year').textContent = new Date().getFullYear();

const meter = document.querySelector('.meter-bars');
const spectrum = document.querySelector('.spectrum');
for (let i = 0; i < 30; i += 1) {
  const bar = document.createElement('i');
  bar.style.animationDelay = `${(i * 0.047) % 0.6}s`;
  bar.style.animationDuration = `${0.55 + ((i * 13) % 7) / 10}s`;
  meter?.appendChild(bar);
}
for (let i = 0; i < 84; i += 1) {
  const bar = document.createElement('i');
  const height = 16 + Math.abs(Math.sin(i * 0.38)) * 70 + ((i * 17) % 15);
  bar.style.height = `${Math.min(height, 100)}%`;
  bar.style.animationDelay = `${(i * 0.023) % 0.8}s`;
  spectrum?.appendChild(bar);
}

const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
reveals.forEach((el) => observer.observe(el));

const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 40), { passive: true });

const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('.mobile-menu');
function setMenu(open) {
  menuButton?.setAttribute('aria-expanded', String(open));
  mobileMenu?.setAttribute('aria-hidden', String(!open));
  mobileMenu?.classList.toggle('is-open', open);
  document.body.style.overflow = open ? 'hidden' : '';
}
menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
  const glow = document.querySelector('.cursor-glow');
  const stage = document.querySelector('.sonic-console');
  window.addEventListener('pointermove', (event) => {
    glow?.style.setProperty('--mouse-x', `${event.clientX}px`);
    glow?.style.setProperty('--mouse-y', `${event.clientY}px`);
    const nx = (event.clientX / window.innerWidth - 0.5) * 18;
    const ny = (event.clientY / window.innerHeight - 0.5) * 14;
    stage?.style.setProperty('--mx', `${nx}px`);
    stage?.style.setProperty('--my', `${ny}px`);
  }, { passive: true });

  document.querySelectorAll('.magnetic').forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.16;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.16;
      element.style.transform = `translate(${x}px, ${y}px)`;
    });
    element.addEventListener('pointerleave', () => { element.style.transform = ''; });
  });

  document.querySelectorAll('.tilt-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const rx = ((event.clientY - rect.top) / rect.height - 0.5) * -3;
      const ry = ((event.clientX - rect.left) / rect.width - 0.5) * 3;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

const contactForm = document.getElementById('contact-form');
const formNote = document.getElementById('form-note');
contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;

  const data = new FormData(contactForm);
  const name = String(data.get('name') || '').trim();
  const email = String(data.get('email') || '').trim();
  const phone = String(data.get('phone') || '').trim();
  const service = String(data.get('service') || '').trim();
  const message = String(data.get('message') || '').trim();
  const subject = `Studio enquiry — ${service} — ${name}`;
  const body = [
    `Hi The Eclipse Studios,`,
    ``,
    `I'd like to enquire about ${service}.`,
    ``,
    message,
    ``,
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || 'Not provided'}`
  ].join('\n');

  formNote.textContent = 'Your enquiry is ready — opening your email app…';
  formNote.classList.add('is-success');
  window.location.href = `mailto:bhavyasatija2540@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
