(function(){
'use strict';
const defaults={version:7,language:'auto',zip:'90061',cityOverride:'',stateMode:'short',locationFormat:'cityState',unit:'fahrenheit',refresh:30,hour12:true,showSeconds:true,dateStyle:'compact',dateFormat:'ddd DD MMM YY',weatherIcon:true,conditionText:true,separator:'  •  ',lineGap:8,fontPreset:'preset',fontFamily:'Arial, sans-serif',customFontName:'',customFontUrl:'',customFontFile:'',customFontData:'',order:['time','date','city','state','weather'],shadow:{color:'#000000',opacity:80,x:3,y:3,blur:10},items:{time:{enabled:true,line:1},date:{enabled:true,line:2},city:{enabled:true,line:2},state:{enabled:true,line:2},weather:{enabled:true,line:2}},itemColors:{time:{enabled:false,color:'#ffffff'},date:{enabled:false,color:'#285cff'},city:{enabled:false,color:'#35e2ca'},state:{enabled:false,color:'#35e2ca'},weather:{enabled:false,color:'#7cff00'}},lines:[{size:64,weight:900,color:'#ffffff',opacity:100,align:'center',transform:'none',letterSpacing:1},{size:34,weight:600,color:'#ffffff',opacity:92,align:'center',transform:'uppercase',letterSpacing:2},{size:30,weight:600,color:'#35e2ca',opacity:100,align:'center',transform:'none',letterSpacing:1},{size:28,weight:500,color:'#f34acb',opacity:100,align:'center',transform:'none',letterSpacing:1}]};
const keys=['time','date','city','state','weather'];
const own=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
function invalid(field){throw new Error('Invalid clock configuration: '+field)}
function record(value,field){
 if(!value||typeof value!=='object'||Array.isArray(value))invalid(field+' must be an object');
 if(Object.keys(value).some(k=>['__proto__','prototype','constructor'].includes(k)))invalid(field+' contains an unsafe key');
 return value;
}
function text(value,field){if(typeof value!=='string')invalid(field+' must be text');return value}
function boolean(value,field){
 if(value===true||value===false)return value;
 // Older exports sometimes serialized form values as strings.
 if(value==='true')return true;if(value==='false')return false;
 invalid(field+' must be true or false');
}
function number(value,field,min,max){
 if(typeof value==='string'&&/^-?\d+(?:\.\d+)?$/.test(value))value=Number(value);
 if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max)invalid(field+' is outside its supported range');
 return value;
}
function choice(value,field,values){if(!values.includes(value))invalid(field+' is unsupported');return value}
function color(value,field){
 text(value,field);
 if(/^#[0-9a-f]{3}$/i.test(value))value='#'+value.slice(1).split('').map(c=>c+c).join('');
 if(!/^#[0-9a-f]{6}$/i.test(value))invalid(field+' must be a hex color');
 return value;
}
function alignment(value){
 const legacy={izquierda:'left',centro:'center',derecha:'right',gauche:'left',centre:'center',droite:'right'};
 return choice(legacy[value]||value,'alignment',['left','center','right']);
}
function clone(value){return JSON.parse(JSON.stringify(value))}
function validate(raw){
 record(raw,'configuration');
 const out=clone(defaults);
 if(own(raw,'version')){out.version=number(raw.version,'version',0,7);if(!Number.isInteger(out.version))invalid('version must be an integer')}
 for(const key of ['zip','cityOverride','dateFormat','separator','fontFamily','customFontName','customFontUrl','customFontFile','customFontData']){
  if(own(raw,key))out[key]=text(raw[key],key);
 }
 if(own(raw,'language')){
  const lang=text(raw.language,'language');
  if(lang!=='auto'){try{Intl.getCanonicalLocales(lang)}catch{invalid('language is not a valid locale')}}
  out.language=lang;
 }
 for(const key of ['hour12','showSeconds','weatherIcon','conditionText']){
  if(own(raw,key))out[key]=boolean(raw[key],key);
 }
 const choices={stateMode:['short','long'],locationFormat:['cityState','city','state'],unit:['fahrenheit','celsius'],fontPreset:['preset','custom'],dateStyle:['compact','short','numeric','long','full']};
 for(const [key,values] of Object.entries(choices)){if(own(raw,key))out[key]=choice(raw[key],key,values)}
 if(out.dateStyle==='full')out.dateStyle='long';
 if(own(raw,'refresh'))out.refresh=number(raw.refresh,'refresh',5,1440);
 if(own(raw,'lineGap'))out.lineGap=number(raw.lineGap,'lineGap',0,50);
 if(own(raw,'shadow')){
  const s=record(raw.shadow,'shadow');
  if(own(s,'color'))out.shadow.color=color(s.color,'shadow.color');
  for(const [key,min,max] of [['opacity',0,100],['x',-20,20],['y',-20,20],['blur',0,40]]){
   if(own(s,key))out.shadow[key]=number(s[key],'shadow.'+key,min,max);
  }
 }
 const items=own(raw,'items')?record(raw.items,'items'):{};
 for(const key of Object.keys(items)){if(!keys.includes(key)&&key!=='location')invalid('unknown item '+key)}
 function readItem(value,key){
  const item=record(value,'items.'+key),result=clone(out.items[key==='location'?'city':key]);
  if(own(item,'enabled'))result.enabled=boolean(item.enabled,'items.'+key+'.enabled');
  if(own(item,'line')){result.line=number(item.line,'items.'+key+'.line',1,4);if(!Number.isInteger(result.line))invalid('item line must be an integer')}
  return result;
 }
 // The original location item became independently configurable city/state items.
 if(own(items,'location')){
  const location=readItem(items.location,'location');
  if(!own(items,'city'))out.items.city=clone(location);
  if(!own(items,'state'))out.items.state=clone(location);
 }
 for(const key of keys){if(own(items,key))out.items[key]=readItem(items[key],key)}
 if(own(raw,'locationFormat')&&!own(items,'location')){
  if(!own(items,'city'))out.items.city.enabled=out.locationFormat!=='state';
  if(!own(items,'state'))out.items.state.enabled=out.locationFormat!=='city';
 }
 if(own(raw,'itemColors')){
  const colors=record(raw.itemColors,'itemColors');
  for(const key of Object.keys(colors)){if(!keys.includes(key))invalid('unknown item color '+key)}
  for(const key of keys){
   if(!own(colors,key))continue;
   const item=record(colors[key],'itemColors.'+key);
   if(own(item,'enabled'))out.itemColors[key].enabled=boolean(item.enabled,'itemColors.'+key+'.enabled');
   if(own(item,'color'))out.itemColors[key].color=color(item.color,'itemColors.'+key+'.color');
  }
 }
 if(own(raw,'order')){
  if(!Array.isArray(raw.order))invalid('order must be an array');
  const order=[];
  for(const key of raw.order){
   if(!keys.includes(key)&&key!=='location')invalid('unknown order item '+key);
   for(const migrated of key==='location'?['city','state']:[key]){if(!order.includes(migrated))order.push(migrated)}
  }
  out.order=order;
  for(const key of keys){if(!out.order.includes(key))out.order.push(key)}
 }
 if(own(raw,'lines')){
  if(!Array.isArray(raw.lines)||raw.lines.length>4)invalid('lines must contain up to four line styles');
  raw.lines.forEach((value,index)=>{
   const line=record(value,'lines.'+index),result=out.lines[index];
   for(const [key,min,max] of [['size',12,180],['weight',100,1000],['opacity',0,100],['letterSpacing',-3,20]]){
    if(own(line,key))result[key]=number(line[key],'lines.'+index+'.'+key,min,max);
   }
   if(own(line,'color'))result.color=color(line.color,'lines.'+index+'.color');
   if(own(line,'align'))result.align=alignment(line.align);
   if(own(line,'transform'))result.transform=choice(line.transform,'text transform',['none','uppercase','lowercase']);
  });
 }
 // Keep the exact Intl formatting of dateStyle-only URLs, not an approximate token replacement.
 out.legacyDateStyle=own(raw,'legacyDateStyle')?boolean(raw.legacyDateStyle,'legacyDateStyle'):own(raw,'dateStyle')&&!own(raw,'dateFormat');
 if(out.legacyDateStyle){
  out.dateFormat={compact:'ddd DD MMM YY',short:'MMM D, YYYY',numeric:'MM/DD/YYYY',long:'dddd, MMMM D, YYYY'}[out.dateStyle];
 }
 if(out.customFontUrl){
  let url;try{url=new URL(out.customFontUrl)}catch{invalid('customFontUrl must be an absolute URL')}
  if(!['https:','http:'].includes(url.protocol))invalid('customFontUrl must use HTTP or HTTPS');
  out.customFontUrl=url.href;
 }
 if(out.customFontFile&&!/^fonts\/[A-Za-z0-9._% -]+$/.test(out.customFontFile))invalid('customFontFile must be a legacy fonts/ path');
 if(out.customFontData&&!/^data:[a-z0-9.+/-]*(?:;[a-z0-9=.+-]+)*;base64,[a-z0-9+/]*={0,2}$/i.test(out.customFontData))invalid('customFontData must be a base64 font data URL');
 return out;
}
function decode(location){
 const encoded=new URLSearchParams(location.hash.slice(1)).get('c')||new URLSearchParams(location.search).get('c');
 if(!encoded)return validate({});
 let base64=encoded.replaceAll('-','+').replaceAll('_','/');
 if(!/^[A-Za-z0-9+/]*={0,2}$/.test(base64))invalid('URL encoding');
 while(base64.length%4)base64+='=';
 const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
 return validate(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)));
}
function escapeText(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function cssString(value){return String(value).replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/[\n\r\f]/g,c=>'\\'+c.charCodeAt(0).toString(16)+' ')}
function freeze(value){Object.freeze(value);for(const child of Object.values(value)){if(child&&typeof child==='object')freeze(child)}}
freeze(defaults);
window.MwestConfig={defaults,validate,decode,clone,escapeText,cssString};
})();
