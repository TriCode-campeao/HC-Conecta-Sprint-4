import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

type NovoPaciente = {
  idPaciente?: number
  nome: string
  cpf: string
  dataNascimento: string
  telefone: string
  email: string
}

type ContatoPaciente = {
  idContato: number
  idPaciente: number
  telefone: string
  email: string
}

export default function AdminPacientes() {
  const [form, setForm] = useState<NovoPaciente>({ nome: '', cpf: '', dataNascimento: '', telefone: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [errors, setErrors] = useState<{ cpf?: string; telefone?: string; email?: string; dataNascimento?: string; geral?: string }>({})
  const [sucesso, setSucesso] = useState('')
  const [pacientes, setPacientes] = useState<NovoPaciente[]>([])
  const [contatos, setContatos] = useState<ContatoPaciente[]>([])
  const [loadingLista, setLoadingLista] = useState(false)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [deletandoId, setDeletandoId] = useState<number | null>(null)
  const erroRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (erro && erroRef.current) {
      erroRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [erro])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    if (name === 'telefone' || name === 'cpf') {
      const numerosApenas = value.replace(/\D/g, '')
      if (numerosApenas.length <= 11) {
        setForm(prev => ({ ...prev, [name]: numerosApenas }))
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
    
    setErrors(prev => ({ ...prev, [name]: undefined, geral: undefined }))
  }

  const handleEdit = (p: NovoPaciente) => {
    const contato = contatos.find(c => c.idPaciente === p.idPaciente)
    setForm({
      idPaciente: p.idPaciente,
      nome: p.nome || '',
      cpf: p.cpf || '',
      dataNascimento: p.dataNascimento || '',
      telefone: contato?.telefone || '',
      email: contato?.email || ''
    })
    setEditandoId(p.idPaciente || null)
    setMostrarFormulario(true)
    setErro('')
    setSucesso('')
    setErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setErrors({})
    setSucesso('')
    setLoading(true)
    try {
      
      const localErrors: { cpf?: string; dataNascimento?: string } = {}
      if (!form.dataNascimento) {
        localErrors.dataNascimento = 'Data de nascimento é obrigatória.'
      }
      if (!form.cpf || form.cpf.length !== 11) {
        localErrors.cpf = 'CPF deve conter exatamente 11 dígitos.'
      }
      if (Object.keys(localErrors).length) {
        setErrors(localErrors)
        setLoading(false)
        return
      }

      const { idPaciente, telefone, email, ...dadosPaciente } = form

      if (editandoId && idPaciente) {
        const res = await fetch(`https://hc-conecta-sprint-4-1.onrender.com/pacientes/${idPaciente}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(dadosPaciente),
        })
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Falha ao atualizar paciente')
        }

        const contato = contatos.find(c => c.idPaciente === idPaciente)
        if (contato?.idContato) {
          const contatoRes = await fetch(`https://hc-conecta-sprint-4-1.onrender.com/contatos-paciente/${contato.idContato}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ idPaciente, telefone, email })
          })
          if (!contatoRes.ok) {
            const texto = await contatoRes.text()
            throw new Error(texto || 'Paciente atualizado, mas falha ao atualizar contato')
          }
        } else {
          const contatoRes = await fetch('https://hc-conecta-sprint-4-1.onrender.com/contatos-paciente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ idPaciente, telefone, email })
          })
          if (!contatoRes.ok) {
            const texto = await contatoRes.text()
            throw new Error(texto || 'Paciente atualizado, mas falha ao cadastrar contato')
          }
        }

        setSucesso('Paciente atualizado com sucesso!')
        setForm({ nome: '', cpf: '', dataNascimento: '', telefone: '', email: '' })
        setMostrarFormulario(false)
        setEditandoId(null)
        carregarPacientes()
      } else {
        const res = await fetch('https://hc-conecta-sprint-4-1.onrender.com/pacientes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(dadosPaciente),
        })
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Falha ao cadastrar paciente')
        }

        let novoIdPaciente: number | undefined
        try {
          const body = await res.json()
          novoIdPaciente = body?.idPaciente
        } catch {}

        if (!novoIdPaciente) {
          try {
            const busca = await fetch('https://hc-conecta-sprint-4-1.onrender.com/pacientes', { headers: { 'Accept': 'application/json' } })
            if (busca.ok) {
              const lista = await busca.json()
              const encontrado = Array.isArray(lista) ? lista.find((p: any) => p?.cpf === dadosPaciente.cpf) : undefined
              if (encontrado?.idPaciente) novoIdPaciente = encontrado.idPaciente
            }
          } catch {}
        }

        if (novoIdPaciente) {
          const contatoRes = await fetch('https://hc-conecta-sprint-4-1.onrender.com/contatos-paciente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ idPaciente: novoIdPaciente, telefone, email })
          })
          if (!contatoRes.ok) {
            const texto = await contatoRes.text()
            throw new Error(texto || 'Paciente criado, mas falha ao cadastrar contato')
          }
        }

         setSucesso('Paciente e contato cadastrados com sucesso!')
         setForm({ nome: '', cpf: '', dataNascimento: '', telefone: '', email: '' })
         setMostrarFormulario(false)
         carregarPacientes()
      }
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro inesperado'
      
      if (/cpf/i.test(mensagem)) {
        setErrors(prev => ({ ...prev, cpf: mensagem }))
      } else if (/telefone/i.test(mensagem)) {
        setErrors(prev => ({ ...prev, telefone: mensagem }))
      } else if (/email/i.test(mensagem)) {
        setErrors(prev => ({ ...prev, email: mensagem }))
      } else if (/nascimento/i.test(mensagem)) {
        setErrors(prev => ({ ...prev, dataNascimento: mensagem }))
      } else {
        setErrors(prev => ({ ...prev, geral: mensagem }))
      }
      setErro('')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (idPaciente?: number) => {
    if (!idPaciente) return
    setLoading(true)
    setDeletandoId(idPaciente)
    setErro('')
    setSucesso('')
    try {
      let contatoId: number | undefined
      try {
        const contatosResp = await fetch('https://hc-conecta-sprint-4-1.onrender.com/contatos-paciente', { headers: { 'Accept': 'application/json' } })
        if (contatosResp.ok) {
          const lista: any[] = await contatosResp.json()
          const c = Array.isArray(lista) ? lista.find(x => x?.idPaciente === idPaciente) : undefined
          contatoId = c?.idContato
        }
      } catch {}

      if (contatoId) {
        const delContato = await fetch(`https://hc-conecta-sprint-4-1.onrender.com/contatos-paciente/${contatoId}`, { method: 'DELETE', headers: { 'Accept': 'application/json' } })
        if (!delContato.ok) {
          const txt = await delContato.text()
          throw new Error(txt || 'Falha ao excluir contato do paciente')
        }
      }

      const delPaciente = await fetch(`https://hc-conecta-sprint-4-1.onrender.com/pacientes/${idPaciente}`, { method: 'DELETE', headers: { 'Accept': 'application/json' } })
      if (!delPaciente.ok) {
        const t = await delPaciente.text()
        throw new Error(t || 'Falha ao excluir paciente')
      }

      setSucesso('Paciente excluído com sucesso')
      await carregarPacientes()
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro inesperado ao excluir'
      setErro(mensagem)
    } finally {
      setLoading(false)
      setDeletandoId(null)
    }
  }

  return (
     <div className="bg-white py-8">
       <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-end">
          <Link to="/admin" className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium">Voltar ao painel</Link>
        </header>

            <section className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-xl font-bold text-blue-600">Pacientes Cadastrados</h2>
                 <button
                   onClick={() => {
                     setMostrarFormulario(!mostrarFormulario)
                     if (!mostrarFormulario) {
                       setForm({ nome: '', cpf: '', dataNascimento: '', telefone: '', email: '' })
                       setEditandoId(null)
                       setErro('')
                       setSucesso('')
                       setErrors({})
                     }
                   }}
                   className="hover:opacity-70 transition-opacity p-2 bg-green-100 rounded text-green-600"
                   aria-label="Adicionar paciente"
                 >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                   </svg>
                 </button>
               </div>
          {loadingLista ? (
            <div className="text-slate-600">Carregando...</div>
          ) : pacientes.length > 0 ? (
            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-blue-600 min-w-[200px]">Nome</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-blue-600 min-w-[140px]">CPF</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-blue-600 min-w-[150px]">Data Nascimento</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-blue-600 min-w-[130px]">Telefone</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-blue-600 min-w-[200px]">Email</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-blue-600 min-w-[120px]">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pacientes.map((p, i) => {
                      const contato = contatos.find(c => c.idPaciente === p.idPaciente)
                      return (
                         <tr key={i} className="hover:bg-gray-50 transition-colors">
                           <td className="px-6 py-4 text-sm text-slate-700 font-medium">{p.nome}</td>
                           <td className="px-6 py-4 text-sm text-slate-700">{p.cpf}</td>
                           <td className="px-6 py-4 text-sm text-slate-700">{p.dataNascimento}</td>
                           <td className="px-6 py-4 text-sm text-slate-700">{contato?.telefone || 'N/A'}</td>
                           <td className="px-6 py-4 text-sm text-slate-700">{contato?.email || 'N/A'}</td>
                           <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-3">
                              <button
                                onClick={() => handleEdit(p)}
                                className="hover:opacity-70 transition-opacity p-2 bg-blue-100 rounded text-blue-600"
                                aria-label="Editar paciente"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(p.idPaciente)}
                                disabled={deletandoId === p.idPaciente}
                                className={`transition-opacity p-2 rounded ${deletandoId === p.idPaciente ? 'opacity-60 bg-red-100 text-red-400' : 'hover:opacity-70 bg-red-100 text-red-600'}`}
                                aria-label="Excluir paciente"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
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

         {erro && <div ref={erroRef} className="mb-4 text-red-600 text-sm font-medium">{erro}</div>}
         {sucesso && (
           <div className={`mb-4 text-sm font-medium ${sucesso.toLowerCase().includes('exclu') ? 'text-red-600' : 'text-green-600'}`}>
             {sucesso}
           </div>
         )}

         {mostrarFormulario && (
           <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
             <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
               <div className="flex justify-between items-center p-6 border-b border-gray-200">
                 <h3 className="text-lg font-semibold text-slate-900">{editandoId ? 'Editar Paciente' : 'Cadastrar Novo Paciente'}</h3>
                 <button
                   onClick={() => {
                     setMostrarFormulario(false)
                     setEditandoId(null)
                     setForm({ nome: '', cpf: '', dataNascimento: '', telefone: '', email: '' })
                     setErro('')
                     setSucesso('')
                     setErrors({})
                   }}
                   className="text-gray-400 hover:text-gray-600 transition-colors"
                   aria-label="Fechar formulário"
                 >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
               </div>
               <form onSubmit={handleSubmit} className="p-6 space-y-4">
                 <div>
                   <label htmlFor="nome" className="block text-sm font-medium text-slate-700 mb-2">Nome</label>
                   <input id="nome" name="nome" value={form.nome} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                 </div>
                <div>
                  <label htmlFor="cpf" className="block text-sm font-medium text-slate-700 mb-2">CPF (máximo 11 dígitos)</label>
                  <input 
                    id="cpf" 
                    name="cpf" 
                    value={form.cpf} 
                    onChange={handleChange} 
                    maxLength={11}
                    placeholder="00000000000"
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  />
                   {errors.cpf && (
                     <div className="mt-1 text-sm text-red-600">{errors.cpf}</div>
                   )}
                </div>
                 <div>
                   <label htmlFor="dataNascimento" className="block text-sm font-medium text-slate-700 mb-2">Data de nascimento</label>
                   <input id="dataNascimento" type="date" name="dataNascimento" value={form.dataNascimento} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                   {errors.dataNascimento && (
                     <div className="mt-1 text-sm text-red-600">{errors.dataNascimento}</div>
                   )}
                 </div>
                 <div>
                   <label htmlFor="telefone" className="block text-sm font-medium text-slate-700 mb-2">Telefone (máximo 11 dígitos)</label>
                   <input 
                     id="telefone" 
                     name="telefone" 
                     value={form.telefone} 
                     onChange={handleChange} 
                     maxLength={11}
                     placeholder="11987654321"
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                   />
                   {errors.telefone && (
                     <div className="mt-1 text-sm text-red-600">{errors.telefone}</div>
                   )}
                 </div>
                 <div>
                   <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                   <input 
                     id="email" 
                     name="email" 
                     type="email"
                     value={form.email}
                     onChange={handleChange}
                     placeholder="exemplo@dominio.com"
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                   />
                   {errors.email && (
                     <div className="mt-1 text-sm text-red-600">{errors.email}</div>
                   )}
                 </div>
                 {errors.geral && (
                   <div className="text-sm text-red-600">{errors.geral}</div>
                 )}
                 <div className="flex gap-3 pt-4">
                   <button
                     type="button"
                     onClick={() => {
                       setMostrarFormulario(false)
                       setEditandoId(null)
                       setForm({ nome: '', cpf: '', dataNascimento: '', telefone: '', email: '' })
                       setErro('')
                       setSucesso('')
                       setErrors({})
                     }}
                     className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                   >
                     Cancelar
                   </button>
                   <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60">
                     {loading ? 'Salvando...' : editandoId ? 'Atualizar' : 'Cadastrar'}
                   </button>
                 </div>
               </form>
             </div>
           </div>
         )}
        {deletandoId && (
          <div className="fixed inset-0 z-[60] flex items-center">
            <div className="w-full py-6 bg-red-200/80 shadow-lg text-center">
              <span className="text-red-600 text-3xl sm:text-4xl md:text-5xl font-extrabold">Excluindo...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


