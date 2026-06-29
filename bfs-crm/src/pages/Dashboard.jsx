import { useMemo } from 'react'
import { useLeads } from '../hooks/useLeads'
import { useAuth } from '../hooks/useAuth'
import { TrendingUp, Users, CheckCircle, Clock, DollarSign, AlertCircle } from 'lucide-react'
import { STATUTS, STATUT_COLORS } from '../lib/constants'
import { differenceInDays } from 'date-fns'

function KpiCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: color + '22',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { profile } = useAuth()
  const { leads, loading } = useLeads()

  const stats = useMemo(() => {
    const total      = leads.length
    const closes     = leads.filter(l => l.statut === 'Closé')
    const perdus     = leads.filter(l => l.statut === 'Perdu')
    const props      = leads.filter(l => ['Proposition envoyée', 'Closé'].includes(l.statut))
    const prequal    = leads.filter(l => !['Nouveau lead', 'Contacté'].includes(l.statut))
    const actifs     = leads.filter(l => !['Closé', 'Perdu'].includes(l.statut))
    const nurture    = leads.filter(l => l.statut === 'Nurture')
    const rdvBientot = leads.filter(l => {
      if (!l.date_appel_preq) return false
      const diff = differenceInDays(new Date(l.date_appel_preq), new Date())
      return diff >= 0 && diff <= 3
    })

    const caPipeline = actifs.reduce((sum, l) => sum + (l.ca_potentiel || 0), 0)
    const caClose    = closes.reduce((sum, l) => sum + (l.ca_potentiel || 0), 0)

    const tauxPrequalProp = prequal.length
      ? Math.round((props.length / prequal.length) * 100)
      : 0

    const tauxPropClose = props.length
      ? Math.round((closes.length / props.length) * 100)
      : 0

    const delaisMoyens = closes
      .filter(l => l.date_premier_contact)
      .map(l => differenceInDays(new Date(l.updated_at), new Date(l.date_premier_contact)))
      .filter(d => d >= 0)
    const delaiMoyen = delaisMoyens.length
      ? Math.round(delaisMoyens.reduce((a, b) => a + b, 0) / delaisMoyens.length)
      : null

    return { total, closes, perdus, props, prequal, actifs, nurture, rdvBientot, caPipeline, caClose, tauxPrequalProp, tauxPropClose, delaiMoyen }
  }, [leads])

  // Répartition par statut
  const byStatut = useMemo(() => {
    return STATUTS.map(s => ({
      ...s,
      count: leads.filter(l => l.statut === s.value).length,
    })).filter(s => s.count > 0)
  }, [leads])

  if (loading) return (
    <div className="page-loader">
      <span className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  )

  return (
    <div style={{ padding: 28, maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
          Vue d'ensemble du pipeline BFS
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        <KpiCard
          label="Leads actifs"
          value={stats.actifs.length}
          sub={`${stats.total} au total`}
          icon={Users}
          color="#2B5EC7"
        />
        <KpiCard
          label="CA pipeline"
          value={`${stats.caPipeline.toLocaleString('fr-FR')} €`}
          sub="Leads non closés"
          icon={DollarSign}
          color="#D97706"
        />
        <KpiCard
          label="CA closé"
          value={`${stats.caClose.toLocaleString('fr-FR')} €`}
          sub={`${stats.closes.length} deal${stats.closes.length > 1 ? 's' : ''} signés`}
          icon={CheckCircle}
          color="#16A34A"
        />
        <KpiCard
          label="Taux pré-qual → proposition"
          value={`${stats.tauxPrequalProp}%`}
          sub="Objectif > 60%"
          icon={TrendingUp}
          color={stats.tauxPrequalProp >= 60 ? '#16A34A' : '#DC2626'}
        />
        <KpiCard
          label="Taux proposition → closing"
          value={`${stats.tauxPropClose}%`}
          sub="Objectif > 40%"
          icon={TrendingUp}
          color={stats.tauxPropClose >= 40 ? '#16A34A' : '#DC2626'}
        />
        <KpiCard
          label="Délai moyen lead → closing"
          value={stats.delaiMoyen !== null ? `${stats.delaiMoyen}j` : '—'}
          sub="Objectif < 14 jours"
          icon={Clock}
          color={stats.delaiMoyen !== null && stats.delaiMoyen < 14 ? '#16A34A' : '#D97706'}
        />
      </div>

      {/* Alertes */}
      {(stats.rdvBientot.length > 0 || stats.nurture.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
          {stats.rdvBientot.length > 0 && (
            <div className="card" style={{ borderColor: '#D97706', background: '#D9780611' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <AlertCircle size={16} color="#D97706" />
                <span style={{ fontWeight: 600, color: '#D97706' }}>RDV dans les 3 prochains jours</span>
              </div>
              {stats.rdvBientot.map(l => (
                <div key={l.id} style={{ fontSize: 13, padding: '4px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  {l.nom} {l.prenom} — {new Date(l.date_appel_preq).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </div>
              ))}
            </div>
          )}
          {stats.nurture.length > 0 && (
            <div className="card" style={{ borderColor: '#6B7280' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Clock size={16} color="var(--text-muted)" />
                <span style={{ fontWeight: 600 }}>En Nurture ({stats.nurture.length})</span>
              </div>
              {stats.nurture.slice(0, 5).map(l => (
                <div key={l.id} style={{ fontSize: 13, padding: '4px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  {l.nom} {l.prenom} — relance {l.date_relance || '?'}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Répartition statuts */}
      <div className="card">
        <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Répartition par statut</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {byStatut.map(s => (
            <div key={s.value} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 140, fontSize: 13, color: 'var(--text-muted)', flexShrink: 0 }}>{s.label}</div>
              <div style={{ flex: 1, height: 8, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(s.count / leads.length) * 100}%`,
                  background: s.color,
                  borderRadius: 4,
                  transition: 'width 0.4s ease',
                }} />
              </div>
              <div style={{ width: 32, textAlign: 'right', fontSize: 13, fontWeight: 600 }}>{s.count}</div>
            </div>
          ))}
          {byStatut.length === 0 && (
            <div className="empty-state" style={{ padding: 20 }}>Aucun lead pour l'instant</div>
          )}
        </div>
      </div>
    </div>
  )
}
