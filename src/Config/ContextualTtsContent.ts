import type { ContextualTtsExample } from '../Component/ContextualTtsSection'
import type { WaveformAudio } from '../Component/WaveformAudioPlayer'
import { citationFor, modelReferences } from './References'
import context01 from '../Source/audio/contextual_tts/01_context.wav'
import vibevoice01 from '../Source/audio/contextual_tts/01_vibevoice.wav'
import ours01 from '../Source/audio/contextual_tts/01_ours.wav'
import context02 from '../Source/audio/contextual_tts/02_context.wav'
import vibevoice02 from '../Source/audio/contextual_tts/02_vibevoice.wav'
import ours02 from '../Source/audio/contextual_tts/02_ours.wav'
import metadata from '../Source/audio/contextual_tts/metadata.json'

function audio(
  id: string,
  label: string,
  src: string,
  details: Pick<WaveformAudio, 'duration' | 'channels' | 'peaks'>,
): WaveformAudio {
  return {
    id, label, src, ...details,
    ...(id === 'vibevoice' ? { citation: citationFor(modelReferences.vibevoice) } : {}),
  }
}

// After changing source text or WAV files, run:
// python3 scripts/generate-contextual-tts-data.py
export const contextualTts = {
  id: 'contextual-tts',
  title: 'Contextual TTS',
  description: 'Input: A spoken conversation and target text.\nOutput: Speech with an emotion appropriate to the context.',
  examples: [
    {
      id: 'contextual-01',
      title: 'Example 01',
      emotion: 'Amusement',
      targetText: metadata['01'].targetText,
      context: audio('context', 'Context conversation', context01, metadata['01'].audio.context),
      outputs: [
        audio('vibevoice', 'VibeVoice', vibevoice01, metadata['01'].audio.vibevoice),
        audio('ours', 'CSDLM (Ours)', ours01, metadata['01'].audio.ours),
      ],
    },
    {
      id: 'contextual-02',
      title: 'Example 02',
      emotion: 'Angry',
      targetText: metadata['02'].targetText,
      context: audio('context', 'Context conversation', context02, metadata['02'].audio.context),
      outputs: [
        audio('vibevoice', 'VibeVoice', vibevoice02, metadata['02'].audio.vibevoice),
        audio('ours', 'CSDLM (Ours)', ours02, metadata['02'].audio.ours),
      ],
    },
  ] satisfies ContextualTtsExample[],
}
