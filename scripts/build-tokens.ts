/**
 * Regenerates src/styles/tokens.css from design-system/tokens/tokens.json, so
 * tokens.json stays the single source of truth for the S1P design tokens.
 *
 *   npm run tokens          write src/styles/tokens.css
 *   npm run tokens:check    fail if the committed file is out of date (CI)
 *
 * Output format matches design-system/tokens/tokens.css, except that the
 * @font-face URLs point at the fonts shipped under src/assets/fonts/.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

interface Token {
  name: string
  value: string | Record<string, string>
}
interface TypeStyle {
  name: string
  fontSize: string
  lineHeight: string
  fontWeight: number
  letterSpacing?: string
}
interface TokenFile {
  color: { themes: { id: string }[]; tokens: Token[] }
  type: {
    fonts: { family: string; file: string; weight: string; style: string }[]
    families: Record<string, string>
    groups: { styles: TypeStyle[] }[]
  }
  shadow: { tokens: Token[] }
  [section: string]: unknown
}

const root = resolve(import.meta.dirname, '..')
const source = resolve(root, 'design-system/tokens/tokens.json')
const target = resolve(root, 'src/styles/tokens.css')

/** Relative to src/styles/tokens.css. */
const FONT_DIR = '../assets/fonts'

const FLAT_SECTIONS = [
  'spacing',
  'radius',
  'border',
  'stroke',
  'duration',
  'easing',
  'stagger',
  'travel',
  'layout',
  'breakpoint',
  'zIndex',
] as const

const json = JSON.parse(readFileSync(source, 'utf8')) as TokenFile

/** `{palette-crust-900}` references become `var(--palette-crust-900)`. */
function resolveValue(value: string): string {
  return value.replace(/\{([\w-]+)\}/g, 'var(--$1)')
}

function themed(token: Token, theme: string): string {
  const value = typeof token.value === 'string' ? token.value : token.value[theme]
  return resolveValue(value)
}

function themeBlock(selector: string, theme: string): string {
  const colors = json.color.tokens.map((t) => `  --${t.name}: ${themed(t, theme)};`)
  const shadows = json.shadow.tokens.map((t) => `  --${t.name}: ${themed(t, theme)};`)
  return `${selector} {\n${[...colors, ...shadows].join('\n')}\n}`
}

function flatBlock(): string {
  const lines: string[] = []
  for (const section of FLAT_SECTIONS) {
    const tokens = (json[section] as { tokens: Token[] }).tokens
    for (const t of tokens)
      lines.push(`  --${t.name}: ${resolveValue(t.value as string)};`)
  }
  const { display, text, mono } = json.type.families
  lines.push(`  --font-display: ${display};`)
  lines.push(`  --font-text: ${text};`)
  lines.push(`  --font-mono: ${mono};`)
  return `:root {\n${lines.join('\n')}\n}`
}

function typeClasses(): string {
  return json.type.groups
    .flatMap((g) => g.styles)
    .map((s) => {
      const family =
        s.name === 'code'
          ? 'mono'
          : /^(display|heading|figure)/.test(s.name)
            ? 'display'
            : 'text'
      const spacing = s.letterSpacing ? ` letter-spacing: ${s.letterSpacing};` : ''
      return `.${s.name} { font-family: var(--font-${family}); font-size: ${s.fontSize}; line-height: ${s.lineHeight}; font-weight: ${s.fontWeight};${spacing} }`
    })
    .join('\n\n')
}

function fontFaces(): string {
  return json.type.fonts
    .map((f) => {
      const file = f.file.split('/').pop()
      return `@font-face { font-family: "${f.family}"; src: url("${FONT_DIR}/${file}") format("woff2"); font-weight: ${f.weight}; font-style: ${f.style}; font-display: swap; }`
    })
    .join('\n\n')
}

const output =
  [
    '/* S1P — generated from design-system/tokens/tokens.json by scripts/build-tokens.ts. Do not edit by hand; change tokens.json and run `npm run tokens`. */',
    themeBlock(':root, [data-theme="light"]', 'light'),
    themeBlock('[data-theme="dark"]', 'dark'),
    flatBlock(),
    typeClasses(),
    fontFaces(),
  ].join('\n\n') + '\n'

if (process.argv.includes('--check')) {
  let current = ''
  try {
    current = readFileSync(target, 'utf8')
  } catch {
    // missing file counts as out of date
  }
  if (current.replace(/\r\n/g, '\n') !== output) {
    console.error('src/styles/tokens.css is out of date. Run `npm run tokens`.')
    process.exit(1)
  }
  console.log('tokens.css is up to date.')
} else {
  writeFileSync(target, output)
  console.log(`Wrote ${target}`)
}
