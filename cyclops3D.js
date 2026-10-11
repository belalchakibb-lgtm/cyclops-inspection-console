/* CYCLOPS add-on 2: 3D animation for each equipment (PT, MT, UT, RT, VT, APL, APE, APVG, OTHER) + AI assistant.
   Load AFTER cyclops-procs.js:
     <script src="/cyclops-procs.js"></script>
     <script src="/cyclops-3d.js"></script>
   Recommended (1 line) in cyclops-procs.js, right after "const PROC={};" :   window.CYPROC=PROC;
  AI backend (optional): window.CY_AI_URL='/api/ask' (default) or window.CY_AI=async(question,context,history,request)=>"answer".
   Without a backend the assistant answers offline from the procedures. No external library, works offline (canvas 2D, own 3D engine). */
(function(){
'use strict';
const PI=Math.PI,TAU=PI*2;
const $q=s=>document.querySelector(s);
const FR=()=>typeof lang!=='undefined'&&lang==='fr';
const L=(en,fr)=>FR()?fr:en;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t*t*(3-2*t);
const hash=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s)};
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const rgb=(c,k,a)=>'rgba('+(clamp(c[0]*k,0,255)|0)+','+(clamp(c[1]*k,0,255)|0)+','+(clamp(c[2]*k,0,255)|0)+','+a+')';
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const nrm=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l]};
function rt(p,r){let x=p[0],y=p[1],z=p[2],c,s,t;
 if(r[0]){c=Math.cos(r[0]);s=Math.sin(r[0]);t=y*c-z*s;z=y*s+z*c;y=t}
 if(r[1]){c=Math.cos(r[1]);s=Math.sin(r[1]);t=x*c+z*s;z=-x*s+z*c;x=t}
 if(r[2]){c=Math.cos(r[2]);s=Math.sin(r[2]);t=x*c-y*s;y=x*s+y*c;x=t}
 return[x,y,z]}
function circ(p,r,ax,n,arc,a0){n=n||24;arc=arc==null?1:arc;a0=a0||0;const o=[],m=Math.max(2,Math.ceil(n*arc));
 for(let i=0;i<=m;i++){const t=a0+i/m*arc*TAU,c=Math.cos(t)*r,s=Math.sin(t)*r;
  o.push(ax=='y'?[p[0]+c,p[1],p[2]+s]:ax=='z'?[p[0]+s,p[1]+c,p[2]]:[p[0],p[1]+c,p[2]+s])}return o}

/* ===== colors ===== */
const STEEL=[76,104,157],BEAD=[151,139,205],RED=[235,70,105],WHITE=[235,242,255],BLUE=[61,169,255],VIOLET=[157,101,255],YEL=[180,225,255],GRN=[90,235,190],ORG=[190,110,255],DK=[24,30,52];

/* ===== mini 3D engine (painter's algorithm on canvas 2D) ===== */
function R3(cv){this.cv=cv;this.c=cv.getContext('2d');this.items=[];this.g=null;this.hud=null;this.yaw=.6;this.pit=.4;this.dist=11;this.tg=[0,0,0]}
R3.prototype={
 reset(c){this.yaw=c.y;this.pit=c.p;this.dist=c.d;this.tg=c.t.slice()},
 begin(){this.items.length=0;this.g=null;this.hud=null},
 G(p,r){this.g=p?{p:p,r:r||[0,0,0]}:null},
 W(q){if(!this.g)return q;const v=rt(q,this.g.r);return[v[0]+this.g.p[0],v[1]+this.g.p[1],v[2]+this.g.p[2]]},
 X(v,rot,p){let q=rot?rt(v,rot):v;return this.W([q[0]+p[0],q[1]+p[1],q[2]+p[2]])},
 box(p,s,col,rot,a,b){const x=s[0]/2,y=s[1]/2,z=s[2]/2,vs=[];
  for(const i of[-1,1])for(const j of[-1,1])for(const k of[-1,1])vs.push(this.X([i*x,j*y,k*z],rot,p));
  for(const f of[[0,1,3,2],[4,5,7,6],[0,1,5,4],[2,3,7,6],[0,2,6,4],[1,3,7,5]])this.items.push({k:'p',p:f.map(i=>vs[i]),c:col,a:a==null?1:a,b:b||0})},
 cyl(p,r,h,col,rot,n,r2,a,b){n=n||14;if(r2==null)r2=r;const lo=[],hi=[];a=a==null?1:a;b=b||0;
  for(let i=0;i<n;i++){const t=i/n*TAU,c=Math.cos(t),s=Math.sin(t);lo.push(this.X([r*c,-h/2,r*s],rot,p));hi.push(this.X([r2*c,h/2,r2*s],rot,p))}
  for(let i=0;i<n;i++){const j=(i+1)%n;this.items.push({k:'p',p:[lo[i],lo[j],hi[j],hi[i]],c:col,a:a,b:b})}
  this.items.push({k:'p',p:lo,c:col,a:a,b:b});if(r2>0)this.items.push({k:'p',p:hi,c:col,a:a,b:b})},
 quad(p0,p1,p2,p3,col,a,b){this.items.push({k:'p',p:[p0,p1,p2,p3].map(q=>this.W(q)),c:col,a:a==null?1:a,b:b||0})},
 sph(p,r,col,a,b){this.items.push({k:'s',p:this.W(p),r:r,c:col,a:a==null?1:a,b:b||0})},
 ln(p,q,col,w,a,b){this.items.push({k:'l',p:this.W(p),q:this.W(q),c:col,w:w||1,a:a==null?1:a,b:b||0})},
 path(pts,col,w,a,b){for(let i=0;i<pts.length-1;i++)this.ln(pts[i],pts[i+1],col,w,a,b)},
 txt(p,s,col,b){this.items.push({k:'t',p:this.W(p),s:s,c:col||WHITE,b:b||0})},
 grid(n,st,y){for(let i=-n;i<=n;i+=st){this.ln([i,y,-n],[i,y,n],[70,90,115],.8,.45,-1e3);this.ln([-n,y,i],[n,y,i],[70,90,115],.8,.45,-1e3)}},
 flush(){const cv=this.cv,c=this.c,W=cv.clientWidth,H=cv.clientHeight;if(W<10||H<10)return;
  const d=(typeof devicePixelRatio!=='undefined'&&devicePixelRatio)||1;
  if(cv.width!==(W*d|0)||cv.height!==(H*d|0)){cv.width=W*d|0;cv.height=H*d|0}
  c.setTransform(d,0,0,d,0,0);
  const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#081737');g.addColorStop(.52,'#111b4a');g.addColorStop(1,'#24134d');c.fillStyle=g;c.fillRect(0,0,W,H);
  const glow=c.createRadialGradient(W*.52,H*.42,0,W*.52,H*.42,Math.max(W,H)*.7);glow.addColorStop(0,'rgba(74,142,255,.18)');glow.addColorStop(.55,'rgba(123,78,220,.1)');glow.addColorStop(1,'rgba(5,8,24,0)');c.fillStyle=glow;c.fillRect(0,0,W,H);
  const tg=this.tg,cd=this.dist,cp=[tg[0]+cd*Math.cos(this.pit)*Math.sin(this.yaw),tg[1]+cd*Math.sin(this.pit),tg[2]+cd*Math.cos(this.pit)*Math.cos(this.yaw)];
  const f=nrm(sub(tg,cp)),rg=nrm(cross(f,[0,1,0])),up=cross(rg,f),F=Math.min(W,H*1.6),Ld=nrm([.32,.9,.48]);
  const P=q=>{const v=sub(q,cp),z=dot(v,f);if(z<.3)return null;const s=F/z;return[W/2+dot(v,rg)*s,H/2-dot(v,up)*s,z,s]};
  const out=[];
  for(const it of this.items){
   if(it.k=='p'){const pr=[];let zs=0,ok=1;for(const q of it.p){const s=P(q);if(!s){ok=0;break}pr.push(s);zs+=s[2]}if(!ok)continue;
    const n=nrm(cross(sub(it.p[1],it.p[0]),sub(it.p[2],it.p[0])));it.pr=pr;it.sh=.42+.58*Math.abs(dot(n,Ld));it.d=zs/pr.length-it.b;out.push(it)}
   else if(it.k=='l'){const a=P(it.p),b=P(it.q);if(!a||!b)continue;it.A=a;it.B=b;it.d=(a[2]+b[2])/2-it.b-.02;out.push(it)}
   else{const a=P(it.p);if(!a)continue;it.A=a;it.d=a[2]-(it.k=='s'?it.r*.5:0)-it.b-(it.k=='t'?.05:0);out.push(it)}}
  out.sort((x,y)=>y.d-x.d);
  c.lineCap='round';c.lineJoin='round';c.textAlign='center';c.font='600 12px system-ui,sans-serif';
  for(const it of out){
   if(it.k=='p'){c.beginPath();it.pr.forEach((s,i)=>i?c.lineTo(s[0],s[1]):c.moveTo(s[0],s[1]));c.closePath();c.fillStyle=rgb(it.c,it.sh,it.a);c.fill();
    if(it.b<=0){c.lineWidth=.7;c.strokeStyle=it.a<.99?'rgba(200,215,235,.35)':'rgba(0,0,0,.28)';c.stroke()}}
   else if(it.k=='l'){c.beginPath();c.moveTo(it.A[0],it.A[1]);c.lineTo(it.B[0],it.B[1]);c.strokeStyle=rgb(it.c,1,it.a);c.lineWidth=it.w*clamp(10/it.A[2],.5,2);c.stroke()}
   else if(it.k=='s'){const x=it.A[0],y=it.A[1],r=Math.max(1,it.r*it.A[3]),gr=c.createRadialGradient(x-r*.3,y-r*.3,r*.1,x,y,r);
    gr.addColorStop(0,rgb(it.c,1.3,it.a));gr.addColorStop(1,rgb(it.c,.6,it.a));c.fillStyle=gr;c.beginPath();c.arc(x,y,r,0,TAU);c.fill()}
   else{const w=c.measureText(it.s).width,x=clamp(it.A[0],w/2+4,W-w/2-4);c.lineWidth=3;c.strokeStyle='rgba(0,0,0,.8)';c.strokeText(it.s,x,it.A[1]);c.fillStyle=rgb(it.c,1,1);c.fillText(it.s,x,it.A[1])}}
  if(this.hud)this.hud(c,W,H)}
};

/* ===== shared scene pieces ===== */
function hz(z){return Math.abs(z)<.3?Math.sqrt(.09-z*z)+.02:.014}
function plates(r,ov,a,bead){r.box([0,-.2,-1.6],[6,.4,3.2],STEEL);r.box([0,-.2,1.6],[6,.4,3.2],STEEL);
 r.cyl([0,.02,0],.3,6.1,bead||BEAD,[0,0,PI/2],16);
 if(ov&&a>.01){r.quad([-3,.014,-3.2],[3,.014,-3.2],[3,.014,-.3],[-3,.014,-.3],ov,a,.6);r.quad([-3,.014,.3],[3,.014,.3],[3,.014,3.2],[-3,.014,3.2],ov,a,.6)}}
function crackA(x0,zm,seed){const o=[];for(let i=0;i<=18;i++){const z=-zm+2*zm*i/18;o.push([x0+(hash(i+seed)-.5)*.08,hz(z)+.012,z])}return o}
function canAt(r,p,col,rot){r.cyl(p,.3,1.1,col,rot,14);r.cyl(rt([0,.62,0],rot).map((v,i)=>v+p[i]),.24,.14,[190,190,196],rot,12);
 r.cyl(rt([0,.78,0],rot).map((v,i)=>v+p[i]),.06,.2,DK,rot,8);return rt([0,.9,0],rot).map((v,i)=>v+p[i])}
function spray(r,a,b,col,T,n){const k=Math.floor(T*9);for(let i=0;i<n;i++)r.ln(a,[b[0]+(hash(i+k*7)-.5)*1.5,b[1],b[2]+(hash(i*3+k*5+1)-.5)*2.4],col,1,.5)}
function probe(r,px,pz,col){r.box([px,.22,pz+.33],[.5,.4,.62],col||[60,120,200]);r.path([[px,.4,pz+.6],[px,1.1,pz+1.2],[px+.6,1.5,pz+2]],[30,30,34],2)}
function speakText(text,language){if(typeof speechSynthesis==='undefined'||typeof SpeechSynthesisUtterance==='undefined')return false;const run=()=>{speechSynthesis.cancel();speechSynthesis.resume();const u=new SpeechSynthesisUtterance(text),voices=speechSynthesis.getVoices?speechSynthesis.getVoices():[],prefix=language==='fr-FR'?'fr':'en',preferred=language==='fr-FR'?['Microsoft','Google','Samantha','Thomas','Amelie']:['Microsoft','Google','Alex','Samantha','Daniel','Karen'];u.lang=language;u.rate=language==='fr-FR'?.92:.86;u.pitch=1;u.volume=1;u.voice=voices.filter(v=>v.lang&&v.lang.toLowerCase().startsWith(prefix)).sort((a,b)=>{const ai=preferred.findIndex(n=>a.name.includes(n)),bi=preferred.findIndex(n=>b.name.includes(n));return(ai<0?99:ai)-(bi<0?99:bi)})[0]||null;speechSynthesis.speak(u);setTimeout(()=>speechSynthesis.resume(),120)};const voices=speechSynthesis.getVoices?speechSynthesis.getVoices():[];if(!voices.length&&speechSynthesis.addEventListener){let done=false;const load=()=>{if(done)return;done=true;speechSynthesis.removeEventListener('voiceschanged',load);run()};speechSynthesis.addEventListener('voiceschanged',load);setTimeout(()=>{if(!done){done=true;speechSynthesis.removeEventListener('voiceschanged',load);run()}},250);return true}run();return true}

const SC={};
/* ================= PT ================= */
SC.PT={cam:{d:10.5,y:.55,p:.55,t:[0,.2,0]},ph:[
['Pre-cleaning','Pré-nettoyage',4,'pre-cleaning clean solvent contaminant dry'],
['Apply penetrant','Application du pénétrant',4,'apply penetrant spray continuous wet film'],
['Dwell time','Temps de pénétration',4,'dwell penetration time'],
['Remove excess','Élimination de l’excédent',4,'remove excess penetrant wipe solvent'],
['Apply developer','Application du révélateur',4,'developer apply thin film'],
['Inspect','Inspection',6,'inspection lighting lux indications interpretation window']],
draw(r,T,ph,u){
 const O=[[[110,85,60],.6*(1-u)],[RED,.8*u],[RED,.8],[RED,.8*(1-u)],[WHITE,.92*u],[WHITE,.92]][ph];
 plates(r,O[0],O[1],mix(BEAD,O[0],O[1]*.7));
 const fill=[0,0,u,1,1,1][ph],bl=[0,0,0,0,u*.4,.4+u*.6][ph],cp=crackA(1.2,.9,1);
 if(ph==0)r.path(cp,[35,35,40],2);else{r.path(cp,RED,2.2+bl*9,.95*fill,1.5);if(bl>0)r.path(cp,RED,8+bl*20,.2,1.4)}
 [[-1.7,0],[-1.5,.06]].forEach(q=>r.sph([q[0],.33,q[1]],.045+bl*.07,ph==0?[40,40,45]:RED,ph==0?1:.95*fill,1.5));
 if(ph==0){r.box([Math.sin(T*3)*2.3,.1,Math.sin(T*.9)*1.8],[.9,.1,.6],WHITE,[0,.3*Math.sin(T*3),0]);canAt(r,[3.3,.6,-2.3],BLUE,[0,0,.3])}
 if(ph==1){const x=lerp(-2.4,2.4,u);spray(r,canAt(r,[x-.5,1.7,1.2],RED,[0,0,.6]),[x,.02,0],RED,T,16)}
 if(ph==2){const c=[0,2,0];r.path(circ(c,.6,'z',40,1),[210,215,225],1.5);r.path(circ(c,.6,'z',40,u),YEL,4);r.txt([0,2.9,0],L('Dwell 5–10 min','Attente 5–10 min'),YEL);
  for(let i=0;i<5;i++){const z=-.7+i*.35;r.ln([1.2,.75+.1*Math.sin(T*5+i),z],[1.2,.12,z],RED,1.2,.7)}}
 if(ph==3)r.box([Math.sin(T*3)*2.3,.1,Math.sin(T*.9)*1.8],[.9,.1,.6],mix(WHITE,RED,.5),[0,.3*Math.sin(T*3),0]);
 if(ph==4){const x=lerp(2.4,-2.4,u);spray(r,canAt(r,[x-.5,1.7,1.2],WHITE,[0,0,.6]),[x,.02,0],WHITE,T,16)}
 if(ph==5){r.sph([-3,3,-2],.25,YEL);for(let i=0;i<6;i++)r.ln([-3,3,-2],[-1.5+i*.6,.05,(i%3-1)*.8],YEL,1,.14);r.txt([-3,3.5,-2],'≥ 1000 lux',YEL);
  r.path(circ([1.2,1.3,.7],.5,'z',28,1),[220,225,235],3);r.ln([1.55,.95,.7],[2,.6,.7],[160,120,80],4);
  if(u>.25){r.txt([1.2,2.1,-.9],L('Linear = crack','Linéaire = fissure'),RED);r.txt([-1.6,1.1,0],L('Rounded = porosity','Arrondie = porosité'),RED)}}}};
/* ================= MT ================= */
SC.MT={cam:{d:10.5,y:.55,p:.5,t:[0,.4,0]},ph:[
['Contrast paint','Peinture de contraste',4,'surface preparation contrast paint clean'],
['Place the yoke','Placer le yoke',3,'yoke pole spacing lifting power technique'],
['Magnetize','Magnétiser',4,'magnetizing field strength kA/m continuous method'],
['Apply particles','Appliquer les particules',4,'applying medium dry powder wet suspension ink'],
['Inspect','Inspection',4,'inspection indications light lux two directions'],
['2nd direction 90°','2e direction 90°',7,'two directions 90 demagnetizing field direction']],
draw(r,T,ph,u){
 const pa=ph==0?.92*u:.92;plates(r,WHITE,pa,mix(BEAD,WHITE,pa*.6));
 const th=ph<5?0:ease(clamp(u*2,0,1))*PI/2,h=ph==1?lerp(2.4,0,ease(u)):ph==0?4:0;
 const iA=ph==3?u:ph>=4?1:0,iB=ph==5?clamp((u-.5)*2,0,1):0,ca=crackA(.2,.85,3);
 r.path(ca,[150,150,155],1,.9,1.5);if(iA>0)r.path(ca,[15,15,40],1+iA*8,iA,1.6);
 const cb=[];for(let i=0;i<=8;i++)cb.push([.5+i*.17,.03,.75+(hash(i+9)-.5)*.04]);
 r.path(cb,[150,150,155],1,.9,1.5);if(iB>0)r.path(cb,[15,15,40],1+iB*8,iB,1.6);
 if(ph==0)spray(r,canAt(r,[lerp(-2.4,2.4,u)-.5,1.7,1.2],WHITE,[0,0,.6]),[lerp(-2.4,2.4,u),.02,0],WHITE,T,14);
 if(ph>=1){r.G([0,h+.17,0],[0,th,0]);
  for(const s of[-1,1]){r.cyl([s*1.5,.5,0],.16,1,[210,60,50],null,12);r.cyl([s*1.5,.02,0],.2,.08,[160,160,165],null,12);r.cyl([s*1.5,.62,0],.27,.45,[190,110,60],null,14)}
  r.box([0,1.15,0],[3.4,.28,.42],[60,64,72]);r.box([0,1.5,0],[.2,.5,.2],[60,64,72]);r.cyl([0,1.8,0],.1,.7,[30,30,34],[0,0,PI/2],10);
  if(ph>=2){const fa=ph==2?u:1;for(let k=-2;k<=2;k++){const pts=[];for(let i=0;i<=24;i++)pts.push([-1.5+3*i/24,-.1+.35*Math.sin(PI*i/24),k*.32]);
    r.path(pts,BLUE,1.6,.75*fa,.5);const w=(T*.35+k*.17)%1,j=Math.min(24,Math.floor(w*24));r.sph(pts[j],.055,[150,210,255],fa,.5)}
   r.txt([-1.5,.7,.6],'N',[255,120,120]);r.txt([1.5,.7,.6],'S',[120,160,255])}
  r.G()}
 if(ph==3)spray(r,canAt(r,[.9,2.1,1.5],[40,40,60],[0,0,.6]),[.2,.02,0],[30,30,60],T,14);
 if(ph==4)r.txt([.2,2.3,-.9],L('Crack ⟂ field = strong indication','Fissure ⟂ champ = indication nette'),YEL);
 if(ph==5){r.txt([0,2.8,0],u<.5?L('Rotate yoke 90°','Tourner le yoke de 90°'):L('Crack ∥ first field was invisible → 2 directions','Fissure ∥ au 1er champ invisible → 2 directions'),YEL);
  if(u>.8)r.txt([0,2.3,0],L('Then demagnetize (< 0.3 mT)','Puis démagnétiser (< 0,3 mT)'),GRN)}}};
