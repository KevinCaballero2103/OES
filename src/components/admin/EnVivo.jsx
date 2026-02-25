import { useState, useEffect } from 'react'
import { supabase } from '../../supabase'
import { useNavigate } from 'react-router-dom'

function EnVivo() {
  const navigate = useNavigate()
  const [partidos, setPartidos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargarPartidos() {
      const { data } = await supabase
        .from('partidos')
        .select(`
          *,
          local:equipo_local_id(nombre),
          visita:equipo_visita_id(nombre),
          fases(nombre, torneos(nombre, deporte, categoria, division))
        `)
        .eq('jugado', false)
        .eq('cancelado', false)
        .order('dia', { ascending: true })

      setPartidos(data || [])
      setCargando(false)
    }

    cargarPartidos()
  }, [])

  const toggleEnVivo = async (partido) => {
    await supabase
      .from('partidos')
      .update({ en_vivo: !partido.en_vivo })
      .eq('id', partido.id)

    setPartidos(prev =>
      prev.map(p => p.id === partido.id ? { ...p, en_vivo: !p.en_vivo } : p)
    )
  }

  const actualizarGol = async (partido, equipo, incremento) => {
    const campo = equipo === 'local' ? 'goles_local' : 'goles_visita'
    const valorActual = equipo === 'local' ? partido.goles_local : partido.goles_visita
    const nuevoValor = Math.max(0, valorActual + incremento)

    await supabase
      .from('partidos')
      .update({ [campo]: nuevoValor })
      .eq('id', partido.id)

    setPartidos(prev =>
      prev.map(p => p.id === partido.id ? { ...p, [campo]: nuevoValor } : p)
    )
  }

  const finalizarPartido = async (partido) => {
    await supabase
      .from('partidos')
      .update({ en_vivo: false, jugado: true })
      .eq('id', partido.id)

    setPartidos(prev => prev.filter(p => p.id !== partido.id))
  }

  if (cargando) return <div className="p-10 text-center text-white/50">Cargando...</div>

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <button onClick={() => navigate('/admin/dashboard')} className="text-white/60 hover:text-white mb-6 block">← Volver</button>
      <h1 className="text-2xl font-bold mb-2">Partidos En Vivo</h1>
      <p className="text-white/50 mb-8 text-sm">Activá un partido para transmitir el marcador en tiempo real</p>

      {partidos.length === 0 && (
        <p className="text-white/40 text-center py-10">No hay partidos próximos cargados</p>
      )}

      <div className="flex flex-col gap-4">
        {partidos.map(partido => (
          <div
            key={partido.id}
            className={`border rounded-2xl p-6 transition-all ${
              partido.en_vivo
                ? 'border-red-500 bg-red-950/20'
                : 'border-white/10 bg-white/5'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-white/40 text-xs uppercase tracking-widest">
                  {partido.fases?.torneos?.nombre}
                </p>
                <p className="text-white/40 text-xs">{partido.dia} · {partido.hora} · {partido.lugar}</p>
              </div>
              <button
                onClick={() => toggleEnVivo(partido)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                  partido.en_vivo
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {partido.en_vivo ? '● EN VIVO' : 'Iniciar'}
              </button>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 text-right">
                <p className="text-white font-black text-xl">{partido.local?.nombre}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => actualizarGol(partido, 'local', 1)}
                    disabled={!partido.en_vivo}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-lg font-bold text-xl transition-colors"
                  >
                    +
                  </button>
                  <span className="text-white font-black text-3xl w-10 text-center">{partido.goles_local}</span>
                  <button
                    onClick={() => actualizarGol(partido, 'local', -1)}
                    disabled={!partido.en_vivo}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-lg font-bold text-xl transition-colors"
                  >
                    −
                  </button>
                </div>

                <span className="text-white/40 font-bold text-2xl">:</span>

                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => actualizarGol(partido, 'visita', 1)}
                    disabled={!partido.en_vivo}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-lg font-bold text-xl transition-colors"
                  >
                    +
                  </button>
                  <span className="text-white font-black text-3xl w-10 text-center">{partido.goles_visita}</span>
                  <button
                    onClick={() => actualizarGol(partido, 'visita', -1)}
                    disabled={!partido.en_vivo}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-lg font-bold text-xl transition-colors"
                  >
                    −
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <p className="text-white font-black text-xl">{partido.visita?.nombre}</p>
              </div>
            </div>

            {partido.en_vivo && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => finalizarPartido(partido)}
                  className="bg-green-800 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Finalizar partido
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default EnVivo