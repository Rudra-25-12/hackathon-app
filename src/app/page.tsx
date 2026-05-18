import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <>
      <style>{`
        @keyframes orb1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(60px,-80px) scale(1.15)} 66%{transform:translate(-40px,60px) scale(0.9)} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-70px,50px) scale(1.2)} 66%{transform:translate(50px,-60px) scale(0.85)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .orb1{animation:orb1 8s ease-in-out infinite}
        .orb2{animation:orb2 10s ease-in-out infinite}
        .fade1{animation:fadeUp 0.6s ease forwards}
        .fade2{animation:fadeUp 0.6s 0.15s ease both}
        .fade3{animation:fadeUp 0.6s 0.3s ease both}
        .fade4{animation:fadeUp 0.6s 0.45s ease both}
        .card:hover{transform:translateY(-2px);border-color:rgba(251,191,36,0.3)!important}
        .card{transition:all 0.2s ease}
      `}</style>

      <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',flexDirection:'column'}}>
        {/* Nav */}
        <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 40px',borderBottom:'1px solid #1a1a1a'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <img src="/atomquest-logo.png" alt="AtomQuest" style={{width:36,height:36,objectFit:'contain',borderRadius:8}}/>
            <span style={{color:'#f1f5f9',fontWeight:900,fontSize:16}}>AtomQuest</span>
          </div>
          <a href="/login" style={{background:'linear-gradient(135deg,#fbbf24,#f97316)',color:'#0a0a0a',padding:'8px 20px',borderRadius:10,fontSize:13,fontWeight:700,textDecoration:'none'}}>
            Sign In →
          </a>
        </nav>

        {/* Hero */}
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'60px 20px',position:'relative',overflow:'hidden'}}>
          <div className="orb1" style={{position:'absolute',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(251,191,36,0.12) 0%,transparent 70%)',top:'0%',left:'10%',filter:'blur(40px)',pointerEvents:'none'}}/>
          <div className="orb2" style={{position:'absolute',width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(249,115,22,0.1) 0%,transparent 70%)',bottom:'10%',right:'10%',filter:'blur(50px)',pointerEvents:'none'}}/>

          <div className="fade1" style={{marginBottom:16}}>
            <span style={{background:'rgba(251,191,36,0.1)',border:'1px solid rgba(251,191,36,0.25)',color:'#fbbf24',padding:'6px 16px',borderRadius:99,fontSize:12,fontWeight:600}}>
              AtomQuest Hackathon 1.0 · Powered by Atomberg
            </span>
          </div>

          <h1 className="fade2" style={{fontSize:'clamp(36px,6vw,72px)',fontWeight:900,color:'#f1f5f9',lineHeight:1.1,marginBottom:20,maxWidth:800}}>
            Goal Setting &<br/>
            <span style={{background:'linear-gradient(135deg,#fbbf24,#f97316)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
              Performance Tracking
            </span>
          </h1>

          <p className="fade3" style={{fontSize:17,color:'#64748b',maxWidth:520,lineHeight:1.7,marginBottom:36}}>
            A unified portal for employees, managers and HR to set goals, track quarterly achievements and drive organisational performance.
          </p>

          <div className="fade4" style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center'}}>
            <a href="/login" style={{background:'linear-gradient(135deg,#fbbf24,#f97316)',color:'#0a0a0a',padding:'14px 32px',borderRadius:12,fontSize:15,fontWeight:800,textDecoration:'none'}}>
              Enter Portal →
            </a>
            <a href="https://github.com/Rudra-25-12/AtomQuest-Portal" target="_blank" style={{background:'rgba(255,255,255,0.05)',border:'1px solid #2a2a2a',color:'#94a3b8',padding:'14px 32px',borderRadius:12,fontSize:15,fontWeight:600,textDecoration:'none'}}>
              View Source
            </a>
          </div>

          {/* Feature cards */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginTop:64,maxWidth:860,width:'100%'}}>
            {[
              {icon:'🎯',title:'Goal Management',desc:'Create up to 8 goals with weighted KPIs and UoM-based scoring'},
              {icon:'✅',title:'Manager Approval',desc:'Review, edit inline, approve or reject team goals with comments'},
              {icon:'📊',title:'Quarterly Check-ins',desc:'Log actuals each quarter with auto-computed progress scores'},
              {icon:'⚙️',title:'Admin Controls',desc:'Cycle management, escalation tracking, CSV exports and audit logs'},
            ].map(f=>(
              <div key={f.title} className="card" style={{background:'#111',border:'1px solid #1f1f1f',borderRadius:16,padding:24,textAlign:'left'}}>
                <p style={{fontSize:28,marginBottom:12}}>{f.icon}</p>
                <p style={{color:'#f1f5f9',fontWeight:700,fontSize:14,marginBottom:6}}>{f.title}</p>
                <p style={{color:'#475569',fontSize:12,lineHeight:1.6}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{textAlign:'center',padding:'20px',borderTop:'1px solid #1a1a1a'}}>
          <p style={{color:'#334155',fontSize:12}}>Built by <strong style={{color:'#64748b'}}>Rudra Pratap Singh</strong> · AtomQuest Hackathon 1.0</p>
        </div>
      </div>
    </>
  )
}