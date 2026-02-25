import { useState } from 'react'
import { supabase } from '../../supabase'
import { useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)

  const handleLogin = async () => {
    setCargando(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Email o contraseña incorrectos')
      setCargando(false)
      return
    }

    const { data: adminData } = await supabase
      .from('admins')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (!adminData) {
      setError('No tenés permisos de administrador')
      await supabase.auth.signOut()
      setCargando(false)
      return
    }

    navigate('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-white text-3xl font-black tracking-widest">OES</span>
          <p className="text-white/50 mt-2 text-sm">Panel de Administración</p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-white/60 text-sm mb-2 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
              placeholder="admin@oes.com"
            />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={cargando}
            className="w-full bg-[#0a4fa6] hover:bg-[#0a4fa6]/80 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors mt-2"
          >
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login