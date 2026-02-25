import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { CircleDot, Dumbbell, Volleyball } from 'lucide-react'

const deportesPorDivision = {
  colegial: [
    { nombre: "Futsal", icono: CircleDot, color: "bg-blue-700", categorias: ["Masculino", "Femenino"], ruta: "futsal" },
    { nombre: "Voleibol", icono: Volleyball, color: "bg-green-700", categorias: ["Masculino", "Femenino"], ruta: "voleibol" },
    { nombre: "Handball", icono: Dumbbell, color: "bg-yellow-600", categorias: ["Masculino", "Femenino"], ruta: "handball" },
  ],
  universitario: [
    { nombre: "Fútbol", icono: CircleDot, color: "bg-red-700", categorias: ["Masculino"], ruta: "futbol" },
    { nombre: "Futsal", icono: CircleDot, color: "bg-blue-700", categorias: ["Masculino", "Femenino"], ruta: "futsal" },
    { nombre: "Voleibol", icono: Volleyball, color: "bg-green-700", categorias: ["Masculino", "Femenino"], ruta: "voleibol" },
    { nombre: "Handball", icono: Dumbbell, color: "bg-yellow-600", categorias: ["Masculino", "Femenino"], ruta: "handball" },
    { nombre: "Pádel", icono: CircleDot, color: "bg-neutral-800", categorias: ["Masculino"], ruta: "padel" },
  ],
}

function TarjetaDeporte({ nombre, icono: Icono, color, categorias, ruta, division }) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (categorias.length === 1) {
      navigate(`/torneo/${division}/${ruta}/${categorias[0].toLowerCase()}`)
    } else {
      navigate(`/torneo/${division}/${ruta}/masculino`)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`${color} rounded-2xl p-6 cursor-pointer hover:scale-105 transition-transform duration-200 shadow-xl`}
    >
      <Icono size={40} className="mb-3" />
      <h2 className="text-2xl font-black uppercase tracking-wide mb-3">{nombre}</h2>
      <div className="flex gap-2 flex-wrap">
        {categorias.map(cat => (
          <span key={cat} className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">{cat}</span>
        ))}
      </div>
    </div>
  )
}

function Home() {
  const [division, setDivision] = useState('universitario')

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => setDivision('universitario')}
          className={`px-6 py-2 rounded-full font-semibold transition-colors ${
            division === 'universitario'
              ? 'bg-white text-gray-950'
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          Universitario
        </button>
        <button
          onClick={() => setDivision('colegial')}
          className={`px-6 py-2 rounded-full font-semibold transition-colors ${
            division === 'colegial'
              ? 'bg-white text-gray-950'
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          Colegial
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-2">Modalidades</h1>
      <p className="text-white/50 mb-8">Seleccioná un deporte para ver fixture y posiciones</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {deportesPorDivision[division].map(d => (
          <TarjetaDeporte key={d.nombre} {...d} division={division} />
        ))}
      </div>
    </div>
  )
}

export default Home