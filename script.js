
function cleanFilenamePart(str){
  return String(str || 'creator')
    .trim()
    .replace(/\s+/g,'-')
    .replace(/[^a-zA-Z0-9-_]/g,'')
    .replace(/-+/g,'-')
    .toLowerCase() || 'creator';
}
function popupShow(){
  previewPopup?.classList.add('show');
  previewPopup?.setAttribute('aria-hidden','false');
}
function popupHide(){
  previewPopup?.classList.remove('show');
  previewPopup?.setAttribute('aria-hidden','true');
}

function hexToRgb(hex){
  const value = (hex || '').trim().replace('#','');
  if(!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(value)) return {r:245,g:239,b:233};
  const full = value.length === 3 ? value.split('').map(c=>c+c).join('') : value;
  return {
    r: parseInt(full.slice(0,2),16),
    g: parseInt(full.slice(2,4),16),
    b: parseInt(full.slice(4,6),16),
  };
}
function clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }
function accentPairFromBg(hex){
  const {r,g,b} = hexToRgb(hex);
  const lighter = `rgba(${clamp(r+34,0,255)}, ${clamp(g+34,0,255)}, ${clamp(b+34,0,255)}, 0.98)`;
  const deeper = `rgba(${clamp(r-20,0,255)}, ${clamp(g-8,0,255)}, ${clamp(b+10,0,255)}, 0.94)`;
  return {lighter, deeper};
}


function roundedRectCustomPath(ctx,x,y,w,h,r,tl,tr,br,bl){
  const rr=Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x + (tl ? rr : 0), y);
  ctx.lineTo(x + w - (tr ? rr : 0), y);
  if(tr){ ctx.arcTo(x+w,y,x+w,y+rr,rr); } else { ctx.lineTo(x+w,y); }
  ctx.lineTo(x+w, y+h-(br ? rr : 0));
  if(br){ ctx.arcTo(x+w,y+h,x+w-rr,y+h,rr); } else { ctx.lineTo(x+w,y+h); }
  ctx.lineTo(x+(bl ? rr : 0), y+h);
  if(bl){ ctx.arcTo(x,y+h,x,y+h-rr,rr); } else { ctx.lineTo(x,y+h); }
  ctx.lineTo(x, y+(tl ? rr : 0));
  if(tl){ ctx.arcTo(x,y,x+rr,y,rr); } else { ctx.lineTo(x,y); }
  ctx.closePath();
}

function drawRoundedImageCorners(ctx,img,x,y,w,h,r,tl,tr,br,bl){
  ctx.save();
  roundedRectCustomPath(ctx,x,y,w,h,r,tl,tr,br,bl);
  ctx.clip();

  const imgRatio=img.width/img.height;
  const boxRatio=w/h;
  let drawW, drawH, drawX, drawY;

  if(imgRatio > boxRatio){
    drawH = h;
    drawW = h * imgRatio;
    drawX = x - (drawW - w)/2;
    drawY = y;
  }else{
    drawW = w;
    drawH = w / imgRatio;
    drawX = x;
    drawY = y - (drawH - h)/2;
  }

  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.restore();
}


function roundedRectPath(ctx,x,y,w,h,r){
  const rr=Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x+rr,y);
  ctx.arcTo(x+w,y,x+w,y+h,rr);
  ctx.arcTo(x+w,y+h,x,y+h,rr);
  ctx.arcTo(x,y+h,x,y,rr);
  ctx.arcTo(x,y,x+w,y,rr);
  ctx.closePath();
}

function drawRoundedImageNoFrame(ctx,img,x,y,w,h,r){
  ctx.save();
  roundedRectPath(ctx,x,y,w,h,r);
  ctx.clip();

  const imgRatio=img.width/img.height;
  const boxRatio=w/h;
  let drawW, drawH, drawX, drawY;

  if(imgRatio > boxRatio){
    drawH = h;
    drawW = h * imgRatio;
    drawX = x - (drawW - w)/2;
    drawY = y;
  }else{
    drawW = w;
    drawH = w / imgRatio;
    drawX = x;
    drawY = y - (drawH - h)/2;
  }

  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.restore();
}

