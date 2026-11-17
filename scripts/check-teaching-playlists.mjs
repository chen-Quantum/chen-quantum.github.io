import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const home = readFileSync("dist/teaching/index.html","utf8");
const archive = readFileSync("dist/teaching/playlists/index.html","utf8");
for (const id of [
  "current-linear-algebra","hedva-biomedical-2026","hedva-mechanical-2026",
  "hedva-electrical-2026","linear-electrical-2025","linear-biomedical-2025",
  "hedva-extra","span-of-consciousness","linear-eigen",
]) {
  assert(home.includes(`data-teaching-playlist="${id}"`), "Missing landing playlist " + id);
  assert(archive.includes(`data-playlist-archive="${id}"`), "Missing full archive playlist " + id);
}
for (const id of ["rKNRT8A5ymY","jGjGSJFibiM"]) {
  for (const [name,html] of [["home",home],["archive",archive]]) {
    const token = `data-video-practice="${id}"`;
    const pos = html.indexOf(token);
    assert(pos >= 0, "No matching PDF control beside " + id + " on " + name);
    const chunk = html.slice(pos,pos+2800);
    assert(chunk.includes("tutorial-05-he.pdf"),"No Hebrew tutorial 5 PDF for " + id + " on " + name);
    assert(chunk.includes("tutorial-05-en.pdf"),"No English tutorial 5 PDF for " + id + " on " + name);
  }
}
for (const id of ["NphKNUJHaSk","Pu7IxrS5UGw","w9lViXVaYZE","9rdJdh6c0XM"]) {
  assert(archive.includes(`youtube-nocookie.com/embed/${id}`),"Missing archive recording " + id);
}
assert(archive.includes("PLm0oTNdEqyakPZNxPchsnGy7R7BnkP2ML"),"Missing electrical playlist link");
assert(archive.includes("PLm0oTNdEqyaml_II1IKiInf06g2LTBeyt"),"Missing biomedical playlist link");
console.log("PASS: course playlist catalogue, 2025-26 archives and linked PDF controls for tutorial 5");
