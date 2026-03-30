// Generates a fun display name: Adjective + FootballerSurname
// All multi-word surnames are concatenated (e.g. VanBasten, DelPiero)

const ADJECTIVES = [
  'Aerial', 'Agile', 'Athletic', 'Bold', 'Brilliant', 'Calm', 'Classic',
  'Clinical', 'Commanding', 'Composed', 'Crafty', 'Creative', 'Cultured',
  'Dangerous', 'Daring', 'Deadly', 'Determined', 'Dominant', 'Dynamic',
  'Electric', 'Elegant', 'Explosive', 'Fearless', 'Fearsome', 'Fluid',
  'Gifted', 'Graceful', 'Iconic', 'Instinctive', 'Intelligent', 'Lethal',
  'Magnetic', 'Mercurial', 'Pacey', 'Poised', 'Powerful', 'Precise',
  'Prolific', 'Relentless', 'Ruthless', 'Sensational', 'Sharp', 'Silky',
  'Swift', 'Technical', 'Tenacious', 'Tireless', 'Unstoppable', 'Vintage',
  'Visionary',
]

const FOOTBALLERS = [
  'Baggio', 'Batistuta', 'Beckham', 'Bergkamp', 'Buffon',
  'Cantona', 'Cafu', 'Cannavaro', 'Casillas', 'Cavani',
  'Cruyff', 'Davids', 'DeBruyne', 'DelPiero', 'Desailly',
  'Djorkaeff', 'Drogba', 'Figo', 'Firmino', 'Forlan',
  'Gerrard', 'Ginola', 'Gullit', 'Haaland', 'Henry',
  'Iniesta', 'Inzaghi', 'Kante', 'Klinsmann', 'Klose',
  'Kompany', 'Lahm', 'Lampard', 'Lewandowski', 'Maldini',
  'Mane', 'Maradona', 'Mbappe', 'Messi', 'Morientes',
  'Muller', 'Nedved', 'Neymar', 'Owen', 'Papin',
  'Pele', 'Pirlo', 'Platini', 'Prolific', 'Puyol',
  'Ramos', 'Raul', 'Ribery', 'Rivaldo', 'Robben',
  'Ronaldinho', 'Ronaldo', 'Rooney', 'Salah', 'Scholes',
  'Schweinsteiger', 'Seedorf', 'Shearer', 'Shevchenko', 'Stoichkov',
  'Suarez', 'Thuram', 'Totti', 'Trezeguet', 'VanBasten',
  'Vieira', 'Vieri', 'Weah', 'Xavi', 'Zanetti',
  'Zidane', 'Zola',
]

// Remove 'Prolific' that snuck into footballers list
const FOOTBALLERS_CLEAN = FOOTBALLERS.filter(f => f !== 'Prolific')

export function generateName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const player = FOOTBALLERS_CLEAN[Math.floor(Math.random() * FOOTBALLERS_CLEAN.length)]
  return `${adj}${player}`
}

export const EXAMPLE_NAMES = ['SwiftZidane', 'DeadlyHenry', 'SilkyRonaldinho']
