import { createRef } from 'react'
import About from './components/About/About'
import Capabilities from './components/Capabilities/Capabilities'
import Contact from './components/Contact/Contact'
import Footer from './components/Footer/Footer'
import Hero from './components/Hero/Hero'
import Layer from './components/Shared/Layer'
import SectionNav from './components/Shared/SectionNav'

function ContactLayer() {
  return (
    <>
      <Contact />
      <Footer />
    </>
  )
}

// Each section is a stacked layer; a layer reacts to the scroll progress of the one after it.
const LAYERS = [
  { id: 'hero', Section: Hero, ref: createRef() },
  { id: 'about', Section: About, ref: createRef() },
  { id: 'capabilities', Section: Capabilities, ref: createRef() },
  { id: 'contact', Section: ContactLayer, ref: createRef() },
]

function App() {
  return (
    <>
      <SectionNav />
      <main>
        {LAYERS.map(({ id, Section, ref }, i) => (
          <Layer key={id} id={id} order={i + 1} ref={ref} nextRef={LAYERS[i + 1]?.ref}>
            <Section />
          </Layer>
        ))}
      </main>
    </>
  )
}

export default App
