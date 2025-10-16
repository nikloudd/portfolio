const body = document.body;
const themeToggle = document.getElementById('themeToggle');
const navLinks = document.querySelectorAll('.nav-bar nav a');
const galleryForm = document.getElementById('galleryForm');
const imageUpload = document.getElementById('imageUpload');
const imageTitle = document.getElementById('imageTitle');
const imageTags = document.getElementById('imageTags');
const gallery = document.querySelector('[data-gallery]');
const tildaForm = document.getElementById('tildaForm');
const tildaList = document.getElementById('tildaList');
const videoUpload = document.getElementById('videoUpload');
const heroVideo = document.getElementById('heroVideo');
const videoTitle = document.querySelector('[data-video-title]');
const videoDesc = document.querySelector('[data-video-desc]');
const videoFullscreen = document.getElementById('videoFullscreen');

const prefersLight = window.matchMedia('(prefers-color-scheme: light)');

function applyTheme(mode) {
  const isLight = mode === 'light';
  body.classList.toggle('dark-theme', isLight);
  themeToggle.setAttribute('aria-pressed', String(isLight));
  themeToggle.dataset.theme = mode;
  themeToggle.title = isLight ? 'Включить тёмный режим' : 'Включить светлый режим';
}

const savedTheme = localStorage.getItem('nova-theme');
if (savedTheme) {
  applyTheme(savedTheme);
} else if (prefersLight.matches) {
  applyTheme('light');
}

prefersLight.addEventListener('change', (event) => {
  if (!localStorage.getItem('nova-theme')) {
    applyTheme(event.matches ? 'light' : 'dark');
  }
});

themeToggle?.addEventListener('click', () => {
  const nextMode = body.classList.contains('dark-theme') ? 'dark' : 'light';
  applyTheme(nextMode);
  localStorage.setItem('nova-theme', nextMode);
});

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

const sections = Array.from(document.querySelectorAll('main section'));
const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const id = entry.target.getAttribute('id');
      if (!id) return;
      const link = document.querySelector(`nav a[href="#${id}"]`);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinks.forEach((item) => item.classList.remove('active'));
        link.classList.add('active');
      }
    });
  },
  {
    rootMargin: '-40% 0px -50% 0px',
    threshold: 0.1,
  }
);
sections.forEach((section) => navObserver.observe(section));

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
    rootMargin: '0px 0px -60px 0px',
  }
);

document.querySelectorAll('[data-animate]').forEach((element) => revealObserver.observe(element));

videoUpload?.addEventListener('change', (event) => {
  const [file] = event.target.files;
  if (!file) return;

  const videoURL = URL.createObjectURL(file);
  heroVideo.src = videoURL;
  heroVideo.play().catch(() => heroVideo.load());

  const title = file.name.replace(/\.[^/.]+$/, '');
  videoTitle.textContent = title || 'Моё новое видео';
  videoDesc.textContent = `${file.type || 'Видео'} · ${Math.round(file.size / 1024 / 1024)} МБ`;

  document.querySelectorAll('.upload-badge').forEach((el) => el.remove());
  const badge = document.createElement('span');
  badge.className = 'upload-badge';
  badge.textContent = 'новый upload';
  document.querySelector('.video-card')?.appendChild(badge);

  requestAnimationFrame(() => badge.classList.add('is-visible'));
});

videoFullscreen?.addEventListener('click', () => {
  if (heroVideo.requestFullscreen) {
    heroVideo.requestFullscreen();
  } else if (heroVideo.webkitRequestFullscreen) {
    heroVideo.webkitRequestFullscreen();
  }
});

function createTagList(tagsString) {
  if (!tagsString) return [];
  return tagsString
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`));
}

galleryForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const file = imageUpload.files[0];
  if (!file) {
    imageUpload.focus();
    return;
  }

  const title = imageTitle.value.trim() || 'Новый проект';
  const tags = createTagList(imageTags.value);

  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    const card = document.createElement('article');
    card.className = 'portfolio-card glass is-visible';

    const thumb = document.createElement('div');
    thumb.className = 'card-thumb uploaded';
    thumb.style.backgroundImage = `url(${loadEvent.target.result})`;
    thumb.style.backgroundSize = 'cover';
    thumb.style.backgroundPosition = 'center';
    thumb.style.border = '1px solid rgba(255, 255, 255, 0.35)';

    const body = document.createElement('div');
    body.className = 'card-body';

    const heading = document.createElement('h3');
    heading.textContent = title;

    const description = document.createElement('p');
    description.textContent = 'Локальная загрузка — сохраните страницу, чтобы не потерять вдохновение.';

    const tagList = document.createElement('ul');
    tagList.className = 'card-tags';

    if (tags.length) {
      tags.forEach((tag) => {
        const tagItem = document.createElement('li');
        tagItem.textContent = tag;
        tagList.appendChild(tagItem);
      });
    }

    body.append(heading, description, tagList);
    card.append(thumb, body);
    gallery.prepend(card);

    galleryForm.reset();
    imageUpload.value = '';
  };

  reader.readAsDataURL(file);
});

const urlPattern = /^(https?:\/\/)/i;

tildaForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = document.getElementById('tildaTitle').value.trim();
  let url = document.getElementById('tildaUrl').value.trim();

  if (!title || !url) return;
  if (!urlPattern.test(url)) {
    url = `https://${url}`;
  }

  const item = document.createElement('li');
  item.className = 'tilda-card';
  item.innerHTML = `
    <div class="card-header">
      <h3>${title}</h3>
      <span>новый сайт · Tilda</span>
    </div>
    <a class="card-link" href="${url}" target="_blank" rel="noopener">Открыть →</a>
  `;

  tildaList.prepend(item);
  tildaForm.reset();
});

const pageLoadDuration = performance.now();
if (pageLoadDuration < 1200) {
  document.body.classList.add('page-loaded');
}
