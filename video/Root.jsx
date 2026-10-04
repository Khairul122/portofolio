import { Composition } from 'remotion'
import { DURATION, FPS } from './data.js'
import { GithubRecap } from './Recap.jsx'

// One component, two formats: 16:9 for the site and YouTube, 9:16 for Reels and Stories.
export const Root = () => (
  <>
    <Composition id="recap-landscape" component={GithubRecap} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
    <Composition id="recap-portrait" component={GithubRecap} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
  </>
)
