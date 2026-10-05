const FALLBACK=MwestConfig.defaults;
let configError='';
let cfg=decodeConfig(),place={city:'',state:'',stateLong:'',lat:null,lon:null},weather={temp:null,code:null,unit:null},weatherTimer,weatherRequest=0,weatherController=null;
function normalizeConfig(raw){return MwestConfig.validate(raw)}
function decodeConfig(){try{return MwestConfig.decode(location)}catch{configError='Invalid clock URL — showing a safe fallback.';return normalizeConfig({})}}
function rgba(hex,a){const n=parseInt(hex.slice(1),16);return `rgba(${n>>16},${n>>8&255},${n&255},${a/100})`}
function condition(code){if(code===0)return['☀️','Clear'];if(code<=2)return['🌤️',code===1?'Mostly clear':'Partly cloudy'];if(code===3)return['☁️','Cloudy'];if(code<=48)return['🌫️','Foggy'];if(code<=57)return['🌦️','Drizzle'];if(code<=67)return['🌧️','Rain'];if(code<=77)return['🌨️','Snow'];if(code<=82)return['🌦️','Rain showers'];if(code<=86)return['🌨️','Snow showers'];if(code<=99)return['⛈️','Thunderstorms'];return['🌡️','Weather']}
function formatTime(d){return new Intl.DateTimeFormat(MwestI18n.locale(cfg.language),{hour:'numeric',minute:'2-digit',second:cfg.showSeconds?'2-digit':undefined,hour12:cfg.hour12}).format(d)}
function formatDate(d){if(cfg.legacyDateStyle){const options={compact:{weekday:'short',day:'2-digit',month:'short',year:'2-digit'},short:{month:'short',day:'numeric',year:'numeric'},numeric:{month:'2-digit',day:'2-digit',year:'numeric'},long:{weekday:'long',month:'long',day:'numeric',year:'numeric'}};return new Intl.DateTimeFormat(MwestI18n.locale(cfg.language),options[cfg.dateStyle]).format(d)}const locale=MwestI18n.locale(cfg.language),y=d.getFullYear(),map={YYYY:String(y),YY:String(y).slice(-2),MMMM:new Intl.DateTimeFormat(locale,{month:'long'}).format(d),MMM:new Intl.DateTimeFormat(locale,{month:'short'}).format(d),MM:String(d.getMonth()+1).padStart(2,'0'),M:String(d.getMonth()+1),DD:String(d.getDate()).padStart(2,'0'),D:String(d.getDate()),dddd:new Intl.DateTimeFormat(locale,{weekday:'long'}).format(d),ddd:new Intl.DateTimeFormat(locale,{weekday:'short'}).format(d)};return String(cfg.dateFormat||'ddd DD MMM YY').replace(/YYYY|MMMM|dddd|MMM|ddd|MM|DD|YY|M|D/g,t=>map[t])}
function cityText(){return cfg.cityOverride?.trim()||place.city}
function stateText(){return cfg.stateMode==='long'?place.stateLong:place.state}
function weatherHtml(){if(weather.temp===null||weather.code===null)return'';const [icon,label]=condition(weather.code);const degree=weather.unit==='celsius'?'°C':'°F';const bits=[];if(cfg.weatherIcon)bits.push(`<span class="weather-symbol">${icon}</span>`);bits.push(`${Math.round(weather.temp)}${degree}`);if(cfg.conditionText)bits.push(MwestConfig.escapeText(MwestI18n.weather(cfg.language,label)));return bits.join(' ')}
function applyCustomFont(){let link=document.getElementById('customFontStylesheet'),style=document.getElementById('uploadedFontStyle');const family=MwestConfig.cssString(cfg.customFontName||'Uploaded Font');if(cfg.fontPreset==='custom'&&typeof cfg.customFontData==='string'&&cfg.customFontData.startsWith('data:')){if(link)link.remove();if(!style){style=document.createElement('style');style.id='uploadedFontStyle';document.head.appendChild(style)}style.textContent=`@font-face{font-family:"${family}";src:url("${MwestConfig.cssString(cfg.customFontData)}")}`;return}if(cfg.fontPreset==='custom'&&cfg.customFontFile&&/^fonts\/[A-Za-z0-9._% -]+$/.test(cfg.customFontFile)){if(link)link.remove();if(!style){style=document.createElement('style');style.id='uploadedFontStyle';document.head.appendChild(style)}style.textContent=`@font-face{font-family:"${family}";src:url("${MwestConfig.cssString(cfg.customFontFile)}")}`;return}if(style)style.remove();if(cfg.fontPreset==='custom'&&cfg.customFontUrl){try{const url=new URL(cfg.customFontUrl);if(url.protocol==='https:'||url.protocol==='http:'){if(!link){link=document.createElement('link');link.id='customFontStylesheet';link.rel='stylesheet';document.head.appendChild(link)}if(link.href!==url.href)link.href=url.href}}catch{}}else if(link){link.remove()}}
function itemColor(key){const c=cfg.itemColors?.[key];return c?.enabled&&/^#[0-9a-f]{6}$/i.test(c.color)?c.color:'inherit'}
function render(){document.documentElement.lang=MwestI18n.code(cfg.language);const now=new Date(),content={time:formatTime(now),date:formatDate(now),city:cityText(),state:stateText(),weather:weatherHtml()};const root=document.getElementById('clock');applyCustomFont();Object.keys(cfg.itemColors||{}).forEach(k=>root.style.setProperty('--item-'+k+'-color',itemColor(k)));root.style.gap=cfg.lineGap+'px';root.style.fontFamily=cfg.fontPreset==='custom'&&cfg.customFontName?`"${MwestConfig.cssString(cfg.customFontName)}", sans-serif`:cfg.fontFamily;const sh=cfg.shadow;root.style.textShadow=`${sh.x}px ${sh.y}px ${sh.blur}px ${rgba(sh.color,sh.opacity)}`;root.innerHTML=[1,2,3,4].map((num,i)=>{const keys=cfg.order.filter(k=>cfg.items[k]?.enabled&&Number(cfg.items[k].line)===num&&content[k]!==''&&!((k==='city'||k==='state')&&!String(content[k]).trim()));if(!keys.length)return'';const l=cfg.lines[i];const justify={left:'flex-start',center:'center',right:'flex-end'}[l.align]||'center';return `<div class="clock-line" style="font-size:${l.size}px;font-weight:${l.weight};color:${l.color};opacity:${l.opacity/100};justify-content:${justify};text-transform:${l.transform};letter-spacing:${l.letterSpacing}px">${keys.map(k=>`<span class="clock-item ${k}">${k==='weather'?content[k]:MwestConfig.escapeText(content[k])}</span>`).join(`<span class="separator">${MwestConfig.escapeText(cfg.separator)}</span>`)}</div>`}).join('')}
function weatherKey(config=cfg){return config.zip+'|'+config.unit}
function clearWeather(){place={city:'',state:'',stateLong:'',lat:null,lon:null};weather={temp:null,code:null,unit:null}}
function scheduleWeather(){clearTimeout(weatherTimer);weatherTimer=setTimeout(updateWeather,Math.max(5,Number(cfg.refresh))*60000)}
async function fetchJson(url,signal){const response=await fetch(url,{signal});if(!response.ok)throw Error('Weather request failed');return response.json()}
async function updateWeather(){
 const request=++weatherRequest,snapshot={zip:cfg.zip,unit:cfg.unit};
 if(weatherController)weatherController.abort();weatherController=new AbortController();
 const controller=weatherController,timeout=setTimeout(()=>controller.abort(),12000);
 try{
  const z=await fetchJson(`https://api.zippopotam.us/us/${encodeURIComponent(snapshot.zip)}`,controller.signal),p=z?.places?.[0];
  if(!p)throw Error('ZIP not found');
  const nextPlace={city:String(p['place name']||''),state:String(p['state abbreviation']||''),stateLong:String(p.state||''),lat:Number(p.latitude),lon:Number(p.longitude)};
  if(!Number.isFinite(nextPlace.lat)||!Number.isFinite(nextPlace.lon))throw Error('Invalid location');
  const u=`https://api.open-meteo.com/v1/forecast?latitude=${nextPlace.lat}&longitude=${nextPlace.lon}&current=temperature_2m,weather_code&temperature_unit=${snapshot.unit}&timezone=auto`;
  const data=await fetchJson(u,controller.signal),temp=Number(data?.current?.temperature_2m),code=Number(data?.current?.weather_code);
  if(!Number.isFinite(temp)||!Number.isFinite(code))throw Error('Invalid weather data');
  if(request!==weatherRequest||weatherKey()!==snapshot.zip+'|'+snapshot.unit)return;
  place=nextPlace;weather={temp,code,unit:snapshot.unit};document.getElementById('error').textContent=configError;render();
 }catch(e){
  if(request!==weatherRequest)return;
  clearWeather();document.getElementById('error').textContent=configError||'Weather unavailable — clock is still running.';render();
 }finally{
  clearTimeout(timeout);if(request===weatherRequest){weatherController=null;scheduleWeather()}
 }
}
addEventListener('message',e=>{
 if(window.parent===window||e.origin!==new URL(location.href).origin||e.source!==window.parent||e.data?.type!=='mwest-clock-config')return;
 let next;try{next=normalizeConfig(e.data.config)}catch{return}
 const oldKey=weatherKey();cfg=next;configError='';
 if(weatherKey()!==oldKey){clearWeather();render();updateWeather()}else{render();scheduleWeather()}
});render();if(configError)document.getElementById('error').textContent=configError;updateWeather();setInterval(render,1000);
