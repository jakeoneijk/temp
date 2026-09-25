import { useState } from 'react'
import './VideoSection.css'

export type VideoExample = {
  id: string
  title: string
  src: string
}

type VideoSectionProps = {
  id: string
  title: string
  description: string
  videos: readonly VideoExample[]
}

function VideoCard({ video }: { video: VideoExample }) {
  const [hasError, setHasError] = useState(false)

  return (
    <figure className='video-card'>
      <figcaption className='video-card__caption'>
        <h3 className='video-card__title'>{video.title}</h3>
      </figcaption>
      <video
        className='video-card__player'
        src={video.src}
        controls
        playsInline
        preload='metadata'
        aria-label={video.title}
        onError={() => setHasError(true)}
      >
        Your browser does not support embedded video.{' '}
        <a href={video.src}>Open the video</a>.
      </video>
      {hasError && (
        <p className='video-card__error' role='status'>
          This video could not be loaded.{' '}
          <a href={video.src} target='_blank' rel='noopener noreferrer'>
            Open the video directly
          </a>.
        </p>
      )}
    </figure>
  )
}

export default function VideoSection({ id, title, description, videos }: VideoSectionProps) {
  if (videos.length === 0) return null

  return (
    <section className='video-section' aria-labelledby={`${id}-heading`}>
      <header className='video-section__header'>
        <h2 id={`${id}-heading`} className='video-section__title'>{title}</h2>
        <p className='video-section__description'>{description}</p>
      </header>
      <div className='video-section__grid'>
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </section>
  )
}
