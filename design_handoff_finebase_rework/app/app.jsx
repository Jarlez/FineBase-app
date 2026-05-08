// FineBase — App composition (the screens for canvas + prototype)

// Renders an entire app frame (sidebar + header + page) at a fixed size
function AppFrame({ variant, theme = 'light', screen = 'dashboard', modal = false, mes = 'Mai · 26', onNav, onAdd, onCloseModal, onToggleTheme }) {
  const crumbsMap = {
    dashboard: ['FineBase', 'Dashboard'],
    gastos:    ['FineBase', 'Gastos'],
    entradas:  ['FineBase', 'Entradas'],
    recorrentes: ['FineBase', 'Recorrentes'],
  };
  return (
    <div className={'fb fb-stage v-' + variant + (theme === 'dark' ? ' dark' : '')}>
      <Sidebar active={screen} onNav={onNav} mes={mes}/>
      <div className="fb-main">
        <Header crumbs={crumbsMap[screen]} dark={theme === 'dark'} onToggleTheme={onToggleTheme}/>
        {screen === 'dashboard' && <Dashboard/>}
        {screen === 'gastos'    && <Gastos openModal={modal} onAdd={onAdd} onCloseModal={onCloseModal}/>}
        {screen === 'entradas'  && <EntradasPage/>}
        {screen === 'recorrentes' && <Dashboard/>/* placeholder reuse */}
      </div>
    </div>
  );
}

window.AppFrame = AppFrame;