const mobileToggle=document.querySelector('.mobile-toggle');
const mobileNav=document.querySelector('.mobile-nav');
mobileToggle?.addEventListener('click',()=>{
  const open=mobileNav.classList.toggle('open');
  mobileToggle.classList.toggle('active');
  mobileToggle.setAttribute('aria-expanded',open?'true':'false');
});
document.querySelectorAll('.mobile-nav a').forEach(link=>{
  link.addEventListener('click',()=>{
    mobileNav.classList.remove('open');
    mobileToggle.classList.remove('active');
    mobileToggle.setAttribute('aria-expanded','false');
  });
});

const addPfpBtn=document.getElementById('addPfpBtn');
const clearPfpBtn=document.getElementById('clearPfpBtn');
const pfpShell=document.getElementById('pfpShell');
const addWorkBtn=document.getElementById('addWorkBtn');
const clearWorkBtn=document.getElementById('clearWorkBtn');
const dropZone=document.getElementById('dropZone');
const uploadStrip=document.getElementById('uploadStrip');
const generateBtn=document.getElementById('generateBtn');
const resetBtn=document.getElementById('resetBtn');
const portfolioShell=document.getElementById('portfolioShell');
const downloadPreviewBtn=document.getElementById('downloadPreviewBtn');
const statusText=document.getElementById('statusText');
const previewPopup=document.getElementById('previewPopup');
const closePopupBtn=document.getElementById('closePopupBtn');
const profileName=document.getElementById('profileName') || document.getElementById('creatorName');
const bgColorPicker=document.getElementById('bgColorPicker');
const bgColorText=document.getElementById('bgColorText');

let workFiles=[];
let thumbUrls=[];
let previewUrls=[];
let pfpFile=null;
let pfpThumbUrl='';
let pfpPreviewUrl='';

function fileKey(file){
  return [file.name,file.size,file.lastModified].join('__');
}
function revoke(url){
  if(url) URL.revokeObjectURL(url);
}
function revokeAll(urls){
  urls.forEach(url=>URL.revokeObjectURL(url));
  urls.length=0;
}
function safeText(str){
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}
function openPicker(multiple,handler){
  const input=document.createElement('input');
  input.type='file';
  input.accept='image/png,image/jpeg,image/jpg,image/webp';
  input.multiple=multiple;
  input.style.display='none';
  input.addEventListener('change',e=>{
    handler(e.target.files);
    input.remove();
  });
  document.body.appendChild(input);
  input.click();
}
function setPfp(files){
  const file=Array.from(files||[])[0];
  if(!file) return;
  pfpFile=file;
  renderPfp();
}
function clearPfp(){
  pfpFile=null;
  revoke(pfpThumbUrl);
  revoke(pfpPreviewUrl);
  pfpThumbUrl='';
  pfpPreviewUrl='';
  pfpShell.innerHTML='<div class="pfp-empty">No profile picture yet.</div>';
}
function renderPfp(){
  revoke(pfpThumbUrl);
  if(!pfpFile){
    pfpShell.innerHTML='<div class="pfp-empty">No profile picture yet.</div>';
    return;
  }
  pfpThumbUrl=URL.createObjectURL(pfpFile);
  pfpShell.innerHTML=`<div class="pfp-preview"><img src="${pfpThumbUrl}" alt="Profile picture" /></div>`;
}
function appendWork(files){
  const incoming=Array.from(files||[]);
  if(!incoming.length) return;
  const seen=new Set(workFiles.map(fileKey));
  incoming.forEach(file=>{
    const key=fileKey(file);
    if(!seen.has(key)){
      workFiles.push(file);
      seen.add(key);
    }
  });
  renderWorkStrip();
}
function moveItem(index,direction){
  const target=index+direction;
  if(target<0 || target>=workFiles.length) return;
  const temp=workFiles[index];
  workFiles[index]=workFiles[target];
  workFiles[target]=temp;
  renderWorkStrip();
}
function renderWorkStrip(){
  revokeAll(thumbUrls);
  if(!workFiles.length){
    uploadStrip.innerHTML='<div class="upload-empty">Your uploaded work will appear here.</div>';
    return;
  }
  thumbUrls=workFiles.map(file=>URL.createObjectURL(file));
  uploadStrip.innerHTML=thumbUrls.map((src,index)=>`
    <div class="thumb-card">
      <img src="${src}" alt="Work preview ${index+1}" />
      <button class="remove-thumb" type="button" data-index="${index}">×</button>
      <button class="move-btn move-up" type="button" data-index="${index}">↑</button>
      <button class="move-btn move-down" type="button" data-index="${index}">↓</button>
    </div>
  `).join('');
  uploadStrip.querySelectorAll('.remove-thumb').forEach(btn=>{
    btn.addEventListener('click',()=>{
      workFiles.splice(Number(btn.dataset.index),1);
      renderWorkStrip();
    });
  });
  uploadStrip.querySelectorAll('.move-up').forEach(btn=>{
    btn.addEventListener('click',()=>moveItem(Number(btn.dataset.index),-1));
  });
  uploadStrip.querySelectorAll('.move-down').forEach(btn=>{
    btn.addEventListener('click',()=>moveItem(Number(btn.dataset.index),1));
  });
}
function currentBgColor(){
  const value=(bgColorText?.value || bgColorPicker?.value || '#ffffff').trim();
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value) ? value : '#ffffff';
}

