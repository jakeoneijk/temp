type SectionProps = {
  name: string
  content: string
}

const nameStyle = {
  paddingTop: '50px',
  paddingLeft: '20%',
  textAlign: 'left' as 'left',
  fontFamily: 'Georgia, serif',
  fontWeight: 550,
  fontSize: '25px',
}

const contentStyle = {
  paddingTop: '10px',
  paddingLeft: '20%',
  paddingRight: '20%',
  textAlign: 'justify' as 'justify',
  lineHeight: '150%',
  fontFamily: 'Arial, sans-serif',
  fontWeight: 100,
  fontSize: '15px',
  whiteSpace: 'pre-line' as 'pre-line',
}

export default function Section({ name, content }: SectionProps) {
  return (
    <div style={{ width: '100%' }}>
      <div style={nameStyle}>{name}</div>
      <div style={contentStyle}>{content}</div>
    </div>
  )
}
