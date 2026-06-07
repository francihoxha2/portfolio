import AiChat from './components/AiChat'
import ChatWidget from './components/ChatWidget'
import Contact from './components/Contact'
import Education from './components/Education'
import Footer from './components/Footer'
import Hero from './components/Hero'
import Navbar from './components/Navbar'
import Projects from './components/Projects'
import Skills from './components/Skills'

const profile = {
  name: 'Franci Hoxha',
  title: 'Junior Full-Stack Developer',
  location: 'Tirana, Albania',
  email: 'francihoxha@yahoo.com',
  phone: '+355 69 253 8842',
  linkedin: 'https://www.linkedin.com/in/franci-hoxha-78a174329/',
  cvPath: '/Franci-Hoxha-CV.pdf',
  summary:
    'I build real-world web platforms with React, Next.js, Node.js, and modern product-focused engineering.',
  about:
    'I enjoy turning practical business problems into clean, usable, and deployment-ready digital solutions. I am currently pursuing an MSc in Informatics Engineering while growing through hands-on full-stack product development, responsive UI work, API-driven features, and product ownership.',
}

const skillGroups = [
  {
    title: 'Frontend',
    items: ['React', 'Next.js', 'JavaScript', 'HTML & CSS', 'Responsive UI', 'PWA'],
  },
  {
    title: 'Backend',
    items: [
      'Node.js',
      'REST APIs',
      'Authentication & Authorization',
      'Business Logic',
      'Reminder Workflows',
    ],
  },
  {
    title: 'Databases & Tools',
    items: ['MongoDB', 'MySQL', 'SQL Server', 'GitHub', 'Vercel'],
  },
]

const projects = [
  {
    title: 'Planify.al',
    description:
      'Planify.al is a full-stack booking and business management platform for service-based businesses, featuring online appointments, staff and customer management, analytics dashboards, booking reminders, geolocation-based discovery, public business profiles, payment status management, and PWA support.',
    link: 'https://planify.al',
    category: 'Booking Platform',
    stack: ['Next.js', 'React', 'Node.js', 'MongoDB', 'Vercel'],
    featured: true,
    previewImage: `${import.meta.env.BASE_URL}planify-preview.png`,
    previewAlt: 'Planify business analytics dashboard preview',
    previewPosition: '48% 8%',
    highlights: [
      'End-to-end product development',
      'UI/UX and responsive booking flows',
      'API-driven functionality and booking logic',
      'Authentication and role-based areas',
      'Analytics dashboards and reminder workflows',
      'PWA behavior and deployment-ready architecture',
    ],
  },
  {
    title: 'BarberSpot.al',
    description:
      'A focused booking platform for barber shops that supports appointment scheduling, staff workflows, reminders, customer communication, and business analytics for day-to-day service operations.',
    link: 'https://barberspot.al',
    category: 'Booking Platform',
    stack: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
    highlights: [
      'Role-based staff management',
      'Appointment scheduling and reminders',
      'WhatsApp and SMS communication flows',
      'Business analytics for service teams',
    ],
  },
  {
    title: 'Online Charging Station Management System',
    description:
      'A reservation and management system for electric vehicle charging stations in Albania, focused on user management, reservation flows, and database integration for daily operations.',
    link: '#contact',
    category: 'Web Application',
    stack: ['JavaScript', 'Node.js', 'Database Design'],
  },
]

const education = [
  {
    period: '2024 - Present',
    title: 'Master of Science in Informatics Engineering',
    organization: 'European University of Tirana (UET)',
    location: 'Tirana, Albania',
  },
  {
    period: '2015 - 2017',
    title: "Master's Degree in Business Administration",
    organization: 'Fan S. Noli University',
    location: 'Korce, Albania',
  },
]

const experience = [
  {
    period: '2021 - 2025',
    title: 'Computer Technician & IT Support',
    organization: 'Technical Support and Systems Operations',
    description:
      'Supported business users and systems across Windows, macOS, and Linux environments while building a strong foundation in troubleshooting, reliability, documentation, and operational thinking that now supports my software development work.',
  },
]

const courses = [
  'Software Professional Course',
  'IT Hardware Support and IT Operation Systems',
]

const languages = ['English', 'Italian']

const sections = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Education', href: '#education' },
  { label: 'Projects', href: '#projects' },
  { label: 'Ask AI', href: '#ai-chat' },
  { label: 'Contact', href: '#contact' },
]

function App() {
  return (
    <div className="app-shell">
      <Navbar sections={sections} />

      <main className="page-content">
        <Hero profile={profile} />
        <Skills skillGroups={skillGroups} languages={languages} />
        <Education
          education={education}
          experience={experience}
          courses={courses}
        />
        <Projects projects={projects} />
        <AiChat />
        <Contact profile={profile} />
      </main>

      <Footer name={profile.name} />
      <ChatWidget />
    </div>
  )
}

export default App
