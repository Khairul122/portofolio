import { createRef } from 'react'
import { GithubProvider } from './data/GithubProvider'
import About from './components/About/About'
import Capabilities from './components/Capabilities/Capabilities'
import Contact from './components/Contact/Contact'
import Footer from './components/Footer/Footer'
import IntroVideo from './components/IntroVideo/IntroVideo'
import Hero from './components/Hero/Hero'
import Heatmap from './components/Journey/Heatmap'
import Journey from './components/Journey/Journey'
import Projects from './components/Projects/Projects'
import Answers from './components/Answers/Answers'
import TechStack from './components/TechStack/TechStack'
import Layer from './components/Shared/Layer'
import SectionNav from './components/Shared/SectionNav'

function JourneyLayer() {
  return (
    <>
      <Journey />
      <Heatmap />
    </>
  )
}

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
  { id: 'projects', Section: Projects, ref: createRef() },
  { id: 'stack', Section: TechStack, ref: createRef() },
  { id: 'journey', Section: JourneyLayer, ref: createRef() },
  { id: 'answers', Section: Answers, ref: createRef() },
  { id: 'intro', Section: IntroVideo, ref: createRef() },
  { id: 'contact', Section: ContactLayer, ref: createRef() },
]

function App() {
  return (
    <GithubProvider>
      <SectionNav />
      <main>
        {LAYERS.map(({ id, Section, ref }, i) => (
          <Layer key={id} id={id} order={i + 1} ref={ref} nextRef={LAYERS[i + 1]?.ref}>
            <Section />
          </Layer>
        ))}
      </main>
    </GithubProvider>
  )
}

export default App
