export const STATUTS = [
  { value: 'Nouveau lead',              label: '🟣 Nouveau lead',              color: '#7C3AED' },
  { value: 'Contacté',                  label: '🔵 Contacté',                  color: '#2563EB' },
  { value: 'Appel pré-qual planifié',   label: '🟡 Appel pré-qual planifié',   color: '#D97706' },
  { value: 'Appel pré-qual réalisé',    label: '🟠 Appel pré-qual réalisé',    color: '#EA580C' },
  { value: 'Proposition envoyée',       label: '🟢 Proposition envoyée',       color: '#16A34A' },
  { value: 'Closé',                     label: '✅ Closé',                     color: '#15803D' },
  { value: 'Perdu',                     label: '❌ Perdu',                     color: '#DC2626' },
  { value: 'Nurture',                   label: '🔁 Nurture',                   color: '#6B7280' },
]

export const SOURCES = [
  'Pub Facebook/Instagram',
  'Instagram organique',
  'Tally PSC™',
  'Autre',
]

export const OFFRES = [
  'Brand — 3 500€',
  'Brand Premium — 5 000€',
  'Non défini',
]

export const CLOSERS = ['Sébastien', 'Jérôme']

export const MOTIFS_PERTE = [
  'Prix',
  'Pas le bon moment',
  'Concurrence',
  'Pas qualifié',
  'Sans réponse',
  'Autre',
]

export const STATUT_COLORS = Object.fromEntries(
  STATUTS.map(s => [s.value, s.color])
)
