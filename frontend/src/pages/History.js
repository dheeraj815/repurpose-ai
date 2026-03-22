import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

export default function History() {
  const [gens, setGens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/generate/history').then(r => { setGens(r.data.generations); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{color:'#7BA3C4',padding:'2rem',fontFamily:'Inter,sans-serif'}}>Loading...</div>;

  return (
    <div>
      <div style={{marginBottom:'1.75rem'}}>
        <h1 style={{fontSize:'1.9rem',fontWeight:800,letterSpacing:'-0.03em',marginBottom:'0.3rem',
          background:'linear-gradient(135deg,#E8F4FF,#33BBFF,#00D4FF)',
          WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>🕐 Generation History</h1>
        <p style={{color:'#7BA3C4',fontSize:'0.9rem'}}>All your previous content generations.</p>
      </div>

      {gens.length === 0 ? (
        <div style={{textAlign:'center',padding:'3rem',background:'rgba(0,170,255,0.02)',
          border:'1px dashed rgba(0,170,255,0.1)',borderRadius:16}}>
          <div style={{fontSize:'2.5rem',marginBottom:'0.75rem'}}>📭</div>
          <div style={{color:'#7BA3C4',fontSize:'0.95rem',marginBottom:'1.25rem'}}>No generations yet.</div>
          <button onClick={() => navigate('/generate')} style={{padding:'0.65rem 1.5rem',borderRadius:10,border:'none',
            background:'linear-gradient(135deg,#00AAFF,#0066CC)',color:'#fff',fontWeight:700,
            cursor:'pointer',fontFamily:'Inter,sans-serif'}}>✨ Start Generating</button>
        </div>
      ) : (
        <>
          <div style={{color:'#3D6080',fontSize:'0.8rem',marginBottom:'1rem'}}>{gens.length} generations total</div>
          {gens.map(gen => (
            <div key={gen.id} style={{background:'#0C1524',border:'1px solid rgba(0,170,255,0.1)',borderRadius:14,
              marginBottom:'0.75rem',overflow:'hidden',transition:'border-color 0.2s',cursor:'pointer'}}
              onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(0,170,255,0.25)'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(0,170,255,0.1)'}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'1rem 1.25rem'}}
                onClick={() => setExpanded(expanded===gen.id?null:gen.id)}>
                <div>
                  <span style={{fontWeight:600,color:'#E8F4FF',fontSize:'0.9rem'}}>
                    📄 {gen.source_type?.replace(/_/g,' ')}
                  </span>
                  <span style={{color:'#3D6080',fontSize:'0.78rem',marginLeft:12}}>{gen.created_at?.slice(0,16)}</span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{display:'flex',gap:6}}>
                    {[['🐦',gen.twitter_posts?.length||0,'#1DA1F2'],['💼',gen.linkedin_posts?.length||0,'#4B9FE1'],
                      ['📸',gen.instagram_captions?.length||0,'#E1306C'],['📧',gen.email_newsletters?.length||0,'#00E5A0']
                    ].map(([icon,count,color])=>(
                      <span key={icon} style={{fontSize:'0.75rem',color,background:`${color}15`,
                        padding:'2px 8px',borderRadius:20,border:`1px solid ${color}25`}}>{icon} {count}</span>
                    ))}
                  </div>
                  <span style={{color:'#3D6080'}}>{expanded===gen.id?'▲':'▼'}</span>
                </div>
              </div>
              {expanded===gen.id && (
                <div style={{borderTop:'1px solid rgba(0,170,255,0.08)',padding:'1rem 1.25rem'}}>
                  <div style={{color:'#7BA3C4',fontSize:'0.82rem',fontStyle:'italic',marginBottom:'0.75rem'}}>
                    "{(gen.source_content||'').slice(0,120)}..."
                  </div>
                  <button onClick={() => navigate('/generate')} style={{
                    padding:'0.5rem 1.25rem',borderRadius:8,border:'1px solid rgba(0,170,255,0.25)',
                    background:'rgba(0,170,255,0.08)',color:'#33BBFF',fontWeight:600,
                    fontSize:'0.82rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>👁️ View Details</button>
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
