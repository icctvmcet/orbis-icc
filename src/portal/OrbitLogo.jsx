import {useId} from 'react';

// Each dot shares its ring's rotating group, so it stays centred in the gap.
export default function OrbitLogo() {
  const goldId=`orbis-gold-${useId().replace(/:/g,'')}`;
  return <svg className="welcome-orbit" viewBox="0 0 380 380" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id={goldId} cx="32%" cy="28%" r="70%">
        <stop offset="0" stopColor="var(--orbit-gold-light)"/>
        <stop offset="0.42" stopColor="var(--orbit-gold-mid)"/>
        <stop offset="1" stopColor="var(--orbit-gold-end)"/>
      </radialGradient>
    </defs>
    <g className="welcome-orbit-ring welcome-orbit-ring--outer">
      <circle cx="190" cy="190" r="170" pathLength="360" fill="none" stroke="currentColor" strokeWidth="21" strokeDasharray="166 12 158 24" transform="rotate(-36 190 190)"/>
      <circle cx="303.752" cy="63.665" r="17" fill={`url(#${goldId})`}/>
    </g>
    <g className="welcome-orbit-ring welcome-orbit-ring--middle">
      <circle cx="190" cy="190" r="118" pathLength="360" fill="none" stroke="currentColor" strokeWidth="7" strokeDasharray="342 18" transform="rotate(203 190 190)"/>
      <circle cx="75.505" cy="161.453" r="10" fill={`url(#${goldId})`}/>
    </g>
    <g className="welcome-orbit-ring welcome-orbit-ring--inner">
      <circle cx="190" cy="190" r="73" pathLength="360" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="320 40" transform="rotate(65 190 190)"/>
      <circle cx="241.619" cy="241.619" r="14" fill={`url(#${goldId})`}/>
    </g>
    <circle cx="190" cy="190" r="39" fill="currentColor"/>
  </svg>;
}
