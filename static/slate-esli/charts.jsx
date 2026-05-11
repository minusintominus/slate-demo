// Slate — chart primitives (small, hand-rolled SVG)

const Charts = {};

Charts.LineChart = ({ series, height = 220, showAxis = true, annotation, annotationData, xAxisTicks, yMin: yMinProp, yMax: yMaxProp }) => {
  // series: [{ name, color, points: [y...], dashed?: bool }]
  // xAxisTicks: [{ index, label }] — indices align with series point indices
  const hasX = xAxisTicks && xAxisTicks.length > 0;
  const w = 800, h = height, pad = { l: 8, r: 8, t: 14, b: hasX ? 34 : 22 };
  const all = series.flatMap(s => s.points);
  const min = yMinProp != null ? yMinProp : Math.min(...all);
  const max = yMaxProp != null ? yMaxProp : Math.max(...all);
  const range = max - min || 1;
  const nPts = Math.max(2, series[0].points.length);
  const stepX = (w - pad.l - pad.r) / (nPts - 1);
  const yPx = v => pad.t + (h - pad.t - pad.b) * (1 - (v - min) / range);

  const path = pts => pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${pad.l + i * stepX} ${yPx(p)}`).join(' ');

  let ann = null;
  if (annotationData && series.length) {
    const si = annotationData.seriesIndex;
    const s = series[si];
    if (s && s.points && s.points.length) {
      const pi = Math.max(0, Math.min(annotationData.pointIndex, s.points.length - 1));
      const cx = pad.l + pi * stepX;
      const cy = yPx(s.points[pi]);
      const color = annotationData.color || 'var(--neg)';
      ann = { x: cx, y: cy, label: annotationData.label, color };
    }
  } else if (annotation) {
    ann = {
      x: annotation.x,
      y: annotation.y,
      label: annotation.label,
      color: annotation.color || 'var(--neg)',
    };
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: h }} preserveAspectRatio="none">
      {showAxis && [0, 0.25, 0.5, 0.75, 1].map(t => {
        const y = pad.t + (h - pad.t - pad.b) * t;
        return <line key={t} x1={pad.l} y1={y} x2={w - pad.r} y2={y} stroke="var(--rule)" strokeWidth="1" strokeDasharray={t === 1 ? '0' : '2 4'} />;
      })}
      {series.map((s, i) => (
        <path key={i} d={path(s.points)} fill="none" stroke={s.color || 'var(--ink)'} strokeWidth={s.width || 1.75} strokeDasharray={s.dashed ? '4 4' : '0'} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {ann && ann.label ? (
        <g>
          <circle cx={ann.x} cy={ann.y} r="4" fill={ann.color} />
          <line x1={ann.x} y1={ann.y} x2={ann.x + 14} y2={ann.y - 14} stroke={ann.color} strokeWidth="1" />
          <text x={ann.x + 18} y={ann.y - 12} fontFamily="var(--font-mono)" fontSize="10" fill={ann.color}>{ann.label}</text>
        </g>
      ) : null}
      {hasX && xAxisTicks.map(tk => {
        const idx = Math.max(0, Math.min(nPts - 1, tk.index));
        const x = pad.l + idx * stepX;
        return (
          <text key={`${idx}-${tk.label}`} x={x} y={h - 8} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--ink-3)">
            {tk.label}
          </text>
        );
      })}
    </svg>
  );
};

Charts.Spark = ({ points, height = 36, color = 'var(--ink)', fill = false }) => {
  const w = 100, h = height;
  const min = Math.min(...points), max = Math.max(...points), r = max - min || 1;
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i/(points.length-1))*w} ${h - ((p - min)/r)*h*0.9 - 1}`).join(' ');
  const fillPath = fill ? `${path} L ${w} ${h} L 0 ${h} Z` : null;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: h }} preserveAspectRatio="none">
      {fillPath && <path d={fillPath} fill={color} opacity="0.08"/>}
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

Charts.Donut = ({ data, size = 160, thickness = 22 }) => {
  // data: [{ pct, color, label }]
  const r = size / 2 - thickness / 2;
  const cx = size / 2, cy = size / 2;
  const total = data.reduce((a, b) => a + b.pct, 0);
  let cumulative = 0;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--rule)" strokeWidth={thickness}/>
      {data.map((d, i) => {
        const a0 = (cumulative / total) * Math.PI * 2 - Math.PI / 2;
        const a1 = ((cumulative + d.pct) / total) * Math.PI * 2 - Math.PI / 2;
        const x0 = cx + Math.cos(a0) * r, y0 = cy + Math.sin(a0) * r;
        const x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
        const large = (a1 - a0) > Math.PI ? 1 : 0;
        cumulative += d.pct;
        return <path key={i} d={`M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`} stroke={d.color} strokeWidth={thickness} fill="none" strokeLinecap="butt"/>;
      })}
    </svg>
  );
};