/* ================= UT ================= */
function slab(r){const C=[130,145,160];r.box([0,-.7,1.9],[6,1.4,3],C,null,.28);r.box([0,-.7,-1.9],[6,1.4,3],C,null,.28);r.box([0,-.7,0],[6,1.4,.8],[170,140,100],null,.3);r.cyl([0,.02,0],.3,6,BEAD,[0,0,PI/2],16)}
SC.UT={cam:{d:11,y:.5,p:.5,t:[0,-.3,1]},ph:[
['Couplant','Couplant',4,'surface preparation couplant gel scanning area'],
['Calibration V1','Étalonnage V1',5,'calibration time base range sensitivity V1 block reference level'],
['Scan the weld','Balayage du cordon',7,'scanning both sides zigzag overlap speed'],
['Locate the echo','Localiser l’écho',4,'position sound path depth amplitude echo'],
['Size: 6 dB drop','Dimensionner : chute 6 dB',5,'length 6 dB drop method end-point characterize planar defect']],
draw(r,T,ph,u){
 const dx=.8,dy=-.7,dz=.3,al=PI/3;let px=-2.2,pz=2.5,a=0,pk=[];
 if(ph==1){r.box([0,-.6,0],[4,1.2,1.4],[140,150,165],null,.35);r.cyl([.4,-.98,0],.2,1.42,[20,20,25],[PI/2,0,0],14);
  r.box([-1.62,.22,0],[.62,.4,.5],[60,120,200]);r.path([[-1.7,.4,0],[-1.7,1.1,.4],[-1.2,1.5,1.2]],[30,30,34],2);
  r.ln([-1.3,0,0],[.22,-.93,0],YEL,3,.7);r.sph([lerp(-1.3,.22,(T*1.2)%1),lerp(0,-.93,(T*1.2)%1),0],.07,YEL);
  r.txt([0,1.1,0],L('V1 block: set range and gain (80 % FSH)','Bloc V1 : régler base de temps et gain (80 %)'),YEL);
  pk=[[.4,.8*ease(clamp(u*2,0,1))],[.8,.8*ease(clamp(u*2-1,0,1))]]}
 else{slab(r);const m=[.5,.4,.7];r.box([dx,dy,dz],[.05,.5,.02],RED);
  if(ph==2){px=lerp(-2.4,2.4,u);pz=1.5+.6*Math.sin(u*TAU*6)}if(ph==3){px=dx;pz=1.51+.03*Math.sin(T*3)}if(ph==4){px=dx+.9*Math.sin(u*TAU);pz=1.51}
  if(ph==0){r.cyl([-2.2,.01,2.6],.4*ease(u)+.01,.02,[120,200,230],null,16,null,.6);canAt(r,[-3.2,.6,3.2],[120,200,230],[0,0,.3])}
  if(ph>0){a=Math.exp(-(Math.pow(px-dx,2)/.3+Math.pow(pz-1.51,2)/.2));
   const A=[px,0,pz],B=[px,-1.4,pz-1.4*Math.tan(al)],C=[px,0,pz-2.8*Math.tan(al)];
   r.path([A,B,C],YEL,3,.4+.4*a,.2);const q=(T*1.2)%1;r.sph(q<.5?[px,-2.8*q,pz-2.8*q*Math.tan(al)*1]:[px,-1.4+(q-.5)*2.8,pz-1.4*Math.tan(al)-(q-.5)*2.8*Math.tan(al)],.07,WHITE);
   r.sph([dx,dy,dz],.08+.15*a,[255,80,60],.3+.7*a);pk=[[.17,.12],[.35,.9*a]]}
  probe(r,px,pz);
  if(ph==4){for(const s of[-1,1])r.ln([dx+s*.456,.4,-.5],[dx+s*.456,.4,.5],RED,2);if(u>.5)r.txt([dx,1.1,0],L('Length ≈ 9 mm (6 dB drop)','Longueur ≈ 9 mm (chute 6 dB)'),RED)}
  if(ph==3)r.txt([0,1.2,1],L('Sound path 14.0 mm · depth 7.0 mm','Parcours 14,0 mm · profondeur 7,0 mm'),YEL)}
 r.hud=(c,W,H)=>{const w=Math.min(230,W*.42),h=Math.min(120,H*.34),x=W-w-8,y=8,iw=w-8;
  c.fillStyle='rgba(4,16,10,.92)';c.fillRect(x,y,w,h);c.strokeStyle='rgba(80,255,120,.2)';c.lineWidth=1;
  for(let i=1;i<10;i++){c.beginPath();c.moveTo(x+4+iw*i/10,y);c.lineTo(x+4+iw*i/10,y+h);c.stroke()}
  for(let i=1;i<5;i++){c.beginPath();c.moveTo(x,y+h*i/5);c.lineTo(x+w,y+h*i/5);c.stroke()}
  const nz=Math.floor(T*25);c.strokeStyle='#5cff8a';c.lineWidth=1.4;c.beginPath();
  for(let i=0;i<=iw;i+=2){const fx=i/iw;let v=.03*hash(i+nz)+Math.max(0,.95*(1-Math.abs(fx-.02)/.03));
   for(const p of pk)v+=Math.max(0,p[1]*(1-Math.abs(fx-p[0])/.025));v=Math.min(v,1);const yy=y+h-6-v*(h-14);i?c.lineTo(x+4+i,yy):c.moveTo(x+4+i,yy)}c.stroke();
  c.fillStyle='#5cff8a';c.font='10px system-ui';c.textAlign='left';c.fillText('A-scan',x+6,y+12);c.textAlign='center'}}};
/* ================= RT ================= */
SC.RT={cam:{d:14,y:.5,p:.42,t:[0,.9,.6]},ph:[
['Controlled area','Zone contrôlée',4,'radiation safety controlled area dosimeter survey meter time distance shielding'],
['Setup: source, IQI, film','Montage : source, IQI, film',5,'technique SWSI film screens IQI source-to-object distance'],
['Exposure','Exposition',5,'exposure time film density source activity'],
['Film processing','Développement du film',5,'processing film darkroom developer fixer wash dry'],
['Reading the film','Lecture du film',5,'reading indications cracks lack of fusion porosity slag report']],
draw(r,T,ph,u){
 r.grid(8,1,-.4);plates(r);
 const ring=circ([0,-.4,0],5,'y',64,1);r.path(ring,YEL,2.2,ph==0?.5+.4*Math.sin(T*4):.35);
 for(let i=0;i<8;i++){const t=i/8*TAU,t2=(i+1)/8*TAU,p=[5*Math.cos(t),.05,5*Math.sin(t)],q=[5*Math.cos(t2),.05,5*Math.sin(t2)];
  r.cyl(p,.06,.9,[220,60,50],null,8);r.ln([p[0],.4,p[2]],[q[0],.4,q[2]],YEL,1.5,.8)}
 if(ph==0){r.txt([5,1.3,0],'☢ 7.5 µSv/h',YEL);r.box([3.3,-.2,3.4],[.5,.3,.3],[90,200,120]);r.txt([3.3,.3,3.4],L('survey meter','radiamètre'),GRN)}
 const sy=ph==0?5:ph==1?lerp(5,3.4,ease(u)):3.4;
 r.box([0,sy,0],[.9,.8,.9],[200,170,40]);r.cyl([0,sy-.6,0],.22,.5,[60,62,68],null,12);
 let fp=null,fr=[0,0,0],img=false;
 if(ph==1&&u>.4)fp=[0,-.45,0];if(ph==2)fp=[0,-.45,0];
 if(ph==3){const e=ease(clamp(u/.15,0,1)),x=lerp(-2.4,2.4,clamp((u-.15)/.85,0,1)),dip=Math.abs(Math.sin(u*PI*3));fp=[lerp(0,x,e),lerp(-.45,1.1-.7*dip,e),lerp(0,3.6,e)];fr=[PI/2*e,0,0];
  [[-2.4,[200,150,60]],[0,[120,160,200]],[2.4,[170,180,190]]].forEach(t=>{r.box([t[0],-.2,3.6],[2,.4,1.2],t[1],null,.55)});
  r.txt([0,1.9,3.6],L('Develop → Stop → Fix → Wash → Dry','Révélateur → Arrêt → Fixateur → Lavage → Séchage'),YEL)}
 if(ph==4){fp=[0,1.7,2.6];fr=[PI/2,0,0];img=true}
 if(ph==1)r.txt([-2.4,1,-.1],L('IQI on source side','IQI côté source'),WHITE),r.ln([-2.2,.04,-.3],[-2.2,.04,.3],WHITE,2);
 if(ph==2){const tip=[0,sy-.9,0];for(let i=-3;i<=3;i++)for(let j=-1;j<=1;j++){const tgt=[i*.8,-.42,j*.6];r.ln(tip,tgt,YEL,1,.22);
   const p=(T*1.4+hash(i*7+j))%1;r.sph([lerp(tip[0],tgt[0],p),lerp(tip[1],tgt[1],p),lerp(tip[2],tgt[2],p)],.04,YEL)}
  r.sph([1.2,.3,0],.14,RED,.5);r.txt([1.2,1,0],L('flaw = more rays through','défaut = plus de rayons'),RED);
  r.txt([2.4,sy,0],'Ir-192 / X-ray',YEL);r.ln([3,sy-.9,0],[3,-.4,0],[200,200,210],1,.6)}
 if(fp){r.G(fp,fr);r.box([0,0,0],[5,.03,1.6],[28,30,36]);
  if(img){r.quad([-2.5,.02,-.45],[2.5,.02,-.45],[2.5,.02,.45],[-2.5,.02,.45],[95,100,112],1,.5);
   const z=[];for(let i=0;i<=10;i++)z.push([1.2+(hash(i+4)-.5)*.1,.025,-.4+i*.08]);r.path(z,[8,8,10],2.5,1,1);
   [[-1.7,0],[-1.5,.06]].forEach(q=>r.sph([q[0],.03,q[1]],.04,[8,8,10],1,1));
   for(let i=0;i<7;i++)r.ln([-2.3+i*.12,.025,-.7],[-2.3+i*.12,.025,-.2],WHITE,3-i*.35,1,1);
   r.txt([1.2,.2,.7],L('crack = dark line','fissure = ligne sombre'),RED,1);r.txt([-2,.2,.9],'IQI',WHITE,1);r.txt([-1.6,.2,-.7],L('porosity = dark dots','porosité = points sombres'),YEL,1)}
  r.G()}}};
/* ================= VT ================= */
SC.VT={cam:{d:9.5,y:.5,p:.5,t:[0,.3,0]},ph:[
['Light and distance','Éclairage et distance',5,'lighting lux viewing distance angle direct visual mirror borescope'],
['Gauges','Jauges et outils',4,'tools weld gauge Hi-Lo caliper magnifier mirror flashlight borescope'],
['Measure','Mesure',6,'measure size reinforcement undercut gauge record'],
['Recognize defects','Reconnaître les défauts',6,'what to look at cracks undercut porosity spatter lack of fusion overlap']],
draw(r,T,ph,u){
 plates(r);for(let i=0;i<24;i++){const x=-2.9+i*.25,p=[];for(let k=0;k<=6;k++){const z=-.3+k*.1;p.push([x+.05*Math.abs(z),hz(z)+.006,z])}r.path(p,[110,112,118],1,.6,.4)}
 if(ph==0){const E=[-2.4,2.3,3.2],t=[0,.1,0];r.sph(E,.28,WHITE);const d=nrm(sub(t,E));r.sph([E[0]+d[0]*.22,E[1]+d[1]*.22,E[2]+d[2]*.22],.12,DK);
  const rg=circ([0,.05,0],.9,'y',12,1);rg.forEach(p=>r.ln(E,p,WHITE,1,.18));r.ln(E,t,YEL,1.5,.7);r.txt([-1.2,1.5,1.7],'≤ 600 mm · ≥ 30°',YEL);
  r.sph([2.8,3,2.2],.25,YEL);rg.forEach(p=>r.ln([2.8,3,2.2],p,YEL,1,.12));r.txt([2.8,3.5,2.2],L('≥ 500 lux (ISO) / ≥ 1000 lux (ASME)','≥ 500 lux (ISO) / ≥ 1000 lux (ASME)'),YEL)}
 if(ph==1){const names=['Hi-Lo','Cambridge','Mag 2–10×',L('Caliper','Pied à coulisse')];names.forEach((n,i)=>{const x=-2.4+i*1.6,y=.9+.1*Math.sin(T*2+i);
   r.box([x,y,2.2],[.9,.08,.4],[200,170,60],[0,.3,0]);r.box([x,y-.2,2.2],[.1,.4,.1],[170,170,175]);r.txt([x,y+.45,2.2],n,WHITE)})}
 if(ph==2){const x=lerp(-2.4,2.4,u),k=Math.floor(u*4)%2;r.box([x,hz(0)+.2,0],[.12,.05,1],[200,170,60]);r.cyl([x,hz(0)+.35,0],.03,.3,[220,220,225],null,6);
  r.txt([x,1.3,0],k?L('Undercut 0.3 mm','Caniveau 0,3 mm'):L('Reinforcement 2.1 mm','Surépaisseur 2,1 mm'),YEL)}
 if(ph==3){r.path([[1.3,.06,.34],[2.4,.06,.34]],[10,10,12],3,1,.8);r.path([[1.3,.06,-.34],[2.4,.06,-.34]],[10,10,12],3,1,.8);
  [[-1.9,.05],[-1.7,.1],[-1.5,0]].forEach(q=>r.sph([q[0],.33,q[1]],.05,[15,15,18],1,.8));
  r.path(crackA(-.5,.35,6),RED,2.5,1,.8);for(let i=0;i<8;i++)r.sph([-2.8+hash(i)*1.2+3*(i>3),.04,(hash(i+20)-.5)*5],.035,[190,190,200],1,.5);
  const L1=[[.1,1.9,L('Undercut','Caniveau'),[1.8,.3,0]],[.35,1.6,L('Porosity','Porosité'),[-1.7,.3,0]],[.6,1.4,L('Crack','Fissure'),[-.5,.3,0]],[.8,1.2,L('Spatter','Projections'),[-2.4,.1,1.6]]];
  L1.forEach(l=>{if(u>l[0]){r.ln(l[3],[l[3][0],l[1]-.15,l[3][2]],RED,1.2,.8);r.txt([l[3][0],l[1],l[3][2]],l[2],RED)}})}}};
/* ================= APL ================= */
SC.APL={cam:{d:15,y:.7,p:.38,t:[0,1.6,0]},ph:[
['Documents and SWL','Documents et CMU',4,'documents SWL WLL plate certificate logbook inspection types'],
['Structure and mechanisms','Structure et mécanismes',6,'structure mechanisms gearbox wheels rails brakes limit switches overload'],
['Wire rope','Câble',5,'wire ropes ISO 4309 broken wires diameter corrosion discard'],
['Hook and slings','Crochet et élingues',4,'hooks chains slings latch throat twist wear'],
['Static test 125 %','Épreuve statique 125 %',6,'load tests static 125 percent SWL hold'],
['Dynamic test 110 %','Épreuve dynamique 110 %',6,'dynamic test 110 percent movements safety devices']],
draw(r,T,ph,u){
 r.grid(9,1,0);
 for(const sx of[-3,3]){for(const sz of[-3.8,3.8])r.box([sx,1.3,sz],[.3,2.6,.3],[85,90,100]);r.box([sx,2.65,0],[.25,.2,8.2],[70,75,85])}
 let tx=0,bz=0,lift=0;const load=ph>=4;
 if(ph==5){tx=Math.sin(u*TAU)*1.8;bz=Math.sin(u*TAU*2)*1.2;lift=.9}if(ph==4)lift=ease(clamp(u*3,0,1))*.8;
 r.box([0,2.95,bz],[6.4,.3,.5],[220,170,40]);for(const sx of[-3,3])r.box([sx,2.85,bz],[.5,.35,.8],[60,64,72]);r.box([tx,3.3,bz],[1,.35,.8],[200,60,50]);
 const hy=load?1.3+lift:1.9;
 for(const o of[-.08,.08])r.ln([tx+o,3.1,bz],[tx+o,hy+.35,bz],[185,190,200],2);
 r.cyl([tx,hy+.2,bz],.1,.3,[60,60,66],null,8);r.path(circ([tx,hy-.05,bz],.2,'z',18,.85,.07),[210,210,220],4);
 if(load){const k=ph==4?lerp(1,1.15,u):1.1;r.box([tx,hy-.8,bz],[1.2*k,.8,1.2*k],[110,140,170]);
  for(const a of[-1,1])for(const b of[-1,1])r.ln([tx,hy-.1,bz],[tx+a*.5,hy-.4,bz+b*.5],[200,200,205],1.5);
  r.txt([tx,hy-.8+.7,bz],ph==4?'125 % SWL':'110 % SWL',YEL)}
 if(ph==0){const c=[3,2.85,bz-.5];r.box(c,[.1,.3,.5],WHITE);r.path(circ(c,.5+.1*Math.sin(T*4),'x',24,1),YEL,2);r.txt([3,3.5,bz-.5],'SWL 10 t',WHITE);
  r.box([-3.5,.03,3],[.8,.05,1.1],[230,230,200]);r.txt([-3.5,.5,3],L('Manual · certificate · logbook','Notice · certificat · registre'),YEL)}
 if(ph==1){const pts=[[-3,3,bz],[3,3,bz],[tx,3.3,bz],[tx,3.1,bz],[tx,hy,bz]],nm=[L('Girder and welds (VT/MT)','Poutre et soudures (VT/MT)'),L('Wheels, rails','Galets, rails'),L('Trolley, gearbox','Chariot, réducteur'),L('Brakes, limit switches','Freins, fins de course'),L('Hook block','Moufle')],i=Math.min(4,Math.floor(u*5));
  r.sph(pts[i],.22,ORG);r.path(circ(pts[i],.4+.1*Math.sin(T*5),'z',20,1),ORG,2);r.txt([pts[i][0],pts[i][1]+.8,pts[i][2]],nm[i],ORG)}
 if(ph==2){const my=lerp(3,hy,u);r.path(circ([tx,my,bz],.4,'z',24,1),[220,225,235],3);r.ln([tx+.28,my-.28,bz],[tx+.6,my-.6,bz],[160,120,80],4);
  if(u>.4)for(let i=0;i<5;i++)r.ln([tx+.05,2.4+i*.05,bz],[tx-.05,2.45+i*.05,bz],RED,2);r.txt([tx+1.4,my,bz],'6d / 30d',YEL)}
 if(ph==3){r.path(circ([tx,hy,bz],.5+.08*Math.sin(T*5),'z',24,1),ORG,2);r.ln([tx-.2,hy-.05,bz],[tx+.2,hy-.05,bz],ORG,2);r.txt([tx,hy+.8,bz],L('Throat +5 % · twist 10° · wear 10 %','Ouverture +5 % · torsion 10° · usure 10 %'),ORG)}
 if(ph==4&&u>.4){const c=[tx,3.9,bz];r.path(circ(c,.4,'z',30,1),[210,215,225],1.5);r.path(circ(c,.4,'z',30,(u-.4)/.6),YEL,4);r.txt([tx,4.5,bz],L('Hold 10 min','Maintien 10 min'),YEL)}
 if(ph==5){r.path(circ([tx,.03,bz],2.2,'y',40,1),RED,2.4,.7);r.txt([0,.6,3.4],L('Exclusion zone – nobody under the load','Zone interdite – personne sous la charge'),RED)}}};
