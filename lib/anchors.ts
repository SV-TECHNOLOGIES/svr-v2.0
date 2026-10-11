/**
 * DOM anchors for the lattice. Any element with `data-lattice-anchor="id"`
 * can host a lattice group; the scene reads its on-screen rectangle each frame
 * so the 3D layout always follows the responsive HTML layout.
 */

const cache = new Map<string, { el: Element | null; checked: number }>();

export function getAnchorRect(id: string, now: number): DOMRect | null {
  let entry = cache.get(id);
  if (!entry || (entry.el ? !entry.el.isConnected : now - entry.checked > 500)) {
    entry = { el: document.querySelector(`[data-lattice-anchor="${id}"]`), checked: now };
    cache.set(id, entry);
  }
  if (!entry.el) return null;
  const r = entry.el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return r;
}
