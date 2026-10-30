import { useEffect, useRef, useState } from 'react'
import { DialogueWaveform } from './DialogueAudioSection'

export type WaveformAudio = {
  id: string
  label: string
  src: string
  duration: number
  channels: number
  peaks: readonly (readonly number[])[]
  citation?: { label: string; href: string }
}

const clamp = (time: number, duration: number) => Math.min(duration, Math.max(0, time))
const formatTime = (time: number) => `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}`

// Native media playback keeps the module portable to static and anonymous hosts.
export default function WaveformAudioPlayer({ audio, exampleTitle, showChannels = false }: {
  audio: WaveformAudio
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
    <div className='wap-audio' role='group' aria-label={label}>
      <style>{styles}</style>
      <DialogueWaveform peaks={audio.peaks} time={time} duration={duration} label={label} compact reserveStereoHeight={showChannels}
        channels={audio.channels === 1
          ? [{ label: 'Mono', color: audio.id === 'speaker-b' ? '#cc7860' : audio.id === 'speaker-a' ? '#3975b9' : '#647994' }]
          : [{ label: 'Left', color: '#3975b9' }, { label: 'Right', color: '#cc7860' }]}
        onSeek={seek} onToggle={() => void togglePlayback()} />
      <div className='wap-transport'>
        <button type='button' className='wap-play' onClick={() => void togglePlayback()} aria-label={`${playing ? 'Pause' : 'Play'} ${label}`} aria-busy={loading}>
          <svg viewBox='0 0 24 24' width='15' height='15' fill='currentColor' aria-hidden='true'>
            {playing ? <path d='M6 4h4v16H6zm8 0h4v16h-4z' /> : <path d='m7 3 15 9-15 9z' />}
          </svg>
        </button>
        <span className='wap-time'>{elapsedLabel} <span>/ {durationLabel}</span></span>
      </div>
      {showChannels && <span className='wap-channels'>{audio.channels === 1 ? 'Mono' : audio.channels === 2 ? 'Stereo' : `${audio.channels} channels`}</span>}
      {error && <p className='wap-error' role='alert'>{error}</p>}
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

const styles = `
.wap-audio, .wap-audio * { box-sizing: border-box; }
.wap-audio button { font: inherit; cursor: pointer; }
.wap-audio button:focus-visible { outline: 3px solid #5375bb; outline-offset: 3px; }
.wap-audio { min-width: 0; width: 100%; }
.wap-transport { display: flex; align-items: center; gap: 7px; margin-top: 12px; }
.wap-play { display: flex; align-items: center; justify-content: center; flex: 0 0 32px; width: 32px; height: 32px; padding: 0; border: 0; border-radius: 50%; background: #304969; color: #fff; }
.wap-play:hover { background: #213852; }
.wap-time { color: #415069; white-space: nowrap; font-size: 10px; font-variant-numeric: tabular-nums; }
.wap-time > span { color: #758092; }
.wap-channels { display: block; margin-top: 7px; color: #758092; font-size: 10px; }
.wap-error { margin: 8px 0 0; color: #a63b3b; font-size: 11px; line-height: 1.5; }
`
