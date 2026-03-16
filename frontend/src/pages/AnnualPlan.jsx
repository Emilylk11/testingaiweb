import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
const COLORS = ['#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#58a6ff']

export default function AnnualPlan({ data }) {
  const savings = data.savings_allocation
  const grantMonthly = data.computed.grant_monthly

  // Build projection data
  const projectionData = MONTHS.map((month, mi) => {
    const entry = { month }
    let total = 0
    savings.forEach((s, i) => {
      const cumulative = s.monthly * (mi + 1)
      entry[s.category] = cumulative
      total += cumulative
    })
    entry.cumulative = total
    return entry
  })

  const yearlyTotal = savings.reduce((sum, s) => sum + s.monthly * 12, 0)

  return (
    <div className="page">
      <h1 className="page-title">12-Month Savings Projection</h1>

      <div className="stat-row">
        <div className="stat">
          <div className="stat-label">Monthly Savings Total</div>
          <div className="stat-value gold">{fmt(data.computed.total_savings_monthly)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Projected Annual Savings</div>
          <div className="stat-value green">{fmt(yearlyTotal)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Grant Applied (annual)</div>
          <div className="stat-value amber">{fmt(grantMonthly * 12)}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title amber">Cumulative Savings Growth</div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={projectionData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
            <XAxis dataKey="month" tick={{ fill: '#8b949e', fontSize: 12 }} />
            <YAxis tick={{ fill: '#8b949e', fontSize: 12 }} tickFormatter={(v) => '$' + (v / 1000).toFixed(0) + 'k'} />
            <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, color: '#fff' }} />
            {savings.map((s, i) => (
              <Area key={s.category} type="monotone" dataKey={s.category}
                stackId="1" fill={COLORS[i]} stroke={COLORS[i]} fillOpacity={0.6} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Monthly Savings Breakdown</div>
          <table>
            <thead>
              <tr>
                <th>Savings Bucket</th>
                {MONTHS.map(m => <th key={m} className="num">{m}</th>)}
              </tr>
            </thead>
            <tbody>
              {savings.map((s, i) => (
                <tr key={s.category}>
                  <td style={{ whiteSpace: 'nowrap' }}>{s.category}</td>
                  {MONTHS.map((_, mi) => (
                    <td key={mi} className="num">{fmt(s.monthly)}</td>
                  ))}
                </tr>
              ))}
              <tr className="total-row">
                <td>Monthly Total</td>
                {MONTHS.map((_, mi) => (
                  <td key={mi} className="num" style={{ color: 'var(--gold)' }}>
                    {fmt(data.computed.total_savings_monthly)}
                  </td>
                ))}
              </tr>
              <tr className="total-row">
                <td>Cumulative</td>
                {MONTHS.map((_, mi) => (
                  <td key={mi} className="num" style={{ color: 'var(--gold)' }}>
                    {fmt(data.computed.total_savings_monthly * (mi + 1))}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-title green">Tulsa Remote Grant Allocation</div>
          <table>
            <thead>
              <tr><th>Month</th><th className="num">Grant Applied to Rent</th><th className="num">Cumulative</th></tr>
            </thead>
            <tbody>
              {MONTHS.map((m, i) => (
                <tr key={m}>
                  <td>{m}</td>
                  <td className="num" style={{ color: 'var(--green)' }}>{fmt(grantMonthly)}</td>
                  <td className="num" style={{ color: 'var(--green)' }}>{fmt(grantMonthly * (i + 1))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
