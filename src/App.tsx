import { useState } from 'react'
import Scorer from './Scorer'
import Watch from './Watch'
import About from './About'
import Privacy from './Privacy'

const TABS = [
  { id: 'scorer', label: 'Scorer' },
  { id: 'watch', label: 'Display' },
] as const

type TabId = (typeof TABS)[number]['id']
type Page = 'about' | 'privacy' | null

function App() {
  const [activeTab, setActiveTab] = useState<TabId>(TABS[0].id)
  const [page, setPage] = useState<Page>(null)

  return (
    <div className="font-sans min-h-screen flex flex-col bg-black text-neutral-100">
      <nav className="flex gap-1 px-3 bg-black border-b border-neutral-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setPage(null)
              setActiveTab(tab.id)
            }}
            className={`px-[18px] py-3 text-[15px] font-medium border-b-[3px] transition-all duration-200 active:scale-95 ${
              page === null && activeTab === tab.id
                ? 'text-amber-400 border-amber-400 font-semibold'
                : 'text-neutral-400 border-transparent hover:text-neutral-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 flex items-center justify-center p-4">
        {page === 'about' && <About onBack={() => setPage(null)} />}
        {page === 'privacy' && <Privacy onBack={() => setPage(null)} />}
        {page === null && activeTab === 'scorer' && <Scorer />}
        {page === null && activeTab === 'watch' && <Watch />}
      </main>

      <footer className="flex items-center justify-center gap-4 py-3 border-t border-neutral-900 text-xs text-neutral-500">
        <button
          type="button"
          onClick={() => setPage('about')}
          className="hover:text-neutral-300 transition-colors duration-150"
        >
          About
        </button>
        <span className="text-neutral-700">·</span>
        <button
          type="button"
          onClick={() => setPage('privacy')}
          className="hover:text-neutral-300 transition-colors duration-150"
        >
          Privacy Policy
        </button>
      </footer>
    </div>
  )
}

export default App
