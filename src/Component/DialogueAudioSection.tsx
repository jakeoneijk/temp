import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

export type DialogueSegment = {
  speaker: string
  start: number
  end: number
  text: string
  generated: boolean
}

export type DialogueAudioTrack = {
  id: string
  label: string
  description?: string
  descriptionHref?: string
  src: string
  duration: number
  promptEnd: number
  peaks: readonly (readonly number[])[]
  segments: readonly DialogueSegment[]
}

export type DialogueExample = {
  id: string
  title: string
  description?: string
  tracks: readonly DialogueAudioTrack[]
}

type PlayerProps = { track: DialogueAudioTrack; exampleTitle: string }
type SectionProps = {
  id: string
  title: string
  description: string
  examples: readonly DialogueExample[]
}

const speakers = ['A', 'B'] as const
const clamp = (value: number, max: number) => Math.min(max, Math.max(0, value))

function formatTime(seconds: number) {
  const rounded = Math.floor(Math.max(0, seconds))
  return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, '0')}`
}

// Peaks are precomputed from each WAV. Rendering never needs a fetch or an
// AudioContext, so the player also works on hosts with an opaque origin.
function waveformPath(peaks: readonly number[], center: number) {
  return peaks.map((peak, index) => {
    const x = ((index + 0.5) / peaks.length) * 640
    const height = Math.max(0.55, Math.min(1, Math.abs(peak)) * 25)
    return `M${x.toFixed(1)},${(center - height).toFixed(1)}v${(height * 2).toFixed(1)}`
  }).join(' ')
}

function PlaybackIcon({ playing }: { playing: boolean }) {
  return (
    <svg viewBox='0 0 24 24' width='18' height='18' fill='currentColor' aria-hidden='true'>
      {playing ? <path d='M6 4h4v16H6zm8 0h4v16h-4z' /> : <path d='m7 3 15 9-15 9z' />}
    </svg>
  )
}

function AudioPlayer({ track, exampleTitle }: PlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const pendingSeek = useRef<number | null>(null)
  const clipId = useId().replace(/:/g, '')
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(track.duration)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const promptEnd = clamp(track.promptEnd, duration)
  const promptPercent = duration > 0 ? promptEnd / duration * 100 : 0
  const progress = duration > 0 ? clamp(time / duration, 1) : 0
  const durationLabel = formatTime(Math.ceil(duration))
  const generated = time >= promptEnd
  const label = `${exampleTitle}, ${track.label}`
  const paths = useMemo(() => speakers.map((_, channel) =>
    waveformPath(track.peaks[channel] ?? [], channel === 0 ? 46 : 122),
  ), [track.peaks])
  const turns = useMemo(() => speakers.map((speaker) => track.segments
    .filter((turn) => turn.speaker === speaker)
    .sort((a, b) => a.start - b.start)), [track.segments])

  useEffect(() => {
    const audio = audioRef.current
    // A capture listener also stops this player when another page player starts.
    const pauseForOtherMedia = (event: Event) => {
      if (event.target instanceof HTMLMediaElement && event.target !== audio) audio?.pause()
    }
    document.addEventListener('play', pauseForOtherMedia, true)
    return () => {
      document.removeEventListener('play', pauseForOtherMedia, true)
      audio?.pause()
    }
  }, [])

  useEffect(() => {
    if (!playing) return
    let frame = 0
    const update = () => {
      if (audioRef.current) setTime(audioRef.current.currentTime)
      frame = requestAnimationFrame(update)
    }
    frame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frame)
  }, [playing])

  function seek(seconds: number) {
    const audio = audioRef.current
    if (!audio) return
    const next = clamp(seconds, duration)
    pendingSeek.current = audio.readyState === 0 ? next : null
    audio.currentTime = next
    setTime(next)
  }

  async function play() {
    const audio = audioRef.current
    if (!audio) return
    setError('')
    setLoading(true)
    try {
      if (audio.error) audio.load()
      await audio.play()
    } catch (cause) {
      // Switching players or examples can intentionally interrupt play().
      if (!(cause instanceof DOMException && cause.name === 'AbortError')) {
        setError('Audio could not be played. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  function togglePlayback() {
    const audio = audioRef.current
    if (!audio) return
    if (!audio.paused) {
      audio.pause()
    } else {
      if (audio.ended || audio.currentTime >= duration) seek(0)
      void play()
    }
  }

  return (
    <article className='dac-player' aria-label={label}>
      <header className='dac-player-heading'>
        <div>
          <h4>{track.label}</h4>
          {track.description && (
            <p>
              {track.descriptionHref ? (
                <a href={track.descriptionHref} target='_blank' rel='noopener noreferrer'>{track.description}</a>
              ) : track.description}
            </p>
          )}
        </div>
        <span className='dac-stereo'>Stereo</span>
      </header>

      <div className='dac-timeline' style={{ '--prompt': `${promptPercent}%` } as CSSProperties}>
        <div className='dac-regions' aria-hidden='true'>
          <span>Real conversation</span><span>Generated continuation</span>
        </div>
        <div className='dac-wave'>
          <div className='dac-prompt-shade' />
          <svg className='dac-wave-svg' viewBox='0 0 640 156' preserveAspectRatio='none' aria-hidden='true'>
            <defs><clipPath id={clipId}><rect width={progress * 640} height='156' /></clipPath></defs>
            <path d='M0 77H640' stroke='#e5e9ee' strokeWidth='1' />
            {paths.map((path, index) => (
              <g key={index} className={`dac-channel-${index}`} strokeWidth='1.3' strokeLinecap='round'>
                <path d={path} opacity='0.38' />
                <path d={path} clipPath={`url(#${clipId})`} />
              </g>
            ))}
          </svg>
          <span className='dac-speaker-label dac-speaker-a'>Speaker A <small>Left</small></span>
          <span className='dac-speaker-label dac-speaker-b'>Speaker B <small>Right</small></span>
          <div className='dac-seam' />
          <div className='dac-playhead' style={{ left: `${progress * 100}%` }} />
          <input
            className='dac-seek'
            type='range'
            min='0'
            max={duration}
            step='any'
            value={clamp(time, duration)}
            aria-label={`Seek ${label}`}
            aria-valuetext={`${formatTime(time)} of ${durationLabel}, ${generated ? 'generated continuation' : 'real conversation'}`}
            onChange={(event) => seek(Number(event.target.value))}
            onKeyDown={(event) => {
              if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
                event.preventDefault()
                seek(time + (event.key === 'ArrowRight' || event.key === 'ArrowUp' ? 1 : -1))
              } else if (event.key === ' ') {
                event.preventDefault()
                togglePlayback()
              }
            }}
          />
        </div>
        <div className='dac-axis' aria-hidden='true'>
          <span>0:00</span><span className='dac-boundary-time'>{formatTime(promptEnd)}</span><span>{durationLabel}</span>
        </div>
      </div>

      <div className='dac-controls'>
        <button className='dac-play' type='button' onClick={togglePlayback} aria-label={`${playing ? 'Pause' : 'Play'} ${label}`} aria-busy={loading}>
          <PlaybackIcon playing={playing} />
        </button>
        <span className='dac-time'>{formatTime(time)} <span>/ {durationLabel}</span></span>
        <button className='dac-jump' type='button' onClick={() => { seek(promptEnd); void play() }} aria-label={`Play generated continuation, ${label}`}>
          <svg viewBox='0 0 20 20' width='15' height='15' fill='currentColor' aria-hidden='true'><path d='m3 4 9 6-9 6zm10 0h3v12h-3z' /></svg>
          Play continuation
        </button>
      </div>

      <div className='dac-captions' aria-label={`Synchronized captions, ${label}`}>
        {speakers.map((speaker, channel) => {
          const current = turns[channel].reduce<DialogueSegment | undefined>((latest, turn) => turn.start <= time ? turn : latest, undefined)
          const active = current && time >= current.start && time < current.end && !audioRef.current?.ended
          const crossesBoundary = current && current.start < promptEnd && current.end > promptEnd
          const captionKind = crossesBoundary ? 'Prompt → generated' : current?.generated ? 'Generated' : 'Prompt'
          return (
            <div key={`${speaker}-${current?.start ?? 'waiting'}`} className={`dac-caption dac-caption-${speaker.toLowerCase()} ${active ? 'dac-caption-active' : ''}`}>
              <div className='dac-caption-heading'>
                <span>Speaker {speaker}</span>
                {current && <span className={crossesBoundary || current.generated ? 'dac-generated-tag' : ''}>{captionKind}</span>}
              </div>
              <p>{current?.text ?? 'Waiting for this speaker…'}</p>
            </div>
          )
        })}
      </div>
      {error && <p className='dac-error' role='alert'>{error}</p>}
      <audio
        ref={audioRef}
        src={track.src}
        preload='metadata'
        onLoadedMetadata={(event) => {
          const audio = event.currentTarget
          const actual = audio.duration
          if (Number.isFinite(actual) && actual > 0) {
            setDuration(actual)
            if (pendingSeek.current !== null) {
              audio.currentTime = clamp(pendingSeek.current, actual)
              pendingSeek.current = null
            }
          }
        }}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPlaying={() => { setPlaying(true); setLoading(false) }}
        onPause={() => { setPlaying(false); setLoading(false) }}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onEnded={() => { setPlaying(false); setLoading(false) }}
        onError={() => { setPlaying(false); setLoading(false); setError('Audio could not be loaded. Please try again.') }}
      />
    </article>
  )
}

