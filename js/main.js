// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Placeholder fallback: any <img> that fails to load (because the
  // real asset hasn't been dropped in assets/images/... yet) turns
  // into a labelled dashed box instead of a broken image icon.
  document.querySelectorAll('img[data-placeholder-label]').forEach((img) => {
    img.addEventListener('error', () => {
      const box = document.createElement('div');
      box.className = 'ph-missing';
      box.setAttribute('data-label', img.dataset.placeholderLabel);
      img.replaceWith(box);
    });
  });
});
