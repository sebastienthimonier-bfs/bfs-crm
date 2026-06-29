import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useLeads(filters = {}) {
  const { profile } = useAuth()
  const [leads, setLeads]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('leads').select('*').order('created_at', { ascending: false })

    if (filters.statut)  query = query.eq('statut', filters.statut)
    if (filters.closer)  query = query.eq('closer_assigne', filters.closer)
    if (filters.source)  query = query.eq('source', filters.source)
    if (filters.offre)   query = query.eq('offre_visee', filters.offre)
    if (filters.search)  query = query.ilike('nom', `%${filters.search}%`)
    if (filters.from)    query = query.gte('created_at', filters.from)
    if (filters.to)      query = query.lte('created_at', filters.to)

    const { data, error } = await query
    if (error) setError(error.message)
    else setLeads(data || [])
    setLoading(false)
  }, [JSON.stringify(filters), profile])

  useEffect(() => {
    fetchLeads()

    // Realtime
    const channel = supabase
      .channel('leads-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, fetchLeads)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [fetchLeads])

  const createLead = async (data) => {
    const { error } = await supabase.from('leads').insert([data])
    if (error) throw error
    await fetchLeads()
  }

  const updateLead = async (id, data) => {
    const { error } = await supabase.from('leads').update(data).eq('id', id)
    if (error) throw error
    await fetchLeads()
  }

  const deleteLead = async (id) => {
    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (error) throw error
    await fetchLeads()
  }

  return { leads, loading, error, refetch: fetchLeads, createLead, updateLead, deleteLead }
}
