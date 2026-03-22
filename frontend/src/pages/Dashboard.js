import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import API from '../utils/api';

function PageTitle({title,sub}) {
  return (
    <div style={{marginBottom:'1.75rem'}}>
      <h1 style={{fontSize:'1.9rem',fontWeight:800,letterSpacing:'-0.03em',lineHeight:1.2,marginBottom:'0.3rem',
        background:'linear-gradient(135deg,#E8F4FF,#33BBFF,#00D4FF)',
        WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{title}</h1>
      <p style={{color:'#7BA3C4',fontSize:'0.9rem'}}>{sub}</p>
    </div>
  );
}

function Divider() {
  return <div style={{height:1,background:'linear-gradient(90deg,transparent,rgba(0,170,255,0.15),transparent)',margin:'2rem 0'}} />;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  useEffect(() => { API.get('/user/dashboard').then(r=>setStats(r.data)).catch(console.error); }, []);
  const plan = user?.plan || 'free';
  const limit = plan==='pro' ? '∞' : '3';

  return (
    <div>
      <PageTitle title="📊 Dashboard" sub="Your content empire at a glance." />
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'2rem'}}>
        {[
          ['🚀 Total Generations', stats?.total_generations??'—', '#33BBFF'],
          ['🔖 Saved Posts',       stats?.saved_posts??'—',       '#00E5A0'],
          ["📅 Today's Usage",     stats?`${stats.today_usage}/${limit}`:'—', '#FFD166'],
          ['💎 Current Plan',      plan==='pro'?'⚡ Pro':'Free',  plan==='pro'?'#33BBFF':'#7BA3C4'],
        ].map(([label,value,color])=>(
          <div key={label} style={{background:'#0C1524',border:'1px solid rgba(0,170,255,0.1)',borderRadius:14,
            padding:'1.4rem 1.5rem',position:'relative',overflow:'hidden',transition:'all 0.25s',cursor:'default'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(0,170,255,0.35)';e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 30px rgba(0,170,255,0.08)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(0,170,255,0.1)';e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none';}}>
            <div style={{fontSize:'0.7rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'#7BA3C4',marginBottom:'0.6rem'}}>{label}</div>
            <div style={{fontSize:'2.2rem',fontWeight:800,color,letterSpacing:'-0.02em'}}>{value}</div>
          </div>
        ))}
      </div>
      <Divider />
      <div style={{display:'grid',gridTemplateColumns:'1.6fr 1fr',gap:'2rem',marginBottom:'2rem'}}>
        <div>
          <div style={{fontSize:'0.68rem',fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'#3D6080',marginBottom:'0.85rem'}}>📈 Recent Activity</div>
          {stats?.recent_activity?.length ? stats.recent_activity.map((item,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'0.65rem 0',borderBottom:'1px solid rgba(0,170,255,0.06)'}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:'#00AAFF',flexShrink:0,boxShadow:'0 0 8px #00AAFF'}} />
              <span style={{color:'#3D6080',fontSize:'0.78rem'}}>{item.created_at?.slice(0,16)}</span>
              <span style={{color:'#E8F4FF',fontSize:'0.83rem'}}>Generated from <strong style={{color:'#33BBFF'}}>{item.source_type?.replace(/_/g,' ')}</strong></span>
            </div>
          )) : (
            <div style={{textAlign:'center',padding:'2.5rem 1rem',background:'rgba(0,170,255,0.02)',
              border:'1px dashed rgba(0,170,255,0.12)',borderRadius:14,color:'#3D6080'}}>
              <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>🚀</div>
              <div>No activity yet — generate your first content!</div>
            </div>
          )}
        </div>
        <div>
          <div style={{fontSize:'0.68rem',fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'#3D6080',marginBottom:'0.85rem'}}>⚡ Quick Actions</div>
          <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            {[['✨  Generate New Content','/generate',true],['🕐  View History','/history',false],['🔖  Saved Posts','/saved',false]].map(([label,path,primary])=>(
              <button key={path} onClick={()=>navigate(path)} style={{
                padding:'0.7rem 1rem',borderRadius:10,cursor:'pointer',fontWeight:600,
                fontSize:'0.875rem',transition:'all 0.15s',textAlign:'left',fontFamily:'Inter,sans-serif',
                border:primary?'1px solid rgba(0,170,255,0.3)':'1px solid rgba(0,170,255,0.1)',
                background:primary?'rgba(0,170,255,0.1)':'transparent',
                color:primary?'#33BBFF':'#7BA3C4'}}>{label}</button>
            ))}
          </div>
          {plan==='free' && (
            <div style={{marginTop:'1rem',background:'linear-gradient(135deg,rgba(0,170,255,0.07),rgba(123,97,255,0.05))',
              border:'1px solid rgba(0,170,255,0.25)',borderRadius:14,padding:'1.25rem',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,#00AAFF,#7B61FF,#00D4FF)'}} />
              <h3 style={{color:'#33BBFF',fontSize:'0.95rem',fontWeight:700,marginBottom:'0.35rem'}}>🚀 Unlock Pro</h3>
              <p style={{color:'#7BA3C4',fontSize:'0.82rem',marginBottom:'0.85rem'}}>3 generations/day on Free. Go unlimited with Pro.</p>
              <button onClick={()=>navigate('/upgrade')} style={{width:'100%',padding:'0.65rem',borderRadius:8,border:'none',
                background:'linear-gradient(135deg,#00AAFF,#0066CC)',color:'#fff',fontWeight:700,
                fontSize:'0.85rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>⚡ Upgrade to Pro →</button>
            </div>
          )}
        </div>
      </div>
      <Divider />
      <div style={{fontSize:'0.68rem',fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'#3D6080',marginBottom:'1rem'}}>🎯 Platforms You Generate For</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.75rem'}}>
        {[['🐦','Twitter/X','10 tweets'],['💼','LinkedIn','5 posts'],['📸','Instagram','5 captions'],['🎵','TikTok','3 scripts'],
          ['🧵','Threads','5 posts'],['📧','Email','3 newsletters'],['▶️','YouTube','1 description'],['📝','Blog','Full article']
        ].map(([icon,name,count])=>(
          <div key={name} style={{background:'rgba(0,170,255,0.03)',border:'1px solid rgba(0,170,255,0.08)',
            borderRadius:12,padding:'0.85rem',textAlign:'center',transition:'all 0.2s',cursor:'default'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(0,170,255,0.22)';e.currentTarget.style.background='rgba(0,170,255,0.07)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(0,170,255,0.08)';e.currentTarget.style.background='rgba(0,170,255,0.03)';}}>
            <div style={{fontSize:'1.5rem'}}>{icon}</div>
            <div style={{fontSize:'0.82rem',fontWeight:600,color:'#E8F4FF',marginTop:'0.25rem'}}>{name}</div>
            <div style={{fontSize:'0.72rem',color:'#3D6080'}}>{count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
