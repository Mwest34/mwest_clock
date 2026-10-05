const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=Object.fromEntries(['config','settings','overlay','i18n','translations'].map(k=>[k,fs.readFileSync(path.join(root,k+'.js'),'utf8')]));
class Element{
 constructor(id='',tag='DIV',doc){this.id=id;this.tagName=tag;this.doc=doc;this.value='';this.checked=false;this.textContent='';this.innerHTML='';this.dataset={};this.children=[];this.events={};this.style={setProperty:(k,v)=>this.style[k]=v};this.classList={toggle(){}};this.src='';this.messages=[];this.contentWindow={postMessage:(message,origin)=>{this.messages.push({message:structuredClone(message),origin});this.message=structuredClone(message)}}}
 addEventListener(name,fn){(this.events[name]??=[]).push(fn)}
 appendChild(el){this.children.push(el);if(el.id)this.doc.elements.set(el.id,el)}
 remove(){if(this.id)this.doc.elements.delete(this.id)}
 removeAttribute(name){delete this[name]}
 setAttribute(name,value){this[name]=value}
 getAttribute(name){return this[name]??null}
 cloneNode(){const el=new Element(this.id,this.tagName,this.doc);el.src=this.src;return el}
 replaceWith(el){this.replaced=true;this.doc.elements.set(this.id,el)}
 closest(){return this}
 click(){this.clicked=true}
}
function context(kind='settings',initial={},options={}){
 const elements=new Map(),doc={elements,events:{},documentElement:{},body:{},getElementById(id){if(!elements.has(id))elements.set(id,new Element(id,'DIV',this));return elements.get(id)},createElement(tag){return new Element('',tag.toUpperCase(),this)},querySelectorAll(selector){if(selector==='[data-i18n]')return [...elements.values()].filter(e=>e.dataset.i18n);return[]},createTreeWalker(){return{nextNode(){return null}}},addEventListener(name,fn){(this.events[name]??=[]).push(fn)}};doc.head=new Element('head','HEAD',doc);
 const storage=new Map(Object.entries(initial)),timers=new Map(),events={};let sequence=0,copied='';const parent={};
 const base=new URL('https://mwest34.github.io/mwest_clock/'+(kind==='overlay'?'overlay.html':''));
 const location={href:base.href,origin:base.origin,pathname:base.pathname,hash:options.hash||'',search:options.search||''};
 const env={document:doc,location,console,Intl,Date,TextEncoder,TextDecoder,Uint8Array,URL,URLSearchParams,Blob,AbortController,NodeFilter:{SHOW_TEXT:4},navigator:{language:options.language||'en-US',clipboard:{writeText:async value=>{if(options.clipboardFail)throw Error('denied');copied=value}}},localStorage:{getItem:key=>{if(options.readFail)throw Error('SecurityError');return storage.get(key)??null},setItem:(key,value)=>{if(options.storageFail)throw Error('QuotaExceededError');storage.set(key,value)},removeItem:key=>storage.delete(key)},history:{replaceState(...args){env.replacedHistory=args}},btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>{if(!/^[A-Za-z0-9+/]*={0,2}$/.test(s)||s.replace(/=/g,'').length%4===1)throw Error('bad base64');return Buffer.from(s,'base64').toString('binary')},fetch:options.fetch||(()=>new Promise(()=>{})),setTimeout:(fn,ms)=>{timers.set(++sequence,{fn,ms});return sequence},clearTimeout:id=>timers.delete(id),setInterval:()=>0,addEventListener:(name,fn)=>(events[name]??=[]).push(fn),confirm:()=>options.confirm!==false,prompt:(message,value)=>{env.prompted={message,value}}};env.window=env;env.parent=options.standalone?env:parent;
 if(options.languages)env.navigator.languages=options.languages;
 vm.createContext(env);vm.runInContext(source.config,env);vm.runInContext(source.translations,env);vm.runInContext(source.i18n,env);let error;try{vm.runInContext(source[kind],env)}catch(e){error=e}
 const api={env,options,doc,elements,storage,timers,events,parent,error,run:s=>vm.runInContext(s,env),json:s=>JSON.parse(JSON.stringify(vm.runInContext(s,env))),copied:()=>copied,async click(id){for(const fn of doc.events.click||[])await fn({target:doc.getElementById(id)})},async input(id,value){const el=doc.getElementById(id);el.value=value;for(const fn of doc.events.input||[])await fn({target:el})},async import(raw){const el=doc.getElementById('importFile');el.files=[{text:async()=>typeof raw==='string'?raw:JSON.stringify(raw)}];for(const fn of el.events.change||[])await fn({target:el})},flush(ms=80){for(const [id,timer] of [...timers]){if(timer.ms===ms){timers.delete(id);timer.fn()}}},message(config,changes={}){for(const fn of events.message||[])fn({origin:base.origin,source:parent,data:{type:'mwest-clock-config',config},...changes})}};
 return api;
}
const encode=raw=>Buffer.from(JSON.stringify(raw),'utf8').toString('base64url');
const settle=async()=>{for(let n=0;n<12;n++)await Promise.resolve()};
module.exports={context,encode,settle,source,root};

