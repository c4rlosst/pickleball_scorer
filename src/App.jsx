import { useState } from 'react'
import './App.css'

const TABS = [
  { id: 'hello', label: 'Hello World' },
]

function App() {
  const [activeTab, setActiveTab] = useState(TABS[0].id)

  return (
    <div className="app">
      <nav className="tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab-button${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="tab-content">
        {activeTab === 'hello' && <h1>Hello World</h1>}
      </main>
    </div>
  )
}

export default App