function buildPortfolio(){
  revokeAll(previewUrls);
  revoke(pfpPreviewUrl);
  previewUrls=workFiles.slice(0,4).map(file=>URL.createObjectURL(file));
  pfpPreviewUrl=pfpFile ? URL.createObjectURL(pfpFile) : '';

  const name='';
  const cards=previewUrls.length
    ? previewUrls.map((src,index)=>`
        <figure class="portfolio-card">
          <img src="${src}" alt="Portfolio work ${index+1}" />
        </figure>
      `).join('')
    : `
      <div class="empty-state">
        <div class="empty-icon"></div>
        <h3>No work added yet.</h3>
        <p>Add some images to generate the portfolio.</p>
      </div>
    `;

  const pfp = pfpPreviewUrl
    ? `<div class="portfolio-pfp"><img src="${pfpPreviewUrl}" alt="Profile picture" /></div>`
    : `<div class="portfolio-pfp"><div class="portfolio-pfp-fallback">P</div></div>`;

  portfolioShell.innerHTML=`
    <div class="portfolio-export" id="exportRoot">
      <div class="portfolio-stage" style="--preview-bg:${currentBgColor()}; --pfp-accent-1:${accentPairFromBg(currentBgColor()).lighter}; --pfp-accent-2:${accentPairFromBg(currentBgColor()).deeper};">
        <div class="portfolio-grid">
          ${cards}
        </div>
        ${pfp}
      </div>
    </div>
  `;
  popupShow();
  setTimeout(()=>popupHide(), 10);
}
function resetAll(){
  workFiles=[];
  revokeAll(thumbUrls);
  revokeAll(previewUrls);
  clearPfp();
  uploadStrip.innerHTML='<div class="upload-empty">Your uploaded work will appear here.</div>';
  portfolioShell.innerHTML=`
    <div class="empty-state">
      <div class="empty-icon"></div>
      <h3>Your portfolio will appear here.</h3>
      <p>Add your profile picture and work to generate the preview.</p>
    </div>
  `;
  statusText.textContent='Generate the preview first, then download it.';
  popupHide();
}

async function downloadPreview(){
  if(!exportRoot){
    statusText.textContent='Generate the preview first, then download it.';
    return;
  }

  statusText.textContent='Preparing image download...';
  popupHide();

  try{
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const canvas = await html2canvas(exportRoot,{
      backgroundColor:null,
      useCORS:true,
      scale:2,
      logging:false,
      removeContainer:true
    });
    const link=document.createElement('a');
    link.href=canvas.toDataURL('image/png');
    link.download='portfolio-preview.png';
    document.body.appendChild(link);
    link.click();
    link.remove();
    statusText.textContent='Downloaded preview image.';
  }catch(err){
    console.error(err);
    statusText.textContent='Download failed. Try again.';
  }
}

function roundedRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.lineTo(x+w-r,y);
  ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);
  ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);
  ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);
  ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
}
function makeCanvas(w,h){
  const canvas=document.createElement('canvas');
  canvas.width=w;
  canvas.height=h;
  return canvas;
}
function triggerDownload(canvas,filename){
  const link=document.createElement('a');
  link.download=filename;
  link.href=canvas.toDataURL('image/png');
  link.click();
}
async function loadImageFromFile(file){
  const src=URL.createObjectURL(file);
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>resolve({img,src});
    img.onerror=reject;
    img.src=src;
  });
}
async function downloadCover(){
  if(!workFiles.length){
    statusText.textContent='Add work first.';
    return;
  }
  statusText.textContent='Preparing cover PNG...';
  const canvas=makeCanvas(1600,1600);
  const ctx=canvas.getContext('2d');

  ctx.fillStyle='#ffffff';
  ctx.fillRect(0,0,1600,1600);

  const name='';
  ctx.fillStyle='#161311';
  ctx.textAlign='center';
  ctx.font='700 48px Arial';
  

  const items=await Promise.all(workFiles.slice(0,4).map(loadImageFromFile));
  const positions=[
    {x:14,y:14,w:779,h:437,r:28},
    {x:807,y:14,w:779,h:437,r:28},
    {x:14,y:465,w:779,h:437,r:28},
    {x:807,y:465,w:779,h:437,r:28}
  ];

  items.forEach((entry,index)=>{
    const p=positions[index];
    if(!p) return;
    roundedRect(ctx,p.x,p.y,p.w,p.h,0);
    ctx.save();
    ctx.clip();
    ctx.fillStyle='#ffffff';
    ctx.fillRect(p.x,p.y,p.w,p.h);
    const scale=Math.max(p.w/entry.img.width,p.h/entry.img.height);
    const dw=entry.img.width*scale;
    const dh=entry.img.height*scale;
    const dx=p.x+(p.w-dw)/2;
    const dy=p.y+(p.h-dh)/2;
    ctx.drawImage(entry.img,dx,dy,dw,dh);
    ctx.restore();
  });

  if(pfpFile){
    const pfp=await loadImageFromFile(pfpFile);
    const centerX=800;
    const centerY=635;
    const size=180;
    const ringGradient = ctx.createLinearGradient(centerX-size, centerY-size, centerX+size, centerY+size);
    ringGradient.addColorStop(0, accent.lighter);
    ringGradient.addColorStop(1, accent.deeper);
    ctx.fillStyle=ringGradient;
    ctx.beginPath();
    ctx.arc(centerX,centerY,size/2+8,0,Math.PI*2);
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX,centerY,size/2,0,Math.PI*2);
    ctx.clip();
    ctx.drawImage(pfp.img,centerX-size/2,centerY-size/2,size,size);
    ctx.restore();
    URL.revokeObjectURL(pfp.src);
  }

  items.forEach(entry=>URL.revokeObjectURL(entry.src));
  triggerDownload(canvas,'premiumportfolios-cover.png');
  statusText.textContent='Cover PNG downloaded.';
}

addPfpBtn.addEventListener('click',()=>openPicker(false,setPfp));
clearPfpBtn.addEventListener('click',clearPfp);
addWorkBtn.addEventListener('click',()=>openPicker(true,appendWork));
clearWorkBtn.addEventListener('click',()=>{
  workFiles=[];
  renderWorkStrip();
});
generateBtn.addEventListener('click',buildPortfolio);
resetBtn.addEventListener('click',resetAll);
downloadPreviewBtn.addEventListener('click',()=>{ popupHide(); downloadPreview(); });

['dragenter','dragover'].forEach(eventName=>{
  dropZone.addEventListener(eventName,e=>{
    e.preventDefault();
    dropZone.classList.add('dragging');
  });
});
['dragleave','drop'].forEach(eventName=>{
  dropZone.addEventListener(eventName,e=>{
    e.preventDefault();
    dropZone.classList.remove('dragging');
  });
});
dropZone.addEventListener('drop',e=>appendWork(e.dataTransfer.files));
dropZone.addEventListener('click',()=>openPicker(true,appendWork));
dropZone.addEventListener('keydown',e=>{
  if(e.key==='Enter' || e.key===' '){
    e.preventDefault();
    openPicker(true,appendWork);
  }
});

function syncBgFromPicker(){
  if(bgColorText && bgColorPicker) bgColorText.value = bgColorPicker.value;
}
function syncBgFromText(){
  const value=(bgColorText?.value || '').trim();
  if(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value) && bgColorPicker){
    bgColorPicker.value = value;
  }
}
bgColorPicker?.addEventListener('input', syncBgFromPicker);
bgColorText?.addEventListener('input', syncBgFromText);

closePopupBtn?.addEventListener('click', popupHide);
previewPopup?.addEventListener('click', (e)=>{
  if(e.target === previewPopup) popupHide();
});
