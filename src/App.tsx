import { useState } from 'react'
import Scorer from './Scorer'

const TABS = [{ id: 'scorer', label: 'Scorer' }] as const

type TabId = (typeof TABS)[number]['id']

function App() {
  const [activeTab, setActiveTab] = useState<TabId>(TABS[0].id)

  return (
    <div className="font-sans min-h-screen flex flex-col bg-black text-neutral-100">
      <nav className="flex gap-1 px-3 bg-black border-b border-neutral-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-[18px] py-3 text-[15px] font-medium border-b-[3px] transition-colors ${
              activeTab === tab.id
                ? 'text-amber-400 border-amber-400 font-semibold'
                : 'text-neutral-400 border-transparent hover:text-neutral-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 flex items-center justify-center p-4">
        {activeTab === 'scorer' && <Scorer />}
      </main>
    </div>
  )
}

export default App
