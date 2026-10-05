// Pure geometry helpers shared by the React marks and the Node brand-kit build.

export const fmt = (n: number) => Math.round(n * 100) / 100

/** Four-point spark with concave sides. `t` is fatness: 0 = needle-thin arms, 0.5 = chunky. */
export function sparkPath(cx: number, cy: number, rv: number, rh = rv, t = 0.2) {
  const a = fmt(t * rv)
  const b = fmt(t * rh)
  return [
    `M${cx} ${cy - rv}`,
    `C${cx} ${cy - a} ${cx + b} ${cy} ${cx + rh} ${cy}`,
    `C${cx + b} ${cy} ${cx} ${cy + a} ${cx} ${cy + rv}`,
    `C${cx} ${cy + a} ${cx - b} ${cy} ${cx - rh} ${cy}`,
    `C${cx - b} ${cy} ${cx} ${cy - a} ${cx} ${cy - rv}Z`,
  ].join('')
}
