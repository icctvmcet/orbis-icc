import {useEffect,useMemo,useState} from 'react';
import {geoNaturalEarth1,geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import atlas from 'world-atlas/countries-110m.json';
import {countryName,numericCountry,countryOptions} from './data';
import {supabase,configured,result} from './client';
const land = feature(atlas,atlas.objects.countries);
const projection = geoNaturalEarth1().fitExtent([[16,16],[944,470]],{type:'Sphere'});
const path = geoPath(projection);

export default function WorldMap({onCountry}) {
  const [rows,setRows]=useState([]), [hover,setHover]=useState(null), [status,setStatus]=useState(configured?'loading':'unconfigured');
  const load=()=> { if(!supabase)return; setStatus('loading'); result(supabase.rpc('orbis_country_counts')).then(r=>{setRows(r||[]);setStatus('ready');}).catch(()=>setStatus('error')); };
  useEffect(()=>{load();},[]);
  const counts=useMemo(()=>Object.fromEntries(rows.map(r=>[r.country_code,Number(r.alumni_count)])),[rows]);
  const total=rows.reduce((n,r)=>n+Number(r.alumni_count),0);
  return <section className="world-card" aria-label="Alumni around the world">
    <div className="world-heading"><div><h2>CET, around the world.</h2><p>One campus. A world of connections.</p></div><div className="world-stats"><strong>{status==='ready'?total:'—'}</strong><span>alumni in {status==='ready'?rows.length:'—'} countries</span></div></div>
    <div className="world-map-wrap">
      <svg viewBox="0 0 960 486" role="group" aria-label="World map. Select a country to explore its alumni.">
        <path d={path({type:'Sphere'})} fill="var(--color-map-sea)" />
        {land.features.map(f=>{const code=f.properties.name==='Kosovo'?'XK':numericCountry(f.id); const count=counts[code]||0;return <path key={f.id||f.properties.name} d={path(f)} className={`country ${count?'populated':''}`} style={count?{fill:count>20?'var(--color-map-high)':count>5?'var(--color-map-medium)':'var(--color-map-low)'}:{}} role={code?'button':undefined} tabIndex={code?0:undefined} aria-label={`${countryName(code)||f.properties.name}: ${status==='ready'?count+' alumni':'counts unavailable'}`} onMouseEnter={()=>setHover(code)} onMouseLeave={()=>setHover(null)} onFocus={()=>setHover(code)} onBlur={()=>setHover(null)} onClick={()=>code&&onCountry(code)} onKeyDown={e=>{if(code&&['Enter',' '].includes(e.key)){e.preventDefault();onCountry(code);}}}><title>{countryName(code)||f.properties.name}: {status==='ready'?count:'—'} alumni</title></path>;})}
      </svg>
      <p className="map-readout" aria-live="polite">{hover?`${countryName(hover)}: ${status==='ready'?(counts[hover]||0)+' alumni':'counts unavailable'}`:'Hover over a country. Click to meet its alumni.'}</p>
    </div>
    {status==='unconfigured'&&<p className="portal-note">The network opens soon. Live alumni counts will appear once the portal is connected.</p>}
    {status==='loading'&&<p role="status">Loading alumni counts…</p>}
    {status==='error'&&<p role="alert">Alumni counts could not be loaded. <button type="button" className="text-button" onClick={load}>Try again</button></p>}
    {status==='ready'&&!rows.length&&<p className="portal-note">The map is ready for its first members. Verified alumni who opt into the directory appear here.</p>}
    <div className="map-footer"><span>Counts include verified, directory-visible alumni only.</span><label>Explore a country<select defaultValue="" onChange={e=>e.target.value&&onCountry(e.target.value)}><option value="">Choose a country</option>{countryOptions.map(([code,name])=><option key={code} value={code}>{name} ({status==='ready'?counts[code]||0:'—'})</option>)}</select></label></div>
    <small className="map-credit">Map: Natural Earth via world-atlas. Countries and boundaries are approximate.</small>
  </section>;
}
