import { useEffect, useState } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function Export() {
  const [gens, setGens] = useState([]);
  const [selected, setSelected] = useState(null);
  const [gen, setGen] = useState(null);

  useEffect(() => {
    API.get('/generate/history?limit=50').then(r => {
      setGens(r.data.generations);
      if (r.data.generations.length > 0) setSelected(r.data.generations[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    API.get(`/generate/history/${selected}`).then(r => setGen(r.data.generation));
  }, [selected]);

  const download = (content, filename, mime) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=filename; a.click();
    URL.revokeObjectURL(url);
  };

  const exportMD = () => {
    if (!gen) return;
    let md = `# Content Repurposer Export\n**Generated:** ${gen.created_at}\n\n`;
    if (gen.blog_summary) md += `## 📝 Blog\n\n${gen.blog_summary}\n\n`;
    (gen.twitter_posts||[]).forEach((p,i) => md += `## 🐦 Tweet ${i+1}\n\n${p}\n\n`);
    (gen.linkedin_posts||[]).forEach((p,i) => md += `## 💼 LinkedIn ${i+1}\n\n${p}\n\n`);
    (gen.instagram_captions||[]).forEach((p,i) => md += `## 📸 Instagram ${i+1}\n\n${p}\n\n`);
    (gen.email_newsletters||[]).forEach((p,i) => md += `## 📧 Email ${i+1}\n\n${p}\n\n`);
    download(md, `repurposed_${selected}.md`, 'text/markdown');
    toast.success('Downloaded Markdown!');
  };

  const exportCSV = () => {
    if (!gen) return;
    const rows = [['Platform','#','Content']];
    (gen.twitter_posts||[]).forEach((p,i) => rows.push(['Twitter',i+1,p]));
    (gen.linkedin_posts||[]).forEach((p,i) => rows.push(['LinkedIn',i+1,p]));
    (gen.instagram_captions||[]).forEach((p,i) => rows.push(['Instagram',i+1,p]));
    (gen.email_newsletters||[]).forEach((p,i) => rows.push(['Email',i+1,p]));
    if (gen.blog_summary) rows.push(['Blog',1,gen.blog_summary]);
    const csv = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    download(csv, `repurposed_${selected}.csv`, 'text/csv');
    toast.success('Downloaded CSV!');
  };

  const exportJSON = () => {
    if (!gen) return;
    download(JSON.stringify(gen,null,2), `repurposed_${selected}.json`, 'application/json');
    toast.success('Downloaded JSON!');
  };

  const formats = [
    {icon:'📝',label:'Markdown',sub:'Notion, GitHub, blogs',action:exportMD,ext:'.md',color:'#33BBFF'},
    {icon:'📊',label:'CSV',sub:'Excel, Google Sheets',action:exportCSV,ext:'.csv',color:'#00E5A0'},
    {icon:'📋',label:'JSON',sub:'Developers, APIs',action:exportJSON,ext:'.json',color:'#FFD166'},
  ];

  return (
    <div>
      <div style={{marginBottom:'1.75rem'}}>
        <h1 style={{fontSize:'1.9rem',fontWeight:800,letterSpacing:'-0.03em',marginBottom:'0.3rem',
          background:'linear-gradient(135deg,#E8F4FF,#33BBFF,#00D4FF)',
          WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>📤 Export Content</h1>
        <p style={{color:'#7BA3C4',fontSize:'0.9rem'}}>Download your generated content in multiple formats.</p>
      </div>

      {gens.length === 0 ? (
        <div style={{textAlign:'center',padding:'3rem',background:'rgba(0,170,255,0.02)',
          border:'1px dashed rgba(0,170,255,0.1)',borderRadius:16,color:'#3D6080'}}>No generations to export yet.</div>
      ) : (
        <>
          <div style={{marginBottom:'1.75rem'}}>
            <label style={{display:'block',fontSize:'0.8rem',fontWeight:600,color:'#7BA3C4',marginBottom:'0.4rem'}}>Select Generation</label>
            <select value={selected||''} onChange={e=>setSelected(Number(e.target.value))} style={{
              width:'100%',maxWidth:520,padding:'0.7rem 1rem',borderRadius:10,
              border:'1px solid rgba(0,170,255,0.15)',background:'#0C1524',color:'#E8F4FF',
              fontSize:'0.9rem',outline:'none',fontFamily:'Inter,sans-serif'}}>
              {gens.map(g=>(
                <option key={g.id} value={g.id}>#{g.id} — {g.source_type?.replace(/_/g,' ')} ({g.created_at?.slice(0,16)})</option>
              ))}
            </select>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem'}}>
            {formats.map(fmt=>(
              <div key={fmt.label} style={{background:'#0C1524',border:`1px solid ${fmt.color}25`,
                borderRadius:16,padding:'1.75rem',textAlign:'center',position:'relative',overflow:'hidden',
                transition:'all 0.2s'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=`${fmt.color}55`;e.currentTarget.style.boxShadow=`0 0 30px ${fmt.color}12`;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=`${fmt.color}25`;e.currentTarget.style.boxShadow='none';}}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${fmt.color},transparent)`}} />
                <div style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>{fmt.icon}</div>
                <div style={{fontWeight:700,color:'#E8F4FF',marginBottom:'0.25rem'}}>{fmt.label}</div>
                <div style={{fontSize:'0.78rem',color:'#3D6080',marginBottom:'1.25rem'}}>{fmt.sub}</div>
                <button onClick={fmt.action} disabled={!gen} style={{
                  width:'100%',padding:'0.65rem',borderRadius:8,border:`1px solid ${fmt.color}44`,
                  background:`${fmt.color}15`,color:fmt.color,fontWeight:700,
                  fontSize:'0.85rem',cursor:gen?'pointer':'not-allowed',fontFamily:'Inter,sans-serif',transition:'all 0.15s'}}
                  onMouseEnter={e=>e.currentTarget.style.background=`${fmt.color}28`}
                  onMouseLeave={e=>e.currentTarget.style.background=`${fmt.color}15`}>
                  ⬇️ Download {fmt.ext}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
