// FineBase — Icons (line-style, 16px default)
const Ic = {};
const _i = (path, vb = '0 0 16 16') => ({ size = 16, ...rest } = {}) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: vb, fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.4,
    strokeLinecap: 'round', strokeLinejoin: 'round',
    className: 'fb-ico', ...rest
  }, React.createElement('g', { dangerouslySetInnerHTML: { __html: path } }));

Ic.dashboard = _i('<rect x="2" y="2" width="5" height="6" rx="1"/><rect x="9" y="2" width="5" height="3" rx="1"/><rect x="2" y="10" width="5" height="4" rx="1"/><rect x="9" y="7" width="5" height="7" rx="1"/>');
Ic.expense   = _i('<path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h7"/>');
Ic.income    = _i('<path d="M3 13l5-5 3 3 4-5"/><path d="M11 6h4v4"/>');
Ic.repeat    = _i('<path d="M2.5 6.5l2-2 2 2"/><path d="M4.5 4.5v4a3 3 0 003 3h6"/><path d="M13.5 9.5l-2 2-2-2"/><path d="M11.5 11.5v-4a3 3 0 00-3-3h-6"/>');
Ic.settings  = _i('<circle cx="8" cy="8" r="2"/><path d="M8 1.5v1.6M8 12.9v1.6M14.5 8h-1.6M3.1 8H1.5M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1M12.6 12.6l-1.1-1.1M4.5 4.5L3.4 3.4"/>');
Ic.search    = _i('<circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/>');
Ic.plus      = _i('<path d="M8 3v10M3 8h10"/>');
Ic.upload    = _i('<path d="M8 10V2.5M5 5.5L8 2.5l3 3"/><path d="M3 11v1.5A1.5 1.5 0 004.5 14h7A1.5 1.5 0 0013 12.5V11"/>');
Ic.download  = _i('<path d="M8 2.5V10M5 7l3 3 3-3"/><path d="M3 11v1.5A1.5 1.5 0 004.5 14h7A1.5 1.5 0 0013 12.5V11"/>');
Ic.x         = _i('<path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/>');
Ic.chev      = _i('<path d="M5 3l4 5-4 5"/>');
Ic.chevDown  = _i('<path d="M3 6l5 4 5-4"/>');
Ic.calendar  = _i('<rect x="2" y="3" width="12" height="11" rx="1.5"/><path d="M2 6h12M5.5 1.5v3M10.5 1.5v3"/>');
Ic.filter    = _i('<path d="M2 3.5h12M4 8h8M6 12.5h4"/>');
Ic.edit      = _i('<path d="M11.5 2.5l2 2-7.5 7.5H4v-2z"/>');
Ic.trash     = _i('<path d="M2.5 4h11M6 4V2.5h4V4M3.5 4l.7 9.5h7.6l.7-9.5"/>');
Ic.dots      = _i('<circle cx="3.5" cy="8" r="1"/><circle cx="8" cy="8" r="1"/><circle cx="12.5" cy="8" r="1"/>');
Ic.up        = _i('<path d="M4 10l4-4 4 4"/>');
Ic.down      = _i('<path d="M4 6l4 4 4-4"/>');
Ic.arrowUR   = _i('<path d="M5 11l6-6M6 5h5v5"/>');
Ic.bolt      = _i('<path d="M9 1L3 9h4l-1 6 6-8H8z"/>');
Ic.tag       = _i('<path d="M2 7V2.5h4.5L13.5 9.5 9.5 13.5 2 6V7z"/><circle cx="5" cy="5" r="0.8"/>');
Ic.location  = _i('<path d="M8 14s5-4.5 5-8.5a5 5 0 00-10 0c0 4 5 8.5 5 8.5z"/><circle cx="8" cy="5.5" r="1.7"/>');
Ic.card      = _i('<rect x="2" y="3.5" width="12" height="9" rx="1.5"/><path d="M2 6.5h12M5 10.5h2"/>');
Ic.moon      = _i('<path d="M12.5 9.5A5 5 0 016.5 3.5a5.5 5.5 0 1 0 6 6z"/>');
Ic.sun       = _i('<circle cx="8" cy="8" r="3"/><path d="M8 1.5v1.5M8 13v1.5M14.5 8H13M3 8H1.5M12.7 3.3l-1 1M4.3 11.7l-1 1M12.7 12.7l-1-1M4.3 4.3l-1-1"/>');
Ic.menu      = _i('<path d="M2 4h12M2 8h12M2 12h12"/>');
Ic.dot       = _i('<circle cx="8" cy="8" r="2.2" fill="currentColor"/>');

window.Ic = Ic;
