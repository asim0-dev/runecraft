"use strict";(()=>{var a={};a.id=443,a.ids=[443],a.modules={2058:(a,b,c)=>{c.r(b),c.d(b,{config:()=>n,default:()=>m,handler:()=>p});var d={};c.r(d),c.d(d,{default:()=>j});var e=c(9046),f=c(8667),g=c(3480),h=c(6435),i=c(3538);async function j(a,b){if("GET"!==a.method)return b.status(405).json({error:"Method not allowed"});let c=(0,i.createServerSupabaseClient)({req:a,res:b}),{data:{user:d}}=await c.auth.getUser();if(!d)return b.status(401).json({error:"Unauthorized"});let{data:e,error:f}=await c.from("market_listings").select(`
      id,
      seller_id,
      item_id,
      quantity,
      price,
      status,
      created_at,
      items (
        name,
        rarity,
        emoji
      ),
      profiles!market_listings_seller_id_fkey (
        username
      )
    `).eq("status","active").order("created_at",{ascending:!1});return f?(console.error(f),b.status(500).json({error:"Failed to fetch market listings"})):b.status(200).json(e)}var k=c(8112),l=c(8766);let m=(0,h.M)(d,"default"),n=(0,h.M)(d,"config"),o=new g.PagesAPIRouteModule({definition:{kind:f.A.PAGES_API,page:"/api/market",pathname:"/api/market",bundlePath:"",filename:""},userland:d,distDir:".next",projectDir:""});async function p(a,b,c){let d=await o.prepare(a,b,{srcPage:"/api/market"});if(!d){b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve());return}let{query:f,params:g,prerenderManifest:h}=d;try{let c=a.method||"GET",d=(0,k.getTracer)(),e=d.getActiveScopeSpan(),i=o.instrumentationOnRequestError.bind(o),j=async e=>o.render(a,b,{query:{...f,...g},params:g,allowedRevalidateHeaderKeys:void 0,multiZoneDraftMode:!0,trustHostHeader:void 0,previewProps:h.preview,propagateError:!1,dev:o.isDev,page:"/api/market",projectDir:"",onError:(...b)=>i(a,...b)}).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let f=d.getRootSpanAttributes();if(!f)return;if(f.get("next.span_type")!==l.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${f.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let g=f.get("next.route");if(g){let a=`${c} ${g}`;e.setAttributes({"next.route":g,"http.route":g,"next.span_name":a}),e.updateName(a)}else e.updateName(`${c} ${a.url}`)});e?await j(e):await d.withPropagatedContext(a.headers,()=>d.trace(l.BaseServerSpan.handleRequest,{spanName:`${c} ${a.url}`,kind:k.SpanKind.SERVER,attributes:{"http.method":c,"http.target":a.url}},j))}catch(a){if(o.isDev)throw a;(0,e.sendError)(b,500,"Internal Server Error")}finally{null==c.waitUntil||c.waitUntil.call(c,Promise.resolve())}}},3538:a=>{a.exports=require("@supabase/auth-helpers-nextjs")},5600:a=>{a.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")}};var b=require("../../webpack-api-runtime.js");b.C(a);var c=b.X(0,[169],()=>b(b.s=2058));module.exports=c})();