import { Link } from 'react-router-dom'

export default function AdminConsultas() {
  return (
    <div className="bg-white py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-blue-600">Consultas</h1>
          <Link to="/admin" className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium">Voltar ao painel</Link>
        </header>

        <p className="text-slate-700 mb-6">Acompanhe e modere teleconsultas.</p>

        <div className="rounded-lg border border-gray-300 p-6 text-slate-600">
          Em breve: listagem e moderação de consultas.
        </div>
      </div>
    </div>
  )
}


