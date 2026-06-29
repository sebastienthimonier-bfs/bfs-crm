import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ezvrdosjrypffaahxkwm.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_CD_L1QjqLHTOxr3XzQbrkQ_5tE3gk9C'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
