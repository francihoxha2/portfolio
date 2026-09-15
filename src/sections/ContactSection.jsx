import SectionHeading from '../components/common/SectionHeading.jsx'

const externalChannel = (contact) => contact.id === 'linkedin'

export default function ContactSection({ contacts, narrative, cvPath }) {
  const email = contacts.find((contact) => contact.id === 'email')

  return (
    <section
      id="contact"
      className="portfolio-section contact-section"
      aria-labelledby="contact-title"
    >
      <div className="page-frame contact-section__grid">
        <SectionHeading
          eyebrow={narrative.eyebrow}
          title={narrative.title}
          headingId="contact-title"
        >
          {narrative.introduction}
        </SectionHeading>

        <div className="contact-panel">
          <div className="contact-actions">
            {email ? (
              <a className="button button--primary" href={email.href}>
                {narrative.emailCtaLabel}
              </a>
            ) : null}
            {cvPath ? (
              <a className="button button--secondary" href={cvPath} download>
                {narrative.cvCtaLabel}
              </a>
            ) : null}
          </div>

          <address className="contact-list">
            {contacts.map((contact) => (
              <div className="contact-item" key={contact.id}>
                <span>{contact.label}</span>
                {contact.href ? (
                  <a
                    href={contact.href}
                    target={externalChannel(contact) ? '_blank' : undefined}
                    rel={externalChannel(contact) ? 'noreferrer' : undefined}
                  >
                    {contact.value}
                  </a>
                ) : (
                  <strong>{contact.value}</strong>
                )}
              </div>
            ))}
          </address>
        </div>
      </div>
    </section>
  )
}
