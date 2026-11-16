import type { ReactNode } from 'react'

export interface AdminColumn {
  key: string
  label: string
  /** `end` for numbers: right-aligned with tabular numerals. */
  align?: 'start' | 'end'
}

interface AdminTableProps {
  columns: AdminColumn[]
  rows: Record<string, ReactNode>[]
  /** Also names the scroll region. */
  caption: string
}

/**
 * A dense, readable data table for admin lists: 14px text, a sticky uppercase
 * header, tabular numerals right-aligned, and the first cell as the row header.
 * A wide table scrolls horizontally inside its rounded frame (a focusable
 * region), never the page. No illustrations and no motion beyond a hover tint.
 */
export function AdminTable({ columns, rows, caption }: AdminTableProps) {
  return (
    <div
      role="region"
      aria-label={caption}
      tabIndex={0}
      className="overflow-auto rounded-card border-2 border-line bg-elevated"
    >
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={`sticky top-0 border-b-2 border-line bg-surface px-4 py-2.5 text-[12px] font-extrabold uppercase tracking-wider text-ink-2 ${
                  c.align === 'end' ? 'text-right' : ''
                }`}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-line transition-colors duration-(--motion-duration-micro) last:border-b-0 hover:bg-surface"
            >
              {columns.map((c, ci) => {
                const cls = `px-4 py-2.5 ${c.align === 'end' ? 'tabular text-right' : ''}`
                return ci === 0 ? (
                  <th key={c.key} scope="row" className={`${cls} font-bold`}>
                    {row[c.key]}
                  </th>
                ) : (
                  <td key={c.key} className={cls}>
                    {row[c.key]}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
