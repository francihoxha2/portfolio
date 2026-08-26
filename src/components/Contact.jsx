function Contact({ contacts }) {
  return (
    <section id="contact" className="section contact-section">
      <div className="contact-card">
        <div>
          <p className="eyebrow">Get In Touch</p>
          <h2>Let&rsquo;s talk about your team</h2>
          <p className="contact-lead">
            If you&rsquo;d like to discuss software work, a project, or a potential
            collaboration, reach out directly.
          </p>

          <div className="contact-actions">
            {contacts.email && (
              <a className="button button-primary" href={contacts.email.href}>
                Email me
              </a>
            )}
            {contacts.linkedin && (
              <a
                className="button button-secondary"
                href={contacts.linkedin.href}
                target="_blank"
                rel="noreferrer"
              >
                Connect on LinkedIn
              </a>
            )}
          </div>
        </div>

        <ul className="contact-list">
          {contacts.email && <li>
            <span className="label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-10 6L2 7" />
              </svg>
              Email
            </span>
            <a className="value" href={contacts.email.href}>
              {contacts.email.value}
            </a>
          </li>}
          {contacts.phone && <li>
            <span className="label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
              </svg>
              Phone
            </span>
            <a className="value" href={contacts.phone.href}>
              {contacts.phone.value}
            </a>
          </li>}
          {contacts.location && <li>
            <span className="label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Location
            </span>
            <span className="value">{contacts.location.value}</span>
          </li>}
          {contacts.linkedin && <li>
            <span className="label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
              LinkedIn
            </span>
            <a className="value" href={contacts.linkedin.href} target="_blank" rel="noreferrer">
              {contacts.linkedin.value}
            </a>
          </li>}
        </ul>
      </div>
    </section>
  )
}

export default Contact
