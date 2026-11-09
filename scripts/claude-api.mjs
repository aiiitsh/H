#!/usr/bin/env node
// Claude Code's own access to Ahmed OS data (see supabase/migrations/007_claude_api.sql). No sign-in needed.
//   node scripts/claude-api.mjs export [days] [--out file.json]   all data for the last N days (default 35)
//   node scripts/claude-api.mjs settings '{"key": value}'        set settings keys (merged into the rest)
//   node scripts/claude-api.mjs mentor                           print your private mentor rules (see 008_mentor_notes.sql)
//   node scripts/claude-api.mjs mentor-set file.md               save/replace the mentor rules from a local file
// Reads .claude-api.json next to package.json (gitignored): { "url": "...", "anon": "sb_publishable_...", "key": "..." }
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const cfg = JSON.parse(readFileSync(join(root, '.claude-api.json'), 'utf8'))

async function rpc(fn, body) {
  const res = await fetch(`${cfg.url}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: cfg.anon, Authorization: `Bearer ${cfg.anon}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_key: cfg.key, ...body }),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${fn}: ${res.status} ${text}`)
  return JSON.parse(text)
}

const [cmd, arg, ...rest] = process.argv.slice(2)
if (cmd === 'export') {
  const data = await rpc('claude_export', { p_days: Number(arg) || 35 })
  const out = rest[0] === '--out' ? rest[1] : arg === '--out' ? rest[0] : null
  const json = JSON.stringify(data, null, 2)
  if (out) { writeFileSync(out, json); console.log(`saved ${out}`) } else console.log(json)
} else if (cmd === 'settings') {
  const settings = await rpc('claude_patch_settings', { p_patch: JSON.parse(arg) })
  console.log(`saved: ${Object.keys(JSON.parse(arg)).join(', ')} (settings now has ${Object.keys(settings).length} keys)`)
} else if (cmd === 'mentor') {
  const text = await rpc('claude_get_mentor', {})
  console.log(text ?? '(no mentor rules saved yet: run mentor-set <file>)')
} else if (cmd === 'mentor-set') {
  if (!arg) { console.log('usage: mentor-set <file.md>'); process.exit(1) }
  const r = await rpc('claude_set_mentor', { p_content: readFileSync(arg, 'utf8') })
  console.log(`saved mentor rules (${r.saved_chars} characters)`)
} else {
  console.log('usage: node scripts/claude-api.mjs export [days] [--out file.json] | settings \'{"key": value}\' | mentor | mentor-set <file>')
  process.exit(1)
}