/* ================= APE ================= */
function therm(t){return t<.5?mix([30,60,200],[60,220,200],t*2):t<.8?mix([60,220,200],[255,220,60],(t-.5)/.3):mix([255,220,60],[255,50,30],(t-.8)/.2)}
SC.APE={cam:{d:11,y:.35,p:.2,t:[0,2.4,0]},ph:[
['LOTO and zero volts','Consignation et VAT',5,'lockout tagout verify absence of voltage tested voltage detector PPE'],
['Visual inspection','Inspection visuelle',4,'visual inspection cables terminations IP rating labels protective devices'],
['Insulation 500 V','Isolement 500 V',5,'insulation resistance 500 V DC megohm continuity protective conductors'],
['Loop and RCD','Boucle et différentiel',5,'loop impedance RCD test trip time residual current'],
['Thermography','Thermographie',5,'thermography temperature rise load emissivity critical']],
draw(r,T,ph,u){
 r.grid(7,1,0);r.box([0,2.4,-.3],[4.8,4.4,.15],[205,210,218]);
 for(const s of[-1,1])r.box([s*2.45,2.4,0],[.12,4.4,.7],[150,156,166]);r.box([0,4.65,0],[5,.14,.7],[150,156,166]);r.box([0,.2,0],[5,.14,.7],[150,156,166]);
 [[[140,80,40],4.35],[[25,25,28],4.2],[[150,150,155],4.05]].forEach(b=>r.box([0,b[1],-.15],[4.2,.1,.1],b[0]));
 const th=ph==4?ease(clamp(u*2,0,1)):0;
 for(let row=0;row<3;row++)for(let col=0;col<5;col++){const i=row*5+col,x=-1.6+col*.8,y=3.4-row*.95;
  const tt=i==7?.95:.15+.1*hash(i),base=[48,52,60];let off=(ph==0&&i==0&&u>.25)||(ph==3&&i==2&&u>.6);
  r.box([x,y,.1],[.55,.75,.4],mix(base,therm(tt),th));r.box([x,y+(off?-.12:.12),.33],[.18,.2,.1],off?[240,240,240]:[20,20,22]);
  r.ln([x,y-.4,.1],[x,.5,.1],[[140,80,40],[25,25,28],[150,150,155]][col%3],2,.9)}
 r.box([0,.5,0],[4.2,.12,.16],[80,190,80]);
 if(ph==0){const k=ease(u);r.box([lerp(3.3,-1.2,k),lerp(2.4,3,k),lerp(2.2,.5,k)],[.25,.25,.9],[240,200,60]);
  if(u>.4)r.box([-1.6,3.4,.5],[.2,.25,.12],RED);r.txt([0,5.1,0],u>.7?'0 V ✓':L('Test the tester → test circuit → test the tester','Tester le VAT → circuit → re-tester'),u>.7?GRN:YEL)}
 if(ph==1){const i=Math.min(14,Math.floor(u*15)),x=-1.6+(i%5)*.8,y=3.4-Math.floor(i/5)*.95;
  r.path([[x-.4,y-.5,.4],[x+.4,y-.5,.4],[x+.4,y+.5,.4],[x-.4,y+.5,.4],[x-.4,y-.5,.4]],YEL,2.5);
  if(u>.8){r.path(circ([.8,2.5,.4],.5,'z',20,1),RED,3);r.txt([.8,1.8,.4],L('loose terminal','borne desserrée'),RED)}else r.txt([0,5.1,0],L('Terminals · IP · labels · ratings','Bornes · IP · repérage · calibres'),YEL)}
 if(ph==2){const v=Math.round(lerp(0,480,ease(u)));r.box([4.2,1.6,1.2],[1.3,1,.5],[230,200,60]);r.box([4.2,1.75,1.46],[.9,.4,.02],[10,25,15]);
  r.txt([4.2,2.5,1.2],'500 V DC · '+v+' MΩ',GRN);const a=[3.6,1.6,1.4],b=[-.4,3.1,.35],c=[0,.5,.1];
  [[a,b],[a,c]].forEach(p=>{const pts=[];for(let i=0;i<=8;i++){const t=i/8;pts.push([lerp(p[0][0],p[1][0],t),lerp(p[0][1],p[1][1],t)-.5*Math.sin(PI*t),lerp(p[0][2],p[1][2],t)+.4*Math.sin(PI*t)])}r.path(pts,[220,50,50],2.5)});
  r.sph(b,.12+.05*Math.sin(T*8),BLUE)}
 if(ph==3){const ms=Math.round(Math.min(u/.6,1)*24);r.txt([0,5.1,0],'RCD IΔn → '+ms+' ms (≤ 300 ms)',u>.6?GRN:YEL);r.path(circ([-.0,3.4-1.9+.95*0,.1],.01,'y',3,1),YEL,1)}
 if(ph==4){r.box([0,2.4,4],[.6,.4,.5],[60,60,66]);r.cyl([0,2.4,3.65],.14,.2,DK,[PI/2,0,0],10);
  for(const c of[[-2.4,.3],[2.4,.3],[-2.4,4.5],[2.4,4.5]])r.ln([0,2.4,3.7],[c[0],c[1],.3],WHITE,1,.12);
  if(u>.5)r.txt([.8,2.6,.5],'ΔT 18 °C → '+L('critical','critique'),RED)}}};
/* ================= APVG ================= */
SC.APVG={cam:{d:13,y:.55,p:.35,t:[0,2,0]},ph:[
['External inspection','Inspection externe',5,'external inspection shell heads supports nozzles insulation corrosion under insulation'],
['Thickness grid (UT)','Épaisseurs (UT)',6,'thickness measurement corrosion rate remaining life interval'],
['Fill with water','Remplissage eau',4,'hydrostatic test water temperature vent air'],
['Hydrotest 1.3 × MAWP','Épreuve 1,3 × PMS',6,'hydrostatic test 1.3 MAWP hold 30 minutes gauge range'],
['Safety valve','Soupape',5,'safety valves set pressure tolerance seat tightness API 527 interval']],
draw(r,T,ph,u){
 r.grid(8,1,0);const R=1.2,cy=1.8,sh=[170,180,195];
 for(const s of[-1.7,1.7])r.box([s,.45,0],[.5,.9,1.8],[80,85,95]);
 r.cyl([0,cy,0],R,5,sh,[0,0,PI/2],24,null,.4);r.cyl([-2.85,cy,0],R,.7,sh,[0,0,PI/2],24,.4,.4);r.cyl([2.85,cy,0],R,.7,sh,[0,0,-PI/2],24,.4,.4);
 for(const x of[-1.2,1.2])r.path(circ([x,cy,0],R,'x',32,1),[200,210,225],1.2,.6);
 let p=0;if(ph==3)p=u<.6?1.3*u/.6:1.3;if(ph==4)p=1+.03*clamp(u*2,0,1)-(u>.6?.12*(u-.6)/.4:0);
 if(ph==2||ph==3){const lv=ph==2?u:1,y=.06+lv*2.28,w=2*Math.sqrt(Math.max(0,R*R-Math.pow(y-.06-R,2)));r.quad([-2.5,y,-w/2],[2.5,y,-w/2],[2.5,y,w/2],[-2.5,y,w/2],BLUE,.55,.2)}
 r.cyl([-1,3.15,0],.35,.5,sh,null,14);
 const pop=ph==4&&u>.5&&u<.8,vy=pop?.12:0;
 r.cyl([1.3,3.1,0],.18,.4,[90,95,105],null,10);r.cyl([1.3,3.45+vy,0],.28,.3,[200,60,50],null,12);r.cyl([1.3,3.85+vy,0],.15,.5,[170,170,175],null,10);
 if(pop)for(let i=0;i<8;i++){const k=(T*3+i/8)%1;r.sph([1.3+(hash(i)-.5)*.4*k,4.1+k*1,(hash(i+3)-.5)*.4*k],.08+.12*k,WHITE,.6*(1-k))}
 r.cyl([0,3.1,0],.08,.4,[90,95,105],null,8);r.cyl([0,3.65,0],.45,.12,WHITE,[PI/2,0,0],24);
 const na=-2.35+4.7*clamp(p/1.6,0,1);r.ln([0,3.65,.08],[Math.sin(na)*.38,3.65+Math.cos(na)*.38,.08],RED,2.5,1,.3);
 if(ph>=3)r.txt([0,4.4,0],'P = '+p.toFixed(2)+' × MAWP',YEL);
 if(ph==0){const x=lerp(-2.5,2.5,u);r.path(circ([x,cy,0],R+.1,'x',32,1),ORG,3,.9);r.txt([x,3.9,0],L('Corrosion · CUI · supports · nozzles','Corrosion · CUI · supports · piquages'),ORG)}
 if(ph==1){const n=Math.min(19,Math.floor(u*20));for(let i=0;i<20;i++){const x=-1.8+(i%5)*.9,fi=Math.floor(i/5),f=-.3+fi*.55,
   q=[x,cy+(R+.03)*Math.sin(f),(R+.03)*Math.cos(f)];r.sph(q,.07,i<=n?GRN:[120,130,140]);if(i==n){r.sph([q[0],q[1]+.15,q[2]+.2],.14,ORG);r.txt([q[0],q[1]+.7,q[2]+.3],'t = '+(11.8-.1*(i%4)).toFixed(1)+' mm (t min 9.5)',ORG)}}}
 if(ph==3)r.txt([0,.1,3],L('Hold ≥ 30 min, then inspect joints at design pressure','Maintien ≥ 30 min, puis inspection des joints à la pression de calcul'),YEL);
 if(ph==4)r.txt([2.2,5,0],pop?L('POP – set pressure ±3 %','OUVERTURE – tarage ±3 %'):L('Check set pressure and seat tightness','Contrôler tarage et étanchéité'),pop?RED:YEL)}};
/* ================= OTHER (generic instrument) ================= */
SC.OTH={cam:{d:9,y:.5,p:.45,t:[0,.8,0]},ph:[
['Prepare and isolate','Préparer et sécuriser',4,'safety prepare isolate permit PPE'],
['Check and calibrate','Vérifier et étalonner',4,'calibration zero check instrument'],
['Measure','Mesurer',5,'measure use instrument reading'],
['Record','Consigner',4,'report record results']],
draw(r,T,ph,u){
 r.grid(6,1,0);r.box([0,-.1,0],[7,.2,4],[90,80,70]);r.cyl([-1.5,.7,0],.6,1.2,STEEL,null,20);r.box([2.2,.5,0],[1.6,.9,1.1],[230,200,60]);
 r.box([2.2,.75,.56],[1.1,.4,.02],[10,25,15]);const kn=ph==1?u*TAU:ph==2?TAU*.3:0;r.sph([2.2+.4*Math.sin(kn),.3+.2*Math.cos(kn),.57],.1,DK);
 if(ph==0){r.sph([-1.5,2,0],.3,[255,200,40]);r.txt([-1.5,2.6,0],L('Isolate · permit · PPE','Isoler · permis · EPI'),YEL)}
 if(ph==1)r.txt([2.2,1.7,0],L('Zero / calibrate before use','Zéro / étalonnage avant usage'),YEL);
 if(ph>=2){const a=[1.6,.8,.5],b=[lerp(1.6,-.95,ph==2?ease(u):1),1.1,.3],pts=[];for(let i=0;i<=8;i++){const t=i/8;pts.push([lerp(a[0],b[0],t),lerp(a[1],b[1],t)-.5*Math.sin(PI*t),lerp(a[2],b[2],t)+.3*Math.sin(PI*t)])}
  r.path(pts,[220,50,50],2.5);r.sph(b,.1,ORG);r.txt([2.2,1.7,0],L('Reading: ','Valeur : ')+(ph==2?(12.4*ease(u)).toFixed(1):'12.4'),GRN)}
 if(ph==3){r.box([-2.4,.05,2.1],[1.2,.05,1.5],[235,235,220]);r.txt([-2.4,.5,2.1],L('Report: values · date · signature','Rapport : valeurs · date · signature'),YEL)}}};

const EXTRA_PHASES={
 PT:[['Evaluate indications','Évaluer les indications',5,'indications evaluation acceptance criteria procedure','Compare indications with the applicable criteria.','Comparer les indications aux critères applicables.'],['Post-clean and report','Nettoyer et rédiger le rapport',5,'post inspection cleaning report traceability','Clean the part if required and record results.','Nettoyer la pièce si nécessaire et consigner les résultats.']],
 MT:[['Evaluate field coverage','Évaluer la couverture du champ',5,'field coverage indication evaluation direction','Review indication direction and confirm adequate coverage.','Vérifier la direction des indications et la couverture.'],['Demagnetize and report','Démagnétiser et rédiger le rapport',5,'demagnetize residual field report','Demagnetize when required and record the inspection.','Démagnétiser si nécessaire et consigner le contrôle.']],
 UT:[['Characterize the indication','Caractériser l’indication',5,'characterize indication type location length','Record the position, response, and sizing method.','Consigner la position, la réponse et la méthode de dimensionnement.'],['Review and report','Vérifier et rédiger le rapport',5,'review calibration scan coverage report','Verify calibration and coverage, then document the results.','Vérifier l’étalonnage et la couverture, puis documenter les résultats.']],
 RT:[['Verify image quality','Vérifier la qualité d’image',5,'image quality IQI density sensitivity','Confirm image quality and required identification before interpretation.','Confirmer la qualité d’image et l’identification avant l’interprétation.'],['Interpret and report','Interpréter et rédiger le rapport',5,'interpret indications report acceptance basis','Record image findings and the applicable acceptance basis.','Consigner les constatations et la base d’acceptation applicable.']],
 VT:[['Evaluate measurements','Évaluer les mesures',5,'measurements acceptance criteria visual examination','Compare recorded measurements with the applicable criteria.','Comparer les mesures consignées aux critères applicables.'],['Record and disposition','Consigner et statuer',5,'visual report location dimensions disposition','Record location, dimensions, evidence, and disposition.','Consigner l’emplacement, les dimensions, les preuves et la décision.']],
 APL:[['Verify safety devices','Vérifier les dispositifs de sécurité',5,'limit switches brakes overload functional test','Confirm brakes and limit devices using the approved test plan.','Vérifier les freins et limiteurs selon le plan d’essai approuvé.'],['Unload and report','Décharger et rédiger le rapport',5,'remove test load inspection report lifting equipment','Lower and remove the test load safely, then document the results.','Abaisser et retirer la charge en sécurité, puis consigner les résultats.']],
 APE:[['Verify functional operation','Vérifier le fonctionnement',5,'functional test protective devices circuit','Confirm protective devices operate as intended under the approved test.','Vérifier le fonctionnement des protections selon l’essai approuvé.'],['Record test results','Consigner les résultats',5,'electrical report measurements instrument calibration','Record measured values, instrument identification, and test conditions.','Consigner les valeurs, l’identification de l’appareil et les conditions d’essai.']],
 APVG:[['Depressurize and drain','Dépressuriser et vidanger',5,'depressurize vent drain pressure test','Release pressure in a controlled manner and verify safe isolation.','Relâcher la pression de façon maîtrisée et vérifier l’isolement.'],['Review records and report','Vérifier les dossiers et rédiger le rapport',5,'pressure equipment records findings report','Document pressure, hold time, instruments, findings, and disposition.','Documenter la pression, le maintien, les appareils, les constatations et la décision.']]
};
Object.keys(EXTRA_PHASES).forEach((method)=>{const scene=SC[method];scene.basePhaseCount=scene.ph.length;scene.ph.push(...EXTRA_PHASES[method])});
function drawExtendedPhase(r,method,T,phase,u){
 const priorHud=r.hud,completed=Math.min(3,Math.floor(u*3.01)),title=L(SC[method].ph[phase][0],SC[method].ph[phase][1]);
 r.hud=(ctx,W,H)=>{if(priorHud)priorHud(ctx,W,H);const width=Math.min(340,W-24),height=140,x=12,y=12,rows=[L('Approved procedure','Procédure approuvée'),L('Objective evidence','Preuves objectives'),L('Review and record','Vérifier et consigner')];ctx.save();ctx.fillStyle='rgba(13,22,42,.94)';ctx.fillRect(x,y,width,height);ctx.strokeStyle='rgba(105,156,220,.65)';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,width-1,height-1);ctx.textAlign='left';ctx.textBaseline='middle';ctx.font='700 12px system-ui,sans-serif';ctx.fillStyle='#cfe4ff';ctx.fillText(L('FINAL REVIEW','VÉRIFICATION FINALE'),x+12,y+18,width-24);ctx.font='600 12px system-ui,sans-serif';ctx.fillStyle='#fff';ctx.fillText(title,x+12,y+40,width-24);ctx.font='11px system-ui,sans-serif';rows.forEach((label,index)=>{const rowY=y+62+index*17;ctx.fillStyle=index<completed?'#55dfac':'#8394ad';ctx.fillRect(x+13,rowY-5,10,10);if(index<completed){ctx.strokeStyle='#071a15';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+15,rowY);ctx.lineTo(x+17,rowY+3);ctx.lineTo(x+22,rowY-3);ctx.stroke()}ctx.fillStyle='#dce8f8';ctx.fillText(label,x+31,rowY,width-43)});ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(x+12,y+126,width-24,3);ctx.fillStyle='#3da9ff';ctx.fillRect(x+12,y+126,(width-24)*clamp(u,0,1),3);ctx.restore()};
}

