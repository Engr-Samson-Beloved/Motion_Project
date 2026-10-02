import React from "react";
import {AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame} from "remotion";
import {HEADING_FONT} from "../brand";
import {BookIcon, InboxIcon, UsersIcon} from "../pulse/icons";

const C = {ink: "#071d17", mint: "#c5f6b3", paper: "#f0f2df", green: "#165538", gold: "#edbc69"};
const ramp = (f: number, a: number, b: number) => interpolate(f, [a,b], [0,1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
const enter = (f: number, delay = 0) => spring({frame: f-delay, fps: 30, config: {damping: 20, stiffness: 140}});
type SceneKind = "hook" | "chaos" | "turn" | "brand" | "world" | "people" | "connect" | "opportunity" | "discover" | "chat" | "community" | "resources" | "verbs" | "browser" | "cta";
type Shot = {kind: SceneKind; frames: number; title: string; light?: boolean};
export const WORLD_SHOTS: readonly Shot[] = [
  {kind: "hook", frames: 60, title: "Your world."},
  {kind: "chaos", frames: 90, title: "Too many places."},
  {kind: "turn", frames: 60, title: "What if it connected?", light: true},
  {kind: "brand", frames: 90, title: "Meet SkoolConnectNG."},
  {kind: "world", frames: 120, title: "Beyond your campus."},
  {kind: "people", frames: 105, title: "Find your people.", light: true},
  {kind: "connect", frames: 60, title: "Make the connection."},
  {kind: "opportunity", frames: 120, title: "Your next possibility."},
  {kind: "discover", frames: 75, title: "Jobs. Events. Offers.", light: true},
  {kind: "chat", frames: 120, title: "Start a conversation."},
  {kind: "community", frames: 120, title: "Find where you belong.", light: true},
  {kind: "resources", frames: 90, title: "Keep moving forward."},
  {kind: "verbs", frames: 90, title: "Connect. Discover. Belong."},
  {kind: "browser", frames: 120, title: "One destination.", light: true},
  {kind: "cta", frames: 180, title: "Your world just got bigger."},
];
export const WORLD_DURATION = WORLD_SHOTS.reduce((n, s) => n+s.frames, 0);
if (WORLD_DURATION !== 1500) throw new Error("World must be exactly 50 seconds");

const Head: React.FC<{tag: string; lines: string[]; f: number; light?: boolean; y?: number}> = ({tag, lines, f, light, y = 260}) => <div style={{position: "absolute", left: 80, right: 80, top: y}}>
  <div style={{fontSize: 23, letterSpacing: 5, marginBottom: 28, color: light ? C.green : C.mint, opacity: ramp(f,0,10)}}>{tag}</div>
  {lines.map((line,i) => <div key={line} style={{overflow: "hidden", paddingBottom: 8}}><div style={{fontSize: 94, fontWeight: 800, letterSpacing: -5, lineHeight: 1.04, transform: `translateY(${(1-enter(f,i*4))*130}px)`}}>{line}</div></div>)}
</div>;

const Tile: React.FC<{children: React.ReactNode; f: number; delay?: number; style?: React.CSSProperties}> = ({children,f,delay=0,style}) => <div style={{position: "absolute", borderRadius: 30, padding: 36, background: C.paper, color: C.ink, boxShadow: "0 35px 65px #0003", transform: `translateY(${(1-enter(f,delay))*220}px)`, opacity: ramp(f,delay,delay+8), ...style}}>{children}</div>;

const Avatar: React.FC<{i: number; size?: number}> = ({i,size=100}) => <div style={{width: size,height: size,borderRadius: "50%",background: ["#e8bd8e","#a5bbaa","#baa4bd","#deb868"][i%4],overflow: "hidden",position: "relative",flexShrink:0}}><svg width={size} height={size} viewBox="0 0 100 100"><ellipse cx="50" cy="104" rx="39" ry="42" fill={["#165538","#273d55","#58403f","#7a623c"][i%4]}/><rect x="43" y="54" width="14" height="22" rx="6" fill="#9e603d"/><ellipse cx="50" cy="39" rx="20" ry="25" fill={["#995c39","#65402c","#ac704b","#75462d"][i%4]}/><path d="M29 39 Q23 10 49 10 Q77 9 72 39 L63 25 Q44 32 31 25Z" fill="#241d17"/><path d="M44 51 Q50 56 57 50" fill="none" stroke="#e7c9ad" strokeWidth="2"/></svg></div>;

const Orbit: React.FC<{f: number}> = ({f}) => <div style={{position: "absolute",left: -80,top: 610,width: 1240,height: 1050,transform: `perspective(1000px) rotateX(28deg) rotateZ(${-18+f/9}deg) scale(${0.7+enter(f)*0.3})`}}>
  <svg width="1240" height="1050" viewBox="0 0 1240 1050">
    {[220,340,460].map(r => <ellipse key={r} cx="620" cy="520" rx={r} ry={r*0.75} fill="none" stroke={C.mint} strokeOpacity="0.3" strokeWidth="2"/>)}
    {Array.from({length:12},(_,i) => {const a=i*Math.PI/6; const x=620+Math.cos(a)*460,y=520+Math.sin(a)*345; return <g key={i}><line x1="620" y1="520" x2={x} y2={y} stroke={C.mint} strokeOpacity="0.2"/><circle cx={x} cy={y} r="13" fill={i%3===0?C.gold:C.mint}/></g>;})}
  </svg>
  {["LAGOS","ABUJA","IBADAN","ENUGU"].map((s,i)=><div key={s} style={{position:"absolute",left:[200,790,300,730][i],top:[270,370,740,760][i],padding:"20px 28px",border:"1px solid #c5f6b366",borderRadius:18,background:C.ink,fontSize:28,letterSpacing:4,transform:`rotateZ(${18-f/9}deg)`}}>{s}</div>)}
  <div style={{position:"absolute",left:500,top:410,width:220,height:220,background:C.mint,borderRadius:60,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 100px #c5f6b344"}}><Img src={staticFile("skng-logo.png")} style={{width:170,height:170,objectFit:"contain"}}/></div>
</div>;

export const WorldScene: React.FC<{shot: Shot}> = ({shot}) => {
  const f=useCurrentFrame();
  const light=shot.light;
  const camera=1+f/6500;
  let content: React.ReactNode;
  switch(shot.kind) {
    case "hook": content=<>
      <div style={{position:"absolute",left:130,top:460,width:820,height:820,border:"2px solid #c5f6b355",borderRadius:"50%",transform:`scale(${0.8+enter(f)*0.2})`}}/>
      <div style={{position:"absolute",left:200,top:530,width:680,height:680,border:"1px solid #c5f6b388",borderRadius:"50%"}}/>
      <Head tag="THIS IS YOUR SIGN" lines={["Your", "world."]} f={f} y={650}/>
      <div style={{position:"absolute",left:80,top:1090,fontSize:36,color:C.mint,opacity:ramp(f,18,30)}}>Ready for something bigger?</div>
    </>; break;
    case "chaos": content=<>
      <Head tag="THE EVERYDAY SCROLL" lines={["So much", "happening.", "Everywhere."]} f={f}/>
      {["Anyone have the link?","Where’s the event?","Who should I connect with?","Wait. Which group?","Did you see that opportunity?"].map((t,i)=><Tile key={t} f={f} delay={i*6} style={{left:90+(i%2)*90,top:820+i*125,width:720,background:i%2?"#254438":C.paper, color:i%2?C.paper:C.ink,transform:`translateX(${Math.sin(f/9+i)*12}px) rotate(${(i%2?1:-1)*6}deg)`,fontSize:32}}>{t}<span style={{float:"right",opacity:0.4}}>···</span></Tile>)}
    </>; break;
    case "turn": content=<><div style={{position:"absolute",left:540,top:940,width:1600,height:1600,borderRadius:"50%",background:C.green,transform:`translate(-50%,-50%) scale(${1-ramp(f,0,35)})`}}/><Head tag="LET’S CHANGE THAT" lines={["What if", "it all", "connected?"]} f={f} light y={570}/><div style={{position:"absolute",left:80,top:1110,fontSize:170,color:C.green}}>↗</div></>;break;
    case "brand": content=<><div style={{position:"absolute",left:240,top:480,width:600,height:600,borderRadius:140,background:C.green,boxShadow:"0 0 180px #b8f2ca22",transform:`perspective(1000px) rotateY(${(1-enter(f))*75}deg) rotateZ(${-8+f/20}deg)`}}><Img src={staticFile("skng-logo.png")} style={{width:"100%",height:"100%",objectFit:"contain"}}/></div><div style={{position:"absolute",top:1190,left:60,right:60,textAlign:"center",fontSize:68,fontWeight:800,letterSpacing:-3,opacity:ramp(f,12,25)}}>SkoolConnectNG</div><div style={{position:"absolute",top:1310,left:90,right:90,textAlign:"center",fontSize:34,color:C.mint}}>Built around the Nigerian<br/>student journey.</div></>;break;
    case "world": content=<><Head tag="THINK BEYOND THE GATES" lines={["Your campus", "is just", "the start."]} f={f}/><Orbit f={f}/><div style={{position:"absolute",top:1650,left:80,fontSize:32,color:C.mint}}>People. Possibilities. A wider world.</div></>;break;
    case "people": content=<><Head tag="01 / PEOPLE" lines={["Find your", "kind of", "people."]} f={f} light/>{["The collaborator","The fellow student","The new connection"].map((name,i)=><Tile key={name} f={f} delay={i*9} style={{left:100+i*15,top:870+i*205,width:820,background:i===1?C.green:"#fff",color:i===1?C.paper:C.ink,transform:`perspective(1500px) rotateY(${-8+f/20}deg) rotateZ(${i-1}deg)`}}><div style={{display:"flex",alignItems:"center",gap:28}}><Avatar i={i}/><div><div style={{fontSize:35,fontWeight:750}}>{name}</div><div style={{fontSize:24,opacity:0.6,marginTop:10}}>Beyond your usual circle</div></div><span style={{marginLeft:"auto",fontSize:38}}>↗</span></div></Tile>)}</>;break;
    case "connect": content=<><div style={{position:"absolute",top:550,left:130,transform:`translateX(${ramp(f,0,25)*90}px)`}}><Avatar i={0} size={250}/></div><div style={{position:"absolute",top:550,right:130,transform:`translateX(${-ramp(f,0,25)*90}px)`}}><Avatar i={2} size={250}/></div><div style={{position:"absolute",left:480,top:635,color:C.mint,fontSize:100,opacity:ramp(f,20,28)}}>↔</div><Head tag="ONE MOVE CAN START IT" lines={["Make the", "connection."]} f={f} y={1030}/></>;break;
    case "opportunity": content=<><Head tag="02 / POSSIBILITIES" lines={["Your next", "‘what if?’", "starts here."]} f={f}/>{["EVENTS","STUDENT OFFERS","JOBS & OPPORTUNITIES"].map((name,i)=><Tile key={name} f={f} delay={i*8} style={{left:110,top:820+i*150,width:850,height:380,background:[C.green,C.gold,C.mint][i],transform:`perspective(1400px) rotateX(${12-ramp(f,0,45)*12}deg) rotateZ(${(i-1)*7}deg) translateY(${(1-enter(f,i*8))*500}px)`}}><div style={{fontSize:24,letterSpacing:4,opacity:0.7}}>DISCOVER / 0{i+1}</div><div style={{fontSize:53,fontWeight:800,marginTop:35,width:650}}>{name}</div><div style={{fontSize:100,position:"absolute",right:40,bottom:20}}>↗</div></Tile>)}</>;break;
    case "discover": {const words=["JOBS.","EVENTS.","OFFERS."];const active=Math.min(2,Math.floor(f/25));content=<><div style={{position:"absolute",left:80,top:360,fontSize:24,letterSpacing:5,color:C.green}}>LESS SEARCHING. MORE DISCOVERING.</div>{words.map((w,i)=><div key={w} style={{position:"absolute",left:75,top:620+i*200,fontSize:145,fontWeight:900,letterSpacing:-8,color:i===active?C.green:"#071d1725",transform:`translateX(${i===active?20:0}px)`}}>{w}</div>)}</>;break;}
    case "chat": content=<><Head tag="03 / CONVERSATIONS" lines={["A hello", "can go", "a long way."]} f={f}/><Tile f={f} style={{left:90,top:830,width:900,height:650,background:"#153a2d",color:C.paper,border:"1px solid #c5f6b344"}}><div style={{display:"flex",gap:20,alignItems:"center",borderBottom:"1px solid #ffffff22",paddingBottom:24}}><Avatar i={1} size={78}/><div style={{fontSize:30}}>A new conversation</div><InboxIcon size={34}/></div>{["Hey! Good to connect.","What are you working on?","Let’s exchange ideas."].map((t,i)=><div key={t} style={{background:i%2?C.mint:"#315a48",color:i%2?C.ink:C.paper,borderRadius:"24px 24px 6px 24px",padding:25,fontSize:30,marginTop:32,marginLeft:i%2?110:0,marginRight:i%2?0:90,opacity:ramp(f,15+i*22,25+i*22),transform:`translateY(${(1-enter(f,15+i*22))*50}px)`}}>{t}</div>)}</Tile></>;break;
    case "community": content=<><Head tag="04 / COMMUNITIES" lines={["There’s a", "space for", "your people."]} f={f} light/>{["Ideas worth sharing","Conversations worth having","Connections worth keeping"].map((t,i)=><Tile key={t} f={f} delay={i*12} style={{left:90,top:830+i*225,width:900,background:i===1?C.green:"white",color:i===1?C.paper:C.ink}}><div style={{display:"flex",alignItems:"center",gap:24}}><UsersIcon size={64}/><div style={{fontSize:34,fontWeight:700,width:570}}>{t}</div></div><div style={{display:"flex",marginTop:24}}>{[0,1,2,3].map(a=><div key={a} style={{marginLeft:a?-12:0,border:"3px solid #f0f2df",borderRadius:"50%"}}><Avatar i={a+i} size={48}/></div>)}</div></Tile>)}</>;break;
    case "resources": content=<><Head tag="KEEP THE MOMENTUM" lines={["Learn.", "Share.", "Go further."]} f={f}/>{[0,1,2].map(i=><Tile key={i} f={f} delay={i*8} style={{top:910+i*70,left:170-i*30,width:740,height:470,background:["#557b64",C.gold,C.mint][i],transform:`rotate(${(i-1)*10-f/35}deg)`}}><BookIcon size={85}/><div style={{fontSize:65,fontWeight:800,marginTop:55}}>Ideas travel.<br/>So can you.</div><div style={{position:"absolute",right:40,top:40,fontSize:25}}>0{i+1}</div></Tile>)}</>;break;
    case "verbs": {const words=["CONNECT.","DISCOVER.","BELONG."];const index=Math.min(2,Math.floor(f/30));content=<><div style={{position:"absolute",inset:0,background:index===1?C.mint:C.ink}}/><div style={{position:"absolute",left:65,right:65,top:700,color:index===1?C.ink:C.mint,fontSize:125,fontWeight:900,letterSpacing:-7,transform:`scale(${1+((f%30)/200)}) rotate(-6deg)`}}>{words[index]}</div><div style={{position:"absolute",top:930,left:80,right:80,fontSize:34,color:index===1?C.ink:C.paper}}>More than a scroll.<br/>A step towards what’s next.</div></>;break;}
    case "browser": content=<><Head tag="TAKE THE NEXT STEP" lines={["One", "destination.", "Your move."]} f={f} light/><Tile f={f} style={{left:70,top:900,width:940,height:310,background:"white",transform:`perspective(1500px) rotateY(${-12+enter(f)*12}deg)`}}><div style={{display:"flex",gap:10,marginBottom:38}}>{["#e9bca2",C.gold,C.green].map(c=><div key={c} style={{background:c,width:15,height:15,borderRadius:"50%"}}/>)}</div><div style={{background:C.paper,borderRadius:18,padding:25,fontSize:49,fontWeight:700,letterSpacing:-2,whiteSpace:"nowrap"}}>{"skoolconnect.ng".slice(0,Math.floor(ramp(f,12,55)*15))}<span style={{color:C.green,opacity:f%24<12?1:0}}>|</span></div><div style={{marginTop:22,fontSize:24,color:C.green}}>Your next connection starts here.</div></Tile><div style={{position:"absolute",left:80,top:1330,fontSize:40,color:C.green,opacity:ramp(f,65,80)}}>Visit. Join. Start connecting. ↗</div></>;break;
    case "cta": content=<><div style={{position:"absolute",left:140,top:350,width:800,height:800,border:"1px solid #c5f6b344",borderRadius:"50%",transform:`scale(${1+f/2000})`}}/><Img src={staticFile("skng-logo.png")} style={{position:"absolute",top:300,left:430,width:220,height:220,objectFit:"contain"}}/><div style={{position:"absolute",top:550,left:70,right:70,textAlign:"center",fontSize:46,fontWeight:700}}>SkoolConnectNG</div><div style={{position:"absolute",top:730,left:70,right:70,textAlign:"center",fontSize:96,lineHeight:1.08,fontWeight:850,letterSpacing:-5}}>Your world<br/>just got<br/><span style={{color:C.mint}}>bigger.</span></div><div style={{position:"absolute",top:1120,left:90,right:90,textAlign:"center",fontSize:33,color:C.paper}}>Make your next connection.</div><div style={{position:"absolute",top:1240,left:70,right:70,borderRadius:70,padding:"34px 25px",background:C.mint,color:C.ink,textAlign:"center",fontSize:60,fontWeight:800,letterSpacing:-3,boxShadow:"0 0 90px #c5f6b322"}}>skoolconnect.ng ↗</div><div style={{position:"absolute",top:1420,left:70,right:70,textAlign:"center",fontSize:31,color:C.mint}}>Visit the site. Join the community.</div><div style={{position:"absolute",top:1510,left:70,right:70,textAlign:"center",fontSize:24,opacity:0.65}}>https://skoolconnect.ng</div></>;break;
  }
  const out=ramp(f,shot.frames-7,shot.frames);
  return <AbsoluteFill style={{background:light?C.paper:C.ink,color:light?C.ink:C.paper,fontFamily:HEADING_FONT,overflow:"hidden"}}>
    {!light && <AbsoluteFill style={{background:"radial-gradient(ellipse at 75% 60%, #27714d55, transparent 65%)"}}/>}
    <div style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(${light?"#16553808":"#c5f6b307"} 1px, transparent 1px),linear-gradient(90deg, ${light?"#16553808":"#c5f6b307"} 1px, transparent 1px)`,backgroundSize:"90px 90px",transform:`translateY(${-f/4}px)`}}/>
    <AbsoluteFill style={{transform:`scale(${camera+out*0.035}) translateY(${-out*25}px)`,opacity:1-out*0.35}}>{content}</AbsoluteFill>
    <div style={{position:"absolute",top:130,left:80,fontSize:20,letterSpacing:4,color:light?C.green:C.mint}}>SKOOLCONNECTNG</div>
    {shot.kind!=="cta" && <div style={{position:"absolute",bottom:190,left:80,right:80,display:"flex",justifyContent:"space-between",fontSize:24,color:light?C.green:C.mint}}><span>skoolconnect.ng</span><span>↗</span></div>}
    {!light && <AbsoluteFill style={{pointerEvents:"none",boxShadow:"inset 0 0 150px #0005"}}/>}
    <AbsoluteFill style={{background:light?C.ink:C.mint,opacity:(1-ramp(f,0,4))*0.2,pointerEvents:"none"}}/>
  </AbsoluteFill>;
};

export const WorldVertical: React.FC = () => {
  let from=0;
  return <AbsoluteFill>{WORLD_SHOTS.map((shot,i)=>{const start=from;from+=shot.frames;return <Sequence key={i} from={start} durationInFrames={shot.frames}><WorldScene shot={shot}/></Sequence>;})}<Audio src={staticFile("bed-world50.mp3")} volume={0.86}/></AbsoluteFill>;
};

export const WorldBoard: React.FC = () => <AbsoluteFill style={{background:"#10251c",padding:30,display:"grid",gridTemplateColumns:"repeat(5, 216px)",gridTemplateRows:"repeat(3, 422px)",gap:20}}>{WORLD_SHOTS.map((shot,i)=><div key={i} style={{position:"relative",width:216,height:422,overflow:"hidden"}}><div style={{width:1080,height:1920,transform:"scale(0.2)",transformOrigin:"top left",position:"absolute"}}><Sequence from={-Math.min(shot.frames-15,70)}><WorldScene shot={shot}/></Sequence></div><div style={{position:"absolute",top:388,color:C.paper,fontSize:13,fontFamily:"sans-serif"}}>{i+1}. {shot.title}</div></div>)}</AbsoluteFill>;
