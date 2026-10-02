import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { HEADING_FONT } from "../brand";

export const NEXT_MOVE_DURATION = 900;
const mint = "#b8f2ca";
const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
const points = Array.from({length: 38}, (_, i) => ({x: 960 + Math.cos(i * 2.399) * (180 + (i % 7) * 100), y: 540 + Math.sin(i * 2.399) * (120 + (i % 5) * 90)}));

const Network: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{transform: `scale(${1 + f / 6500}) rotate(${f / 240}deg)`, opacity: 0.6}}>
    <svg width="1920" height="1080" viewBox="0 0 1920 1080">
      {points.map((p, i) => <g key={i} opacity={ease(f, i * 3, i * 3 + 45)}>
        <line x1={p.x} y1={p.y} x2={960} y2={540} stroke={mint} strokeWidth="1" strokeOpacity="0.19" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - ease(f, i * 3, i * 3 + 65)} />
        <circle cx={p.x} cy={p.y} r={4 + Math.sin(f / 18 + i) * 1.5} fill={mint}/>
        <circle cx={p.x} cy={p.y} r="15" fill="none" stroke={mint} strokeOpacity="0.12"/>
      </g>)}
      <circle cx="960" cy="540" r={120 + (f % 90) * 4} fill="none" stroke={mint} opacity={(1 - (f % 90) / 90) * 0.15}/>
    </svg>
  </AbsoluteFill>;
};

const Copy: React.FC<{kicker: string; lines: string[]; sub?: string; left?: boolean}> = ({kicker, lines, sub, left}) => {
  const f = useCurrentFrame();
  return <div style={{position: "absolute", left: left ? 150 : 120, right: left ? 940 : 120, top: left ? 300 : 320, textAlign: left ? "left" : "center"}}>
    <div style={{fontSize: 19, letterSpacing: 6, color: mint, marginBottom: 32, opacity: ease(f, 0, 18)}}>{kicker}</div>
    {lines.map((line, i) => <div key={line} style={{overflow: "hidden", paddingBottom: 9}}><div style={{fontSize: left ? 82 : 105, fontWeight: 800, lineHeight: 1.06, letterSpacing: -5, transform: `translateY(${(1 - spring({frame: f - i * 8, fps: 30, config: {damping: 22, stiffness: 85}})) * 140}px)`}}>{line}</div></div>)}
    {sub && <div style={{fontSize: 27, lineHeight: 1.5, color: "#b6c9c0", marginTop: 30, opacity: ease(f, 30, 55)}}>{sub}</div>}
  </div>;
};

const Product: React.FC<{file: string; kicker: string; lines: string[]; sub: string}> = ({file, kicker, lines, sub}) => {
  const f = useCurrentFrame();
  const reveal = spring({frame: f, fps: 30, config: {damping: 24, stiffness: 70}});
  return <AbsoluteFill>
    <div style={{position: "absolute", width: 900, height: 900, left: 920, top: 100, background: "radial-gradient(ellipse, #20825155, transparent 65%)"}}/>
    <Copy kicker={kicker} lines={lines} sub={sub} left/>
    <div style={{position: "absolute", left: 1130, top: 80, width: 440, transform: `perspective(1500px) translateY(${(1 - reveal) * 550}px) rotateY(${-14 + f / 14}deg) rotateZ(${-5 + f / 70}deg) scale(${1 + f / 1800})`, filter: "drop-shadow(0px 40px 50px #0009)"}}><Img src={staticFile(file)} style={{width: "100%"}}/></div>
    <div style={{position: "absolute", left: 1060, top: 865, width: 650, height: 2, background: "linear-gradient(90deg, transparent, #b8f2ca, transparent)", opacity: 0.5}}/>
  </AbsoluteFill>;
};

const Finale: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{alignItems: "center", justifyContent: "center", textAlign: "center", opacity: ease(f, 0, 18)}}>
    <Img src={staticFile("skng-logo.png")} style={{width: 105, height: 105, objectFit: "contain", marginBottom: 18}}/>
    <div style={{fontSize: 27, fontWeight: 700, letterSpacing: 1}}>SkoolConnectNG</div>
    <div style={{fontSize: 76, letterSpacing: -3, fontWeight: 800, marginTop: 35}}>Make your next move.</div>
    <div style={{fontSize: 29, color: "#bdd2c6", marginTop: 15}}>Find your people. Discover what’s next.</div>
    <div style={{marginTop: 44, padding: "25px 65px", borderRadius: 60, background: mint, color: "#09281b", fontSize: 58, fontWeight: 800, letterSpacing: -2, boxShadow: "0 0 80px #80edaa25"}}>skoolconnect.ng <span style={{marginLeft: 20}}>↗</span></div>
    <div style={{fontSize: 24, marginTop: 24, color: mint}}>Visit https://skoolconnect.ng • Join the community</div>
  </AbsoluteFill>;
};

export const NextMove: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{background: "#071810", color: "#f5fff7", fontFamily: HEADING_FONT, overflow: "hidden"}}>
    <AbsoluteFill style={{background: "radial-gradient(ellipse at 65% 45%, #16553888, transparent 65%)"}}/>
    <Network/>
    <Sequence durationInFrames={150}><Copy kicker="YOUR FUTURE IS CALLING" lines={["One connection.", "A whole new direction."]}/></Sequence>
    <Sequence from={150} durationInFrames={180}><Copy kicker="SKOOLCONNECTNG" lines={["Beyond your campus.", "Closer to your next move."]} sub="A network built around the Nigerian student journey."/></Sequence>
    <Sequence from={330} durationInFrames={120}><Product file="screens/people.png" kicker="01 / CONNECT" lines={["Find", "your people."]} sub="Meet people beyond your campus."/></Sequence>
    <Sequence from={450} durationInFrames={120}><Product file="screens/discover.png" kicker="02 / DISCOVER" lines={["See what’s", "out there."]} sub="Explore jobs, events and opportunities."/></Sequence>
    <Sequence from={570} durationInFrames={150}><Product file="screens/community.png" kicker="03 / BELONG" lines={["Don’t just", "watch.", "Be part of it."]} sub="Join communities. Start conversations."/></Sequence>
    <Sequence from={720} durationInFrames={180}><Finale/></Sequence>
    <div style={{position: "absolute", top: 68, left: 90, fontSize: 17, letterSpacing: 4, color: "#b8f2ca88"}}>SKOOLCONNECTNG / THE NEXT MOVE</div>
    <div style={{position: "absolute", bottom: 69, right: 90, fontSize: 20, color: "#d1e8d9"}}>skoolconnect.ng</div>
    <div style={{position: "absolute", left: 90, bottom: 77, width: 190, height: 2, background: "#ffffff18"}}><div style={{height: 2, width: `${f / 899 * 100}%`, background: mint}}/></div>
    <AbsoluteFill style={{pointerEvents: "none", boxShadow: "inset 0 0 180px 40px #0008"}}/>
    <div style={{position: "absolute", top: 0, width: "100%", height: 42, background: "#020805"}}/>
    <div style={{position: "absolute", bottom: 0, width: "100%", height: 42, background: "#020805"}}/>
    <Audio src={staticFile("bed30.mp3")} volume={(frame) => 0.85 * (1 - ease(frame, 870, 900))}/>
  </AbsoluteFill>;
};
