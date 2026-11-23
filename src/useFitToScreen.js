import { useLayoutEffect, useRef } from 'react'

// Scales the whole homepage down evenly so it always fits the browser window with no
// scrolling, keeping the Figma proportions exactly. It never scales up past 100%.
// Phones (narrower than 900px) keep the normal scrolling single-column layout.
const MIN_FIT_WIDTH = 900
const DESIGN_WIDTH = 1250 // 1154px of content plus a little side margin

export default function useFitToScreen(deps = []) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current
    const root = document.documentElement
    const fit = () => {
      if (window.innerWidth < MIN_FIT_WIDTH) {
        el.style.zoom = ''
        root.classList.remove('fit-screen')
        return
      }
      root.classList.add('fit-screen')
      el.style.zoom = '1'
      const natural = el.offsetHeight
      const scale = Math.min(1, window.innerHeight / natural, window.innerWidth / DESIGN_WIDTH)
      el.style.zoom = String(Math.floor(scale * 1000) / 1000)
    }
    fit()
    document.fonts?.ready.then(fit)
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, deps) // refit when the page's content changes (e.g. presentation mode)
  return ref
}
