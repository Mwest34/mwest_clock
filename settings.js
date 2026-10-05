const DEFAULTS=MwestConfig.defaults;
let hasSavedState=false,loadWarning='',restoreDefaultsRequested=false;
const ITEM_META={time:['◷','time'],date:['▣','date'],city:['⌖','city'],state:['◈','state'],weather:['☀','weather']};
let state=load(),activeLine=0,previewTimer,previewReload=0;
let installedFonts=loadFontCache();
let uploadedFonts=loadUploadedFontLibrary();
restoreSelectedUploadedFont();
let savedState=clone(state),isDirty=false;
const $=id=>document.getElementById(id);
const tr=(key,params={})=>MwestI18n.t(key,state.language,params);
const text=(id,key,params={})=>MwestI18n.bind($(id),key,state.language,params);
const safe=(key,params={})=>MwestConfig.escapeText(tr(key,params));
function clone(x){return JSON.parse(JSON.stringify(x))}
function merge(raw){return MwestConfig.validate(raw)}
function load(){
 try{
  const params=new URLSearchParams(location.search);
  if(params.get('reset')==='1'){restoreDefaultsRequested=true;params.delete('reset');history.replaceState({},'',location.pathname+(params.size?'?'+params:'')+location.hash)}
  const stored=localStorage.getItem('mwestClockSettings');
  if(stored===null)return clone(DEFAULTS);
  const loaded=merge(JSON.parse(stored));hasSavedState=true;return loaded;
 }catch{loadWarning='status.loadFailed';return clone(DEFAULTS)}
}
function encode(obj){const bytes=new TextEncoder().encode(JSON.stringify(obj));let s='';bytes.forEach(b=>s+=String.fromCharCode(b));return btoa(s).replaceAll('+','-').replaceAll('/','_').replaceAll('=','')}
function overlayUrl(config=savedState){const url=new URL('overlay.html',location.href);url.hash='c='+encode(config);return url.href}
function loadFontCache(){try{const list=JSON.parse(localStorage.getItem('mwestInstalledFonts')||'[]');if(!Array.isArray(list))return[];return list.map(f=>typeof f==='string'?f:f?.family).filter(f=>typeof f==='string'&&f.trim())}catch{return[]}}
function loadUploadedFontLibrary(){try{let list=JSON.parse(localStorage.getItem('mwestUploadedFonts')||'[]');if(!Array.isArray(list))list=[];const saved=JSON.parse(localStorage.getItem('mwestClockSettings')||'null');if(saved?.customFontData&&saved?.customFontName&&!list.some(f=>f.family===saved.customFontName)){list.push({family:saved.customFontName,data:saved.customFontData});localStorage.setItem('mwestUploadedFonts',JSON.stringify(list))}return list.filter(f=>f&&f.family&&typeof f.data==='string'&&f.data.startsWith('data:'))}catch{return[]}}
function saveUploadedFontLibrary(){localStorage.setItem('mwestUploadedFonts',JSON.stringify(uploadedFonts))}
function rememberUploadedFont(family,data){const next=uploadedFonts.filter(f=>f.family!==family);next.unshift({family,data});const serialized=JSON.stringify(next);if(serialized.length>2800000)throw Error(tr('status.fontFull'));localStorage.setItem('mwestUploadedFonts',serialized);uploadedFonts=next}
function restoreSelectedUploadedFont(){if(state.customFontName&&!state.customFontData){const saved=uploadedFonts.find(f=>f.family===state.customFontName);if(saved){try{state=merge({...state,customFontData:saved.data,customFontFile:'',fontPreset:'custom'})}catch{}}}}
function syncUploadedFontStyles(){let style=document.getElementById('uploadedFontLibraryStyles');if(!style){style=document.createElement('style');style.id='uploadedFontLibraryStyles';document.head.appendChild(style)}style.textContent=uploadedFonts.map(f=>{const family=f.family.replace(/["'\\]/g,'');return '@font-face{font-family:"'+family+'";src:url("'+f.data+'")}'}).join('\n')}
function renderFontList(filter=''){const box=$('fontList');if(!box)return;const q=filter.trim().toLowerCase(),rows=installedFonts.filter(x=>(x.family||x).toLowerCase().includes(q));box.innerHTML='';if(!rows.length){const empty=document.createElement('div');empty.className='font-empty';MwestI18n.bind(empty,installedFonts.length?'help.fontNoMatch':'help.fontEmpty',state.language);box.appendChild(empty);return}rows.forEach(row=>{const family=row.family||row,b=document.createElement('button');b.type='button';b.textContent=family;b.dataset.fontFamily=family;b.style.fontFamily='"'+family.replaceAll('"','')+'", sans-serif';b.classList.toggle('selected',state.fontPreset==='custom'&&state.customFontName===family);box.appendChild(b)})}
function renderItems(){ $('items').innerHTML=state.order.map((key,index)=>{const [icon,name]=ITEM_META[key],item=tr(name);return `<div class="item-row"><div class="item-icon">${icon}</div><div><div class="item-name">${safe(name)}</div><label class="item-toggle"><input data-item-enabled="${key}" aria-label="${safe(name)}" type="checkbox" ${state.items[key].enabled?'checked':''}><span></span></label></div><select data-item-line="${key}" aria-label="${safe('itemLine',{item})}">${[1,2,3,4].map(n=>`<option value="${n}" ${state.items[key].line===n?'selected':''}>${safe('line',{n})}</option>`).join('')}</select><div class="order-buttons"><button type="button" data-move="-1" data-item-key="${key}" aria-label="${safe('moveUp',{item})}" ${index===0?'disabled':''}>▲</button><button type="button" data-move="1" data-item-key="${key}" aria-label="${safe('moveDown',{item})}" ${index===state.order.length-1?'disabled':''}>▼</button></div></div>`}).join('') }
function renderItemColors(){$('itemColors').innerHTML=state.order.map(key=>{const [icon,name]=ITEM_META[key],c=state.itemColors[key];return `<div class="item-color-row"><div class="item-color-name"><span>${icon}</span><strong>${safe(name)}</strong></div><label class="item-color-toggle"><input data-item-color-enabled="${key}" type="checkbox" ${c.enabled?'checked':''}> ${safe('customColor')}</label><input data-item-color="${key}" type="color" value="${c.color}" aria-label="${safe('itemColor',{item:tr(name)})}" ${c.enabled?'':'disabled'}></div>`}).join('')}
function renderTabs(){ $('lineTabs').innerHTML=[1,2,3,4].map((n,i)=>`<button data-line-tab="${i}" class="${activeLine===i?'active':''}">${safe('line',{n})}</button>`).join('');renderLineStyle() }
function renderLineStyle(){const l=state.lines[activeLine];$('lineStyle').innerHTML=`<div class="line-style-grid"><label>${safe('fontSize')} <span>${l.size}px</span><input data-line-prop="size" type="range" min="12" max="180" value="${l.size}"></label><label>${safe('weight')}<select data-line-prop="weight">${[300,400,500,600,700,800,900].map(v=>`<option ${l.weight==v?'selected':''} value="${v}">${v}</option>`).join('')}</select></label><label>${safe('color')}<input data-line-prop="color" type="color" value="${l.color}"></label><label>${safe('opacity')} <span>${l.opacity}%</span><input data-line-prop="opacity" type="range" min="0" max="100" value="${l.opacity}"></label><label>${safe('alignment')}<select data-line-prop="align"><option value="left" ${l.align==='left'?'selected':''}>${safe('alignLeft')}</option><option value="center" ${l.align==='center'?'selected':''}>${safe('alignCenter')}</option><option value="right" ${l.align==='right'?'selected':''}>${safe('alignRight')}</option></select></label><label>${safe('transform')}<select data-line-prop="transform"><option value="none" ${l.transform==='none'?'selected':''}>${safe('normal')}</option><option value="uppercase" ${l.transform==='uppercase'?'selected':''}>${safe('uppercase')}</option><option value="lowercase" ${l.transform==='lowercase'?'selected':''}>${safe('lowercase')}</option></select></label><label class="full">${safe('spacing')} <span>${l.letterSpacing}px</span><input data-line-prop="letterSpacing" type="range" min="-3" max="20" value="${l.letterSpacing}"></label></div>`}
function applyUiLanguage(){MwestI18n.translatePage(state.language)}
function updateFontPanels(){$('customFontWrap').classList.toggle('hidden',state.fontPreset!=='custom');$('presetFontWrap').classList.toggle('hidden',state.fontPreset==='custom')}
function hydrate(){renderItems();renderItemColors();renderTabs();['language','zip','cityOverride','stateMode','locationFormat','unit','dateFormat','separator','fontPreset','fontFamily','customFontName','customFontUrl'].forEach(id=>$(id).value=state[id]);$('refresh').value=String(state.refresh);$('hour12').value=String(state.hour12);['showSeconds','weatherIcon','conditionText'].forEach(id=>$(id).checked=state[id]);$('lineGap').value=state.lineGap;['shadowColor'].forEach(id=>$(id).value=state.shadow[id.replace('shadow','').toLowerCase()]);['shadowOpacity','shadowX','shadowY','shadowBlur'].forEach(id=>$(id).value=state.shadow[id.slice(6).toLowerCase()]);text('fontUploadStatus',(state.customFontFile||state.customFontData)?'status.fontLoaded':'status.fontNone',{font:state.customFontName||tr('fontSetup')});$('removeUploadedFont').classList.toggle('hidden',!(state.customFontFile||state.customFontData));renderFontList($('fontSearch')?.value||'');updateFontPanels();outputs();applyUiLanguage()}
function outputs(){ $('lineGapOut').textContent=state.lineGap+'px';['Opacity','X','Y','Blur'].forEach(k=>$("shadow"+k+"Out").textContent=state.shadow[k.toLowerCase()]+(k==='Opacity'?'%':'px')) }
function sendPreview(config){$('preview').contentWindow?.postMessage({type:'mwest-clock-config',config},new URL('overlay.html',location.href).origin)}
function syncPreview(config,reload=false){
 clearTimeout(previewTimer);previewTimer=undefined;
 const url=new URL(overlayUrl(config));
 // A distinct document URL reloads the preview even when the configuration is unchanged.
 if(reload)url.searchParams.set('recovery',String(++previewReload));
 $('preview').src=url.href;
 sendPreview(config);
}
function commitSettings(){
 try{
  const next=merge(state);
  localStorage.setItem('mwestClockSettings',JSON.stringify(next));
  savedState=clone(next);state=clone(next);hasSavedState=true;isDirty=false;
  syncPreview(savedState);
  text('copyStatus','status.saveSuccess');
  text('saveBtn','status.saved');setTimeout(()=>text('saveBtn','save'),1500);
 }catch(err){text('copyStatus','status.saveFailed')}
}
function restoreDefaults(){
 const defaults=merge(DEFAULTS);
 clearTimeout(previewTimer);previewTimer=undefined;
 state=defaults;isDirty=true;activeLine=0;$('fontSearch').value='';
 document.querySelectorAll('.mode').forEach(b=>b.classList.toggle('active',b.dataset.preset==='stacked'));
 hydrate();syncPreview(state,true);
 text('weatherStatus','status.defaultsLoaded');text('copyStatus','status.defaultsLoaded');
}
function save(){isDirty=true;text('copyStatus','status.dirty');outputs();clearTimeout(previewTimer);previewTimer=setTimeout(()=>{previewTimer=undefined;const frame=$('preview');if(!frame.src)frame.src=overlayUrl(state);else sendPreview(state)},80)}
function setPreset(name){document.querySelectorAll('.mode').forEach(b=>b.classList.toggle('active',b.dataset.preset===name));if(name==='single'){Object.values(state.items).forEach(x=>{if(x.enabled)x.line=1})}if(name==='stacked'){state.items.time.line=1;['date','city','state','weather'].forEach(k=>state.items[k].line=2)}if(name==='three'){state.items.time.line=1;state.items.date.line=2;['city','state','weather'].forEach(k=>state.items[k].line=3)}if(name==='four'){state.items.time.line=1;state.items.date.line=2;state.items.city.line=3;state.items.state.line=3;state.items.weather.line=4}renderItems();save()}
document.addEventListener('input',e=>{const t=e.target;if(t.id==='importFile')return;if(t.dataset.itemColorEnabled){state.itemColors[t.dataset.itemColorEnabled].enabled=t.checked;renderItemColors();applyUiLanguage();save();return}if(t.dataset.itemColor){state.itemColors[t.dataset.itemColor].color=t.value;save();return}if(t.dataset.itemEnabled){state.items[t.dataset.itemEnabled].enabled=t.checked;save();return}if(t.dataset.itemLine){state.items[t.dataset.itemLine].line=Number(t.value);save();return}if(t.dataset.lineProp){let v=t.value;if(['size','weight','opacity','letterSpacing'].includes(t.dataset.lineProp))v=Number(v);state.lines[activeLine][t.dataset.lineProp]=v;if(t.type==='range'&&t.previousElementSibling)t.previousElementSibling.textContent=v+(t.dataset.lineProp==='opacity'?'%':'px');save();return}const id=t.id;if(['showSeconds','weatherIcon','conditionText'].includes(id))state[id]=t.checked;else if(id==='hour12')state[id]=t.value==='true';else if(id==='refresh'||id==='lineGap')state[id]=Number(t.value);else if(id.startsWith('shadow'))state.shadow[id.slice(6).toLowerCase()]=id==='shadowColor'?t.value:Number(t.value);else if(id in state)state[id]=t.value;if(id==='dateFormat')state.legacyDateStyle=false;if(id==='fontPreset')updateFontPanels();if(id==='language'){renderItems();renderItemColors();renderTabs();renderFontList($('fontSearch').value);applyUiLanguage();save();clearTimeout(previewTimer);previewTimer=undefined;sendPreview(state);return}save()});
document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.preset){setPreset(b.dataset.preset);return}if(b.dataset.lineTab){activeLine=Number(b.dataset.lineTab);renderTabs();return}if(b.dataset.size){document.querySelectorAll('[data-size]').forEach(x=>x.classList.toggle('active',x===b));$('previewFrame').className='preview-frame '+b.dataset.size;return}if(b.id==='saveBtn'){commitSettings();return}if(b.id==='copyUrl'){if(isDirty){text('copyStatus','status.copyBlocked');return}try{await navigator.clipboard.writeText(overlayUrl(savedState));text('copyUrl','status.copySuccess');setTimeout(()=>text('copyUrl','copy'),1800)}catch{prompt(tr('status.copyPrompt'),overlayUrl(savedState))}return}if(b.id==='resetBtn'){if(confirm(tr('status.defaultsConfirm')))restoreDefaults();return}if(b.id==='exportBtn'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));a.download='mwest-clock-settings.json';a.click();URL.revokeObjectURL(a.href);text('copyStatus','status.exportSuccess')}if(b.id==='testLocation'){testWeather()}});
$('items').addEventListener('click',e=>{const b=e.target.closest('[data-move]');if(!b)return;const from=state.order.indexOf(b.dataset.itemKey),to=from+Number(b.dataset.move);if(from<0||to<0||to>=state.order.length)return;[state.order[from],state.order[to]]=[state.order[to],state.order[from]];renderItems();renderItemColors();applyUiLanguage();save()});
$('locationFormat').addEventListener('change',e=>{state.items.city.enabled=e.target.value!=='state';state.items.state.enabled=e.target.value!=='city';renderItems()});
$('fontSearch').addEventListener('input',e=>renderFontList(e.target.value));
$('scanFonts').addEventListener('click',async()=>{if(!('queryLocalFonts' in window)){text('fontScanStatus','status.fontUnsupported');return}text('fontScanStatus','status.fontWaiting');try{const faces=await window.queryLocalFonts();installedFonts=[...new Set(faces.map(f=>f.family).filter(Boolean))].sort((a,b)=>a.localeCompare(b));localStorage.setItem('mwestInstalledFonts',JSON.stringify(installedFonts));renderFontList($('fontSearch').value);text('fontScanStatus','status.fontFound',{count:installedFonts.length})}catch(err){text('fontScanStatus',err.name==='NotAllowedError'?'status.fontDenied':'status.fontFailed',{error:{key:'help.fontPermission'}})}});
$('fontList').addEventListener('click',e=>{const b=e.target.closest('[data-font-family]');if(!b)return;state.fontPreset='custom';state.customFontName=b.dataset.fontFamily;state.customFontFile='';state.customFontData='';state.customFontUrl='';hydrate();save();text('fontScanStatus','status.fontSelected',{font:b.dataset.fontFamily})});
$('importFile').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{
  const candidate=merge(JSON.parse(await file.text()));
  clearTimeout(previewTimer);state=candidate;hydrate();save();
  text('weatherStatus','status.importSuccess');
 }catch{text('weatherStatus','status.importFailed')}
 e.target.value='';
});

async function testWeather(){text('weatherStatus','status.checking');try{const z=await fetch(`https://api.zippopotam.us/us/${state.zip}`).then(r=>{if(!r.ok)throw Error('ZIP not found');return r.json()});const p=z.places[0];const url=`https://api.open-meteo.com/v1/forecast?latitude=${p.latitude}&longitude=${p.longitude}&current=temperature_2m,weather_code&temperature_unit=${state.unit}&timezone=auto`;const w=await fetch(url).then(r=>r.json());text('weatherStatus','status.connected',{city:p['place name'],state:p['state abbreviation'],temperature:Math.round(w.current.temperature_2m)+w.current_units.temperature_2m})}catch(err){text('weatherStatus','status.weatherFailed',{error:{key:'status.weatherUnavailable'}})}}
hydrate();$('preview').addEventListener('load',()=>sendPreview(state));if(restoreDefaultsRequested)restoreDefaults();else{$('preview').src=overlayUrl();if(loadWarning)text('copyStatus',loadWarning)}testWeather();

