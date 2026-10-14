import React from "react";
import {AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import type {AssetMap} from "./assets";
import type {BrandProfile} from "./brand";
import type {Direction} from "./direction";
import type {MotionPlan} from "./plan";

const clamp = {extrapolateLeft:"clamp" as const, extrapolateRight:"clamp" as const};

export const makeStoryModule = (brand: BrandProfile, direction: Direction, assets: AssetMap) => {
  const StoryFilm: React.FC<{plan: MotionPlan}> = ({plan}) => {
    const frame = useCurrentFrame();
    const {width, height, fps} = useVideoConfig();
    const total = plan.scenes.reduce((sum, scene) => sum + scene.beats * direction.beat, 0);
    let start = 0;
    let active = plan.scenes[plan.scenes.length - 1];
    for (const scene of plan.scenes) {
      const end = start + scene.beats * direction.beat;
      if (frame < end) { active = scene; break; }
      start = end;
    }
    const local = frame - start;
    const length = active.beats * direction.beat;
    const enter = spring({frame: local, fps, config:{damping:direction.damping, mass:0.8}});
    const reveal = interpolate(local, [0, Math.min(12, length / 3)], [0.4, 1], clamp);
    const exit = interpolate(local, [Math.max(0, length - 8), length], [1, 0], clamp);
    const margin = width * 0.085;
    const headline = brand.voice === "caps" ? active.headline.toUpperCase() : active.headline;
    const textMotion = active.motion === "scale" ? `scale(${0.8 + 0.2 * enter})` : active.motion === "wipe" ? `translateX(${(1 - reveal) * -75}px)` : active.motion === "drift" ? `translateY(${(1 - reveal) * 35}px)` : `translateY(${(1 - enter) * 100}px)`;
    const span = Math.min(width * 0.84, plan.format === "wide" ? 1100 : 850);
    // Budget for roughly two lines of display type when copy is edited later.
    const headlineSize = Math.max(36, Math.min(width * (plan.format === "wide" ? 0.105 : 0.132), 178, span / (Math.max(8, headline.length / 2) * 0.56)));
    const artSize = Math.min(width * 0.61, height * 0.42);
    const nodes = Array.from({length:9}, (_, i) => {
      const angle = (i / 9) * Math.PI * 2 + local * 0.004;
      const radius = artSize * (0.34 + (i % 3) * 0.055);
      return {x:Math.cos(angle)*radius, y:Math.sin(angle)*radius};
    });
    const art = active.kind === "image" && active.asset && assets[active.asset] ? (
      <Img src={assets[active.asset]} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:24}}/>
    ) : active.kind === "orbit" ? (
      <div style={{width:artSize,height:artSize,position:"relative",border:`2px solid ${brand.line}`,borderRadius:"50%",transform:`rotate(${local * 0.12}deg) scale(${0.7 + 0.3 * enter})`}}>
        <div style={{position:"absolute",inset:"24%",borderRadius:"50%",background:brand.accent,boxShadow:`0 0 ${artSize * 0.22}px ${brand.accent}55`}}/>
        {nodes.slice(0,6).map((node,i)=><div key={i} style={{position:"absolute",left:`calc(50% + ${node.x}px)`,top:`calc(50% + ${node.y}px)`,width:i%2?18:30,height:i%2?18:30,borderRadius:"50%",background:i%2?brand.ink:brand.accent}}/>)}
      </div>
    ) : active.kind === "signal" ? (
      <svg width={artSize} height={artSize} viewBox="0 0 600 600" style={{overflow:"visible"}}>
        {nodes.slice(0,8).map((node,i)=>{const next=nodes[(i+3)%9];return <line key={`l${i}`} x1={300+node.x/artSize*600} y1={300+node.y/artSize*600} x2={300+next.x/artSize*600} y2={300+next.y/artSize*600} stroke={brand.accent} strokeWidth="3" opacity={0.2+0.55*reveal}/>;})}
        {nodes.map((node,i)=><circle key={i} cx={300+node.x/artSize*600} cy={300+node.y/artSize*600} r={i%3===0?14:7} fill={i%3===0?brand.ink:brand.accent}/>)}
      </svg>
    ) : active.kind === "split" ? (
      <div style={{width:artSize,height:artSize*0.62,display:"flex",gap:12,transform:`translateX(${(1-enter)*90}px)`}}>
        <div style={{flex:1,border:`2px solid ${brand.line}`,borderRadius:16,background:brand.line,transform:`translateY(${Math.sin(local/22)*12}px)`}}/>
        <div style={{flex:1,borderRadius:16,background:brand.accent,transform:`translateY(${Math.cos(local/22)*12}px)`}}/>
      </div>
    ) : (
      <div style={{width:artSize*0.78,height:artSize*0.78,border:`10px solid ${brand.accent}`,borderRadius:"50%",transform:`scale(${0.8+0.35*reveal}) rotate(${local*0.18}deg)`,opacity:0.8}}/>
    );
    const artRight = active.kind === "split" || active.kind === "image";
    const artTop = plan.format === "wide" ? height * 0.17 : height * (active.kind === "type" ? 0.11 : 0.15);
    const textTop = plan.format === "wide" ? height * 0.42 : height * (active.kind === "type" ? 0.47 : 0.58);
    return <AbsoluteFill style={{background:brand.ground,overflow:"hidden",color:brand.ink}}>
      <div style={{position:"absolute",inset:0,opacity:0.35,backgroundImage:`linear-gradient(${brand.line} 1px, transparent 1px),linear-gradient(90deg, ${brand.line} 1px, transparent 1px)`,backgroundSize:`${Math.round(width/12)}px ${Math.round(width/12)}px`,maskImage:"linear-gradient(to bottom, transparent, black 30%, transparent)"}}/>
      <div style={{position:"absolute",top:artTop,left:artRight?"auto":margin,right:artRight?margin:"auto",width:artSize,height:artSize,display:"grid",placeItems:"center",opacity:exit}}>{art}</div>
      <div style={{position:"absolute",left:margin,right:margin,top:textTop,maxWidth:span,opacity:exit}}>
        <div style={{fontFamily:brand.monoFont,fontSize:Math.max(20,width*0.022),color:brand.accent,letterSpacing:"0.17em",textTransform:"uppercase",opacity:reveal,marginBottom:26}}>{active.kicker || `${String(plan.scenes.indexOf(active)+1).padStart(2,"0")} / ${plan.scenes.length}`}</div>
        <div style={{fontFamily:brand.headingFont,fontWeight:900,fontSize:headlineSize,lineHeight:0.94,letterSpacing:brand.headingTracking,maxWidth:span,overflowWrap:"anywhere",transform:textMotion,opacity:reveal}}>{headline}</div>
        {active.detail && <div style={{fontFamily:brand.bodyFont,fontSize:Math.min(width*0.038,48),lineHeight:1.25,color:brand.muted,marginTop:34,maxWidth:span*0.82,opacity:interpolate(local,[8,26],[0,1],clamp)}}>{active.detail}</div>}
      </div>
      <div style={{position:"absolute",bottom:height*0.07,left:margin,right:margin,height:3,background:brand.line}}><div style={{width:`${((start+local)/total)*100}%`,height:"100%",background:brand.accent}}/></div>
      <div style={{position:"absolute",bottom:height*0.04,left:margin,fontFamily:brand.monoFont,fontSize:Math.max(15,width*0.017),color:brand.muted}}>{plan.thesis}</div>
    </AbsoluteFill>;
  };
  return {StoryFilm};
};
