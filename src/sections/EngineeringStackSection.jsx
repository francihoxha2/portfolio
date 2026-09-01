import { useEffect, useMemo, useRef, useState } from 'react'
import SectionHeading from '../components/common/SectionHeading.jsx'
import {
  createEngineeringSystem,
  getEngineeringSystemState,
} from '../data/engineeringSystem.ts'
import { useReducedMotion } from '../hooks/useReducedMotion.ts'

function CapabilityButton({ capability, state, active, onActivate, view }) {
  const evidenceId = `${view}-capability-${capability.id}-evidence`

  return (
    <li
      className="engineering-capability"
      data-capability-id={capability.id}
      data-capability-state={state}
      data-prominence={capability.prominence}
    >
      <button
        type="button"
        aria-pressed={active}
        aria-controls="engineering-system-evidence"
        aria-describedby={evidenceId}
        onPointerEnter={() => onActivate(capability.id)}
        onFocus={() => onActivate(capability.id)}
        onClick={() => onActivate(capability.id)}
      >
        <span>{capability.label}</span>
      </button>
      <span id={evidenceId} className="visually-hidden">
        {capability.evidence}
      </span>
    </li>
  )
}

function CapabilityList({ group, systemState, activeCapabilityId, onActivate, view }) {
  return (
    <ul className="engineering-cluster__capabilities">
      {group.items.map((capability) => {
        const state = activeCapabilityId === capability.id
          ? 'active'
          : systemState.relatedCapabilityIds.has(capability.id)
            ? 'related'
            : activeCapabilityId
              ? 'muted'
              : 'idle'

        return (
          <CapabilityButton
            key={capability.id}
            capability={capability}
            state={state}
            active={activeCapabilityId === capability.id}
            onActivate={onActivate}
            view={view}
          />
        )
      })}
    </ul>
  )
}

function EvidencePanel({ systemState }) {
  const capability = systemState.activeCapability

  return (
    <aside
      id="engineering-system-evidence"
      className="engineering-evidence"
      aria-labelledby="engineering-evidence-title"
      data-evidence-capability={capability?.id ?? 'full-stack'}
    >
      <div className="engineering-evidence__signal" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="engineering-evidence__identity">
        <p>{capability ? capability.clusterTitle : 'System core'}</p>
        <h3 id="engineering-evidence-title">
          {capability?.label ?? 'Full-Stack system'}
        </h3>
      </div>
      <div className="engineering-evidence__copy">
        <div>
          <p className="engineering-evidence__label">How I use it</p>
          <p>
            {capability?.evidence
              ?? 'My work spans frontend, backend and APIs, data, mobile applications, AI integration, languages, and delivery.'}
          </p>
        </div>
        <div>
          <p className="engineering-evidence__label">System relationship</p>
          <p>{systemState.relationship}</p>
        </div>
      </div>
    </aside>
  )
}

function DesktopSystem({ system, systemState, activeCapabilityId, onActivate }) {
  return (
    <div className="engineering-system__desktop" data-testid="engineering-desktop-map">
      <div className="engineering-system__stage">
        <svg
          className="engineering-system__connections"
          viewBox="0 0 1200 760"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="engineering-path-gradient" x1="0" x2="1">
              <stop offset="0" stopColor="var(--color-accent-violet)" />
              <stop offset="1" stopColor="var(--color-accent-cyan)" />
            </linearGradient>
          </defs>
          {system.paths.map((path) => (
            <g
              key={path.id}
              className="engineering-path"
              data-path-id={path.id}
              data-path-state={systemState.activePathIds.has(path.id) ? 'active' : 'idle'}
            >
              <path className="engineering-path__bed" d={path.d} pathLength="1" />
              <path className="engineering-path__trace" d={path.d} pathLength="1" />
            </g>
          ))}
        </svg>

        <button
          className="engineering-core"
          type="button"
          aria-label="Show Full-Stack system overview"
          aria-pressed={activeCapabilityId === null}
          onPointerEnter={() => onActivate(null)}
          onFocus={() => onActivate(null)}
          onClick={() => onActivate(null)}
        >
          <span className="engineering-core__orbit" aria-hidden="true" />
          <span className="engineering-core__index">System / 00</span>
          <strong>FULL-STACK</strong>
          <span>Application core</span>
        </button>

        {system.groups.map((group) => {
          const clusterState = systemState.activeClusterIds.has(group.id)
            ? activeCapabilityId && systemState.activeCapability?.clusterId === group.id
              ? 'active'
              : 'related'
            : activeCapabilityId
              ? 'muted'
              : 'idle'

          return (
            <section
              className={`engineering-cluster engineering-cluster--${group.id}`}
              key={group.id}
              aria-labelledby={`engineering-desktop-${group.id}`}
              data-cluster-id={group.id}
              data-cluster-state={clusterState}
              style={{ '--cluster-order': Number(group.index) }}
            >
              <header>
                <span>{group.index}</span>
                <div>
                  <p>{group.role}</p>
                  <h3 id={`engineering-desktop-${group.id}`}>{group.title}</h3>
                </div>
              </header>
              <CapabilityList
                group={group}
                systemState={systemState}
                activeCapabilityId={activeCapabilityId}
                onActivate={onActivate}
                view="desktop"
              />
            </section>
          )
        })}
      </div>
    </div>
  )
}

