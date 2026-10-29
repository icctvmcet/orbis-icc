import {createClient} from '@supabase/supabase-js';
const config = __SUPABASE_CONFIG__;
export const configured = Boolean(config.url && config.key);
export const supabase = configured ? createClient(config.url, config.key, {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}) : null;
export const portalUrl = () => new URL('portal.html', window.location.href).href.split('#')[0].split('?')[0];
export async function result(query) { const {data,error} = await query; if(error) throw error; return data; }
