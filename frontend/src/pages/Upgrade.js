import { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

function PlanCard({name,price,period,features,color,isCurrent,isPro,badge,highlight}) {
  return (
    <div style={{background:'#0C1524',borderRadius:18,padding:'2rem',position:'relative',overflow:'hidden',
      border:`${highlight?2:1}px solid ${highlight?color+'50':'rgba(0,170,255,0.08)'}`,
      boxShadow:highlight?`0 0 50px ${color}12`:'none'}}>
      {highlight&&<div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${color},transparent)`}} />}
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:'1rem'}}>
        <span style={{fontSize:'1rem',fontWeight:700,color,textTransform:'uppercase',letterSpacing:'0.08em'}}>{name}</span>
        {badge&&<span style={{background:'rgba(0,229,160,0.12)',color:'#00E5A0',padding:'2px 8px',borderRadius:20,
          fontSize:'0.68rem',fontWeight:700,border:'1px solid rgba(0,229,160,0.25)'}}>{badge}</span>}
      </div>
      <div style={{fontSize:'3rem',fontWeight:800,lineHeight:1,marginBottom:'0.25rem',
        ...(isPro?{background:'linear-gradient(135deg,#E8F4FF,#00AAFF)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}:{color:'#E8F4FF'})
      }}>{price}</div>
      <div style={{color:'#3D6080',fontSize:'0.85rem',marginBottom:'1.5rem'}}>{period}</div>
      <div style={{display:'flex',flexDirection:'column',gap:'0.6rem'}}>
        {features.map(f=>(
          <div key={f} style={{color:isPro?'#E8F4FF':'#7BA3C4',fontSize:'0.85rem'}}>
            {isPro?'⚡ ':' ✓ '}{f}
          </div>
        ))}
      </div>
      {isCurrent&&<div style={{marginTop:'1.5rem',color,fontWeight:600,fontSize:'0.85rem'}}>✓ Current Plan</div>}
    </div>
  );
}

export default function Upgrade() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const plan = user?.plan || 'free';

  useEffect(() => {
    if (window.Razorpay) { setScriptLoaded(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => toast.error('Failed to load payment gateway');
    document.head.appendChild(script);
  }, []);

  const handleUpgrade = async () => {
    if (!scriptLoaded) return toast.error('Payment gateway loading... please wait');
    setLoading(true);
    try {
      const { data: order } = await API.post('/payment/create-order');
      const options = {
        key: order.key_id, amount: order.amount, currency: order.currency,
        name: 'RepurposeAI', description: 'Pro Plan — Unlimited Content Generation',
        order_id: order.order_id,
        prefill: { name: order.user_name, email: order.user_email },
        theme: { color: '#00AAFF' },
        handler: async (response) => {
          try {
            await API.post('/payment/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });
            await refreshUser();
            toast.success('🎉 Welcome to Pro! Unlimited access unlocked!');
          } catch { toast.error('Payment verification failed. Contact support.'); }
          finally { setLoading(false); }
        },
        modal: { ondismiss: () => setLoading(false) }
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => { setLoading(false); toast.error('Payment failed. Please try again.'); });
      rzp.open();
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.error || 'Failed to create payment order');
    }
  };

  return (
    <div>
      <div style={{marginBottom:'1.75rem'}}>
        <h1 style={{fontSize:'1.9rem',fontWeight:800,letterSpacing:'-0.03em',marginBottom:'0.3rem',
          background:'linear-gradient(135deg,#E8F4FF,#33BBFF,#00D4FF)',
          WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>⚡ Plans & Billing</h1>
        <p style={{color:'#7BA3C4',fontSize:'0.9rem'}}>Invest in your content strategy.</p>
      </div>

      {plan==='pro' && (
        <div style={{background:'rgba(0,170,255,0.06)',border:'1px solid rgba(0,170,255,0.25)',borderRadius:14,
          padding:'1.25rem',marginBottom:'1.75rem',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,#00AAFF,#00D4FF,transparent)'}} />
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <span style={{fontSize:'2rem'}}>🎉</span>
            <div>
              <div style={{fontWeight:700,fontSize:'1.1rem',background:'linear-gradient(135deg,#E8F4FF,#00AAFF)',
                WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>You're on Pro!</div>
              <div style={{color:'#7BA3C4',fontSize:'0.85rem'}}>Unlimited generations · All 8 platforms · Priority AI</div>
            </div>
          </div>
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.25rem',marginBottom:'2rem'}}>
        <PlanCard name="Free Plan" price="₹0" period="per month, forever"
          features={['3 generations per day','All 8 platforms','Export MD, CSV, JSON','Save & history']}
          color="#7BA3C4" isCurrent={plan==='free'} />
        <PlanCard name="Pro Plan" price="₹399" period="per month · cancel anytime" badge="BEST VALUE" highlight
          features={['Unlimited generations','All 8 platforms','Priority AI speed','Export MD, CSV, JSON','Everything in Free']}
          color="#00AAFF" isCurrent={plan==='pro'} isPro />
      </div>

      {plan==='free' && (
        <div style={{display:'flex',justifyContent:'center'}}>
          <div style={{width:'100%',maxWidth:480}}>
            <button onClick={handleUpgrade} disabled={loading||!scriptLoaded} style={{
              width:'100%',padding:'1.1rem 2rem',borderRadius:14,border:'none',
              background:loading?'#0066CC':'linear-gradient(135deg,#00AAFF 0%,#0055AA 100%)',
              color:'#fff',fontWeight:700,fontSize:'1.05rem',
              cursor:loading?'not-allowed':'pointer',
              boxShadow:'0 4px 30px rgba(0,170,255,0.4)',
              transition:'all 0.2s',fontFamily:'Inter,sans-serif'}}>
              {loading?'⏳ Opening payment gateway...':'⚡ Upgrade to Pro — ₹399/mo'}
            </button>
            <div style={{display:'flex',justifyContent:'center',gap:8,flexWrap:'wrap',marginTop:'0.85rem'}}>
              {['📱 UPI','💳 Cards','🏦 Net Banking','👛 Wallets'].map(m=>(
                <span key={m} style={{background:'rgba(0,170,255,0.07)',border:'1px solid rgba(0,170,255,0.18)',
                  borderRadius:8,padding:'4px 12px',color:'#7BA3C4',fontSize:'0.72rem',fontWeight:600}}>{m}</span>
              ))}
            </div>
            <div style={{textAlign:'center',marginTop:'0.75rem',color:'#3D6080',fontSize:'0.75rem'}}>
              🔒 Secured by Razorpay · 256-bit SSL encryption
            </div>
          </div>
        </div>
      )}

      <div style={{marginTop:'2.5rem'}}>
        <div style={{fontSize:'0.68rem',fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'#3D6080',marginBottom:'1rem'}}>FAQ</div>
        {[
          ['Can I cancel anytime?','Yes. Cancel anytime, no hidden fees.'],
          ['What payment methods?','UPI, credit/debit cards, net banking, wallets via Razorpay.'],
          ['When does Pro activate?','Immediately after payment verification.'],
          ['Is my payment secure?','Yes. Razorpay is PCI DSS Level 1 certified.'],
        ].map(([q,a])=>(
          <div key={q} style={{background:'#0C1524',border:'1px solid rgba(0,170,255,0.08)',
            borderRadius:12,padding:'1rem 1.25rem',marginBottom:'0.5rem'}}>
            <div style={{fontWeight:600,color:'#E8F4FF',fontSize:'0.875rem',marginBottom:'0.25rem'}}>{q}</div>
            <div style={{color:'#7BA3C4',fontSize:'0.82rem'}}>{a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
