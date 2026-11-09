(function KlarApp() {
'use strict';
const KEY = 'klar.p009.v1';
const $ = (id) => document.getElementById(id);
const emptyState = () => ({ version: 2, habits: [], tasks: [], daily: {}, history: {} });
const id = () => (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);
const dayKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const validDate = (value) => typeof value === 'string' && Number.isFinite(Date.parse(value));
const cleanString = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';
function validate(raw) {
  if (!raw || ![1, 2].includes(raw.version) || !Array.isArray(raw.habits) || !Array.isArray(raw.tasks) || !raw.daily || typeof raw.daily !== 'object' || Array.isArray(raw.daily)) throw new Error('Ungültiges Backup-Format');
  if (raw.habits.length > 200 || raw.tasks.length > 500 || Object.keys(raw.daily).length > 4000 || (raw.history && Object.keys(raw.history).length > 4000)) throw new Error('Backup ist zu groß');
  const habits = raw.habits.map((h) => ({ id: cleanString(h.id, 100), name: cleanString(h.name, 65), since: h.since })).filter((h) => h.id && h.name && validDate(h.since));
  const tasks = raw.tasks.map((t) => ({ id: cleanString(t.id, 100), name: cleanString(t.name, 100) })).filter((t) => t.id && t.name);
  if (habits.length !== raw.habits.length || tasks.length !== raw.tasks.length) throw new Error('Ungültige Einträge im Backup');
  if (new Set(habits.map(h=>h.id)).size !== habits.length || new Set(tasks.map(t=>t.id)).size !== tasks.length) throw new Error('Doppelte IDs im Backup');
  const taskIds = new Set(tasks.map(t => t.id));
  const daily = {};
  for (const [date, list] of Object.entries(raw.daily)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Array.isArray(list) || list.length > 500) throw new Error('Ungültiger Tagesverlauf');
    daily[date] = [...new Set(list.filter(x => typeof x === 'string' && taskIds.has(x)))];
  }
  const history = {};
  if (raw.version === 2) {
    if (!raw.history || typeof raw.history !== 'object' || Array.isArray(raw.history)) throw new Error('Ungültige Verlaufsdaten');
    for (const [date, entry] of Object.entries(raw.history)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !entry || !Number.isSafeInteger(entry.completed) || !Number.isSafeInteger(entry.total) || entry.completed < 0 || entry.total < 0 || entry.completed > entry.total || entry.total > 500) throw new Error('Ungültige Verlaufsdaten');
      history[date] = { completed: entry.completed, total: entry.total };
    }
  }
  return { version: 2, habits, tasks, daily, history };
}
let state;
try { state = validate(JSON.parse(localStorage.getItem(KEY))) } catch { state = emptyState() }
let openHabitId = null;
let openTaskId = null;
let activeDay = dayKey();
let toastTimer;
function notify(message) {
  $('toast').textContent = message;
  $('toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.remove('show'), 2800);
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); return true }
  catch { notify('Speichern nicht möglich – Browserspeicher prüfen'); return false }
}
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
const dateFormat = new Intl.DateTimeFormat('de-DE', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
function sinceLabel(since) {
  const ms = Math.max(0, Date.now() - new Date(since).getTime());
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor(ms / 3600000) % 24;
  const minutes = Math.floor(ms / 60000) % 60;
  return { amount: days ? days : Math.floor(ms / 3600000), unit: days ? (days===1?'Tag':'Tage') : 'Std.', detail: days ? `${hours} Std. · ${minutes} Min. zusätzlich` : `${minutes} Min. zusätzlich` };
}
function habitCard(habit) {
  const card = el('article','habit-card');
  const top = el('div','habit-card-top');
  const label = el('div','habit-name-wrap');
  label.append(el('span','habit-icon','↗'), el('span','habit-name',habit.name));
  const actions = el('div','habit-actions');
  for(const [action,sign,title] of [['edit-habit','✎','Zähler bearbeiten'],['delete-habit','×','Zähler löschen']]) {
    const b = el('button','icon-button',sign); b.type='button';b.title=title;b.setAttribute('aria-label',`${title}: ${habit.name}`);b.dataset.action=action;b.dataset.id=habit.id; actions.append(b);
  }
  top.append(label,actions);
  const number = el('div','habit-days');number.dataset.since=habit.since;
  const detail = el('div','habit-detail');detail.dataset.detail=habit.since;
  card.append(top, number, detail, el('div','habit-date',`Seit ${dateFormat.format(new Date(habit.since))}`));
  return card;
}
function refreshHabits() {
  document.querySelectorAll('[data-since]').forEach(node => {
    const timer=sinceLabel(node.dataset.since);
    node.replaceChildren(document.createTextNode(String(timer.amount)),el('span','',` ${timer.unit}`));
  });
  document.querySelectorAll('[data-detail]').forEach(node => node.textContent=sinceLabel(node.dataset.detail).detail);
}
function renderHabits() {
  $('habit-list').replaceChildren(...state.habits.map(habitCard));
  $('habit-empty').hidden=state.habits.length>0;
  $('hero-habits').textContent=state.habits.length;
  refreshHabits();
}
function todayDone() {return new Set(state.daily[activeDay] || [])}
function recordToday() {
  const taskIds = new Set(state.tasks.map(t => t.id));
  const completed = [...todayDone()].filter(taskId => taskIds.has(taskId)).length;
  state.history[activeDay] = { completed, total: state.tasks.length };
}
function renderHistory() {
  const keys = []; const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i, 12);
    keys.push({ date: dayKey(d), label: new Intl.DateTimeFormat('de-DE', { weekday: 'short' }).format(d), today: i === 0 });
  }
  const entries = keys.map(({ date }) => state.history[date]).filter(entry => entry && entry.total > 0);
  const doneSum = entries.reduce((sum, entry) => sum + entry.completed, 0);
  const totalSum = entries.reduce((sum, entry) => sum + entry.total, 0);
  const percentage = totalSum ? Math.round(doneSum * 100 / totalSum) : 0;
  const perfect = entries.filter(entry => entry.completed === entry.total).length;
  let streak = 0;
  for (let index = 6; index >= 0; index--) {
    const entry = state.history[keys[index].date];
    if (index === 6 && (!entry || entry.total === 0 || entry.completed !== entry.total)) continue;
    if (!entry || entry.total === 0 || entry.completed !== entry.total) break;
    streak += 1;
  }
  $('history-average').textContent = `${percentage}%`;
  $('history-perfect').replaceChildren(document.createTextNode(String(perfect) + ' '), el('small', '', '/ 7'));
  $('history-streak').replaceChildren(document.createTextNode(String(streak) + ' '), el('small', '', streak === 1 ? 'Tag' : 'Tage'));
  const container = $('history-bars'); container.replaceChildren();
  for (const day of keys) {
    const entry = state.history[day.date];
    const percent = entry && entry.total ? Math.round(entry.completed * 100 / entry.total) : 0;
    const wrapper = el('div', `history-day${day.today ? ' today' : ''}`);
    const bar = el('div', 'history-bar');
    const fill = el('div', 'history-bar-fill'); fill.style.height = `${percent}%`; bar.append(fill);
    wrapper.append(el('span', 'history-value', entry && entry.total ? `${percent}%` : '–'), bar, el('span', 'history-day-label', day.label));
    wrapper.title = entry && entry.total ? `${day.date}: ${entry.completed} von ${entry.total} Aufgaben` : `${day.date}: keine Daten`;
    wrapper.setAttribute('aria-label', wrapper.title); container.append(wrapper);
  }
}
function renderTasks() {
  const done=todayDone();
  const list=$('task-list');list.replaceChildren();
  for(const task of state.tasks){
    const row=el('div',`task-item${done.has(task.id)?' done':''}`);
    const check=el('input','task-check');check.type='checkbox';check.checked=done.has(task.id);check.dataset.id=task.id;check.setAttribute('aria-label',`${task.name} erledigt`);
    const title=el('span','task-label',task.name);
    row.append(check,title);
    for(const [action,sign,label] of [['edit-task','✎','Bearbeiten'],['delete-task','×','Löschen']]){
      const b=el('button','icon-button',sign);b.type='button';b.dataset.action=action;b.dataset.id=task.id;b.title=label;b.setAttribute('aria-label',`${label}: ${task.name}`);row.append(b);
    }
    list.append(row);
  }
  const completed=state.tasks.filter(t=>done.has(t.id)).length;
  const total=state.tasks.length;
  const pct=total?Math.round(completed/total*100):0;
  $('task-empty').hidden=total>0;
  $('progress-percent').textContent=`${pct}%`;
  $('progress-ring').style.background=`conic-gradient(var(--accent) 0% ${pct}%,#2b392d ${pct}% 100%)`;
  $('progress-ring').setAttribute('aria-label',`${pct} Prozent erledigt`);
  $('progress-fill').style.width=`${pct}%`;
  $('progress-title').textContent=total && completed===total?'Alles geschafft. Stark!':completed?'Du bist auf dem richtigen Weg':'Alles bereit für heute';
  $('progress-summary').textContent=total?`${completed} von ${total} Aufgaben erledigt`:'Füge deine erste Aufgabe hinzu.';
  $('hero-tasks').textContent=`${completed}/${total}`;
  renderHistory();
}
function dateToInput(date) {const d = new Date(date);const pad=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`}
function openHabit(habit=null) {
  openHabitId=habit?.id??null;
  $('habit-dialog-title').textContent=habit?'Zähler bearbeiten':'Neuer Zähler';
  $('habit-name').value=habit?.name??'';
  $('habit-since').value=dateToInput(habit?.since??new Date());
  $('habit-since').max=dateToInput(new Date());
  $('habit-dialog').showModal();$('habit-name').focus();
}
function openTask(task=null) {
  openTaskId=task?.id??null;
  $('task-dialog-title').textContent=task?'Aufgabe bearbeiten':'Neue Aufgabe';
  $('task-name').value=task?.name??'';
  $('task-dialog').showModal();$('task-name').focus();
}
function ensureDay() {
  const next=dayKey();if(next!==activeDay){activeDay=next;recordToday();save();renderTasks()}
  $('date-label').textContent=new Intl.DateTimeFormat('de-DE',{weekday:'short',day:'numeric',month:'long'}).format(new Date());
}
$('add-habit').addEventListener('click',()=>openHabit());
$('add-habit-empty').addEventListener('click',()=>openHabit());
$('add-task').addEventListener('click',()=>openTask());
$('add-task-empty').addEventListener('click',()=>openTask());
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.close).close()));
$('habit-form').addEventListener('submit',(event)=>{
  event.preventDefault();
  if(!$('habit-form').reportValidity())return;
  const name=$('habit-name').value.trim();const time=new Date($('habit-since').value);
  if(!name||!Number.isFinite(time.getTime())||time.getTime()>Date.now()){notify('Bitte einen Zeitpunkt in der Vergangenheit wählen');return}
  const record={id:openHabitId??id(),name:name.slice(0,65),since:time.toISOString()};
  if(openHabitId) state.habits=state.habits.map(h=>h.id===openHabitId?record:h);
  else state.habits.unshift(record);
  save();$('habit-dialog').close();renderHabits();notify(openHabitId?'Zähler aktualisiert':'Zähler angelegt');
});
$('task-form').addEventListener('submit',(event)=>{
  event.preventDefault();if(!$('task-form').reportValidity())return;
  const name=$('task-name').value.trim().slice(0,100);if(!name)return;
  if(openTaskId) state.tasks=state.tasks.map(t=>t.id===openTaskId?{...t,name}:t);
  else state.tasks.push({id:id(),name});
  recordToday();save();$('task-dialog').close();renderTasks();notify(openTaskId?'Aufgabe aktualisiert':'Aufgabe hinzugefügt');
});
$('habit-list').addEventListener('click',(event)=>{
  const b=event.target.closest('[data-action]');if(!b)return;
  const habit=state.habits.find(h=>h.id===b.dataset.id);if(!habit)return;
  if(b.dataset.action==='edit-habit')openHabit(habit);
  if(b.dataset.action==='delete-habit'&&confirm(`„${habit.name}“ wirklich löschen?`)){
    state.habits=state.habits.filter(h=>h.id!==habit.id);save();renderHabits();notify('Zähler gelöscht');
  }
});
$('task-list').addEventListener('click',(event)=>{
  const b=event.target.closest('[data-action]');if(!b)return;
  const task=state.tasks.find(t=>t.id===b.dataset.id);if(!task)return;
  if(b.dataset.action==='edit-task')openTask(task);
  if(b.dataset.action==='delete-task'&&confirm(`„${task.name}“ wirklich löschen?`)){
    state.tasks=state.tasks.filter(t=>t.id!==task.id);
    for(const key of Object.keys(state.daily))state.daily[key]=state.daily[key].filter(x=>x!==task.id);
    recordToday();save();renderTasks();notify('Aufgabe gelöscht');
  }
});
$('task-list').addEventListener('change',(event)=>{
  const checkbox=event.target;if(!checkbox.matches('.task-check'))return;
  ensureDay();const done=todayDone();checkbox.checked?done.add(checkbox.dataset.id):done.delete(checkbox.dataset.id);
  state.daily[activeDay]=[...done];recordToday();save();renderTasks();
});
$('export-data').addEventListener('click',()=>{
  const data=JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2);
  if (window.KlarNative && typeof window.KlarNative.saveBackup === 'function') {
    window.KlarNative.saveBackup(data);
    return;
  }
  const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));
  const link=el('a');link.href=url;link.download=`klar-backup-${dayKey()}.json`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Backup erstellt');
});
$('import-data').addEventListener('click',()=>$('import-file').click());
$('import-file').addEventListener('change',async(event)=>{
  const file=event.target.files?.[0];event.target.value='';if(!file)return;
  if(file.size>2_000_000){notify('Backup-Datei ist zu groß');return}
  try{
    const data=validate(JSON.parse(await file.text()));
    if(!confirm('Backup laden? Deine aktuellen Einträge werden ersetzt.'))return;
    state=data;save();renderHabits();renderTasks();notify('Backup wiederhergestellt');
  }catch(error){notify(`Import fehlgeschlagen: ${error.message}`)}
});
document.querySelectorAll('.dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)d.close()}));
recordToday();save();ensureDay();renderHabits();renderTasks();
setInterval(()=>{ensureDay();refreshHabits()},30_000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){ensureDay();refreshHabits()}});
if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost')) {
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}
})();