Charts.Bars = ({ data, height = 140, color = 'var(--ink-3)' }) => {
  // data: [{ label, value }]
  const w = 600, max = Math.max(...data.map(d => d.value));
  const bw = w / data.length;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      {data.map((d, i) => {
        const bh = (d.value / max) * (height - 20);
        return <rect key={i} x={i * bw + bw * 0.15} y={height - bh - 2} width={bw * 0.7} height={bh} fill={color}/>;
      })}
    </svg>
  );
};

/** Bars (left scale, money) + line (right scale, bps or index) sharing one x-axis. */
Charts.ComboBarsLine = ({
  barData,
  linePoints,
  height = 220,
  barColor = '#5a7cae',
  lineColor = 'var(--pos)',
  barLabel = 'Net flows',
  lineLabel = 'Value-add',
}) => {
  const w = 800;
  const pad = { l: 10, r: 10, t: 14, b: 44 };
  const n = Math.max(1, barData.length);
  if (!linePoints || linePoints.length !== n) {
    return null;
  }
  const maxB = Math.max(...barData.map(d => d.value), 1);
  const minL = Math.min(...linePoints);
  const maxL = Math.max(...linePoints);
  const rangeL = maxL - minL || 1;
  const plotW = w - pad.l - pad.r;
  const y0 = height - pad.b;
  const yTop = pad.t;
  const stepX = n <= 1 ? 0 : plotW / (n - 1);
  const xAt = i => pad.l + i * stepX;
  const barW = Math.max(8, Math.min(48, (plotW / n) * 0.55));
  const yBarTop = v => y0 - (v / maxB) * (y0 - yTop) * 0.72;
  const yLine = v => y0 - ((v - minL) / rangeL) * (y0 - yTop);

  const linePath = linePoints.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yLine(v)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      <line x1={pad.l} y1={y0} x2={w - pad.r} y2={y0} stroke="var(--rule)" strokeWidth="1" />
      {[0, 0.5, 1].map(t => {
        const y = yTop + (y0 - yTop) * t;
        return <line key={t} x1={pad.l} y1={y} x2={w - pad.r} y2={y} stroke="var(--rule)" strokeWidth="1" strokeDasharray={t === 1 ? '0' : '2 5'} opacity={t === 1 ? 0 : 0.55} />;
      })}
      {barData.map((d, i) => {
        const cx = xAt(i);
        const top = yBarTop(d.value);
        const bh = y0 - top;
        return <rect key={i} x={cx - barW / 2} y={top} width={barW} height={Math.max(0, bh)} fill={barColor} rx="1.5" opacity="0.92" />;
      })}
      <path d={linePath} fill="none" stroke={lineColor} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
      {linePoints.map((v, i) => (
        <circle key={i} cx={xAt(i)} cy={yLine(v)} r="3.5" fill={lineColor} stroke="var(--surface)" strokeWidth="1" />
      ))}
      {barData.map((d, i) => (
        <text key={i} x={xAt(i)} y={height - 26} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--ink-3)">
          {d.label}
        </text>
      ))}
      <g transform={`translate(${pad.l}, ${height - 14})`}>
        <rect x="0" y="-8" width="10" height="10" fill={barColor} rx="2" opacity="0.9" />
        <text x="14" y="0" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--ink-3)">{barLabel}</text>
        <line x1="118" y1="-4" x2="136" y2="-4" stroke={lineColor} strokeWidth="2" strokeLinecap="round" />
        <text x="140" y="0" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--ink-3)">{lineLabel}</text>
      </g>
    </svg>
  );
};

