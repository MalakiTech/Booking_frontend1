import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";



const Ctx=createContext(null);
export const useAuth=()=>useContext(Ctx);


export function AuthProvider({children}){
  const [user, setUser]=useState(null);
  const [loading, setLoading]=useState(true);

  useEffect(()=>{
    (async ()=>{
        try{
            await api("/auth/csrf/");
            setUser(await api("/auth/me/"));
        }catch{
            setUser(null);
        }finally{
            setLoading(false);
        }
    })();
  },[]);



  const login=async (email , password, remember)=>
    setUser(await api("/auth/login/",{method:"POST", body:{email, password, remember}}));
  const register = async (payload)=>
    setUser(await api("/auth/register/", {method:"POST", body:payload}));
  const logout = async () => {
    await api("/auth/logout/", {method:"POST"});
    setUser(null);
  };
  return <Ctx.Provider value={{user, loading, login, register, logout}}>{children}</Ctx.Provider>;
}