/* ===== viewer (player + controls + drag/zoom) ===== */
function Viewer(root,key,customScene){
 const sc=customScene||SC[key]||SC.OTH,cv=root.querySelector('canvas'),r=new R3(cv);r.reset(sc.cam);
 const total=sc.ph.reduce((a,p)=>a+p[2],0),red=typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 let t=0,A=0,playing=!red,speed=1,last=0,orbit=false,lastPh=-1,voiceOn=false;
 const cap=root.querySelector('.cy3cap'),chips=root.querySelectorAll('[data-ph]'),pb=root.querySelector('[data-a=play]'),sb=root.querySelector('[data-a=spd]'),voiceButton=root.querySelector('[data-a=voice]');if(voiceButton){voiceButton.classList.toggle('on',voiceOn);voiceButton.textContent=voiceOn?'🔊 '+L('English voice on','Voix active'):'🔇 '+L('English voice off','Voix inactive')}
 const cur=()=>{let x=t%total,i=0;while(i<sc.ph.length-1&&x>=sc.ph[i][2]){x-=sc.ph[i][2];i++}return[i,x/sc.ph[i][2]]};
 const speakPhase=i=>{if(sc.equipment){speakEquipment(sc.equipment.method,sc.equipment.index);return}const p=sc.ph[i];speakText(L('Phase '+(i+1)+'. '+p[0]+'. Follow the approved procedure. Verify the current code edition before making a decision.','Étape '+(i+1)+' : '+p[1]+'. Suivez la procédure approuvée. Vérifiez l’édition en vigueur du code avant toute décision.'),FR()?'fr-FR':'en-US')};
 let speechUnlocked=false;const unlockSpeech=()=>{if(speechUnlocked)return;speechUnlocked=true;if(typeof speechSynthesis!=='undefined')speechSynthesis.resume();if(voiceOn)speakPhase(cur()[0])};root.addEventListener('pointerdown',unlockSpeech,{once:true});
 const start=i=>{let s=0;for(let k=0;k<i;k++)s+=sc.ph[k][2];return s};
 const nm=i=>FR()?sc.ph[i][1]:sc.ph[i][0];
 api.cur=()=>{const i=cur()[0];return{m:key,i:i,name:nm(i),kw:sc.ph[i][3],n:sc.ph.length}};
 function ui(i){if(i===lastPh)return;lastPh=i;cap.textContent=(i+1)+'/'+sc.ph.length+' · '+nm(i);chips.forEach((b,k)=>b.classList.toggle('on',k==i));if(voiceOn)speakPhase(i)}
 function frame(ts){if(!cv.isConnected)return;
  const dt=Math.min(.05,((ts-last)/1000)||0);last=ts;if(playing){t=(t+dt*speed)%total;A+=dt*speed}if(orbit)r.yaw+=dt*.35;
  const c=cur(),basePh=sc.basePhaseCount==null?c[0]:Math.min(c[0],sc.basePhaseCount-1),baseU=sc.basePhaseCount!=null&&c[0]>=sc.basePhaseCount?1:c[1];r.begin();try{sc.draw(r,A,basePh,baseU);if(sc.basePhaseCount!=null&&c[0]>=sc.basePhaseCount)drawExtendedPhase(r,key,A,c[0],c[1])}catch(e){console.error(e)}r.flush();ui(c[0]);requestAnimationFrame(frame)}
 if(red){t=start(1)-.01<0?0:start(1)+.8;A=t}
 root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.a,ph=b.dataset.ph;
  if(ph!=null){t=start(+ph)+.01;lastPh=-1}
  else if(a=='play'){playing=!playing;pb.textContent=playing?'⏸':'▶'}
  else if(a=='prev'){const i=cur()[0];t=start(cur()[1]>.2?i:(i+sc.ph.length-1)%sc.ph.length)+.01}
  else if(a=='next'){t=start((cur()[0]+1)%sc.ph.length)+.01}
  else if(a=='orb')orbit=!orbit,b.classList.toggle('on',orbit);
  else if(a=='rst')r.reset(sc.cam);
  else if(a=='spd'){speed=speed>=2?.5:speed+.5;sb.textContent=speed+'×'}
  else if(a=='voice'){voiceOn=!voiceOn;b.classList.toggle('on',voiceOn);b.textContent=voiceOn?'🔊 '+L('Voice on','Voix active'):'🔇 '+L('Voice off','Voix inactive');if(voiceOn)speakPhase(cur()[0]);else if(typeof speechSynthesis!=='undefined')speechSynthesis.cancel()}
  else if(a=='speak')speakPhase(cur()[0]);
  else if(a=='ai')openAI()});
 const pts=new Map();let pd=0;
 cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);pd=0});
 cv.addEventListener('pointerup',e=>pts.delete(e.pointerId));cv.addEventListener('pointercancel',e=>pts.delete(e.pointerId));
 cv.addEventListener('pointermove',e=>{const o=pts.get(e.pointerId);if(!o)return;
  if(pts.size==1){r.yaw-=(e.clientX-o[0])*.008;r.pit=clamp(r.pit+(e.clientY-o[1])*.008,-.1,1.45)}
  else if(pts.size==2){const q=[...pts.entries()].find(k=>k[0]!=e.pointerId)[1],d0=Math.hypot(o[0]-q[0],o[1]-q[1]),d1=Math.hypot(e.clientX-q[0],e.clientY-q[1]);r.dist=clamp(r.dist*d0/(d1||1),4,24)}
  pts.set(e.pointerId,[e.clientX,e.clientY])});
 cv.addEventListener('wheel',e=>{e.preventDefault();r.dist=clamp(r.dist*Math.exp(e.deltaY*.001),4,24)},{passive:false});
 cv.addEventListener('dblclick',()=>r.reset(sc.cam));
 requestAnimationFrame(frame)}
const api={cur:()=>({m:'PT',i:0,name:'',kw:'',n:1})};
let activeViewer;
const EQUIPMENT_FR={
 PT:[['nettoyant et dégraissant','Élimine l’huile, les saletés et l’excédent de pénétrant pour rendre visibles les défauts débouchants.'],['aérosol ou bac de pénétrant','Le liquide pénètre les défauts ouverts en surface par capillarité.'],['minuterie de temps de pénétration','Contrôle le temps de pénétration qualifié avant l’élimination de l’excédent.'],['révélateur en aérosol ou en poudre','Fait ressortir le pénétrant hors du défaut et forme une indication visible.'],['lampe UV-A','Excite le pénétrant fluorescent afin de rendre les indications visibles.'],['lampe à lumière blanche','Fournit l’éclairage visible requis pour le contrôle par contraste de couleur.'],['cabine de contrôle','Maîtrise la lumière ambiante, la propreté et les conditions d’observation.']],
 MT:[['yoke alternatif ou continu','Crée un champ magnétique local qui attire les particules vers les fuites de flux.'],['pointes de contact','Font passer un courant dans la pièce et créent un champ circulaire autour du trajet du courant.'],['bobine ou banc magnétisant','Magnétise la pièce longitudinalement ou circulairement pour couvrir une zone plus large.'],['unité à particules fluorescentes humides','Fait circuler une suspension de particules pendant que les UV-A révèlent les accumulations.'],['applicateur de poudre sèche','Dépose une poudre ferromagnétique sur la surface magnétisée pour montrer les fuites de flux.'],['indicateur de champ ou jauge pie','Confirme la direction du champ et son adéquation approximative avant le contrôle.'],['désaimanteur','Réduit le magnétisme résiduel avec un champ alternatif décroissant.']],
 UT:[['appareil de contrôle ultrasonore','Envoie des impulsions, reçoit les échos et affiche leur amplitude selon le temps ou le parcours.'],['sonde droit-faisceau','Introduit des ondes longitudinales normales à la surface pour contrôler épaisseurs et délaminages.'],['sonde d’angle','Introduit des ondes de cisaillement réfractées pour contrôler les soudures.'],['sonde multiéléments','Pilote plusieurs éléments avec des retards réglés pour orienter et focaliser le faisceau.'],['sondes TOFD','Utilise les signaux diffractés par les extrémités du défaut pour estimer sa hauteur et sa position.'],['bloc d’étalonnage','Fournit des réflecteurs connus pour régler la base de temps, la sensibilité et la résolution.'],['couplant','Supprime la lame d’air entre la sonde et la surface pour transmettre l’énergie ultrasonore.'],['scanner codé','Déplace la sonde à vitesse contrôlée et enregistre sa position avec les données UT.']],
 RT:[['tube à rayons X','Produit des rayons X qui traversent la pièce et forment une image d’atténuation.'],['projecteur gamma','Stocke et expose à distance une source radioactive scellée pour réaliser une radiographie.'],['film radiographique et cassette','Enregistre les différences d’intensité du rayonnement après développement.'],['détecteur numérique','Convertit le rayonnement transmis en image électronique pour une lecture immédiate.'],['IQI ou pénét ramètre','Démontre la sensibilité radiographique et la qualité de l’image.'],['radiamètre','Mesure le débit de dose pour établir les limites et confirmer la sécurité.'],['processeur de films','Développe, fixe, lave et sèche le film pour rendre l’image lisible.'],['collimateur et écran de protection','Limitent le faisceau et absorbent le rayonnement diffusé.']],
 VT:[['source de lumière blanche','Éclaire la surface pour observer la géométrie, la couleur et les défauts débouchants.'],['jauge de soudure','Mesure les dimensions du cordon, la surépaisseur, le caniveau et le désalignement.'],['pied à coulisse','Mesure les dimensions extérieures, les longueurs et les caractéristiques.'],['loupe','Augmente la taille apparente d’un détail pour faciliter l’examen visuel.'],['miroir et endoscope','Permettent d’observer les zones cachées ou difficiles d’accès.'],['comparateur de surface','Compare le profil ou l’état de surface à une référence connue.'],['appareil photo de contrôle','Conserve une preuve visuelle avec son emplacement et son identification.']],
 APL:[['pont roulant ou appareil de levage','Soulève et déplace les charges grâce au mécanisme de levage et de translation.'],['pied à coulisse pour câble','Mesure la perte de diamètre du câble afin d’identifier l’usure et la corrosion.'],['jauge de diamètre de câble','Compare le diamètre réel du câble à sa valeur nominale et à son historique.'],['capteur de charge','Mesure l’effort de traction pendant l’épreuve ou le test de fonctionnement.'],['masses d’épreuve','Fournissent une charge connue pour vérifier statiquement et dynamiquement l’appareil.'],['jauge de crochet','Mesure l’ouverture de gorge et aide à détecter une déformation ou une usure.'],['ensemble manilles et élingues','Relie la charge d’essai à l’appareil en transmettant l’effort par des composants certifiés.'],['testeur de fin de course','Vérifie que les limiteurs de course et de surcharge interrompent correctement le mouvement.'],['testeur de frein','Vérifie que le frein retient ou arrête la charge d’essai.'],['kit de contrôle visuel et magnétique','Permet de contrôler les crochets, soudures, axes, bâtis et pièces porteuses.']],
 APE:[['indicateur de tension','Détecte la présence ou l’absence de potentiel électrique avant et après la consignation.'],['testeur de tension bipolaire','Mesure entre deux points pour vérifier la tension et l’absence de tension.'],['mégohmmètre','Applique une tension continue et mesure la résistance d’isolement entre conducteurs et terre.'],['testeur de continuité','Fait circuler un faible courant pour confirmer un chemin de protection à faible résistance.'],['testeur d’impédance de boucle','Injecte un courant d’essai et calcule l’impédance de boucle à partir de la réponse.'],['testeur de différentiel','Applique un courant résiduel contrôlé et mesure le courant ou le temps de déclenchement.'],['pince ampèremétrique','Mesure le courant par couplage magnétique autour d’un conducteur sans ouvrir le circuit.'],['multimètre','Mesure tension, courant, résistance et continuité avec des calibres sélectionnables.'],['caméra thermique','Détecte le rayonnement infrarouge et transforme les écarts de température en image thermique.'],['kit de consignation','Isole et identifie physiquement les sources d’énergie pour empêcher une remise sous tension.']],
 APVG:[['appareil de mesure ultrasonore d’épaisseur','Mesure l’épaisseur par le temps de parcours entre l’écho d’entrée et l’écho de fond.'],['pompe d’épreuve hydraulique','Augmente la pression avec un liquide incompressible pour réaliser une épreuve contrôlée.'],['manomètre étalonné','Affiche la pression appliquée et fournit une vérification traçable de la valeur d’essai.'],['enregistreur de pression','Enregistre la pression dans le temps pour documenter le cycle et le maintien.'],['banc d’essai de soupape','Applique une pression contrôlée pour vérifier le tarage et l’étanchéité du siège.'],['endoscope','Inspecte les surfaces internes et les zones inaccessibles par un petit accès.'],['duromètre','Applique une empreinte ou mesure un rebond contrôlé pour estimer la dureté du matériau.'],['scanner de cartographie de corrosion','Collecte des mesures d’épaisseur sur une grille pour visualiser la perte de métal.'],['collecteur de purge et de vidange','Évacue l’air, contrôle le remplissage et vidange le fluide d’essai en sécurité.']],
 OTH:[['instrument de mesure étalonné','Convertit une grandeur physique en une mesure traçable pour le contrôle défini.'],['étalon de référence','Fournit une valeur ou une condition connue pour comparer l’instrument ou la pièce.'],['enregistreur de données','Mémorise les mesures dans le temps afin d’examiner les tendances et les événements.'],['kit EPI et consignation','Réduit l’exposition et empêche la libération d’une énergie dangereuse pendant le contrôle.']]
};
const HSE_FR={PT:'Portez des gants et des lunettes. Utilisez les produits chimiques dans une zone ventilée et suivez leur fiche de données de sécurité.',MT:'Portez des lunettes et des gants adaptés. Gardez les mains éloignées des équipements sous tension et démagnétisez la pièce si nécessaire.',UT:'Vérifiez les câbles et les sondes avant utilisation. Utilisez un accès sûr et ne prenez aucune décision sans la procédure et le code applicables.',RT:'Établissez et gardez la zone contrôlée. Utilisez un radiamètre et un dosimètre étalonnés. N’entrez jamais avant la mise en sécurité de la source.',VT:'Utilisez un accès et un éclairage sûrs. Portez la protection contre les chutes si nécessaire et ne touchez pas une zone dangereuse.',APL:'Établissez une zone d’exclusion autour des charges suspendues. Ne vous placez jamais sous une charge ni dans une zone dangereuse.',APE:'Appliquez la consignation avant toute intervention. Vérifiez l’absence de tension avec un appareil éprouvé et portez les EPI électriques requis.',APVG:'Vérifiez l’isolement, la dépressurisation, la purge et la vidange. Utilisez des manomètres étalonnés et respectez la zone de danger.',OTH:'Identifiez les dangers et les EPI avant de commencer. Isolez les énergies dangereuses et arrêtez le travail en cas de doute.'};
function equipmentText(method,index,item){const translated=EQUIPMENT_FR[method]&&EQUIPMENT_FR[method][index];return FR()&&translated?translated:item}
function speakEquipment(method,index){const p=window.CYPROC&&window.CYPROC[method],item=p&&p.equipment&&p.equipment[index];if(!item)return;const frItem=EQUIPMENT_FR[method]&&EQUIPMENT_FR[method][index],hse=p.hse||[];const text=FR()?(frItem?'Équipement : '+frItem[0]+'. Fonctionnement : '+frItem[1]+'.':'Équipement : '+item[0]+'.')+' Santé, sécurité et environnement : '+(HSE_FR[method]||'Identifiez les dangers avant de commencer.'):'Equipment: '+item[0]+'. How it works. '+item[1]+'. Health, safety, and environmental guidance. '+hse.join(' ');speakText(text,FR()?'fr-FR':'en-US')}

