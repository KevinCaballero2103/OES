import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://eeidzwdloogadujvbrvb.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_2Hw5iaqmcm264d4_Jczgbw_f-tVloW1'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)