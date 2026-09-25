import { useState } from 'react'

type ButtonProps = {
  children: React.ReactNode
  onClick: () => void
}

const buttonCommonStyle = {
  display: 'flex',
  width: '70px',
}
const buttonStyle = {
  justifyContent: 'center',
  alignItems: 'center',
  padding: '6px 14px',
  backgroundColor: '#fff',
  border: '1px solid #f8f9fa',
  borderRadius: '24px',
  cursor: 'pointer',
  fontFamily: 'Arial, sans-serif',
  fontSize: '13px',
  fontWeight: 550,
  boxShadow:
    'rgba(0, 0, 0, .2) 0 3px 5px -1px,rgba(0, 0, 0, .14) 0 6px 10px 0,rgba(0, 0, 0, .12) 0 1px 18px 0',
  color: '#3c4043',
}

const buttonHoverStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '6px 14px',
  backgroundColor: '#3c4043',
  border: '1px solid #f8f9fa',
  borderRadius: '24px',
  cursor: 'pointer',
  fontFamily: 'Arial, sans-serif',
  fontSize: '13px',
  fontWeight: 550,
  boxShadow:
    'rgba(0, 0, 0, .2) 0 3px 5px -1px,rgba(0, 0, 0, .14) 0 6px 10px 0,rgba(0, 0, 0, .12) 0 1px 18px 0',
  color: '#fff',
}

export default function Button(props: ButtonProps) {
  const [isHovering, setIsHovering] = useState(false)

  return (
    <div
      onClick={props.onClick}
      style={{
        ...buttonCommonStyle,
        ...(isHovering ? buttonHoverStyle : buttonStyle),
      }}
      onMouseOver={() => setIsHovering(true)}
      onMouseOut={() => setIsHovering(false)}
    >
      {props.children}
    </div>
  )
}
