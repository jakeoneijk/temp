import type { DialogueGenerationExample, GenerationAudio } from '../Component/DialogueGenerationSection'
import { citationFor, modelReferences } from './References'
import prompt01A from '../Source/audio/dialogue_generation/01_prompt_speakerA.wav'
import prompt01B from '../Source/audio/dialogue_generation/01_prompt_speakerB.wav'
import mooncast01 from '../Source/audio/dialogue_generation/01_mooncast.wav'
import vibevoice01 from '../Source/audio/dialogue_generation/01_vibevoice.wav'
import zipvoice01 from '../Source/audio/dialogue_generation/01_zipvoice_dialog_stereo.wav'
import ours01 from '../Source/audio/dialogue_generation/01_ours.wav'
import prompt02A from '../Source/audio/dialogue_generation/02_prompt_speakerA.wav'
import prompt02B from '../Source/audio/dialogue_generation/02_prompt_speakerB.wav'
import mooncast02 from '../Source/audio/dialogue_generation/02_mooncast.wav'
import vibevoice02 from '../Source/audio/dialogue_generation/02_vibevoice.wav'
import zipvoice02 from '../Source/audio/dialogue_generation/02_zipvoice_dialog_stereo.wav'
import ours02 from '../Source/audio/dialogue_generation/02_ours.wav'
import metadata from '../Source/audio/dialogue_generation/metadata.json'

const citations: Partial<Record<string, ReturnType<typeof citationFor>>> = {
  mooncast: citationFor(modelReferences.mooncast),
  vibevoice: citationFor(modelReferences.vibevoice),
  zipvoice: citationFor(modelReferences.zipvoice),
}

function audio(
  id: string,
  label: string,
  src: string,
  details: Pick<GenerationAudio, 'duration' | 'channels' | 'peaks'>,
): GenerationAudio {
  const citation = citations[id]
  return { id, label, src, ...details, ...(citation ? { citation } : {}) }
}

// After changing source YAML or WAV files, run:
// python3 scripts/generate-dialogue-generation-data.py
export const dialogueGeneration = {
  id: 'dialogue-generation',
  title: 'Dialogue Generation',
  description: 'Input: A dialogue script and audio prompts for two speakers.\nOutput: A spoken dialogue following the script.',
  examples: [
    {
      id: 'generation-01',
      title: 'Example 01',
      script: metadata['01'].script,
      prompts: [
        audio('speaker-a', 'Speaker A', prompt01A, metadata['01'].audio.prompt_speakerA),
        audio('speaker-b', 'Speaker B', prompt01B, metadata['01'].audio.prompt_speakerB),
      ],
      outputs: [
        audio('mooncast', 'MoonCast', mooncast01, metadata['01'].audio.mooncast),
        audio('vibevoice', 'VibeVoice', vibevoice01, metadata['01'].audio.vibevoice),
        audio('zipvoice', 'ZipVoice', zipvoice01, metadata['01'].audio.zipvoice_dialog_stereo),
        audio('ours', 'CSDLM (Ours)', ours01, metadata['01'].audio.ours),
      ],
    },
    {
      id: 'generation-02',
      title: 'Example 02',
      script: metadata['02'].script,
      prompts: [
        audio('speaker-a', 'Speaker A', prompt02A, metadata['02'].audio.prompt_speakerA),
        audio('speaker-b', 'Speaker B', prompt02B, metadata['02'].audio.prompt_speakerB),
      ],
      outputs: [
        audio('mooncast', 'MoonCast', mooncast02, metadata['02'].audio.mooncast),
        audio('vibevoice', 'VibeVoice', vibevoice02, metadata['02'].audio.vibevoice),
        audio('zipvoice', 'ZipVoice', zipvoice02, metadata['02'].audio.zipvoice_dialog_stereo),
        audio('ours', 'CSDLM (Ours)', ours02, metadata['02'].audio.ours),
      ],
    },
  ] satisfies DialogueGenerationExample[],
}
