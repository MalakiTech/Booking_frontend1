import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Search from "./pages/Search.jsx";
import HotelDetails from "./pages/HotelDetails.jsx";
import Checkout from "./pages/Checkout.jsx";
import Auth from "./pages/Auth.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import Contact from "./pages/Contact.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/hotels" element={<Search />} />
        <Route path="/hotels/:id" element={<HotelDetails />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<Contact />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout/:id" element={<Checkout />} />
          <Route path="/bookings" element={<MyBookings />} />
        </Route>
        <Route path="*" element={<p className="p-16 text-center text-slate-500">Page not found.</p>} />
      </Route>
    </Routes>
  );
}