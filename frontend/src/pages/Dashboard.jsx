import { useState } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const pct = (n) => (n * 100).toFixed(1) + '%'
const COLORS = ['#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#58a6ff']

export default function Dashboard({ data, onSave }) {
  const [income, setIncome] = useState(data.income)
  const [savings, setSavings] = useState(data.savings_allocation)
  const [goals, setGoals] = useState(data.savings_goals)
  const c = data.computed

  const updateIncome = (key, val) => {
    const updated = { ...income, [key]: Number(val) }
    setIncome(updated)
    onSave('income', updated)
  }

  const updateSavings = (i, val) => {
    const updated = [...savings]
    updated[i] = { ...updated[i], monthly: Number(val) }
    setSavings(updated)
    onSave('savings-allocation', updated)
  }

  const updateGoal = (i, field, val) => {
    const updated = [...goals]
    updated[i] = { ...updated[i], [field]: Number(val) }
    setGoals(updated)
    onSave('savings-goals', updated)
  }

  const pieData = savings.map(s => ({ name: s.category, value: s.monthly }))
  const goalData = goals.map(g => ({
    name: g.category.replace(' Fund', '').replace(' Down Payment', ' DP'),
    progress: g.target > 0 ? Math.min(g.saved / g.target, 1) * 100 : 0,
    saved: g.saved,
    target: g.target,
  }))

  return (
    <div className="page">
      <h1 className="page-title">Personal Budget Dashboard</h1>

      <div className="stat-row">
        <div className="stat">
          <div className="stat-label">Net Monthly Income</div>
          <div className="stat-value gold">{fmt(c.net_monthly)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Net + Grant</div>
          <div className="stat-value green">{fmt(c.net_plus_grant)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Total Savings</div>
          <div className="stat-value amber">{fmt(c.total_savings_monthly)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Remaining for Living</div>
          <div className="stat-value" style={{ color: c.remaining_for_living >= 0 ? '#10b981' : '#ef4444' }}>
            {fmt(c.remaining_for_living)}
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Left column */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">Income Assumptions</div>
            <table>
              <tbody>
                {[
                  ['Annual Gross Salary', 'annual_salary', income.annual_salary],
                  ['Pay Frequency (periods/yr)', 'pay_frequency', income.pay_frequency],
                  ['Savings per Paycheck', 'savings_per_paycheck', income.savings_per_paycheck],
                  ['Tulsa Remote Grant (annual)', 'tulsa_grant_annual', income.tulsa_grant_annual],
                  ['OK State Tax Rate', 'state_tax_rate', income.state_tax_rate],
                  ['Federal Effective Tax Rate', 'federal_tax_rate', income.federal_tax_rate],
                ].map(([label, key, val]) => (
                  <tr key={key}>
                    <td>{label}</td>
                    <td className="num">
                      <input
                        type="number"
                        step={key.includes('rate') ? 0.001 : 1}
                        value={val}
                        onChange={(e) => updateIncome(key, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">Income Summary (Monthly)</div>
            <table>
              <tbody>
                {[
                  ['Gross Monthly Income', fmt(c.gross_monthly)],
                  ['Federal Tax', '-' + fmt(c.federal_tax)],
                  ['State Tax', '-' + fmt(c.state_tax)],
                  ['Net Take-Home', fmt(c.net_monthly), 'gold'],
                  ['Grant (monthly)', fmt(c.grant_monthly)],
                  ['Net + Grant', fmt(c.net_plus_grant), 'green'],
                ].map(([label, val, color]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    <td className="num" style={color ? { color: `var(--${color})`, fontWeight: 700 } : {}}>
                      {val}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="card-title">Monthly Savings Allocation</div>
            <table>
              <thead>
                <tr><th>Category</th><th className="num">Monthly</th><th className="num">Annual</th><th className="num">% Income</th></tr>
              </thead>
              <tbody>
                {savings.map((s, i) => (
                  <tr key={s.category}>
                    <td>{s.category}</td>
                    <td className="num">
                      <input type="number" value={s.monthly} onChange={(e) => updateSavings(i, e.target.value)} />
                    </td>
                    <td className="num">{fmt(s.monthly * 12)}</td>
                    <td className="num">{c.net_monthly > 0 ? pct(s.monthly / c.net_monthly) : '0%'}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td>Total</td>
                  <td className="num" style={{ color: 'var(--gold)' }}>{fmt(c.total_savings_monthly)}</td>
                  <td className="num" style={{ color: 'var(--gold)' }}>{fmt(c.total_savings_monthly * 12)}</td>
                  <td className="num" style={{ color: 'var(--gold)' }}>
                    {c.net_monthly > 0 ? pct(c.total_savings_monthly / c.net_monthly) : '0%'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title amber">Savings Breakdown</div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title green">Savings Goals Progress</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={goalData} layout="vertical" margin={{ left: 60 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#8b949e', fontSize: 12 }} tickFormatter={v => v + '%'} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#fff', fontSize: 12 }} width={80} />
                <Tooltip
                  formatter={(v) => v.toFixed(1) + '%'}
                  contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8 }}
                />
                <Bar dataKey="progress" radius={[0, 4, 4, 0]}>
                  {goalData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="card-title green">Savings Goals Tracker</div>
            <table>
              <thead>
                <tr><th>Bucket</th><th className="num">Target</th><th className="num">Saved</th><th className="num">Progress</th></tr>
              </thead>
              <tbody>
                {goals.map((g, i) => {
                  const progress = g.target > 0 ? g.saved / g.target : 0
                  const monthsLeft = savings[i] && savings[i].monthly > 0
                    ? Math.max(0, (g.target - g.saved) / savings[i].monthly)
                    : null
                  return (
                    <tr key={g.category}>
                      <td>{g.category}</td>
                      <td className="num">
                        <input type="number" value={g.target} onChange={(e) => updateGoal(i, 'target', e.target.value)} />
                      </td>
                      <td className="num">
                        <input type="number" value={g.saved} onChange={(e) => updateGoal(i, 'saved', e.target.value)} />
                      </td>
                      <td className="num">
                        <div style={{ color: progress >= 1 ? 'var(--green)' : 'var(--amber)', fontWeight: 700 }}>
                          {pct(Math.min(progress, 1))}
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{
                            width: `${Math.min(progress, 1) * 100}%`,
                            background: progress >= 1 ? 'var(--green)' : COLORS[i % COLORS.length],
                          }} />
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--gray)', marginTop: 2 }}>
                          {progress >= 1 ? 'Done!' : monthsLeft !== null ? `${monthsLeft.toFixed(1)} months left` : 'N/A'}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
