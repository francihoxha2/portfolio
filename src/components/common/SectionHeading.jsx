export default function SectionHeading({ eyebrow, title, children, headingId }) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={headingId}>{title}</h2>
      {children ? <p>{children}</p> : null}
    </div>
  )
}
