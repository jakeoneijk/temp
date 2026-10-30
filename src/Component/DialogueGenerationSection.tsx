import { useEffect, useRef, useState } from 'react'
import { DialogueWaveform } from './DialogueAudioSection'

export type GenerationAudio = {
  id: string
  label: string
  src: string
  duration: number
  channels: number
  peaks: readonly (readonly number[])[]
  citation?: { label: string; href: string }
}

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

const clamp = (time: number, duration: number) => Math.min(duration, Math.max(0, time))
const formatTime = (time: number) => `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}`

// Native media playback keeps the module portable to static and anonymous hosts.
function GenerationWaveformPlayer({ audio, exampleTitle, showChannels = false }: {
  audio: GenerationAudio
  exampleTitle: string
  showChannels?: boolean
}) {
  const mediaRef = useRef<HTMLAudioElement>(null)
  const pendingSeek = useRef<number | null>(null)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(audio.duration)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const label = `${exampleTitle}, ${audio.label}`
  const durationLabel = formatTime(Math.ceil(duration))
  const elapsedLabel = time >= duration ? durationLabel : formatTime(time)

  useEffect(() => {
    const media = mediaRef.current
    const pauseForOtherMedia = (event: Event) => {
      if (event.target instanceof HTMLMediaElement && event.target !== media) media?.pause()
    }
    document.addEventListener('play', pauseForOtherMedia, true)
    return () => {
      document.removeEventListener('play', pauseForOtherMedia, true)
      media?.pause()
    }
  }, [])

  useEffect(() => {
    if (!playing) return
    let frame = 0
    const update = () => {
      if (mediaRef.current) setTime(mediaRef.current.currentTime)
      frame = requestAnimationFrame(update)
    }
    frame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frame)
  }, [playing])

  function seek(seconds: number) {
    const media = mediaRef.current
    if (!media) return
    const next = clamp(seconds, duration)
    pendingSeek.current = media.readyState === 0 ? next : null
    media.currentTime = next
    setTime(next)
  }

  async function togglePlayback() {
    const media = mediaRef.current
    if (!media) return
    if (!media.paused) {
      media.pause()
      return
    }
    setError('')
    setLoading(true)
    try {
      if (media.error) media.load()
      if (media.ended || media.currentTime >= duration) seek(0)
      await media.play()
    } catch (cause) {
      if (!(cause instanceof DOMException && cause.name === 'AbortError')) {
        setError('Audio could not be played. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='dgen-audio' role='group' aria-label={label}>
      <DialogueWaveform peaks={audio.peaks} time={time} duration={duration} label={label} compact reserveStereoHeight={showChannels}
        channels={audio.channels === 1
          ? [{ label: 'Mono', color: audio.id === 'speaker-b' ? '#cc7860' : audio.id === 'speaker-a' ? '#3975b9' : '#647994' }]
          : [{ label: 'Left', color: '#3975b9' }, { label: 'Right', color: '#cc7860' }]}
        onSeek={seek} onToggle={() => void togglePlayback()} />
      <div className='dgen-transport'>
        <button type='button' className='dgen-play' onClick={() => void togglePlayback()} aria-label={`${playing ? 'Pause' : 'Play'} ${label}`} aria-busy={loading}>
          <svg viewBox='0 0 24 24' width='15' height='15' fill='currentColor' aria-hidden='true'>
            {playing ? <path d='M6 4h4v16H6zm8 0h4v16h-4z' /> : <path d='m7 3 15 9-15 9z' />}
          </svg>
        </button>
        <span className='dgen-time'>{elapsedLabel} <span>/ {durationLabel}</span></span>
      </div>
      {showChannels && <span className='dgen-channels'>{audio.channels === 1 ? 'Mono' : audio.channels === 2 ? 'Stereo' : `${audio.channels} channels`}</span>}
      {error && <p className='dgen-error' role='alert'>{error}</p>}
      <audio
        ref={mediaRef}
        src={audio.src}
        preload='metadata'
        onLoadedMetadata={(event) => {
          const media = event.currentTarget
          if (Number.isFinite(media.duration) && media.duration > 0) {
            setDuration(media.duration)
            if (pendingSeek.current !== null) {
              media.currentTime = clamp(pendingSeek.current, media.duration)
              pendingSeek.current = null
            }
          }
        }}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPlaying={() => { setPlaying(true); setLoading(false) }}
        onPause={(event) => { setPlaying(false); setLoading(false); setTime(event.currentTarget.currentTime) }}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onEnded={() => { setPlaying(false); setLoading(false) }}
        onError={() => { setPlaying(false); setLoading(false); setError('Audio could not be loaded. Please try again.') }}
      />
    </div>
  )
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
                      <GenerationWaveformPlayer audio={prompt} exampleTitle={example.title} />
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
                    <GenerationWaveformPlayer audio={output} exampleTitle={example.title} showChannels />
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
.dgen-audio { min-width: 0; width: 100%; }
.dgen-transport { display: flex; align-items: center; gap: 7px; margin-top: 12px; }
.dgen-play { display: flex; align-items: center; justify-content: center; flex: 0 0 32px; width: 32px; height: 32px; padding: 0; border: 0; border-radius: 50%; background: #304969; color: #fff; }
.dgen-play:hover { background: #213852; }
.dgen-time { color: #415069; white-space: nowrap; font-size: 10px; font-variant-numeric: tabular-nums; }
.dgen-time > span { color: #758092; }
.dgen-channels { display: block; margin-top: 7px; color: #758092; font-size: 10px; }
.dgen-error { margin: 8px 0 0; color: #a63b3b; font-size: 11px; line-height: 1.5; }
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
  .dgen-time { font-size: 12px; }
}
@media (max-width: 540px) {
  .dgen-section { padding: 32px 20px 12px; }
  .dgen-comparison { grid-template-columns: minmax(0, 1fr); }
  .dgen-cell { border-left: 0; }
  .dgen-cell > h4 { align-items: flex-start; padding: 10px 16px; text-align: left; }
  .dgen-prompts { gap: 18px; padding: 20px 16px; }
  .dgen-time { font-size: 10px; }
}
`
