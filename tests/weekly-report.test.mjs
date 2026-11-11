import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const begin = source.indexOf('function getWeekDays()');
const end = source.indexOf('function renderTasks()', begin);
assert.ok(begin >= 0 && end > begin, 'weekly report function block exists');
const code = source.slice(begin, end);
const key = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const factory = new Function('state','weekOffset','dayKey',code+'\nreturn { getWeekDays, weekSummary, generateWeeklyCsv };');
const make = (state, offset = 0) => factory(state, offset, key);

test('Calendar week begins on Monday and ends on Sunday', () => {
  const week = make({ history:{}, habits:[] }).getWeekDays();
  assert.equal(week.length, 7);
  assert.equal(new Date(week[0].date + 'T12:00:00').getDay(), 1);
  assert.equal(new Date(week[6].date + 'T12:00:00').getDay(), 0);
});

test('Previous week can be exported', () => {
  const state = {history:{},habits:[]};
  const now = make(state).getWeekDays();
  const prev = make(state,-1).getWeekDays();
  assert.ok(prev[6].date < now[0].date);
});

test('Summary is weighted correctly and excludes missing days', () => {
  const state = {history:{},habits:[]};
  const api = make(state);
  const days = api.getWeekDays();
  state.history[days[0].date]={completed:1,total:2};
  state.history[days[1].date]={completed:3,total:6};
  assert.deepEqual(
    Object.fromEntries(Object.entries(api.weekSummary(days)).filter(([k])=>['completed','total','percent','recorded'].includes(k))),
    {completed:4,total:8,percent:50,recorded:2}
  );
});

test('CSV includes seven rows and protects against spreadsheet formula execution', () => {
  const state = {history:{},habits:[{name:'=HYPERLINK("example")',since:'2020-01-01T12:00:00.000Z'}]};
  const api = make(state);
  const days = api.getWeekDays();
  state.history[days[0].date]={completed:1,total:2};
  const csv = api.generateWeeklyCsv();
  assert.ok(csv.startsWith('\uFEFFsep=;'));
  assert.ok(days.every(day => csv.includes(day.date)));
  assert.ok(csv.includes('"Erledigt (gesamt)";"1"'));
  assert.ok(csv.includes("'=HYPERLINK"));
  assert.ok(csv.includes('"Keine Daten"'));
});
