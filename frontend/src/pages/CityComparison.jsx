import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function CityComparison({ data, onSave }) {
  const [cities, setCities] = useState(data.city_comparison)

  const updateCity = (i, city, val) => {
    const updated = [...cities]
    updated[i] = { ...updated[i], [city]: Number(val) }
    setCities(updated)
    onSave('city-comparison', updated)
  }

  const getBest = (row) => {
    const vals = [
      { city: 'Dallas', val: row.dallas },
      { city: 'Tulsa', val: row.tulsa },
      { city: 'NW Arkansas', val: row.nw_arkansas },
    ]
    return vals.reduce((a, b) => a.val <= b.val ? a : b).city
  }

  // Build effective rent row
  const rentRow = cities.find(c => c.category === 'Rent (1BR)')
  const grantRow = cities.find(c => c.category === 'Grant Offset')
  const effectiveRent = rentRow && grantRow ? {
    category: 'Effective Rent',
    dallas: rentRow.dallas + grantRow.dallas,
    tulsa: rentRow.tulsa + grantRow.tulsa,
    nw_arkansas: rentRow.nw_arkansas + grantRow.nw_arkansas,
  } : null

  // Chart data (exclude tax rate and avg home price for bar chart)
  const chartCategories = cities.filter(c =>
    !c.category.includes('Tax') && !c.category.includes('Home Price') && !c.category.includes('Grant')
  )
  const chartData = chartCategories.map(c => ({
    category: c.category.length > 15 ? c.category.substring(0, 12) + '...' : c.category,
    Dallas: c.dallas,
    Tulsa: c.tulsa,
    'NW Arkansas': c.nw_arkansas,
  }))

  // Monthly total
  const costCategories = cities.filter(c =>
    !c.category.includes('Tax') && !c.category.includes('Home Price')
  )
  const totals = {
    dallas: costCategories.reduce((s, c) => s + c.dallas, 0),
    tulsa: costCategories.reduce((s, c) => s + c.tulsa, 0),
    nw_arkansas: costCategories.reduce((s, c) => s + c.nw_arkansas, 0),
  }

  return (
    <div className="page">
      <h1 className="page-title">City Cost-of-Living Comparison</h1>

      <div className="stat-row">
        {[
          { label: 'Dallas Monthly', val: totals.dallas, color: '' },
          { label: 'Tulsa Monthly', val: totals.tulsa, color: 'green' },
          { label: 'NW Arkansas Monthly', val: totals.nw_arkansas, color: '' },
        ].map(s => (
          <div className="stat" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-value ${s.color}`}>{fmt(s.val)}</div>
          </div>
        ))}
        <div className="stat">
          <div className="stat-label">Tulsa Savings vs Dallas</div>
          <div className="stat-value green">{fmt(totals.dallas - totals.tulsa)}/mo</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title red">Cost Comparison Chart</div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <XAxis dataKey="category" tick={{ fill: '#8b949e', fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis tick={{ fill: '#8b949e', fontSize: 12 }} tickFormatter={(v) => '$' + v} />
            <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, color: '#fff' }} />
            <Legend />
            <Bar dataKey="Dallas" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Tulsa" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="NW Arkansas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <div className="card-title red">Detailed Comparison</div>
        <table>
          <thead>
            <tr><th>Category</th><th className="num">Dallas</th><th className="num">Tulsa</th><th className="num">NW Arkansas</th><th>Best</th></tr>
          </thead>
          <tbody>
            {cities.map((row, i) => {
              const best = getBest(row)
              const isTax = row.category.includes('Tax')
              const isHome = row.category.includes('Home')
              const fmtVal = (v) => isTax ? (v * 100).toFixed(2) + '%' : isHome ? '$' + v.toLocaleString() : fmt(v)
              return (
                <tr key={row.category}>
                  <td>{row.category}</td>
                  {['dallas', 'tulsa', 'nw_arkansas'].map(city => (
                    <td key={city} className="num">
                      <input
                        type="number"
                        step={isTax ? 0.001 : 1}
                        value={row[city]}
                        onChange={(e) => updateCity(i, city, e.target.value)}
                        style={best.toLowerCase().replace(' ', '_') === city ? { borderColor: 'var(--green)', color: 'var(--green)' } : {}}
                      />
                    </td>
                  ))}
                  <td><span className="badge green">{best}</span></td>
                </tr>
              )
            })}
            {effectiveRent && (
              <tr className="total-row">
                <td>{effectiveRent.category}</td>
                <td className="num">{fmt(effectiveRent.dallas)}</td>
                <td className="num" style={{ color: 'var(--green)', fontWeight: 700 }}>{fmt(effectiveRent.tulsa)}</td>
                <td className="num">{fmt(effectiveRent.nw_arkansas)}</td>
                <td><span className="badge green">{getBest(effectiveRent)}</span></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
