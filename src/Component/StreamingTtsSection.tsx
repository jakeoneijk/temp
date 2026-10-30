import WaveformAudioPlayer, { type WaveformAudio } from './WaveformAudioPlayer'

export type StreamingTtsExample = {
  id: string
  title: string
  targetText: string
  prompt: WaveformAudio
  outputs: readonly WaveformAudio[]
}

type SectionProps = {
  id: string
  title: string
  description: string
  examples: readonly StreamingTtsExample[]
}

export default function StreamingTtsSection({ id, title, description, examples }: SectionProps) {
  if (examples.length === 0) return null

  return (
    <section id={id} className='stts-section' aria-labelledby={`${id}-heading`}>
      <style>{styles}</style>
      <header className='stts-heading'>
        <h2 id={`${id}-heading`}>{title}</h2>
        <p>{description}</p>
      </header>
      <div className='stts-examples'>
        {examples.map((example) => (
          <section key={example.id} className='stts-example' aria-labelledby={`${id}-${example.id}-heading`}>
            <h3 id={`${id}-${example.id}-heading`}>{example.title}</h3>
            <div className='stts-comparison'>
              <div className='stts-cell stts-text'>
                <h4>Target text</h4>
                <div className='stts-cell-body'>
                  <p>{example.targetText}</p>
                </div>
              </div>
              <div className='stts-cell stts-prompt'>
                <h4>Audio prompt</h4>
                <div className='stts-cell-body'>
                  <WaveformAudioPlayer audio={example.prompt} exampleTitle={`${title}, ${example.title}`} showChannels />
                </div>
              </div>
              {example.outputs.map((output) => (
                <div key={`${output.id}-${output.src}`} className={`stts-cell stts-output stts-output-${output.id}`}>
                  <h4>
                    <span>{output.label}</span>
                    {output.citation && <a href={output.citation.href} target='_blank' rel='noopener noreferrer'>{output.citation.label}</a>}
                  </h4>
                  <div className='stts-cell-body'>
                    <WaveformAudioPlayer audio={output} exampleTitle={`${title}, ${example.title}`} showChannels />
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
.stts-section { box-sizing: border-box; width: min(1120px, 100%); padding: 44px 28px 20px; color: #253246; font-family: 'Trebuchet MS', Arial, sans-serif; text-align: left; }
.stts-section * { box-sizing: border-box; }
.stts-section a:focus-visible { outline: 3px solid #5375bb; outline-offset: 3px; }
.stts-heading h2 { margin: 0; font-size: clamp(25px, 3vw, 30px); font-weight: 600; letter-spacing: -.025em; line-height: 1.25; }
.stts-heading p { margin: 12px 0 25px; max-width: 760px; color: #637082; font-size: 15px; line-height: 1.7; white-space: pre-line; }
.stts-examples { display: grid; gap: 36px; }
.stts-example { min-width: 0; padding-top: 24px; border-top: 1px solid #e4e8ee; }
.stts-example > h3 { margin: 0 0 20px; font-size: 17px; font-weight: 600; line-height: 1.5; }
.stts-comparison { display: grid; grid-template-columns: minmax(200px, 1.5fr) repeat(5, minmax(0, 1fr)); overflow: hidden; border: 1px solid #dfe5ed; border-radius: 12px; background: #fff; }
.stts-cell { display: flex; flex-direction: column; min-width: 0; border-left: 1px solid #e5e9ef; }
.stts-cell:first-child { border-left: 0; }
.stts-cell > h4 { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; flex: 0 0 68px; min-height: 68px; margin: 0; padding: 10px 8px; border-bottom: 1px solid #e5e9ef; background: #f7f9fb; font-size: 13px; font-weight: 600; line-height: 1.5; text-align: center; }
.stts-cell > h4 a { color: #667386; font-size: 10px; font-weight: 400; text-decoration: none; }
.stts-cell > h4 a:hover { text-decoration: underline; text-underline-offset: 3px; }
.stts-cell-body { display: flex; flex: 1; flex-direction: column; justify-content: center; padding: 24px 12px; }
.stts-text .stts-cell-body { padding: 24px 18px; }
.stts-text p { margin: 0; color: #43516a; font-size: 13px; line-height: 1.75; white-space: pre-line; overflow-wrap: anywhere; }
.stts-output-ours { background: #fbfcfe; }
.stts-output-ours > h4 { background: #edf2f8; color: #304969; }
@media (max-width: 1000px) {
  .stts-comparison { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .stts-output { border-top: 1px solid #e5e9ef; }
  .stts-output:nth-child(odd) { border-left: 0; }
  .stts-cell-body { padding: 20px; }
  .stts-section .wap-time { font-size: 12px; }
}
@media (max-width: 540px) {
  .stts-section { padding: 32px 20px 12px; }
  .stts-comparison { grid-template-columns: minmax(0, 1fr); }
  .stts-cell { border-left: 0; }
  .stts-cell:not(:first-child) { border-top: 1px solid #e5e9ef; }
  .stts-cell > h4 { align-items: flex-start; padding: 10px 16px; text-align: left; }
  .stts-cell-body, .stts-text .stts-cell-body { padding: 20px 16px; }
}
`
