import AiChat from './components/AiChat'
import ChatWidget from './components/ChatWidget'
import Contact from './components/Contact'
import Education from './components/Education'
import Footer from './components/Footer'
import Hero from './components/Hero'
import Navbar from './components/Navbar'
import Projects from './components/Projects'
import Skills from './components/Skills'
import { portfolio } from '../shared/portfolio.ts'

const published = (item) => item.status === 'published'

const assetsById = Object.fromEntries(
  portfolio.assets
    .filter((asset) => asset.status === 'available')
    .map((asset) => [asset.id, asset]),
)

const contactsById = Object.fromEntries(
  portfolio.contact
    .filter((channel) => channel.public && published(channel))
    .map((channel) => [channel.id, channel]),
)

const projects = portfolio.projects.filter(published).map((project) => {
  const preview = project.previewAssetId
    ? assetsById[project.previewAssetId]
    : undefined

  return {
    ...project,
    previewImage: preview?.src,
    previewAlt: preview?.alt,
  }
})

const skillGroups = portfolio.capabilityGroups
  .filter(published)
  .map((group) => ({
    ...group,
    items: group.items.filter(published),
  }))

const featuredTechnologies = skillGroups.flatMap((group) =>
  group.items.filter((item) => item.featured).map((item) => item.label),
)

const navigation = portfolio.navigation.filter(published)
const journey = portfolio.journey.filter(published)
const languages = portfolio.languages.filter(published)
const cvPath = assetsById.cv.src

function App() {
  return (
    <div className="app-shell">
      <Navbar
        identity={portfolio.identity}
        sections={navigation}
        cvPath={cvPath}
      />

      <main className="page-content">
        <Hero
          identity={portfolio.identity}
          contacts={contactsById}
          cvPath={cvPath}
          featuredTechnologies={featuredTechnologies}
        />
        <Projects projects={projects} />
        <Skills skillGroups={skillGroups} languages={languages} />
        <Education journey={journey} />
        <AiChat suggestions={portfolio.assistant.suggestedQuestions} />
        <Contact contacts={contactsById} />
      </main>

      <Footer identity={portfolio.identity} sections={navigation} />
      <ChatWidget name={portfolio.identity.name} />
    </div>
  )
}

export default App
