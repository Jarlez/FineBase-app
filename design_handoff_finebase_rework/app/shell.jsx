// FineBase — App shell (Sidebar + Header)

function Sidebar({ active = 'dashboard', onNav, mes = 'Maio · 26' }) {
  const items = [
    { id: 'dashboard',  label: 'Dashboard',   ico: 'dashboard',  k: '⌘1' },
    { id: 'gastos',     label: 'Gastos',      ico: 'expense',    k: '⌘2', count: 142 },
    { id: 'entradas',   label: 'Entradas',    ico: 'income',     k: '⌘3' },
    { id: 'recorrentes',label: 'Recorrentes', ico: 'repeat',     k: '⌘4' },
  ];
  return (
    <aside className="fb-side">
      <div className="fb-side__brand">
        <div className="fb-side__logo">F</div>
        <div>
          <div className="fb-side__brand-name">FineBase</div>
          <div className="fb-side__brand-sub">Ana &amp; Lucas</div>
        </div>
        <button className="fb-btn fb-btn--ghost fb-btn--icon" style={{ marginLeft:'auto', height: 24, width: 24 }} title="Trocar workspace">
          {React.createElement(Ic.chevDown, { size: 12 })}
        </button>
      </div>

      <div className="fb-side__nav">
        {items.map(it => (
          <button key={it.id}
            className={'fb-side__item' + (active === it.id ? ' is-active' : '')}
            onClick={() => onNav?.(it.id)}>
            {React.createElement(Ic[it.ico])}
            <span>{it.label}</span>
            {it.count != null && <span className="num" style={{ marginLeft:'auto', color: 'var(--text-4)', fontSize: 11 }}>{it.count}</span>}
          </button>
        ))}
      </div>

      <div className="fb-side__group">Análise</div>
      <div className="fb-side__nav">
        <button className="fb-side__item">
          {React.createElement(Ic.tag)}
          <span>Categorias</span>
        </button>
        <button className="fb-side__item">
          {React.createElement(Ic.calendar)}
          <span>Orçamentos</span>
        </button>
        <button className="fb-side__item">
          {React.createElement(Ic.settings)}
          <span>Ajustes</span>
        </button>
      </div>

      <div className="fb-side__balance">
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', padding:'0 6px 8px' }}>
          <div style={{ fontSize: 11, textTransform:'uppercase', letterSpacing:'0.06em', color: 'var(--text-3)', fontWeight: 500 }}>{mes}</div>
          <div style={{ fontSize: 10.5, color: 'var(--text-4)' }}>em curso</div>
        </div>
        <div className="fb-side__balance-row">
          <span className="lbl">Entradas</span>
          <span className="val num" style={{ color: 'var(--pos)' }}>+13,4k</span>
        </div>
        <div className="fb-side__balance-row">
          <span className="lbl">Gastos</span>
          <span className="val num">−5,1k</span>
        </div>
        <div className="fb-side__balance-row total">
          <span className="lbl">Saldo</span>
          <span className="val num">+8,3k</span>
        </div>
      </div>
    </aside>
  );
}

function Header({ crumbs = ['FineBase', 'Dashboard'], onToggleTheme, dark = false, hideSearch = false }) {
  return (
    <header className="fb-head">
      <div className="fb-head__crumbs">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            <span className={i === crumbs.length - 1 ? 'now' : ''}>{c}</span>
            {i < crumbs.length - 1 && <span className="sep">/</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="fb-head__right">
        {!hideSearch && (
          <div className="fb-head__search">
            {React.createElement(Ic.search)}
            <span>Buscar</span>
            <span className="kbd">⌘K</span>
          </div>
        )}
        <button className="fb-btn fb-btn--ghost fb-btn--icon" onClick={onToggleTheme} title="Alternar tema">
          {React.createElement(dark ? Ic.sun : Ic.moon)}
        </button>
        <button className="fb-btn fb-btn--ghost fb-btn--icon" title="Notificações">
          {React.createElement(Ic.bolt)}
        </button>
        <div style={{ width: 26, height: 26, borderRadius: 999, background:'var(--accent-soft)', color:'var(--accent)', display:'grid', placeItems:'center', fontWeight: 600, fontSize: 11, marginLeft: 4, border: '1px solid var(--border)' }}>
          A
        </div>
      </div>
    </header>
  );
}

window.Sidebar = Sidebar;
window.Header = Header;
