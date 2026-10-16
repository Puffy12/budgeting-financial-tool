import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const LIMIT = 200
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.mjs'])
const SKIP_DIRS = new Set(['node_modules', 'dist', 'data', '.git', 'legacy'])

const offenders = []

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(full)
      continue
    }
    if (entry.name === 'package-lock.json') continue
    if (!EXTENSIONS.has(path.extname(entry.name))) continue
    const text = fs.readFileSync(full, 'utf8')
    const lines = text.endsWith('\n') ? text.split('\n').length - 1 : text.split('\n').length
    if (lines > LIMIT) offenders.push({ file: path.relative(ROOT, full), lines })
  }
}

walk(ROOT)
offenders.sort((a, b) => b.lines - a.lines)

if (offenders.length) {
  console.error(`Hand-written files over ${LIMIT} lines:`)
  for (const item of offenders) console.error(`  ${item.lines}\t${item.file}`)
  process.exit(1)
}

console.log(`All hand-written ts/tsx/js/mjs files are within ${LIMIT} lines.`)
