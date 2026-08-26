import SectionHeading from '../components/common/SectionHeading.jsx'

export default function ContactSection({ contacts }) {
  return (
    <section id="contact" className="portfolio-section contact-section" aria-labelledby="contact-title">
      <div className="page-frame contact-section__grid">
        <SectionHeading eyebrow="Contact" title="Start a conversation" headingId="contact-title">
          Use any of the public channels here to get in touch.
        </SectionHeading>

        <address className="contact-list">
          {contacts.map((contact) => (
            <div className="contact-item" key={contact.id}>
              <span>{contact.label}</span>
              {contact.href ? (
                <a href={contact.href} target={contact.id === 'linkedin' ? '_blank' : undefined} rel={contact.id === 'linkedin' ? 'noreferrer' : undefined}>
                  {contact.value}
                </a>
              ) : (
                <strong>{contact.value}</strong>
              )}
            </div>
          ))}
        </address>
      </div>
    </section>
  )
}
