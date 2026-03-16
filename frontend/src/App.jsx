import { useState, useEffect, useCallback } from 'react'
import './index.css'
import Dashboard from './pages/Dashboard'
import MonthlyBudget from './pages/MonthlyBudget'
import AnnualPlan from './pages/AnnualPlan'
import CityComparison from './pages/CityComparison'
import NetWorth from './pages/NetWorth'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', color: 'purple' },
  { id: 'budget', label: 'Monthly Budget', color: 'green' },
  { id: 'annual', label: 'Annual Plan', color: 'amber' },
  { id: 'city', label: 'City Comparison', color: 'red' },
  { id: 'networth', label: 'Net Worth', color: 'gold' },
]

function App() {
  const [tab, setTab] = useState('dashboard')
  const [data, setData] = useState(null)
  const [saveMsg, setSaveMsg] = useState(false)

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/data')
    setData(await res.json())
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const saveAndRefresh = async (endpoint, body) => {
    await fetch(`/api/${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSaveMsg(true)
    setTimeout(() => setSaveMsg(false), 2000)
    fetchData()
  }

  const handleExport = () => {
    window.open('/api/export', '_blank')
  }

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    await fetch('/api/import', { method: 'POST', body: form })
    fetchData()
    e.target.value = ''
  }

  if (!data) return <div style={{ padding: 40, textAlign: 'center', color: '#8b949e' }}>Loading...</div>

  return (
    <>
      <div className="toolbar">
        <span className="title">Budget Tracker</span>
        <span className={`save-msg ${saveMsg ? 'show' : ''}`}>Saved</span>
        <label className="btn btn-green" style={{ cursor: 'pointer' }}>
          Import .xlsx
          <input type="file" accept=".xlsx" onChange={handleImport} style={{ display: 'none' }} />
        </label>
        <button className="btn btn-purple" onClick={handleExport}>Export .xlsx</button>
      </div>
      <div className="tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? 'active' : ''}`}
            data-color={t.color}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'dashboard' && <Dashboard data={data} onSave={saveAndRefresh} />}
      {tab === 'budget' && <MonthlyBudget data={data} onSave={saveAndRefresh} />}
      {tab === 'annual' && <AnnualPlan data={data} />}
      {tab === 'city' && <CityComparison data={data} onSave={saveAndRefresh} />}
      {tab === 'networth' && <NetWorth data={data} onSave={saveAndRefresh} />}
    </>
  )
}

export default App
