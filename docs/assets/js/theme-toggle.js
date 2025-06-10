// assets/js/theme-toggle.js
(function() {
  const btn = document.createElement('button');
  btn.id = 'theme-toggle';
  btn.innerHTML = '&#9790;'; // luna por defecto
  document.body.appendChild(btn);

  // Determina tema inicial
  const saved = localStorage.getItem('theme');
  const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const theme = saved || system;
  document.documentElement.setAttribute('data-theme', theme);
  btn.innerHTML = theme === 'dark' ? '&#9728;' : '&#9790;';

  btn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    btn.innerHTML = next === 'dark' ? '&#9728;' : '&#9790;';
  });
})();
