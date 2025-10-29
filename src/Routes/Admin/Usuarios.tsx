import { Link } from 'react-router-dom'

export default function AdminUsuarios() {
  return (
    <div className="bg-white py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-blue-600">Usuários</h1>
          <Link to="/admin" className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium">Voltar ao painel</Link>
        </header>

        <p className="text-slate-700 mb-6">Gerencie contas de usuários do sistema.</p>

        <div className="rounded-lg border border-gray-300 p-6 text-slate-600">
          Em breve: listagem, criação e edição de usuários.
        </div>
      </div>
    </div>
  )
}


