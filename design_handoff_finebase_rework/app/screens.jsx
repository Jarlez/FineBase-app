// FineBase — Screens (Dashboard, Gastos, Entradas)

const { Categorias, Gastos: gastosData, Entradas: entradasData, Parcelas, Orcamentos, PorMes, SaldoAno } = window.fbData;

// ─── DASHBOARD ──────────────────────────────────────────────────────
function Dashboard() {
  const [mode, setMode] = React.useState('graficos');
  const [periodo, setPeriodo] = React.useState('Mai · 26');
  const totalGastos = 5117.21;
  const totalEntradas = 13430.00;
  const saldo = totalEntradas - totalGastos;
  const taxa = ((saldo / totalEntradas) * 100).toFixed(1);

  const donutData = [
    { label: 'Casa',          value: 3258.33, color: 'oklch(0.6 0.16 25)' },
    { label: 'Mercado',       value: 1620.40, color: 'oklch(0.62 0.16 268)' },
    { label: 'Restaurantes',  value:  339.30, color: 'oklch(0.7 0.13 165)' },
    { label: 'Transporte',    value:  244.50, color: 'oklch(0.72 0.14 60)' },
    { label: 'Saúde',         value:  209.20, color: 'oklch(0.6 0.12 320)' },
    { label: 'Lazer',         value:  407.00, color: 'oklch(0.65 0.1 200)' },
    { label: 'Assinaturas',   value:   77.80, color: 'oklch(0.55 0.05 60)' },
  ];

  return (
    <div className="fb-page">
      <div className="fb-page__head">
        <div>
          <h1 className="fb-page__title">Dashboard</h1>
          <div className="fb-page__sub">Resumo de {periodo} — atualizado há 2 min</div>
        </div>
        <div className="fb-page__actions">
          <div className="fb-seg">
            {['Mar', 'Abr', 'Mai'].map(m => (
              <button key={m} className={periodo.startsWith(m) ? 'is-active' : ''} onClick={() => setPeriodo(m + ' · 26')}>{m}</button>
            ))}
            <button>2026 ▾</button>
          </div>
          <div className="fb-seg">
            <button className={mode==='graficos'?'is-active':''} onClick={() => setMode('graficos')}>Gráficos</button>
            <button className={mode==='tabelas'?'is-active':''} onClick={() => setMode('tabelas')}>Tabelas</button>
          </div>
        </div>
      </div>

      {/* Top stats */}
      <div className="fb-grid fb-grid--4" style={{ marginBottom: 16 }}>
        <StatCard label="Entradas"     value={fmtBRL(totalEntradas)} delta="+4,1%" trend="up"   sub="vs. mês passado"/>
        <StatCard label="Gastos"       value={fmtBRL(totalGastos)}   delta="−6,2%" trend="up"   sub="abaixo da média" tone="neutral"/>
        <StatCard label="Saldo"        value={fmtBRL(saldo)}         delta="+R$ 1.163"           sub="vs. abril" tone="pos"/>
        <StatCard label="Taxa de economia" value={`${taxa}%`}        delta="meta 55%"            sub="—" tone="accent"/>
      </div>

      {/* Charts row */}
      <div className="fb-grid" style={{ gridTemplateColumns:'1.1fr 1fr', marginBottom: 16 }}>
        <div className="fb-card">
          <div className="fb-card__head">
            <div>
              <h3 className="fb-card__title">Gastos por categoria</h3>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{periodo}</div>
            </div>
            <button className="fb-btn fb-btn--ghost fb-btn--xs" style={{ marginLeft:'auto' }}>
              Detalhes {React.createElement(Ic.arrowUR, { size: 11 })}
            </button>
          </div>
          <div className="fb-card__body" style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap: 24, alignItems:'center' }}>
            <Donut data={donutData} size={188} total={totalGastos}/>
            <div style={{ display:'flex', flexDirection:'column', gap: 8 }}>
              {donutData.map((d, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap: 10, fontSize: 12 }}>
                  <span style={{ width:8, height:8, borderRadius: 999, background: d.color }}/>
                  <span style={{ color: 'var(--text-2)', flex: 1 }}>{d.label}</span>
                  <span className="num" style={{ color: 'var(--text)' }}>{fmtBRL(d.value)}</span>
                  <span className="num" style={{ color: 'var(--text-3)', width: 36, textAlign:'right' }}>{((d.value/totalGastos)*100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="fb-card">
          <div className="fb-card__head">
            <div>
              <h3 className="fb-card__title">Comparativo mensal</h3>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>últimos 7 meses</div>
            </div>
            <span className="fb-pill fb-pill--pos" style={{ marginLeft:'auto' }}>−R$ 2,3k vs. média</span>
          </div>
          <div className="fb-card__body">
            <Bars data={PorMes} height={160}/>
          </div>
        </div>
      </div>

      {/* Saldo line + parcelas */}
      <div className="fb-grid" style={{ gridTemplateColumns:'1.4fr 1fr', marginBottom: 16 }}>
        <div className="fb-card">
          <div className="fb-card__head">
            <div>
              <h3 className="fb-card__title">Saldo no ano</h3>
              <div style={{ display:'flex', alignItems:'baseline', gap: 8, marginTop: 4 }}>
                <span className="num" style={{ fontSize: 22, fontWeight: 600, letterSpacing: 'var(--letter-tighter)' }}>{fmtBRL(8313.42)}</span>
                <span className="fb-pill fb-pill--pos">+16,3%</span>
              </div>
            </div>
          </div>
          <div className="fb-card__body">
            <Area data={SaldoAno} height={180}/>
          </div>
        </div>

        <div className="fb-card">
          <div className="fb-card__head">
            <h3 className="fb-card__title">Parcelamentos em curso</h3>
            <span className="fb-pill" style={{ marginLeft:'auto' }}>3 ativos</span>
          </div>
          <div className="fb-card__body" style={{ display:'flex', flexDirection:'column', gap: 14 }}>
            {Parcelas.map((p, i) => (
              <div key={i}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{p.desc}</div>
                  <div className="num" style={{ fontSize: 12, color: 'var(--text-2)' }}>{fmtBRL(p.restante)}</div>
                </div>
                <div className="fb-bar" style={{ marginBottom: 6 }}>
                  <i style={{ width: `${(p.parcela/p.total)*100}%` }}/>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize: 11, color: 'var(--text-3)' }}>
                  <span>Parcela {p.parcela}/{p.total}</span>
                  <span>termina {p.fim}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orçamentos */}
      <div className="fb-card">
        <div className="fb-card__head">
          <div>
            <h3 className="fb-card__title">Orçamentos por categoria</h3>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>5 categorias monitoradas</div>
          </div>
          <button className="fb-btn fb-btn--ghost fb-btn--xs" style={{ marginLeft:'auto' }}>
            Gerenciar {React.createElement(Ic.arrowUR, { size: 11 })}
          </button>
        </div>
        <div className="fb-card__body" style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap: 24 }}>
          {Orcamentos.map((o, i) => {
            const pct = (o.gasto/o.limite) * 100;
            const cls = o.status === 'over' ? 'neg' : o.status === 'warn' ? 'warn' : 'pos';
            return (
              <div key={i}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color:'var(--text-2)', fontWeight: 500 }}>{o.cat}</div>
                  <div className="num" style={{ fontSize: 11, color:'var(--text-3)' }}>{Math.round(pct)}%</div>
                </div>
                <div className={'fb-bar ' + cls} style={{ marginBottom: 8 }}>
                  <i style={{ width: `${Math.min(pct, 100)}%` }}/>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize: 11 }}>
                  <span className="num" style={{ color:'var(--text)' }}>{fmtBRLk(o.gasto)}</span>
                  <span className="num" style={{ color:'var(--text-3)' }}>de {fmtBRLk(o.limite)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, delta, sub, trend, tone = 'neutral' }) {
  const toneClass = tone === 'pos' ? 'fb-pill--pos' : tone === 'neg' ? 'fb-pill--neg' : tone === 'accent' ? 'fb-pill--accent' : '';
  return (
    <div className="fb-card">
      <div className="fb-card__body" style={{ paddingTop: 14 }}>
        <div className="fb-stat__label">{label}</div>
        <div className="fb-stat__value">{value}</div>
        <div style={{ marginTop: 8, display:'flex', alignItems:'center', gap: 6 }}>
          {delta && <span className={'fb-pill ' + toneClass}>{delta}</span>}
          {sub && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{sub}</span>}
        </div>
      </div>
    </div>
  );
}

