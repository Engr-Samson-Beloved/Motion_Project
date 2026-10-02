const path=require("path");
const {NOTE:N,renderBed,ffmpegPath}=require("./lib/synth");
const sections=[
 {from:0,to:4,root:N.A1,chord:[N.A2,N.C3,N.E3],pad:0.65,drive:0,tension:0.25,bright:0.2},
 {from:4,to:13,root:N.A1,chord:[N.A2,N.C3,N.E3],pad:0.7,drive:1,tension:0.3,bright:0.3,arp:[N.A3,N.E4,N.C4,N.E4],riser:true},
 {from:13,to:18,root:N.F2,chord:[N.F3,N.A3,N.C4],pad:0.8,drive:1,tension:0.1,bright:0.5,riser:true},
 {from:18,to:28,root:N.C2,chord:[N.C3,N.E3,N.G3],pad:0.85,drive:2,tension:0,bright:0.7,impact:true,arp:[N.C4,N.G4,N.E4,N.G4]},
 {from:28,to:38,root:N.G2,chord:[N.G3,N.B3,N.D4],pad:0.9,drive:2,tension:0,bright:0.75,arp:[N.G4,N.D4,N.B3,N.D4]},
 {from:38,to:48,root:N.F2,chord:[N.F3,N.A3,N.C4],pad:0.95,drive:2,tension:0,bright:0.85,arp:[N.F4,N.C5,N.A4,N.C5]},
 {from:48,to:54,root:N.G2,chord:[N.G3,N.B3,N.D4],pad:1,drive:1,tension:0,bright:0.9,impact:true,riser:true},
 {from:54,to:60,root:N.C2,chord:[N.C3,N.G3,N.C4,N.E4],pad:1,drive:0,tension:0,bright:0.9,impact:true},
];
const outPath=path.resolve(__dirname,"../public/bed-why60.mp3");
const result=renderBed({seconds:60,bpm:120,sections,outPath,ffmpeg:ffmpegPath(),fadeIn:0.15,fadeOut:1.8});
console.log(`Wrote ${outPath} (${result.bytes} bytes)`);
