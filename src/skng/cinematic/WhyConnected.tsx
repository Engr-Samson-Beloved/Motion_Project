import React from "react";
import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame} from "remotion";
import {HEADING_FONT} from "../brand";
import {BookIcon, InboxIcon, UsersIcon} from "../pulse/icons";

const P = {bg:"#071b16",panel:"#0d281f",line:"#a9e8ba",white:"#eef5e7",muted:"#96b5a3",gold:"#e0c186"};
const ease=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
const smooth=(t:number)=>t*t*t*(t*(t*6-15)+10);
type Chapter={title:string[]; reason:string; label:string; kind:string; duration:number; x:number; y:number};
export const WHY_CHAPTERS:readonly Chapter[]=[
  {title:["Potential is", "everywhere."],reason:"The next step should be easier to find.",label:"WHY THIS MATTERS",kind:"potential",duration:120,x:0,y:0},
  {title:["The information?", "Scattered."],reason:"Different chats. Different links. Different places.",label:"01 / THE FRICTION",kind:"scatter",duration:135,x:1400,y:0},
  {title:["A good opportunity.", "An easy miss."],reason:"When discovery depends on being in the right group.",label:"02 / THE COST",kind:"miss",duration:135,x:2800,y:0},
  {title:["The right person", "could be beyond", "your campus."],reason:"Your circle should not end at the gates.",label:"03 / THE DISTANCE",kind:"distance",duration:150,x:2800,y:2050},
  {title:["So we connected", "the dots."],reason:"Meet SkoolConnectNG.",label:"04 / THE IDEA",kind:"hub",duration:150,x:1400,y:2050},
  {title:["People become", "possibilities."],reason:"Find people. Exchange ideas. Make a connection.",label:"05 / CONNECT",kind:"people",duration:150,x:0,y:2050},
  {title:["A clearer path", "to what’s next."],reason:"Explore jobs, events and student offers.",label:"06 / DISCOVER",kind:"discover",duration:150,x:0,y:4100},
  {title:["A hello can", "move you", "forward."],reason:"Start the conversation that opens your next chapter.",label:"07 / CONVERSATIONS",kind:"chat",duration:150,x:1400,y:4100},
  {title:["Find a space.", "Feel part of it."],reason:"Communities turn a network into somewhere to belong.",label:"08 / BELONG",kind:"community",duration:150,x:2800,y:4100},
  {title:["Less searching.", "More possibility."],reason:"People, discovery and communities — connected.",label:"09 / THE DIFFERENCE",kind:"path",duration:150,x:2800,y:6150},
  {title:["One connected", "student journey."],reason:"That’s why this solution matters.",label:"10 / THE BIGGER PICTURE",kind:"overview",duration:180,x:1400,y:6150},
  {title:["Your next step", "starts here."],reason:"Visit the site. Join the community.",label:"SKOOLCONNECTNG",kind:"cta",duration:180,x:0,y:6150},
];
export const WHY_DURATION=WHY_CHAPTERS.reduce((n,c)=>n+c.duration,0);
if(WHY_DURATION!==1800)throw new Error("Connected journey must be 60 seconds");
const starts=WHY_CHAPTERS.map((_,i)=>WHY_CHAPTERS.slice(0,i).reduce((n,c)=>n+c.duration,0));
const center=(c:Chapter)=>({x:c.x+500,y:c.y+800});
export const whyCamera=(frame:number)=>{
  let index=starts.findIndex((s,i)=>frame>=s && frame<s+WHY_CHAPTERS[i].duration);
  if(index<0)index=11;
  const c=center(WHY_CHAPTERS[index]);
  let x=c.x,y=c.y,zoom=0.94,velocity=0;
  for(let i=1;i<starts.length;i++){
    const boundary=starts[i];
    if(frame>=boundary-18 && frame<=boundary+18){
      const a=center(WHY_CHAPTERS[i-1]),b=center(WHY_CHAPTERS[i]);
      const t=ease(frame,boundary-18,boundary+18),s=smooth(t);
      x=a.x+(b.x-a.x)*s;y=a.y+(b.y-a.y)*s;
      velocity=Math.sin(t*Math.PI);zoom=0.94-velocity*0.18;
    }
  }
  // The entire board becomes visible, then the camera flies into the invitation.
  if(frame>=starts[10]+24 && frame<starts[11]+18){
    const overview={x:1900,y:3875};
    const pull=smooth(ease(frame,starts[10]+24,starts[10]+75));
    const land=smooth(ease(frame,starts[11]-18,starts[11]+18));
    x=(c.x+(overview.x-c.x)*pull)*(1-land)+center(WHY_CHAPTERS[11]).x*land;
    y=(c.y+(overview.y-c.y)*pull)*(1-land)+center(WHY_CHAPTERS[11]).y*land;
    zoom=(0.94+(0.19-0.94)*pull)*(1-land)+0.94*land;
    velocity=Math.max(Math.sin(pull*Math.PI),Math.sin(land*Math.PI));
  }
  return {x,y,zoom,velocity,index};
};

