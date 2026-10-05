import '@fontsource-variable/inter'
import { useEffect, useState } from 'react'
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'
import { SCENES, recap } from './data.js'

const RED = '#e8342a'
const INK = '#15181d'
const FONT = "'Inter Variable', system-ui, sans-serif"
const cut = (n) => `polygon(0 0, calc(100% - ${n}px) 0, 100% ${n}px, 100% 100%, ${n}px 100%, 0 calc(100% - ${n}px))`
const ease = Easing.bezier(0.16, 1, 0.3, 1)
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }

// Progress 0..1 of `frames` after `delay`, on the current Sequence clock.
const useIn = (delay = 0, frames = 24) => {
  const f = useCurrentFrame()
  return interpolate(f - delay, [0, frames], [0, 1], { ...clamp, easing: ease })
}

const usePop = (delay = 0, damping = 11) => {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  return spring({ frame: f - delay, fps, config: { damping, stiffness: 160 } })
}

const Label = ({ children, u, delay = 0, color = RED }) => {
  const p = useIn(delay)
  return (
    <div style={{ color, fontSize: 28 * u, fontWeight: 800, letterSpacing: 8 * u, opacity: p, transform: `translateY(${(1 - p) * 24 * u}px)` }}>
      {children}
    </div>
  )
}

// Each letter springs up on its own, so a name feels typeset rather than faded in.
const Letters = ({ text, size, u, delay = 0, color = '#fff' }) => (
  <div style={{ display: 'flex', overflow: 'hidden', paddingBottom: 10 * u }}>
    {[...text].map((ch, i) => (
      <Letter key={i} ch={ch} size={size} u={u} delay={delay + i * 2.5} color={color} />
    ))}
  </div>
)

const Letter = ({ ch, size, u, delay, color }) => {
  const p = usePop(delay, 14)
  return (
    <span
      style={{
        display: 'inline-block',
        whiteSpace: 'pre',
        color,
        fontSize: size * u,
        fontWeight: 900,
        lineHeight: 1,
        letterSpacing: -2 * u,
        transform: `translateY(${(1 - p) * 115}%) rotate(${(1 - p) * 8}deg)`,
      }}
    >
      {ch}
    </span>
  )
}

const Chip = ({ children, u, delay, color = '#fff', fill = 'transparent' }) => {
  const p = usePop(delay, 10)
  return (
    <span
      style={{
        display: 'inline-block',
        color,
        background: fill,
        border: `${3 * u}px solid ${color}`,
        borderRadius: 999,
        padding: `${8 * u}px ${24 * u}px`,
        fontSize: 28 * u,
        fontWeight: 800,
        letterSpacing: 3 * u,
        transform: `scale(${p})`,
        opacity: Math.min(1, p * 2),
      }}
    >
      {children}
    </span>
  )
}

const DECOR = [
  { src: 'sphere-wire-large-halo', x: 0.9, y: 0.12, s: 190, spin: 0.5, ph: 0 },
  { src: 'star-sparkle-halo', x: 0.08, y: 0.88, s: 150, spin: -0.8, ph: 2 },
  { src: 'sphere-wire-moons-halo', x: 0.62, y: 0.93, s: 210, spin: 0.3, ph: 4 },
  { src: 'star-sparkle-halo', x: 0.93, y: 0.55, s: 110, spin: 1, ph: 1 },
]

const Backdrop = ({ u }) => {
  const f = useCurrentFrame()
  const { width, height } = useVideoConfig()
  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)',
          backgroundSize: `${90 * u}px ${90 * u}px`,
          backgroundPosition: `${f * 0.5}px ${f * 0.5}px`,
        }}
      />
      <AbsoluteFill style={{ background: `radial-gradient(60% 50% at 85% 95%, ${RED}55, transparent 70%)` }} />
      {DECOR.map((d, i) => (
        <Img
          key={i}
          src={staticFile(`images/decor/${d.src}.png`)}
          style={{
            position: 'absolute',
            width: d.s * u,
            left: d.x * width - (d.s * u) / 2 + Math.sin(f / 38 + d.ph) * 26 * u,
            top: d.y * height - (d.s * u) / 2 + Math.cos(f / 46 + d.ph) * 30 * u,
            opacity: 0.5,
            transform: `rotate(${f * d.spin}deg)`,
          }}
        />
      ))}
    </AbsoluteFill>
  )
}

