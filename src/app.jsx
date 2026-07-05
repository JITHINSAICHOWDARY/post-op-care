import { Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import PatientDashboard from './pages/PatientDashboard'
import Booking from './pages/Booking'
import Diet from './pages/Diet'
import DoctorDashboard from './pages/DoctorDashboard'

function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* UPGRADE: Sticky "Frosted Glass" Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/20 bg-white/70 px-4 py-4 backdrop-blur-lg shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          
          {/* Logo with a text gradient */}
          <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-extrabold text-transparent tracking-tight">
            Post-op-care
          </h1>
          
          {/* Refined navigation links */}
          <div className="flex gap-6 text-sm font-semibold text-slate-600">
            <Link to="/" className="transition-colors hover:text-blue-600">Login</Link>
            <Link to="/doctor" className="transition-colors hover:text-blue-600">Doctor View</Link>
            <Link to="/patient" className="transition-colors hover:text-blue-600">Patient View</Link>
          </div>
        </div>
      </nav>

      {/* Page Content with generous top padding */}
      <main className="mx-auto max-w-6xl pt-8 pb-12">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/book" element={<Booking />} />
          <Route path="/diet" element={<Diet />} />
        </Routes>
      </main>
    </div>
  )
}

export default App