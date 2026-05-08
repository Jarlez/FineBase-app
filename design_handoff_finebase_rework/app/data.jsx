// FineBase — Sample data
const Categorias = [
  { id: 'mercado',  name: 'Mercado',       cls: 'cat-1', color: 'oklch(0.62 0.16 268)' },
  { id: 'rest',     name: 'Restaurantes',  cls: 'cat-2', color: 'oklch(0.7 0.13 165)' },
  { id: 'transp',   name: 'Transporte',    cls: 'cat-3', color: 'oklch(0.72 0.14 60)' },
  { id: 'casa',     name: 'Casa',          cls: 'cat-4', color: 'oklch(0.6 0.16 25)' },
  { id: 'saude',    name: 'Saúde',         cls: 'cat-5', color: 'oklch(0.6 0.12 320)' },
  { id: 'lazer',    name: 'Lazer',         cls: 'cat-6', color: 'oklch(0.65 0.1 200)' },
  { id: 'assin',    name: 'Assinaturas',   cls: 'cat-7', color: 'oklch(0.55 0.05 60)' },
];

const Gastos = [
  { d:'05 Mai', desc:'Pão de Açúcar',          cat:'mercado', loc:'Av. Paulista',   pay:'Crédito Itaú',   v: 287.40, t:'variavel' },
  { d:'05 Mai', desc:'Uber para reunião',      cat:'transp',  loc:'—',              pay:'PIX',            v:  24.50, t:'variavel' },
  { d:'04 Mai', desc:'iFood · Sushi Yassu',    cat:'rest',    loc:'Pinheiros',      pay:'Crédito Itaú',   v: 142.80, t:'variavel' },
  { d:'04 Mai', desc:'Spotify Família',        cat:'assin',   loc:'—',              pay:'Crédito Nubank', v:  21.90, t:'fixo' },
  { d:'03 Mai', desc:'Notebook · 3/12',        cat:'casa',    loc:'Magalu',         pay:'Crédito Nubank', v: 458.33, t:'parcelado' },
  { d:'03 Mai', desc:'Posto Shell',            cat:'transp',  loc:'Faria Lima',     pay:'Crédito Itaú',   v: 220.00, t:'variavel' },
  { d:'02 Mai', desc:'Drogasil',               cat:'saude',   loc:'Higienópolis',   pay:'Débito',         v:  89.30, t:'variavel' },
  { d:'02 Mai', desc:'Cinema · Reserva Cult',  cat:'lazer',   loc:'Frei Caneca',    pay:'Crédito Nubank', v:  68.00, t:'variavel' },
  { d:'01 Mai', desc:'Aluguel · Maio',         cat:'casa',    loc:'—',              pay:'PIX',            v:2800.00, t:'fixo' },
  { d:'01 Mai', desc:'Netflix Premium',        cat:'assin',   loc:'—',              pay:'Crédito Itaú',   v:  55.90, t:'fixo' },
  { d:'30 Abr', desc:'St Marche · semana',     cat:'mercado', loc:'Vila Madalena',  pay:'Débito',         v: 412.18, t:'variavel' },
  { d:'29 Abr', desc:'iFood · Z Deli',         cat:'rest',    loc:'Jardins',        pay:'Crédito Itaú',   v:  78.50, t:'variavel' },
  { d:'28 Abr', desc:'Academia Smart Fit',     cat:'saude',   loc:'—',              pay:'Crédito Nubank', v: 119.90, t:'fixo' },
  { d:'27 Abr', desc:'Câmera DSLR · 5/10',     cat:'lazer',   loc:'Mercado Livre',  pay:'Crédito Itaú',   v: 339.00, t:'parcelado' },
];

const Entradas = [
  { d:'30 Abr', desc:'Salário · Banco Quartzo', src:'Trabalho CLT',  v: 12480.00 },
  { d:'30 Abr', desc:'Salário · Lucas',          src:'Trabalho CLT', v:  8950.00 },
  { d:'15 Abr', desc:'Freela · Logo Bistrô',     src:'Freelance',    v:  2200.00 },
  { d:'12 Abr', desc:'Reembolso plano de saúde', src:'Reembolso',    v:   430.00 },
  { d:'05 Abr', desc:'Aluguel · Estúdio Pomp.',  src:'Aluguel',      v:  2400.00 },
  { d:'02 Abr', desc:'Dividendos ITSA4',         src:'Investimento', v:    87.40 },
];

const Recorrentes = [
  { desc:'Aluguel',         cat:'casa',  pay:'PIX',            v:2800.00 },
  { desc:'Netflix Premium', cat:'assin', pay:'Crédito Itaú',   v:  55.90 },
  { desc:'Spotify Família', cat:'assin', pay:'Crédito Nubank', v:  21.90 },
  { desc:'Smart Fit',       cat:'saude', pay:'Crédito Nubank', v: 119.90 },
  { desc:'Internet Vivo',   cat:'casa',  pay:'PIX',            v: 159.00 },
  { desc:'Plano de saúde',  cat:'saude', pay:'PIX',            v: 689.00 },
];

const Parcelas = [
  { desc:'Notebook Dell',   parcela:3, total:12, fim:'Dez · 26', restante: 4125 },
  { desc:'Câmera DSLR',     parcela:5, total:10, fim:'Set · 26', restante: 1695 },
  { desc:'Geladeira',       parcela:8, total:12, fim:'Ago · 26', restante:  920 },
];

const Orcamentos = [
  { cat: 'Mercado',      gasto: 1620, limite: 2000, status: 'ok' },
  { cat: 'Restaurantes', gasto: 540,  limite: 600,  status: 'warn' },
  { cat: 'Transporte',   gasto: 312,  limite: 500,  status: 'ok' },
  { cat: 'Lazer',        gasto: 740,  limite: 600,  status: 'over' },
  { cat: 'Saúde',        gasto: 209,  limite: 400,  status: 'ok' },
];

// monthly comparison
const PorMes = [
  { label:'Nov', value: 7820 },
  { label:'Dez', value: 9410 },
  { label:'Jan', value: 8240 },
  { label:'Fev', value: 7960 },
  { label:'Mar', value: 8530 },
  { label:'Abr', value: 7480 },
  { label:'Mai', value: 5117, highlight: true },
];

const SaldoAno = [
  { label:'Nov', value: 4200 },
  { label:'Dez', value: 1890 },
  { label:'Jan', value: 5310 },
  { label:'Fev', value: 6020 },
  { label:'Mar', value: 5840 },
  { label:'Abr', value: 7150 },
  { label:'Mai', value: 8313 },
];

const SparkData = [12,15,11,14,10,13,16,12,18,14,17,20,16,19];

window.fbData = { Categorias, Gastos, Entradas, Recorrentes, Parcelas, Orcamentos, PorMes, SaldoAno, SparkData };
