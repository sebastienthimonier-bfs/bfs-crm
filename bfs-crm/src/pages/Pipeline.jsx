import { useState, useMemo } from 'react'
import { Plus, Search, Download, Pencil, Trash2, ExternalLink, ChevronDown, Users as UsersIcon } from 'lucide-react'
import { useLeads } from '../hooks/useLeads'
import { useAuth } from '../hooks/useAuth'
import LeadModal from '../components/LeadModal'
import { STATUTS, SOURCES, OFFRES, CLOSERS, STATUT_COLORS } from '../lib/constants'
import { exportLeads } from '../lib/export'

function Toast({ message, type, onDone }) {
  setTimeout(onDone, 3000)
  return <div className={`toast ${type}`}>{message}</div>
}

function StatutBadge({ statut }) {
  const color = STATUT_COLORS[statut] || '#6B7280'
  const label = STATUTS.find(s => s.value === statut)?.label || statut
  return (
    <span className="badge" style={{ background: color + '22', color, border: `1px solid ${color}44` }}>
      {label}
    </span>
  )
}

function ExportMenu({ leads, filters }) {
  const [open, setOpen] = useState(false)

  function handleExport(format) {
    exportLeads(leads, format)
    setOpen(false)
  }

  return (
    <div style={{ position: 'relative' }}>
      <button className="btn btn-ghost" onClick={() => setOpen(o => !o)}>
        <Download size={15} />
        Exporter
        <ChevronDown size={13} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 6,
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 8, zIndex: 100, minWidth: 160, overflow: 'hidden',
        }}>
          <button
            onClick={() => handleExport('xlsx')}
            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', color: 'var(--text)', borderBottom: '1px solid var(--border)' }}
          >
            📊 Excel (.xlsx)
          </button>
          <button
            onClick={() => handleExport('csv')}
            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', color: 'var(--text)' }}
          >
            📄 CSV
          </button>
        </div>
      )}
    </div>
  )
}