// Standalone player: this file contains its types, controls, waveform, captions,
// and scoped styles. Changing the source remounts playback state safely.
export function DialogueAudioPlayer(props: PlayerProps) {
  return <><style>{styles}</style><AudioPlayer key={props.track.src} {...props} /></>
}

export default function DialogueAudioSection({ id, title, description, examples }: SectionProps) {
  if (examples.length === 0) return null

  return (
    <section id={id} className='dac-section' aria-labelledby={`${id}-heading`}>
      <style>{styles}</style>
      <header className='dac-section-heading'>
        <h2 id={`${id}-heading`}>{title}</h2>
        <p>{description}</p>
      </header>
      <div className='dac-examples'>
        {examples.map((example) => (
          <section key={example.id} className='dac-example' aria-labelledby={`${id}-${example.id}-heading`}>
            <header className='dac-example-heading'>
              <h3 id={`${id}-${example.id}-heading`}>
                {example.title}
              </h3>
            </header>
            <div className='dac-comparison'>
              {example.tracks.map((track) => <AudioPlayer key={`${track.id}-${track.src}`} track={track} exampleTitle={example.title} />)}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}

// Scoped here to keep the player portable without a stylesheet dependency.
const styles = `
.dac-section, .dac-player { box-sizing: border-box; color: #253246; font-family: 'Trebuchet MS', Arial, sans-serif; text-align: left; }
.dac-section *, .dac-player * { box-sizing: border-box; }
.dac-section { width: min(1120px, 100%); padding: 44px 28px 20px; }
.dac-section button, .dac-player button { font: inherit; cursor: pointer; }
.dac-section button:focus-visible, .dac-player button:focus-visible, .dac-player a:focus-visible, .dac-section a:focus-visible { outline: 3px solid #5375bb; outline-offset: 4px; }
.dac-section-heading h2 { margin: 0; font-size: clamp(25px, 3vw, 30px); font-weight: 600; letter-spacing: -.025em; line-height: 1.25; }
.dac-section-heading p { margin: 12px 0 25px; max-width: 760px; color: #637082; font-size: 15px; line-height: 1.7; white-space: pre-line; }
.dac-examples { display: grid; gap: 36px; }
.dac-example { padding-top: 24px; border-top: 1px solid #e4e8ee; }
.dac-example-heading { margin: 0 0 20px; }
.dac-example-heading h3 { margin: 0; font-size: 17px; font-weight: 600; letter-spacing: -.01em; line-height: 1.5; }
.dac-comparison { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; align-items: start; }
.dac-player { min-width: 0; width: 100%; overflow: hidden; padding: 23px 22px 16px; background: #fff; border: 1px solid #dfe5ed; border-radius: 12px; box-shadow: 0 3px 16px #20304704; }
.dac-player-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 24px; }
.dac-player-heading h4 { margin: 0; font-size: 18px; font-weight: 600; letter-spacing: -.025em; }
.dac-player-heading p { margin: 6px 0 0; color: #758092; font-size: 12px; line-height: 1.45; }
.dac-player-heading p a { color: inherit; text-decoration: none; }
.dac-player-heading p a:hover { text-decoration: underline; text-underline-offset: 3px; }
.dac-stereo { border: 1px solid #e1e6ee; color: #7a8595; padding: 4px 7px; border-radius: 4px; font-size: 10px; letter-spacing: .05em; text-transform: uppercase; }
.dac-regions { display: grid; grid-template-columns: var(--prompt) 1fr; margin-bottom: 9px; font-size: 10px; font-weight: 600; line-height: 1.4; }
.dac-regions span:first-child { color: #768292; }
.dac-regions span:last-child { color: #7856a4; padding-left: 10px; }
.dac-wave { position: relative; height: 156px; border: 1px solid #e6e9ef; border-radius: 7px; overflow: hidden; background: #fcfaff; }
.dac-prompt-shade { position: absolute; inset: 0 auto 0 0; width: var(--prompt); background: #f3f5f8; }
.dac-wave-svg { display: block; position: relative; width: 100%; height: 100%; }
.dac-channel-0 { stroke: #3975b9; }
.dac-channel-1 { stroke: #cc7860; }
.dac-speaker-label { position: absolute; left: 9px; font-size: 9px; font-weight: 600; line-height: 1; pointer-events: none; }
.dac-speaker-label small { margin-left: 4px; font-size: 8px; font-weight: 400; color: #8490a0; }
.dac-speaker-a { top: 9px; color: #3975b9; }
.dac-speaker-b { top: 87px; color: #ad6049; }
.dac-seam { position: absolute; top: 0; bottom: 0; left: var(--prompt); border-left: 1px dashed #947bb6; pointer-events: none; }
.dac-playhead { position: absolute; top: 0; bottom: 0; width: 2px; background: #34445b; transform: translateX(-1px); pointer-events: none; }
.dac-seek { appearance: none; -webkit-appearance: none; position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; border: 0; border-radius: 6px; background: transparent; cursor: crosshair; }
.dac-seek::-webkit-slider-runnable-track { height: 100%; background: transparent; }
.dac-seek::-webkit-slider-thumb { appearance: none; -webkit-appearance: none; width: 1px; height: 100%; background: transparent; border: 0; }
.dac-seek::-moz-range-track { background: transparent; border: 0; }
.dac-seek::-moz-range-progress { background: transparent; }
.dac-seek::-moz-range-thumb { width: 1px; height: 100%; border: 0; background: transparent; }
.dac-seek:focus { outline: none; }
.dac-seek:focus-visible { outline: 2px solid #5375bb; outline-offset: -2px; }
.dac-axis { display: flex; position: relative; justify-content: space-between; margin-top: 7px; color: #667386; font-size: 10px; font-variant-numeric: tabular-nums; }
.dac-boundary-time { position: absolute; left: var(--prompt); transform: translateX(-50%); color: #82699f; }
.dac-controls { display: flex; align-items: center; gap: 10px; margin-top: 18px; }
.dac-play { display: flex; justify-content: center; align-items: center; flex: 0 0 38px; height: 38px; padding: 0; border: 0; border-radius: 50%; background: #304969; color: #fff; }
.dac-play:hover { background: #213852; }
.dac-time { white-space: nowrap; color: #415069; font-size: 12px; font-variant-numeric: tabular-nums; }
.dac-time > span { color: #667386; }
.dac-jump { display: flex; align-items: center; justify-content: center; gap: 5px; margin-left: auto; padding: 8px 9px; border: 1px solid #e5dfed; border-radius: 6px; background: #faf8fd; color: #77559e; font-size: 11px !important; white-space: nowrap; }
.dac-jump:hover { background: #f0eaf8; }
.dac-captions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px; }
.dac-caption { height: 158px; padding: 12px; border: 1px solid #e8ebf0; border-top: 2px solid #c5cfdc; border-radius: 7px; background: #f7f8fa; color: #7c8796; overflow-y: auto; scrollbar-width: thin; }
.dac-caption-heading { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 4px; min-height: 26px; margin-bottom: 7px; }
.dac-caption-heading > span:first-child { font-size: 10px; font-weight: 600; }
.dac-caption-heading > span:last-child:not(:first-child) { color: #8791a0; font-size: 8px; }
.dac-caption-heading .dac-generated-tag { color: #7c57a6 !important; }
.dac-caption p { margin: 0; font-size: 13px; line-height: 1.65; overflow-wrap: break-word; }
.dac-caption-active { background: #fff; color: #35445b; }
.dac-caption-active.dac-caption-a { border-top-color: #3975b9; }
.dac-caption-active.dac-caption-b { border-top-color: #cc7860; }
.dac-caption-a .dac-caption-heading > span:first-child { color: #3975b9; }
.dac-caption-b .dac-caption-heading > span:first-child { color: #ad6049; }
.dac-error { margin: 10px 0 0; color: #a63b3b; font-size: 12px; line-height: 1.6; }
@media (max-width: 860px) {
  .dac-comparison { grid-template-columns: minmax(0, 1fr); gap: 20px; }
  .dac-caption { height: 142px; }
}
@media (max-width: 540px) {
  .dac-section { padding: 32px 20px 12px; }
  .dac-player { padding: 19px 14px 14px; }
  .dac-player-heading { margin-bottom: 20px; }
  .dac-player-heading h4 { font-size: 17px; }
  .dac-regions { font-size: 9px; }
  .dac-controls { gap: 7px; }
  .dac-time { font-size: 11px; }
  .dac-jump { font-size: 10px !important; padding: 8px 6px; gap: 3px; }
  .dac-captions { grid-template-columns: 1fr; gap: 8px; }
  .dac-caption { height: 112px; }
  .dac-caption-heading { min-height: 15px; }
}
`
