import WaveformAudioPlayer, { type WaveformAudio } from './WaveformAudioPlayer'

export type ContextualTtsExample = {
  id: string
  title: string
  emotion: string
  targetText: string
  context: WaveformAudio
  outputs: readonly WaveformAudio[]
}

type SectionProps = {
  id: string
  title: string
  description: string
  examples: readonly ContextualTtsExample[]
}

export default function ContextualTtsSection({ id, title, description, examples }: SectionProps) {
  if (examples.length === 0) return null

  return (
    <section id={id} className='ctts-section' aria-labelledby={`${id}-heading`}>
      <style>{styles}</style>
      <header className='ctts-heading'>
        <h2 id={`${id}-heading`}>{title}</h2>
        <p>{description}</p>
      </header>
      <div className='ctts-examples'>
        {examples.map((example) => (
          <section key={example.id} className='ctts-example' aria-labelledby={`${id}-${example.id}-heading`}>
            <header className='ctts-example-heading'>
              <h3 id={`${id}-${example.id}-heading`}>{example.title}</h3>
            </header>
            <div className='ctts-comparison'>
              <div className='ctts-cell ctts-context'>
                <h4>Context conversation</h4>
                <div className='ctts-cell-body'>
                  <WaveformAudioPlayer audio={example.context} exampleTitle={`${title}, ${example.title}`} showChannels />
                </div>
              </div>
              <div className='ctts-cell ctts-text'>
                <h4>Target text</h4>
                <div className='ctts-cell-body'>
                  <p>{example.targetText}</p>
                </div>
              </div>
              <div className='ctts-cell ctts-emotion-cell'>
                <h4>Expected emotion</h4>
                <div className='ctts-cell-body'>
                  <strong className='ctts-emotion'>{example.emotion}</strong>
                </div>
              </div>
              {example.outputs.map((output) => (
                <div key={`${output.id}-${output.src}`} className={`ctts-cell ctts-output ctts-output-${output.id}`}>
                  <h4>
                    <span>{output.label}</span>
                    {output.citation && <a href={output.citation.href} target='_blank' rel='noopener noreferrer'>{output.citation.label}</a>}
                  </h4>
                  <div className='ctts-cell-body'>
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
.ctts-section { box-sizing: border-box; width: min(1120px, 100%); padding: 44px 28px 20px; color: #253246; font-family: 'Trebuchet MS', Arial, sans-serif; text-align: left; }
.ctts-section * { box-sizing: border-box; }
.ctts-section a:focus-visible { outline: 3px solid #5375bb; outline-offset: 3px; }
.ctts-heading h2 { margin: 0; font-size: clamp(25px, 3vw, 30px); font-weight: 600; letter-spacing: -.025em; line-height: 1.25; }
.ctts-heading p { margin: 12px 0 25px; max-width: 760px; color: #637082; font-size: 15px; line-height: 1.7; white-space: pre-line; }
.ctts-examples { display: grid; gap: 36px; }
.ctts-example { min-width: 0; padding-top: 24px; border-top: 1px solid #e4e8ee; }
.ctts-example-heading { margin: 0 0 20px; }
.ctts-example-heading h3 { margin: 0; font-size: 17px; font-weight: 600; line-height: 1.5; }
.ctts-comparison { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr) minmax(144px, .72fr) repeat(2, minmax(0, 1fr)); overflow: hidden; border: 1px solid #dfe5ed; border-radius: 12px; background: #fff; }
.ctts-cell { display: flex; flex-direction: column; min-width: 0; border-left: 1px solid #e5e9ef; }
.ctts-cell:first-child { border-left: 0; }
.ctts-cell > h4 { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; flex: 0 0 68px; min-height: 68px; margin: 0; padding: 10px 8px; border-bottom: 1px solid #e5e9ef; background: #f7f9fb; font-size: 13px; font-weight: 600; line-height: 1.5; text-align: center; }
.ctts-cell > h4 a { color: #667386; font-size: 10px; font-weight: 400; text-decoration: none; }
.ctts-cell > h4 a:hover { text-decoration: underline; text-underline-offset: 3px; }
.ctts-cell-body { display: flex; flex: 1; flex-direction: column; justify-content: center; padding: 24px 18px; }
.ctts-text p { margin: 0; color: #43516a; font-size: 13px; line-height: 1.75; white-space: pre-line; overflow-wrap: anywhere; }
.ctts-emotion-cell { background: #faf7fd; }
.ctts-emotion-cell > h4 { background: #eee7f7; color: #684a90; }
.ctts-emotion-cell .ctts-cell-body { align-items: center; padding: 24px 12px; }
.ctts-emotion { color: #684a90; font-size: 20px; font-weight: 600; line-height: 1.5; text-align: center; }
.ctts-output-ours { background: #fbfcfe; }
.ctts-output-ours > h4 { background: #edf2f8; color: #304969; }
.ctts-section .wap-time { font-size: 12px; }
@media (max-width: 900px) {
  .ctts-comparison { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ctts-emotion-cell { grid-column: 1 / -1; border-left: 0; border-top: 1px solid #e5e9ef; }
  .ctts-output { border-top: 1px solid #e5e9ef; }
  .ctts-emotion-cell + .ctts-output { border-left: 0; }
}
@media (max-width: 540px) {
  .ctts-section { padding: 32px 20px 12px; }
  .ctts-comparison { grid-template-columns: minmax(0, 1fr); }
  .ctts-cell { border-left: 0; }
  .ctts-cell:not(:first-child) { border-top: 1px solid #e5e9ef; }
  .ctts-cell > h4 { align-items: flex-start; padding: 10px 16px; text-align: left; }
  .ctts-cell-body { padding: 20px 16px; }
}
`
