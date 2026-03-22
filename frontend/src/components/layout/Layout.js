import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';

const NAV = [
  { to:'/dashboard', icon:'📊', label:'Dashboard' },
  { to:'/generate',  icon:'✨', label:'Generate Content' },
  { to:'/history',   icon:'🕐', label:'History' },
  { to:'/saved',     icon:'🔖', label:'Saved Posts' },
  { to:'/export',    icon:'📤', label:'Export' },
  { to:'/upgrade',   icon:'⚡', label:'Plans & Billing' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'var(--bg-base)'}}>
      <aside style={{
        width:255,background:'var(--bg-secondary)',borderRight:'1px solid var(--border-mid)',
        display:'flex',flexDirection:'column',padding:'1.5rem 0.85rem',
        position:'fixed',height:'100vh',overflowY:'auto',
        boxShadow:'4px 0 30px rgba(0,0,0,0.5)',zIndex:100
      }}>
        <div style={{display:'flex',alignItems:'center',gap:10,paddingBottom:'2rem',paddingLeft:'0.4rem'}}>
          <span style={{fontSize:'1.6rem'}}>⚡</span>
          <span style={{
            fontSize:'1.2rem',fontWeight:800,letterSpacing:'-0.03em',
            background:'linear-gradient(135deg,#33BBFF,#00D4FF)',
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'
          }}>RepurposeAI</span>
        </div>

        <nav style={{flex:1,display:'flex',flexDirection:'column',gap:3}}>
          {NAV.map(({to,icon,label}) => (
            <NavLink key={to} to={to} style={({isActive}) => ({
              display:'flex',alignItems:'center',gap:10,padding:'0.6rem 0.85rem',
              borderRadius:9,textDecoration:'none',fontWeight:500,fontSize:'0.875rem',
              transition:'all 0.15s',
              background:isActive?'rgba(0,170,255,0.12)':'transparent',
              color:isActive?'#33BBFF':'#7BA3C4',
              border:`1px solid ${isActive?'rgba(0,170,255,0.25)':'transparent'}`,
            })}>
              <span style={{fontSize:'1rem'}}>{icon}</span>{label}
            </NavLink>
          ))}
        </nav>

        <div style={{height:1,background:'linear-gradient(90deg,transparent,rgba(0,170,255,0.2),transparent)',margin:'1rem 0'}} />

        <div style={{paddingLeft:'0.4rem',marginBottom:'0.75rem'}}>
          <div style={{fontSize:'0.82rem',color:'#7BA3C4',fontWeight:600,marginBottom:2}}>{user?.name}</div>
          <div style={{fontSize:'0.73rem',color:'#3D6080',marginBottom:8}}>{user?.email}</div>
          <span style={{
            display:'inline-flex',alignItems:'center',padding:'3px 10px',borderRadius:20,
            fontSize:'0.68rem',fontWeight:700,letterSpacing:'0.07em',textTransform:'uppercase',
            ...(user?.plan==='pro'
              ? {background:'rgba(0,170,255,0.15)',color:'#33BBFF',border:'1px solid rgba(0,170,255,0.35)'}
              : {background:'rgba(61,96,128,0.2)',color:'#3D6080',border:'1px solid rgba(61,96,128,0.3)'})
          }}>{user?.plan==='pro'?'⚡ PRO':'Free Plan'}</span>
        </div>

        <button onClick={handleLogout} style={{
          display:'flex',alignItems:'center',gap:8,padding:'0.6rem 0.85rem',
          borderRadius:9,border:'1px solid transparent',background:'transparent',
          color:'#3D6080',fontSize:'0.875rem',fontWeight:500,cursor:'pointer',
          transition:'all 0.15s',width:'100%',fontFamily:'Inter,sans-serif'
        }}
          onMouseEnter={e=>{e.currentTarget.style.color='#FF4D6A';e.currentTarget.style.background='rgba(255,77,106,0.07)';}}
          onMouseLeave={e=>{e.currentTarget.style.color='#3D6080';e.currentTarget.style.background='transparent';}}>
          🚪 Sign Out
        </button>
      </aside>

      <main style={{
        marginLeft:255,flex:1,padding:'2rem 2.5rem',minHeight:'100vh',maxWidth:'calc(100vw - 255px)',
        background:'radial-gradient(ellipse 80% 50% at 50% -20%,rgba(0,170,255,0.05) 0%,transparent 60%), var(--bg-base)'
      }}>
        <Outlet />
      </main>
    </div>
  );
}
