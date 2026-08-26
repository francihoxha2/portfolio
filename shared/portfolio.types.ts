export type PublicationStatus = 'published' | 'draft' | 'hidden'

export type VerificationStatus =
  | 'confirmed'
  | 'repository-current'
  | 'needs-confirmation'

export type CapabilityProminence = 'primary' | 'supporting' | 'secondary'

export interface PortfolioIdentity {
  name: string
  title: string
  heroStatement: string
  capabilityLine: string
  summary: string
}

export interface PortfolioMetadata {
  title: string
  description: string
}

export interface NavigationItem {
  id: string
  label: string
  href: `#${string}`
  status: PublicationStatus
}

export interface ContactChannel {
  id: 'email' | 'phone' | 'location' | 'linkedin'
  label: string
  value: string
  href?: string
  public: boolean
  assistantVisible: boolean
  status: PublicationStatus
  verificationStatus: VerificationStatus
}

export interface PublicAsset {
  id: string
  status: 'available' | 'planned'
  src?: `/${string}`
  plannedPath?: `public/${string}`
  alt?: string
  width?: number
  height?: number
}

export interface PublicLink {
  label: string
  href: string
  external: boolean
  status: PublicationStatus
  verificationStatus: VerificationStatus
}

export interface PortfolioProject {
  id: string
  title: string
  category: string
  label?: string
  description: string
  featured: boolean
  previewAssetId?: string
  previewPosition?: string
  link?: PublicLink
  stack: string[]
  highlights: string[]
  status: PublicationStatus
  verificationStatus: VerificationStatus
}

export interface CapabilityItem {
  id: string
  label: string
  prominence: CapabilityProminence
  featured: boolean
  evidence?: string
  status: PublicationStatus
  verificationStatus: VerificationStatus
}

export interface CapabilityGroup {
  id: string
  title: string
  items: CapabilityItem[]
  status: PublicationStatus
}

export interface JourneyEntry {
  id: string
  kind: 'education' | 'experience'
  period?: string
  title: string
  organization?: string
  location?: string
  description?: string
  status: PublicationStatus
  verificationStatus: VerificationStatus
}

export interface Credential {
  id: string
  title: string
  provider: string
  instructors: string[]
  completedOn: `${number}-${number}-${number}`
  durationHours: number
  verificationUrl?: string
  asset: PublicAsset
  status: PublicationStatus
  verificationStatus: VerificationStatus
}

export interface Language {
  id: string
  label: string
  proficiency?: string
  status: PublicationStatus
  verificationStatus: VerificationStatus
}

export interface Availability {
  statement: string
  status: PublicationStatus
  verificationStatus: VerificationStatus
}

export interface AssistantContent {
  suggestedQuestions: string[]
}

export interface PortfolioData {
  identity: PortfolioIdentity
  metadata: PortfolioMetadata
  navigation: NavigationItem[]
  contact: ContactChannel[]
  projects: PortfolioProject[]
  capabilityGroups: CapabilityGroup[]
  journey: JourneyEntry[]
  credentials: Credential[]
  languages: Language[]
  availability: Availability | null
  assets: PublicAsset[]
  assistant: AssistantContent
}
