import AiChat from './components/AiChat'
import ChatWidget from './components/ChatWidget'
import SiteHeader from './components/navigation/SiteHeader'
import ContactSection from './sections/ContactSection'
import CredentialsSection from './sections/CredentialsSection'
import EngineeringStackSection from './sections/EngineeringStackSection'
import HeroSection from './sections/HeroSection'
import JourneySection from './sections/JourneySection'
import PlanifySection from './sections/PlanifySection'
import SelectedWorkSection from './sections/SelectedWorkSection'
import SiteFooter from './sections/SiteFooter'
import { portfolio } from '../shared/portfolio.ts'

const published = (item) => item.status === 'published'

const assetsById = Object.fromEntries(
  portfolio.assets
    .filter((asset) => asset.status === 'available')
    .map((asset) => [asset.id, asset]),
)

const projects = portfolio.projects.filter(published).map((project) => {
  const preview = project.previewAssetId
    ? assetsById[project.previewAssetId]
    : undefined

  return {
    ...project,
    previewImage: preview?.src,
    previewAlt: preview?.alt,
    previewWidth: preview?.width,
    previewHeight: preview?.height,
  }
})

const featuredProject = projects.find((project) => project.featured)
const selectedProjects = projects.filter((project) => !project.featured)
const capabilityGroups = portfolio.capabilityGroups
  .filter(published)
  .map((group) => ({
    ...group,
    items: group.items.filter(published),
  }))
const navigation = portfolio.navigation.filter(published)
const journey = portfolio.journey.filter(published)
const credentials = portfolio.credentials.filter(published)
const contacts = portfolio.contact.filter(
  (channel) => channel.public && published(channel),
)
const cvPath = assetsById.cv.src

function App() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SiteHeader identity={portfolio.identity} sections={navigation} cvPath={cvPath} />

      <main id="main-content" className="page-content" tabIndex={-1}>
        <HeroSection identity={portfolio.identity} cvPath={cvPath} />
        <PlanifySection project={featuredProject} />
        <SelectedWorkSection projects={selectedProjects} />
        <EngineeringStackSection capabilityGroups={capabilityGroups} />
        <JourneySection journey={journey} />
        <CredentialsSection credentials={credentials} />
        <AiChat suggestions={portfolio.assistant.suggestedQuestions} />
        <ContactSection contacts={contacts} />
      </main>

      <SiteFooter identity={portfolio.identity} sections={navigation} />
      <ChatWidget name={portfolio.identity.name} />
    </div>
  )
}

export default App
