import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import toast from 'react-hot-toast';

function Input({ label, type='text', value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{marginBottom:'1rem'}}>
      <label style={{display:'block',fontSize:'0.8rem',fontWeight:600,color:'#7BA3C4',marginBottom:'0.4rem',letterSpacing:'0.04em'}}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} required
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{width:'100%',padding:'0.72rem 1rem',borderRadius:10,
          border:`1px solid ${focused?'#00AAFF':'rgba(0,170,255,0.15)'}`,
          background:focused?'#101D2E':'#0C1524',color:'#E8F4FF',fontSize:'0.9rem',
          outline:'none',transition:'all 0.2s',fontFamily:'Inter,sans-serif',
          boxShadow:focused?'0 0 0 3px rgba(0,170,255,0.12)':'none'}} />
    </div>
  );
}

export default function AuthPage({ mode }) {
  const [tab, setTab] = useState(mode || 'login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'' });
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const handleLogin = async e => {
    e.preventDefault(); setLoading(true);
    try { await login(form.email, form.password); toast.success('Welcome back!'); navigate('/dashboard'); }
    catch(err) { toast.error(err.response?.data?.error || 'Login failed. Check your credentials.'); }
    finally { setLoading(false); }
  };

  const handleRegister = async e => {
    e.preventDefault();
    if(form.password !== form.confirm) return toast.error('Passwords do not match');
    if(form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try { await register(form.name, form.email, form.password); toast.success('Account created! Welcome!'); navigate('/dashboard'); }
    catch(err) { toast.error(err.response?.data?.error || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
      background:'radial-gradient(ellipse 80% 60% at 50% -10%,rgba(0,170,255,0.08) 0%,transparent 60%), #020408',
      padding:'1rem',fontFamily:'Inter,sans-serif'}}>
      <div style={{width:'100%',maxWidth:440}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <div style={{fontSize:'3.5rem',marginBottom:'0.5rem',filter:'drop-shadow(0 0 20px rgba(0,170,255,0.4))'}}>⚡</div>
          <h1 style={{fontSize:'2.2rem',fontWeight:800,letterSpacing:'-0.04em',
            background:'linear-gradient(135deg,#E8F4FF 0%,#00AAFF 50%,#00D4FF 100%)',
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:'0.5rem'}}>RepurposeAI</h1>
          <p style={{color:'#7BA3C4',fontSize:'0.92rem'}}>Transform any content into viral social posts</p>
          <div style={{display:'flex',justifyContent:'center',gap:6,marginTop:'0.9rem',flexWrap:'wrap'}}>
            {['🐦 Twitter','💼 LinkedIn','📸 Instagram','🎵 TikTok','📧 Email','▶️ YouTube'].map(p=>(
              <span key={p} style={{background:'rgba(0,170,255,0.08)',color:'#00AAFF',padding:'3px 10px',
                borderRadius:20,fontSize:'0.72rem',fontWeight:600,border:'1px solid rgba(0,170,255,0.2)'}}>{p}</span>
            ))}
          </div>
        </div>

        <div style={{background:'#0C1524',border:'1px solid rgba(0,170,255,0.18)',borderRadius:20,
          padding:'2rem',boxShadow:'0 0 80px rgba(0,0,0,0.6),0 0 40px rgba(0,170,255,0.04)',
          position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:0,left:0,right:0,height:2,
            background:'linear-gradient(90deg,transparent,#00AAFF,#00D4FF,transparent)'}} />

          <div style={{display:'flex',background:'#080F1A',borderRadius:10,padding:4,marginBottom:'1.75rem',gap:3}}>
            {[['login','Sign In'],['signup','Create Account']].map(([key,label])=>(
              <button key={key} onClick={()=>setTab(key)} style={{
                flex:1,padding:'0.58rem',borderRadius:8,border:'none',cursor:'pointer',
                fontWeight:600,fontSize:'0.875rem',transition:'all 0.2s',fontFamily:'Inter,sans-serif',
                background:tab===key?'linear-gradient(135deg,#00AAFF,#0066CC)':'transparent',
                color:tab===key?'#fff':'#7BA3C4',
                boxShadow:tab===key?'0 2px 16px rgba(0,170,255,0.35)':'none'}}>{label}</button>
            ))}
          </div>

          {tab==='login' ? (
            <form onSubmit={handleLogin}>
              <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
              <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" />
              <button type="submit" disabled={loading} style={{
                width:'100%',padding:'0.82rem',marginTop:'0.5rem',borderRadius:10,border:'none',
                background:loading?'#0066CC':'linear-gradient(135deg,#00AAFF,#0066CC)',
                color:'#fff',fontWeight:700,fontSize:'0.95rem',
                cursor:loading?'not-allowed':'pointer',
                boxShadow:'0 4px 24px rgba(0,170,255,0.35)',fontFamily:'Inter,sans-serif',
                transition:'all 0.2s'}}>
                {loading?'⏳ Signing in...':'Sign In →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <Input label="Full Name" value={form.name} onChange={set('name')} placeholder="Your Name" />
              <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
              <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" />
              <Input label="Confirm Password" type="password" value={form.confirm} onChange={set('confirm')} placeholder="Repeat password" />
              <button type="submit" disabled={loading} style={{
                width:'100%',padding:'0.82rem',marginTop:'0.5rem',borderRadius:10,border:'none',
                background:loading?'#0066CC':'linear-gradient(135deg,#00AAFF,#0066CC)',
                color:'#fff',fontWeight:700,fontSize:'0.95rem',
                cursor:loading?'not-allowed':'pointer',
                boxShadow:'0 4px 24px rgba(0,170,255,0.35)',fontFamily:'Inter,sans-serif'}}>
                {loading?'⏳ Creating account...':'Create Account →'}
              </button>
            </form>
          )}
        </div>

        <p style={{textAlign:'center',marginTop:'1.25rem',color:'#3D6080',fontSize:'0.8rem'}}>
          {tab==='login'
            ? <span>No account? <span onClick={()=>setTab('signup')} style={{color:'#00AAFF',cursor:'pointer',fontWeight:600}}>Sign up free</span></span>
            : <span>Have an account? <span onClick={()=>setTab('login')} style={{color:'#00AAFF',cursor:'pointer',fontWeight:600}}>Sign in</span></span>}
        </p>
      </div>
    </div>
  );
}
