document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('pre > code').forEach(codeBlock => {
    const btn = document.createElement('button');
    btn.textContent = 'Copy';
    btn.style.cssText = 'position:absolute; top:0.5em; right:0.5em;';
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(codeBlock.textContent);
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy', 2000);
    });
    const pre = codeBlock.parentNode;
    pre.style.position = 'relative';
    pre.insertBefore(btn, codeBlock);
  });
});
