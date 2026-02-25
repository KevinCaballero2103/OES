import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'
import { useNavigate } from 'react-router-dom'


function Dashboard() {
  const navigate = useNavigate()
  const [admin, setAdmin] = useState(null)

  useEffect(() => {
    async function verificarAdmin() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        navigate('/admin')
        return
      }

      const { data: adminData } = await supabase
        .from('admins')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!adminData) {
        navigate('/admin')
        return
      }

      setAdmin(adminData)
    }

    verificarAdmin()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin')
  }

  if (!admin) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white/50">Verificando acceso...</div>

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-[#0a4fa6] px-6 py-4 flex items-center justify-between">
        <div>
          <span className="font-black tracking-widest text-xl">OES</span>
          <span className="text-white/60 text-sm ml-3">Panel de Administración</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/60 text-sm">{admin.nombre}</span>
          <button
            onClick={handleLogout}
            className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">Bienvenido, {admin.nombre}</h1>
        <p className="text-white/50 mb-8">
          {admin.rol === 'superadmin' ? 'Acceso total al sistema' : `Administrador de ${admin.deporte} ${admin.division}`}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div
            onClick={() => navigate('/admin/partidos')}
            className="bg-white/5 border border-white/10 rounded-xl p-6 cursor-pointer hover:bg-white/10 transition-colors"
            >
            <h2 className="font-bold text-lg mb-1">Partidos</h2>
            <p className="text-white/50 text-sm">Gestionar fixture y resultados</p>
          </div>
          <div
            onClick={() => navigate('/admin/envivo')}
            className="bg-white/5 border border-white/10 rounded-xl p-6 cursor-pointer hover:bg-white/10 transition-colors"
          >
            <h2 className="font-bold text-lg mb-1">En Vivo</h2>
            <p className="text-white/50 text-sm">Actualizar marcadores en tiempo real</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 cursor-pointer hover:bg-white/10 transition-colors">
            <h2 className="font-bold text-lg mb-1">Equipos</h2>
            <p className="text-white/50 text-sm">Gestionar equipos y jugadores</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 cursor-pointer hover:bg-white/10 transition-colors">
            <h2 className="font-bold text-lg mb-1">Torneos</h2>
            <p className="text-white/50 text-sm">Configurar fases y grupos</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 cursor-pointer hover:bg-white/10 transition-colors">
            <h2 className="font-bold text-lg mb-1">Sanciones</h2>
            <p className="text-white/50 text-sm">Registrar tarjetas y suspensiones</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard