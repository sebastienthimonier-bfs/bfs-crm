import { useMemo } from 'react'
import { useLeads } from '../hooks/useLeads'
import { STATUTS, SOURCES, OFFRES, MOTIFS_PERTE } from '../lib/constants'

function StatRow({ label, value, pct, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 180, fontSize: 13, color: 'var(--text-muted)', flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, height: 6, background: 'var(--bg3)', borderRadius: 3 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color || 'var(--primary)', borderRadius: 3, transition: 'width 0.4s' }} />
      </div>
      <div style={{ width: 28, textAlign: 'right', fontSize: 13, fontWeight: 600 }}>{value}</div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>{title}</h3>
      {children}
    </div>
  )
}

export default function Stats() {
  const { leads, loading } = useLeads()

  const data = useMemo(() => {
    const total = leads.length || 1

    const byStatut = STATUTS.map(s => ({
      label: s.label,
      color: s.color,
      count: leads.filter(l => l.statut === s.value).length,
    }))

    const bySource = SOURCES.map(s => ({
      label: s,
      count: leads.filter(l => l.source === s).length,
    }))

    const byOffre = OFFRES.map(o => ({
      label: o,
      count: leads.filter(l => l.offre_visee === o).length,
    }))

    const byCloser = [
      { label: 'Sébastien', count: leads.filter(l => l.closer_assigne === 'Sébastien').length },
      { label: 'Jérôme',    count: leads.filter(l => l.closer_assigne === 'Jérôme').length },
    ]

    const byMotif = MOTIFS_PERTE.map(m => ({
      label: m,
      count: leads.filter(l => l.motif_perte === m).length,
    })).filter(m => m.count > 0)

    const payesCount = leads.filter(l => l.paiement_recu).length
    const caTotal    = leads.reduce((s, l) => s + (l.ca_potentiel || 0), 0)
    const caPaye     = leads.filter(l => l.paiement_recu).reduce((s, l) => s + (l.ca_potentiel || 0), 0)

    const scoresMoyens = ['score_s1', 'score_s2', 'score_s3'].map(k => {
      const vals = leads.map(l => l[k]).filter(v => v != null)
      return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—'
    })

    return { byStatut, bySource, byOffre, byCloser, byMotif, payesCount, caTotal, caPaye, total: leads.length, scoresMoyens }
  }, [leads])

  if (loading) return (
    <div className="page-loader">
      <span className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  )

  const max = (arr) => Math.max(...arr.map(a => a.count), 1)

  return (
    <div style={{ padding: 28, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Statistiques</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Sur {data.total} leads au total</p>
      </div>

      {/* CA */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
        {[
          { label: 'CA pipeline total', value: `${data.caTotal.toLocaleString('fr-FR')} €` },
          { label: 'CA encaissé', value: `${data.caPaye.toLocaleString('fr-FR')} €` },
          { label: 'Paiements reçus', value: `${data.payesCount} / ${data.total}` },
        ].map(k => (
          <div key={k.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{k.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <Section title="Par statut">
        {data.byStatut.map(s => (
          <StatRow key={s.label} label={s.label} value={s.count} pct={(s.count / max(data.byStatut)) * 100} color={s.color} />
        ))}
      </Section>

      <Section title="Par source">
        {data.bySource.filter(s => s.count > 0).map(s => (
          <StatRow key={s.label} label={s.label} value={s.count} pct={(s.count / max(data.bySource)) * 100} />
        ))}
        {data.bySource.every(s => s.count === 0) && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Aucune donnée</p>}
      </Section>

      <Section title="Par offre visée">
        {data.byOffre.map(o => (
          <StatRow key={o.label} label={o.label} value={o.count} pct={(o.count / max(data.byOffre)) * 100} color="#A78BFA" />
        ))}
      </Section>

      <Section title="Par closer">
        {data.byCloser.map(c => (
          <StatRow key={c.label} label={c.label} value={c.count} pct={(c.count / max(data.byCloser)) * 100} color="#2B5EC7" />
        ))}
      </Section>

      {data.byMotif.length > 0 && (
        <Section title="Motifs de perte">
          {data.byMotif.map(m => (
            <StatRow key={m.label} label={m.label} value={m.count} pct={(m.count / max(data.byMotif)) * 100} color="#DC2626" />
          ))}
        </Section>
      )}

      <Section title="Score PSC™ moyen">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {['S1 — Perception', 'S2 — Structure', 'S3 — Conversion'].map((label, i) => (
            <div key={label} style={{ textAlign: 'center', padding: '16px', background: 'var(--bg3)', borderRadius: 'var(--radius)' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>{data.scoresMoyens[i]}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
