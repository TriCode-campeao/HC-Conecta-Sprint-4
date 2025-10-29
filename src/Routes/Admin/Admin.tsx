import { Link } from 'react-router-dom'

export default function Admin() {
  return (
    <div className="bg-white py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">Área Administrativa</h1>
          <p className="text-lg text-slate-700">Bem-vindo(a) ao painel do administrador.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Atalhos administrativos">
          <Link to="/admin/usuarios" className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Usuários</h2>
            <p className="text-slate-700 text-sm">Gerencie contas de usuários do sistema.</p>
          </Link>
          <Link to="/admin/consultas" className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Consultas</h2>
            <p className="text-slate-700 text-sm">Acompanhe e modere teleconsultas.</p>
          </Link>
          <Link to="/admin/configuracoes" className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Configurações</h2>
            <p className="text-slate-700 text-sm">Preferências do sistema e acessos.</p>
          </Link>
        </section>
      </div>
    </div>
  )
}


