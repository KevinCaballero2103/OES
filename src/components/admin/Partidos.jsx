import { useState, useEffect } from 'react'
import { supabase } from '../../supabase'
import { useNavigate } from 'react-router-dom'

function Partidos() {
  const navigate = useNavigate()
  const [torneos, setTorneos] = useState([])
  const [torneoSeleccionado, setTorneoSeleccionado] = useState(null)
  const [fases, setFases] = useState([])
  const [faseSeleccionada, setFaseSeleccionada] = useState(null)
  const [partidos, setPartidos] = useState([])
  const [equipos, setEquipos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [formulario, setFormulario] = useState({
    equipo_local_id: '',
    equipo_visita_id: '',
    dia: '',
    hora: '',
    lugar: '',
  })

  useEffect(() => {
    async function cargarTorneos() {
      const { data } = await supabase
        .from('torneos')
        .select('*')
        .eq('activo', true)
        .order('division', { ascending: true })
      setTorneos(data || [])
      setCargando(false)
    }
    cargarTorneos()
  }, [])

  useEffect(() => {
    if (!torneoSeleccionado) return
    async function cargarFases() {
      const { data } = await supabase
        .from('fases')
        .select('*')
        .eq('torneo_id', torneoSeleccionado)
        .order('orden', { ascending: true })
      setFases(data || [])
      setFaseSeleccionada(null)
      setPartidos([])
    }
    cargarFases()
  }, [torneoSeleccionado])

  useEffect(() => {
    if (!faseSeleccionada) return
    async function cargarDatos() {
      const { data: partidosData } = await supabase
        .from('partidos')
        .select(`*, local:equipo_local_id(nombre), visita:equipo_visita_id(nombre)`)
        .eq('fase_id', faseSeleccionada)
        .order('dia', { ascending: true })
      setPartidos(partidosData || [])

      const fase = fases.find(f => f.id === faseSeleccionada)
      const { data: grupos } = await supabase
        .from('grupos')
        .select('id')
        .eq('fase_id', faseSeleccionada)

      if (grupos && grupos.length > 0) {
        const grupoIds = grupos.map(g => g.id)
        const { data: equiposGrupo } = await supabase
          .from('grupos_equipos')
          .select('equipo_id, equipos(id, nombre)')
          .in('grupo_id', grupoIds)
        setEquipos(equiposGrupo?.map(e => e.equipos) || [])
      }
    }
    cargarDatos()
  }, [faseSeleccionada])

  const guardarPartido = async () => {
    if (!formulario.equipo_local_id || !formulario.equipo_visita_id || !formulario.dia) return

    const fase = fases.find(f => f.id === faseSeleccionada)
    const { data: grupos } = await supabase
      .from('grupos')
      .select('id')
      .eq('fase_id', faseSeleccionada)

    const { error } = await supabase.from('partidos').insert({
      fase_id: faseSeleccionada,
      grupo_id: grupos?.[0]?.id || null,
      equipo_local_id: formulario.equipo_local_id,
      equipo_visita_id: formulario.equipo_visita_id,
      dia: formulario.dia,
      hora: formulario.hora,
      lugar: formulario.lugar,
    })

    if (!error) {
      setMostrarFormulario(false)
      setFormulario({ equipo_local_id: '', equipo_visita_id: '', dia: '', hora: '', lugar: '' })
      const { data } = await supabase
        .from('partidos')
        .select(`*, local:equipo_local_id(nombre), visita:equipo_visita_id(nombre)`)
        .eq('fase_id', faseSeleccionada)
        .order('dia', { ascending: true })
      setPartidos(data || [])
    }
  }

  const marcarJugado = async (partidoId, gLocal, gVisita) => {
    await supabase.from('partidos').update({
      jugado: true,
      goles_local: parseInt(gLocal),
      goles_visita: parseInt(gVisita),
    }).eq('id', partidoId)

    const { data } = await supabase
      .from('partidos')
      .select(`*, local:equipo_local_id(nombre), visita:equipo_visita_id(nombre)`)
      .eq('fase_id', faseSeleccionada)
      .order('dia', { ascending: true })
    setPartidos(data || [])
  }

  if (cargando) return <div className="p-10 text-center text-white/50">Cargando...</div>

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <button onClick={() => navigate('/admin/dashboard')} className="text-white/60 hover:text-white mb-6 block">← Volver</button>
      <h1 className="text-2xl font-bold mb-6">Gestionar Partidos</h1>

      <div className="flex flex-col gap-4 mb-8">
        <div>
          <label className="text-white/60 text-sm mb-2 block">Torneo</label>
          <select
            style={{ colorScheme: 'dark' }}
            value={torneoSeleccionado || ''}
            onChange={e => setTorneoSeleccionado(e.target.value)}
            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
          >
            <option value="">Seleccioná un torneo</option>
            {torneos.map(t => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>
        </div>

        {fases.length > 0 && (
          <div>
            <label className="text-white/60 text-sm mb-2 block">Fase</label>
            <select
              style={{ colorScheme: 'dark' }}
              value={faseSeleccionada || ''}
              onChange={e => setFaseSeleccionada(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
            >
              <option value="">Seleccioná una fase</option>
              {fases.map(f => (
                <option key={f.id} value={f.id}>{f.nombre}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {faseSeleccionada && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Partidos</h2>
            <button
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="bg-[#0a4fa6] hover:bg-[#0a4fa6]/80 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              + Nuevo partido
            </button>
          </div>

          {mostrarFormulario && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6 flex flex-col gap-4">
              <h3 className="font-bold">Nuevo Partido</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Equipo Local</label>
                  <select
                    style={{ colorScheme: 'dark' }}
                    value={formulario.equipo_local_id}
                    onChange={e => setFormulario({...formulario, equipo_local_id: e.target.value})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                  >
                    <option value="">Seleccioná</option>
                    {equipos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Equipo Visita</label>
                  <select
                    style={{ colorScheme: 'dark' }}
                    value={formulario.equipo_visita_id}
                    onChange={e => setFormulario({...formulario, equipo_visita_id: e.target.value})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                  >
                    <option value="">Seleccioná</option>
                    {equipos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Día</label>
                  <input
                    type="text"
                    placeholder="Ej: Sabado 06 Sep"
                    value={formulario.dia}
                    onChange={e => setFormulario({...formulario, dia: e.target.value})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Hora</label>
                  <input
                    type="text"
                    placeholder="Ej: 16:00"
                    value={formulario.hora}
                    onChange={e => setFormulario({...formulario, hora: e.target.value})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-white/60 text-sm mb-2 block">Lugar</label>
                  <input
                    type="text"
                    placeholder="Ej: Polideportivo Municipal"
                    value={formulario.lugar}
                    onChange={e => setFormulario({...formulario, lugar: e.target.value})}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setMostrarFormulario(false)} className="text-white/60 hover:text-white px-4 py-2 text-sm">Cancelar</button>
                <button onClick={guardarPartido} className="bg-[#0a4fa6] hover:bg-[#0a4fa6]/80 text-white px-6 py-2 rounded-lg text-sm font-semibold">Guardar</button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {partidos.length === 0 && <p className="text-white/40 text-center py-10">No hay partidos en esta fase</p>}
            {partidos.map(partido => (
              <PartidoAdmin
                key={partido.id}
                partido={partido}
                onMarcarJugado={marcarJugado}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function PartidoAdmin({ partido, onMarcarJugado }) {
  const [gLocal, setGLocal] = useState(partido.goles_local)
  const [gVisita, setGVisita] = useState(partido.goles_visita)

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between gap-4">
        <span className="text-white font-bold flex-1 text-right">{partido.local.nombre}</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={gLocal}
            onChange={e => setGLocal(e.target.value)}
            className="w-12 bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-white text-center focus:outline-none"
          />
          <span className="text-white/40">-</span>
          <input
            type="number"
            min="0"
            value={gVisita}
            onChange={e => setGVisita(e.target.value)}
            className="w-12 bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-white text-center focus:outline-none"
          />
        </div>
        <span className="text-white font-bold flex-1">{partido.visita.nombre}</span>
        <button
          onClick={() => onMarcarJugado(partido.id, gLocal, gVisita)}
          className={`text-xs px-3 py-1 rounded-full font-semibold ${
            partido.jugado
              ? 'bg-green-900 text-green-400'
              : 'bg-blue-900 text-blue-400 hover:bg-blue-800'
          }`}
        >
          {partido.jugado ? 'Finalizado' : 'Marcar jugado'}
        </button>
      </div>
      <div className="text-white/40 text-xs mt-3">{partido.dia} · {partido.hora} · {partido.lugar}</div>
    </div>
  )
}

export default Partidos