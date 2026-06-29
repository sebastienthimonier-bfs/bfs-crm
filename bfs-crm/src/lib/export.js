import * as XLSX from 'xlsx'

export function exportLeads(leads, format = 'xlsx') {
  const rows = leads.map(l => ({
    'Nom':                  l.nom,
    'Prénom':               l.prenom || '',
    'Email':                l.email || '',
    'Téléphone':            l.telephone || '',
    'Instagram / Contact':  l.instagram_contact || '',
    'Statut':               l.statut,
    'Source':               l.source || '',
    'Source Ads':           l.source_ads || '',
    'Offre visée':          l.offre_visee,
    'CA potentiel (€)':     l.ca_potentiel || '',
    'Closer assigné':       l.closer_assigne || '',
    'Score S1':             l.score_s1 || '',
    'Score S2':             l.score_s2 || '',
    'Score S3':             l.score_s3 || '',
    'Score Total':          l.score_total || '',
    'Date premier contact': l.date_premier_contact || '',
    'Date appel pré-qual':  l.date_appel_preq ? new Date(l.date_appel_preq).toLocaleString('fr-FR') : '',
    'Date relance':         l.date_relance || '',
    'Motif perte':          l.motif_perte || '',
    'Paiement reçu':        l.paiement_recu ? 'Oui' : 'Non',
    'Notes closer':         l.notes_closer || '',
    'Créé le':              new Date(l.created_at).toLocaleString('fr-FR'),
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Leads BFS')

  // Largeurs colonnes
  ws['!cols'] = [
    { wch: 20 }, { wch: 15 }, { wch: 28 }, { wch: 15 }, { wch: 25 },
    { wch: 25 }, { wch: 22 }, { wch: 20 }, { wch: 22 }, { wch: 15 },
    { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 },
    { wch: 20 }, { wch: 22 }, { wch: 15 }, { wch: 20 }, { wch: 12 },
    { wch: 40 }, { wch: 20 },
  ]

  const filename = `BFS_Leads_${new Date().toISOString().slice(0,10)}`

  if (format === 'csv') {
    XLSX.writeFile(wb, `${filename}.csv`, { bookType: 'csv' })
  } else {
    XLSX.writeFile(wb, `${filename}.xlsx`)
  }
}
