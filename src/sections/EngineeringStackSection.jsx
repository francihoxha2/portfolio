import SectionHeading from '../components/common/SectionHeading.jsx'

export default function EngineeringStackSection({ capabilityGroups }) {
  return (
    <section id="stack" className="portfolio-section stack-section" aria-labelledby="stack-title">
      <div className="page-frame">
        <SectionHeading eyebrow="Engineering Stack" title="Across the software system" headingId="stack-title">
          A practical toolkit spanning interfaces, services, data, delivery, mobile, and AI.
        </SectionHeading>

        <div className="capability-groups">
          {capabilityGroups.map((group) => (
            <section className="capability-group" key={group.id} aria-labelledby={`capability-${group.id}`}>
              <h3 id={`capability-${group.id}`}>{group.title}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item.id}>{item.label}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  )
}
