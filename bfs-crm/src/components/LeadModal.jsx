import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { STATUTS, SOURCES, OFFRES, CLOSERS, MOTIFS_PERTE } from '../lib/constants'
import { useAuth } from '../hooks/useAuth'

const EMPTY = {
  nom: '', prenom: '', email: '', telephone: '', instagram_contact: '',
  statut: 'Nouveau lead', source: '', source_ads: '', offre_visee: 'Non défini',
  ca_potentiel: '', closer_assigne: '', paiement_recu: false,
  score_s1: '', score_s2: '', score_s3: '',
  date_premier_contact: '', date_appel_preq: '', date_relance: '',
  motif_perte: '', notes_closer: '',
}

export default function LeadModal({ lead, onClose, onSave }) {
  const { profile } = useAuth()
  const isOwner = profile?.role === 'owner'
  const isCloser = profile?.role === 'closer'

  const [form, setForm]       = useState(EMPTY)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (lead) {
      setForm({
        nom:                  lead.nom || '',
        prenom:               lead.prenom || '',
        email:                lead.email || '',
        telephone:            lead.telephone || '',
        instagram_contact:    lead.instagram_contact || '',
        statut:               lead.statut || 'Nouveau lead',
        source:               lead.source || '',
        source_ads:           lead.source_ads || '',
        offre_visee:          lead.offre_visee || 'Non défini',
        ca_potentiel:         lead.ca_potentiel || '',
        closer_assigne:       lead.closer_assigne || '',
        paiement_recu:        lead.paiement_recu || false,
        score_s1:             lead.score_s1 ?? '',
        score_s2:             lead.score_s2 ?? '',
        score_s3:             lead.score_s3 ?? '',
        date_premier_contact: lead.date_premier_contact || '',
        date_appel_preq:      lead.date_appel_preq ? lead.date_appel_preq.slice(0, 16) : '',
        date_relance:         lead.date_relance || '',
        motif_perte:          lead.motif_perte || '',
        notes_closer:         lead.notes_closer || '',
      })
    }
  }, [lead])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // Validations
    if (!form.nom.trim()) { setError('Le nom est requis.'); return }
    if (form.statut === 'Nurture' && !form.date_relance) {
      setError('La date de relance est obligatoire pour un lead en Nurture.'); return
    }
    if (form.statut === 'Perdu' && !form.motif_perte) {
      setError('Le motif de perte est obligatoire.'); return
    }

    setSaving(true)
    const payload = {
      nom:                  form.nom.trim(),
      prenom:               form.prenom.trim() || null,
      email:                form.email.trim() || null,
      telephone:            form.telephone.trim() || null,
      instagram_contact:    form.instagram_contact.trim() || null,
      statut:               form.statut,
      source:               form.source || null,
      source_ads:           form.source_ads.trim() || null,
      offre_visee:          form.offre_visee,
      ca_potentiel:         form.ca_potentiel !== '' ? Number(form.ca_potentiel) : null,
      closer_assigne:       form.closer_assigne || null,
      paiement_recu:        form.paiement_recu,
      score_s1:             form.score_s1 !== '' ? Number(form.score_s1) : null,
      score_s2:             form.score_s2 !== '' ? Number(form.score_s2) : null,
      score_s3:             form.score_s3 !== '' ? Number(form.score_s3) : null,
      date_premier_contact: form.date_premier_contact || null,
      date_appel_preq:      form.date_appel_preq || null,
      date_relance:         form.date_relance || null,
      motif_perte:          form.motif_perte || null,
      notes_closer:         form.notes_closer.trim() || null,
    }

    try {
      await onSave(payload)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const scoreTotal = [form.score_s1, form.score_s2, form.score_s3]
    .map(v => Number(v) || 0).reduce((a, b) => a + b, 0)

  // Closer voit seulement statut, notes, motif perte
  const readOnly = isCloser

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20,
    }}>
      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        width: '100%',
        maxWidth: 720,
        maxHeight: '90vh',
        overflow: 'auto',
        padding: 28,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>
            {lead ? 'Modifier le lead' : 'Nouveau lead'}
          </h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '6px 8px' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Section Identité */}
          {!readOnly && (
            <>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                Identité
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div className="form-group">
                  <label>Nom *</label>
                  <input value={form.nom} onChange={e => set('nom', e.target.value)} placeholder="Dupont" />
                </div>
                <div className="form-group">
                  <label>Prénom</label>
                  <input value={form.prenom} onChange={e => set('prenom', e.target.value)} placeholder="Jean" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jean@email.com" />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input value={form.telephone} onChange={e => set('telephone', e.target.value)} placeholder="+33 6 12 34 56 78" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Instagram / Contact URL</label>
                  <input value={form.instagram_contact} onChange={e => set('instagram_contact', e.target.value)} placeholder="https://instagram.com/..." />
                </div>
              </div>
              <hr className="divider" />
            </>
          )}

          {/* Section Pipeline */}
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            Pipeline
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div className="form-group">
              <label>Statut</label>
              <select value={form.statut} onChange={e => set('statut', e.target.value)}>
                {STATUTS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            {!readOnly && (
              <>
                <div className="form-group">
                  <label>Source</label>
                  <select value={form.source} onChange={e => set('source', e.target.value)}>
                    <option value="">— Choisir —</option>
                    {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Source Ads (nom pub)</label>
                  <input value={form.source_ads} onChange={e => set('source_ads', e.target.value)} placeholder="Ex : Video_Studio_V2" />
                </div>
                <div className="form-group">
                  <label>Offre visée</label>
                  <select value={form.offre_visee} onChange={e => set('offre_visee', e.target.value)}>
                    {OFFRES.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>CA potentiel (€)</label>
                  <input type="number" value={form.ca_potentiel} onChange={e => set('ca_potentiel', e.target.value)} placeholder="3500" min="0" />
                </div>
                <div className="form-group">
                  <label>Closer assigné</label>
                  <select value={form.closer_assigne} onChange={e => set('closer_assigne', e.target.value)}>
                    <option value="">— Choisir —</option>
                    {CLOSERS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                  <label>Paiement reçu</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', paddingTop: 4 }}>
                    <input
                      type="checkbox"
                      checked={form.paiement_recu}
                      onChange={e => set('paiement_recu', e.target.checked)}
                      style={{ width: 'auto', accentColor: 'var(--primary)' }}
                    />
                    <span style={{ color: 'var(--text-muted)' }}>Oui</span>
                  </label>
                </div>
              </>
            )}
          </div>

          {/* Motif perte (visible toujours si Perdu) */}
          {form.statut === 'Perdu' && (
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Motif de perte *</label>
              <select value={form.motif_perte} onChange={e => set('motif_perte', e.target.value)}>
                <option value="">— Obligatoire —</option>
                {MOTIFS_PERTE.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          )}

          {/* Date relance (visible si Nurture) */}
          {form.statut === 'Nurture' && (
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Date de relance *</label>
              <input type="date" value={form.date_relance} onChange={e => set('date_relance', e.target.value)} />
            </div>
          )}

          {!readOnly && (
            <>
              <hr className="divider" />
              {/* Score PSC */}
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                Score PSC™ (0–4 par dimension)
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'end', marginBottom: 16 }}>
                <div className="form-group">
                  <label>S1 — Perception</label>
                  <input type="number" min="0" max="4" value={form.score_s1} onChange={e => set('score_s1', e.target.value)} placeholder="0–4" />
                </div>
                <div className="form-group">
                  <label>S2 — Structure</label>
                  <input type="number" min="0" max="4" value={form.score_s2} onChange={e => set('score_s2', e.target.value)} placeholder="0–4" />
                </div>
                <div className="form-group">
                  <label>S3 — Conversion</label>
                  <input type="number" min="0" max="4" value={form.score_s3} onChange={e => set('score_s3', e.target.value)} placeholder="0–4" />
                </div>
                <div style={{
                  background: 'var(--bg3)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '8px 14px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>{scoreTotal}</div>
                </div>
              </div>

              <hr className="divider" />
              {/* Dates */}
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                Dates
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div className="form-group">
                  <label>Date premier contact</label>
                  <input type="date" value={form.date_premier_contact} onChange={e => set('date_premier_contact', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Date appel pré-qual (Calendly)</label>
                  <input type="datetime-local" value={form.date_appel_preq} onChange={e => set('date_appel_preq', e.target.value)} />
                </div>
              </div>
            </>
          )}

          <hr className="divider" />
          {/* Notes closer */}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label>Notes closer</label>
            <textarea
              value={form.notes_closer}
              onChange={e => set('notes_closer', e.target.value)}
              placeholder="Objections, contexte, prochaines étapes..."
              rows={4}
              style={{ resize: 'vertical' }}
            />
          </div>

          {error && (
            <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" style={{ width: 16, height: 16 }} /> : (lead ? 'Enregistrer' : 'Créer le lead')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
