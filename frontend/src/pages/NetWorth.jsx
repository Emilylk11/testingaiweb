import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const COLORS = ['#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#58a6ff', '#f0c040', '#ec4899', '#6366f1', '#14b8a6']

export default function NetWorth({ data, onSave }) {
  const [nw, setNw] = useState(data.net_worth)
  const c = data.computed

  const updateAsset = (i, val) => {
    const updated = JSON.parse(JSON.stringify(nw))
    updated.assets[i].value = Number(val)
    setNw(updated)
    onSave('net-worth', updated)
  }

  const updateLiability = (i, val) => {
    const updated = JSON.parse(JSON.stringify(nw))
    updated.liabilities[i].value = Number(val)
    setNw(updated)
    onSave('net-worth', updated)
  }

  const totalAssets = nw.assets.reduce((s, a) => s + a.value, 0)
  const totalLiabilities = nw.liabilities.reduce((s, l) => s + l.value, 0)
  const netWorth = totalAssets - totalLiabilities

  const assetData = nw.assets.filter(a => a.value > 0).map(a => ({ name: a.name, value: a.value }))

  return (
    <div className="page">
      <h1 className="page-title">Net Worth Tracker</h1>

      <div className="stat-row">
        <div className="stat">
          <div className="stat-label">Total Assets</div>
          <div className="stat-value green">{fmt(totalAssets)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Total Liabilities</div>
          <div className="stat-value red">{fmt(totalLiabilities)}</div>
        </div>
        <div className="stat" style={{ borderColor: 'var(--gold)', borderWidth: 2 }}>
          <div className="stat-label">Net Worth</div>
          <div className="stat-value gold" style={{ fontSize: 28 }}>{fmt(netWorth)}</div>
        </div>
      </div>

      <div className="grid-2">
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title green">Assets</div>
            <table>
              <thead>
                <tr><th>Asset</th><th className="num">Value</th><th className="num">% of Total</th></tr>
              </thead>
              <tbody>
                {nw.assets.map((a, i) => (
                  <tr key={a.name}>
                    <td>{a.name}</td>
                    <td className="num">
                      <input type="number" value={a.value} onChange={(e) => updateAsset(i, e.target.value)} />
                    </td>
                    <td className="num" style={{ color: 'var(--green)' }}>
                      {totalAssets > 0 ? ((a.value / totalAssets) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td>TOTAL ASSETS</td>
                  <td className="num" style={{ color: 'var(--green)', fontWeight: 700 }}>{fmt(totalAssets)}</td>
                  <td className="num" style={{ color: 'var(--green)' }}>100%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="card-title red">Liabilities</div>
            <table>
              <thead>
                <tr><th>Liability</th><th className="num">Balance</th></tr>
              </thead>
              <tbody>
                {nw.liabilities.map((l, i) => (
                  <tr key={l.name}>
                    <td>{l.name}</td>
                    <td className="num">
                      <input type="number" value={l.value} onChange={(e) => updateLiability(i, e.target.value)} />
                    </td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td>TOTAL LIABILITIES</td>
                  <td className="num" style={{ color: 'var(--red)', fontWeight: 700 }}>{fmt(totalLiabilities)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title gold">Asset Allocation</div>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie data={assetData} cx="50%" cy="50%" outerRadius={130} dataKey="value"
                  label={({ name, percent }) => `${name.split('/')[0].split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}>
                  {assetData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 16, color: 'var(--gray)', marginBottom: 8 }}>TOTAL NET WORTH</div>
            <div style={{
              fontSize: 48,
              fontWeight: 800,
              color: netWorth >= 0 ? 'var(--gold)' : 'var(--red)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {fmt(netWorth)}
            </div>
            <div style={{ marginTop: 12, fontSize: 14, color: 'var(--gray)' }}>
              Assets: {fmt(totalAssets)} &mdash; Liabilities: {fmt(totalLiabilities)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
