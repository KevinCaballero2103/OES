import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

function Partido() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [partido, setPartido] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargarPartido() {
      const { data, error } = await supabase
        .from('partidos')
        .select(`
          *,
          local:equipo_local_id(id, nombre),
          visita:equipo_visita_id(id, nombre)
        `)
        .eq('id', id)
        .single()

      if (error) console.error(error)
      else setPartido(data)
      setCargando(false)
    }

    cargarPartido()

    const canal = supabase
      .channel(`partido-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'partidos', filter: `id=eq.${id}` }, () => {
        cargarPartido()
      })
      .subscribe()

    return () => supabase.removeChannel(canal)
  }, [id])

  if (cargando) return <div className="p-10 text-center text-white/50">Cargando partido...</div>
  if (!partido) return <div className="p-10 text-center text-white/50">Partido no encontrado</div>

  const estado = partido.en_vivo ? 'vivo' : partido.jugado ? 'finalizado' : 'proximo'

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <button
        onClick={() => navigate(-1)}
        className="text-white/60 hover:text-white transition-colors mb-6 block"
      >
        ← Volver
      </button>

      <div className={`rounded-2xl border overflow-hidden mb-8 ${
        estado === 'vivo' ? 'border-red-500' : 'border-white/10'
      }`}>
        <div className={`px-6 py-3 flex justify-between items-center ${
          estado === 'vivo' ? 'bg-red-950/40' : 'bg-white/5'
        }`}>
          <span className={`text-xs px-3 py-1 rounded-full font-bold ${
            estado === 'vivo' ? 'bg-red-600 text-white animate-pulse' :
            estado === 'finalizado' ? 'bg-green-900 text-green-400' :
            'bg-blue-900 text-blue-300'
          }`}>
            {estado === 'vivo' ? '● En Vivo' : estado === 'finalizado' ? 'Finalizado' : 'Próximamente'}
          </span>
          <span className="text-white/40 text-xs">{partido.dia} · {partido.hora} hs · {partido.lugar}</span>
        </div>

        <div className="flex items-center justify-between px-8 py-10 gap-4">
          <div className="flex flex-col items-center gap-3 flex-1">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-white/50 text-sm font-black">
                {partido.local.nombre.slice(0, 4).toUpperCase()}
              </span>
            </div>
            <span className="text-white font-bold text-lg text-center leading-tight">
              {partido.local.nombre}
            </span>
          </div>

          <div className="flex flex-col items-center gap-2">
            {estado === 'finalizado' || estado === 'vivo' ? (
              <span className="text-white font-black text-6xl tracking-wider">
                {partido.goles_local} - {partido.goles_visita}
              </span>
            ) : (
              <span className="text-white font-black text-3xl">{partido.hora} hs.</span>
            )}
          </div>

          <div className="flex flex-col items-center gap-3 flex-1">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-white/50 text-sm font-black">
                {partido.visita.nombre.slice(0, 4).toUpperCase()}
              </span>
            </div>
            <span className="text-white font-bold text-lg text-center leading-tight">
              {partido.visita.nombre}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="flex border-b border-white/10">
          <button className="px-6 py-3 text-sm font-semibold text-white border-b-2 border-white">
            Alineaciones
          </button>
        </div>
        <div className="p-6 text-center text-white/40 text-sm py-10">
          Alineaciones próximamente
        </div>
      </div>
    </div>
  )
}

export default Partido