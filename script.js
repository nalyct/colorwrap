'use strict';

// Navigation mobile : tous les liens fonctionnent hors ligne, en ouvrant index.html.
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primary-nav');

function closeMenu() {
  nav?.classList.remove('is-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.setAttribute('aria-label', 'Ouvrir le menu');
}

menuToggle?.addEventListener('click', () => {
  const willOpen = !nav.classList.contains('is-open');
  nav.classList.toggle('is-open', willOpen);
  menuToggle.setAttribute('aria-expanded', String(willOpen));
  menuToggle.setAttribute('aria-label', willOpen ? 'Fermer le menu' : 'Ouvrir le menu');
});

nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => {
  if (nav?.classList.contains('is-open') && !event.target.closest('.site-header')) closeMenu();
});

// Indicateur ColorWrap : simulateur pédagogique, PAS un outil de diagnostic alimentaire.
const indicatorStates = {
  green: {
    name: 'Vert · État initial',
    symbol: '✓',
    description: 'Aucun changement significatif détecté par l’indicateur dans cette simulation.',
    advice: 'Continuez à respecter la température de conservation et la date limite indiquée.'
  },
  orange: {
    name: 'Orange · Évolution détectée',
    symbol: '!',
    description: 'La simulation montre une évolution de l’environnement chimique de la zone indicatrice.',
    advice: 'Soyez vigilant : vérifiez les conditions de conservation et respectez strictement la DLC.'
  },
  red: {
    name: 'Rouge · Altération possible',
    symbol: '×',
    description: 'La simulation illustre un niveau de marqueurs potentiellement associé à l’altération.',
    advice: 'Ne vous fiez pas à la seule couleur pour juger la sécurité d’un aliment. En cas de doute, ne le consommez pas.'
  }
};
let currentIndicatorState = 'green';
const sensorVisual = document.querySelector('#sensor-visual');
const sensorName = document.querySelector('#sensor-name');
const sensorDescription = document.querySelector('#sensor-description');
const sensorAdvice = document.querySelector('#sensor-advice');
const sensorSymbol = document.querySelector('#sensor-symbol');
const speechFeedback = document.querySelector('#speech-feedback');

