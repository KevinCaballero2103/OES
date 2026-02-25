import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

function Posiciones({ faseId }) {
  const [tabla, setTabla] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function calcularPosiciones() {
      setCargando(true)

      const { data: grupos } = await supabase
        .from('grupos')
        .select('id')
        .eq('fase_id', faseId)

      if (!grupos || grupos.length === 0) return setCargando(false)

      const grupoIds = grupos.map(g => g.id)

      const { data: equiposGrupo } = await supabase
        .from('grupos_equipos')
        .select('equipo_id, equipos(nombre)')
        .in('grupo_id', grupoIds)

      const { data: partidos } = await supabase
        .from('partidos')
        .select('*')
        .eq('fase_id', faseId)
        .eq('jugado', true)

      if (!equiposGrupo) return setCargando(false)

      const stats = {}
      equiposGrupo.forEach(e => {
        stats[e.equipo_id] = {
          equipo: e.equipos.nombre,
          pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0
        }
      })

      partidos?.forEach(p => {
        const local = stats[p.equipo_local_id]
        const visita = stats[p.equipo_visita_id]
        if (!local || !visita) return

        local.pj++
        visita.pj++
        local.gf += p.goles_local
        local.gc += p.goles_visita
        visita.gf += p.goles_visita
        visita.gc += p.goles_local

        if (p.goles_local > p.goles_visita) {
          local.pg++; local.pts += 2; visita.pp++
        } else if (p.goles_local < p.goles_visita) {
          visita.pg++; visita.pts += 2; local.pp++
        } else {
          local.pe++; visita.pe++; local.pts++; visita.pts++
        }
      })

      const resultado = Object.values(stats).sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts
        return (b.gf - b.gc) - (a.gf - a.gc)
      })

      setTabla(resultado)
      setCargando(false)
    }

    if (faseId) calcularPosiciones()
  }, [faseId])

  if (cargando) return <p className="text-white/40 text-center py-10">Calculando posiciones...</p>
  if (tabla.length === 0) return <p className="text-white/40 text-center py-10">No hay posiciones aún</p>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-white/40 uppercase text-xs tracking-widest border-b border-white/10">
            <th className="text-left py-3 pr-4">#</th>
            <th className="text-left py-3 pr-4">Equipo</th>
            <th className="py-3 px-3">PJ</th>
            <th className="py-3 px-3">PG</th>
            <th className="py-3 px-3">PE</th>
            <th className="py-3 px-3">PP</th>
            <th className="py-3 px-3">GF</th>
            <th className="py-3 px-3">GC</th>
            <th className="py-3 px-3 text-white font-bold">PTS</th>
          </tr>
        </thead>
        <tbody>
          {tabla.map((fila, index) => (
            <tr key={fila.equipo} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="py-3 pr-4 text-white/40">{index + 1}</td>
              <td className="py-3 pr-4 font-bold text-white">{fila.equipo}</td>
              <td className="py-3 px-3 text-center text-white/70">{fila.pj}</td>
              <td className="py-3 px-3 text-center text-white/70">{fila.pg}</td>
              <td className="py-3 px-3 text-center text-white/70">{fila.pe}</td>
              <td className="py-3 px-3 text-center text-white/70">{fila.pp}</td>
              <td className="py-3 px-3 text-center text-white/70">{fila.gf}</td>
              <td className="py-3 px-3 text-center text-white/70">{fila.gc}</td>
              <td className="py-3 px-3 text-center font-black text-white text-base">{fila.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Posiciones