const Box:React.FC<{children:React.ReactNode;style?:React.CSSProperties;accent?:boolean}>=({children,style,accent})=><div style={{border:`2px solid ${accent?P.line:"#a9e8ba40"}`,borderRadius:24,padding:28,background:accent?"#173e2c":P.panel,...style}}>{children}</div>;
const Tag:React.FC<{children:React.ReactNode}>=({children})=><div style={{fontSize:20,letterSpacing:3,color:P.line,marginBottom:24}}>{children}</div>;
const Person:React.FC<{i:number;size?:number}>=({i,size=70})=><div style={{width:size,height:size,border:`2px solid ${P.line}`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.3,color:P.line,background:"#103324",flexShrink:0}}>{["YOU","AA","TO","CE","MA"][i%5]}</div>;
const Wire:React.FC<{children:React.ReactNode;f:number;delay?:number;style?:React.CSSProperties}>=({children,f,delay=0,style})=><div style={{opacity:ease(f,delay,delay+15),transform:`translateY(${(1-smooth(ease(f,delay,delay+24)))*30}px)`,...style}}>{children}</div>;

// The existing captures include phones. Crop to the app, keeping one board frame.
const ProductReveal:React.FC<{kind:string;f:number}>=({kind,f})=>{
  const reference:Record<string,{file:string;y:number;label:string}>={
    people:{file:"people",y:0.32,label:"PEOPLE / MAKE A CONNECTION"},
    discover:{file:"discover",y:0.58,label:"DISCOVER / EXPLORE WHAT’S NEXT"},
    community:{file:"community",y:0.26,label:"COMMUNITIES / FIND YOUR SPACE"},
  };
  const ref=reference[kind];
  if(!ref)return null;
  const reveal=smooth(ease(f,78,110));
  const imageWidth=860/0.8246,imageHeight=imageWidth*1638/804;
  return <div style={{position:"absolute",left:0,top:0,width:860,height:650,borderRadius:24,overflow:"hidden",border:`2px solid ${P.line}`,background:P.panel,boxSizing:"border-box",clipPath:`inset(0 ${100-reveal*100}% 0 0 round 24px)`}}>
    <div style={{height:75,padding:"25px 28px",boxSizing:"border-box",fontSize:21,letterSpacing:2,color:P.line}}>{ref.label}</div>
    <div style={{height:575,overflow:"hidden",position:"relative",background:"#e4f4f1"}}><Img src={staticFile(`screens/${ref.file}.png`)} style={{position:"absolute",width:imageWidth,height:imageHeight,left:-0.0896*imageWidth,top:-ref.y*imageHeight+ease(f,110,150)*-25,maxWidth:"none"}}/></div>
    {reveal<1&&<div style={{position:"absolute",right:0,top:0,bottom:0,width:4,background:P.gold}}/>}
  </div>;
};

