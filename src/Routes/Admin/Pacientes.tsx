import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

type NovoPaciente = {
  idPaciente?: number
  nome: string
  cpf: string
  dataNascimento: string
  telefone: string
}

type ContatoPaciente = {
  idContato: number
  idPaciente: number
  telefone: string
  email: string
}

export default function AdminPacientes() {
  const [form, setForm] = useState<NovoPaciente>({ nome: '', cpf: '', dataNascimento: '', telefone: '' })
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [pacientes, setPacientes] = useState<NovoPaciente[]>([])
  const [contatos, setContatos] = useState<ContatoPaciente[]>([])
  const [loadingLista, setLoadingLista] = useState(false)

  const carregarPacientes = async () => {
    setLoadingLista(true)
    try {
      const [pacientesRes, contatosRes] = await Promise.all([
        fetch('https://hc-conecta-sprint-4-1.onrender.com/pacientes', {
          headers: { 'Accept': 'application/json' },
        }),
        fetch('https://hc-conecta-sprint-4-1.onrender.com/contatos-paciente', {
          headers: { 'Accept': 'application/json' },
        })
      ])
      
      if (pacientesRes.ok) {
        const pacientesData = await pacientesRes.json()
        setPacientes(Array.isArray(pacientesData) ? pacientesData : [])
      }
      
      if (contatosRes.ok) {
        const contatosData = await contatosRes.json()
        setContatos(Array.isArray(contatosData) ? contatosData : [])
      }
    } catch (_) {
      setPacientes([])
      setContatos([])
    } finally {
      setLoadingLista(false)
    }
  }

  useEffect(() => {
    carregarPacientes()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setSucesso('')
    setLoading(true)
    try {
      const res = await fetch('https://hc-conecta-sprint-4-1.onrender.com/pacientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Falha ao cadastrar paciente')
      }
      setSucesso('Paciente cadastrado com sucesso!')
      setForm({ nome: '', cpf: '', dataNascimento: '', telefone: '' })
      carregarPacientes()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-blue-600">Pacientes</h1>
          <Link to="/admin" className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium">Voltar ao painel</Link>
        </header>

        <p className="text-slate-700 mb-6">Cadastrar e gerenciar pacientes.</p>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Pacientes Cadastrados</h2>
          {loadingLista ? (
            <div className="text-slate-600">Carregando...</div>
          ) : pacientes.length > 0 ? (
            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Nome</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">CPF</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Data Nascimento</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Telefone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pacientes.map((p, i) => {
                      const contato = contatos.find(c => c.idPaciente === p.idPaciente)
                      return (
                        <tr key={i}>
                          <td className="px-4 py-3 text-sm text-slate-700">{p.nome}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{p.cpf}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{p.dataNascimento}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{contato?.telefone || 'N/A'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 text-center text-slate-600">
              Nenhum paciente cadastrado.
            </div>
          )}
        </section>

        {erro && <div className="mb-4 text-red-600 text-sm font-medium">{erro}</div>}
        {sucesso && <div className="mb-4 text-green-600 text-sm font-medium">{sucesso}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-gray-300 rounded-lg p-6">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-slate-700 mb-2">Nome</label>
            <input id="nome" name="nome" value={form.nome} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
          </div>
          <div>
            <label htmlFor="cpf" className="block text-sm font-medium text-slate-700 mb-2">CPF</label>
            <input id="cpf" name="cpf" value={form.cpf} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
          </div>
          <div>
            <label htmlFor="dataNascimento" className="block text-sm font-medium text-slate-700 mb-2">Data de nascimento</label>
            <input id="dataNascimento" type="date" name="dataNascimento" value={form.dataNascimento} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
          </div>
          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-slate-700 mb-2">Telefone</label>
            <input id="telefone" name="telefone" value={form.telefone} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
          </div>
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60">
            {loading ? 'Salvando...' : 'Cadastrar Paciente'}
          </button>
        </form>
      </div>
    </div>
  )
}


