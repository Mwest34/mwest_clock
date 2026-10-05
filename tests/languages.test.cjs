const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {context,encode,settle,source,root}=require('./helpers.cjs');
const supported=['en','ar','bg','zh-CN','zh-TW','cs','da','nl','fi','fr','de','el','he','hi','hu','id','it','ja','ko','nb','pl','pt','ro','ru','sk','es','sv','th','tr','uk','vi'];
const weatherCodes=[0,1,2,3,45,51,61,71,80,85,95,100];
const placeholders=s=>[...s.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort();
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
// Mount the real HTML's keyed controls in the lightweight DOM harness. Browser
// verification additionally exercises native selects, layout, and the iframe.
function mount(c){
 const nodes=[];
 for(const match of html.matchAll(/<([\w-]+)\b([^>]*)>/g)){
  const attrs=Object.fromEntries([...match[2].matchAll(/([\w-]+)=(?:"([^"]*)"|'([^']*)')/g)].map(m=>[m[1],m[2]??m[3]]));
  if(!Object.keys(attrs).some(k=>k.startsWith('data-i18n')))continue;
  const el=attrs.id?c.doc.getElementById(attrs.id):c.doc.createElement(match[1]);
  for(const [key,value] of Object.entries(attrs)){if(key==='data-i18n')el.dataset.i18n=value;else if(key==='data-i18n-params')el.dataset.i18nParams=value;else el.setAttribute(key,value)}
  nodes.push(el);
 }
 const options=supported.concat('auto').map(value=>({value,textContent:''}));
 const original=c.doc.querySelectorAll.bind(c.doc);
 c.doc.querySelectorAll=selector=>selector==='#language option'?options:selector==='[data-i18n]'?[...new Set([...nodes.filter(n=>n.dataset.i18n),...original(selector)])]:selector.startsWith('[data-i18n-')?nodes.filter(n=>n.getAttribute(selector.slice(1,-1))!==null):original(selector);
 c.run('applyUiLanguage()');return {nodes,options};
}
test('catalogs contain all stable keys, translated names and matching parameter sets',()=>{
 const c=context(),catalogs=c.env.MwestI18n.dictionaries,keys=Object.keys(catalogs.en).sort();
 assert.deepEqual([...c.env.MwestI18n.supported],supported);assert.equal(keys.length,176);
 for(const language of supported){assert.deepEqual(Object.keys(catalogs[language]).sort(),keys,language);for(const key of keys){const value=catalogs[language][key];assert.equal(typeof value,'string');assert.ok(value.trim(),language+':'+key);assert.doesNotMatch(value,/undefined|null/);assert.deepEqual(placeholders(value),placeholders(catalogs.en[key]),language+':'+key);assert.equal(c.env.MwestI18n.t(key,language),value)}}
});
test('every marked static label, option, help and accessible attribute uses a known stable key',()=>{
 const c=context();const keys=[...html.matchAll(/data-i18n(?:-placeholder|-aria-label|-title)?="([^"]+)"/g)].map(m=>m[1]);
 assert.ok(keys.length>70);for(const key of keys)assert.ok(Object.hasOwn(c.env.MwestI18n.dictionaries.en,key),key);
 assert.doesNotMatch(html,/<summary>(?:WEATHER|FONT|LINE)/);
 assert.ok(source.settings.includes("tr('status.defaultsConfirm')"));assert.doesNotMatch(source.settings,/MwestI18n\.t\('[A-Z ]+'/);
});
test('genuinely missing keys use English; unknown keys remain diagnostic text',()=>{
 const c=context();delete c.env.MwestI18n.dictionaries.de.save;assert.equal(c.env.MwestI18n.t('save','de'),'SAVE SETTINGS');assert.equal(c.env.MwestI18n.t('save','unsupported'),'SAVE SETTINGS');assert.equal(c.env.MwestI18n.t('missing.key','de'),'missing.key');assert.equal(c.env.MwestI18n.t('constructor','de'),'constructor');
});
test('Automatic matches base, regional, script and preferred supported languages',()=>{
 for(const [preferred,expected] of [['es-MX','es'],['fr-CA','fr'],['pt-BR','pt'],['en-GB','en'],['de-AT','de'],['ar-EG','ar'],['he-IL','he'],['nb-NO','nb'],['no-NO','nb'],['zh-CN','zh-CN'],['zh-SG','zh-CN'],['zh-Hans','zh-CN'],['zh-TW','zh-TW'],['zh-HK','zh-TW'],['zh-Hant-TW','zh-TW'],['unsupported','en']]){const c=context('settings',{}, {language:preferred});assert.equal(c.env.MwestI18n.code('auto'),expected,preferred);assert.equal(c.doc.documentElement.lang,expected);const o=context('overlay',{}, {language:preferred});assert.equal(o.doc.documentElement.lang,expected)}
 const c=context('settings',{}, {languages:['xx-XX','fr-CA','de-DE']});assert.equal(c.env.MwestI18n.code('auto'),'fr');assert.equal(c.env.MwestI18n.locale('auto'),'fr-CA');
});
test('regional Automatic date and time locale is preserved and manual/Automatic switches immediately',async()=>{
 const c=context('settings',{}, {languages:['es-MX']});mount(c);await c.input('language','ja');assert.equal(c.doc.documentElement.lang,'ja');await c.input('language','auto');assert.equal(c.doc.documentElement.lang,'es');assert.equal(c.env.MwestI18n.locale('auto'),'es-MX');assert.equal(c.doc.getElementById('preview').message.config.language,'auto');assert.equal(c.timers.size,0);
});
test('language names use Intl.DisplayNames and translated fallback without changing option values',()=>{
 const c=context();for(const language of supported)for(const value of supported){const name=c.env.MwestI18n.languageName(value,language);assert.ok(name&&name!==value);}
 const original=Intl.DisplayNames;c.run('Intl.DisplayNames=undefined');try{for(const language of supported)for(const value of supported)assert.equal(c.env.MwestI18n.languageName(value,language),c.env.MwestI18n.t('names.'+value,language))}finally{Intl.DisplayNames=original}
});
for(const language of supported)test(language+': complete UI, immediate preview, weather, actions and compatible saved URLs',async()=>{
 const raw={language:'en',refresh:15,zip:'90061',unit:'fahrenheit',cityOverride:'東京 العربية <Town>',fontPreset:'custom',customFontName:'Existing Font',separator:' <&> ',lines:[{align:'right',color:'#ff8800',size:85}],order:['weather','city','state','date','time'],dateFormat:'dddd, MMMM D, YYYY',hour12:false};
 const stored=JSON.stringify(raw),c=context('settings',{mwestClockSettings:stored});assert.equal(c.error,undefined);const mounted=mount(c);
 await c.input('language',language);assert.equal(c.doc.documentElement.lang,language);assert.equal(c.doc.documentElement.dir,['ar','he'].includes(language)?'rtl':'ltr');assert.equal(c.doc.getElementById('preview').message.config.language,language);assert.equal([...c.timers.values()].filter(t=>t.ms===80).length,0);assert.equal(c.storage.get('mwestClockSettings'),stored);
 for(const node of mounted.nodes){if(node.dataset.i18n){const params=JSON.parse(node.dataset.i18nParams||'{}');assert.equal(node.textContent,c.env.MwestI18n.t(node.dataset.i18n,language,params));assert.doesNotMatch(node.textContent,/undefined|\{\w+\}/)}}
 for(const value of supported.concat('auto'))assert.ok(mounted.options.find(o=>o.value===value).textContent);
 assert.match(c.doc.getElementById('lineStyle').innerHTML,/<option value="left"/);assert.match(c.doc.getElementById('lineStyle').innerHTML,/<option value="center"/);assert.match(c.doc.getElementById('lineStyle').innerHTML,/<option value="right" selected>/);assert.match(c.doc.getElementById('lineStyle').innerHTML,/value="uppercase"/);assert.equal(c.run('state.lines[0].align'),'right');
 await c.click('copyUrl');assert.equal(c.copied(),'');await c.click('saveBtn');await c.click('copyUrl');const url=new URL(c.copied());assert.equal(url.hash.startsWith('#c='),true);assert.equal(c.run('savedState.language'),language);
 for(const options of [{hash:url.hash},{search:'?c='+url.hash.slice(3)}]){const o=context('overlay',{},options);assert.equal(o.error,undefined);assert.equal(o.run('cfg.language'),language);assert.equal(o.run('cfg.customFontName'),'Existing Font');assert.equal(o.run('cfg.refresh'),15);assert.equal(o.doc.getElementById('clock').style.direction,'ltr');assert.match(o.doc.getElementById('clock').innerHTML,/justify-content:flex-end/);assert.match(o.doc.getElementById('clock').innerHTML,/&lt;Town&gt;/);
  const fixed=new Date(2026,9,5,21,8,7);o.env.fixed=fixed;const expected=new Intl.DateTimeFormat(language,{hour:'numeric',minute:'2-digit',second:'2-digit',hour12:false}).format(fixed);assert.equal(o.run('formatTime(fixed)'),expected);assert.equal(o.run('formatDate(fixed)'),new Intl.DateTimeFormat(language,{weekday:'long'}).format(fixed)+', '+new Intl.DateTimeFormat(language,{month:'long'}).format(fixed)+' 5, 2026');
  for(const code of weatherCodes){o.run(`weather={temp:72,code:${code},unit:'fahrenheit'}`);const condition=o.run(`condition(${code})[1]`),label=o.env.MwestI18n.weather(language,condition);assert.equal(label,o.env.MwestI18n.dictionaries[language]['weather.'+condition]);assert.ok(label);assert.ok(o.run('weatherHtml()').includes(label));}
  o.run("weather={temp:22,code:0,unit:'celsius'};render()");assert.match(o.doc.getElementById('clock').innerHTML,/22°C/);
 }
 let parts;c.env.Blob=class extends Blob{constructor(p,options){super(p,options);parts=p}};await c.click('exportBtn');assert.equal(JSON.parse(parts[0]).language,language);const before=c.json('state');await c.import('{invalid');assert.deepEqual(c.json('state'),before);await c.import(JSON.parse(parts[0]));assert.equal(c.run('state.language'),language);
 const saved=c.storage.get('mwestClockSettings');await c.click('resetBtn');assert.deepEqual(c.json('state'),c.json('merge(DEFAULTS)'));assert.equal(c.storage.get('mwestClockSettings'),saved);await c.click('copyUrl');assert.equal(c.storage.get('mwestClockSettings'),saved);const refresh=context('settings',Object.fromEntries(c.storage));assert.equal(refresh.run('state.language'),language);await c.click('saveBtn');assert.equal(JSON.parse(c.storage.get('mwestClockSettings')).refresh,30);
});
test('translated strings, attribute labels and API/user text cannot inject HTML',async()=>{
 const c=context();c.env.MwestI18n.dictionaries.ar.time='<img src=x onerror=alert(1)>"';await c.input('language','ar');assert.match(c.doc.getElementById('items').innerHTML,/&lt;img/);assert.match(c.doc.getElementById('items').innerHTML,/&quot;/);assert.doesNotMatch(c.doc.getElementById('items').innerHTML,/<img/);
 const o=context('overlay',{}, {hash:'#c='+encode({language:'ar',cityOverride:'<script>evil</script>',separator:'<img>'})});o.env.MwestI18n.dictionaries.ar['weather.clear']='<img src=x onerror=evil>';o.run("weather={temp:80,code:0,unit:'fahrenheit'};render()");const rendered=o.doc.getElementById('clock').innerHTML;assert.doesNotMatch(rendered,/<img|<script>/);assert.match(rendered,/&lt;img/);assert.match(rendered,/weather-symbol/);
});
test('dynamic status messages retranslate on switching, including weather errors',async()=>{
 const c=context('settings',{}, {fetch:async()=>{throw Error('Network failure')}});mount(c);await settle();await c.input('language','ja');assert.ok(c.doc.getElementById('weatherStatus').textContent.includes(c.env.MwestI18n.t('status.weatherUnavailable','ja')));assert.doesNotMatch(c.doc.getElementById('weatherStatus').textContent,/Network failure/);
 const o=context('overlay',{}, {fetch:async()=>{throw Error('Network failure')}});await settle();o.message({...o.json('cfg'),language:'he'});assert.equal(o.doc.getElementById('error').textContent,o.env.MwestI18n.t('status.weatherUnavailable','he'));assert.equal(o.doc.documentElement.dir,'rtl');
});
test('all three translated alignment choices and text transforms persist canonical values in every locale',async()=>{
 for(const language of supported){const c=context();await c.input('language',language);for(const align of ['left','center','right']){const el=c.doc.createElement('select');el.dataset.lineProp='align';el.value=align;for(const fn of c.doc.events.input)await fn({target:el});await c.click('saveBtn');assert.equal(JSON.parse(c.storage.get('mwestClockSettings')).lines[0].align,align)}for(const transform of ['none','uppercase','lowercase']){const el=c.doc.createElement('select');el.dataset.lineProp='transform';el.value=transform;for(const fn of c.doc.events.input)await fn({target:el});await c.click('saveBtn');assert.equal(JSON.parse(c.storage.get('mwestClockSettings')).lines[0].transform,transform)}}
});
test('font permission, availability and selected-family messages translate in all locales',async()=>{
 for(const language of supported){const c=context();await c.input('language',language);const scan=c.doc.getElementById('scanFonts').events.click[0];await scan();assert.equal(c.doc.getElementById('fontScanStatus').textContent,c.env.MwestI18n.t('status.fontUnsupported',language));c.env.queryLocalFonts=async()=>{const error=Error('Denied');error.name='NotAllowedError';throw error};await scan();assert.equal(c.doc.getElementById('fontScanStatus').textContent,c.env.MwestI18n.t('status.fontDenied',language));c.env.queryLocalFonts=async()=>[{family:'Font <&>'}];await scan();assert.equal(c.doc.getElementById('fontScanStatus').textContent,c.env.MwestI18n.t('status.fontFound',language,{count:1}));const button=c.doc.createElement('button');button.dataset.fontFamily='Font <&>';c.doc.getElementById('fontList').events.click[0]({target:button});assert.equal(c.run('state.customFontName'),'Font <&>');assert.equal(c.doc.getElementById('fontScanStatus').textContent,c.env.MwestI18n.t('status.fontSelected',language,{font:'Font <&>'}))}
});
test('preview documents avoid old cached HTML while shared OBS URLs keep their existing format',async()=>{
 const c=context();const preview=new URL(c.doc.getElementById('preview').src);assert.equal(preview.searchParams.get('v'),'languages-20261005b');await c.input('language','de');await c.click('saveBtn');assert.equal(new URL(c.doc.getElementById('preview').src).searchParams.get('v'),'languages-20261005b');await c.click('copyUrl');const shared=new URL(c.copied());assert.equal(shared.search,'');assert.ok(shared.hash.startsWith('#c='));assert.equal(context('overlay',{}, {hash:shared.hash}).run('cfg.language'),'de');await c.click('resetBtn');const recovered=new URL(c.doc.getElementById('preview').src);assert.equal(recovered.searchParams.get('v'),'languages-20261005b');assert.ok(recovered.searchParams.has('recovery'));
});
