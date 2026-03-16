import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const COLORS = ['#8b5cf6', '#34d399', '#fbbf24', '#f87171', '#60a5fa', '#f0c040', '#ec4899']

export default function MonthlyBudget({ data, onSave }) {
  const [budget, setBudget] = useState(data.monthly_budget)
  const c = data.computed

  const updateItem = (catIdx, itemIdx, field, val) => {
    const updated = JSON.parse(JSON.stringify(budget))
    updated.categories[catIdx].items[itemIdx][field] = Number(val)
    setBudget(updated)
    onSave('monthly-budget', updated)
  }

  const updateMonth = (val) => {
    const updated = { ...budget, month: val }
    setBudget(updated)
    onSave('monthly-budget', updated)
  }

  let totalBudgeted = 0, totalActual = 0
  budget.categories.forEach(cat => cat.items.forEach(item => {
    totalBudgeted += item.budgeted
    totalActual += item.actual
  }))

  const sectionData = budget.categories.map((cat) => ({
    name: cat.section,
    value: cat.items.reduce((sum, it) => sum + it.budgeted, 0),
  })).filter(d => d.value > 0)

  const overallPct = totalBudgeted > 0 ? (totalActual / totalBudgeted) : 0

  return (
    <div className="page">
      <h1 className="page-title">Monthly Budget</h1>

      <div className="stat-row">
        <div className="stat">
          <div className="stat-label">Month</div>
          <input
            type="text"
            value={budget.month}
            onChange={(e) => updateMonth(e.target.value)}
            style={{ width: 150, textAlign: 'left', fontSize: 18, fontWeight: 700 }}
          />
        </div>
        <div className="stat">
          <div className="stat-label">Total Budgeted</div>
          <div className="stat-value gold">{fmt(totalBudgeted)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Total Spent</div>
          <div className="stat-value amber">{fmt(totalActual)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Remaining (Income - Spent)</div>
          <div className="stat-value" style={{ color: c.net_plus_grant - totalActual >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {fmt(c.net_plus_grant - totalActual)}
          </div>
        </div>
      </div>

      {/* Overall spending progress */}
      <div className="card" style={{ marginBottom: 24, padding: '16px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
            Overall Budget Usage
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: overallPct > 1 ? 'var(--red)' : overallPct > 0.8 ? 'var(--amber)' : 'var(--green)' }}>
            {(overallPct * 100).toFixed(1)}%
          </span>
        </div>
        <div className="progress-bar" style={{ height: 8 }}>
          <div
            className="progress-fill"
            style={{
              width: `${Math.min(overallPct * 100, 100)}%`,
              background: overallPct > 1 ? 'var(--red)' : overallPct > 0.8 ? 'var(--amber)' : 'var(--green)',
            }}
          />
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title green">Expenses by Category</div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th className="num">Budgeted</th>
                <th className="num">Actual Spent</th>
                <th className="num">Difference</th>
                <th className="num">% Used</th>
              </tr>
            </thead>
            <tbody>
              {budget.categories.map((cat, ci) => (
                <tbody key={cat.section}>
                  <tr>
                    <td colSpan={5} style={{ padding: 0 }}>
                      <div className="section-hdr">{cat.section}</div>
                    </td>
                  </tr>
                  {cat.items.map((item, ii) => {
                    const diff = item.budgeted - item.actual
                    const pctUsed = item.budgeted > 0 ? item.actual / item.budgeted : 0
                    return (
                      <tr key={item.name}>
                        <td style={{ fontWeight: 500 }}>{item.name}</td>
                        <td className="num">
                          <div className="budget-input-group">
                            <input
                              type="number"
                              value={item.budgeted}
                              onChange={(e) => updateItem(ci, ii, 'budgeted', e.target.value)}
                              placeholder="Budget"
                              title="Budgeted amount for this item"
                            />
                          </div>
                        </td>
                        <td className="num">
                          <div className="budget-input-group">
                            <input
                              type="number"
                              value={item.actual}
                              onChange={(e) => updateItem(ci, ii, 'actual', e.target.value)}
                              placeholder="Actual"
                              title="Actual amount spent"
                            />
                          </div>
                        </td>
                        <td className="num" style={{ color: diff >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                          {diff >= 0 ? '+' : ''}{fmt(diff)}
                        </td>
                        <td className="num">
                          <span style={{
                            color: pctUsed > 1 ? 'var(--red)' : pctUsed > 0.8 ? 'var(--amber)' : 'var(--green)',
                            fontWeight: 600,
                          }}>
                            {(pctUsed * 100).toFixed(1)}%
                          </span>
                          <div className="util-bar">
                            <div
                              className="util-fill"
                              style={{
                                width: `${Math.min(pctUsed * 100, 100)}%`,
                                background: pctUsed > 1 ? 'var(--red)' : pctUsed > 0.8 ? 'var(--amber)' : 'var(--green)',
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              ))}
              <tr className="total-row">
                <td style={{ fontWeight: 700 }}>GRAND TOTAL</td>
                <td className="num" style={{ color: 'var(--gold)', fontWeight: 700 }}>{fmt(totalBudgeted)}</td>
                <td className="num" style={{ color: 'var(--gold)', fontWeight: 700 }}>{fmt(totalActual)}</td>
                <td className="num" style={{ color: totalBudgeted - totalActual >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>
                  {totalBudgeted - totalActual >= 0 ? '+' : ''}{fmt(totalBudgeted - totalActual)}
                </td>
                <td className="num" style={{ color: 'var(--gold)', fontWeight: 700 }}>
                  {totalBudgeted > 0 ? ((totalActual / totalBudgeted) * 100).toFixed(1) : 0}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-title amber">Budget Allocation</div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={sectionData} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value" paddingAngle={2}
                  label={({ name, percent }) => `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}>
                  {sectionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: 'var(--tooltip-bg)', border: '1px solid var(--border)', borderRadius: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="card-title">Summary</div>
            <table>
              <tbody>
                <tr>
                  <td style={{ color: 'var(--text-secondary)' }}>Net Monthly Income (+ Grant)</td>
                  <td className="num" style={{ color: 'var(--green)', fontWeight: 700 }}>{fmt(c.net_plus_grant)}</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--text-secondary)' }}>Monthly Savings</td>
                  <td className="num" style={{ color: 'var(--amber)', fontWeight: 700 }}>{fmt(c.total_savings_monthly)}</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--text-secondary)' }}>Total Actual Spending</td>
                  <td className="num" style={{ fontWeight: 700 }}>{fmt(totalActual)}</td>
                </tr>
                <tr className="total-row">
                  <td style={{ fontWeight: 700 }}>Remaining After All</td>
                  <td className="num" style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 18 }}>
                    {fmt(c.net_plus_grant - c.total_savings_monthly - totalActual)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
