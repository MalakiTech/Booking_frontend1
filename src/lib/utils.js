export const TAX_RATE=0.1;
export const iso=(d)=>d.toISOString().slice(0, 10);
export const todayStr=()=>iso(new Date());
export const addDays = (s,n)=>{const d=new Date(s); d.setDate(d.getDate() + n); return iso(d);};
export const nightsBetween= (a,b)=>Math.max(0,Math.round((new Date(b) - new Date(a)) /864e5));
export const money = (n)=>`$${Number(n || 0),toLocaleString(undefined, {maximumFractionDigits: 0})}`;
export const fmtDate = (s)=>new Date(s).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"nnumeric"});
export const plural = (n,w)=>`${n} ${w}${n===1 ? "" :"s"}`;


export const tripParams = (sp)=>{
    const out=new URLSearchParams();
    ["check_in","check_out","adults","kids"].forEach((k)=>sp.get(k) && out.set(k, sp.get(k)));
    return out;

};