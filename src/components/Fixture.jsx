import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

function TarjetaPartido({ equipoLocal, equipoVisita, dia, hora, lugar, jugado, golesLocal, golesVisita, enVivo }) {
  return (
    <div className={`bg-white/5 border ${enVivo ? 'border-red-500' : 'border-white/10'} rounded-xl p-5 flex flex-col gap-3`}>
      <div className="flex justify-between items-center">
        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
          enVivo ? 'bg-red-600 text-white animate-pulse' :
          jugado ? 'bg-green-900 text-green-400' :
          'bg-blue-900 text-blue-400'
        }`}>
          {enVivo ? '● En Vivo' : jugado ? 'Finalizado' : 'Próximo'}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-white font-bold text-lg flex-1 text-right">{equipoLocal}</span>
        {jugado || enVivo ? (
          <span className="text-white font-black text-2xl bg-white/10 px-4 py-1 rounded-lg">
            {golesLocal} - {golesVisita}
          </span>
        ) : (
          <span className="text-white/40 font-bold text-sm bg-white/5 px-4 py-1 rounded-lg">VS</span>
        )}
        <span className="text-white font-bold text-lg flex-1">{equipoVisita}</span>
      </div>
      <div className="flex justify-between text-white/40 text-xs">
        <span>{dia} · {hora}</span>
        <span>{lugar}</span>
      </div>
    </div>
  )
}

function Fixture({ faseId }) {
  const [partidos, setPartidos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargarPartidos() {
      setCargando(true)
      const { data, error } = await supabase
        .from('partidos')
        .select(`
          *,
          local:equipo_local_id(nombre),
          visita:equipo_visita_id(nombre)
        `)
        .eq('fase_id', faseId)
        .order('dia', { ascending: true })

      if (error) console.error(error)
      else setPartidos(data)
      setCargando(false)
    }

    cargarPartidos()

    const canal = supabase
      .channel('partidos-tiempo-real')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'partidos' },
        () => { cargarPartidos() }
      )
      .subscribe()

    return () => supabase.removeChannel(canal)
  }, [faseId])

  if (cargando) return <p className="text-white/40 text-center py-10">Cargando partidos...</p>
  if (partidos.length === 0) return <p className="text-white/40 text-center py-10">No hay partidos cargados aún</p>

  return (
    <div className="flex flex-col gap-4">
      {partidos.map((partido) => (
        <TarjetaPartido
          key={partido.id}
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