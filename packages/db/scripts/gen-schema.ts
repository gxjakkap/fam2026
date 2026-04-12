#!/usr/bin/env tsx

/**
 * gen-schema.ts
 *
 * Scans the `src/schemas` directory for Drizzle table, relation, and enum definitions
 * and generates a barrel schema.ts file.
 *
 * Usage:
 *   bun run db:gen-schema  # scans ./src/schemas, outputs ./src/schema.ts
 */

import fs from "fs"
import path from "path"

// config

const schemasDir = path.resolve(process.argv[2] ?? "./src/schemas")
const outputFile = path.resolve(process.argv[3] ?? "./src/schema.ts")

const PATTERNS = {
  // export const foo = pgTable(...)  /  export const foo = mysqlTable(...)  etc.
  tables: /export\s+const\s+(\w+)\s*=\s*(?:pg|mysql|sqlite)?[Tt]able\s*\(/g,

  // export const fooRelations = relations(...)
  relations: /export\s+const\s+(\w+Relations)\s*=\s*relations\s*\(/g,

  // export const fooEnum = pgEnum(...)
  enums: /export\s+const\s+(\w+)\s*=\s*(?:pg|mysql|sqlite)?[Ee]num\s*\(/g,
}

interface FileExports {
  tables: string[]
  relations: string[]
  enums: string[]
}

function scanFile(filePath: string): FileExports {
  const src = fs.readFileSync(filePath, "utf-8")
  const result: FileExports = { tables: [], relations: [], enums: [] }

  for (const [key, pattern] of Object.entries(PATTERNS) as [keyof FileExports, RegExp][]) {
    const re = new RegExp(pattern.source, pattern.flags)
    let match: RegExpExecArray | null
    while ((match = re.exec(src)) !== null) {
      result[key].push(match[1])
    }
  }

  return result
}

function collectFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const full = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      // recurse into subdirs
      files.push(...collectFiles(full))
    } else if (
      entry.isFile() &&
      /\.(ts|tsx)$/.test(entry.name) &&
      !entry.name.startsWith("index") &&   // skip existing barrels
      !entry.name.endsWith(".test.ts") &&
      !entry.name.endsWith(".spec.ts")
    ) {
      files.push(full)
    }
  }

  return files.sort()
}

function toRelativeImport(from: string, to: string): string {
  let rel = path.relative(path.dirname(from), to)
    .replace(/\\/g, "/")       // windows
    .replace(/\.(tsx?)$/, "")  // strip extension

  if (!rel.startsWith(".")) rel = "./" + rel
  return rel
}

// main

if (!fs.existsSync(schemasDir)) {
  console.error(`Directory not found: ${schemasDir}`)
  process.exit(1)
}

const files = collectFiles(schemasDir)

if (files.length === 0) {
  console.error(`No .ts files found in ${schemasDir}`)
  process.exit(1)
}

interface FileEntry {
  importPath: string
  exports: FileExports
}

const entries: FileEntry[] = []

for (const file of files) {
  const exports = scanFile(file)
  const hasExports =
    exports.tables.length > 0 ||
    exports.relations.length > 0 ||
    exports.enums.length > 0

  if (hasExports) {
    entries.push({
      importPath: toRelativeImport(outputFile, file),
      exports,
    })
  }
}


const lines: string[] = [
  "/**",
  " * Auto-generated barrel file.",
  ` * Generated at ${new Date().toISOString()}`,
  " * Do not edit manually, re-run bun run db:gen-schema instead.",
  " */",
  "",
]

// group same type tgt
const enumEntries  = entries.filter(e => e.exports.enums.length > 0)
const tableEntries = entries.filter(e => e.exports.tables.length > 0)
const relEntries   = entries.filter(e => e.exports.relations.length > 0)

function renderSection(title: string, section: FileEntry[], key: keyof FileExports) {
  if (section.length === 0) return

  lines.push(`// ${title}`)
  for (const entry of section) {
    const names = entry.exports[key]
    lines.push(`export { ${names.join(", ")} } from "${entry.importPath}"`)
  }
  lines.push("")
}

renderSection("Enums",     enumEntries,  "enums")
renderSection("Tables",    tableEntries, "tables")
renderSection("Relations", relEntries,   "relations")

const output = lines.join("\n")

fs.writeFileSync(outputFile, output, "utf-8")

// sum

const totalTables    = entries.reduce((n, e) => n + e.exports.tables.length, 0)
const totalRelations = entries.reduce((n, e) => n + e.exports.relations.length, 0)
const totalEnums     = entries.reduce((n, e) => n + e.exports.enums.length, 0)

console.log(`\nSchema Barrel written to ${outputFile}`)
console.log(`   📦 ${totalTables} tables | 🔗 ${totalRelations} relations | 🏷️  ${totalEnums} enums`)
console.log(`   from ${entries.length} file(s)\n`)
