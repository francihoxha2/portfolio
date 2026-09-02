import { useState } from 'react'
import CertificateDialog from '../components/credentials/CertificateDialog.jsx'
import SectionHeading from '../components/common/SectionHeading.jsx'

function formatCompletedDate(completedOn) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${completedOn}T00:00:00Z`))
}

function formatDuration(hours) {
  return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
}

function hasCertificateImage(credential) {
  return credential.asset.status === 'available' && Boolean(credential.asset.src)
}

export default function CredentialsSection({ credentials, narrative }) {
  const [selectedCredential, setSelectedCredential] = useState(null)
  const [returnFocusElement, setReturnFocusElement] = useState(null)

  const openCertificate = (credential, trigger) => {
    setReturnFocusElement(trigger)
    setSelectedCredential(credential)
  }

  return (
    <section
      id="credentials"
      className="portfolio-section credentials-section"
      aria-labelledby="credentials-title"
    >
      <div className="page-frame credentials-section__inner">
        <SectionHeading
          eyebrow="Credentials"
          title={narrative.title}
          headingId="credentials-title"
        >
          {narrative.introduction}
        </SectionHeading>

        <ol className="credential-list" aria-label="Selected credentials">
          {credentials.map((credential, index) => {
            const imageAvailable = hasCertificateImage(credential)

            return (
              <li
                className="credential-item"
                data-certificate-state={imageAvailable ? 'available' : 'metadata-only'}
                key={credential.id}
              >
                <article className="credential-item__content">
                  <header className="credential-item__header">
                    <p className="credential-item__index" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </p>
                    <p className="credential-item__date">
                      <span className="sr-only">Completed </span>
                      {formatCompletedDate(credential.completedOn)}
                    </p>
                  </header>

                  <div className="credential-item__body">
                    <p className="eyebrow">{credential.provider}</p>
                    <h3>{credential.title}</h3>
                    <p className="credential-item__instructors">
                      {credential.instructors.join(', ')}
                    </p>
                  </div>

                  <footer className="credential-item__footer">
                    <span>{formatDuration(credential.durationHours)}</span>
                    {imageAvailable ? (
                      <button
                        type="button"
                        className="credential-item__action"
                        aria-label={`View certificate: ${credential.title}`}
                        onClick={(event) => openCertificate(credential, event.currentTarget)}
                      >
                        View certificate <span aria-hidden="true">↗</span>
                      </button>
                    ) : null}
                  </footer>
                </article>

                {imageAvailable ? (
                  <div className="credential-item__preview">
                    <img
                      src={credential.asset.src}
                      alt={`Certificate preview for ${credential.title}`}
                      width={credential.asset.width}
                      height={credential.asset.height}
                      loading="lazy"
                      decoding="async"
                    />
                    <span aria-hidden="true">Preview</span>
                  </div>
                ) : null}
              </li>
            )
          })}
        </ol>

        <p className="credentials-section__handoff">
          <span aria-hidden="true">AI / application</span>
          {narrative.handoff}
        </p>
      </div>

      {selectedCredential ? (
        <CertificateDialog
          credential={selectedCredential}
          returnFocusElement={returnFocusElement}
          onClose={() => setSelectedCredential(null)}
        />
      ) : null}
    </section>
  )
}
