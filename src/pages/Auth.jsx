import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { Img, ErrorNote } from "../components/ui.jsx";
import { useSiteImages } from "../lib/hooks.js";

export default function Auth() {
  const { user, login, register } = useAuth();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const site = useSiteImages();
  const from = useLocation().state?.from || "/bookings";
  const [tab, setTab] = useState(sp.get("tab") === "signup" ? "signup" : "login");
  const [f, setF] = useState({ name: "", email: "", password: "", remember: true });
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (p) => setF((s) => ({ ...s, ...p }));

  if (user) return <Navigate to={from} replace />;

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      if (tab === "login") await login(f.email, f.password, f.remember);
      else await register({ name: f.name, email: f.email, password: f.password });
      nav(from, { replace: true });
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };

  return (
    <div className="grid min-h-[calc(100vh-4rem)] md:grid-cols-[1fr_1.1fr]">
      <div className="relative hidden md:block">
        <Img src={site.login} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
        <div className="absolute bottom-24 left-10 max-w-xs text-white">
          <h1 className="text-3xl font-bold">{tab === "login" ? "Welcome Back" : "Join StayBook"}</h1>
          <p className="mt-2 text-sm">{tab === "login" ? "Sign in to manage your bookings and get exclusive deals." : "Create an account to book faster and unlock member prices."}</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="card w-full max-w-md p-8">
          <div role="tablist" className="mb-6 grid grid-cols-2 border-b text-center text-sm font-medium">
            {[["login", "Login"], ["signup", "Sign Up"]].map(([k, l]) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => { setTab(k); setErr(""); }}
                className={`pb-3 ${tab === k ? "border-b-2 border-brand-600 text-brand-600" : "text-slate-500"}`}>{l}</button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {tab === "signup" && (
              <label className="block"><span className="label">Full Name</span>
                <input required className="input" autoComplete="name" value={f.name} onChange={(e) => set({ name: e.target.value })} /></label>
            )}
            <label className="block"><span className="label">Email Address</span>
              <input required type="email" className="input" autoComplete="email" value={f.email} onChange={(e) => set({ email: e.target.value })} /></label>
            <label className="block"><span className="label">Password</span>
              <span className="relative block">
                <input required minLength={tab === "signup" ? 8 : undefined} type={show ? "text" : "password"} className="input pr-10"
                  autoComplete={tab === "login" ? "current-password" : "new-password"} value={f.password} onChange={(e) => set({ password: e.target.value })} />
                <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)}
                  className="absolute right-3 top-3 text-slate-400">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </span></label>

            {tab === "login" && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" className="accent-brand-600" checked={f.remember} onChange={(e) => set({ remember: e.target.checked })} />Remember me</label>
                <Link to="/contact" className="text-brand-600">Forgot password?</Link>
              </div>
            )}
            <ErrorNote>{err}</ErrorNote>
            <button className="btn w-full" disabled={busy}>{busy ? "Please wait…" : tab === "login" ? "Sign In" : "Create Account"}</button>
          </form>

          <p className="my-4 text-center text-xs text-slate-400">Or continue with</p>
          {/* Wire these to django-allauth / social auth when you are ready. */}
          {["Google", "Facebook"].map((p) => (
            <button key={p} type="button" disabled title="Coming soon" className="mb-2 w-full rounded-md border py-2.5 text-sm font-medium opacity-60">Continue with {p}</button>
          ))}
          <p className="mt-4 text-center text-sm text-slate-500">
            {tab === "login" ? "Don't have an account? " : "Already have an account? "}
            <button className="font-medium text-brand-600" onClick={() => setTab(tab === "login" ? "signup" : "login")}>{tab === "login" ? "Sign up" : "Log in"}</button>
          </p>
        </div>
      </div>
    </div>
  );
}