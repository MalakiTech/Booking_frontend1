import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Building2, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  ["/", "Home"], ["/hotels", "Hotels"], ["/#destinations", "Destinations"], ["/about", "About"], ["/contact", "Contact"],
];

function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const cls = ({ isActive }) => `text-sm font-medium ${isActive ? "text-brand-600" : "text-slate-700 hover:text-brand-600"}`;
  return (
    <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          <Building2 className="text-brand-600" /> StayBook
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {links.map(([to, label]) => (
            <NavLink key={label} to={to} end className={cls}>{label}</NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <>
              <Link to="/bookings" className="text-sm font-medium text-slate-700 hover:text-brand-600">My Bookings</Link>
              <button className="btn-outline" onClick={async () => { await logout(); nav("/"); }}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-brand-600">Login</Link>
              <Link to="/login?tab=signup" className="btn">Sign Up</Link>
            </>
          )}
        </div>
        <button className="md:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="space-y-3 border-t px-4 py-4 md:hidden" onClick={() => setOpen(false)}>
          {links.map(([to, label]) => <Link key={label} to={to} className="block text-sm font-medium">{label}</Link>)}
          {user
            ? <><Link to="/bookings" className="block text-sm font-medium">My Bookings</Link>
                <button className="text-sm font-medium" onClick={logout}>Log out</button></>
            : <><Link to="/login" className="block text-sm font-medium">Login</Link>
                <Link to="/login?tab=signup" className="block text-sm font-medium text-brand-600">Sign Up</Link></>}
        </div>
      )}
    </header>
  );
}

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1"><Outlet /></main>
      <footer className="border-t bg-white py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} MalakiTech. All rights reserved.
      </footer>
    </div>
  );
}