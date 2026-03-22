import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';
import ResultTabs from '../components/ui/ResultTabs';

export default function Generate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sourceType, setSourceType] = useState('text');
  const [text, setText] = useState('');
  const [ytUrl, setYtUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [fetchingYt, setFetchingYt] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [genId, setGenId] = useState(null);
  const [usage, setUsage] = useState(null);
  const plan = user?.plan || 'free';

  useEffect(() => {
    API.get('/user/usage').then(r => setUsage(r.data)).catch(console.error);
  }, []);

  const fetchTranscript = async () => {
    if (!ytUrl) return;
    setFetchingYt(true);
    try {
      const r = await API.post('/generate/youtube', { url: ytUrl });
      setTranscript(r.data.transcript);
      toast.success(`✅ Transcript fetched! ${r.data.length.toLocaleString()} chars`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to fetch transcript');
    } finally { setFetchingYt(false); }
  };

  const handleGenerate = async () => {
    const sourceText = sourceType === 'youtube' ? transcript : text;
    if (!sourceText || sourceText.trim().length < 50) {
      return toast.error('Please provide at least 50 characters of content');
    }
    setGenerating(true); setProgress(10); setResults(null);
    const prog = setInterval(() => setProgress(p => Math.min(p + 6, 88)), 700);
    try {
      const r = await API.post('/generate/', {
        source_text: sourceText,
        source_type: sourceType,
        source_url: sourceType === 'youtube' ? ytUrl : null
      });
      clearInterval(prog); setProgress(100);
      setTimeout(() => { setProgress(0); setResults(r.data.results); setGenId(r.data.generation_id); }, 300);
      toast.success('🎉 Content generated for 8 platforms!');
      setUsage(u => u ? {...u, today_usage: u.today_usage + 1} : u);
    } catch (err) {
      clearInterval(prog); setProgress(0);
      if (err.response?.status === 429) {
        toast.error('Daily limit reached! Upgrade to Pro.'); navigate('/upgrade');
      } else { toast.error(err.response?.data?.error || 'Generation failed'); }
    } finally { setGenerating(false); }
  };

  const dailyUsed = usage?.today_usage || 0;
  const usagePct = Math.min((dailyUsed / 3) * 100, 100);
  const usageColor = dailyUsed >= 3 ? '#FF4D6A' : dailyUsed === 2 ? '#FFD166' : '#00E5A0';

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.75rem'}}>
        <div>
          <h1 style={{fontSize:'1.9rem',fontWeight:800,letterSpacing:'-0.03em',marginBottom:'0.3rem',
            background:'linear-gradient(135deg,#E8F4FF,#33BBFF,#00D4FF)',
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>✨ Generate Content</h1>
          <p style={{color:'#7BA3C4',fontSize:'0.9rem'}}>One input → 8 platforms → unlimited reach.</p>
        </div>
        {results && (
          <button onClick={() => { setResults(null); setText(''); setTranscript(''); setYtUrl(''); }} style={{
            padding:'0.5rem 1rem',borderRadius:8,border:'1px solid rgba(255,77,106,0.25)',
            background:'rgba(255,77,106,0.06)',color:'#FF4D6A',fontWeight:600,
            fontSize:'0.8rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>🗑️ Clear</button>
        )}
      </div>

      {plan === 'free' && usage && (
        <div style={{background:'rgba(0,0,0,0.3)',border:`1px solid ${usageColor}30`,
          borderRadius:12,padding:'0.85rem 1.25rem',marginBottom:'1.25rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.5rem'}}>
            <span style={{color:'#7BA3C4',fontSize:'0.82rem',fontWeight:500}}>Daily Usage</span>
            <span style={{color:usageColor,fontWeight:700,fontSize:'0.9rem'}}>{dailyUsed} / 3 used</span>
          </div>
          <div style={{background:'rgba(255,255,255,0.06)',borderRadius:4,height:4}}>
            <div style={{background:usageColor,width:`${usagePct}%`,height:4,borderRadius:4,
              transition:'width 0.5s',boxShadow:`0 0 8px ${usageColor}`}} />
          </div>
        </div>
      )}

      {plan === 'free' && (usage?.today_usage || 0) >= 3 ? (
        <div style={{textAlign:'center',padding:'3rem',background:'rgba(255,77,106,0.04)',
          border:'1px solid rgba(255,77,106,0.2)',borderRadius:16}}>
          <div style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>🔒</div>
          <div style={{color:'#FF4D6A',fontWeight:700,fontSize:'1.1rem',marginBottom:'0.3rem'}}>Daily limit reached</div>
          <div style={{color:'#7BA3C4',fontSize:'0.85rem',marginBottom:'1.5rem'}}>Upgrade to Pro for unlimited generations</div>
          <button onClick={() => navigate('/upgrade')} style={{padding:'0.75rem 2rem',borderRadius:10,border:'none',
            background:'linear-gradient(135deg,#00AAFF,#0066CC)',color:'#fff',fontWeight:700,
            fontSize:'0.95rem',cursor:'pointer',fontFamily:'Inter,sans-serif',boxShadow:'0 4px 20px rgba(0,170,255,0.3)'}}>
            ⚡ Upgrade to Pro — ₹399/mo
          </button>
        </div>
      ) : (
        <div style={{background:'#0C1524',border:'1px solid rgba(0,170,255,0.15)',borderRadius:16,padding:'1.75rem',marginBottom:'1.5rem'}}>
          <div style={{display:'flex',gap:8,marginBottom:'1.25rem'}}>
            {[['text','📝 Text / Blog'],['youtube','🎬 YouTube URL']].map(([key,label]) => (
              <button key={key} onClick={() => { setSourceType(key); setResults(null); }} style={{
                padding:'0.5rem 1.25rem',borderRadius:8,fontWeight:600,fontSize:'0.85rem',cursor:'pointer',
                transition:'all 0.15s',fontFamily:'Inter,sans-serif',
                border:`1px solid ${sourceType===key?'rgba(0,170,255,0.4)':'rgba(0,170,255,0.12)'}`,
                background:sourceType===key?'rgba(0,170,255,0.12)':'transparent',
                color:sourceType===key?'#33BBFF':'#7BA3C4'}}>{label}</button>
            ))}
          </div>

          {sourceType === 'youtube' ? (
            <div>
              <label style={{display:'block',fontSize:'0.8rem',fontWeight:600,color:'#7BA3C4',marginBottom:'0.4rem'}}>YouTube Video URL</label>
              <div style={{display:'flex',gap:8}}>
                <input value={ytUrl} onChange={e => setYtUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  style={{flex:1,padding:'0.7rem 1rem',borderRadius:10,border:'1px solid rgba(0,170,255,0.15)',
                    background:'#080F1A',color:'#E8F4FF',fontSize:'0.9rem',outline:'none',fontFamily:'Inter,sans-serif'}}
                  onFocus={e=>e.target.style.borderColor='#00AAFF'}
                  onBlur={e=>e.target.style.borderColor='rgba(0,170,255,0.15)'} />
                <button onClick={fetchTranscript} disabled={fetchingYt||!ytUrl} style={{
                  padding:'0.7rem 1.25rem',borderRadius:10,fontWeight:600,cursor:'pointer',
                  fontSize:'0.875rem',whiteSpace:'nowrap',fontFamily:'Inter,sans-serif',
                  border:'1px solid rgba(0,170,255,0.3)',
                  background:'rgba(0,170,255,0.12)',color:'#33BBFF'}}>
                  {fetchingYt?'⏳ Fetching...':'🎬 Fetch'}
                </button>
              </div>
              {transcript && (
                <div style={{marginTop:'0.75rem',padding:'0.75rem 1rem',background:'rgba(0,229,160,0.05)',
                  border:'1px solid rgba(0,229,160,0.2)',borderRadius:10}}>
                  <span style={{color:'#00E5A0',fontSize:'0.82rem',fontWeight:600}}>
                    ✅ Transcript ready — {transcript.length.toLocaleString()} chars
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label style={{display:'block',fontSize:'0.8rem',fontWeight:600,color:'#7BA3C4',marginBottom:'0.4rem'}}>Paste your content</label>
              <textarea value={text} onChange={e => setText(e.target.value)} rows={8}
                placeholder={"Paste a blog post, article, podcast transcript, or any text here...\n\nMinimum 50 characters required."}
                style={{width:'100%',padding:'0.85rem 1rem',borderRadius:10,border:'1px solid rgba(0,170,255,0.15)',
                  background:'#080F1A',color:'#E8F4FF',fontSize:'0.9rem',outline:'none',resize:'vertical',
                  fontFamily:'Inter,sans-serif',lineHeight:1.6}}
                onFocus={e=>e.target.style.borderColor='#00AAFF'}
                onBlur={e=>e.target.style.borderColor='rgba(0,170,255,0.15)'} />
              {text && <div style={{fontSize:'0.72rem',color:'#3D6080',fontFamily:'JetBrains Mono,monospace',marginTop:'0.3rem'}}>
                📊 {text.length.toLocaleString()} chars · {text.split(/\s+/).filter(Boolean).length.toLocaleString()} words
              </div>}
            </div>
          )}

          <button onClick={handleGenerate}
            disabled={generating || (sourceType==='youtube'?!transcript:text.length<50)}
            style={{width:'100%',marginTop:'1.25rem',padding:'0.92rem',borderRadius:12,border:'none',
              background:generating?'#0066CC':'linear-gradient(135deg,#00AAFF,#0066CC)',
              color:'#fff',fontWeight:700,fontSize:'1rem',
              cursor:generating?'not-allowed':'pointer',
              boxShadow:'0 4px 24px rgba(0,170,255,0.35)',
              transition:'all 0.2s',fontFamily:'Inter,sans-serif'}}>
            {generating?'🤖 AI generating content across 8 platforms...':'🚀 Generate All Content'}
          </button>

          {progress > 0 && (
            <div style={{marginTop:'0.75rem',background:'rgba(0,170,255,0.06)',borderRadius:4,height:4,overflow:'hidden'}}>
              <div style={{height:4,borderRadius:4,width:`${progress}%`,transition:'width 0.4s',
                background:'linear-gradient(90deg,#00AAFF,#00D4FF,#7B61FF)'}} />
            </div>
          )}
        </div>
      )}

      {results && <ResultTabs results={results} userId={user?.id} genId={genId} />}
    </div>
  );
}
