import WaveformAudioPlayer, { type WaveformAudio } from './WaveformAudioPlayer'

export type GenerationAudio = WaveformAudio

export type DialogueGenerationExample = {
  id: string
  title: string
  script: readonly { speaker: string; text: string; overlap?: boolean; interjection?: boolean }[]
  prompts: readonly GenerationAudio[]
  outputs: readonly GenerationAudio[]
}

type SectionProps = {
  id: string
  title: string
  description: string
  examples: readonly DialogueGenerationExample[]
}

// Script, reference voices, and model outputs share one reusable section module.
export default function DialogueGenerationSection({ id, title, description, examples }: SectionProps) {
  if (examples.length === 0) return null

  return (
    <section id={id} className='dgen-section' aria-labelledby={`${id}-heading`}>
      <style>{styles}</style>
      <header className='dgen-heading'>
        <h2 id={`${id}-heading`}>{title}</h2>
        <p>{description}</p>
      </header>
      <div className='dgen-examples'>
        {examples.map((example) => (
          <section className='dgen-example' key={example.id} aria-labelledby={`${id}-${example.id}-heading`}>
            <h3 id={`${id}-${example.id}-heading`}>{example.title}</h3>
            <div className='dgen-comparison'>
              <div className='dgen-cell dgen-script-cell'>
                <h4>Script</h4>
                <div className='dgen-script' role='region' aria-label={`${example.title} dialogue script`} tabIndex={0}>
                  <ol>
                    {example.script.map((turn, index) => (
                      <li key={index} className={`dgen-turn dgen-speaker-${turn.speaker.toLowerCase()}`}>
                        <span className='dgen-speaker' aria-label={`Speaker ${turn.speaker}`}>{turn.speaker}</span>
                        <div>
                          {turn.overlap && <span className='dgen-mark dgen-overlap' title='Starts before the previous speaker finishes.'>Overlap</span>}
                          {turn.interjection && <span className='dgen-mark dgen-interjection' title='A brief interjection while the other speaker continues.'>Interjection</span>}
                          <p>{turn.text}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
              <div className='dgen-cell dgen-prompt-cell'>
                <h4>Audio prompt</h4>
                <div className='dgen-cell-body dgen-prompts'>
                  {example.prompts.map((prompt) => (
                    <div key={`${prompt.id}-${prompt.src}`} className={`dgen-prompt dgen-${prompt.id}`}>
                      <h5>{prompt.label}</h5>
                      <WaveformAudioPlayer audio={prompt} exampleTitle={example.title} />
                    </div>
                  ))}
                </div>
              </div>
              {example.outputs.map((output) => (
                <div key={`${output.id}-${output.src}`} className={`dgen-cell dgen-output dgen-output-${output.id}`}>
                  <h4>
                    <span>{output.label}</span>
                    {output.citation && <a href={output.citation.href} target='_blank' rel='noopener noreferrer'>{output.citation.label}</a>}
                  </h4>
                  <div className='dgen-cell-body'>
                    <WaveformAudioPlayer audio={output} exampleTitle={example.title} showChannels />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}

const styles = `
.dgen-section { box-sizing: border-box; width: min(1120px, 100%); padding: 44px 28px 20px; color: #253246; font-family: 'Trebuchet MS', Arial, sans-serif; text-align: left; }
.dgen-section * { box-sizing: border-box; }
.dgen-section button { font: inherit; cursor: pointer; }
.dgen-section :is(button, input, a, [tabindex]):focus-visible { outline: 3px solid #5375bb; outline-offset: 3px; }
.dgen-heading h2 { margin: 0; font-size: clamp(25px, 3vw, 30px); font-weight: 600; letter-spacing: -.025em; line-height: 1.25; }
.dgen-heading p { margin: 12px 0 25px; max-width: 760px; color: #637082; font-size: 15px; line-height: 1.7; white-space: pre-line; }
.dgen-examples { display: grid; gap: 36px; }
.dgen-example { min-width: 0; padding-top: 24px; border-top: 1px solid #e4e8ee; }
.dgen-example > h3 { margin: 0 0 20px; font-size: 17px; font-weight: 600; line-height: 1.5; }
.dgen-comparison { display: grid; grid-template-columns: minmax(240px, 2.2fr) repeat(5, minmax(0, 1fr)); overflow: hidden; border: 1px solid #dfe5ed; border-radius: 12px; background: #fff; }
.dgen-cell { display: flex; flex-direction: column; min-width: 0; border-left: 1px solid #e5e9ef; }
.dgen-cell:first-child { border-left: 0; }
.dgen-cell > h4 { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; flex: 0 0 68px; min-height: 68px; margin: 0; padding: 10px 8px; border-bottom: 1px solid #e5e9ef; background: #f7f9fb; font-size: 13px; font-weight: 600; line-height: 1.5; text-align: center; }
.dgen-cell > h4 a { color: #667386; font-size: 10px; font-weight: 400; text-decoration: none; }
.dgen-cell > h4 a:hover { text-decoration: underline; text-underline-offset: 3px; }
.dgen-cell-body { display: flex; flex: 1; flex-direction: column; justify-content: center; gap: 26px; padding: 24px 12px; }
.dgen-script { max-height: 400px; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; padding: 18px 16px; }
.dgen-script ol { display: grid; gap: 15px; margin: 0; padding: 0; list-style: none; }
.dgen-turn { display: grid; grid-template-columns: 21px minmax(0, 1fr); align-items: start; gap: 8px; }
.dgen-speaker { display: flex; align-items: center; justify-content: center; width: 21px; height: 21px; border-radius: 50%; background: #edf3fa; color: #3975b9; font-size: 10px; font-weight: 600; }
.dgen-speaker-b .dgen-speaker { background: #fbf0eb; color: #ad6049; }
.dgen-turn p { margin: 0; color: #43516a; font-size: 12px; line-height: 1.7; overflow-wrap: anywhere; }
.dgen-mark { display: inline-block; margin: 0 0 5px; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 600; line-height: 1.5; }
.dgen-overlap { background: #f2ecfa; color: #7856a4; }
.dgen-interjection { background: #eaf5f2; color: #34756a; }
.dgen-prompt h5 { margin: 0 0 10px; color: #3975b9; font-size: 11px; font-weight: 600; }
.dgen-speaker-b h5 { color: #ad6049; }
.dgen-output-ours { background: #fbfcfe; }
.dgen-output-ours > h4 { background: #edf2f8; color: #304969; }
@media (max-width: 1000px) {
  .dgen-comparison { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .dgen-script-cell, .dgen-prompt-cell { grid-column: 1 / -1; border-left: 0; }
  .dgen-script { max-height: 300px; }
  .dgen-cell:not(:first-child) { border-top: 1px solid #e5e9ef; }
  .dgen-output:nth-child(odd) { border-left: 0; }
  .dgen-prompts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
  .dgen-cell-body { padding: 20px; }
  .dgen-section .wap-time { font-size: 12px; }
}
@media (max-width: 540px) {
  .dgen-section { padding: 32px 20px 12px; }
  .dgen-comparison { grid-template-columns: minmax(0, 1fr); }
  .dgen-cell { border-left: 0; }
  .dgen-cell > h4 { align-items: flex-start; padding: 10px 16px; text-align: left; }
  .dgen-prompts { gap: 18px; padding: 20px 16px; }
  .dgen-section .wap-time { font-size: 10px; }
}
`