const Diagram:React.FC<{kind:string;f:number}>=({kind,f})=>{
  switch(kind){
    case "potential":return <Box accent><Tag>THE STUDENT JOURNEY</Tag><div style={{display:"flex",alignItems:"center",gap:28,margin:"35px 0"}}><Person i={0} size={150}/><div style={{flex:1,height:2,background:P.line,position:"relative"}}><div style={{position:"absolute",left:`${ease(f,15,80)*90}%`,top:-8,width:18,height:18,borderRadius:"50%",background:P.gold}}/></div><div style={{border:`2px dashed ${P.line}`,borderRadius:25,width:170,height:170,display:"flex",alignItems:"center",justifyContent:"center",fontSize:100,color:P.line}}>↗</div></div><div style={{display:"flex",justifyContent:"space-between",color:P.muted,fontSize:24}}><span>WHERE YOU ARE</span><span>WHAT COULD BE NEXT</span></div><div style={{marginTop:45,paddingTop:28,borderTop:"1px solid #a9e8ba33",fontSize:34}}>Ideas. Ambition. A next move.</div></Box>;
    case "scatter":return <><svg width="840" height="480" style={{position:"absolute",top:40}}>{[0,1,2].map(i=><path key={i} d={`M 410 240 L ${[120,700,360][i]} ${[60,160,420][i]}`} stroke="#a9e8ba44" strokeWidth="2" strokeDasharray="8 10"/>)}</svg>{["Group chat / 01","Another link / 02","Someone’s post / 03"].map((t,i)=><Wire key={t} f={f} delay={i*10} style={{position:"relative",marginLeft:[0,140,50][i],marginBottom:30,width:670}}><Box><Tag>{t}</Tag><div style={{height:10,width:"70%",background:"#a9e8ba55",marginBottom:18}}/><div style={{height:10,width:"45%",background:"#a9e8ba22"}}/></Box></Wire>)}</>;
    case "miss":return <Box><Tag>DISCOVERY SHOULDN’T BE LUCK</Tag><div style={{fontSize:43,fontWeight:750,marginTop:35}}>A possibility worth finding.</div><div style={{display:"flex",gap:20,marginTop:34,fontSize:24,color:P.line}}><span>JOBS</span><span>EVENTS</span><span>OFFERS</span></div><div style={{position:"relative",height:180,marginTop:40,border:"2px dashed #a9e8ba44",borderRadius:20,overflow:"hidden"}}><div style={{position:"absolute",top:45,left:30,fontSize:34,color:P.muted,transform:`translateY(${-ease(f,30,90)*100}px)`,opacity:1-ease(f,45,95)}}>Buried in the scroll…</div><div style={{position:"absolute",bottom:25,right:30,color:P.gold,fontSize:65}}>?</div></div><div style={{marginTop:30,fontSize:27,color:P.gold}}>Visibility matters.</div></Box>;
    case "distance":return <><div style={{display:"flex",gap:45}}>{["YOUR CAMPUS","ANOTHER CAMPUS"].map((t,i)=><Box key={t} style={{width:390,height:290}}><Tag>{t}</Tag><Person i={i===0?0:2} size={125}/><div style={{marginTop:25,height:8,background:"#a9e8ba33",width:230}}/></Box>)}</div><svg width="840" height="220"><path d="M 170 0 V 110 H 670 V 0" fill="none" stroke={P.line} strokeWidth="3" strokeDasharray="8 10"/><circle cx={170+ease(f,20,100)*500} cy="110" r="10" fill={P.gold}/></svg><div style={{fontSize:35,color:P.line,textAlign:"center"}}>Distance should not define your circle.</div></>;
    case "hub":return <><svg width="840" height="590" viewBox="0 0 840 590">{[[100,80],[730,100],[110,510],[730,480]].map(([x,y],i)=><g key={i}><path d={`M ${x} ${y} H 420 V 295`} fill="none" stroke={P.line} strokeWidth="2" pathLength="1" strokeDasharray="1" strokeDashoffset={1-ease(f,i*9,40+i*9)}/><rect x={x-70} y={y-35} width="140" height="70" rx="16" fill={P.panel} stroke={P.line}/><text x={x} y={y+7} textAnchor="middle" fontSize="21" fill={P.white}>{["PEOPLE","DISCOVER","COMMUNITY","INBOX"][i]}</text></g>)}<rect x="290" y="165" width="260" height="260" rx="45" fill="#19452e" stroke={P.line} strokeWidth="3"/></svg><Img src={staticFile("skng-logo.png")} style={{position:"absolute",left:310,top:185,width:220,height:220,objectFit:"contain"}}/><div style={{textAlign:"center",fontSize:46,fontWeight:800}}>SkoolConnectNG</div></>;
    case "people":return <Box><Tag>PEOPLE / A WIDER CIRCLE</Tag>{["A fellow student","A fresh perspective","A new collaborator"].map((t,i)=><Wire key={t} f={f} delay={i*12}><div style={{display:"flex",alignItems:"center",gap:28,padding:"30px 0",borderBottom:"1px solid #a9e8ba33"}}><Person i={i+1}/><div style={{fontSize:32,flex:1}}>{t}</div><div style={{fontSize:27,color:P.line,padding:"13px 18px",border:"1px solid #a9e8ba88",borderRadius:14}}>Connect ↗</div></div></Wire>)}<div style={{marginTop:32,fontSize:26,color:P.muted}}>One connection can change your next move.</div></Box>;
    case "discover":return <Box><Tag>DISCOVER / WHAT’S OUT THERE</Tag>{["Jobs & opportunities","Events to explore","Student offers"].map((t,i)=><Wire key={t} f={f} delay={i*13}><Box accent={i===0} style={{marginTop:22,display:"flex",alignItems:"center",gap:24}}><div style={{fontSize:38,color:P.gold}}>0{i+1}</div><div style={{fontSize:33,flex:1}}>{t}</div><span style={{fontSize:42,color:P.line}}>↗</span></Box></Wire>)}<div style={{marginTop:30,fontSize:26,color:P.muted}}>More discovery. Fewer places to look.</div></Box>;
    case "chat":return <Box><Tag>INBOX / A CONNECTION IN MOTION</Tag><div style={{display:"flex",alignItems:"center",gap:22,borderBottom:"1px solid #a9e8ba33",paddingBottom:25}}><Person i={2}/><div style={{fontSize:30,flex:1}}>Your next conversation</div><InboxIcon size={36} color={P.line}/></div>{["Hey, good to connect.","Let’s exchange ideas.","What are you working on?"].map((t,i)=><Wire key={t} f={f} delay={i*23+10}><div style={{marginTop:25,marginLeft:i%2?90:0,marginRight:i%2?0:80,padding:26,border:"1px solid #a9e8ba66",borderRadius:22,background:i%2?"#1d4933":"#102c22",fontSize:30}}>{t}</div></Wire>)}<div style={{marginTop:30,border:"1px solid #a9e8ba33",padding:20,borderRadius:15,color:P.muted,fontSize:24}}>Start with a hello… <span style={{float:"right",color:P.line}}>↗</span></div></Box>;
    case "community":return <Box><Tag>COMMUNITIES / FIND YOUR SPACE</Tag><div style={{display:"flex",alignItems:"center",gap:25}}><UsersIcon size={85} color={P.line}/><div style={{fontSize:42,fontWeight:750}}>Shared interests.<br/>New conversations.</div></div><div style={{display:"flex",gap:25,margin:"35px 0"}}>{[1,2,3,4].map(i=><Person key={i} i={i}/>)}</div>{["Share a perspective","Ask a question","Be part of the conversation"].map((t,i)=><Wire key={t} f={f} delay={i*12}><div style={{fontSize:31,padding:"25px 0",borderTop:"1px solid #a9e8ba33",color:i===2?P.line:P.white}}>＋ {t}</div></Wire>)}</Box>;
    case "path":return <Box accent><Tag>ONE CONNECTED EXPERIENCE</Tag>{[[UsersIcon,"PEOPLE","Find your circle"],[BookIcon,"DISCOVER","Explore possibilities"],[InboxIcon,"COMMUNITIES","Find where you belong"]].map(([Icon,label,caption],i)=>{const Glyph=Icon as typeof UsersIcon;return <Wire key={i} f={f} delay={i*12}><div style={{display:"flex",gap:30,padding:"30px 0",alignItems:"center",borderBottom:"1px solid #a9e8ba33"}}><Glyph size={60} color={P.line}/><div><Tag>{label as string}</Tag><div style={{fontSize:32}}>{caption as string}</div></div></div></Wire>;})}<div style={{marginTop:30,fontSize:28,color:P.line}}>Built around your student journey.</div></Box>;
    case "overview":return <Box accent><Tag>EVERY CONNECTION IS PART OF THE STORY</Tag><div style={{fontSize:58,fontWeight:800,lineHeight:1.15}}>A wider circle.<br/>A clearer next step.</div><div style={{marginTop:45,height:2,background:P.line}}/><div style={{marginTop:30,fontSize:31,color:P.muted}}>A connected place to discover,<br/>converse and belong.</div></Box>;
    case "cta":return <Box accent style={{textAlign:"center",padding:45}}><Img src={staticFile("skng-logo.png")} style={{width:160,height:160,objectFit:"contain"}}/><div style={{fontSize:42,fontWeight:800,marginTop:15}}>SkoolConnectNG</div><div style={{marginTop:50,background:P.line,color:P.bg,borderRadius:25,padding:"30px 18px",fontSize:53,fontWeight:850,letterSpacing:-2}}>skoolconnect.ng ↗</div><div style={{marginTop:35,fontSize:28,color:P.line}}>Visit. Join. Start connecting.</div><div style={{marginTop:24,fontSize:24,color:P.muted}}>https://skoolconnect.ng</div></Box>;
    default:return null;
  }
};