export default function Pipeline() {
  const { profile } = useAuth()
  const isOwner  = profile?.role === 'owner'

  const [filters, setFilters] = useState({
    statut: '', closer: '', source: '', offre: '', search: '', from: '', to: '',
  })
  const [modal, setModal]   = useState(null)  // null | 'new' | lead object
  const [toast, setToast]   = useState(null)
  const [deleting, setDeleting] = useState(null)

  const { leads, loading, createLead, updateLead, deleteLead } = useLeads(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
  )

  function setFilter(k, v) {
    setFilters(f => ({ ...f, [k]: v }))
  }

  async function handleSave(payload) {
    if (modal === 'new') {
      await createLead(payload)
      setToast({ message: 'Lead créé ✓', type: 'success' })
    } else {
      await updateLead(modal.id, payload)
      setToast({ message: 'Lead mis à jour ✓', type: 'success' })
    }
  }

  async function handleDelete(lead) {
    if (!window.confirm(`Supprimer le lead "${lead.nom}" ? Cette action est irréversible.`)) return
    setDeleting(lead.id)
    try {
      await deleteLead(lead.id)
      setToast({ message: 'Lead supprimé', type: 'success' })
    } catch (e) {
      setToast({ message: e.message, type: 'error' })
    } finally {
      setDeleting(null)
    }
  }

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  return (
    <div style={{ padding: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Pipeline</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 2, fontSize: 13 }}>
            {leads.length} lead{leads.length !== 1 ? 's' : ''}
            {activeFiltersCount > 0 && ` · ${activeFiltersCount} filtre${activeFiltersCount > 1 ? 's' : ''} actif${activeFiltersCount > 1 ? 's' : ''}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <ExportMenu leads={leads} />
          {isOwner && (
            <button className="btn btn-primary" onClick={() => setModal('new')}>
              <Plus size={15} />
              Nouveau lead
            </button>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr',
        gap: 10,
        marginBottom: 20,
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 14,
      }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
            placeholder="Rechercher un nom..."
            style={{ paddingLeft: 32 }}
          />
        </div>
        <select value={filters.statut} onChange={e => setFilter('statut', e.target.value)}>
          <option value="">Tous statuts</option>
          {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={filters.closer} onChange={e => setFilter('closer', e.target.value)}>
          <option value="">Tous closers</option>
          {CLOSERS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.source} onChange={e => setFilter('source', e.target.value)}>
          <option value="">Toutes sources</option>
          {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filters.offre} onChange={e => setFilter('offre', e.target.value)}>
          <option value="">Toutes offres</option>
          {OFFRES.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <input type="date" value={filters.from} onChange={e => setFilter('from', e.target.value)} title="Depuis" />
        <input type="date" value={filters.to} onChange={e => setFilter('to', e.target.value)} title="Jusqu'au" />
      </div>

      {/* Reset filtres */}
      {activeFiltersCount > 0 && (
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setFilters({ statut: '', closer: '', source: '', offre: '', search: '', from: '', to: '' })}
          style={{ marginBottom: 14 }}
        >
          Réinitialiser les filtres
        </button>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <span className="spinner" style={{ width: 28, height: 28 }} />
        </div>
      ) : leads.length === 0 ? (
        <div className="empty-state">
          <UsersIcon size={40} />
          <p>Aucun lead trouvé</p>
          {isOwner && (
            <button className="btn btn-primary btn-sm" onClick={() => setModal('new')}>
              <Plus size={14} /> Créer le premier lead
            </button>
          )}
        </div>
      ) : (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Lead', 'Statut', 'Offre', 'CA potentiel', 'Closer', 'Score PSC™', 'Date appel', 'Source', ''].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, i) => (
                <tr
                  key={lead.id}
                  style={{
                    borderBottom: i < leads.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{lead.nom} {lead.prenom}</div>
                    {lead.email && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lead.email}</div>}
                    {lead.instagram_contact && (
                      <a href={lead.instagram_contact} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <ExternalLink size={10} /> Instagram
                      </a>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <StatutBadge statut={lead.statut} />
                    {lead.statut === 'Nurture' && lead.date_relance && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Relance : {lead.date_relance}</div>
                    )}
                    {lead.statut === 'Perdu' && lead.motif_perte && (
                      <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>{lead.motif_perte}</div>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13 }}>
                    {lead.offre_visee !== 'Non défini' ? (
                      <span style={{ color: lead.offre_visee.includes('Premium') ? '#A78BFA' : '#60A5FA' }}>
                        {lead.offre_visee}
                      </span>
                    ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 14, fontWeight: 600 }}>
                    {lead.ca_potentiel ? `${Number(lead.ca_potentiel).toLocaleString('fr-FR')} €` : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13 }}>
                    {lead.closer_assigne || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13 }}>
                    {lead.score_total != null ? (
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{lead.score_total}</span>
                    ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    {lead.score_s1 != null && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        S1:{lead.score_s1} S2:{lead.score_s2} S3:{lead.score_s3}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13 }}>
                    {lead.date_appel_preq
                      ? new Date(lead.date_appel_preq).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                      : <span style={{ color: 'var(--text-muted)' }}>—</span>
                    }
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)' }}>
                    {lead.source || '—'}
                    {lead.source_ads && <div style={{ fontSize: 11 }}>{lead.source_ads}</div>}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setModal(lead)}
                        title="Modifier"
                        style={{ padding: '5px 8px' }}
                      >
                        <Pencil size={13} />
                      </button>
                      {isOwner && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDelete(lead)}
                          disabled={deleting === lead.id}
                          title="Supprimer"
                          style={{ padding: '5px 8px', color: 'var(--danger)' }}
                        >
                          {deleting === lead.id
                            ? <span className="spinner" style={{ width: 12, height: 12 }} />
                            : <Trash2 size={13} />
                          }
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <LeadModal
          lead={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  )
}
