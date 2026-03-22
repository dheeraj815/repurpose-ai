import { useState } from 'react';
import toast from 'react-hot-toast';
import API from '../../utils/api';

const TABS = [
  {key:'twitter',   label:'🐦 Twitter',  color:'#1DA1F2'},
  {key:'linkedin',  label:'💼 LinkedIn',  color:'#4B9FE1'},
  {key:'instagram', label:'📸 Instagram', color:'#E1306C'},
  {key:'tiktok',    label:'🎵 TikTok',    color:'#FF4080'},
  {key:'threads',   label:'🧵 Threads',   color:'#CCC'},
  {key:'email',     label:'📧 Email',     color:'#00E5A0'},
  {key:'youtube',   label:'▶️ YouTube',   color:'#FF4444'},
  {key:'blog',      label:'📝 Blog',      color:'#FFD166'},
];

export default function ResultTabs({ results, userId, genId }) {
  const [active, setActive] = useState('twitter');
  const [saved, setSaved] = useState({});

  const getPosts = (key) => {
    if (key === 'youtube') return results.youtube_desc ? [results.youtube_desc] : [];
    if (key === 'blog') return results.blog_summary ? [results.blog_summary] : [];
    return results[key] || [];
  };

  const copyPost = (content) => {
    navigator.clipboard.writeText(content)
      .then(() => toast.success('Copied to clipboard!'))
      .catch(() => toast.error('Copy failed'));
  };

  const savePost = async (platform, content, i) => {
    const key = `${platform}_${i}`;
    try {
      await API.post('/user/saved', { platform, content, generation_id: genId });
      setSaved(s => ({...s, [key]: true}));
      toast.success('🔖 Saved!');
    } catch { toast.error('Failed to save'); }
  };

  const current = TABS.find(t => t.key === active);
  const posts = getPosts(active);

  return (
    <div style={{marginTop:'2rem'}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:'1.25rem'}}>
        <h2 style={{fontSize:'1.4rem',fontWeight:800,
          background:'linear-gradient(135deg,#E8F4FF,#00AAFF)',
          WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Generated Content</h2>
        <span style={{background:'rgba(0,229,160,0.1)',color:'#00E5A0',padding:'3px 10px',
          borderRadius:20,fontSize:'0.72rem',fontWeight:700,border:'1px solid rgba(0,229,160,0.25)'}}>
          ✓ READY TO PUBLISH
        </span>
      </div>

      {/* Tab bar */}
      <div style={{display:'flex',gap:4,flexWrap:'wrap',background:'#0C1524',
        border:'1px solid rgba(0,170,255,0.1)',borderRadius:12,padding:4,marginBottom:'1.25rem'}}>
        {TABS.map(t => {
          const count = getPosts(t.key).length;
          const isActive = active === t.key;
          return (
            <button key={t.key} onClick={() => setActive(t.key)} style={{
              padding:'0.38rem 0.75rem',borderRadius:9,border:`1px solid ${isActive?t.color+'44':'transparent'}`,
              cursor:'pointer',fontSize:'0.78rem',fontWeight:500,transition:'all 0.15s',
              background:isActive?`${t.color}18`:'transparent',
              color:isActive?t.color:'#7BA3C4',fontFamily:'Inter,sans-serif'}}>
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div style={{textAlign:'center',padding:'2rem',background:'rgba(0,170,255,0.02)',
          border:'1px dashed rgba(0,170,255,0.1)',borderRadius:12,color:'#3D6080'}}>
          No {current?.label} content generated.
        </div>
      ) : posts.map((post, i) => (
        <PostCard key={i} post={post} platform={active} index={i}
          color={current?.color}
          onCopy={() => copyPost(post)}
          onSave={() => savePost(active, post, i)}
          isSaved={!!saved[`${active}_${i}`]}
          isBlog={active === 'blog'} />
      ))}
    </div>
  );
}

function PostCard({ post, platform, index, color, onCopy, onSave, isSaved, isBlog }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{background:'#0C1524',border:`1px solid ${hovered?'rgba(0,170,255,0.28)':'rgba(0,170,255,0.08)'}`,
      borderRadius:14,padding:'1.1rem 1.3rem',marginBottom:'0.75rem',
      transition:'all 0.2s',transform:hovered?'translateY(-1px)':'none'}}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.7rem'}}>
        <span style={{padding:'3px 10px',borderRadius:20,fontSize:'0.72rem',fontWeight:700,
          textTransform:'uppercase',letterSpacing:'0.04em',
          background:`${color}18`,color,border:`1px solid ${color}33`}}>
          {platform} #{index+1}
        </span>
        <div style={{display:'flex',gap:6,alignItems:'center'}}>
          <span style={{fontSize:'0.7rem',color:'#3D6080'}}>{post.length} chars</span>
          <button onClick={onCopy} title="Copy" style={{padding:'4px 8px',borderRadius:6,border:'none',
            background:'rgba(0,170,255,0.08)',cursor:'pointer',fontSize:'0.85rem',transition:'all 0.15s'}}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(0,170,255,0.18)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(0,170,255,0.08)'}>📋</button>
          <button onClick={onSave} title="Save" style={{padding:'4px 8px',borderRadius:6,border:'none',
            background:isSaved?'rgba(0,229,160,0.15)':'rgba(0,170,255,0.08)',
            cursor:'pointer',fontSize:'0.85rem',transition:'all 0.15s'}}>🔖</button>
        </div>
      </div>
      {isBlog ? (
        <div style={{color:'#E8F4FF',fontSize:'0.88rem',lineHeight:1.7}}>
          {post.split('\n').map((line,j) => {
            if(line.startsWith('# ')) return <h1 key={j} style={{fontSize:'1.4rem',fontWeight:800,color:'#33BBFF',margin:'0.5rem 0'}}>{line.slice(2)}</h1>;
            if(line.startsWith('## ')) return <h2 key={j} style={{fontSize:'1.1rem',fontWeight:700,color:'#7BA3C4',margin:'0.75rem 0 0.25rem'}}>{line.slice(3)}</h2>;
            if(line.startsWith('### ')) return <h3 key={j} style={{fontSize:'0.95rem',fontWeight:600,color:'#7BA3C4',margin:'0.5rem 0'}}>{line.slice(4)}</h3>;
            if(!line.trim()) return <br key={j} />;
            return <p key={j} style={{margin:'0.35rem 0'}}>{line}</p>;
          })}
        </div>
      ) : (
        <div style={{fontSize:'0.88rem',lineHeight:1.7,color:'#E8F4FF',whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{post}</div>
      )}
    </div>
  );
}
