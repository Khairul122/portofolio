// Pinned (sticky) layers report their *pinned* position, so scrollIntoView would
// misjudge them. Sum the heights of the layers above instead.
export function scrollToLayer(id, reduce) {
  const el = document.querySelector(`[data-layer="${id}"]`)
  if (!el) return
  let top = el.parentElement.offsetTop
  for (let s = el.previousElementSibling; s; s = s.previousElementSibling) top += s.offsetHeight
  window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })
}
