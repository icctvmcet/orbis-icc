import { createRoot } from 'react-dom/client';
import FlipCard from './FlipCard';
import './cards.css';

const pillars = [
  {
    name: 'People', number: '01', theme: 'people', tagline: 'Good company. Greater possibilities.',
    title: 'Your next connection starts here.',
    description: 'Connecting alumni, founders, builders, mentors, and the next generation of changemakers.',
    keywords: 'Alumni · Founders · Mentors'
  },
  {
    name: 'Skills', number: '02', theme: 'skills', tagline: 'Share what you know. Build what’s next.',
    title: 'Experience, passed forward.',
    description: 'Sharing knowledge, experience, and mentorship that help promising ideas become real ventures.',
    keywords: 'Knowledge · Mentorship · Growth'
  },
  {
    name: 'Impact', number: '03', theme: 'impact', tagline: 'Small beginnings. Lasting change.',
    title: 'Make the possibilities count.',
    description: 'Creating partnerships and opportunities that produce lasting value across the wider community.',
    keywords: 'Collaboration · Opportunity · Change'
  }
];

function PillarFace({ pillar, back = false }) {
  return <div className="pillar-face-content">
    <div className="pillar-face-top"><span>{pillar.number} / {back ? pillar.name : 'ORBIS'}</span><span aria-hidden="true">{back ? '−' : '+'}</span></div>
    <div className="pillar-face-body">
      {back ? <><h3>{pillar.title}</h3><p>{pillar.description}</p><p className="pillar-keywords">{pillar.keywords}</p></>
        : <><h3>{pillar.name}</h3><p>{pillar.tagline}</p></>}
    </div>
    <div className="pillar-face-footer"><span>{back ? 'Back to the beginning' : 'Tap to explore'}</span><span aria-hidden="true">↻</span></div>
  </div>;
}

const root = document.getElementById('pillar-cards');
if (root) {
  root.classList.add('has-flip-cards');
  createRoot(root).render(pillars.map(pillar => <FlipCard
    key={pillar.name} className={`pillar-flip pillar-flip--${pillar.theme}`}
    front={<PillarFace pillar={pillar} />} back={<PillarFace pillar={pillar} back />}
    ariaLabel={`Flip ${pillar.name} card`} width={400} height={400} radius={22}
    background="#f2ecdf" color="#0a3158" axis="y" flipOnClick draggable
    tilt tiltMax={8} glare={false} hoverScale={1.02} shadowOpacity={0.25}
  />));
}
