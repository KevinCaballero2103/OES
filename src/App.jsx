import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './components/Home'
import Deporte from './components/Deporte'
import Login from './components/admin/Login'
import Dashboard from './components/admin/Dashboard'
import Partidos from './components/admin/Partidos'
import EnVivo from './components/admin/EnVivo'

function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Routes>
        <Route path="/" element={<><Navbar /><Home /></>} />
        <Route path="/torneo/:division/:deporte/:categoria" element={<><Navbar /><Deporte /></>} />
        <Route path="/admin" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/partidos" element={<Partidos />} />
        <Route path="/admin/envivo" element={<EnVivo />} />
      </Routes>
    </div>
  )
}

export default App