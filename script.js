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
let celebrationFrame;
let invitationAccepted = false;

function moveNoButton(event) {
  if (invitationAccepted) return;
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
noButton.addEventListener('click', (event) => {
  event.preventDefault();
  // Pointer input already moved the button. Ignore its delayed synthetic click.
  if (event.detail === 0) moveNoButton(event);
});

function celebrate() {
  clearTimeout(heartTimer);
  hearts.replaceChildren();
  if (reducedMotion.matches) return;
  const count = window.matchMedia('(max-width: 600px)').matches ? 12 : 24;
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.textContent = i % 3 === 0 ? '♡' : '♥';
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${14 + Math.random() * 24}px`;
    heart.style.setProperty('--delay', `${Math.random() * 1.2}s`);
    fragment.append(heart);
  }
  hearts.append(fragment);
  heartTimer = setTimeout(() => hearts.replaceChildren(), 5000);
}

function acceptInvitation() {
  if (invitationAccepted) return;
  invitationAccepted = true;
  invitation.hidden = true;
  success.hidden = false;
  noButton.style.pointerEvents = 'none';
  updateReply();
  resetNoPosition();
  const heading = document.getElementById('success-title');
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
  document.querySelector('.window').scrollIntoView({ behavior: 'instant', block: 'start' });
  // Paint the next step before doing the decorative animation work.
  celebrationFrame = requestAnimationFrame(() => {
    celebrationFrame = requestAnimationFrame(() => {
      if (invitationAccepted) celebrate();
    });
  });
}

yesButton.addEventListener('pointerup', (event) => {
  if (event.pointerType === 'touch' && event.isPrimary && event.button === 0) {
    event.preventDefault();
    acceptInvitation();
  }
});
yesButton.addEventListener('click', acceptInvitation);

document.getElementById('reply-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  updateReply();
  const text = document.getElementById('reply-text').textContent;
  const status = document.getElementById('copy-status');
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(text);
    status.textContent = '已复制！粘贴到微信发给我吧 ♡';
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(document.getElementById('reply-text'));
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = '请长按并复制选中的文字，然后粘贴到微信发给我吧 ♡';
  }
});

document.getElementById('restart-button').addEventListener('click', () => {
  invitationAccepted = false;
  cancelAnimationFrame(celebrationFrame);
  success.hidden = true;
  invitation.hidden = false;
  noButton.classList.remove('escaped');
  noButton.style.removeProperty('left');
  noButton.style.removeProperty('top');
  noButton.style.removeProperty('pointer-events');
  escapes = 0;
  lastEscape = -Infinity;
  hint.textContent = '小提示：有个按钮好像有自己的想法。';
  document.getElementById('copy-status').textContent = '复制后，粘贴到微信发给我吧。';
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


const replyForm = document.getElementById('reply-form');
const customDate = document.getElementById('custom-date');
const dateTime = document.getElementById('date-time');
const dateFormatter = new Intl.DateTimeFormat('zh-CN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const shortDateFormatter = new Intl.DateTimeFormat('zh-CN', { day: '2-digit', month: '2-digit', year: 'numeric' });
let saturday;
let sunday;

function localDateValue(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function refreshWeekend() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  saturday = new Date(today);
  // On Sunday, "this weekend" still means the current weekend.
  saturday.setDate(today.getDate() + (today.getDay() === 0 ? -1 : 6 - today.getDay()));
  sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);
  const saturdayPassed = saturday < today;
  document.getElementById('saturday-option').disabled = saturdayPassed;
  document.getElementById('saturday-label').textContent = shortDateFormatter.format(saturday) + (saturdayPassed ? ' · 已过去' : '');
  document.getElementById('sunday-label').textContent = shortDateFormatter.format(sunday);
  document.getElementById('weekend-range').textContent = `${shortDateFormatter.format(saturday)} – ${shortDateFormatter.format(sunday)}`;
  customDate.min = localDateValue(today);
  if (saturdayPassed && replyForm.elements.day.value === 'saturday') {
    replyForm.elements.day.value = 'sunday';
  }
}

function updateReply() {
  refreshWeekend();
  const day = replyForm.elements.day.value;
  const isCustom = day === 'custom';
  document.getElementById('custom-date-field').hidden = !isCustom;
  customDate.required = isCustom;
  customDate.disabled = !isCustom;
  let when;
  if (day === 'weekend') {
    when = `这个周末（${shortDateFormatter.format(saturday)} – ${shortDateFormatter.format(sunday)}）`;
  } else if (day === 'saturday' || day === 'sunday') {
    when = `${dateFormatter.format(day === 'saturday' ? saturday : sunday)}`;
  } else if (customDate.value && customDate.validity.valid) {
    const [year, month, date] = customDate.value.split('-').map(Number);
    when = `${dateFormatter.format(new Date(year, month - 1, date))}`;
  } else {
    document.getElementById('reply-text').textContent = '先选一个你方便的日期，回复就准备好啦。';
    document.getElementById('copy-status').textContent = '请先选择你想约的日期。';
    return;
  }
  const time = dateTime.value ? ` ${dateTime.value}` : '';
  const message = day === 'weekend'
    ? `好的，我接受你的邀请。${when}${time}，你觉得怎么样？`
    : `好的，我接受你的邀请。我想约在${when}${time}。`;
  document.getElementById('reply-text').textContent = message;
  document.getElementById('copy-status').textContent = '复制后，粘贴到微信发给我吧。';
}

replyForm.addEventListener('input', updateReply);
replyForm.addEventListener('change', updateReply);
window.addEventListener('pageshow', updateReply);
updateReply();
