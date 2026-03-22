import { useEffect, useState } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const COLORS = {twitter:'#1DA1F2',linkedin:'#4B9FE1',instagram:'#E1306C',
  tiktok:'#FF4080',threads:'#CCC',email:'#00E5A0',blog:'#FFD166',youtube:'#FF4444'};

export default function SavedPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    API.get('/user/saved').then(r => { setPosts(r.data.posts); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try { await API.delete(`/user/saved/${id}`); setPosts(p=>p.filter(x=>x.id!==id)); toast.success('Deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  const platforms = ['all', ...new Set(posts.map(p=>p.platform))];
  const filtered = filter==='all' ? posts : posts.filter(p=>p.platform===filter);

  if (loading) return <div style={{color:'#7BA3C4',padding:'2rem',fontFamily:'Inter,sans-serif'}}>Loading...</div>;

  return (
    <div>
      <div style={{marginBottom:'1.75rem'}}>
        <h1 style={{fontSize:'1.9rem',fontWeight:800,letterSpacing:'-0.03em',marginBottom:'0.3rem',
          background:'linear-gradient(135deg,#E8F4FF,#33BBFF,#00D4FF)',
          WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>🔖 Saved Posts</h1>
        <p style={{color:'#7BA3C4',fontSize:'0.9rem'}}>Your bookmarked content, ready to publish.</p>
      </div>
      {posts.length === 0 ? (
        <div style={{textAlign:'center',padding:'3rem',background:'rgba(0,170,255,0.02)',
          border:'1px dashed rgba(0,170,255,0.1)',borderRadius:16}}>
          <div style={{fontSize:'2.5rem',marginBottom:'0.75rem'}}>🔖</div>
          <div style={{color:'#7BA3C4'}}>No saved posts yet.</div>
          <div style={{color:'#3D6080',fontSize:'0.82rem',marginTop:'0.3rem'}}>Click 🔖 on any post while generating.</div>
        </div>
      ) : (
        <>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:'1.25rem'}}>
            {platforms.map(p=>(
              <button key={p} onClick={()=>setFilter(p)} style={{
                padding:'0.4rem 1rem',borderRadius:20,fontSize:'0.78rem',fontWeight:600,cursor:'pointer',
                fontFamily:'Inter,sans-serif',textTransform:'capitalize',
                border:`1px solid ${filter===p?'rgba(0,170,255,0.4)':'rgba(0,170,255,0.12)'}`,
                background:filter===p?'rgba(0,170,255,0.12)':'transparent',
                color:filter===p?'#33BBFF':'#7BA3C4'}}>
                {p} {p!=='all'&&`(${posts.filter(x=>x.platform===p).length})`}
              </button>
            ))}
          </div>
          {filtered.map(post => {
            const color = COLORS[post.platform]||'#7BA3C4';
            return (
              <div key={post.id} style={{background:'#0C1524',border:'1px solid rgba(0,170,255,0.08)',
                borderRadius:14,padding:'1.1rem 1.3rem',marginBottom:'0.75rem',transition:'all 0.2s'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(0,170,255,0.25)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(0,170,255,0.08)'}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.7rem'}}>
                  <span style={{padding:'3px 10px',borderRadius:20,fontSize:'0.72rem',fontWeight:700,
                    textTransform:'uppercase',background:`${color}18`,color,border:`1px solid ${color}33`}}>
                    {post.platform}
                  </span>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <span style={{color:'#3D6080',fontSize:'0.72rem'}}>{post.created_at?.slice(0,16)}</span>
                    <button onClick={()=>navigator.clipboard.writeText(post.content).then(()=>toast.success('Copied!'))}
                      style={{padding:'3px 8px',borderRadius:6,border:'none',background:'rgba(0,170,255,0.08)',cursor:'pointer',fontSize:'0.8rem'}}>📋</button>
                    <button onClick={()=>handleDelete(post.id)}
                      style={{padding:'3px 8px',borderRadius:6,border:'none',background:'rgba(255,77,106,0.08)',cursor:'pointer',fontSize:'0.8rem'}}>🗑️</button>
                  </div>
                </div>
                <div style={{fontSize:'0.88rem',lineHeight:1.7,color:'#E8F4FF',whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{post.content}</div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
