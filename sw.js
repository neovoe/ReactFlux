if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,r)=>{const l=e||("document"in self?document.currentScript.src:"")||location.href;if(s[l])return;let t={};const o=e=>i(e,l),u={module:{uri:l},exports:t,require:o};s[l]=Promise.all(n.map((e=>u[e]||o(e)))).then((e=>(r(...e),t)))}}define(["./workbox-e1498109"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/arco-vendor-XCByctZb.js",revision:null},{url:"assets/en-US-D4feVGgK.js",revision:null},{url:"assets/es-ES-DvPeD7a_.js",revision:null},{url:"assets/fr-FR-Cw40cWRE.js",revision:null},{url:"assets/highlight-vendor-CPgoxc7N.js",revision:null},{url:"assets/index-BR_i7isg.js",revision:null},{url:"assets/index-gt1N1N0T.css",revision:null},{url:"assets/react-vendor-BABM5PmJ.js",revision:null},{url:"assets/zh-CN-B9xhTmmV.js",revision:null},{url:"index.html",revision:"3f1419507147f57505df2cb0f47ba2c5"},{url:"registerSW.js",revision:"1872c500de691dce40960bb85481de07"},{url:"styles/loading.css",revision:"83707a709e3e73526a7e0a9095c59d3b"},{url:"manifest.webmanifest",revision:"6017208229886bea6bc7bb00b9adcccf"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
