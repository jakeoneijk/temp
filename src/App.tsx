import React from 'react'
import './App.css'

import { paperContent } from './Config/PaperContent'
import { dialogueContinuation } from './Config/VideoContent'

import Title from './Component/Title'
import AudioTable from './Source/AudioTable'
import Section from './Component/Section'
import VideoSection from './Component/VideoSection'

const style = {
  display: 'flex',
  flexDirection: 'column' as 'column',
  alignItems: 'center' as 'center',
}

function App() {
  return (
    <div className='App' style={style}>
      <Title />
      {paperContent.abstract.trim() && (
        <Section name='Abstract' content={paperContent.abstract} />
      )}
      <VideoSection {...dialogueContinuation} />
      <AudioTable audioType='Sound Effect' />
      <AudioTable audioType='Music' />
      <AudioTable audioType='Speech' />
      {paperContent.reference.length > 0 && (
        <Section
          name='References'
          content={paperContent.reference
            .map((item, index) => `[${index + 1}] ${item}`)
            .join(' \n ')}
        />
      )}
      <p className='content-update'>
        More content will be added.
      </p>
    </div>
  )
}

export default App
