import type { CapabilityGroup, CapabilityItem } from '../../shared/portfolio.types.ts'

export const engineeringClusterOrder = [
  'frontend',
  'backend',
  'data',
  'mobile',
  'ai',
  'engineering',
  'languages',
] as const

export type EngineeringClusterId = (typeof engineeringClusterOrder)[number]

export interface EngineeringCluster extends CapabilityGroup {
  id: EngineeringClusterId
  index: string
  role: string
  relationship: string
}

export interface EngineeringPath {
  id: string
  from: EngineeringClusterId | 'core'
  to: EngineeringClusterId | 'core'
  label: string
  d: string
}

export interface EngineeringCapability extends CapabilityItem {
  clusterId: EngineeringClusterId
  clusterTitle: string
}

export interface EngineeringSystemState {
  activeCapability: EngineeringCapability | null
  activeClusterIds: Set<EngineeringClusterId>
  relatedCapabilityIds: Set<string>
  activePathIds: Set<string>
  relationship: string
}

const clusterMeta: Record<
  EngineeringClusterId,
  {
    index: string
    role: string
    relationship: string
    pathIds: string[]
    anchors: string[]
  }
> = {
  frontend: {
    index: '01',
    role: 'Interface layer',
    relationship:
      'I connect user-facing flows to backend services through frontend/backend integration and REST API work.',
    pathIds: ['frontend-core', 'frontend-backend'],
    anchors: ['react', 'frontend-backend'],
  },
  backend: {
    index: '02',
    role: 'Service layer',
    relationship:
      'Backend and API work sits between interfaces and persisted data, carrying authentication, authorization, and application logic.',
    pathIds: ['backend-core', 'frontend-backend', 'backend-data'],
    anchors: ['node-api', 'rest'],
  },
  data: {
    index: '03',
    role: 'Persistence layer',
    relationship:
      'I use data capabilities behind backend flows to support database-backed applications.',
    pathIds: ['data-core', 'backend-data'],
    anchors: ['mongodb', 'database-apps'],
  },
  mobile: {
    index: '04',
    role: 'Application surface',
    relationship:
      'I connect mobile application work with responsive interfaces, APIs, and database-backed flows.',
    pathIds: ['mobile-core', 'frontend-mobile', 'backend-mobile', 'data-mobile'],
    anchors: ['mobile-development'],
  },
  ai: {
    index: '05',
    role: 'Integration layer',
    relationship:
      'I use AI as an application-integration and development-workflow capability.',
    pathIds: ['ai-core', 'backend-ai'],
    anchors: ['ai-integration'],
  },
  engineering: {
    index: '06',
    role: 'System support',
    relationship:
      'Engineering and delivery practices support the full application path: integrate, test, debug, deploy, harden, and troubleshoot.',
    pathIds: [
      'engineering-core',
      'frontend-core',
      'backend-core',
      'data-core',
      'mobile-core',
      'ai-core',
      'languages-core',
    ],
    anchors: ['testing', 'deployment'],
  },
  languages: {
    index: '07',
    role: 'Cross-cutting tools',
    relationship:
      'I use JavaScript, TypeScript, Python, and Java across the application layers represented here.',
    pathIds: ['languages-core', 'languages-frontend', 'languages-backend'],
    anchors: ['javascript', 'typescript', 'python'],
  },
}