const EQ_KIND={
 PT:['cleaner-can','penetrant-can','timer','developer-can','uv-lamp','white-lamp','booth'],
 MT:['yoke','prods','coil','tank','powder','field-gauge','demag'],
 UT:['instrument','straight-probe','angle-probe','array','tofd','block','couplant','scanner'],
 RT:['source','projector','film','detector','iqi','meter','processor','collimator'],
 VT:['lamp','gauge-tool','caliper','magnifier','borescope','comparator','camera'],
 APL:['crane','rope-caliper','diameter-gauge','load-cell','weights','hook','sling','switch','brake','kit'],
 APE:['voltage-indicator','two-pole','insulation-meter','continuity-meter','loop-meter','rcd-tester','clamp','multimeter','thermal','loto'],
 APVG:['thickness','pump','gauge','recorder','valve','borescope','hardness','scanner','manifold'],
 OTH:['measure-tool','block','recorder','ppe']
};
const EQ_GUIDE={
 'cleaner-can':['Surface preparation before penetrant inspection.','Apply approved cleaner to a lint-free cloth; wipe and allow the surface to dry.','Préparation de la surface avant le ressuage.','Appliquez le nettoyant approuvé sur un chiffon non pelucheux, puis laissez sécher.'],
 'penetrant-can':['Applying penetrant to reveal surface-breaking discontinuities.','Apply an even film to the prepared surface and follow the qualified dwell time.','Application du pénétrant pour révéler les discontinuités débouchantes.','Appliquez un film régulier sur la surface préparée et respectez le temps de pénétration qualifié.'],
 timer:['Timing a controlled inspection or test interval.','Set the interval specified by the approved procedure and start it at the correct step.','Chronométrage d’une étape définie de contrôle ou d’essai.','Réglez la durée définie par la procédure approuvée et démarrez au moment prévu.'],
 'developer-can':['Drawing penetrant from surface flaws to improve indication visibility.','Apply the qualified thin, even layer after excess penetrant removal.','Extraction du pénétrant des défauts pour améliorer la visibilité des indications.','Appliquez une couche fine et régulière après le retrait de l’excédent de pénétrant.'],
 'uv-lamp':['Viewing fluorescent penetrant or magnetic-particle indications.','Check lamp condition and required UV-A intensity; scan the surface in controlled lighting.','Observation des indications fluorescentes en ressuage ou magnétoscopie.','Vérifiez l’état et l’intensité UV-A requise, puis examinez sous l’éclairage prescrit.'],
 'white-lamp':['Providing visible illumination for colour-contrast inspection.','Position the lamp to meet the method procedure lighting and viewing requirements.','Éclairage visible pour un contrôle par contraste de couleur.','Positionnez la lampe selon les exigences d’éclairage et d’observation de la procédure.'],
 booth:['Controlling the lighting and environment during visual indication evaluation.','Place the part securely inside and verify the required lighting before examination.','Maîtrise de l’éclairage et de l’environnement pendant l’évaluation.','Placez la pièce de façon stable et vérifiez l’éclairage requis avant le contrôle.'],
 yoke:['Creating a local magnetic field for magnetic-particle examination.','Place the poles with suitable spacing; magnetize in the required directions while applying medium.','Création d’un champ magnétique local pour le contrôle par particules.','Placez les pôles à l’écartement adapté et aimantez dans les directions prescrites avec le produit.'],
 prods:['Passing current through a part to create a circular magnetic field.','Place contacts on approved contact areas and energize only as directed by the procedure.','Passage de courant dans la pièce pour créer un champ circulaire.','Placez les contacts aux zones autorisées et alimentez uniquement selon la procédure.'],
 coil:['Magnetizing a component longitudinally for magnetic-particle inspection.','Position the component centrally in the coil and use the approved current setting.','Aimantation longitudinale d’une pièce pour le contrôle magnétoscopique.','Placez la pièce au centre de la bobine et utilisez le réglage de courant approuvé.'],
 tank:['Applying a controlled wet magnetic-particle suspension to a component.','Immerse or flow the qualified suspension over the part while following the magnetizing sequence.','Application contrôlée d’une suspension magnétique sur une pièce.','Immergez la pièce ou faites circuler la suspension qualifiée selon la séquence d’aimantation.'],
 powder:['Applying dry magnetic particles to reveal leakage fields.','Dust a light, even layer over the magnetized area and avoid excessive powder.','Application de particules sèches pour révéler les fuites de champ.','Déposez une couche légère et régulière sur la zone aimantée, sans excès.'],
 'field-gauge':['Checking magnetic-field direction and approximate adequacy.','Place the indicator on the surface and assess it using the approved technique.','Vérification de la direction et de l’adéquation du champ magnétique.','Placez l’indicateur sur la surface et évaluez-le selon la technique approuvée.'],
 demag:['Reducing residual magnetism after magnetic-particle inspection.','Pass the part through the demagnetizer and reduce the field as specified.','Réduction du magnétisme résiduel après un contrôle magnétoscopique.','Faites passer la pièce dans le démagnétiseur et réduisez le champ comme prescrit.'],
 instrument:['Displaying and recording ultrasonic echoes during examination.','Connect the selected probe, calibrate with the approved reference, and maintain coupling.','Affichage et enregistrement des échos ultrasonores pendant le contrôle.','Connectez la sonde choisie, étalonnez avec la référence approuvée et maintenez le couplant.'],
 'straight-probe':['Thickness measurement and checks for laminations or reflectors below the surface.','Couple the probe squarely to the surface and follow the approved scan pattern.','Mesure d’épaisseur et recherche de délaminages ou réflecteurs sous la surface.','Posez la sonde perpendiculairement avec couplant et suivez le balayage approuvé.'],
 'angle-probe':['Ultrasonic examination of welds and angled discontinuities.','Set the specified refracted angle, couple the wedge, and scan from the defined positions.','Contrôle ultrasonore des soudures et discontinuités inclinées.','Réglez l’angle réfracté spécifié, appliquez le couplant et balayez depuis les positions définies.'],
 array:['Steered ultrasonic inspection with electronic beam control.','Connect the qualified probe and scan using the approved focal laws and encoded plan.','Contrôle ultrasonore avec pilotage électronique du faisceau.','Connectez la sonde qualifiée et balayez selon les lois focales et le plan approuvés.'],
 tofd:['Locating and sizing weld flaws from diffracted tip signals.','Position the probe pair at the specified separation and scan with consistent coupling.','Localisation et dimensionnement des défauts par diffraction aux extrémités.','Positionnez la paire de sondes à l’écartement prescrit et balayez avec un couplant régulier.'],
 block:['Calibrating instrument range, sensitivity, or response against a known reference.','Select the block required by the approved procedure and verify its identification and condition.','Étalonnage de la portée, de la sensibilité ou de la réponse sur une référence connue.','Choisissez le bloc exigé par la procédure et vérifiez son identification et son état.'],
 couplant:['Transmitting ultrasonic energy across the probe-to-part interface.','Apply a thin, continuous film compatible with the material and inspection method.','Transmission de l’énergie ultrasonore entre la sonde et la pièce.','Appliquez un film mince et continu compatible avec le matériau et la méthode.'],
 scanner:['Moving an inspection probe at a controlled speed while recording position.','Mount the probe securely, verify encoder zero, and scan the defined path and overlap.','Déplacement contrôlé de la sonde avec enregistrement de sa position.','Fixez la sonde, vérifiez le zéro de l’encodeur et balayez le trajet et le recouvrement définis.'],
 source:['Producing X-rays for a controlled radiographic exposure.','Only authorized radiography personnel may set up and expose it under the approved technique.','Production de rayons X pour une exposition radiographique contrôlée.','Seul le personnel autorisé peut l’installer et l’utiliser selon la technique approuvée.'],
 projector:['Positioning and remotely exposing a sealed gamma source.','Use only under the radiography procedure, exclusion zone, and source-control requirements.','Positionnement et exposition à distance d’une source gamma scellée.','Utilisez-le uniquement selon la procédure radiographique, la zone d’exclusion et les règles de contrôle de source.'],
 film:['Recording a radiographic image on film.','Load the identified cassette in the controlled darkroom and position it per the technique.','Enregistrement d’une image radiographique sur film.','Chargez la cassette identifiée en chambre noire et positionnez-la selon la technique.'],
 detector:['Capturing transmitted radiation as a digital radiographic image.','Position and identify the panel, then acquire using the approved exposure settings.','Capture du rayonnement transmis sous forme d’image radiographique numérique.','Positionnez et identifiez le panneau, puis acquérez selon les réglages d’exposition approuvés.'],
 iqi:['Demonstrating radiographic image quality and sensitivity.','Place the specified IQI on the required side and include it in the exposure.','Démonstration de la qualité d’image et de la sensibilité radiographique.','Placez l’IQI spécifié du côté requis et incluez-le dans l’exposition.'],
 meter:['Surveying radiation levels and confirming controlled-area boundaries.','Check calibration and response, then survey from a safe position as procedure requires.','Mesure du débit de dose et vérification des limites de zone contrôlée.','Vérifiez l’étalonnage et la réponse, puis mesurez depuis une position sûre selon la procédure.'],
 processor:['Developing radiographic film through controlled processing stages.','Use the approved chemistry and control processing conditions and sequence.','Développement du film radiographique selon des étapes maîtrisées.','Utilisez les produits approuvés et maîtrisez les conditions et la séquence de traitement.'],
 collimator:['Restricting and directing the radiographic beam.','Aim and secure it before exposure, then establish the required controlled area.','Limitation et orientation du faisceau radiographique.','Orientez et fixez-le avant l’exposition, puis établissez la zone contrôlée requise.'],
 lamp:['Illuminating a surface for visual examination.','Position it to meet the approved lighting and viewing-distance requirements.','Éclairage d’une surface pour un examen visuel.','Positionnez-la selon les exigences d’éclairage et de distance d’observation approuvées.'],
 'gauge-tool':['Measuring weld profile and dimensions during visual inspection.','Seat the correct gauge faces on the weld and record the measured feature.','Mesure du profil et des dimensions du cordon en contrôle visuel.','Placez les faces adaptées sur le cordon et consignez la caractéristique mesurée.'],
 caliper:['Measuring component dimensions or rope diameter.','Clean the contact faces, measure without forcing the jaws, and record the value.','Mesure des dimensions d’une pièce ou du diamètre d’un câble.','Nettoyez les faces, mesurez sans forcer les becs et consignez la valeur.'],
 'diameter-gauge':['Checking wire-rope diameter against its nominal condition.','Measure at the specified locations and compare with the inspection criteria.','Vérification du diamètre du câble par rapport à son état nominal.','Mesurez aux emplacements prescrits et comparez aux critères d’inspection.'],
 magnifier:['Enlarging small surface features during close visual examination.','Focus at a safe, stable viewing position and avoid disturbing the surface.','Grossissement des petits détails lors d’un examen visuel rapproché.','Faites la mise au point depuis une position stable sans altérer la surface.'],
 borescope:['Viewing internal or line-of-sight-restricted surfaces.','Guide the clean probe gently through the access point and inspect without forcing it.','Observation des surfaces internes ou difficiles d’accès visuel.','Introduisez doucement la sonde propre par l’accès prévu, sans la forcer.'],
 comparator:['Comparing a surface profile or finish with a known reference.','Clean the reference and part, then compare under suitable lighting and orientation.','Comparaison d’un profil ou d’un état de surface avec une référence connue.','Nettoyez la référence et la pièce, puis comparez sous un éclairage et une orientation adaptés.'],
 camera:['Documenting inspection evidence with a visible location and identification.','Focus, include a scale or location reference, and store the image with the report.','Documentation visuelle du contrôle avec localisation et identification.','Faites la mise au point, incluez une échelle ou un repère, puis associez l’image au rapport.'],
 crane:['Lifting and moving loads using controlled hoist and travel motions.','Verify authorization and rigging, clear the exclusion zone, then operate from controls.','Levage et déplacement de charges par des mouvements maîtrisés.','Vérifiez l’autorisation et l’élingage, dégagez la zone d’exclusion puis commandez l’appareil.'],
 'rope-caliper':['Measuring wire-rope diameter loss during inspection.','Measure the rope at the prescribed locations using the correct contact orientation.','Mesure de la perte de diamètre d’un câble lors de l’inspection.','Mesurez le câble aux emplacements prescrits avec l’orientation de contact adaptée.'],
 'load-cell':['Measuring tensile force during an authorized load test.','Install in line with the load path and verify zero and calibration before loading.','Mesure de la force pendant un essai de charge autorisé.','Installez-la dans l’axe de charge et vérifiez le zéro et l’étalonnage avant la mise en charge.'],
 weights:['Providing a known test load for lifting-equipment verification.','Use certified weights and the approved lifting plan and exclusion zone.','Fourniture d’une charge d’essai connue pour vérifier un appareil de levage.','Utilisez des masses certifiées avec le plan de levage et la zone d’exclusion approuvés.'],
 hook:['Checking hook throat opening, deformation, and wear.','Clean and identify the hook, then measure the specified dimensions and inspect the latch.','Contrôle de l’ouverture, de la déformation et de l’usure du crochet.','Nettoyez et identifiez le crochet, mesurez les dimensions prescrites et vérifiez le linguet.'],
 sling:['Connecting a test load to lifting equipment.','Inspect identification and condition; connect only rated components per the lift plan.','Liaison entre la charge d’essai et l’appareil de levage.','Vérifiez l’identification et l’état, puis utilisez uniquement des composants adaptés au plan de levage.'],
 switch:['Verifying travel, overload, or emergency limit operation.','Test each device using the approved functional test and keep clear of moving parts.','Vérification des fins de course, surcharge ou arrêt d’urgence.','Testez chaque dispositif selon la procédure fonctionnelle et restez à distance des pièces mobiles.'],
 brake:['Checking the holding and stopping performance of a lifting brake.','Test only with an authorized plan, controlled load, and exclusion zone.','Contrôle du maintien et de l’arrêt du frein de levage.','Effectuez l’essai uniquement selon un plan autorisé, avec charge maîtrisée et zone d’exclusion.'],
 kit:['Supporting visual and magnetic examination of lifting components.','Select the qualified technique and verify consumables and lighting before inspection.','Réalisation de contrôles visuels et magnétiques des composants de levage.','Choisissez la technique qualifiée et vérifiez les consommables et l’éclairage avant le contrôle.'],
 'voltage-indicator':['Checking whether electrical potential is present.','Prove the indicator before and after the test and use the approved contact points.','Vérification de la présence d’une tension électrique.','Vérifiez l’indicateur avant et après le test et utilisez les points de contact approuvés.'],
 'two-pole':['Verifying voltage and absence of voltage between two points.','Prove the tester, test the defined conductors, then prove it again.','Vérification de la tension et de son absence entre deux points.','Vérifiez le testeur, contrôlez les conducteurs définis puis vérifiez-le à nouveau.'],
 'insulation-meter':['Measuring insulation resistance between conductors and earth.','Isolate and discharge the circuit, connect leads, and use the approved test setting.','Mesure de la résistance d’isolement entre conducteurs et terre.','Isolez et déchargez le circuit, raccordez les cordons et utilisez le réglage approuvé.'],
 'continuity-meter':['Checking protective-conductor or bonding-path continuity.','Isolate the circuit and test the defined path with a verified instrument.','Vérification de la continuité du conducteur de protection ou de liaison.','Isolez le circuit et contrôlez le trajet défini avec un appareil vérifié.'],
 'loop-meter':['Measuring fault-loop impedance in an electrical installation.','Select the approved test mode and connection point; follow site safety controls.','Mesure de l’impédance de boucle de défaut d’une installation électrique.','Sélectionnez le mode et le point de connexion approuvés, puis respectez les mesures de sécurité.'],
 'rcd-tester':['Checking residual-current-device trip response.','Connect at the approved point and run the specified test sequence.','Vérification du déclenchement d’un dispositif différentiel.','Raccordez l’appareil au point approuvé et exécutez la séquence de test prescrite.'],
 clamp:['Measuring current without opening the conductor circuit.','Close the jaw around one conductor only and select the correct range.','Mesure du courant sans ouvrir le circuit du conducteur.','Refermez la mâchoire autour d’un seul conducteur et sélectionnez le calibre adapté.'],
 multimeter:['Measuring electrical quantities and checking continuity.','Select the correct function and range, then use rated probes at approved points.','Mesure de grandeurs électriques et contrôle de continuité.','Sélectionnez la fonction et le calibre adaptés, puis utilisez des sondes homologuées.'],
 thermal:['Locating temperature patterns under a known load condition.','Confirm load and emissivity context, focus the target, and record the image.','Repérage des écarts thermiques dans des conditions de charge connues.','Confirmez la charge et l’émissivité, faites la mise au point et consignez l’image.'],
 loto:['Preventing unexpected energization during inspection or maintenance.','Identify every energy source, isolate it, apply locks and tags, then verify isolation.','Prévention d’une remise sous énergie inattendue pendant le contrôle ou la maintenance.','Identifiez chaque source, isolez-la, posez cadenas et étiquettes, puis vérifiez l’isolement.'],
 thickness:['Measuring remaining wall thickness using ultrasonic echoes.','Calibrate with the correct reference, apply couplant, and take readings at mapped points.','Mesure de l’épaisseur résiduelle par échos ultrasonores.','Étalonnez avec la référence adaptée, appliquez le couplant et mesurez aux points cartographiés.'],
 pump:['Raising liquid pressure for an authorized hydrostatic test.','Vent trapped air, connect rated hoses and gauges, then pressurize per the test plan.','Mise en pression du liquide pour une épreuve hydraulique autorisée.','Purgez l’air, raccordez flexibles et manomètres adaptés, puis pressurisez selon le plan d’essai.'],
 gauge:['Reading applied pressure during testing or operation.','Verify calibration and range, connect safely, and read at the specified hold point.','Lecture de la pression appliquée pendant l’essai ou le fonctionnement.','Vérifiez l’étalonnage et le calibre, raccordez en sécurité et relevez au palier défini.'],
 recorder:['Recording pressure or measurements over time.','Set the correct range and time base, verify the record, and retain it with the report.','Enregistrement de la pression ou des mesures dans le temps.','Réglez la plage et la base de temps, vérifiez l’enregistrement et joignez-le au rapport.'],
 valve:['Checking pressure-relief valve set pressure and seat tightness.','Secure the valve on an approved bench and follow the authorized test procedure.','Vérification du tarage et de l’étanchéité d’une soupape de sûreté.','Fixez la soupape sur un banc approuvé et suivez la procédure d’essai autorisée.'],
 hardness:['Estimating material hardness using a controlled test method.','Prepare the specified surface and apply the selected method at approved locations.','Estimation de la dureté d’un matériau par une méthode d’essai contrôlée.','Préparez la surface prescrite et appliquez la méthode choisie aux emplacements autorisés.'],
 manifold:['Filling, venting, and draining a pressure-test system.','Connect identified lines, vent trapped air, and control filling and draining remotely.','Remplissage, purge et vidange d’un circuit d’essai sous pression.','Raccordez les lignes identifiées, purgez l’air et maîtrisez le remplissage et la vidange à distance.'],
 'measure-tool':['Taking traceable measurements for a defined inspection task.','Verify calibration and range, measure the specified feature, and record the result.','Réalisation de mesures traçables pour un contrôle défini.','Vérifiez l’étalonnage et le calibre, mesurez la caractéristique prescrite et consignez le résultat.'],
 reference:['Providing a known condition for instrument or part comparison.','Confirm reference identification and validity, then compare using the approved method.','Fourniture d’une condition connue pour comparer un appareil ou une pièce.','Vérifiez l’identification et la validité de la référence, puis comparez selon la méthode approuvée.'],
 ppe:['Protecting personnel and controlling hazardous energy during inspection.','Select PPE for the hazard assessment and apply isolation controls before work.','Protection du personnel et maîtrise des énergies dangereuses pendant le contrôle.','Choisissez les EPI selon l’évaluation des risques et appliquez les mesures d’isolement avant le travail.']
};
function drawEquipmentModel(r,kind,T){
 const steel=[130,148,173],dark=[38,47,62],red=[210,65,65],blue=[60,145,220],gold=[215,174,75],green=[70,195,140];
 const pulse=.5+.5*Math.sin(T*3),spin=T*.8;
 r.grid(8,1,-.82);r.box([0,-.12,0],[4.8,.18,3.6],[67,78,92]);for(const x of[-2.2,2.2])for(const z of[-1.55,1.55])r.box([x,-.5,z],[.12,.62,.12],[45,55,68]);
 const box=(p,s,c,rot)=>r.box(p,s,c,rot),cyl=(p,rad,h,c,rot,n)=>r.cyl(p,rad,h,c,rot,n||16),line=(a,b,c,w)=>r.ln(a,b,c,w||2,.9,.1);
 const panel=(label,color)=>{box([0,1.25,0],[1.7,1.05,.32],dark);box([0,1.3,.19],[1.22,.68,.04],steel);box([0,1.3,.22],[1.1,.56,.025],[14,28,39]);r.txt([0,1.55,.24],label,color||green);for(let i=0;i<5;i++)cyl([-.55+i*.27,.96,.24],.045,.03,i===1?red:blue,null,8);for(const x of[-.78,.78])for(const y of[.91,1.68])cyl([x,y,.24],.025,.025,[205,210,215],null,8)};
 switch(kind){
  case'cleaner-can':case'penetrant-can':case'developer-can':case'couplant':
   {const color=kind==='cleaner-can'?blue:kind==='developer-can'?WHITE:kind==='couplant'?[100,195,225]:red,particle=kind==='developer-can'?WHITE:color;
  cyl([0,.78,0],.34,1.32,color,null,24);cyl([0,.14,0],.35,.1,steel,null,24);cyl([0,1.44,0],.35,.08,steel,null,24);cyl([0,1.48,0],.25,.12,steel,null,16);cyl([.16,1.58,0],.06,.2,dark,[0,0,Math.PI/2],10);box([.22,1.66,0],[.3,.08,.12],steel);box([0,.82,.33],[.38,.3,.035],dark);r.txt([0,.88,.36],kind==='cleaner-can'?'CLEAN':kind==='penetrant-can'?'PT':kind==='developer-can'?'DEV':'COUP',WHITE);
   for(let i=0;i<9;i++){const a=T*(kind==='developer-can'?2:5)+i*.7,x=.4+Math.cos(a)*(.22+(T*.35+i*.07)%1),y=1.42-(T*.35+i*.07)%1,z=Math.sin(a)*.18;r.sph([x,y,z],kind==='couplant'?.06:.035,particle,.8,.2)}}
   break;
  case'timer':
   panel('00:'+String(Math.floor((T*10)%60)).padStart(2,'0'),green);cyl([0,.52,0],.45,.08,steel,null,24);r.path(circ([0,.55,0],.36,'y',36,.7,T*.12),gold,3);break;
  case'uv-lamp':case'white-lamp':case'lamp':
  {const beam=kind==='uv-lamp'?ORG:gold;cyl([0,.16,0],.65,.2,dark,null,24);cyl([0,.85,0],.09,1.25,steel,null,12);box([0,1.56,0],[.8,.28,.5],dark,[0,0,.18*Math.sin(T)]);cyl([0,1.38,.2],.23,.05,beam,null,20);
  for(let i=-3;i<=3;i++)line([i*.16,1.3,.25],[i*.38,.05,2],beam,kind==='uv-lamp'?2:1)}break;
  case'booth':
  box([0,.9,0],[2.2,1.8,.15],steel);box([0,.9,.18],[1.75,1.35,.03],dark);box([-.96,.9,.1],[.14,1.8,.4],steel);box([.96,.9,.1],[.14,1.8,.4],steel);box([0,.08,0],[1.25,.12,1],gold);r.path(crackA(.1,.45,7),red,3,.95,.2);break;
  case'yoke':
   box([-.72,.86,0],[.24,1.25,.32],red);box([.72,.86,0],[.24,1.25,.32],red);box([0,1.47,0],[1.65,.24,.32],red);box([-.72,.2,0],[.4,.16,.55],steel);box([.72,.2,0],[.4,.16,.55],steel);box([0,.06,0],[1.2,.12,.3],gold);
   for(let i=0;i<4;i++)r.path(circ([0,.1,0],.42+i*.16,'y',32,.75,T*.12),blue,1.5,.7,.1);break;
  case'prods':
   for(const x of[-.7,.7]){cyl([x,.78,0],.14,1.2,dark,[0,0,.2*x],16);cyl([x,.13,0],.22,.12,steel,null,12);line([x,.35,0],[x*1.8,.04,.5],red,2)}
   box([0,.12,0],[1.3,.12,.32],steel);for(let i=0;i<6;i++)r.sph([-.5+i*.2,.18,.16*Math.sin(T*8+i)],.035,gold);break;
  case'coil':
   box([0,.18,0],[1.4,.24,.8],steel);cyl([0,.48,0],.18,.38,gold,null,20);for(let i=0;i<9;i++)r.path(circ([0,.35+i*.09,0],.58,'y',36,1,spin+i*.08),red,2,.85,.2);r.sph([Math.cos(T*1.6)*.4,.58,Math.sin(T*1.6)*.4],.08,blue);break;
  case'demag':
   box([0,.7,0],[1.9,1.3,1.5],dark);box([0,.7,.77],[1.5,.95,.04],steel);for(let i=0;i<7;i++)box([-.6+i*.2,.7,.81],[.05,.82,.035],i%2?blue:red);cyl([Math.sin(T*.55)*.48,.38,0],.17,.85,steel,[0,0,Math.PI/2],16);r.path(circ([Math.sin(T*.55)*.48,.35,0],.3,'z',24,1,T*.08),blue,2,.8,.2);break;
  case'tank':
  box([0,.65,0],[1.9,1.2,1.1],[55,115,145]);box([0,.72,.57],[1.45,.8,.04],[90,175,205]);box([0,.12,0],[1.3,.18,.35],steel);for(let i=0;i<24;i++)r.sph([Math.sin(i*8+T)*.7,.25+(i%6)*.13,Math.cos(i*4+T)*.35],.025,red,.8,.2);break;
  case'powder':
   cyl([0,.7,0],.3,1.1,steel,null,18);cyl([0,1.3,0],.2,.16,gold,null,12);for(let i=0;i<16;i++)r.sph([Math.sin(i*9+T*2)*.42,.95-(i*.09+T*.4)%1,Math.cos(i*3)*.18],.025,gold,.85,.1);break;
  case'field-gauge':
   cyl([0,.36,0],.52,.12,steel,null,32);cyl([0,.44,0],.43,.035,[28,36,48],null,32);for(let i=0;i<12;i++){const a=i/12*TAU;line([Math.sin(a)*.33,.48,Math.cos(a)*.33],[Math.sin(a)*.39,.48,Math.cos(a)*.39],WHITE,1)}r.path(circ([0,.49,0],.35,'y',40,1),gold,1.5);line([0,.51,0],[.28*Math.sin(T*1.4),.53,.28*Math.cos(T*1.4)],red,3);r.txt([0,.62,-.04],'FIELD',WHITE);break;
  case'two-pole':case'voltage-indicator':
   for(const s of[-1,1]){box([s*.55,.65,0],[.3,.95,.28],s<0?red:blue);box([s*.55,.82,.16],[.18,.16,.025],dark);cyl([s*.55,.08,0],.045,.3,steel,[0,0,.18*s],8);r.path([[s*.55,.18,0],[s*.6,-.1,.2],[s*.25,-.22,.55],[0,.2,.62]],dark,2.2,.9,.1)}cyl([0,.78,.05],.18,.08,gold,null,16);r.txt([0,.8,.1],'V',WHITE);break;
  case'gauge':case'meter':case'gauge-tool':case'multimeter':case'insulation-meter':case'continuity-meter':case'loop-meter':case'rcd-tester':
   panel(kind==='meter'?'µSv/h':kind==='gauge'?'bar':kind==='gauge-tool'?'WELD':kind==='insulation-meter'?'MΩ':kind==='continuity-meter'?'Ω':kind==='loop-meter'?'LOOP Ω':kind==='rcd-tester'?'RCD ms':'V  Ω',green);
   r.path(circ([0,.73,.25],.22,'z',32,1),gold,2);line([0,.73,.27],[.16*Math.sin(T*2),.86,.28],red,2);line([-.55,.75,.2],[-1,.15,.7],red,1);line([.55,.75,.2],[1,.15,.7],blue,1);
   if(kind==='multimeter'||kind==='insulation-meter'||kind==='loop-meter')for(const x of[-.35,.35])cyl([x,.76,.25],.06,.04,x<0?red:dark,null,10);if(kind==='rcd-tester')cyl([.65,1.55,.18],.12,.08,red,null,12);break;
  case'instrument':case'recorder':
  panel(kind==='recorder'?'LIVE TRACE':'A-SCAN',green);const pts=[];for(let i=0;i<20;i++)pts.push([-.48+i*.05,1.3+.12*Math.sin(i+T*4)+((i===7||i===14)?pulse*.3:0),.26]);r.path(pts,green,2);break;
  case'thickness':
   box([0,.8,0],[1.35,.85,.42],dark);box([0,.85,.23],[.98,.48,.04],steel);box([0,.85,.26],[.84,.34,.025],[12,34,29]);r.txt([0,.9,.29],(8.4+.1*Math.sin(T*2)).toFixed(1)+' mm',green);cyl([-.38,1.18,.25],.07,.04,red,null,10);cyl([.38,1.18,.25],.07,.04,blue,null,10);line([-.48,.35,.1],[-.48,.08,.1],red,2);line([.48,.35,.1],[.48,.08,.1],blue,2);box([0,.04,.08],[.45,.12,.35],steel);line([0,.04,.22],[0,-.12,.5],dark,3);break;
  case'probe':case'straight-probe':case'angle-probe':case'array':case'tofd':case'scanner':case'borescope':case'camera':case'hardness':case'corrosion':
   box([0,.13,0],[1.4,.18,.8],steel);box([-.38,.37,.1],[.48,.35,.42],blue);line([-.38,.54,.3],[-.15,1.15,.5],dark,5);line([-.15,1.15,.5],[.2,1.45,.6],dark,4);
   if(kind==='array'||kind==='tofd'){for(let i=0;i<7;i++)line([-.65+i*.2,.47,-.2],[.2,.02,-1.1+i*.28],blue,1)}else if(kind==='angle-probe'){box([-.38,.26,.1],[.48,.22,.42],gold,[0,0,-.35]);line([-.15,.42,.3],[.55,.05,-.8],gold,2)}else{for(let i=0;i<4;i++)r.path(circ([.15,.15,0],.25+i*.2,'y',28,.5,T*.2),kind==='thickness'?green:gold,1.4,.6,.1)}
   if(kind==='scanner'||kind==='corrosion'){cyl([-.6,.08,.35],.18,.12,dark,[Math.PI/2,0,0],16);cyl([.6,.08,.35],.18,.12,dark,[Math.PI/2,0,0],16);box([0,.32,.37],[.9,.1,.08],green)}
   if(kind==='borescope'||kind==='camera'){panel(kind==='camera'?'IMAGE':'LIVE');cyl([.15,.34,.1],.22,.12,dark,[Math.PI/2,0,0],20)}
   if(kind==='hardness'){cyl([.3,1.05,0],.08,.45,gold,null,12);line([.3,.7,0],[.3,.2,0],red,2)}break;
  case'block':case'iqi':case'measure-tool':case'reference':
   box([0,.25,0],[1.7,.42,1.1],steel);for(let i=0;i<5;i++)box([-.55+i*.27,.49,.1],[.08,.06,.65],i%2?gold:dark);line([-.6,.56,-.35],[.6,.56,-.35],green,2);break;
  case'film':
   box([0,.72,0],[1.8,1.25,.16],dark);box([0,.72,.1],[1.55,1,.035],[30,31,36]);r.path(crackA(.1,.4,5),red,2);for(let i=0;i<7;i++)line([-.62+i*.18,.35,.13],[-.62+i*.18,1.08,.13],steel,1);box([-.62,.72,.15],[.13,.9,.025],gold);break;
  case'detector':
   box([0,.72,0],[1.8,1.25,.2],dark);box([0,.72,.12],[1.54,1,.025],[28,92,75]);for(let x=-.6;x<=.61;x+=.2)line([x,.25,.15],[x,1.19,.15],green,.7);for(let y=.35;y<=1.1;y+=.18)line([-.72,y,.15],[.72,y,.15],green,.7);r.path(crackA(.1,.4,5),red,2);break;
  case'processor':
   box([0,.42,0],[2.1,.75,.85],dark);for(let i=-1;i<=1;i++){box([i*.62,.72,.05],[.53,.5,.58],i<0?blue:i===0?gold:steel);for(let j=0;j<5;j++)r.sph([i*.62-.15+j*.07,.49+.04*Math.sin(T*2+j),.36],.025,WHITE)}box([Math.sin(T)*.72,.15,.52],[.7,.04,.3],green);break;
  case'comparator':
   box([0,.2,0],[1.8,.15,1.2],steel);for(let i=0;i<8;i++)box([-.7+i*.2,.31,.1],[.12,.08,.75],i%2?gold:dark);box([-.4,.64,.12],[.12,.55,.12],red);box([-.4,.91,.12],[.55,.1,.12],steel);break;
  case'source':
   cyl([0,.8,0],.27,1.35,steel,null,24);for(let y=.3;y<1.35;y+=.18)cyl([0,y,0],.3,.035,dark,null,24);cyl([0,1.53,0],.2,.16,gold,null,16);for(let i=-3;i<=3;i++)line([0,1.53,.12],[i*.2,.12,1.3],YEL,1);break;
  case'projector':
   cyl([0,.75,0],.62,1.2,dark,null,24);cyl([0,1.38,0],.5,.12,steel,null,20);box([0,.08,0],[.9,.16,.8],steel);cyl([0,.75,.62],.12,.15,gold,[Math.PI/2,0,0],14);r.path([[0,.75,.69],[.2,.6,1],[.45,.42,1.6],[.6,.2,2.2]],steel,3);r.sph([Math.sin(T*1.4)*.04,.75,.7],.07,red);break;
  case'collimator':
   cyl([0,.6,0],.5,.55,steel,[Math.PI/2,0,0],20,.22);cyl([0,.6,.3],.2,.08,dark,[Math.PI/2,0,0],16);for(let i=-3;i<=3;i++)line([0,.6,.35],[i*.09,.6+i*.06,1.2],gold,1);box([0,.6,-.32],[.8,.7,.12],dark);break;
  case'caliper':case'rope-gauge':case'rope-caliper':case'diameter-gauge':
   if(kind==='diameter-gauge'){cyl([0,.34,0],.32,.18,steel,null,20);r.path(circ([0,.35,-.12],.28,'z',28,.78),gold,3);box([0,.48,.3],[.12,.4,.12],red);line([-.8,.15,0],[.8,.15,0],dark,5);break}
   box([0,.45,0],[1.8,.08,.15],steel);box([-.65,.7,0],[.08,.55,.2],gold);box([.45+.12*Math.sin(T),.7,0],[.08,.55,.2],gold);line([-.62,.38,.1],[.48+.12*Math.sin(T),.38,.1],red,2);break;
  case'magnifier':
  cyl([0,1,0],.48,.1,steel,[Math.PI/2,0,0],32);cyl([0,1,.06],.37,.02,[110,180,210],[Math.PI/2,0,0],32);line([.3,.72,0],[.8,.1,0],dark,7);for(let i=0;i<5;i++)line([-.3+i*.15,.6,-.3],[ -.3+i*.15,.1,-.3],gold,1);break;
  case'crane':
   box([0,1.9,0],[3.4,.22,.35],gold);box([-1.5,1,0],[.18,2,.18],steel);box([1.5,1,0],[.18,2,.18],steel);box([Math.sin(T*.65)*.8,1.65,0],[.65,.28,.55],red);const hx=Math.sin(T*.65)*.8;line([hx-.1,1.5,0],[hx-.1,.65+.12*Math.sin(T*2),0],steel,2);line([hx+.1,1.5,0],[hx+.1,.65+.12*Math.sin(T*2),0],steel,2);box([hx,.35+.12*Math.sin(T*2),0],[.6,.45,.5],blue);break;
  case'load-cell':
   box([0,1.25,0],[.72,.38,.54],dark);box([0,1.29,.29],[.48,.2,.03],steel);r.txt([0,1.31,.32],(4.2+.15*Math.sin(T*2)).toFixed(1)+' kN',green);cyl([0,1.64,0],.17,.16,steel,null,14);cyl([0,.86,0],.17,.16,steel,null,14);line([0,1.72,0],[0,1.95,0],gold,3);line([0,.78,0],[0,.53,0],gold,3);break;
  case'weights':
   for(let i=0;i<4;i++){const y=.22+i*.28,width=1.1-i*.13;box([0,y,0],[width,.24,.8],i%2?steel:gold);for(const x of[-width*.32,width*.32])cyl([x,y+.13,0],.06,.035,dark,null,10)}line([0,1.42,0],[0,1.65,0],steel,3);cyl([0,1.72,0],.14,.13,dark,null,16);break;
  case'hook':case'sling':
   line([0,1.45,0],[0,.85,0],steel,4);r.path([[0,.85,0],[.35,.65,0],[.42,.35,0],[.25,.14,0],[-.05,.12,0],[-.22,.3,0]],gold,6);
   if(kind==='sling'){line([-.9,.08,-.3],[0,.8,0],blue,5);line([.9,.08,-.3],[0,.8,0],blue,5);box([0,.03,0],[1.4,.12,.6],steel)}break;
  case'switch':
   box([0,.65,0],[1.25,.85,.45],dark);box([0,.7,.25],[.85,.58,.04],steel);for(let i=0;i<3;i++){const x=-.28+i*.28;box([x,.72,.3],[.12,.31,.12],i===1?red:blue);line([x,.52,.32],[x,.2,.35],gold,2)}line([-.5,1.17,.1],[.45,1.17+.1*Math.sin(T*3),.1],red,4);break;
  case'loto':
   box([0,.65,0],[1.25,.85,.45],dark);for(let i=-1;i<=1;i++){box([i*.36,.72,.25],[.14,.56,.08],red);r.path(circ([i*.36,.52,.31],.13,'z',20,.82),gold,2)}box([0,.16,.28],[.66,.12,.1],gold);for(const x of[-.25,.25])r.path([[x,.23,.3],[x,.04,.38],[x,.04,.15],[x,.24,.13]],steel,2.5);break;
  case'brake':
   for(let i=0;i<3;i++)cyl([-.55+i*.55,.65,0],.34,.18,i===1?red:steel,[Math.PI/2,0,0],24);line([-.8,1.1,0],[.4,1.1+.2*Math.sin(T*2),0],gold,4);break;
  case'clamp':
  box([0,.65,0],[.7,.95,.22],dark);r.path(circ([0,.78,.18],.42,'z',32,.78),gold,5);line([-.5,.12,.28],[.5,.12,.28],red,5);for(let i=0;i<8;i++)r.sph([-.5+i*.14,.14,.28+.08*Math.sin(T*5+i)],.035,green);break;
  case'thermal':
  box([0,.7,0],[.85,1.1,.35],dark);panel('IR',red);cyl([0,.75,.2],.2,.1,red,[Math.PI/2,0,0],20);box([0,.12,1],[1.2,.1,.12],[235,95,65]);box([-.4+.8*((T*.2)%1),.2,1.08],[.04,.04,.04],WHITE);for(let i=0;i<7;i++)r.sph([-.5+i*.16,.2,1],.07,[235,80+20*i,55]);break;
  case'pump':
   box([-.28,.43,0],[.62,.72,.52],steel);cyl([-.28,.14,0],.26,.08,blue,null,18);cyl([-.28,.83,0],.14,.16,dark,null,14);line([-.28,.92,0],[-.28,1.42,0],steel,4);line([-.8,1.42,0],[.25,1.42,0],gold,5);line([0,.58,.25],[.58,.58,.45],blue,5);cyl([.63,.58,.45],.18,.1,gold,[Math.PI/2,0,0],16);for(let i=0;i<5;i++)r.sph([-.28,.27+i*.09,.28],.025,BLUE);break;
  case'valve':
   cyl([0,.48,0],.36,.5,steel,[Math.PI/2,0,0],20);cyl([0,.48,.3],.23,.12,gold,[Math.PI/2,0,0],18);cyl([0,.87,0],.15,.35,steel,null,14);cyl([0,1.08,0],.28,.08,red,null,20);for(const x of[-1,1])line([x*.24,1.08,0],[x*.42,1.08,0],dark,3);line([0,1.25,0],[0,1.5,0],steel,3);cyl([0,1.56,0],.12,.08,gold,null,12);break;
  case'manifold':
   box([0,.42,0],[1.85,.34,.4],steel);for(let i=-1;i<=1;i++){const x=i*.58;line([x,.58,0],[x,.96,0],blue,4);cyl([x,1.05,0],.2,.12,gold,null,16);line([x,1.08,.08],[x+.1,1.2,.1],red,2);cyl([x,.88,.18],.055,.04,dark,null,10)}line([-.9,.42,.2],[-1.1,.2,.45],blue,5);line([.9,.42,.2],[1.1,.2,.45],red,5);break;
  case'ppe':case'kit':
   box([0,.35,0],[1.2,.35,.8],dark);cyl([-.25,.95,0],.42,.22,gold,[Math.PI/2,0,0],24);box([.42,.72,0],[.4,.55,.3],blue);line([-.8,.08,-.3],[.8,.08,.3],red,3);break;
  default:
   panel('CYCLOPS',green);cyl([0,.3,.45],.35,.25,gold,null,16);r.path(circ([0,.35,.45],.5,'y',24,1,T*.1),blue,2);
 }
}
function equipmentScene(method,index,item){
 const kind=(EQ_KIND[method]||EQ_KIND.OTH)[index]||'instrument';
 const localName=equipmentText(method,index,item)[0];
 return{cam:{d:6.5,y:.55,p:.35,t:[0,.65,0]},ph:[[item[0],localName,10,'equipment '+item[0]]],equipment:{method,index},kind,draw(r,T){drawEquipmentModel(r,kind,T)}};
}
function equipmentInformation(method,index,item,kind){
 const guide=EQ_GUIDE[kind]||[],frItem=EQUIPMENT_FR[method]&&EQUIPMENT_FR[method][index];
 const principle=FR()&&frItem?frItem[1]:item[1];
 const purpose=guide[FR()?2:0]||L('Use this item only for its approved inspection task.','Utilisez cet équipement uniquement pour le contrôle approuvé.');
 const usage=guide[FR()?3:1]||L('Follow the manufacturer instructions and approved procedure.','Suivez les instructions du fabricant et la procédure approuvée.');
 return'<section><h3>'+L('How it works','Fonctionnement')+'</h3><p>'+esc(principle)+'</p></section><section><h3>'+L('How to use it','Mode d’utilisation')+'</h3><p>'+esc(usage)+'</p></section><section><h3>'+L('What it is used for','Utilité')+'</h3><p>'+esc(purpose)+'</p></section>';
}

