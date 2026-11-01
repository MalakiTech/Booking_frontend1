const BASE=import.meta.env.VITE_API_URL || "/api";

const csrfToken=()=>
    document.cookie.split(";").find((c)=>c.startsWith("csrftoken="))?.split("=")[1] || "";
 
export async function api(path, {method="GET", body, params}={}){
    const url=new URL(BASE + path, window.location.origin);
    Object.entries(params || {}).forEach(([k, v])=>{
        if(Array.isArray(v)) v.forEach((x)=>url.searchParams.append(k,x));
        else if(v !== "" && v != null) url.searchParams.set(k,v);
    });
    const res=await fetch(url, {
        method,
        credentials:"include",
        headers:{
            "Content-Type":"application/json",
            ...(method !== "GET" ? {"X-CSRFToken": csrfToken()}:{}),
        },
        body:body ? JSON.stringify(body) : undefined,
    });

    const data =res.status === 204 ? null:await res.json().catch(()=>null);
    if(!res.ok){
        const first=data && typeof data=="object"? Object.values(data)[0]:null;
        const msg = data?.detail || (Array.isArray(first) ? first[0] : first) || "Something went wrong. Please try again.";
        throw Object.assign(new Error(msg), {status:res.status, data});
    }
    return data;
}