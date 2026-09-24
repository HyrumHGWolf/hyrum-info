import fs from "fs";

const src = fs.readFileSync("lib/content.ts", "utf8");

function unescape(raw) {
  return raw
    .replace(/\\n/g, "\n")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

const bodies = {};

// STARS array only — stop before SECRET_NODE
const starsChunk = src.slice(
  src.indexOf("export const STARS"),
  src.indexOf("export const SECRET_NODE")
);
const starRe = /\bid:\s*"([^"]+)"[\s\S]*?\bbody:\s*"((?:\\.|[^"\\])*)"/g;
let m;
while ((m = starRe.exec(starsChunk))) {
  bodies[m[1]] = unescape(m[2]);
}

// SECRET_STAR (moroni)
const secretChunk = src.slice(src.indexOf("export const SECRET_STAR"));
const sm = /\bid:\s*"([^"]+)"[\s\S]*?\bbody:\s*"((?:\\.|[^"\\])*)"/.exec(
  secretChunk
);
if (sm) bodies[sm[1]] = unescape(sm[2]);

const out = `/** Story panel bodies — dynamically imported so the first JS chunk stays light. */
export const BODIES: Record<string, string> = ${JSON.stringify(bodies, null, 2)};
`;
fs.writeFileSync("lib/storyBodies.ts", out);

// Strip body fields from content.ts (keep a short placeholder comment)
let next = src.replace(/\n\s*body:\s*"(?:\\.|[^"\\])*",/g, "\n    // body loaded from lib/storyBodies.ts\n");
fs.writeFileSync("lib/content.ts", next);
console.log("bodies:", Object.keys(bodies).sort().join(", "));
