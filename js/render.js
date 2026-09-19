/* Builds the homepage from js/data.js. Load order matters:
   data.js must load BEFORE this file (see index.html script tags). */

function iconImgHtml(item, size) {
  size = size || 18;
  if (item.emoji) {
    // No public logo available — render a plain text badge instead
    // of an actual icon, keeps the flat/no-emoji visual language.
    return `<span class="skill-chip-fallback">${item.name.slice(0, 2).toUpperCase()}</span>`;
  }
  const src = item.src || `https://cdn.simpleicons.org/${item.slug}`;
  return `<img src="${src}" alt="" width="${size}" height="${size}" loading="lazy">`;
}

function renderSkills() {
  const el = document.getElementById('skills-grid');
  if (!el) return;
  el.innerHTML = SKILLS.map((s) => `
    <span class="skill-chip" data-slug="${s.slug}">${iconImgHtml(s)}${s.name}</span>
  `).join('');
}

function renderExperience() {
  const el = document.getElementById('experience-timeline');
  if (!el) return;
  el.innerHTML = EXPERIENCE.map((item) => {
    const programsHtml = item.programs && item.programs.length
      ? `<div class="proker-grid">${item.programs.map((p) => `
          <a class="proker-card" href="${p.link}" target="_blank" rel="noopener">
            <img src="${p.image}" alt="${p.title}" loading="lazy" data-placeholder-label="${p.image}">
            <div class="proker-card-body">
              <h4>${p.title}</h4>
              <p>${p.description}</p>
            </div>
          </a>
        `).join('')}</div>`
      : '';
    return `
      <div class="tl-item">
        <div class="tl-role">${item.role}</div>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        ${programsHtml}
      </div>
    `;
  }).join('');
  attachPlaceholderFallback(el);
}

function renderProjects() {
  const el = document.getElementById('project-grid');
  if (!el) return;
  el.innerHTML = PROJECTS.map((p, i) => `
    <a class="project-card${i === 0 ? ' feature' : ''}" href="project.html?slug=${p.slug}">
      <div class="project-media">
        <img src="${p.image}" alt="${p.title}" loading="lazy" data-placeholder-label="${p.image}">
      </div>
      <div class="project-body">
        <h3>${p.title}</h3>
        <p>${p.tagline}</p>
        <div class="project-tags">${p.tags.map((t) => `<span class="tag">${t}</span>`).join('')}</div>
        <span class="project-link">Lihat detail →</span>
      </div>
    </a>
  `).join('');
  attachPlaceholderFallback(el);
}

function renderContact() {
  const el = document.getElementById('contact-links');
  if (!el) return;
  el.innerHTML = CONTACT.map((c) => `<a href="${c.href}" target="_blank" rel="noopener">${c.label}</a>`).join('');
}

function renderStats() {
  const totalPrograms = EXPERIENCE.reduce((sum, e) => sum + (e.programs ? e.programs.length : 0), 0);
  const map = {
    'stat-projects': PROJECTS.length,
    'stat-programs': totalPrograms,
    'stat-skills': SKILLS.length
  };
  Object.keys(map).forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = map[id];
  });
}

function attachPlaceholderFallback(scope) {
  scope.querySelectorAll('img[data-placeholder-label]').forEach((img) => {
    img.addEventListener('error', () => {
      const box = document.createElement('div');
      box.className = 'ph-missing';
      box.setAttribute('data-label', img.dataset.placeholderLabel);
      img.replaceWith(box);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderSkills();
  renderExperience();
  renderProjects();
  renderContact();
  renderStats();
});