function chooseIndicatorState(name) {
  const data = indicatorStates[name];
  if (!data) return;
  currentIndicatorState = name;
  sensorVisual.className = 'sensor-visual state-' + name;
  sensorSymbol.textContent = data.symbol;
  sensorName.textContent = data.name;
  sensorDescription.textContent = data.description;
  sensorAdvice.textContent = data.advice;
  speechFeedback.textContent = '';
  document.querySelectorAll('.sensor-control').forEach(button => {
    const active = button.dataset.state === name;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

document.querySelectorAll('.sensor-control').forEach(button => {
  button.addEventListener('click', () => chooseIndicatorState(button.dataset.state));
});

document.querySelector('#read-status')?.addEventListener('click', () => {
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
    speechFeedback.textContent = 'La synthèse vocale n’est pas disponible dans ce navigateur. Le résultat reste lisible ci-dessus.';
    return;
  }
  window.speechSynthesis.cancel();
  const state = indicatorStates[currentIndicatorState];
  const utterance = new SpeechSynthesisUtterance([state.name, state.description, state.advice].join('. '));
  utterance.lang = 'fr-FR';
  utterance.rate = 0.95;
  utterance.onerror = () => { speechFeedback.textContent = 'Lecture vocale indisponible sur cet appareil.'; };
  utterance.onstart = () => { speechFeedback.textContent = 'Lecture vocale en cours…'; };
  utterance.onend = () => { speechFeedback.textContent = ''; };
  window.speechSynthesis.speak(utterance);
});

// Les 3 couches de la zone indicatrice.
const layerData = {
  protect: {
    icon: '◈',
    number: 'COUCHE 03 / PROTECTRICE',
    name: 'Une protection qui laisse passer les gaz',
    description: 'Une membrane microporeuse est envisagée pour permettre la diffusion de certains composés volatils tout en limitant le contact direct de l’indicateur avec l’aliment et les gouttelettes.',
    fact: 'Objectif : protéger la zone colorée sans empêcher la réponse aux gaz.',
    chips: ['Membrane microporeuse', 'Séparation', 'Diffusion des gaz']
  },
  indicator: {
    icon: '✿',
    number: 'COUCHE 02 / INDICATRICE',
    name: 'Le cœur intelligent du film',
    description: 'Une matrice de biopolymère, par exemple de l’alginate de sodium avec du glycérol, intègre des anthocyanes de chou rouge. Le changement de pH associé aux gaz d’altération peut modifier leur teinte.',
    fact: 'Zone cible : 2 cm² maximum pour limiter la quantité de pigments.',
    chips: ['Alginate de sodium', 'Glycérol', 'Anthocyanes']
  },
  support: {
    icon: '▱',
    number: 'COUCHE 01 / SUPPORT',
    name: 'Une base souple pour l’ensemble',
    description: 'Un film de cellulose ou un autre biopolymère adapté servirait de support à la zone indicatrice et contribuerait à la tenue mécanique de l’emballage.',
    fact: 'À tester : souplesse, résistance à l’humidité et aptitude au contact alimentaire.',
    chips: ['Cellulose', 'Biopolymère', 'Film support']
  }
};

function chooseLayer(key) {
  const layer = layerData[key];
  if (!layer) return;
  document.querySelectorAll('.layer-bar').forEach(button => {
    const active = button.dataset.layer === key;
    button.classList.toggle('selected', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelector('#layer-icon').textContent = layer.icon;
  document.querySelector('#layer-number').textContent = layer.number;
  document.querySelector('#layer-name').textContent = layer.name;
  document.querySelector('#layer-description').textContent = layer.description;
  document.querySelector('#layer-fact').innerHTML = '<span aria-hidden="true">↳</span> ' + layer.fact;
  document.querySelector('#layer-chips').replaceChildren(...layer.chips.map(label => {
    const span = document.createElement('span');
    span.textContent = label;
    return span;
  }));
}

document.querySelectorAll('.layer-bar').forEach(button => button.addEventListener('click', () => chooseLayer(button.dataset.layer)));

// Navigation par onglets des conseils avec prise en charge des flèches du clavier.
const tabButtons = [...document.querySelectorAll('.tab[data-tab]')];
function showTips(category, focus = false) {
  const target = tabButtons.find(button => button.dataset.tab === category);
  if (!target) return;
  tabButtons.forEach(button => {
    const active = button === target;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
  });
  document.querySelectorAll('[data-panel]').forEach(panel => { panel.hidden = panel.dataset.panel !== category; });
  if (focus) target.focus();
}

tabButtons.forEach((button, index) => {
  button.addEventListener('click', () => showTips(button.dataset.tab));
  button.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabButtons.length - 1
      : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabButtons.length) % tabButtons.length;
    showTips(tabButtons[next].dataset.tab, true);
  });
});

// Les raccourcis « conseils » du haut ouvrent directement le bon onglet.
document.querySelectorAll('[data-advice]').forEach(link => {
  link.addEventListener('click', () => showTips(link.dataset.advice));
});

// Contact sans backend : on prépare un texte et on l'offre à copier.
// Aucun message, aucune donnée personnelle ne sont envoyés ou enregistrés.
const contactForm = document.querySelector('#contact-form');
const messagePreview = document.querySelector('#message-preview');
const previewText = document.querySelector('#preview-text');
const copyButton = document.querySelector('#copy-message');
const copyFeedback = document.querySelector('#copy-feedback');

contactForm?.addEventListener('submit', event => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;
  const name = contactForm.elements.name.value.trim();
  const email = contactForm.elements.email.value.trim();
  const subject = contactForm.elements.subject.value;
  const message = contactForm.elements.message.value.trim();
  if (!message || !name || !email) return;
  previewText.textContent = `Objet : ColorWrap — ${subject}\n\nBonjour,\n\n${message}\n\nBien cordialement,\n${name}\n${email}`;
  messagePreview.hidden = false;
  copyFeedback.textContent = '';
  messagePreview.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
});

copyButton?.addEventListener('click', async () => {
  const text = previewText.textContent;
  if (!text) return;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      const successful = document.execCommand('copy');
      field.remove();
      if (!successful) throw new Error('Copie non prise en charge');
    }
    copyFeedback.textContent = '✓ Message copié ! Vous pouvez maintenant le coller dans votre messagerie.';
  } catch (_) {
    copyFeedback.textContent = 'La copie automatique n’est pas disponible. Sélectionnez le texte ci-dessus pour le copier manuellement.';
  }
});

// La navigation reste informée du chapitre consulté.
if ('IntersectionObserver' in window) {
  const anchors = [...document.querySelectorAll('.primary-nav a[href^="#"]')];
  const sections = anchors.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      anchors.forEach(link => link.classList.toggle('is-current', link.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-25% 0px -65% 0px' });
  sections.forEach(section => observer.observe(section));
}
