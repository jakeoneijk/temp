import React from 'react'

import { paperContent } from './Config/PaperContent'

import Title from './Component/Title'
import AudioTable from './Source/AudioTable'
import Section from './Component/Section'

const style = {
  display: 'flex',
  flexDirection: 'column' as 'column',
  alignItems: 'center' as 'center',
}

function App() {
  return (
    <div className='App' style={style}>
      <Title />
      {paperContent.abstract.trim() ? (
        <Section name='Abstract' content={paperContent.abstract} />
      ) : (
        <p style={{ margin: '40px 24px', textAlign: 'center', color: '#5f6368' }}>
          More content will be added in future updates.
        </p>
      )}
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
    </div>
  )
}

export default App
