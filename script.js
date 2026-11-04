'use strict';

const invitation = document.getElementById('invitation');
const success = document.getElementById('success');
const noButton = document.getElementById('no-button');
const yesButton = document.getElementById('yes-button');
const hint = document.getElementById('hint');
const hearts = document.getElementById('hearts');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let escapes = 0;
let lastEscape = -Infinity;
let heartTimer;

function moveNoButton(event) {
  if (event.type === 'pointerdown') event.preventDefault();
  const now = performance.now();
  if (now - lastEscape < 180) return;
  lastEscape = now;
  const rect = noButton.getBoundingClientRect();
  const viewport = window.visualViewport;
  const padding = 24;
  const minX = (viewport?.offsetLeft ?? 0) + padding;
  const minY = (viewport?.offsetTop ?? 0) + padding;
  const maxX = Math.max(minX, (viewport?.offsetLeft ?? 0) + (viewport?.width ?? window.innerWidth) - rect.width - padding);
  const maxY = Math.max(minY, (viewport?.offsetTop ?? 0) + (viewport?.height ?? window.innerHeight) - rect.height - padding);
  const yesRect = yesButton.getBoundingClientRect();
  const pointerX = event.clientX ?? rect.left;
  const pointerY = event.clientY ?? rect.top;
  // Choose the furthest of several valid positions so the button actually escapes.
  let target = { x: minX, y: minY, distance: -1 };
  for (let i = 0; i < 20; i++) {
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    if (x < yesRect.right + 16 && x + rect.width > yesRect.left - 16 &&
        y < yesRect.bottom + 16 && y + rect.height > yesRect.top - 16) continue;
    const distance = Math.hypot(x + rect.width / 2 - pointerX, y + rect.height / 2 - pointerY);
    if (distance > target.distance) target = { x, y, distance };
  }
  noButton.classList.add('escaped');
  noButton.style.left = `${target.x}px`;
  noButton.style.top = `${target.y}px`;
  escapes++;
  hint.textContent = escapes > 3 ? '它说：再给这份邀请一点机会嘛 ♡' : '咦，它跑走了。看来它有自己的想法 ♡';
}

noButton.addEventListener('pointerenter', (event) => {
  if (event.pointerType !== 'touch') moveNoButton(event);
});
noButton.addEventListener('pointerdown', moveNoButton);
noButton.addEventListener('click', moveNoButton);

function celebrate() {
  clearTimeout(heartTimer);
  hearts.replaceChildren();
  if (reducedMotion.matches) return;
  for (let i = 0; i < 28; i++) {
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.textContent = i % 3 === 0 ? '♡' : '♥';
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${14 + Math.random() * 24}px`;
    heart.style.setProperty('--delay', `${Math.random() * 1.2}s`);
    hearts.append(heart);
  }
  heartTimer = setTimeout(() => hearts.replaceChildren(), 5000);
}

yesButton.addEventListener('click', () => {
  invitation.hidden = true;
  success.hidden = false;
  noButton.classList.remove('escaped');
  celebrate();
  const heading = document.getElementById('success-title');
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
  document.querySelector('.window').scrollIntoView({ behavior: 'instant', block: 'start' });
});

document.getElementById('copy-button').addEventListener('click', async () => {
  const text = document.getElementById('reply-text').textContent;
  const status = document.getElementById('copy-status');
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(text);
    status.textContent = '已复制！发给那位在意你的人吧 ♡';
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(document.getElementById('reply-text'));
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = '请长按或复制上面选中的回复 ♡';
  }
});

document.getElementById('restart-button').addEventListener('click', () => {
  success.hidden = true;
  invitation.hidden = false;
  noButton.classList.remove('escaped');
  noButton.style.removeProperty('left');
  noButton.style.removeProperty('top');
  escapes = 0;
  hint.textContent = '小提示：有个按钮好像有自己的想法。';
  document.getElementById('copy-status').textContent = '复制后，发给那位在意你的人吧。';
  clearTimeout(heartTimer);
  hearts.replaceChildren();
  yesButton.focus({ preventScroll: true });
});

function resetNoPosition() {
  noButton.classList.remove('escaped');
  noButton.style.removeProperty('left');
  noButton.style.removeProperty('top');
}

window.addEventListener('resize', resetNoPosition);
window.visualViewport?.addEventListener('resize', resetNoPosition);