// Red slanted panel that sweeps across the frame; the scene swaps while it covers everything.
const Wipe = () => {
  const f = useCurrentFrame()
  const sweep = (lag) => interpolate(f - lag, [0, 22], [-135, 135], { ...clamp, easing: Easing.inOut(Easing.cubic) })
  const panel = (lag, color) => (
    <AbsoluteFill style={{ background: color, transform: `translateX(${sweep(lag)}%) skewX(-14deg)`, width: '120%', left: '-10%' }} />
  )
  return (
    <AbsoluteFill>
      {panel(0, '#fff')}
      {panel(3, RED)}
    </AbsoluteFill>
  )
}

const Photo = ({ w, u, delay = 0 }) => {
  const p = useIn(delay, 32)
  const h = (w * 4) / 3
  const off = 18 * u
  return (
    <div style={{ position: 'relative', width: w * u, height: h * u, flexShrink: 0 }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: RED,
          clipPath: cut(40 * u),
          transform: `translate(${off * p}px, ${off * p}px)`,
        }}
      />
      <div style={{ position: 'absolute', inset: 0, clipPath: cut(40 * u), background: '#fff' }}>
        <div style={{ position: 'absolute', inset: 0, clipPath: `inset(${(1 - p) * 100}% 0 0 0)` }}>
          <Img src={staticFile('images/profile.webp')} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.25 - p * 0.25})` }} />
        </div>
      </div>
    </div>
  )
}

const Hello = ({ u, portrait }) => {
  const f = useCurrentFrame()
  const roles = ['WEB', 'ANDROID', 'SAAS']
  const text = roles.join('  /  ')
  const shown = Math.floor(interpolate(f, [52, 90], [0, text.length], clamp))
  return (
    <AbsoluteFill
      style={{
        padding: (portrait ? 90 : 140) * u,
        flexDirection: portrait ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: portrait ? 'center' : 'space-between',
        gap: 60 * u,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 * u, alignSelf: portrait ? 'flex-start' : 'center', order: portrait ? 2 : 1 }}>
        <div style={{ width: `${useIn(0, 26) * 180 * u}px`, height: 8 * u, background: RED }} />
        <Label u={u} delay={8}>HI, I AM</Label>
        <div>
          {recap.name.map((n, i) => (
            <Letters key={n} text={n} size={portrait ? 172 : 176} u={u} delay={14 + i * 8} />
          ))}
        </div>
        <div style={{ color: '#fff', fontSize: 40 * u, fontWeight: 800, letterSpacing: 6 * u, minHeight: 50 * u }}>
          {text.slice(0, shown)}
          <span style={{ color: RED, opacity: Math.floor(f / 8) % 2 }}>|</span>
        </div>
        <Label u={u} delay={80}>A DEVELOPER ON GITHUB SINCE {recap.since}</Label>
      </div>
      <div style={{ order: portrait ? 1 : 2 }}>
        <Photo w={portrait ? 520 : 560} u={u} delay={10} />
      </div>
    </AbsoluteFill>
  )
}

// 203 cells, one per public repo, in a 29 x 7 grid. Colour = role, in order.
const CELLS = (() => {
  const out = []
  recap.roles.slice(0, 2).forEach((r) => out.push(...Array(r.value).fill(r.color)))
  out.push(...Array(recap.other).fill('#9aa0aa'))
  return out
})()

const Counter = ({ u, delay, value, label, color = '#fff' }) => {
  const f = useCurrentFrame()
  const p = useIn(delay, 24)
  const n = Math.round(interpolate(f - delay, [0, 50], [0, value], { ...clamp, easing: ease }))
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * 40 * u}px)` }}>
      <div style={{ color, fontSize: 150 * u, fontWeight: 900, lineHeight: 1, letterSpacing: -4 * u }}>{n}</div>
      <div style={{ color: RED, fontSize: 28 * u, fontWeight: 800, letterSpacing: 6 * u, marginTop: 8 * u }}>{label}</div>
    </div>
  )
}

const LegendItem = ({ name, color, u, delay }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 * u, opacity: useIn(delay), color: '#fff', fontSize: 28 * u, fontWeight: 700, letterSpacing: 3 * u }}>
    <span style={{ width: 24 * u, height: 24 * u, background: color, borderRadius: 4 * u }} />
    {name}
  </div>
)

