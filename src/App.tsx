import React from 'react'
import './App.css'

import { paperContent } from './Config/PaperContent'
import { dialogueContinuation } from './Config/DialogueContent'
import { dialogueGeneration } from './Config/DialogueGenerationContent'
import { demoReferences } from './Config/References'

import Title from './Component/Title'
import AudioTable from './Source/AudioTable'
import Section from './Component/Section'
import DialogueAudioSection from './Component/DialogueAudioSection'
import DialogueGenerationSection from './Component/DialogueGenerationSection'
import References from './Component/References'

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
      <DialogueAudioSection {...dialogueContinuation} />
      <DialogueGenerationSection {...dialogueGeneration} />
      <AudioTable audioType='Sound Effect' />
      <AudioTable audioType='Music' />
      <AudioTable audioType='Speech' />
      <References references={demoReferences} />
      <p className='content-update'>
        More content will be added.
      </p>
    </div>
  )
}

export default App
