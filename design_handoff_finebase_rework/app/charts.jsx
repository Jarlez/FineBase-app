// FineBase — SVG charts (donut, bar, area, mini-spark)

const fmtBRL = (n) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtBRLk = (n) => {
  if (Math.abs(n) >= 1000) return 'R$ ' + (n/1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'k';
  return 'R$ ' + n.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
};

// ─── Donut by category ─────────────────────────────────────────────
function Donut({ data, size = 200, total }) {
  const r = size / 2 - 8;
  const cx = size / 2, cy = size / 2;
  const sum = data.reduce((s, d) => s + d.value, 0);
  let acc = -Math.PI / 2;
  const arcs = data.map((d, i) => {
    const ang = (d.value / sum) * Math.PI * 2;
    const a0 = acc, a1 = acc + ang;
    acc = a1;
    const large = ang > Math.PI ? 1 : 0;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const ir = r - 18;
    const ix0 = cx + ir * Math.cos(a1), iy0 = cy + ir * Math.sin(a1);
    const ix1 = cx + ir * Math.cos(a0), iy1 = cy + ir * Math.sin(a0);
    return (
      <path key={i}
        d={`M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L ${ix0} ${iy0} A ${ir} ${ir} 0 ${large} 0 ${ix1} ${iy1} Z`}
        fill={d.color} />
    );
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {arcs}
      <text x={cx} y={cy - 4} textAnchor="middle" style={{ font: '500 11px var(--font-sans)', fill: 'var(--text-3)' }}>Total</text>
      <text x={cx} y={cy + 16} textAnchor="middle" style={{ font: '600 18px var(--font-mono)', fill: 'var(--text)', letterSpacing: '-0.02em' }}>
        {fmtBRLk(total ?? sum)}
      </text>
    </svg>
  );
}

// ─── Bars (monthly) ─────────────────────────────────────────────────
function Bars({ data, height = 180, accent = 'var(--accent)' }) {
  const max = Math.max(...data.map(d => d.value)) * 1.1;
  const w = 400, h = height, pad = 24;
  const bw = (w - pad*2) / data.length * 0.6;
  const gap = (w - pad*2) / data.length;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
      {[0.25, 0.5, 0.75, 1].map((t, i) => (
        <line key={i} x1={pad} x2={w-pad} y1={pad + (h-pad*1.4)*(1-t)} y2={pad + (h-pad*1.4)*(1-t)} stroke="var(--border-soft)" strokeDasharray="2 3"/>
      ))}
      {data.map((d, i) => {
        const x = pad + gap*i + (gap-bw)/2;
        const bh = (d.value / max) * (h - pad*1.4);
        const y = h - pad*0.4 - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} rx="2" fill={d.highlight ? accent : 'var(--text-4)'} opacity={d.highlight ? 1 : 0.35}/>
            <text x={x + bw/2} y={h - 4} textAnchor="middle" style={{ font: '500 9.5px var(--font-mono)', fill: 'var(--text-3)' }}>{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Area (yearly balance line) ─────────────────────────────────────
function Area({ data, height = 180 }) {
  const w = 600, h = height, pad = 16;
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;
  const xs = (i) => pad + (w - pad*2) * (i / (data.length-1));
  const ys = (v) => pad + (h - pad*2) * (1 - (v - min) / range);
  const line = data.map((d, i) => `${i===0?'M':'L'} ${xs(i)} ${ys(d.value)}`).join(' ');
  const area = `${line} L ${xs(data.length-1)} ${h-pad} L ${xs(0)} ${h-pad} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <line key={i} x1={pad} x2={w-pad} y1={pad+(h-pad*2)*t} y2={pad+(h-pad*2)*t} stroke="var(--border-soft)" strokeDasharray="2 3"/>
      ))}
      <path d={area} fill="url(#areaGrad)"/>
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth="1.5"/>
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={xs(i)} cy={ys(d.value)} r="2.2" fill="var(--surface)" stroke="var(--accent)" strokeWidth="1.5"/>
          <text x={xs(i)} y={h-2} textAnchor="middle" style={{ font: '500 9.5px var(--font-mono)', fill: 'var(--text-3)' }}>{d.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── Spark ──────────────────────────────────────────────────────────
function Spark({ data, w = 80, h = 28, color = 'var(--accent)' }) {
  const max = Math.max(...data), min = Math.min(...data), r = max - min || 1;
  const xs = (i) => 1 + (w-2) * (i / (data.length-1));
  const ys = (v) => 2 + (h-4) * (1 - (v-min)/r);
  const pts = data.map((v, i) => `${i===0?'M':'L'} ${xs(i)} ${ys(v)}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={pts} fill="none" stroke={color} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Stacked bar (compare months) ───────────────────────────────────
function StackedBars({ months, categories, height = 180 }) {
  const w = 460, h = height, pad = 24;
  const max = Math.max(...months.map(m => m.values.reduce((a,b)=>a+b, 0))) * 1.1;
  const gap = (w - pad*2) / months.length;
  const bw = gap * 0.55;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
      {[0.25, 0.5, 0.75, 1].map((t, i) => (
        <line key={i} x1={pad} x2={w-pad} y1={pad + (h-pad*1.4)*(1-t)} y2={pad + (h-pad*1.4)*(1-t)} stroke="var(--border-soft)" strokeDasharray="2 3"/>
      ))}
      {months.map((m, mi) => {
        const x = pad + gap*mi + (gap-bw)/2;
        let yCursor = h - pad*0.4;
        return (
          <g key={mi}>
            {m.values.map((v, ci) => {
              const sh = (v/max) * (h - pad*1.4);
              yCursor -= sh;
              return <rect key={ci} x={x} y={yCursor} width={bw} height={sh} fill={categories[ci].color} opacity={0.95}/>;
            })}
            <text x={x + bw/2} y={h - 4} textAnchor="middle" style={{ font: '500 9.5px var(--font-mono)', fill: 'var(--text-3)' }}>{m.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

window.fmtBRL = fmtBRL;
window.fmtBRLk = fmtBRLk;
window.Donut = Donut;
window.Bars = Bars;
window.Area = Area;
window.Spark = Spark;
window.StackedBars = StackedBars;
