import {useLayoutEffect,useRef,useState} from 'react';

const items=[['home','Overview'],['directory','Directory'],['community','Common room'],['feedback','Feedback']];

export default function PortalNav({active,onSelect}) {
  const nav=useRef(null),buttons=useRef({});
  const [hovered,setHovered]=useState(null),[focused,setFocused]=useState(null),[indicator,setIndicator]=useState(null);
  const target=hovered||focused||active;

  useLayoutEffect(()=>{
    let mounted=true;
    const measure=()=>{
      if(!mounted)return;
      const button=buttons.current[target];
      if(!button){setIndicator(previous=>previous?.visible?{...previous,visible:false}:previous);return;}
      const next={x:button.offsetLeft,y:button.offsetTop,width:button.offsetWidth,height:button.offsetHeight,visible:true};
      setIndicator(previous=>previous&&Object.keys(next).every(key=>next[key]===previous[key])?previous:next);
    };
    measure();
    // Reposition when the navigation wraps or its labels resize on smaller screens.
    const observer=new ResizeObserver(measure);
    observer.observe(nav.current);
    Object.values(buttons.current).filter(Boolean).forEach(button=>observer.observe(button));
    document.fonts?.ready.then(measure);
    return ()=>{mounted=false;observer.disconnect();};
  },[target]);

  return <nav ref={nav} className="portal-nav" aria-label="Portal navigation" onPointerLeave={()=>setHovered(null)}>
    {indicator&&<span className="portal-nav-indicator" aria-hidden="true" style={{transform:`translate(${indicator.x}px, ${indicator.y}px) scale(${indicator.width/100}, ${indicator.height/100})`,borderRadius:`${5000/indicator.width}px / ${5000/indicator.height}px`,opacity:indicator.visible?1:0}}/>}
    {items.map(([route,label])=><button
      key={route}
      ref={element=>{buttons.current[route]=element;}}
      type="button"
      aria-current={active===route?'page':undefined}
      onPointerEnter={event=>{if(event.pointerType!=='touch')setHovered(route);}}
      onPointerDown={()=>setFocused(null)}
      onFocus={event=>{if(event.currentTarget.matches(':focus-visible')){setHovered(null);setFocused(route);}}}
      onBlur={()=>setFocused(null)}
      onClick={()=>onSelect(route)}
    >{label}</button>)}
  </nav>;
}
