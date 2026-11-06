/** Arc de cercle, l'angle 0 étant à 12 h et les angles croissant dans le sens horaire (radians). */
export function arcPath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  const point = (angle: number) =>
    `${cx + radius * Math.sin(angle)} ${cy - radius * Math.cos(angle)}`;
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${point(startAngle)} A ${radius} ${radius} 0 ${largeArc} 1 ${point(endAngle)}`;
}

/** Survol et focus clavier d'un élément SVG custom, reliés à `activeIndex`. */
export function focusableMark(
  index: number,
  setActiveIndex: (index: number | null) => void,
  label: string,
) {
  return {
    tabIndex: 0,
    role: "img",
    "aria-label": label,
    onMouseEnter: () => setActiveIndex(index),
    onMouseLeave: () => setActiveIndex(null),
    onFocus: () => setActiveIndex(index),
    onBlur: () => setActiveIndex(null),
  };
}
