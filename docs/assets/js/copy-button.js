// assets/js/copy-button.js

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('pre > code').forEach(codeBlock => {
    const button = document.createElement('button');
    button.textContent = 'Copy';
    button.style.cssText = 'position: absolute; top: 0.5em; right: 0.5em;';
    button.addEventListener('click', () => {
      navigator.clipboard.writeText(codeBlock.textContent);
      button.textContent = 'Copied!';
      setTimeout(() => (button.textContent = 'Copy'), 2000);
    });
    const pre = codeBlock.parentNode;
    pre.style.position = 'relative';
    pre.insertBefore(button, codeBlock);
  });
});