function MobileSystem({ system, systemState, activeCapabilityId, onActivate }) {
  const [openClusterId, setOpenClusterId] = useState('frontend')

  return (
    <div className="engineering-system__mobile" data-testid="engineering-mobile-map">
      <div className="engineering-mobile-core" aria-label="Full-Stack system core">
        <span>System / 00</span>
        <strong>FULL-STACK</strong>
        <p>Every group connects back to one application system.</p>
      </div>

      <div className="engineering-mobile-path" aria-label="Engineering capability groups">
        {system.groups.map((group) => {
          const expanded = openClusterId === group.id
          const panelId = `engineering-mobile-${group.id}-panel`

          return (
            <section
              className="engineering-mobile-cluster"
              key={group.id}
              data-cluster-id={group.id}
              data-cluster-state={systemState.activeClusterIds.has(group.id) ? 'active' : 'idle'}
            >
              <h3>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() => setOpenClusterId(expanded ? null : group.id)}
                >
                  <span className="engineering-mobile-cluster__index">{group.index}</span>
                  <span>
                    <small>{group.role}</small>
                    {group.title}
                  </span>
                  <span className="engineering-mobile-cluster__toggle" aria-hidden="true" />
                </button>
              </h3>
              <div id={panelId} hidden={!expanded}>
                <p className="engineering-mobile-cluster__relationship">
                  {group.relationship}
                </p>
                <CapabilityList
                  group={group}
                  systemState={systemState}
                  activeCapabilityId={activeCapabilityId}
                  onActivate={onActivate}
                  view="mobile"
                />
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

export default function EngineeringStackSection({ capabilityGroups }) {
  const sectionRef = useRef(null)
  const prefersReducedMotion = useReducedMotion()
  const [assembled, setAssembled] = useState(false)
  const [activeCapabilityId, setActiveCapabilityId] = useState(null)
  const system = useMemo(
    () => createEngineeringSystem(capabilityGroups),
    [capabilityGroups],
  )
  const systemState = useMemo(
    () => getEngineeringSystemState(activeCapabilityId, capabilityGroups),
    [activeCapabilityId, capabilityGroups],
  )
  const isAssembled = assembled
    || prefersReducedMotion
    || typeof IntersectionObserver === 'undefined'

  useEffect(() => {
    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      return undefined
    }

    const section = sectionRef.current
    if (!section) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setAssembled(true)
        observer.disconnect()
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [prefersReducedMotion])

  return (
    <section
      ref={sectionRef}
      id="stack"
      className="portfolio-section engineering-system"
      aria-labelledby="stack-title"
      data-assembled={isAssembled ? 'true' : 'false'}
      data-motion-mode={prefersReducedMotion ? 'reduced' : 'standard'}
      data-active-capability={activeCapabilityId ?? 'full-stack'}
      data-active-cluster={systemState.activeCapability?.clusterId ?? 'core'}
    >
      <div className="page-frame engineering-system__inner">
        <div className="engineering-system__heading">
          <SectionHeading
            eyebrow="Engineering System Map"
            title="One stack. Connected by how software works."
            headingId="stack-title"
          >
            Explore a capability to see how it connects across my frontend,
            backend, data, mobile, AI, language, and delivery work.
          </SectionHeading>
          <p className="engineering-system__instruction">
            <span aria-hidden="true" />
            Choose a capability to explore its connections.
          </p>
        </div>

        <DesktopSystem
          system={system}
          systemState={systemState}
          activeCapabilityId={activeCapabilityId}
          onActivate={setActiveCapabilityId}
        />
        <MobileSystem
          system={system}
          systemState={systemState}
          activeCapabilityId={activeCapabilityId}
          onActivate={setActiveCapabilityId}
        />
        <EvidencePanel systemState={systemState} />

        <p className="engineering-system__relationship-summary">
          This map shows how the capabilities in my toolkit relate; it is not a
          diagram of any single project&apos;s production architecture.
        </p>
      </div>
    </section>
  )
}
