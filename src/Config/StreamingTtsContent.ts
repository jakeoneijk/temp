import type { StreamingTtsExample } from '../Component/StreamingTtsSection'
import type { WaveformAudio } from '../Component/WaveformAudioPlayer'
import { citationFor, modelReferences } from './References'
import prompt01 from '../Source/audio/streaming_tts/01_prompt.wav'
import cosyvoice2Example01 from '../Source/audio/streaming_tts/01_cosyvoice2.wav'
import cosyvoice3Example01 from '../Source/audio/streaming_tts/01_cosyvoice3.wav'
import voxtream2Example01 from '../Source/audio/streaming_tts/01_voxtream2.wav'
import ours01 from '../Source/audio/streaming_tts/01_ours.wav'
import prompt02 from '../Source/audio/streaming_tts/02_prompt.wav'
import cosyvoice2Example02 from '../Source/audio/streaming_tts/02_cosyvoice2.wav'
import cosyvoice3Example02 from '../Source/audio/streaming_tts/02_cosyvoice3.wav'
import voxtream2Example02 from '../Source/audio/streaming_tts/02_voxtream2.wav'
import ours02 from '../Source/audio/streaming_tts/02_ours.wav'
import metadata from '../Source/audio/streaming_tts/metadata.json'

const citations: Partial<Record<string, ReturnType<typeof citationFor>>> = {
  cosyvoice2: citationFor(modelReferences.cosyvoice2),
  cosyvoice3: citationFor(modelReferences.cosyvoice3),
  voxtream2: citationFor(modelReferences.voxtream2),
}

function audio(
  id: string,
  label: string,
  src: string,
  details: Pick<WaveformAudio, 'duration' | 'channels' | 'peaks'>,
): WaveformAudio {
  const citation = citations[id]
  return { id, label, src, ...details, ...(citation ? { citation } : {}) }
}

// After changing source text or WAV files, run:
// python3 scripts/generate-streaming-tts-data.py
export const streamingTts = {
  id: 'streaming-tts',
  title: 'Streaming TTS',
  description: 'Input: Target text and an audio prompt.\nOutput: Speech generated in a streaming manner.',
  examples: [
    {
      id: 'streaming-01',
      title: 'Example 01',
      targetText: metadata['01'].targetText,
      prompt: audio('prompt', 'Audio prompt', prompt01, metadata['01'].audio.prompt),
      outputs: [
        audio('cosyvoice2', 'CosyVoice 2', cosyvoice2Example01, metadata['01'].audio.cosyvoice2),
        audio('cosyvoice3', 'CosyVoice 3', cosyvoice3Example01, metadata['01'].audio.cosyvoice3),
        audio('voxtream2', 'VoXtream2', voxtream2Example01, metadata['01'].audio.voxtream2),
        audio('ours', 'CSDLM (Ours)', ours01, metadata['01'].audio.ours),
      ],
    },
    {
      id: 'streaming-02',
      title: 'Example 02',
      targetText: metadata['02'].targetText,
      prompt: audio('prompt', 'Audio prompt', prompt02, metadata['02'].audio.prompt),
      outputs: [
        audio('cosyvoice2', 'CosyVoice 2', cosyvoice2Example02, metadata['02'].audio.cosyvoice2),
        audio('cosyvoice3', 'CosyVoice 3', cosyvoice3Example02, metadata['02'].audio.cosyvoice3),
        audio('voxtream2', 'VoXtream2', voxtream2Example02, metadata['02'].audio.voxtream2),
        audio('ours', 'CSDLM (Ours)', ours02, metadata['02'].audio.ours),
      ],
    },
  ] satisfies StreamingTtsExample[],
}