/* ===== inject the 3D block into the procedures sheet ===== */
const curM=()=>{const b=$q('#ptab .on');return b&&b.dataset.pm?b.dataset.pm:'PT'};
function inject(){const pb=document.getElementById('pbody');if(!pb||pb.querySelector('.cy3'))return;
 const key=curM()=='OTH'?'OTH':curM(),sc=SC[key]||SC.OTH,h2=pb.querySelector('h2');
 const d=document.createElement('details');d.className='cy3';d.open=true;
 d.innerHTML='<summary>🎬 '+L('Video animation · live 3D','Animation vidéo · 3D en direct')+'</summary><div class="cy3w cy3video"><canvas class="cy3c"></canvas><div class="cy3cap"></div><div class="cy3timeline"><span class="cy3dot"></span></div></div>'+
 '<div class="cy3bar"><button data-a="prev">⏮</button><button data-a="play">⏸</button><button data-a="next">⏭</button><button data-a="spd">1×</button><button data-a="speak" title="'+L('Play the English voice-over','Lire la voix française')+'">🔊 '+L('English voice','Voix française')+'</button><button data-a="voice" title="'+L('Read every phase automatically','Lire chaque étape automatiquement')+'">🔇 '+L('English voice off','Voix inactive')+'</button><button data-a="orb">🔄</button><button data-a="rst">🎯</button><button data-a="ai">🤖 '+L('Ask the assistant','Assistant IA')+'</button></div>'+
 '<div class="cy3bar">'+sc.ph.map((p,i)=>'<button data-ph="'+i+'">'+(i+1)+'</button>').join('')+'</div>'+
 '<p class="mut" style="margin:4px 0 10px;font-size:13px">'+L('Drag to rotate · pinch or wheel to zoom · double-tap to reset.','Glisser pour tourner · pincer ou molette pour zoomer · double-tap pour recentrer.')+'</p>';
 if(h2)h2.after(d);else pb.prepend(d);activeViewer=Viewer(d,key)}
