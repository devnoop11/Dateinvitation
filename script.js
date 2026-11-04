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
  hint.textContent = escapes > 3 ? 'Er sagt: Denk noch ein bisschen darüber nach ♡' : 'Huch, da ist er weggelaufen. Ein kleiner Scherzkeks ♡';
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
  updateReply();
  noButton.classList.remove('escaped');
  celebrate();
  const heading = document.getElementById('success-title');
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
  document.querySelector('.window').scrollIntoView({ behavior: 'instant', block: 'start' });
});

document.getElementById('reply-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  updateReply();
  const text = document.getElementById('reply-text').textContent;
  const status = document.getElementById('copy-status');
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(text);
    status.textContent = 'Kopiert! Jetzt in WeChat einfügen und abschicken ♡';
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(document.getElementById('reply-text'));
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = 'Bitte den markierten Text gedrückt halten und kopieren. Danach in WeChat einfügen ♡';
  }
});

document.getElementById('restart-button').addEventListener('click', () => {
  success.hidden = true;
  invitation.hidden = false;
  noButton.classList.remove('escaped');
  noButton.style.removeProperty('left');
  noButton.style.removeProperty('top');
  escapes = 0;
  hint.textContent = 'Psst … einer der Buttons hat wohl seinen eigenen Kopf.';
  document.getElementById('copy-status').textContent = 'Danach in WeChat einfügen und selbst abschicken.';
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
const dateFormatter = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const shortDateFormatter = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
  document.getElementById('saturday-label').textContent = shortDateFormatter.format(saturday) + (saturdayPassed ? ' · bereits vorbei' : '');
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
    when = `dieses Wochenende (${shortDateFormatter.format(saturday)} – ${shortDateFormatter.format(sunday)})`;
  } else if (day === 'saturday' || day === 'sunday') {
    when = `am ${dateFormatter.format(day === 'saturday' ? saturday : sunday)}`;
  } else if (customDate.value && customDate.validity.valid) {
    const [year, month, date] = customDate.value.split('-').map(Number);
    when = `am ${dateFormatter.format(new Date(year, month - 1, date))}`;
  } else {
    document.getElementById('reply-text').textContent = 'Wähle bitte dein Wunschdatum aus. Dann ist deine Nachricht fertig.';
    document.getElementById('copy-status').textContent = 'Für deinen eigenen Vorschlag fehlt noch das Datum.';
    return;
  }
  const time = dateTime.value ? ` um ${dateTime.value} Uhr` : '';
  const message = day === 'weekend'
    ? `Ja, ich nehme deine Einladung gerne an! Wie wäre es ${when}${time}?`
    : `Ja, ich nehme deine Einladung gerne an! Ich schlage ${when}${time} vor.`;
  document.getElementById('reply-text').textContent = message;
  document.getElementById('copy-status').textContent = 'Danach in WeChat einfügen und selbst abschicken.';
}

replyForm.addEventListener('input', updateReply);
replyForm.addEventListener('change', updateReply);
window.addEventListener('pageshow', updateReply);
updateReply();