// Payoff diagram for structured products. Renders payoff (% of notional) vs underlier
// performance from -50% to +50%. `shape` switches the curve; `barrierPct` draws a vertical
// barrier marker. Coupon rate (annualized) inflates the upside cap on income shapes.
Charts.PayoffDiagram = ({ shape = 'phoenix', barrierPct = 65, coupon = 10, height = 160, label }) => {
  const w = 320, h = height, pad = { l: 28, r: 8, t: 14, b: 22 };
  const xMin = -50, xMax = 50;
  const yMin = -50, yMax = Math.max(30, coupon * 2 + 5);
  const pxX = u => pad.l + ((u - xMin) / (xMax - xMin)) * (w - pad.l - pad.r);
  const pxY = p => pad.t + (1 - (p - yMin) / (yMax - yMin)) * (h - pad.t - pad.b);

  const pts = [];
  for (let u = xMin; u <= xMax; u += 1) {
    let p = 0;
    const barrier = barrierPct - 100;
    if (shape === 'phoenix') {
      p = u >= barrier ? coupon : Math.min(coupon, u);
    } else if (shape === 'reverse_convertible') {
      p = u >= barrier ? coupon : coupon + u;
    } else if (shape === 'buffer') {
      const buf = barrierPct - 100;
      if (u >= 0) p = Math.min(u, 25);
      else if (u >= buf) p = 0;
      else p = u - buf;
    } else if (shape === 'booster') {
      const floor = barrierPct - 100;
      if (u >= 0) p = Math.min(u * 1.5, 30);
      else if (u >= floor) p = 0;
      else p = u - floor;
    }
    pts.push([u, p]);
  }
  const path = pts.map(([u, p], i) => `${i === 0 ? 'M' : 'L'} ${pxX(u)} ${pxY(p)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: h }} preserveAspectRatio="none">
      <line x1={pad.l} y1={pxY(0)} x2={w - pad.r} y2={pxY(0)} stroke="var(--rule)" strokeWidth="1"/>
      <line x1={pxX(0)} y1={pad.t} x2={pxX(0)} y2={h - pad.b} stroke="var(--rule)" strokeWidth="1" strokeDasharray="2 3"/>
      <line x1={pxX(barrierPct - 100)} y1={pad.t} x2={pxX(barrierPct - 100)} y2={h - pad.b} stroke="var(--neg)" strokeWidth="1.2" strokeDasharray="3 3"/>
      <text x={pxX(barrierPct - 100) + 4} y={pad.t + 10} fontFamily="var(--font-mono)" fontSize="9" fill="var(--neg)">{barrierPct}%</text>
      {[-50, -25, 0, 25, 50].map(t => (
        <text key={t} x={pxX(t)} y={h - 6} fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink-3)" textAnchor="middle">{t > 0 ? '+' : ''}{t}%</text>
      ))}
      <text x={4} y={pxY(0) - 4} fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink-3)">par</text>
      <path d={path} fill="none" stroke="var(--ink)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
      {label && <text x={w - pad.r} y={pad.t + 2} fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink-3)" textAnchor="end">{label}</text>}
    </svg>
  );
};

// J-curve for private fund holdings. data: [{ q, called, distributed, nav }] cumulative.
// Plots total value (nav + distributed) on the upside and -called on the downside.
Charts.JCurve = ({ data, height = 180 }) => {
  const w = 600, h = height, pad = { l: 8, r: 8, t: 14, b: 24 };
  const tv = data.map(d => d.nav + d.distributed);
  const callOut = data.map(d => -d.called);
  const all = [...tv, ...callOut];
  const min = Math.min(...all), max = Math.max(...all);
  const range = max - min || 1;
  const stepX = (w - pad.l - pad.r) / (data.length - 1);
  const yPx = v => pad.t + (h - pad.t - pad.b) * (1 - (v - min) / range);
  const path = arr => arr.map((v, i) => `${i === 0 ? 'M' : 'L'} ${pad.l + i * stepX} ${yPx(v)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: h }} preserveAspectRatio="none">
      <line x1={pad.l} y1={yPx(0)} x2={w - pad.r} y2={yPx(0)} stroke="var(--rule)" strokeWidth="1"/>
      <path d={`${path(callOut)} L ${pad.l + (data.length - 1) * stepX} ${yPx(0)} L ${pad.l} ${yPx(0)} Z`} fill="var(--neg-soft)" opacity="0.7"/>
      <path d={path(callOut)} fill="none" stroke="var(--neg)" strokeWidth="1.4" strokeDasharray="3 3"/>
      <path d={path(tv)} fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {[0, Math.floor(data.length / 2), data.length - 1].map(i => (
        <text key={i} x={pad.l + i * stepX} y={h - 6} fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink-3)" textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'}>{data[i].q}</text>
      ))}
    </svg>
  );
};