function openEquipment(method,index){const p=window.CYPROC&&window.CYPROC[method],item=p&&p.equipment&&p.equipment[index];if(!item)return;const localized=equipmentText(method,index,item);document.querySelectorAll('.cy-equipment-dialog').forEach(d=>d.remove());const d=document.createElement('dialog'),scene=equipmentScene(method,index,item),hse=FR()&&HSE_FR[method]?[HSE_FR[method]]:(p.hse||[]);d.className='cy-equipment-dialog';d.innerHTML='<div class="cy-equipment-head"><div><strong>'+esc(localized[0])+'</strong><span>'+method+' · '+L('Dedicated 3D equipment animation','Animation 3D dédiée à cet équipement')+'</span></div><button type="button" data-eq-close>✕</button></div><div class="cy-equipment-body"><div class="cy-equipment-viewer"><div class="cy3w"><canvas class="cy3c"></canvas><div class="cy3cap">'+esc(localized[0])+'</div><div class="cy3timeline"><span class="cy3dot"></span></div></div><div class="cy3bar"><button data-a="play" title="Play or pause">⏸</button><button data-a="spd">1×</button><button data-a="speak">🔊 '+L('English voice','Voix française')+'</button><button data-a="voice">🔇 '+L('English voice off','Voix inactive')+'</button><button data-a="orb">🔄</button><button data-a="rst">🎯</button></div></div><div class="cy-equipment-info">'+equipmentInformation(method,index,item,scene.kind)+'</div><details open class="cy-equipment-hse"><summary>'+L('Health and safety','Santé et sécurité')+'</summary><ul>'+hse.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></details></div>';document.body.appendChild(d);d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-eq-close]'))d.close()});d.addEventListener('close',()=>d.remove());d.showModal();Viewer(d,method,scene)}

/* ===== AI assistant ===== */
const STOP=new Set('the a an of to in on for and or is are be do does how what which when why with at by from it this that i you my me can should must about les des du de la le un une et ou est sont que qui quoi quel quelle quand comment pourquoi avec pour dans sur au aux ce cette mon ma mes il elle je tu on ne pas plus faut doit dois peut'.split(' '));
const FRD={ressuage:'penetrant pt',magnetoscopie:'magnetic mt',ultrasons:'ultrasonic ut',ultrason:'ultrasonic ut',radiographie:'radiographic rt film',gammagraphie:'gamma radiographic',visuel:'visual vt',levage:'lifting crane',grue:'crane',elingue:'sling',elingues:'sling',crochet:'hook',cable:'wire rope',electrique:'electrical',isolement:'insulation',terre:'earth',recipient:'vessel pressure',pression:'pressure',epreuve:'test',soupape:'safety valve',manometre:'gauge pressure',epaisseur:'thickness',etalonnage:'calibration',critere:'acceptance criteria',criteres:'acceptance criteria',acceptation:'acceptance',defaut:'defect indication',defauts:'defect indication',fissure:'crack',soudure:'weld',cordon:'weld',temps:'time',duree:'time',nettoyage:'cleaning',nettoyer:'cleaning',revelateur:'developer',eclairage:'lighting lux',lumiere:'light lux',securite:'safety',rapport:'report',norme:'code standard',normes:'codes standards',etape:'step',etapes:'steps',champ:'field',aimantation:'magnetizing',sonde:'probe',sensibilite:'sensitivity',porosite:'porosity',soufflure:'porosity',erreur:'mistake',erreurs:'mistakes',charge:'load',essai:'test',penetration:'penetration',temperature:'temperature',distance:'distance'};
const MD={pt:/penetrant|ressuage|dwell|developer|revelateur/,mt:/magnetic|magneto|yoke|particle|aimant/,ut:/ultraso|probe|sonde|couplant|v1|dac/,rt:/radiograph|gamma|\bfilm|iqi|source|gammagraph/,vt:/visual|visuel|\bgauge|jauge/,apl:/crane|grue|sling|elingue|hook|crochet|lifting|levage|rope|cable/,ape:/electri|insulation|isolement|\brcd|thermograph|loto|megohm/,apvg:/vessel|pressure|hydrotest|valve|soupape|recipient|pression|manometre/};
const nz=s=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function stem(w){if(w.length<4)return w;w=w.replace(/ies$/,'y').replace(/(es|s|ing|ed)$/,'');return w.replace(/e$/,'')}
function tok(s){const o=[];nz(s).split(/[^a-z0-9]+/).forEach(w=>{if(!w||STOP.has(w))return;(FRD[w]?FRD[w].split(' '):[w]).forEach(x=>o.push(stem(x)))});return o}
function detM(n){const w=n.split(/[^a-z0-9]+/);for(const k of['apvg','apl','ape','pt','mt','ut','rt','vt'])if(w.includes(k))return k.toUpperCase();
 for(const k in MD)if(MD[k].test(n))return k.toUpperCase();return null}
const flat=(x,d)=>typeof x=='string'?x:(d>2||!x)?'':Array.isArray(x)?x.map(v=>flat(v,d+1)).join(' — '):typeof x=='object'?Object.values(x).map(v=>flat(v,d+1)).join(' — '):'';
const ASME_INDEX=[
 {methods:['RT'],code:'ASME BPVC Section V, Article 2',en:'Radiographic examination methods and technique requirements; product acceptance comes from the governing construction code.',fr:'Méthodes et exigences de technique pour l’examen radiographique ; l’acceptation du produit relève du code de construction applicable.'},
 {methods:['UT'],code:'ASME BPVC Section V, Article 4',en:'Ultrasonic examination methods and technique requirements; product acceptance comes from the governing construction code.',fr:'Méthodes et exigences de technique pour l’examen ultrasonore ; l’acceptation du produit relève du code de construction applicable.'},
 {methods:['PT'],code:'ASME BPVC Section V, Article 6',en:'Liquid penetrant examination methods and technique requirements; product acceptance comes from the governing construction code.',fr:'Méthodes et exigences de technique pour le ressuage ; l’acceptation du produit relève du code de construction applicable.'},
 {methods:['MT'],code:'ASME BPVC Section V, Article 7',en:'Magnetic particle examination methods and technique requirements; product acceptance comes from the governing construction code.',fr:'Méthodes et exigences de technique pour la magnétoscopie ; l’acceptation du produit relève du code de construction applicable.'},
 {methods:['VT'],code:'ASME BPVC Section V, Article 9',en:'Visual examination methods and technique requirements; product acceptance comes from the governing construction code.',fr:'Méthodes et exigences de technique pour l’examen visuel ; l’acceptation du produit relève du code de construction applicable.'},
 {methods:['APVG','RT','UT','PT','MT','VT'],code:'ASME BPVC Section VIII, Division 1',en:'Construction rules for pressure vessels, including applicable examination extent and acceptance provisions; verify the specific paragraph and edition.',fr:'Règles de construction des appareils à pression, y compris l’étendue des examens et les dispositions d’acceptation applicables ; vérifiez le paragraphe et l’édition concernés.'},
 {methods:['APVG','RT','UT','PT','MT','VT'],code:'ASME BPVC Section VIII, Division 2',en:'Alternative construction rules for pressure vessels; requirements depend on the selected design-by-rule or design-by-analysis route and edition.',fr:'Règles alternatives de construction des appareils à pression ; les exigences dépendent de la méthode de conception retenue et de l’édition.'},
 {methods:['APVG','RT','UT','PT','MT','VT'],code:'ASME BPVC Section IX',en:'Qualification of welding and brazing procedures and personnel; it is not, by itself, the production weld acceptance code.',fr:'Qualification des modes opératoires et du personnel de soudage et de brasage ; cette section ne constitue pas à elle seule le code d’acceptation des soudures de production.'},
 {methods:['APVG','RT','UT','PT','MT','VT'],code:'ASME B31.1',en:'Power piping construction code; examination and acceptance requirements depend on the applicable paragraph, service, and edition.',fr:'Code de construction des tuyauteries de puissance ; les exigences d’examen et d’acceptation dépendent du paragraphe, du service et de l’édition applicables.'},
 {methods:['APVG','RT','UT','PT','MT','VT'],code:'ASME B31.3',en:'Process piping construction code; examination and acceptance requirements depend on fluid service, joint, applicable paragraph, and edition.',fr:'Code de construction des tuyauteries de procédé ; les exigences dépendent du service du fluide, du joint, du paragraphe et de l’édition applicables.'},
 {methods:['APL'],code:'ASME B30.2',en:'Safety standard for overhead and gantry cranes; apply the relevant equipment configuration and edition.',fr:'Norme de sécurité pour les ponts roulants et portiques ; appliquez la configuration d’équipement et l’édition pertinentes.'},
 {methods:['APL'],code:'ASME B30.9',en:'Safety standard for slings; selection, inspection, use, and removal criteria depend on sling type and edition.',fr:'Norme de sécurité pour les élingues ; la sélection, l’inspection, l’utilisation et le retrait dépendent du type et de l’édition.'},
 {methods:['APL'],code:'ASME B30.10',en:'Safety standard for hooks; inspection and removal requirements depend on hook type and edition.',fr:'Norme de sécurité pour les crochets ; les exigences d’inspection et de retrait dépendent du type et de l’édition.'},
 {methods:['APL'],code:'ASME B30.16',en:'Safety standard for overhead underhung and stationary hoists; verify the applicable hoist type and edition.',fr:'Norme de sécurité pour les palans suspendus et fixes ; vérifiez le type de palan et l’édition applicables.'},
 {methods:['APL'],code:'ASME B30.20',en:'Safety standard for below-the-hook lifting devices; requirements depend on device type and edition.',fr:'Norme de sécurité pour les appareils de levage sous crochet ; les exigences dépendent du type d’appareil et de l’édition.'},
 {methods:['APL'],code:'ASME B30.26',en:'Safety standard for rigging hardware; inspection and use requirements depend on hardware type and edition.',fr:'Norme de sécurité pour les accessoires de gréage ; les exigences d’inspection et d’utilisation dépendent du type et de l’édition.'}
];
function corpus(){const P=window.CYPROC,ch=[];
 if(P){for(const k in P){const p=P[k],data=FR()&&p.fr?p.fr:p;p.codes.forEach((c,i)=>ch.push({m:k,s:L('Codes','Codes'),t:c[0]+': '+(FR()&&p.fr?p.fr.codes[i]:c[1])}));ASME_INDEX.filter(ref=>ref.methods.includes(k)).forEach(ref=>ch.push({m:k,s:L('ASME scope reference','Référence ASME — portée'),t:ref.code+': '+(FR()?ref.fr:ref.en)}));(p.equipment||[]).forEach((item,i)=>{const e=equipmentText(k,i,item);ch.push({m:k,s:L('Equipment','Équipement'),t:e[0]+': '+e[1]})});data.steps.forEach(s=>s[1].forEach(b=>ch.push({m:k,s:s[0],t:b})));
  data.acc.forEach(a=>ch.push({m:k,s:L('Acceptance','Acceptation'),t:a[0]+': '+a[1]}));data.wn.forEach(w=>ch.push({m:k,s:L('Warning','Attention'),t:w}))}}
 else{const m=curM();document.querySelectorAll('#pbody details:not(.cy3)').forEach(d=>{const s=(d.querySelector('summary')||{}).textContent||'';d.querySelectorAll('li,.cd').forEach(e=>ch.push({m:m,s:s.trim(),t:e.textContent.trim()}))})}
 try{if(typeof D!=='undefined'&&D.OTH)D.OTH.forEach(x=>{const t=flat(x,0);if(t)ch.push({m:'OTH',s:'OTHER',t:t.slice(0,400)})})}catch(e){}
 const df={};ch.forEach(c=>{c.k=new Set(tok(c.s+' '+c.t+' '+c.m));c.k.forEach(w=>df[w]=(df[w]||0)+1)});ch.N=ch.length;ch.df=df;return ch}
function retrieve(q,m,n){const C=corpus(),qs=new Set(tok(q));const sc=C.map(c=>{let s=0;qs.forEach(w=>{if(c.k.has(w))s+=Math.log(1+C.N/(C.df[w]||1))});if(m&&c.m==m)s*=2;return[s,c]});
 return sc.filter(x=>x[0]>=2).sort((a,b)=>b[0]-a[0]).slice(0,n||3).map(x=>x[1])}
const NOTE=()=>L('General guidance from the built-in procedures – verify against the current code edition.','Indications générales issues des procédures intégrées – à vérifier avec l’édition en vigueur du code.');
function asmeAnswer(q,method){const terms=tok(q).filter(word=>!['asme','code','standard','accept','acceptance','criteria','norm','norme'].includes(word)),refs=ASME_INDEX.filter(ref=>!method||ref.methods.includes(method)).map(ref=>({ref,score:terms.reduce((n,word)=>n+(tok(ref.code+' '+ref.en+' '+ref.fr).includes(word)?1:0),0)})).sort((a,b)=>b.score-a.score),selected=refs.filter(x=>x.score>0).slice(0,8);const list=(selected.length?selected:refs.slice(0,8)).map(x=>'• **'+x.ref.code+'** — '+(FR()?x.ref.fr:x.ref.en)).join('\n');return'**'+L('ASME reference guide · scope index only','Références ASME · répertoire de portée uniquement')+'**\n'+list+'\n\n'+L('This is a scope index, not the complete ASME text. Exact acceptance criteria depend on the governing construction code, division, edition, component, service, and project specification. Verify against an authorized current copy.','Ce répertoire indique les domaines concernés et ne remplace pas le texte complet de l’ASME. Les critères d’acceptation dépendent du code de construction, de la division, de l’édition, du composant, du service et de la spécification du projet. Vérifiez dans une copie actuelle autorisée.')}
function localAnswer(q,o){o=o||{};const P=window.CYPROC,n=nz(q);let m=detM(n)||curM();if(m=='OTH'&&!detM(n))m=null;const p=P&&m&&P[m],data=FR()&&p&&p.fr?p.fr:p,name=data&&data.name||p&&p.name;
 if(/\basme\b/.test(n))return asmeAnswer(q,m);
 if(!o.force&&p){
  if(/accept|criter|reject|rejet|conform/.test(n))return'**'+name+' · '+L('Acceptance criteria','Critères d’acceptation')+'**\n'+data.acc.map(a=>'• **'+a[0]+'**: '+a[1]).join('\n')+'\n\n⚠ '+NOTE();
  if(/\bcodes?\b|standard|\bnormes?\b|\biso\b|\basme\b|\bapi\b|\biec\b/.test(n))return'**'+name+' · '+L('Codes and standards','Codes et normes')+'**\n'+p.codes.map((c,i)=>'• **'+c[0]+'**: '+(FR()&&p.fr?p.fr.codes[i]:c[1])).join('\n');
  if(/safe|secur|danger|\bppe\b|\bepi\b|risk|risque|warn|attention|hazard/.test(n))return'**'+name+' · '+L('Safety','Sécurité')+'**\n'+data.wn.map(x=>'• '+x).join('\n');
  if(/^(steps?|etapes?|procedure|how|comment|overview|resume|summary)\b|all steps|toutes les etapes/.test(n))return'**'+name+' · '+L('Procedure','Procédure')+'**\n'+data.steps.map(s=>'• '+s[0]).join('\n')+'\n\n'+L('Ask about any step for details.','Posez une question sur une étape pour le détail.')}
 const h=retrieve(o.kw?o.kw+' '+(m||''):q,m,3);
 if(!h.length)return L('The available CYCLOPS procedures do not contain enough information to answer this question. Please specify the inspection method or relevant code, or consult the current approved procedure.','Les procédures CYCLOPS disponibles ne contiennent pas assez d’informations pour répondre à cette question. Précisez la méthode d’inspection ou le code applicable, ou consultez la procédure approuvée en vigueur.');
 return(o.head?'**'+o.head+'**\n':'')+h.map(c=>'• **'+(m?'':c.m+' · ')+c.s+'** — '+c.t).join('\n')+'\n\n'+NOTE()}
