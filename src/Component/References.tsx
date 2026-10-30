import type { PaperReference } from '../Config/References'

function Publication({ reference }: { reference: PaperReference }) {
  if (reference.kind === 'conference') {
    return <>
      In <em>{reference.venue}</em>
      {reference.volume && `, volume ${reference.volume}`}
      {reference.pages && `, pp. ${reference.pages}`}, {reference.year}.
    </>
  }

  if (reference.kind === 'journal') {
    return <>
      <em>{reference.venue}</em>
      {reference.volume && `, ${reference.volume}`}
      {reference.pages && `${reference.volume ? ':' : ', pp. '}${reference.pages}`}, {reference.year}.
    </>
  }

  return <><em>{reference.venue}</em>, {reference.year}.</>
}

export default function References({ references }: { references: readonly PaperReference[] }) {
  if (references.length === 0) return null
  const sortedReferences = [...references].sort((left, right) => left.shortAuthors.localeCompare(right.shortAuthors))

  return (
    <section id='references' className='paper-references' aria-labelledby='references-heading'>
      <style>{styles}</style>
      <h2 id='references-heading'>References</h2>
      <ul>
        {sortedReferences.map((reference) => (
          <li key={reference.id} id={`reference-${reference.id}`}>
            {reference.authors}.{' '}
            <a href={reference.href} target='_blank' rel='noopener noreferrer'>{reference.title}</a>.{' '}
            <Publication reference={reference} />
          </li>
        ))}
      </ul>
    </section>
  )
}

const styles = `
.paper-references { box-sizing: border-box; width: min(1120px, 100%); padding: 44px 28px 20px; color: #253246; font-family: 'Trebuchet MS', Arial, sans-serif; text-align: left; }
.paper-references h2 { margin: 0 0 25px; font-size: clamp(25px, 3vw, 30px); font-weight: 600; letter-spacing: -.025em; line-height: 1.25; }
.paper-references ul { display: grid; gap: 18px; margin: 0; padding: 0; list-style: none; }
.paper-references li { padding-left: 24px; text-indent: -24px; color: #43516a; font-size: 13px; line-height: 1.8; overflow-wrap: anywhere; }
.paper-references a { color: #304969; text-decoration-color: #bdc8d7; text-underline-offset: 3px; }
.paper-references a:hover { text-decoration-color: currentColor; }
.paper-references a:focus-visible { outline: 3px solid #5375bb; outline-offset: 3px; }
@media (max-width: 540px) {
  .paper-references { padding: 32px 20px 12px; }
  .paper-references li { padding-left: 18px; text-indent: -18px; }
}
`
