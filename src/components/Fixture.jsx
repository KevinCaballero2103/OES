import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

function TarjetaPartido({ equipoLocal, equipoVisita, dia, hora, lugar, jugado, enVivo, golesLocal, golesVisita, fechaDate, id }) {
  const navigate = useNavigate()
  const [empezaraProto, setEmpezaraProto] = useState(false)

  useEffect(() => {
    if (jugado || enVivo || !hora || !fechaDate) return

    const ahora = new Date()
    const [hh, mm] = hora.split(':').map(Number)
    const horaPartido = new Date(fechaDate)
    horaPartido.setHours(hh, mm, 0, 0)

    const actualizar = () => {
      const ahora = new Date()
      if (ahora >= horaPartido) {
        setEmpezaraProto(true)
      }
    }

    actualizar()

    const intervalo = setInterval(actualizar, 30000)
    return () => clearInterval(intervalo)
  }, [hora, fechaDate, jugado, enVivo])

  const estado = enVivo ? 'vivo' : jugado ? 'finalizado' : 'proximo'

  return (
    <div
      onClick={() => navigate(`/partido/${id}`)}
      className={`rounded-2xl overflow-hidden border cursor-pointer hover:brightness-110 transition-all ${
        estado === 'vivo' ? 'border-red-500 bg-red-950/20' :
        estado === 'finalizado' ? 'border-white/10 bg-white/5' :
        'border-white/10 bg-white/5'
      }`}
    >
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <span className={`text-xs px-3 py-1 rounded-full font-bold ${
          estado === 'vivo' ? 'bg-red-600 text-white animate-pulse' :
          estado === 'finalizado' ? 'bg-green-900 text-green-400' :
          'bg-blue-900 text-blue-300'
        }`}>
          {estado === 'vivo' ? '● En Vivo' : estado === 'finalizado' ? 'Finalizado' : 'Próximamente'}
        </span>
        <span className="text-white/30 text-xs">{lugar}</span>
      </div>

      <div className="flex items-center justify-between px-6 py-4 gap-4">
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-white/40 text-xs font-bold text-center leading-tight px-1">{equipoLocal.slice(0, 4).toUpperCase()}</span>
          </div>
          <span className="text-white font-bold text-sm text-center leading-tight">{equipoLocal}</span>
        </div>

        <div className="flex flex-col items-center gap-1 min-w-24">
          {estado === 'finalizado' || estado === 'vivo' ? (
            <span className="text-white font-black text-4xl tracking-wider">
              {golesLocal} - {golesVisita}
            </span>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-white font-black text-2xl">{hora} hs.</span>
              {empezaraProto && (
                <span className="text-white/40 text-xs mt-1 text-center">El partido empezará pronto</span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-white/40 text-xs font-bold text-center leading-tight px-1">{equipoVisita.slice(0, 4).toUpperCase()}</span>
          </div>
          <span className="text-white font-bold text-sm text-center leading-tight">{equipoVisita}</span>
        </div>
      </div>

      <div className="px-5 pb-3 text-white/30 text-xs text-center">{dia}</div>
    </div>
  )
}

function Fixture({ faseId, fecha }) {
  const [partidos, setPartidos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargarPartidos() {
      setCargando(true)

      let query = supabase
        .from('partidos')
        .select(`
          *,
          local:equipo_local_id(nombre),
          visita:equipo_visita_id(nombre)
        `)
        .eq('fase_id', faseId)
        .order('hora', { ascending: true })

      if (fecha) {
        query = query.eq('fecha_date', fecha)
      }

      const { data, error } = await query
      if (error) console.error(error)
      else setPartidos(data)
      setCargando(false)
    }

    if (faseId) cargarPartidos()

    const canal = supabase
      .channel('partidos-tiempo-real')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'partidos' }, () => {
        cargarPartidos()
      })
      .subscribe()

    return () => supabase.removeChannel(canal)
  }, [faseId, fecha])

  if (cargando) return <p className="text-white/40 text-center py-6">Cargando partidos...</p>
  if (partidos.length === 0) return <p className="text-white/40 text-center py-6">No hay partidos para este día</p>

  return (
    <div className="flex flex-col gap-4">
      {partidos.map((partido) => (
        <TarjetaPartido
          key={partido.id}
          id={partido.id}
          fechaDate={partido.fecha_date}
          equipoLocal={partido.local.nombre}
          equipoVisita={partido.visita.nombre}
          dia={partido.dia}
          hora={partido.hora}
          lugar={partido.lugar}
          jugado={partido.jugado}
          enVivo={partido.en_vivo}
          golesLocal={partido.goles_local}
          golesVisita={partido.goles_visita}
        />
      ))}
    </div>
  )
}

export default Fixture