// ─── GASTOS ─────────────────────────────────────────────────────────
function Gastos({ openModal = false, onAdd, onCloseModal }) {
  const [filter, setFilter] = React.useState('30 dias');
  const [cat, setCat] = React.useState('Todas');
  const presets = ['Hoje', '7 dias', '30 dias', 'Este mês', 'Mês passado', '2026'];
  const cats = ['Todas', ...Categorias.map(c => c.name)];
  const total = gastosData.reduce((s, g) => s + g.v, 0);

  return (
    <div className="fb-page">
      <div className="fb-page__head">
        <div>
          <h1 className="fb-page__title">Gastos</h1>
          <div className="fb-page__sub">{gastosData.length} lançamentos · {fmtBRL(total)} no período</div>
        </div>
        <div className="fb-page__actions">
          <button className="fb-btn">{React.createElement(Ic.upload, { size: 13 })} Importar CSV</button>
          <button className="fb-btn">{React.createElement(Ic.download, { size: 13 })} Exportar</button>
          <button className="fb-btn fb-btn--primary" onClick={onAdd}>
            {React.createElement(Ic.plus, { size: 13 })} Adicionar gasto
          </button>
        </div>
      </div>

      {/* stats */}
      <div className="fb-grid fb-grid--4" style={{ marginBottom: 16 }}>
        <StatCard label="Total no período" value={fmtBRL(total)}    delta="−6,2%" tone="pos" sub="vs. abril"/>
        <StatCard label="Média diária"     value={fmtBRL(total/30)} delta="R$ 170,57" tone="neutral" sub="janela 30d"/>
        <StatCard label="Maior categoria"  value="Casa"             delta="63%"  tone="accent" sub={fmtBRL(3258.33)}/>
        <StatCard label="Pagamento dominante" value="Crédito Itaú"  delta="48%"  tone="neutral" sub="7 lançamentos"/>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ display:'flex', gap: 4, padding: 3, border:'1px solid var(--border)', borderRadius: 'var(--radius)', background:'var(--surface)' }}>
          {presets.map(p => (
            <button key={p} className={'fb-chip' + (filter===p?' is-active':'')} style={{ height: 24, fontSize: 12, border: 0 }} onClick={() => setFilter(p)}>{p}</button>
          ))}
        </div>
        <button className="fb-chip">{React.createElement(Ic.filter, { size: 12 })} Categoria: {cat} {React.createElement(Ic.chevDown, { size: 11 })}</button>
        <button className="fb-chip">{React.createElement(Ic.card, { size: 12 })} Pagamento {React.createElement(Ic.chevDown, { size: 11 })}</button>
        <button className="fb-chip">{React.createElement(Ic.tag, { size: 12 })} Tipo {React.createElement(Ic.chevDown, { size: 11 })}</button>
        <div style={{ marginLeft:'auto', display:'flex', gap: 8, alignItems:'center', fontSize: 12, color:'var(--text-3)' }}>
          <span className="num">{gastosData.length} de 142</span>
        </div>
      </div>

      {/* Table */}
      <div className="fb-card" style={{ overflow:'hidden' }}>
        <table className="fb-table">
          <thead>
            <tr>
              <th style={{ width: 78 }}>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Local</th>
              <th>Pagamento</th>
              <th>Tipo</th>
              <th style={{ textAlign:'right', width: 110 }}>Valor</th>
              <th style={{ width: 60 }}/>
            </tr>
          </thead>
          <tbody>
            {gastosData.map((g, i) => {
              const c = Categorias.find(x => x.id === g.cat);
              const tipoCls = g.t === 'fixo' ? '' : g.t === 'parcelado' ? 'fb-pill--accent' : 'fb-pill--plain';
              const tipoLabel = g.t === 'fixo' ? 'Fixo' : g.t === 'parcelado' ? 'Parcelado' : 'Variável';
              return (
                <tr key={i}>
                  <td style={{ color:'var(--text-3)', fontFamily:'var(--font-mono)', fontSize: 12 }}>{g.d}</td>
                  <td style={{ color:'var(--text)', fontWeight: 500 }}>{g.desc}</td>
                  <td>
                    <span style={{ display:'inline-flex', alignItems:'center', gap: 6 }}>
                      <span style={{ width:8, height:8, borderRadius: 999, background: c.color }}/>
                      <span>{c.name}</span>
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-3)' }}>{g.loc}</td>
                  <td>{g.pay}</td>
                  <td><span className={'fb-pill ' + tipoCls}>{tipoLabel}</span></td>
                  <td className="amount">−{fmtBRL(g.v).replace('R$ ','')}</td>
                  <td className="actions">
                    <span style={{ display:'inline-flex', gap: 2 }}>
                      <button className="fb-btn fb-btn--ghost fb-btn--icon" style={{ height: 24, width: 24 }}>{React.createElement(Ic.edit, { size: 12 })}</button>
                      <button className="fb-btn fb-btn--ghost fb-btn--icon" style={{ height: 24, width: 24 }}>{React.createElement(Ic.dots, { size: 12 })}</button>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {openModal && <AddGastoModal onClose={onCloseModal}/>}
    </div>
  );
}

function AddGastoModal({ onClose }) {
  return (
    <div className="fb-modal-shade" onClick={onClose}>
      <div className="fb-modal" onClick={e => e.stopPropagation()}>
        <div className="fb-modal__head">
          <div>
            <h2 className="fb-modal__title">Novo gasto</h2>
            <div className="fb-modal__sub">Registre um lançamento manual</div>
          </div>
          <button className="fb-btn fb-btn--ghost fb-btn--icon fb-modal__x" onClick={onClose}>
            {React.createElement(Ic.x)}
          </button>
        </div>
        <div className="fb-modal__body">
          <div className="fb-row">
            <div className="fb-field">
              <label className="fb-field__label">Data</label>
              <input className="fb-input" defaultValue="05/05/2026"/>
            </div>
            <div className="fb-field">
              <label className="fb-field__label">Valor</label>
              <input className="fb-input num" defaultValue="R$ 287,40"/>
            </div>
          </div>
          <div className="fb-field">
            <label className="fb-field__label">Descrição</label>
            <input className="fb-input" defaultValue="Pão de Açúcar — semana"/>
          </div>
          <div className="fb-row">
            <div className="fb-field">
              <label className="fb-field__label">Categoria</label>
              <select className="fb-select" defaultValue="mercado">
                {Categorias.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="fb-field">
              <label className="fb-field__label">Local</label>
              <input className="fb-input" placeholder="Ex.: Av. Paulista" defaultValue="Av. Paulista"/>
            </div>
          </div>
          <div className="fb-row">
            <div className="fb-field">
              <label className="fb-field__label">Forma de pagamento</label>
              <select className="fb-select" defaultValue="ci">
                <option value="ci">Crédito Itaú</option>
                <option value="cn">Crédito Nubank</option>
                <option value="db">Débito</option>
                <option value="px">PIX</option>
                <option value="dn">Dinheiro</option>
              </select>
            </div>
            <div className="fb-field">
              <label className="fb-field__label">Tipo</label>
              <div className="fb-seg" style={{ width:'100%' }}>
                <button className="is-active" style={{ flex: 1 }}>Variável</button>
                <button style={{ flex: 1 }}>Fixo</button>
                <button style={{ flex: 1 }}>Parcelado</button>
              </div>
            </div>
          </div>
        </div>
        <div className="fb-modal__foot">
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
            ⌘ + Enter para salvar
          </span>
          <div style={{ marginLeft:'auto', display:'flex', gap: 8 }}>
            <button className="fb-btn fb-btn--ghost" onClick={onClose}>Cancelar</button>
            <button className="fb-btn fb-btn--primary">Salvar gasto</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ENTRADAS ───────────────────────────────────────────────────────
function EntradasPage() {
  const total = entradasData.reduce((s, g) => s + g.v, 0);
  return (
    <div className="fb-page">
      <div className="fb-page__head">
        <div>
          <h1 className="fb-page__title">Entradas</h1>
          <div className="fb-page__sub">{entradasData.length} lançamentos · {fmtBRL(total)} no período</div>
        </div>
        <div className="fb-page__actions">
          <button className="fb-btn">{React.createElement(Ic.filter, { size: 13 })} Filtros</button>
          <button className="fb-btn fb-btn--primary">
            {React.createElement(Ic.plus, { size: 13 })} Adicionar entrada
          </button>
        </div>
      </div>

      <div className="fb-grid fb-grid--3" style={{ marginBottom: 16 }}>
        <StatCard label="Total no período" value={fmtBRL(total)} delta="+R$ 1.230" tone="pos" sub="vs. abril"/>
        <StatCard label="Média diária" value={fmtBRL(total/30)} delta="—" tone="neutral" sub="janela 30d"/>
        <StatCard label="Maior fonte" value="Trabalho CLT" delta="93%" tone="accent" sub={fmtBRL(21430)}/>
      </div>

      <div style={{ display:'flex', gap: 8, marginBottom: 14, flexWrap:'wrap' }}>
        {['Todas as fontes', 'Trabalho CLT', 'Freelance', 'Investimento', 'Aluguel'].map((p, i) => (
          <button key={p} className={'fb-chip' + (i===0?' is-active':'')}>{p}</button>
        ))}
      </div>

      <div className="fb-card" style={{ overflow:'hidden' }}>
        <table className="fb-table">
          <thead>
            <tr>
              <th style={{ width: 78 }}>Data</th>
              <th>Descrição</th>
              <th>Fonte</th>
              <th style={{ textAlign:'right', width: 140 }}>Valor</th>
              <th style={{ width: 60 }}/>
            </tr>
          </thead>
          <tbody>
            {entradasData.map((e, i) => (
              <tr key={i}>
                <td style={{ color:'var(--text-3)', fontFamily:'var(--font-mono)', fontSize: 12 }}>{e.d}</td>
                <td style={{ color:'var(--text)', fontWeight: 500 }}>{e.desc}</td>
                <td>
                  <span className="fb-pill fb-pill--plain">{e.src}</span>
                </td>
                <td className="amount pos">+{fmtBRL(e.v).replace('R$ ','')}</td>
                <td className="actions">
                  <span style={{ display:'inline-flex', gap: 2 }}>
                    <button className="fb-btn fb-btn--ghost fb-btn--icon" style={{ height: 24, width: 24 }}>{React.createElement(Ic.edit, { size: 12 })}</button>
                    <button className="fb-btn fb-btn--ghost fb-btn--icon" style={{ height: 24, width: 24 }}>{React.createElement(Ic.dots, { size: 12 })}</button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

window.Dashboard = Dashboard;
window.Gastos = Gastos;
window.AddGastoModal = AddGastoModal;
window.EntradasPage = EntradasPage;