export const engineeringPaths: EngineeringPath[] = [
  {
    id: 'frontend-core',
    from: 'frontend',
    to: 'core',
    label: 'Frontend connects to the Full-Stack core',
    d: 'M 238 184 C 328 228 414 324 505 392',
  },
  {
    id: 'backend-core',
    from: 'backend',
    to: 'core',
    label: 'Backend and APIs connect to the Full-Stack core',
    d: 'M 600 176 C 600 246 600 304 600 360',
  },
  {
    id: 'data-core',
    from: 'data',
    to: 'core',
    label: 'Data connects to the Full-Stack core',
    d: 'M 962 184 C 872 228 786 324 695 392',
  },
  {
    id: 'mobile-core',
    from: 'mobile',
    to: 'core',
    label: 'Mobile application work connects to the Full-Stack core',
    d: 'M 238 422 C 342 422 414 422 500 422',
  },
  {
    id: 'ai-core',
    from: 'ai',
    to: 'core',
    label: 'AI integration connects to the application system',
    d: 'M 962 422 C 858 422 786 422 700 422',
  },
  {
    id: 'engineering-core',
    from: 'engineering',
    to: 'core',
    label: 'Engineering and delivery support the Full-Stack core',
    d: 'M 840 650 C 770 590 700 514 662 478',
  },
  {
    id: 'languages-core',
    from: 'languages',
    to: 'core',
    label: 'Languages cross the Full-Stack core',
    d: 'M 360 650 C 430 590 500 514 538 478',
  },
  {
    id: 'frontend-backend',
    from: 'frontend',
    to: 'backend',
    label: 'Frontend and backend connect through application integration',
    d: 'M 265 128 C 376 82 486 82 548 122',
  },
  {
    id: 'backend-data',
    from: 'backend',
    to: 'data',
    label: 'Backend services connect to persisted data',
    d: 'M 652 122 C 714 82 824 82 935 128',
  },
  {
    id: 'frontend-mobile',
    from: 'frontend',
    to: 'mobile',
    label: 'Frontend practice relates to mobile application surfaces',
    d: 'M 146 214 C 110 274 108 328 146 366',
  },
  {
    id: 'backend-mobile',
    from: 'backend',
    to: 'mobile',
    label: 'Mobile application work relates to backend and API services',
    d: 'M 550 164 C 424 208 330 308 230 392',
  },
  {
    id: 'data-mobile',
    from: 'data',
    to: 'mobile',
    label: 'Mobile application flows can connect through services to persisted data',
    d: 'M 986 214 C 924 540 414 566 214 464',
  },
  {
    id: 'backend-ai',
    from: 'backend',
    to: 'ai',
    label: 'AI integration enters the application through a service boundary',
    d: 'M 650 164 C 776 208 870 308 970 392',
  },
  {
    id: 'languages-frontend',
    from: 'languages',
    to: 'frontend',
    label: 'Implementation languages cross frontend work',
    d: 'M 286 622 C 208 524 182 344 196 214',
  },
  {
    id: 'languages-backend',
    from: 'languages',
    to: 'backend',
    label: 'Implementation languages cross backend and API work',
    d: 'M 344 622 C 474 498 548 318 576 176',
  },
]

const pathOverrides: Record<string, string[]> = {
  react: ['frontend-core', 'frontend-backend', 'languages-frontend'],
  nextjs: ['frontend-core', 'frontend-backend', 'backend-core', 'languages-frontend'],
  'frontend-backend': ['frontend-core', 'frontend-backend', 'backend-core'],
  'node-api': [
    'backend-core',
    'frontend-backend',
    'backend-data',
    'languages-backend',
  ],
  rest: ['backend-core', 'frontend-backend', 'backend-data', 'backend-mobile'],
  fastapi: ['backend-core', 'backend-data', 'languages-backend'],
  mongodb: ['data-core', 'backend-data'],
  'database-apps': ['data-core', 'backend-data', 'data-mobile'],
  'mobile-development': [
    'mobile-core',
    'frontend-mobile',
    'backend-mobile',
    'data-mobile',
  ],
  'ai-integration': ['ai-core', 'backend-ai', 'backend-core'],
  javascript: ['languages-core', 'languages-frontend', 'frontend-core', 'backend-core'],
  typescript: ['languages-core', 'languages-frontend', 'languages-backend'],
  python: ['languages-core', 'languages-backend', 'backend-core', 'backend-data'],
  java: ['languages-core'],
}

