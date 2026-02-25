import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

function Navbar() {
  const navigate = useNavigate()
  const [esAdmin, setEsAdmin] = useState(false)

  useEffect(() => {
    async function verificarSesion() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setEsAdmin(true)
    }
    verificarSesion()
  }, [])

  return (
    <nav className="bg-[#0a4fa6] px-6 py-4 flex items-center justify-between shadow-lg">
      <div
        onClick={() => navigate('/')}
        className="flex items-center gap-3 cursor-pointer"
      >
        <span className="text-white text-2xl font-black tracking-widest">OES</span>
        <span className="text-white/60 text-sm hidden sm:block">Organización Estudiantil Sanjuanina</span>
      </div>

      <div className="flex items-center gap-6 text-white text-sm font-medium">
        <a onClick={() => navigate('/')} className="hover:text-yellow-400 transition-colors cursor-pointer">Inicio</a>
        <a className="hover:text-yellow-400 transition-colors cursor-pointer">Fixture</a>
        <a className="hover:text-yellow-400 transition-colors cursor-pointer">Posiciones</a>
        <a className="hover:text-yellow-400 transition-colors cursor-pointer">En Vivo</a>
        {esAdmin && (
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors"
          >
            Admin
          </button>
        )}
      </div>
    </nav>
  )
}

export default Navbar