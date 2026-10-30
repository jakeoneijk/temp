import type { DialogueAudioTrack, DialogueExample } from '../Component/DialogueAudioSection'
import { citationFor, modelReferences } from './References'
import ours01Audio from '../Source/audio/dialogue_continuation/ours/01.wav'
import ours02Audio from '../Source/audio/dialogue_continuation/ours/02.wav'
import dgslm01Audio from '../Source/audio/dialogue_continuation/dgslm/01.wav'
import dgslm02Audio from '../Source/audio/dialogue_continuation/dgslm/02.wav'
import ours01 from '../Source/audio/dialogue_continuation/ours/01.json'
import ours02 from '../Source/audio/dialogue_continuation/ours/02.json'
import dgslm01 from '../Source/audio/dialogue_continuation/dgslm/01.json'
import dgslm02 from '../Source/audio/dialogue_continuation/dgslm/02.json'
import peaks from '../Source/audio/dialogue_continuation/peaks.json'

type ClipMetadata = {
  duration_sec: number
  prompt_end_sec: number
  segments: DialogueAudioTrack['segments']
}

const dgslmCitation = citationFor(modelReferences.dgslm)

const models = {
  ours: {
    label: 'CSDLM (Ours)',
    description: 'Continuous Spoken Dialogue Language Model',
  },
  dgslm: {
    label: 'dGSLM',
    description: dgslmCitation.label,
    descriptionHref: dgslmCitation.href,
  },
}

function track(
  model: keyof typeof models,
  clip: keyof typeof peaks,
  src: string,
  metadata: ClipMetadata,
): DialogueAudioTrack {
  return {
    id: model,
    ...models[model],
    src,
    duration: metadata.duration_sec,
    promptEnd: metadata.prompt_end_sec,
    peaks: peaks[clip],
    segments: metadata.segments,
  }
}

// Add matching WAV/JSON pairs, regenerate peaks, then register an example here.
export const dialogueContinuation = {
  id: 'dialogue-continuation',
  title: 'Dialogue Continuation',
  description: 'Input: A two-speaker, two-channel conversation.\nOutput: A continuation of the two-channel conversation.',
  examples: [
    {
      id: 'example-01',
      title: 'Example 01',
      description: 'Winning a car',
      tracks: [
        track('dgslm', 'dgslm/01', dgslm01Audio, dgslm01),
        track('ours', 'ours/01', ours01Audio, ours01),
      ],
    },
    {
      id: 'example-02',
      title: 'Example 02',
      description: 'Finding work on Craigslist',
      tracks: [
        track('dgslm', 'dgslm/02', dgslm02Audio, dgslm02),
        track('ours', 'ours/02', ours02Audio, ours02),
      ],
    },
  ] satisfies DialogueExample[],
}
