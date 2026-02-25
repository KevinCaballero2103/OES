import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Fixture from './Fixture'
import Posiciones from './Posiciones'

const colores = {
  futbol: 'bg-red-700',
  futsal: 'bg-blue-700',
  handball: 'bg-yellow-600',
  voleibol: 'bg-green-700',
  padel: 'bg-neutral-800',
}

const nombres = {
  futbol: 'Fútbol',
  futsal: 'Futsal',
  handball: 'Handball',
  voleibol: 'Voleibol',
  padel: 'Pádel',
}

function Deporte() {
  const { division, deporte, categoria } = useParams()
  const navigate = useNavigate()
  const [torneo, setTorneo] = useState(null)
  const [fases, setFases] = useState([])
  const [faseActiva, setFaseActiva] = useState(0)
  const [cargando, setCargando] = useState(true)

  const categoriaFormateada = categoria.charAt(0).toUpperCase() + categoria.slice(1)

  useEffect(() => {
    async function cargarTorneo() {
      setCargando(true)

      const { data: torneoData } = await supabase
        .from('torneos')
        .select('*')
        .eq('deporte', deporte)
        .eq('categoria', categoriaFormateada)
        .eq('anio', 2026)
        .or(`division.eq.${division},division.eq.mixto`)
        .single()

      if (!torneoData) {
        setCargando(false)
        return
      }

      setTorneo(torneoData)

      const { data: fasesData } = await supabase
        .from('fases')
        .select('*')
        .eq('torneo_id', torneoData.id)
        .order('orden', { ascending: true })

      setFases(fasesData || [])
      setCargando(false)
    }

    cargarTorneo()
  }, [deporte, categoria, division])

  if (cargando) {
    return <div className="p-10 text-center text-white/50">Cargando torneo...</div>
  }

  if (!torneo) {
    return <div className="p-10 text-center text-white/50">Torneo no encontrado</div>
  }

  const faseSeleccionada = fases[faseActiva]

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <button
        onClick={() => navigate(`/`)}
        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
      >
        ← Volver
      </button>

      <div className={`${colores[deporte]} rounded-2xl p-8 mb-6`}>
        <h1 className="text-4xl font-black uppercase">{nombres[deporte]}</h1>
        <p className="text-white/70 mt-1 font-medium">
          {categoriaFormateada} · {division.charAt(0).toUpperCase() + division.slice(1)}
        </p>
        <div className="flex gap-2 mt-4">
          {['masculino', 'femenino'].map(cat => {
            const deportesConFemenino = ['futsal', 'voleibol', 'handball']
            if (cat === 'femenino' && !deportesConFemenino.includes(deporte)) return null
            return (
              <button
                key={cat}
                onClick={() => navigate(`/torneo/${division}/${deporte}/${cat}`)}
                className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${
                  categoria === cat
                    ? 'bg-white text-gray-950'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            )
          })}
        </div>
      </div>

      {fases.length > 1 && (
        <div className="flex gap-2 mb-8">
          {fases.map((fase, index) => (
            <button
              key={fase.id}
              onClick={() => setFaseActiva(index)}
              className={`px-5 py-2 rounded-full font-semibold transition-colors text-sm ${
                faseActiva === index
                  ? 'bg-white text-gray-950'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {fase.nombre}
            </button>
          ))}
        </div>
      )}

      {faseSeleccionada && (
        <div className="flex flex-col gap-10">
          {faseSeleccionada.tipo === 'liga' && (
            <>
              <div>
                <h2 className="text-xl font-bold mb-4">Tabla de Posiciones</h2>
                <Posiciones faseId={faseSeleccionada.id} />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-4">Fixture</h2>
                <Fixture faseId={faseSeleccionada.id} />
              </div>
            </>
          )}
          {faseSeleccionada.tipo === 'eliminatoria' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Llaves</h2>
              <p className="text-white/40">Bracket eliminatorio próximamente</p>
            </div>
          )}
        </div>
      )}

      {fases.length === 0 && (
        <p className="text-white/40 text-center py-10">Este torneo no tiene fases configuradas aún</p>
      )}
    </div>
  )
}

export default Deporte