const path = require("path");
const {NOTE: N, renderBed, ffmpegPath} = require("./lib/synth");
const sections = [
  {from:0,to:5,root:N.A1,chord:[N.A2,N.C3,N.E3],pad:0.6,drive:1,tension:0.35,bright:0.2,riser:true},
  {from:5,to:10,root:N.F2,chord:[N.F3,N.A3,N.C4],pad:0.8,drive:2,tension:0,bright:0.55,impact:true,arp:[N.F4,N.C4,N.A3,N.C4]},
  {from:10,to:17.5,root:N.C2,chord:[N.C3,N.E3,N.G3],pad:0.8,drive:2,tension:0,bright:0.7,arp:[N.C4,N.G4,N.E4,N.G4]},
  {from:17.5,to:24,root:N.G2,chord:[N.G3,N.B3,N.D4],pad:0.85,drive:2,tension:0,bright:0.75,impact:true,arp:[N.G4,N.D4,N.B3,N.D4]},
  {from:24,to:32,root:N.F2,chord:[N.F3,N.A3,N.C4],pad:0.9,drive:2,tension:0,bright:0.8,arp:[N.F4,N.C5,N.A4,N.C5]},
  {from:32,to:40,root:N.C2,chord:[N.C3,N.E3,N.G3],pad:0.9,drive:2,tension:0,bright:0.9,impact:true,arp:[N.C4,N.E4,N.G4,N.C5]},
  {from:40,to:44,root:N.G2,chord:[N.G3,N.B3,N.D4],pad:0.8,drive:1,tension:0,bright:0.7,riser:true},
  {from:44,to:50,root:N.C2,chord:[N.C3,N.G3,N.C4,N.E4],pad:1,drive:0,tension:0,bright:0.9,impact:true},
];
const outPath=path.resolve(__dirname,"../public/bed-world50.mp3");
const result=renderBed({seconds:50,bpm:120,sections,outPath,ffmpeg:ffmpegPath(),fadeIn:0.15,fadeOut:1.8});
console.log(`Wrote ${outPath} (${result.bytes} bytes)`);
