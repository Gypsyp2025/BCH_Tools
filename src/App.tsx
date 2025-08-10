import React, { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";

const ORANGE = "#E88A2D";
const GREEN  = "#1F8A4C";
const BG     = "#0A0A0A";

const fmt = (n:number, c:string="USD") => new Intl.NumberFormat("en-US",{style:"currency",currency:c}).format(n);
const pct = (n:number) => `${(n*100).toFixed(1)}%`;

function synthPrice(base:number, t:number){
  const trend = Math.exp(0.00045*t);
  const wave = 1 + 0.12*Math.sin(t/15) + 0.05*Math.sin(t/3.7);
  return base*trend*wave;
}
function rangeDates(start:Date, end:Date, stepDays:number){
  const out:Date[]=[]; const d=new Date(start);
  while(d<=end){ out.push(new Date(d)); d.setDate(d.getDate()+stepDays); }
  return out;
}
function daysPer(i:"Daily"|"Weekly"|"Monthly"){ return i==="Daily"?1: i==="Weekly"?7: 30; }

type Tab = "style"|"dca"|"profit";

export default function App(){
  const [tab,setTab] = useState<Tab>("style");
  return (
    <div style={{minHeight:"100vh", background:BG}}>
      <header style={{position:"sticky",top:0, backdropFilter:"blur(6px)", background:"rgba(0,0,0,.6)", borderBottom:"1px solid #222"}}>
        <div style={{maxWidth:1120, margin:"0 auto", display:"flex", alignItems:"center", gap:12, padding:"12px 16px"}}>
          <img src="/logo.jpg" alt="BCH" height={56} style={{borderRadius:12}}/>
          <div>
            <div style={{fontWeight:800, fontSize:22}}>Bitcoin Culture Hub</div>
            <div style={{opacity:.7, fontSize:12, marginTop:-4}}>Explore Your Bitcoin Journey: Assess, Simulate, and Calculate</div>
          </div>
          <div style={{marginLeft:"auto"}}></div>
        </div>
      </header>

      <main style={{maxWidth:1120, margin:"0 auto", padding:"20px 16px"}}>
        <div style={{display:"flex", gap:8, marginBottom:16}}>
          <TabBtn active={tab==="style"} onClick={()=>setTab("style")}>Assess Style</TabBtn>
          <TabBtn active={tab==="dca"} onClick={()=>setTab("dca")}>DCA Simulator</TabBtn>
          <TabBtn active={tab==="profit"} onClick={()=>setTab("profit")}>Profit Calc</TabBtn>
        </div>

        {tab==="style" && <StyleQuiz onRoute={setTab}/>}
        {tab==="dca" && <DCASim/>}
        {tab==="profit" && <ProfitCalc/>}

        <div style={{borderTop:"1px solid #222", marginTop:24, paddingTop:12, opacity:.7, fontSize:12}}>
          Not financial advice. Past performance ≠ future results.
        </div>
      </main>
    </div>
  );
}

function TabBtn({active, children, onClick}:{active:boolean, children:React.ReactNode, onClick:()=>void}){
  return <button onClick={onClick} className={"btn"+(active?" active":"")}>{children}</button>;
}

// ---------- Style Quiz ----------
function StyleQuiz({onRoute}:{onRoute:(t:Tab)=>void}){
  const [horizon, setHorizon] = useState<"Short"|"Medium"|"Long">("Long");
  const [risk, setRisk] = useState<"Low"|"Medium"|"High">("Medium");
  const [exp, setExp] = useState<"Newbie"|"Intermediate"|"Expert">("Intermediate");
  const [goal, setGoal] = useState<"Preserve"|"Grow"|"Max">("Grow");
  const [vol, setVol] = useState<"Hate"|"Tolerate"|"Thrive">("Tolerate");
  const [approach, setApproach] = useState<"Passive"|"Active"|"Systematic">("Systematic");

  const breakdown = useMemo(()=>{
    let c=0,b=0,a=0;
    if(horizon==="Short") c+=2; if(horizon==="Medium") b+=2; if(horizon==="Long") a+=2;
    if(risk==="Low") c+=3; if(risk==="Medium") b+=3; if(risk==="High") a+=3;
    if(exp==="Newbie") c+=1; if(exp==="Intermediate") b+=1; if(exp==="Expert") a+=1;
    if(goal==="Preserve") c+=3; if(goal==="Grow") b+=3; if(goal==="Max") a+=3;
    if(vol==="Hate") c+=2; if(vol==="Tolerate") b+=2; if(vol==="Thrive") a+=2;
    if(approach==="Passive") c+=1; if(approach==="Systematic") b+=1; if(approach==="Active") a+=1;
    const tot=c+b+a||1;
    return {Conservative:c/tot, Balanced:b/tot, Aggressive:a/tot};
  },[horizon,risk,exp,goal,vol,approach]);

  const top = Object.entries(breakdown).sort((a,b)=>b[1]-a[1])[0][0] as "Conservative"|"Balanced"|"Aggressive";
  const message = top==="Conservative" ? "Steady Accumulator — DCA & preservation focused."
    : top==="Balanced" ? "Growth Seeker — blend DCA with opportunistic buys."
    : "High-Conviction — DCA plus tactical swings; comfortable with volatility.";

  const pie = [
    {name:"Conservative", value: breakdown.Conservative},
    {name:"Balanced", value: breakdown.Balanced},
    {name:"Aggressive", value: breakdown.Aggressive},
  ];

  return (
    <div style={{display:"grid", gap:16, gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))"}}>
      <div>
        <Field label="Investment Horizon">
          <Select value={horizon} onChange={setHorizon} options={["Short","Medium","Long"]}/>
        </Field>
        <Field label="Risk Tolerance"><Segment value={risk} onChange={setRisk} options={["Low","Medium","High"]}/></Field>
        <Field label="Experience"><Segment value={exp} onChange={setExp} options={["Newbie","Intermediate","Expert"]}/></Field>
        <Field label="Goal"><Segment value={goal} onChange={setGoal} options={["Preserve","Grow","Max"]}/></Field>
        <Field label="Volatility Comfort"><Segment value={vol} onChange={setVol} options={["Hate","Tolerate","Thrive"]}/></Field>
        <Field label="Preferred Approach"><Segment value={approach} onChange={setApproach} options={["Passive","Active","Systematic"]}/></Field>
        <button onClick={()=>onRoute(top==="Aggressive"?"profit":"dca")} style={{marginTop:8, padding:"10px 14px", borderRadius:12, fontWeight:700, background:ORANGE, color:"#000"}}>Get My Style</button>
      </div>
      <div className="card">
        <div style={{fontWeight:700, marginBottom:4}}>You're {top}.</div>
        <div style={{opacity:.8, marginBottom:8}}>{message}</div>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={pie} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
              <Cell fill="#3f3f46"/><Cell fill={ORANGE}/><Cell fill={GREEN}/>
            </Pie>
            <Legend/><Tooltip formatter={(v:number)=>pct(v)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Field({label, children}:{label:string, children:React.ReactNode}){
  return (<label style={{display:"block", marginBottom:10}}>
    <div style={{fontSize:12, opacity:.8, marginBottom:6}}>{label}</div>{children}
  </label>);
}
function Segment<T extends string>({value,onChange,options}:{value:T,onChange:(v:T)=>void,options:T[]}){
  return <div style={{display:"flex", gap:8, flexWrap:"wrap", marginBottom:10}}>
    {options.map(o=>(<button key={o} onClick={()=>onChange(o)} style={{padding:"8px 10px", borderRadius:10, border:"1px solid #444", background:value===o?"#fff":"#111", color:value===o?"#000":"#fff"}}>{o}</button>))}
  </div>;
}
function Select<T extends string>({value,onChange,options}:{value:T,onChange:(v:T)=>void,options:T[]}){
  return <select value={value} onChange={e=>onChange(e.target.value as T)} style={{width:"100%", padding:"10px 12px", borderRadius:10, background:"#0f0f0f", color:"#fff", border:"1px solid #444"}}>
    {options.map(o=>(<option key={o} value={o}>{o}</option>))}
  </select>;
}

// ---------- DCA Simulator ----------
function DCASim(){
  const [currency,setCurrency] = useState("USD");
  const [amount,setAmount] = useState(100);
  const [interval,setInterval] = useState<"Daily"|"Weekly"|"Monthly">("Weekly");
  const [years,setYears] = useState(1);
  const [feeOn,setFeeOn] = useState(true);
  const [fee,setFee] = useState(1);

  const end = new Date(); const start = new Date(); start.setFullYear(start.getFullYear()-years);
  const base = 60000;
  const step = daysPer(interval);

  const series = useMemo(()=>{
    const dates = rangeDates(start,end,step);
    let t=0, btcAcc=0; const out:any[]=[];
    const feeDec = feeOn? fee/100 : 0;
    const lumpInvest = amount * dates.length;
    const p0 = synthPrice(base,0);
    const lumpBTC = (lumpInvest*(1-feeDec))/p0;

    for(const d of dates){
      const price = synthPrice(base,t);
      const btc = (amount*(1-feeDec))/price;
      btcAcc += btc;
      out.push({
        date: d.toISOString().slice(0,10),
        dcaValue: btcAcc*price,
        lumpValue: lumpBTC*price,
        btcBought: btc, btcAccum: btcAcc,
      });
      t += 1;
    }
    return out;
  },[amount,interval,years,feeOn,fee]);

  const last = series[series.length-1] || {dcaValue:0,lumpValue:0,btcAccum:0};
  const invested = amount * series.length;
  const dcaROI = invested>0? (last.dcaValue/invested - 1):0;
  const lumpROI = invested>0? (last.lumpValue/invested - 1):0;

const exportCSV = () => {
  const rows = [
    ["Date","DCA Value","Lump Value","BTC Bought","BTC Cumulative"],
    ...series.map(r => [
      r.date,
      r.dcaValue.toFixed(2),
      r.lumpValue.toFixed(2),
      r.btcBought.toFixed(8),
      r.btcAccum.toFixed(8)
    ])
  ];
  const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "bch_dca_breakdown.csv"; a.click();
  URL.revokeObjectURL(url);
};

  return (
    <div style={{display:"grid", gap:16, gridTemplateColumns:"320px 1fr"}}>
      <div className="card">
        <Field label="Currency"><Select value={currency} onChange={setCurrency} options={["USD","EUR","GBP"]}/></Field>
        <Field label="Amount per Interval"><Number value={amount} onChange={setAmount} min={1}/></Field>
        <Field label="Interval"><Select value={interval} onChange={setInterval} options={["Daily","Weekly","Monthly"]}/></Field>
        <Field label={`Duration: ${years} year${years>1?"s":""}`}>
          <input type="range" min={1} max={10} value={years} onChange={e=>setYears(parseInt(e.target.value))} style={{width:"100%"}}/>
        </Field>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <input id="fees" type="checkbox" checked={feeOn} onChange={e=>setFeeOn(e.target.checked)}/>
          <label htmlFor="fees">Include Fees</label>
          {feeOn && (<><span style={{opacity:.8,fontSize:12,marginLeft:8}}>Fee %</span><Number value={fee} onChange={setFee} min={0} max={5} step={0.1}/></>)}
        </div>
        <button onClick={exportCSV} className="btn" style={{width:"100%",marginTop:8,background:"#fff",color:"#000"}}>Export CSV</button>
      </div>
      <div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:12, marginBottom:12}}>
          <Stat title="Total Invested" value={fmt(invested, currency)} />
          <Stat title="BTC Accumulated" value={`${last.btcAccum?.toFixed(6) ?? 0} BTC`} />
          <Stat title="Current Value" value={fmt(last.dcaValue, currency)} sub={`ROI ${pct(dcaROI)}`} />
        </div>
        <div className="card" style={{marginBottom:12}}>
          <h4 style={{margin:"0 0 8px 0"}}>Portfolio Value Over Time</h4>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a"/>
              <XAxis dataKey="date" hide/>
              <YAxis hide/>
              <Tooltip formatter={(v:number)=>fmt(v,currency)} labelFormatter={(l)=>`Date: ${l}`}/>
              <Line type="monotone" dataKey="dcaValue" stroke={ORANGE} dot={false} name="DCA" strokeWidth={2}/>
              <Line type="monotone" dataKey="lumpValue" stroke={GREEN} dot={false} name="Lump Sum" strokeWidth={2}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h4 style={{margin:"0 0 8px 0"}}>DCA vs Lump Sum (ROI)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[{name:"DCA", roi:dcaROI}, {name:"Lump", roi:lumpROI}]}> 
              <CartesianGrid vertical={false} stroke="#2a2a2a"/>
              <XAxis dataKey="name"/>
              <YAxis tickFormatter={(v)=>`${(v*100).toFixed(0)}%`}/>
              <Tooltip formatter={(v:number)=>pct(v)} />
              <Bar dataKey="roi"><Cell fill={ORANGE}/><Cell fill={GREEN}/></Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ---------- Profit Calculator ----------
function ProfitCalc(){
  const [initial, setInitial] = useState(1000);
  const [buyPrice, setBuyPrice] = useState(60000);
  const [sellPrice, setSellPrice] = useState(65000);
  const [entryFee, setEntryFee] = useState(0.1);
  const [exitFee, setExitFee] = useState(0.1);

  const qty = (initial * (1 - entryFee/100)) / buyPrice;
  const exitVal = qty * sellPrice * (1 - exitFee/100);
  const profit = exitVal - initial;
  const roi = profit / initial;

  const whatIf = [
    { label: "-20%", val: sellPrice*0.8 },
    { label: "-10%", val: sellPrice*0.9 },
    { label: "Now",  val: sellPrice },
    { label: "+10%", val: sellPrice*1.1 },
    { label: "+20%", val: sellPrice*1.2 },
  ];

  return (
    <div style={{display:"grid", gap:16, gridTemplateColumns:"320px 1fr"}}>
      <div className="card">
        <Field label="Initial Investment (USD)"><Number value={initial} onChange={setInitial} min={1}/></Field>
        <Field label="Buy Price (USD)"><Number value={buyPrice} onChange={setBuyPrice} min={1}/></Field>
        <Field label="Sell Price (USD)"><Number value={sellPrice} onChange={setSellPrice} min={1}/></Field>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
          <Field label="Entry Fee %"><Number value={entryFee} onChange={setEntryFee} min={0} max={5} step={0.01}/></Field>
          <Field label="Exit Fee %"><Number value={exitFee} onChange={setExitFee} min={0} max={5} step={0.01}/></Field>
        </div>
        <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
          {whatIf.map(b=> (<button key={b.label} className="btn" onClick={()=>setSellPrice(Math.round(b.val))}>{b.label}</button>))}
        </div>
      </div>
      <div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:12, marginBottom:12}}>
          <Stat title="Quantity" value={`${qty.toFixed(6)} BTC`} />
          <Stat title="Exit Value" value={fmt(exitVal)} />
          <Stat title="Profit / ROI" value={`${fmt(profit)} • ${pct(roi)}`} />
        </div>
        <div className="card">
          <h4 style={{margin:"0 0 8px 0"}}>Profit/Loss Scenarios</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={whatIf.map(w=>({name:w.label, val: (qty*w.val*(1-exitFee/100) - initial)}))}>
              <CartesianGrid vertical={False} stroke="#2a2a2a"/>
              <XAxis dataKey="name"/><YAxis/>
              <Tooltip formatter={(v:number)=>fmt(v)}/>
              <Bar dataKey="val">
                {whatIf.map((_,i)=>(<Cell key={i} fill={i<2?"#ef4444": i===2?ORANGE: GREEN}/>))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Stat({title, value, sub}:{title:string, value:string, sub?:string}){
  return (<div className="card"><div style={{opacity:.75,fontSize:12}}>{title}</div><div style={{fontWeight:700,fontSize:18}}>{value}</div>{sub && <div style={{opacity:.6,fontSize:12, marginTop:4}}>{sub}</div>}</div>);
}
function Field({label, children}:{label:string, children:React.ReactNode}){
  return (<label style={{display:"block", marginBottom:10}}>
    <div style={{fontSize:12, opacity:.8, marginBottom:6}}>{label}</div>{children}
  </label>);
}
function Number({value,onChange,min=0,max=1e9,step=1}:{value:number,onChange:(n:number)=>void,min?:number,max?:number,step?:number}){
  return <input type="number" value={value} min={min} max={max} step={step} onChange={e=>onChange(parseFloat(e.target.value || "0"))}
          style={{width:"100%", padding:"10px 12px", borderRadius:10, background:"#0f0f0f", color:"#fff", border:"1px solid #444"}}/>;
}
