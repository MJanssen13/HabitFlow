import { createClient } from '@supabase/supabase-js';

// Suporte para Vite (import.meta.env) e Create React App/Node (process.env)
const getEnvVar = (key: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    return import.meta.env[`VITE_${key}`] || import.meta.env[key];
  }
  return process.env[`REACT_APP_${key}`] || process.env[key];
};

// Usa as variáveis de ambiente se existirem, caso contrário usa as chaves fornecidas
const SUPABASE_URL = getEnvVar('SUPABASE_URL') || 'https://pgprqefdlqruigattqvi.supabase.co';
const SUPABASE_ANON_KEY = getEnvVar('SUPABASE_KEY') || 'sb_publishable_jJ3Qe3b99uDP0hiEL5CQDQ_hjHiFZXl';

// Só cria o cliente se as chaves existirem
export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;