const Panel:React.FC<{chapter:Chapter;index:number;frame:number}>=({chapter,index,frame})=>{
  const f=frame-starts[index];
  return <div style={{position:"absolute",left:chapter.x,top:chapter.y,width:1000,height:1600,border:"2px solid #a9e8ba55",borderRadius:38,background:P.bg,boxSizing:"border-box",overflow:"hidden"}}>
    <div style={{position:"absolute",left:0,right:0,top:0,height:66,borderBottom:"1px solid #a9e8ba33",padding:"22px 40px",boxSizing:"border-box",display:"flex",justifyContent:"space-between",fontSize:17,letterSpacing:3,color:P.muted}}><span>SKOOLCONNECTNG / CONNECTED JOURNEY</span><span>{String(index+1).padStart(2,"0")}</span></div>
    <div style={{position:"absolute",top:140,left:70,right:70}}><Tag>{chapter.label}</Tag><div style={{fontSize:chapter.kind==="miss"?76:82,fontWeight:800,letterSpacing:-4,lineHeight:1.08}}>{chapter.title.map(t=><div key={t}>{t}</div>)}</div><div style={{marginTop:27,fontSize:28,lineHeight:1.5,color:P.muted,maxWidth:830}}>{chapter.reason}</div></div>
    <div style={{position:"absolute",left:70,right:70,top:640}}><Diagram kind={chapter.kind} f={Math.max(0,f)}/><ProductReveal kind={chapter.kind} f={Math.max(0,f)}/></div>
    <div style={{position:"absolute",bottom:55,left:70,right:70,display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid #a9e8ba33",paddingTop:25,fontSize:21,color:P.line}}><span>skoolconnect.ng</span><span>FOLLOW THE CONNECTION →</span></div>
  </div>;
};

export const ConnectedVisual:React.FC<{frame:number}>=({frame})=>{
  const cam=whyCamera(frame);
  const screen=(x:number,y:number)=>({x:540+(x-cam.x)*cam.zoom,y:960+(y-cam.y)*cam.zoom});
  const overview=frame>=starts[10]+70&&frame<starts[11]-18;
  return <AbsoluteFill style={{background:P.bg,color:P.white,fontFamily:HEADING_FONT,overflow:"hidden"}}>
    <AbsoluteFill style={{backgroundImage:"radial-gradient(#a9e8ba30 1.5px, transparent 1.5px)",backgroundSize:`${55*cam.zoom}px ${55*cam.zoom}px`,backgroundPosition:`${-cam.x*cam.zoom}px ${-cam.y*cam.zoom}px`}}/>
    <svg width="1080" height="1920" style={{position:"absolute",inset:0}}>{WHY_CHAPTERS.slice(1).map((c,i)=>{
      const a=WHY_CHAPTERS[i];let ax=a.x+1000,ay=a.y+800,bx=c.x,by=c.y+800;
      if(c.x<a.x){ax=a.x;bx=c.x+1000;}
      if(c.y>a.y){ax=a.x+500;ay=a.y+1600;bx=c.x+500;by=c.y;}
      const p=screen(ax,ay),q=screen(bx,by);const mx=(p.x+q.x)/2,my=(p.y+q.y)/2;
      const d=c.y===a.y?`M${p.x},${p.y} H${mx} V${q.y} H${q.x}`:`M${p.x},${p.y} V${my} H${q.x} V${q.y}`;
      return <g key={i}><path d={d} fill="none" stroke="#a9e8ba33" strokeWidth={3}/><path d={d} fill="none" stroke={P.line} strokeWidth={3} pathLength="1" strokeDasharray="1" strokeDashoffset={1-ease(frame,starts[i+1]-45,starts[i+1]+10)}/><circle cx={p.x} cy={p.y} r={6} fill={P.gold}/><circle cx={q.x} cy={q.y} r={6} fill={P.gold}/><rect x={mx-25} y={my-25} width="50" height="50" rx="12" fill={P.bg} stroke={P.line}/><text x={mx} y={my+9} textAnchor="middle" fill={P.line} fontSize="25">{c.y===a.y?(c.x>a.x?"→":"←"):"↓"}</text></g>;
    })}</svg>
    <div style={{position:"absolute",left:540,top:960,transformOrigin:"0 0",transform:`scale(${cam.zoom}) translate(${-cam.x}px,${-cam.y}px)`,filter:cam.velocity>0.7?`blur(${(cam.velocity-0.7)*3}px)`:undefined}}>{WHY_CHAPTERS.map((c,i)=>{
      const p=screen(c.x+500,c.y+800);
      if(Math.abs(p.x-540)>540+cam.zoom*650||Math.abs(p.y-960)>960+cam.zoom*950)return null;
      return <Panel key={i} chapter={c} index={i} frame={frame}/>;
    })}</div>
    <AbsoluteFill style={{pointerEvents:"none",boxShadow:"inset 0 0 120px 15px #0006"}}/>
    {overview&&<><div style={{position:"absolute",top:160,left:65,right:65,textAlign:"center",fontSize:68,fontWeight:800,letterSpacing:-3,lineHeight:1.1,background:"linear-gradient(#071b16 70%,transparent)",paddingBottom:35}}>One connected<br/><span style={{color:P.line}}>student journey.</span></div><div style={{position:"absolute",bottom:225,left:70,right:70,textAlign:"center",fontSize:31,color:P.line,background:P.bg,padding:25,borderRadius:25,border:"1px solid #a9e8ba55"}}>That’s why SkoolConnectNG matters.</div></>}
    <div style={{position:"absolute",bottom:110,left:70,right:70,display:"flex",alignItems:"center",gap:20,color:P.muted,fontSize:17,letterSpacing:3}}><span>{String(cam.index+1).padStart(2,"0")} / 12</span><div style={{height:2,background:"#a9e8ba33",flex:1}}><div style={{width:`${frame/1799*100}%`,height:2,background:P.line}}/></div><span>SKOOLCONNECTNG</span></div>
  </AbsoluteFill>;
};
export const WhyConnected:React.FC=()=>{const frame=useCurrentFrame();return <AbsoluteFill><ConnectedVisual frame={frame}/><Audio src={staticFile("bed-why60.mp3")} volume={0.88}/></AbsoluteFill>;};
export const WhyBoard:React.FC=()=> <AbsoluteFill style={{background:P.bg,padding:25,display:"grid",gridTemplateColumns:"repeat(4, 216px)",gridTemplateRows:"repeat(3, 416px)",gap:18}}>{WHY_CHAPTERS.map((c,i)=><div key={i} style={{width:216,height:416,position:"relative",overflow:"hidden"}}><div style={{position:"absolute",width:1080,height:1920,transform:"scale(0.2)",transformOrigin:"top left"}}><Sequence><ConnectedVisual frame={starts[i]+Math.min(80,c.duration-30)}/></Sequence></div><div style={{position:"absolute",top:390,fontSize:12,color:P.white}}>{i+1}. {c.label}</div></div>)}</AbsoluteFill>;
