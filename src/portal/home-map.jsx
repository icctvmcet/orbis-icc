import {createRoot} from 'react-dom/client';
import WorldMap from './WorldMap';
import './portal.css';
const element=document.getElementById('alumni-world-map');
if(element)createRoot(element).render(<WorldMap onCountry={code=>{location.href=`portal.html?country=${encodeURIComponent(code)}#directory`;}}/>);