const directCapabilityLinks: Record<string, string[]> = {
  react: ['javascript', 'typescript', 'responsive', 'frontend-backend'],
  nextjs: ['react', 'typescript', 'node-api', 'rest'],
  html: ['css', 'responsive'],
  css: ['html', 'responsive'],
  responsive: ['react', 'css', 'mobile-development'],
  'frontend-backend': ['react', 'rest', 'node-api', 'integration'],
  pwa: ['responsive', 'mobile-development'],
  'node-api': ['javascript', 'typescript', 'rest', 'business-logic'],
  rest: ['frontend-backend', 'mobile-development', 'database-apps'],
  fastapi: ['python', 'rest', 'database-apps'],
  authentication: ['authorization', 'business-logic'],
  authorization: ['authentication', 'business-logic'],
  'business-logic': ['rest', 'database-apps', 'integration'],
  mongodb: ['database-apps', 'node-api'],
  'database-apps': ['mongodb', 'rest', 'business-logic'],
  mysql: ['database-apps'],
  'sql-server': ['database-apps'],
  'mobile-development': ['responsive', 'rest', 'database-apps'],
  'ai-integration': ['rest', 'node-api', 'python'],
  'ai-assisted-development': ['testing', 'debugging', 'integration'],
  git: ['testing', 'deployment'],
  testing: ['debugging', 'deployment', 'hardening'],
  debugging: ['testing', 'troubleshooting', 'hardening'],
  deployment: ['testing', 'hardening', 'git'],
  hardening: ['testing', 'debugging', 'deployment'],
  integration: ['frontend-backend', 'business-logic', 'testing'],
  troubleshooting: ['debugging', 'integration'],
  javascript: ['react', 'node-api'],
  typescript: ['react', 'nextjs', 'node-api'],
  python: ['fastapi', 'rest'],
  java: [],
}

export function createEngineeringSystem(capabilityGroups: CapabilityGroup[]) {
  const groupsById = new Map(capabilityGroups.map((group) => [group.id, group]))
  const groups = engineeringClusterOrder.map((id) => {
    const group = groupsById.get(id)

    if (!group) {
      throw new Error(`Engineering system is missing the required "${id}" group.`)
    }

    return {
      ...group,
      id,
      index: clusterMeta[id].index,
      role: clusterMeta[id].role,
      relationship: clusterMeta[id].relationship,
    } satisfies EngineeringCluster
  })

  const capabilities = groups.flatMap((group) =>
    group.items.map((item) => ({
      ...item,
      clusterId: group.id,
      clusterTitle: group.title,
    })),
  )
  const capabilitiesById = new Map(
    capabilities.map((capability) => [capability.id, capability]),
  )

  return { groups, capabilities, capabilitiesById, paths: engineeringPaths }
}

export function getEngineeringSystemState(
  capabilityId: string | null,
  capabilityGroups: CapabilityGroup[],
): EngineeringSystemState {
  const system = createEngineeringSystem(capabilityGroups)
  const activeCapability = capabilityId
    ? system.capabilitiesById.get(capabilityId) ?? null
    : null

  if (!activeCapability) {
    return {
      activeCapability: null,
      activeClusterIds: new Set(),
      relatedCapabilityIds: new Set(),
      activePathIds: new Set(),
      relationship:
        'My work connects interface, services, data, mobile, AI, languages, and delivery as one software practice.',
    }
  }

  const meta = clusterMeta[activeCapability.clusterId]
  const activePathIds = new Set(pathOverrides[activeCapability.id] ?? meta.pathIds)
  const activeClusterIds = new Set<EngineeringClusterId>([
    activeCapability.clusterId,
  ])

  for (const path of system.paths) {
    if (!activePathIds.has(path.id)) continue
    if (path.from !== 'core') activeClusterIds.add(path.from)
    if (path.to !== 'core') activeClusterIds.add(path.to)
  }

  const relatedCapabilityIds = new Set(directCapabilityLinks[activeCapability.id] ?? [])
  for (const clusterId of activeClusterIds) {
    for (const anchor of clusterMeta[clusterId].anchors) {
      relatedCapabilityIds.add(anchor)
    }
  }
  relatedCapabilityIds.delete(activeCapability.id)

  return {
    activeCapability,
    activeClusterIds,
    relatedCapabilityIds,
    activePathIds,
    relationship: meta.relationship,
  }
}