const Github = ({ u, portrait }) => {
  const f = useCurrentFrame()
  const pad = (portrait ? 90 : 140) * u
  const { width } = useVideoConfig()
  const gap = 5 * u
  const cell = (width - pad * 2 - gap * 28) / 29
  const handle = recap.handle
  const typed = Math.floor(interpolate(f, [4, 40], [0, handle.length], clamp))
  return (
    <AbsoluteFill style={{ padding: pad, justifyContent: 'center', gap: 44 * u }}>
      <Label u={u}>MY GITHUB</Label>
      <div style={{ color: '#fff', fontSize: (portrait ? 70 : 96) * u, fontWeight: 900, letterSpacing: -1 * u }}>
        {handle.slice(0, typed)}
        <span style={{ color: RED, opacity: Math.floor(f / 8) % 2 }}>|</span>
      </div>
      <div style={{ display: 'flex', gap: (portrait ? 50 : 100) * u }}>
        <Counter u={u} delay={20} value={recap.repos} label="PUBLIC REPOS" />
        <Counter u={u} delay={28} value={recap.forks} label="FORKS" />
        <Counter u={u} delay={36} value={recap.languages} label="LANGUAGES" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(29, ${cell}px)`, gridTemplateRows: `repeat(7, ${cell}px)`, gridAutoFlow: 'column', gap }}>
        {CELLS.map((color, i) => {
          const t = interpolate(f - 40 - i * 0.35, [0, 10], [0, 1], clamp)
          return <div key={i} style={{ background: color, borderRadius: 3 * u, transform: `scale(${t})`, opacity: t }} />
        })}
      </div>
      <div style={{ display: 'flex', gap: 36 * u, flexWrap: 'wrap' }}>
        {[...recap.roles.slice(0, 2).map((r) => [r.title[0], r.color]), ['OTHER', '#9aa0aa']].map(([name, color], i) => (
          <LegendItem key={name} name={name} color={color} u={u} delay={110 + i * 6} />
        ))}
      </div>
    </AbsoluteFill>
  )
}

const Role = ({ u, portrait, index }) => {
  const r = recap.roles[index]
  const f = useCurrentFrame()
  const bg = interpolate(f, [0, 16], [-100, 0], { ...clamp, easing: ease })
  const pad = (portrait ? 90 : 140) * u
  const card = useIn(22, 26)
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: r.color, transform: `translateX(${bg}%)` }} />
      <AbsoluteFill
        style={{ padding: pad, justifyContent: 'center', gap: 40 * u, flexDirection: portrait ? 'column' : 'row', alignItems: portrait ? 'flex-start' : 'center' }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              color: 'transparent',
              WebkitTextStroke: `${3 * u}px rgba(255,255,255,.7)`,
              fontSize: 120 * u,
              fontWeight: 900,
              lineHeight: 1,
              opacity: useIn(8),
            }}
          >
            0{index + 1}
          </div>
          {r.title.map((t, i) => (
            <Letters key={t} text={t} size={portrait ? 140 : 160} u={u} delay={10 + i * 6} />
          ))}
          <div style={{ marginTop: 28 * u, display: 'flex', gap: 14 * u, flexWrap: 'wrap' }}>
            {r.tags.map((t, i) => (
              <Chip key={t} u={u} delay={34 + i * 5}>
                {t}
              </Chip>
            ))}
          </div>
        </div>
        <div
          style={{
            flex: portrait ? 'none' : 0.8,
            width: portrait ? '100%' : undefined,
            background: '#fff',
            clipPath: cut(36 * u),
            padding: 50 * u,
            opacity: card,
            transform: `translateX(${(1 - card) * 120 * u}px)`,
          }}
        >
          <div style={{ color: r.color, fontSize: 28 * u, fontWeight: 800, letterSpacing: 6 * u }}>{r.value} REPOS</div>
          <div style={{ color: INK, fontSize: 40 * u, fontWeight: 800, lineHeight: 1.25, marginTop: 14 * u }}>{r.desc}</div>
          <div style={{ color: '#6b7280', fontSize: 30 * u, fontWeight: 500, lineHeight: 1.4, marginTop: 20 * u }}>{r.examples}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

const Years = ({ u, portrait }) => {
  const f = useCurrentFrame()
  const max = Math.max(...recap.years.map((y) => y.value))
  const chartH = (portrait ? 700 : 420) * u
  return (
    <AbsoluteFill style={{ padding: (portrait ? 90 : 140) * u, justifyContent: 'center', gap: 34 * u }}>
      <Label u={u}>HOW IT GREW</Label>
      <Letters text="2024 WAS THE PEAK" size={portrait ? 74 : 104} u={u} delay={4} />
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 26 * u, height: chartH }}>
        {recap.years.map((y, i) => {
          const grow = interpolate(f - 12 - i * 6, [0, 36], [0, 1], { ...clamp, easing: ease })
          const top = y.value === max
          return (
            <div key={y.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
              <div style={{ color: '#fff', fontSize: 44 * u, fontWeight: 800, marginBottom: 12 * u, opacity: grow }}>{Math.round(y.value * grow)}</div>
              <div style={{ height: Math.max(8 * u, (y.value / max) * (chartH - 130 * u) * grow), background: top ? RED : 'rgba(255,255,255,.88)', clipPath: cut(18 * u) }} />
              <div style={{ color: top ? RED : '#9aa0aa', fontSize: 30 * u, fontWeight: 700, marginTop: 14 * u, letterSpacing: 2 * u }}>{y.label}</div>
            </div>
          )
        })}
      </div>
      <Label u={u} delay={70} color="#fff">ALSO EXPLORING IN PYTHON</Label>
      <div style={{ display: 'flex', gap: 14 * u, flexWrap: 'wrap' }}>
        {recap.exploring.map((t, i) => (
          <Chip key={t} u={u} delay={80 + i * 6} color={RED}>
            {t}
          </Chip>
        ))}
      </div>
    </AbsoluteFill>
  )
}

const LinkRow = ({ item, u, delay }) => {
  const p = useIn(delay, 24)
  return (
    <div
      style={{
        background: '#fff',
        clipPath: cut(26 * u),
        padding: `${26 * u}px ${40 * u}px`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 30 * u,
        opacity: p,
        transform: `translateX(${(1 - p) * -160 * u}px)`,
      }}
    >
      <span style={{ color: RED, fontSize: 28 * u, fontWeight: 800, letterSpacing: 6 * u }}>{item.label}</span>
      <span style={{ color: INK, fontSize: 44 * u, fontWeight: 900 }}>{item.text}</span>
    </div>
  )
}

const Outro = ({ u, portrait }) => (
  <AbsoluteFill
    style={{
      padding: (portrait ? 90 : 140) * u,
      justifyContent: 'center',
      alignItems: portrait ? 'flex-start' : 'center',
      flexDirection: portrait ? 'column' : 'row',
      gap: 70 * u,
    }}
  >
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 26 * u, width: '100%' }}>
      <Label u={u}>LET US BUILD SOMETHING</Label>
      <Letters text="SAY HELLO" size={portrait ? 150 : 170} u={u} delay={4} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 * u, marginTop: 20 * u }}>
        {recap.links.map((l, i) => (
          <LinkRow key={l.label} item={l} u={u} delay={22 + i * 9} />
        ))}
      </div>
    </div>
    {!portrait && <Photo w={400} u={u} delay={14} />}
  </AbsoluteFill>
)

const wipeAt = (frame) => (
  <Sequence key={frame} from={frame - 12} durationInFrames={26}>
    <Wipe />
  </Sequence>
)

export const GithubRecap = () => {
  const { width, height } = useVideoConfig()
  const portrait = height > width
  const u = Math.min(width, height) / 1080
  const [handle] = useState(() => delayRender('Loading Inter'))

  useEffect(() => {
    document.fonts.load("900 40px 'Inter Variable'").finally(() => continueRender(handle))
  }, [handle])

  const parts = [
    [SCENES.hello, (p) => <Hello {...p} />],
    [SCENES.github, (p) => <Github {...p} />],
    ...recap.roles.map((_, index) => [SCENES.role, (p) => <Role {...p} index={index} />]),
    [SCENES.years, (p) => <Years {...p} />],
    [SCENES.outro, (p) => <Outro {...p} />],
  ]

  let at = 0
  const scenes = []
  const wipes = []
  parts.forEach(([length, render], i) => {
    if (i > 0) wipes.push(wipeAt(at))
    scenes.push(
      <Sequence key={i} from={at} durationInFrames={length}>
        {render({ u, portrait })}
      </Sequence>,
    )
    at += length
  })

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Backdrop u={u} />
      {scenes}
      {wipes}
    </AbsoluteFill>
  )
}