const SYS=[
 'You are the CYCLOPS technical assistant for inspectors working with NDT (PT/MT/UT/RT/VT), lifting equipment (APL), electrical equipment (APE), and pressure equipment (APVG).',
 'Understand the user’s intended meaning even when a question is very short, misspelled, ungrammatical, or uses everyday words instead of technical terms. Never criticize or correct their writing. If the meaning is reasonably clear, answer it directly instead of demanding a rephrasing.',
 'Be friendly, patient, and natural. Start with the direct answer, explain unfamiliar terms in plain language, and scale detail to the question. Use examples or numbered steps for difficult topics, and invite a useful follow-up without sounding like a form letter.',
 'Use the supplied CYCLOPS context first for project procedures. You may also answer general questions beyond inspection when you can do so reliably. Clearly label general guidance and distinguish it from the approved project procedure or governing code.',
 'If the request is ambiguous, state the most reasonable interpretation and answer under that assumption. Ask one short, specific follow-up only if a missing detail changes the answer or is needed for safety.',
 'When an image is supplied, inspect the image itself and compare it with the supplied CYCLOPS equipment catalogue. For equipment photos, explain the likely name and inspection method, the visible clues supporting the match, what the equipment does, visible controls/components/markings, any apparent condition concerns, and confidence. Mention brand, model, rating, or serial number only when legible in the photo. Separate direct observations from inferences, request a closer photo when necessary, and never infer equipment from its filename alone.',
 'For inspection images, explain practical next checks when useful. A photograph alone is not enough to declare an indication acceptable or rejectable; ask for the method, governing code and edition, procedure, scale, and relevant measurements when those affect the decision.',
 'Reply in the requested language. Keep simple answers concise; use ordered steps, examples, or headings when they make a complex answer clearer.',
 'For ASME questions, treat supplied ASME entries as a scope index, not complete code text. Identify the governing construction code and edition needed before discussing acceptance. Cite only source labels or standards present in the supplied context. Never claim to have checked an external code edition. Never invent acceptance criteria, code values, tolerances, or conformity decisions.',
 'For safety-critical uncertainty, advise stopping the work and consulting the qualified Level 3 inspector or supervisor.'
].join(' ');
function responseText(value){if(typeof value==='string')return value;if(Array.isArray(value))return value.map(responseText).join('');if(value&&typeof value==='object')return responseText(value.text||value.content||value.answer||'');return''}
let dead=false,aiProvider='';
function equipmentPhotoCatalog(){const P=window.CYPROC||{};return Object.keys(P).flatMap(method=>(P[method].equipment||[]).map((item,index)=>{const details=equipmentText(method,index,item);return method+': '+details[0]+' — '+details[1]})).join('\n')}
async function ask(q,o){o=o||{};const m=detM(nz(q))||curM(),matches=retrieve(o.kw?o.kw+' '+m:q,m==='OTH'?null:m,5),contextParts=matches.map(c=>'['+c.m+' · '+c.s+'] '+c.t);if(o.image)contextParts.unshift('[CYCLOPS equipment identification catalogue]\n'+equipmentPhotoCatalog());const ctx=contextParts.join('\n');
 const hist=CH.slice(-7,-1).map(x=>({role:x.r=='u'?'user':'assistant',content:x.t}));while(hist.length&&hist[0].role!='user')hist.shift();
 const userContent=o.image?[{type:'text',text:q},{type:'image_url',image_url:{url:o.image.dataUrl}}]:q;
 const messages=[{role:'system',content:SYS},...hist,{role:'user',content:userContent}];
 const request={q:q,question:q,lang:FR()?'fr':'en',method:m,history:hist,context:ctx,system:SYS,messages:messages};if(o.image)request.image={name:o.image.name,mimeType:o.image.mimeType,dataUrl:o.image.dataUrl};
 let error='';
 try{if(typeof window.CY_AI==='function'){const a=responseText(await window.CY_AI(q,ctx,hist,request));if(a){dead=false;aiConnectionState='online';aiProvider='Custom AI';updateAIStatus();return{t:a,ai:1}}}
  else{const r=await fetch(window.CY_AI_URL||'/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(request)});
   const ct=r.headers.get('content-type')||'';let payload;if(ct.includes('json'))payload=await r.json();else payload={answer:await r.text()};
   const responseModel=String(payload.model||'').trim();
   if(r.ok&&responseModel&&responseModel!=='local-fallback'){const a=responseText(payload.answer??payload.reply??payload.output_text??payload.text??payload.content??payload.message);if(a&&a.trim()){dead=false;aiConnectionState='online';aiProvider=payload.provider||responseModel;updateAIStatus();return{t:a.trim(),ai:1}}}
   error=responseText(payload.error)||(responseModel==='local-fallback'?L('The server returned an offline fallback, not an AI response.','Le serveur a renvoyé une réponse locale, pas une réponse IA.'):`AI service returned HTTP ${r.status} without a verified AI response.`);dead=true;aiConnectionState='offline';updateAIStatus()}}catch(e){error=L('Could not reach the AI service. Start the local CYCLOPS server and check its configuration.','Impossible de joindre le service IA. Démarrez le serveur local CYCLOPS et vérifiez sa configuration.');dead=true;aiConnectionState='offline';updateAIStatus()}
 return{t:localAnswer(q,o),ai:0,error}}
const CH=[];let ad,busy=false,pendingImage=null,lastChatImage=null,aiConnectionState='checking';
const fmt=t=>esc(t).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\n/g,'<br>');
function prepareImage(file){
 return new Promise((resolve)=>{
  if(!file||!file.type||!file.type.startsWith('image/')){resolve(null);return;}
  const url=URL.createObjectURL(file),img=new Image();
  img.onload=()=>{const max=1440,scale=Math.min(1,max/Math.max(img.width,img.height)),canvas=document.createElement('canvas');canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);URL.revokeObjectURL(url);resolve({name:file.name,mimeType:'image/jpeg',dataUrl:canvas.toDataURL('image/jpeg',.84),previewUrl:URL.createObjectURL(file)});};
  img.onerror=()=>{URL.revokeObjectURL(url);resolve(null);};img.src=url;
 });
}
async function attachImage(file){
 if(!file||!file.type||!file.type.startsWith('image/')){showImageError(L('Choose an image file.','Choisissez un fichier image.'));return;}
 if(file.size>15*1024*1024){showImageError(L('This image is too large. Choose one smaller than 15 MB.','Cette image est trop volumineuse. Choisissez une image de moins de 15 Mo.'));return;}
 const image=await prepareImage(file);if(!image){showImageError(L('The image could not be opened. Try another picture.','Impossible d’ouvrir cette image. Essayez une autre photo.'));return;}
 if(pendingImage)URL.revokeObjectURL(pendingImage.previewUrl);pendingImage=image;drawChat();ad.querySelector('.cyq').focus();
}
function showImageError(message){CH.push({r:'a',t:message});drawChat()}
function removePendingImage(){if(pendingImage)URL.revokeObjectURL(pendingImage.previewUrl);pendingImage=null;drawChat()}
async function send(text,o){text=(text||'').trim();if(busy||(!text&&!pendingImage))return;
 const image=pendingImage||lastChatImage;const question=text||L('Please identify and analyze this picture in detail.','Veuillez identifier et analyser cette image en détail.');
 const userHtml=image?'<div class="img-note"><img src="'+image.previewUrl+'" alt="'+esc(image.name)+'" /><span>'+esc(image.name)+'</span></div>':'';
 CH.push({r:'u',t:question,html:userHtml||null});if(pendingImage){lastChatImage=pendingImage;pendingImage=null;}
 busy=true;drawChat();
 const requestOptions=Object.assign({},o||{},{image:image||null,kw:(o&&o.kw?o.kw+' ':'')+(image?image.name+' ':'')+question});
 const a=await ask(question,requestOptions);busy=false;
 let suffix='';if(!a.ai&&a.error)suffix='\n\n'+L('AI connection: ','Connexion IA : ')+a.error;
 if(!a.ai&&image&&!a.error)suffix='\n\n'+L('(Image attached, but visual analysis requires an image-capable AI service.)','(Image jointe, mais son analyse visuelle nécessite un service IA compatible avec les images.)');
 CH.push({r:'a',t:a.t+suffix});drawChat();
}
function drawChat(){const box=ad.querySelector('.cym');box.innerHTML=CH.map((x,i)=>'<div class="m '+x.r+'">'+(x.html||fmt(x.t))+(x.r=='a'&&x.t?'<button class="sp" data-sp="'+i+'" title="Read aloud">🔊</button>':'')+'</div>').join('')+(busy?'<div class="m a">…</div>':'');box.scrollTop=box.scrollHeight;
 ad.querySelector('.cyc').innerHTML=chipsFor().map(c=>'<button data-q="'+esc(c[1])+'">'+esc(c[0])+'</button>').join('');
 ad.querySelector('.cyt').textContent='🤖 '+L('CYCLOPS Assistant','Assistant CYCLOPS')+' · '+curM();ad.querySelector('.cyq').placeholder=pendingImage?L('Ask about this picture…','Posez une question sur cette image…'):L('Ask a question…','Posez votre question…');ad.querySelector('.cyq').setAttribute('aria-label',L('Ask a question','Poser une question'));ad.querySelector('[data-cx="send"]').title=L('Send message','Envoyer le message');ad.querySelector('[data-cx="send"]').setAttribute('aria-label',L('Send message','Envoyer le message'));ad.querySelector('[data-cx="close"]').title=L('Close assistant','Fermer l’assistant');ad.querySelector('[data-cx="new"]').title=L('Start a new conversation','Nouvelle conversation');ad.querySelector('[data-cx="new"]').disabled=busy;updateAIStatus();const preview=ad.querySelector('.cyattach');if(pendingImage){preview.hidden=false;preview.innerHTML='<img src="'+pendingImage.previewUrl+'" alt="'+esc(pendingImage.name)+'"><span>'+esc(pendingImage.name)+'</span><button type="button" data-cx="remove-image" title="Remove image" aria-label="Remove image">✕</button>';}else{preview.hidden=true;preview.innerHTML='';}}
function chipsFor(){const c=api.cur();return[[L('Explain this phase','Expliquer cette étape'),'__phase'],[L('Acceptance criteria','Critères d’acceptation'),L('acceptance criteria','critères d’acceptation')],[L('Safety','Sécurité'),L('safety','sécurité')],[L('Codes','Normes'),L('codes and standards','codes et normes')],[L('Steps','Étapes'),L('steps','étapes')]]}
function updateAIStatus(){const badge=ad&&ad.querySelector('.cy-status');if(!badge)return;badge.dataset.state=aiConnectionState;badge.textContent=aiConnectionState==='online'?L('AI connected','IA connectée')+(aiProvider?' · '+aiProvider:''):aiConnectionState==='checking'?L('Checking connection','Connexion en cours'):aiConnectionState==='configured'?L('AI configured · not tested','IA configurée · non testée'):L('AI not connected','IA non connectée');badge.setAttribute('aria-label',badge.textContent)}
async function checkAIConnection(){aiConnectionState='checking';updateAIStatus();try{if(typeof window.CY_AI==='function'){aiProvider='';aiConnectionState='configured'}else{const response=await fetch(window.CY_AI_HEALTH_URL||'/api/health',{cache:'no-store'});const status=await response.json();aiProvider=status.provider||'';aiConnectionState=response.ok&&status.configured?'configured':'offline'}}catch(e){aiConnectionState='offline'}updateAIStatus()}
function welcomeMessage(){return L('Hi! Ask me anything about your inspection, equipment, or a photo. I can explain a simple question or work through technical details with you.','Bonjour ! Posez vos questions sur l’inspection, l’équipement ou une photo. Je peux expliquer simplement ou approfondir les détails techniques.')}
function newConversation(){if(busy)return;if(pendingImage)URL.revokeObjectURL(pendingImage.previewUrl);if(lastChatImage)URL.revokeObjectURL(lastChatImage.previewUrl);pendingImage=null;lastChatImage=null;CH.length=0;CH.push({r:'a',t:welcomeMessage()});drawChat();ad.querySelector('.cyq').focus()}
function openAI(q){if(!ad.open){const p=document.getElementById('prd');if(p){const cs=getComputedStyle(p);ad.style.color=cs.color}ad.showModal()}
 if(!CH.length)CH.push({r:'a',t:welcomeMessage()});
 checkAIConnection();
 drawChat();if(q)send(q);else ad.querySelector('.cyq').focus()}
function initAI(){ad=document.createElement('dialog');ad.id='cyai';
 ad.innerHTML='<div class="cyh"><div class="cyidentity"><b class="cyt"></b><span class="cy-status" data-state="checking"></span></div><div class="cyhead-actions"><button type="button" data-cx="new" aria-label="Start a new conversation">＋</button><button class="x" data-cx="close" aria-label="Close assistant">✕</button></div></div><div class="cym"></div><div class="cyc"></div><div class="cyattach" hidden></div><div class="cyf"><button type="button" data-cx="image" title="Upload or capture a picture" aria-label="Upload or capture a picture">📷</button><input id="cyai-image-input" type="file" accept="image/*" capture="environment" hidden><input class="cyq" type="text" autocomplete="off" placeholder="'+L('Ask a question…','Posez votre question…')+'"><button data-cx="send" title="Send message" aria-label="Send message">➤</button></div>';
 document.body.appendChild(ad);
 const imgInput=ad.querySelector('#cyai-image-input');
 ad.addEventListener('dragover',e=>{if(e.dataTransfer&&Array.from(e.dataTransfer.types).includes('Files')){e.preventDefault();ad.classList.add('drop-ready')}});
 ad.addEventListener('dragleave',e=>{if(!ad.contains(e.relatedTarget))ad.classList.remove('drop-ready')});
 ad.addEventListener('drop',e=>{if(!e.dataTransfer)return;e.preventDefault();ad.classList.remove('drop-ready');const file=e.dataTransfer.files&&e.dataTransfer.files[0];if(file)attachImage(file);});
 ad.addEventListener('click',e=>{if(e.target===ad){ad.close();return}const b=e.target.closest('button');if(!b)return;
  if(b.dataset.cx=='close')ad.close();
  else if(b.dataset.cx=='new')newConversation();
  else if(b.dataset.cx=='image'){imgInput.click();}
  else if(b.dataset.cx=='remove-image')removePendingImage();
  else if(b.dataset.cx=='send'){const i=ad.querySelector('.cyq');send(i.value);i.value=''}
  else if(b.dataset.q){if(b.dataset.q=='__phase'){const c=api.cur();send(c.name,{kw:c.kw,head:c.name,label:L('Explain: ','Expliquer : ')+c.name,force:1})}else send(b.dataset.q)}
  else if(b.dataset.sp!=null){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(CH[+b.dataset.sp].t.replace(/\*\*/g,''));u.lang=FR()?'fr-FR':'en-US';speechSynthesis.speak(u)}catch(x){}}});
 imgInput.addEventListener('change',(event)=>{const file=event.target.files&&event.target.files[0];if(file)attachImage(file);imgInput.value='';});
 ad.querySelector('.cyq').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const i=e.target;send(i.value);i.value=''} });
 ad.addEventListener('close',()=>{try{speechSynthesis.cancel()}catch(x){}})
}
/* ===== CSS + init ===== */
const css='.cy3 summary{font:700 18px "Barlow Condensed",system-ui,sans-serif}.cy3w{position:relative}'+
'.cy3video{border:1px solid var(--ln);border-radius:10px;overflow:hidden;background:#0e1621}.cy3timeline{position:absolute;left:10px;right:10px;bottom:10px;height:3px;background:rgba(255,255,255,.25);pointer-events:none}.cy3dot{display:block;width:18%;height:100%;background:var(--ac,#e63946);animation:cy3progress 6s linear infinite}@keyframes cy3progress{from{transform:translateX(0)}to{transform:translateX(455%)}}'+
'.cy-equipment-dialog{display:flex;flex-direction:column;width:min(920px,94vw);max-height:92vh;padding:0;overflow:hidden;border:1px solid var(--ln);border-radius:14px;background:#101a3a;color:inherit;box-shadow:0 24px 90px rgba(0,0,0,.65)}.cy-equipment-dialog::backdrop{background:rgba(3,7,24,.78)}.cy-equipment-head{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:14px 16px;border-bottom:1px solid var(--ln)}.cy-equipment-head strong,.cy-equipment-head span{display:block}.cy-equipment-head strong{font-size:18px;color:#fff}.cy-equipment-head span{color:#aebbe3;font-size:13px;margin-top:2px}.cy-equipment-head button{border:0;background:transparent;color:inherit;font-size:20px;cursor:pointer}.cy-equipment-body{padding:14px;overflow:auto;min-height:0}.cy-equipment-viewer{min-width:0}.cy-equipment-info{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:0 20px;margin:14px 0 4px;border-top:1px solid var(--ln)}.cy-equipment-info section{padding:11px 12px 9px 0;border-bottom:1px solid rgba(120,145,190,.2)}.cy-equipment-info h3{margin:0 0 5px;color:#fff;font-size:14px}.cy-equipment-info p{margin:0;color:#c5d0e3;line-height:1.5}.cy-equipment-hse{margin-top:12px;border-top:1px solid var(--ln);padding-top:10px}.cy-equipment-hse li{margin:5px 0}'+
'.cy3c{display:block;width:100%;height:min(46vh,340px);border-radius:10px;touch-action:none;background:#0e1621;cursor:grab}'+
'.cy3cap{position:absolute;left:8px;bottom:8px;max-width:70%;background:rgba(0,0,0,.6);color:#fff;font:600 13px system-ui;padding:4px 9px;border-radius:8px;pointer-events:none}'+
'.cy3bar{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.cy3bar button{background:var(--pn);color:inherit;border:1px solid var(--ln);border-radius:8px;padding:6px 10px;font:600 14px system-ui;cursor:pointer}'+
'.cy3bar button.on{background:var(--ac,#e63946);border-color:var(--ac,#e63946);color:#fff}'+
'#cyai{position:fixed;inset:12px 12px 12px auto;width:min(460px,calc(100vw - 24px));height:auto;max-width:none;max-height:none;margin:0;padding:0;overflow:hidden;border:1px solid #5369c7;border-radius:10px;background:linear-gradient(160deg,#101b35,#111a2d 62%,#171f36);color:var(--text,#edf2ff);box-shadow:0 18px 70px rgba(3,7,24,.52)}#cyai[open]{display:flex;flex-direction:column;animation:cyai-in .18s ease-out}@keyframes cyai-in{from{opacity:.7;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}#cyai::backdrop{background:rgba(3,7,24,.34)}'+
 '#cyai .cyh,#cyai .cym,#cyai .cyc,#cyai .cyattach,#cyai .cyf{position:relative;z-index:1}#cyai .cyh{display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:64px;padding:10px 14px;border-bottom:1px solid rgba(132,153,255,.24);background:rgba(8,14,32,.72)}#cyai .cyidentity{display:grid;gap:2px;min-width:0}#cyai .cyt{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:700 18px "Barlow Condensed",system-ui,sans-serif;color:#fff}#cyai .cy-status{display:flex;align-items:center;gap:6px;color:#b9c5df;font:500 11px system-ui,sans-serif}#cyai .cy-status::before{content:"";width:7px;height:7px;flex:0 0 7px;border-radius:50%;background:#e8b65b}#cyai .cy-status[data-state="online"]::before{background:#57d6a0;box-shadow:0 0 8px rgba(87,214,160,.55)}#cyai .cy-status[data-state="offline"]::before{background:#eb7982}#cyai .cyhead-actions{display:flex;align-items:center;gap:6px}#cyai .cyhead-actions button{display:grid;place-items:center;width:34px;height:34px;padding:0;border:1px solid rgba(153,174,220,.24);border-radius:6px;background:rgba(255,255,255,.04);color:inherit;font-size:18px;cursor:pointer}#cyai .cyhead-actions button:hover{background:rgba(61,169,255,.2);border-color:rgba(61,169,255,.65)}#cyai .cyhead-actions button:disabled{opacity:.45;cursor:default}'+
'#cyai .cym{flex:1;overflow:auto;padding:12px 14px;min-height:0;overscroll-behavior:contain}#cyai .m{margin:8px 0;padding:9px 11px;border-radius:9px;max-width:94%;overflow-wrap:anywhere;line-height:1.5;position:relative;font-size:15px}'+
'#cyai .m.u{margin-left:auto;background:var(--ac,#e63946);color:#fff}#cyai .m.a{background:var(--pn);border:1px solid var(--ln)}#cyai .sp{background:none;border:0;cursor:pointer;margin-left:6px;opacity:.7}'+
'#cyai .cyc{display:flex;flex:0 0 auto;gap:6px;padding:7px 14px;overflow-x:auto;scrollbar-width:thin}#cyai .cyc button{flex:0 0 auto;background:rgba(255,255,255,.04);color:inherit;border:1px solid rgba(153,174,220,.24);border-radius:6px;padding:5px 9px;font:600 12px system-ui;white-space:nowrap;cursor:pointer}'+
'#cyai .cyf{display:flex;flex:0 0 auto;align-items:center;gap:8px;padding:10px 14px;border-top:1px solid rgba(132,153,255,.24);background:rgba(8,14,32,.5)}#cyai .cyq{flex:1;min-width:0;padding:10px;border-radius:7px;border:1px solid var(--ln);background:var(--pn);color:inherit;font:16px system-ui}'+
'#cyai .cyf button{border:0;border-radius:10px;padding:0 16px;background:var(--ac,#e63946);color:#fff;font-size:18px;cursor:pointer}'+
'#cyai .cyattach{display:flex;align-items:center;gap:8px;padding:8px 14px 0;color:#dfe9ff;font-size:12px}#cyai .cyattach[hidden]{display:none}#cyai .cyattach img{width:54px;height:54px;object-fit:cover;border-radius:6px;border:1px solid rgba(255,255,255,.25)}#cyai .cyattach span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:70%}#cyai .cyattach button{margin-left:auto;border:0;background:transparent;color:inherit;font-size:16px;cursor:pointer}'+
'#cyai .img-note{display:flex;flex-direction:column;gap:5px;padding:4px}#cyai .img-note img{display:block;width:min(240px,100%);max-height:220px;object-fit:contain;border-radius:8px;border:1px solid rgba(255,255,255,.2)}#cyai .img-note span{font-size:12px;opacity:.8}'+
'#cyai .drop-ready{outline:2px dashed rgba(61,169,255,.8);outline-offset:-6px;background:rgba(61,169,255,.08)}'+
'#cyai .cyf [data-cx="image"]{padding:0;width:42px;flex:0 0 42px}#cyai .cyq:focus{outline:2px solid var(--blue);outline-offset:1px}#cyai .sp{font-size:13px}'+
'@media(max-width:640px){#cyai{inset:0;width:100vw;height:100dvh;border-radius:0;border-left:0;border-right:0}#cyai .cyh{padding-top:max(10px,env(safe-area-inset-top))}#cyai .cyf{padding-bottom:max(10px,env(safe-area-inset-bottom))}}';
function init(n){const pb=document.getElementById('pbody');if(!pb){if(n<20)setTimeout(()=>init(n+1),300);return}
 const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);initAI();
 const ah=document.querySelector('#prd .ah'),x=ah&&ah.querySelector('.x');if(ah){const b=document.createElement('button');b.className='x';b.title='AI';b.textContent='🤖';b.dataset.cyai='1';b.addEventListener('click',()=>openAI());ah.insertBefore(b,x||null)}
 new MutationObserver(inject).observe(pb,{childList:true});inject()}
window.CY3={SC:SC,R3:R3,ask:ask,localAnswer:localAnswer,open:openAI,openEquipment:openEquipment,equipmentText:equipmentText,attachImage:attachImage,send:send};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>init(0));else init(0);
})();
