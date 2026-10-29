#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { newestNumberedFirst, newestRecordingsFirst } from '../../src/data/teachingOrder.ts';

// Unit checks: ordering, immutability, stable undated data, and verified dates.
const source = Object.freeze([{ number: 1 }, { number: 3 }, { number: 2 }]);
assert.deepEqual(newestNumberedFirst(source).map(x => x.number), [3, 2, 1]);
assert.deepEqual(source.map(x => x.number), [1, 3, 2]);
const videos = [
  { id: 'undated-a' },
  { id: 'older', publishedAt: '2026-10-19T12:00:00Z' },
  { id: 'undated-b', publishedAt: 'not-a-date' },
  { id: 'newer', publishedAt: '2026-10-26T12:00:00Z' },
];
assert.deepEqual(newestRecordingsFirst(videos).map(x => x.id), ['newer', 'older', 'undated-a', 'undated-b']);
assert.equal(videos[0].id, 'undated-a');

const main = readFileSync('dist/teaching/index.html', 'utf8');
const year = readFileSync('dist/teaching/2026-2027/index.html', 'utf8');
const intl = readFileSync('dist/teaching/international-engineering/index.html', 'utf8');
const archive = readFileSync('dist/teaching/linear-algebra/index.html', 'utf8');
const numbers = (html, pattern) => [...html.matchAll(pattern)].map(m => Number(m[1]));
const assertDescending = (values, label) => {
  assert.ok(values.length > 0, label + ': expected rendered tutorials');
  assert.deepEqual(values, [...values].sort((a, b) => b - a), label);
  console.log('PASS:', label, values.join(', '));
};
for (const [html, prefix, page] of [[main, 'archive-current-recordings', 'teaching'], [year, 'new-recordings', 'year']]) {
  for (const track of ['biomedical', 'electrical']) {
    assertDescending(numbers(html, new RegExp('id="' + prefix + '-' + track + '-tutorial-(\\d+)"', 'g')), page + ': ' + track);
  }
}
assertDescending(numbers(main, /id="tirgul(\d+)"/g), 'Calculus 2 practice sessions');
assertDescending(numbers(year, /id="tutorial-(\d+)"/g), 'Year-page tutorial PDFs');
assertDescending(numbers(intl, /id="download-tutorial-(\d+)"/g), 'International tutorial PDFs');
const intlFeatured = main.slice(main.indexOf('id="international-engineering-2026-2027"'), main.indexOf('id="academic-year-2026-2027"'));
const intlTutorials = intlFeatured.match(/<ol[^>]*data-tutorial-order="newest-first"[^>]*>([\s\S]*?)<\/ol>/)?.[1];
assert.ok(intlTutorials, 'Featured international tutorial list exists');
assertDescending(numbers(intlTutorials, /data-tutorial-number="(\d+)"/g), 'Featured international tutorial PDFs');
for (const [html, label] of [[intl, 'International page'], [intlFeatured, 'International feature']]) {
  assert.ok(html.indexOf('recitation-02-en.pdf') < html.indexOf('recitation-01-en.pdf'), label + ': earlier recitation 2 before 1');
  assert.ok(!/[\u0590-\u05ff]/u.test(html), label + ': English-only content');
  assert.ok(!html.includes('tutorial-01-he.pdf'), label + ': no Hebrew PDF link');
}
for (const [html, label] of [[main, 'teaching'], [year, 'year'], [intl, 'international'], [archive, 'archive']]) {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(ids.length, new Set(ids).size, label + ': no duplicate anchors');
}
assert.ok(main.includes('data-pdf-code='), 'Existing PDF download gate remains');
assert.ok(year.includes('tutorial-01-he.pdf'), 'Other courses remain bilingual');
console.log('PASS: ordering, unique anchors, PDF access and language regression checks');
