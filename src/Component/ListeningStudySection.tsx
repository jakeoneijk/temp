import { useEffect, useState } from 'react'
import { listeningStudy } from '../Config/ListeningStudyContent'
import WaveformAudioPlayer from './WaveformAudioPlayer'

const scoreColumns = [
  { key: 'dgslm', label: 'dGSLM' },
  { key: 'groundTruth', label: 'Ground truth' },
  { key: 'csdlm', label: 'CSDLM (Ours)' },
] as const

type TranscriptTurn = { speaker: string; text: string }

function Transcript({ turns, label }: { turns: readonly TranscriptTurn[]; label: string }) {
  return (
    <div className='ls-transcript' role='region' aria-label={label} tabIndex={0}>
      <ol>
        {turns.map((turn, index) => (
          <li key={index} className={`ls-turn ls-speaker-${turn.speaker.toLowerCase()}`}>
            <span className='ls-speaker' aria-label={`Speaker ${turn.speaker}`}>{turn.speaker}</span>
            <p>{turn.text}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function ListeningStudySection() {
  const [expanded, setExpanded] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const example = listeningStudy.examples[selectedIndex]

  useEffect(() => {
    // Include legacy native controls elsewhere on the page in playback exclusivity.
    const pauseOtherMedia = (event: Event) => {
      if (!(event.target instanceof HTMLMediaElement)) return
      const active = event.target
      document.querySelectorAll<HTMLMediaElement>('audio, video').forEach((media) => {
        if (media !== active && !media.paused) media.pause()
      })
    }
    document.addEventListener('play', pauseOtherMedia, true)
    return () => document.removeEventListener('play', pauseOtherMedia, true)
  }, [])

  if (!example) return null
  const continuations = [...example.continuations].sort((a, b) =>
    scoreColumns.findIndex(column => column.key === a.model) - scoreColumns.findIndex(column => column.key === b.model),
  )

  return (
    <section id='listening-study' className='ls-section' aria-labelledby='listening-study-heading'>
      <style>{styles}</style>
      <details className='ls-disclosure' onToggle={(event) => {
        if (event.target !== event.currentTarget) return
        if (!event.currentTarget.open) {
          event.currentTarget.querySelectorAll<HTMLMediaElement>('audio, video').forEach(media => media.pause())
        }
        setExpanded(event.currentTarget.open)
      }}>
        <summary className='ls-disclosure-heading'>
          <h3 id='listening-study-heading'>Listening study samples</h3>
        </summary>
        {expanded && <div className='ls-content'>
          <header className='ls-heading'>
            <p>
              {listeningStudy.participantCount} listeners rated blinded, randomized samples on six criteria
              using a 1–5 scale. Each sample contains a 15-second conversation prompt followed by a
              15-second continuation.
            </p>
          </header>

          <div className='ls-results'>
            <h4>Overall ratings</h4>
            <p id='listening-study-results-note' className='ls-note'>
              Mean ± 95% confidence interval from {listeningStudy.participantCount} participant means,
              each averaged over the {listeningStudy.conversationCount} conversations.
            </p>
            <div className='ls-table-scroll' role='region' aria-label='Overall listening-study scores' tabIndex={0}>
              <table aria-describedby='listening-study-results-note'>
                <caption className='ls-sr-only'>Overall listening-study ratings on six criteria, on a 1–5 scale</caption>
                <thead>
                  <tr>
                    <th scope='col'>Criterion</th>
                    {scoreColumns.map((column) => (
                      <th scope='col' key={column.key} className={`ls-score-${column.key}`}>{column.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {listeningStudy.results.map((criterion) => (
                    <tr key={criterion.id}>
                      <th scope='row'>{criterion.label}</th>
                      {scoreColumns.map((column) => (
                        <td key={column.key} className={`ls-score-${column.key}`}>
                          {criterion[column.key].mean.toFixed(2)} <span>± {criterion[column.key].ci.toFixed(2)}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <details className='ls-criteria'>
              <summary>Evaluation criteria</summary>
              <dl>
                {listeningStudy.results.map((criterion) => (
                  <div key={criterion.id}>
                    <dt>{criterion.label}</dt>
                    <dd>{criterion.description}</dd>
                  </div>
                ))}
              </dl>
            </details>
          </div>

          <div className='ls-examples-heading'>
            <h4>Listening examples</h4>
            <p className='ls-note'>
              All {listeningStudy.conversationCount} study conversations are included below.
              Select an example to compare its continuations.
            </p>
          </div>
          <div className='ls-example-nav' role='group' aria-label='Select a listening-study example'>
            {listeningStudy.examples.map((item, index) => (
              <button key={item.id} type='button' aria-pressed={index === selectedIndex}
                aria-controls='listening-study-selected-example'
                aria-label={`Show ${item.title}${item.topic ? `: ${item.topic}` : ''}`}
                onClick={() => setSelectedIndex(index)}>
                {String(index + 1).padStart(2, '0')}
              </button>
            ))}
          </div>
          <p className='ls-sr-only' role='status'>Showing {example.title}{example.topic ? `: ${example.topic}` : ''}</p>

          <section key={example.id} id='listening-study-selected-example' className='ls-example'
            aria-labelledby='listening-study-example-heading'>
            <header className='ls-example-heading'>
              <h4 id='listening-study-example-heading'>{example.title}</h4>
              {example.topic && <p>{example.topic}</p>}
            </header>

            <article className='ls-prompt' aria-labelledby='listening-study-prompt-heading'>
              <div className='ls-prompt-audio'>
                <h5 id='listening-study-prompt-heading'>Shared prompt <span>15 seconds</span></h5>
                <WaveformAudioPlayer key={example.prompt.src} audio={example.prompt}
                  exampleTitle={`Listening study, ${example.title}`} showChannels />
              </div>
              <div className='ls-prompt-text'>
                <h6>Prompt transcript</h6>
                <Transcript turns={example.promptTranscript} label={`${example.title}, prompt transcript`} />
              </div>
            </article>

            <p className='ls-playback-note'>
              Each player below includes the shared prompt (0:00–0:15) and its continuation (0:15–0:30).
              Choose “Play continuation” to start at 0:15. Transcripts show the continuation text.
            </p>
            <div className='ls-comparison'>
              {continuations.map((continuation) => (
                <article key={continuation.model} className={`ls-model ls-model-${continuation.model}`}
                  aria-labelledby={`listening-study-${continuation.model}-heading`}>
                  <h5 id={`listening-study-${continuation.model}-heading`}>{continuation.label}</h5>
                  <div className='ls-model-body'>
                    <WaveformAudioPlayer key={continuation.audio.src} audio={continuation.audio}
                      exampleTitle={`Listening study, ${example.title}`} showChannels />
                    <h6>Continuation transcript</h6>
                    <Transcript turns={continuation.transcript}
                      label={`${example.title}, ${continuation.label}, continuation transcript`} />
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>}
      </details>
    </section>
  )
}

const styles = `
.ls-section { box-sizing: border-box; width: 100%; margin-top: 32px; padding-top: 8px; border-top: 1px solid #e4e8ee; color: #253246; font-family: 'Trebuchet MS', Arial, sans-serif; text-align: left; }
.ls-section * { box-sizing: border-box; }
.ls-section :is(button, a, summary, [tabindex]):focus-visible { outline: 3px solid #5375bb; outline-offset: 3px; }
.ls-disclosure-heading { display: flex; align-items: center; gap: 10px; min-height: 52px; padding: 12px 0; list-style: none; cursor: pointer; color: #304969; }
.ls-disclosure-heading::-webkit-details-marker { display: none; }
.ls-disclosure-heading::before { content: ''; width: 7px; height: 7px; flex-shrink: 0; border-right: 2px solid currentColor; border-bottom: 2px solid currentColor; transform: rotate(-45deg); transition: transform .15s ease; }
.ls-disclosure[open] > .ls-disclosure-heading::before { transform: rotate(45deg); }
.ls-disclosure-heading h3 { margin: 0; font-size: 18px; font-weight: 600; line-height: 1.5; }
.ls-disclosure-heading:hover { color: #5375bb; }
.ls-heading > p { max-width: 850px; margin: 8px 0 25px; color: #637082; font-size: 14px; line-height: 1.7; }
.ls-section h4 { margin: 0; font-size: 16px; font-weight: 600; line-height: 1.5; }
.ls-note { margin: 8px 0 16px; color: #637082; font-size: 12px; line-height: 1.7; }
.ls-table-scroll { max-width: 100%; overflow-x: auto; border: 1px solid #dfe5ed; border-radius: 10px; scrollbar-width: thin; }
.ls-section table { width: 100%; border-collapse: collapse; font-size: 13px; line-height: 1.5; }
.ls-section th, .ls-section td { padding: 13px 16px; border-bottom: 1px solid #e5e9ef; }
.ls-section thead th { background: #f7f9fb; font-weight: 600; text-align: center; }
.ls-section thead th:first-child, .ls-section tbody th { text-align: left; }
.ls-section tbody th { min-width: 170px; font-weight: 400; }
.ls-section td { white-space: nowrap; text-align: center; font-variant-numeric: tabular-nums; }
.ls-section td span { color: #667386; }
.ls-section tbody tr:last-child > * { border-bottom: 0; }
.ls-section .ls-score-csdlm { background: #f4f7fb; }
.ls-section thead .ls-score-csdlm { background: #edf2f8; color: #304969; }
.ls-criteria { margin-top: 12px; border-bottom: 1px solid #e5e9ef; padding-bottom: 10px; }
.ls-criteria summary { display: list-item; width: fit-content; min-height: 44px; padding: 12px 0; cursor: pointer; color: #415a79; font-size: 12px; font-weight: 600; }
.ls-criteria dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 24px; margin: 4px 0 15px; }
.ls-criteria dt { margin: 0 0 4px; font-size: 12px; font-weight: 600; }
.ls-criteria dd { margin: 0; color: #637082; font-size: 12px; line-height: 1.7; }
.ls-examples-heading { margin-top: 28px; }
.ls-example-nav { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 22px; }
.ls-example-nav button { min-width: 44px; min-height: 44px; padding: 8px 12px; border: 1px solid #dce3ed; border-radius: 7px; background: #fff; color: #52657f; font: inherit; font-size: 13px; cursor: pointer; }
.ls-example-nav button:hover { background: #f0f4f9; }
.ls-example-nav button[aria-pressed='true'] { border-color: #304969; background: #304969; color: #fff; }
.ls-example { min-width: 0; }
.ls-example-heading { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 12px; margin-bottom: 16px; }
.ls-example-heading p { margin: 0; color: #637082; font-size: 13px; line-height: 1.6; }
.ls-prompt { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr); overflow: hidden; border: 1px solid #dfe5ed; border-radius: 12px; background: #f9fbfd; }
.ls-prompt-audio { min-width: 0; padding: 20px; }
.ls-prompt h5 { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px; margin: 0 0 16px; font-size: 14px; font-weight: 600; }
.ls-prompt h5 span { color: #758092; font-size: 11px; font-weight: 400; }
.ls-prompt-text { min-width: 0; padding: 20px; border-left: 1px solid #e5e9ef; background: #fff; }
.ls-section h6 { margin: 0 0 13px; color: #637082; font-size: 11px; font-weight: 600; line-height: 1.5; }
.ls-transcript { max-height: 240px; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; }
.ls-transcript ol { display: grid; gap: 12px; margin: 0; padding: 0 6px 2px 0; list-style: none; }
.ls-turn { display: grid; grid-template-columns: 22px minmax(0, 1fr); align-items: start; gap: 8px; }
.ls-speaker { display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: #edf3fa; color: #3975b9; font-size: 10px; font-weight: 600; }
.ls-speaker-b .ls-speaker { background: #fbf0eb; color: #ad6049; }
.ls-turn p { margin: 0; color: #43516a; font-size: 12px; line-height: 1.75; overflow-wrap: anywhere; white-space: pre-wrap; }
.ls-playback-note { max-width: 900px; margin: 18px 0 14px; color: #637082; font-size: 12px; line-height: 1.7; }
.ls-comparison { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; align-items: stretch; }
.ls-model { min-width: 0; overflow: hidden; border: 1px solid #dfe5ed; border-radius: 12px; background: #fff; }
.ls-model > h5 { margin: 0; padding: 14px 18px; border-bottom: 1px solid #e5e9ef; background: #f7f9fb; font-size: 14px; font-weight: 600; line-height: 1.5; }
.ls-model-csdlm > h5 { background: #edf2f8; color: #304969; }
.ls-model-body { padding: 18px; }
.ls-model-body > h6 { margin-top: 22px; }
.ls-section .wap-play { flex-basis: 44px; width: 44px; height: 44px; }
.ls-section .wap-time { font-size: 12px; }
.ls-section .wap-transport { flex-wrap: wrap; }
.ls-section .wap-transport button { min-height: 44px; }
.ls-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 900px) {
  .ls-comparison { grid-template-columns: minmax(0, 1fr); }
  .ls-model-body { padding: 20px; }
  .ls-transcript { max-height: 220px; }
}
@media (max-width: 640px) {
  .ls-prompt { grid-template-columns: minmax(0, 1fr); }
  .ls-prompt-text { border-left: 0; border-top: 1px solid #e5e9ef; }
  .ls-criteria dl { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 540px) {
  .ls-section { margin-top: 24px; }
  .ls-heading > p { font-size: 14px; }
  .ls-section th, .ls-section td { padding: 12px; font-size: 12px; }
  .ls-section tbody th { min-width: 142px; }
  .ls-prompt-audio, .ls-prompt-text, .ls-model-body { padding: 18px 14px; }
  .ls-model > h5 { padding: 12px 14px; }
}
`