// Cashflow projection — paired bars per period. Calls render below the zero line
// (negative), distributions render above. Used on the Alternatives Cashflow plan tab.
Charts.CashflowBars = ({ data, height = 220 }) => {
  const w = 720, pad = { l: 50, r: 8, t: 14, b: 28 };
  const allValues = data.flatMap(d => [d.calls, d.dist]).filter(v => v !== 0);
  const maxAbs = Math.max(...allValues.map(Math.abs));
  const yScale = v => pad.t + (height - pad.t - pad.b) * (1 - (v + maxAbs) / (2 * maxAbs));
  const stepX = (w - pad.l - pad.r) / data.length;
  const barW = stepX * 0.55;

  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      {[-1, -0.5, 0, 0.5, 1].map(t => {
        const v = t * maxAbs, y = yScale(v);
        return <line key={t} x1={pad.l} y1={y} x2={w-pad.r} y2={y} stroke="var(--rule)" strokeWidth="1" strokeDasharray={t === 0 ? '0' : '2 4'}/>;
      })}
      {[-1, -0.5, 0.5, 1].map(t => {
        const v = t * maxAbs;
        return <text key={t} x={pad.l - 6} y={yScale(v) + 3} fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink-3)" textAnchor="end">{(v/1e6 >= 0 ? '+' : '') + (v/1e6).toFixed(1) + 'M'}</text>;
      })}
      {data.map((d, i) => {
        const cx = pad.l + (i + 0.5) * stepX;
        const zeroY = yScale(0);
        return (
          <g key={i}>
            {d.calls < 0 && <rect x={cx - barW/2} y={zeroY} width={barW} height={Math.abs(yScale(d.calls) - zeroY)} fill="var(--neg)" opacity="0.85"/>}
            {d.dist > 0 && <rect x={cx - barW/2} y={yScale(d.dist)} width={barW} height={Math.abs(zeroY - yScale(d.dist))} fill="var(--pos)" opacity="0.85"/>}
            <text x={cx} y={height - 12} fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink-3)" textAnchor="middle">{d.q}</text>
          </g>
        );
      })}
    </svg>
  );
};

// Stacked cashflow chart — per-quarter inflows above the zero line, outflows
// below, color-coded by source. Shared scale on both sides. Each bar segment
// carries an SVG <title> so hovering reveals exact source + amount. Used by
// the Household Cashflow tab. `sources` is the column definition list with
// { key, label, color, sign:'in'|'out' }; `formatValue` formats $ for tooltips.
Charts.StackedCashflow = ({ data, sources, formatValue, height = 320 }) => {
  const w = 720, pad = { l: 60, r: 8, t: 14, b: 28 };
  const fv = formatValue || (v => '$' + Math.round(v/1000) + 'k');
  const inSrc  = sources.filter(s => s.sign === 'in');
  const outSrc = sources.filter(s => s.sign === 'out');
  const totalIn  = d => inSrc.reduce((a, s)  => a + (d[s.key] || 0), 0);
  const totalOut = d => Math.abs(outSrc.reduce((a, s) => a + (d[s.key] || 0), 0));
  const maxAbs = Math.max(...data.map(totalIn), ...data.map(totalOut)) || 1;

  const yScale = v => pad.t + (height - pad.t - pad.b) * (1 - (v + maxAbs) / (2 * maxAbs));
  const zeroY = yScale(0);
  const stepX = (w - pad.l - pad.r) / data.length;
  const barW = stepX * 0.55;

  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      {[-1, -0.5, 0, 0.5, 1].map(t => {
        const y = yScale(t * maxAbs);
        return <line key={t} x1={pad.l} y1={y} x2={w-pad.r} y2={y} stroke="var(--rule)" strokeWidth="1" strokeDasharray={t === 0 ? '0' : '2 4'}/>;
      })}
      {[-1, -0.5, 0.5, 1].map(t => {
        const v = t * maxAbs;
        return <text key={t} x={pad.l - 6} y={yScale(v) + 3} fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink-3)" textAnchor="end">{(v >= 0 ? '+' : '') + (v/1e6).toFixed(1) + 'M'}</text>;
      })}
      {data.map((d, i) => {
        const cx = pad.l + (i + 0.5) * stepX;
        let posOff = 0, negOff = 0;
        return (
          <g key={i}>
            {inSrc.map(s => {
              const val = d[s.key] || 0;
              if (val <= 0) return null;
              const h = (val / maxAbs) * (height - pad.t - pad.b) / 2;
              const y = zeroY - posOff - h;
              posOff += h;
              return (
                <rect key={s.key} x={cx - barW/2} y={y} width={barW} height={h} fill={s.color} opacity="0.9" style={{ cursor:'help' }}>
                  <title>{`${d.q} · ${s.label}: +${fv(val)}`}</title>
                </rect>
              );
            })}
            {outSrc.map(s => {
              const val = d[s.key] || 0;
              if (val >= 0) return null;
              const h = (Math.abs(val) / maxAbs) * (height - pad.t - pad.b) / 2;
              const y = zeroY + negOff;
              negOff += h;
              return (
                <rect key={s.key} x={cx - barW/2} y={y} width={barW} height={h} fill={s.color} opacity="0.9" style={{ cursor:'help' }}>
                  <title>{`${d.q} · ${s.label}: ${fv(val)}`}</title>
                </rect>
              );
            })}
            <text x={cx} y={height - 12} fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink-3)" textAnchor="middle">{d.q}</text>
          </g>
        );
      })}
    </svg>
  );
};

window.Slate.Charts = Charts;
