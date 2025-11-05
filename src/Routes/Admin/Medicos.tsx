import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

type Especialidade = {
  idEspecialidade?: number
  nome?: string
  descricao?: string
  [key: string]: any
}

type EspecialidadeAPI = {
  idEspecialidade: number
  nomeEspecialidade: string
  descricao: string
}

type NovoMedico = {
  idMedico?: number
  nome: string
  crm: string
  crmMedico?: string
  especialidade: string
  especialidades?: Especialidade[]
}

export default function AdminMedicos() {
  const [form, setForm] = useState<NovoMedico>({ nome: '', crm: 'CRM', especialidade: '' })
  const [especialidadesSelecionadas, setEspecialidadesSelecionadas] = useState<string[]>([])
  const [especialidadesOriginais, setEspecialidadesOriginais] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [errors, setErrors] = useState<{ crm?: string; nome?: string; especialidade?: string; geral?: string }>({})
  const [sucesso, setSucesso] = useState('')
  const [medicos, setMedicos] = useState<NovoMedico[]>([])
  const [loadingLista, setLoadingLista] = useState(false)
  const [especialidadesDisponiveis, setEspecialidadesDisponiveis] = useState<EspecialidadeAPI[]>([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [deletandoId, setDeletandoId] = useState<number | null>(null)
  const [mostrarModalExcluir, setMostrarModalExcluir] = useState(false)
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null)
  const erroRef = useRef<HTMLDivElement>(null)

  const extrairNomeEspecialidade = (e: Especialidade | any): string => {
    if (typeof e === 'string') return e
    if (!e || typeof e !== 'object') return 'Especialidade'
    
    return e.nome || 
           e.nomeEspecialidade ||
           e.descricao || 
           e.descricaoEspecialidade ||
           e.especialidade ||
           e.nomeEspecialidadeMedico ||
           (e.especialidadeMedico && e.especialidadeMedico.nome) ||
           Object.values(e).find((v: any) => typeof v === 'string' && v) as string ||
           'Especialidade'
  }

  const carregarMedicos = async () => {
    setLoadingLista(true)
    try {
      const medicosRes = await fetch('https://hc-conecta-sprint-4-1.onrender.com/medicos', {
          headers: { 'Accept': 'application/json' },
        })
      
      if (medicosRes.ok) {
        const medicosData = await medicosRes.json()
        const medicosLista = Array.isArray(medicosData) ? medicosData : []
        
        const medicosComEspecialidades = await Promise.all(
          medicosLista.map(async (m: any) => {
            let especialidades: Especialidade[] = []
            try {
              const especialidadesRes = await fetch(`https://hc-conecta-sprint-4-1.onrender.com/medicos-especialidades/medico/${m.idMedico}`, {
                headers: { 'Accept': 'application/json' },
              })
              if (especialidadesRes.ok) {
                especialidades = await especialidadesRes.json()
                especialidades = Array.isArray(especialidades) ? especialidades : []
                if (especialidades.length > 0) {
                  console.log('Especialidades retornadas:', especialidades)
                }
              }
            } catch (_) {
              especialidades = []
            }
            
            return {
              idMedico: m.idMedico,
              nome: m.nome || '',
              crm: m.crmMedico || m.crm || '',
              especialidade: m.especialidade || '',
              especialidades: especialidades
            }
          })
        )
        
        setMedicos(medicosComEspecialidades)
      }
    } catch (_) {
      setMedicos([])
    } finally {
      setLoadingLista(false)
    }
  }

  const carregarEspecialidades = async () => {
    try {
      const res = await fetch('https://hc-conecta-sprint-4-1.onrender.com/especialidades', {
        headers: { 'Accept': 'application/json' },
      })
      if (res.ok) {
        const data = await res.json()
        setEspecialidadesDisponiveis(Array.isArray(data) ? data : [])
      }
    } catch (_) {
      setEspecialidadesDisponiveis([])
    }
  }

  useEffect(() => {
    carregarMedicos()
    carregarEspecialidades()
  }, [])

  useEffect(() => {
    if (erro && erroRef.current) {
      erroRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [erro])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name === 'crm') {
      if (!value.startsWith('CRM')) {
        setForm(prev => ({ ...prev, [name]: 'CRM' }))
        return
      }
      if (value.length > 11) {
        setForm(prev => ({ ...prev, [name]: prev.crm }))
        return
      }
      const parteAposCRM = value.substring(3)
      const valorConvertidoMaiusculo = parteAposCRM.toUpperCase()
      const apenasNumerosELetras = valorConvertidoMaiusculo.replace(/[^0-9A-Z]/g, '')
      const valorFiltrado = 'CRM' + apenasNumerosELetras
      setForm(prev => ({ ...prev, [name]: valorFiltrado }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
    
    setErrors(prev => ({ ...prev, [name]: undefined, geral: undefined }))
  }

  const handleRemoverEspecialidade = (index: number) => {
    setEspecialidadesSelecionadas(prev => prev.filter((_, i) => i !== index))
    setErrors(prev => ({ ...prev, especialidade: undefined }))
  }

  const handleEdit = (m: NovoMedico) => {
    const crmComPrefixo = m.crm && !m.crm.startsWith('CRM') ? `CRM${m.crm}` : (m.crm || 'CRM')
    const especialidadesLista = m.especialidades && m.especialidades.length > 0
      ? m.especialidades.map((e: Especialidade) => extrairNomeEspecialidade(e))
      : []
    setForm({
      idMedico: m.idMedico,
      nome: m.nome || '',
      crm: crmComPrefixo,
      especialidade: ''
    })
    setEspecialidadesSelecionadas(especialidadesLista)
    setEspecialidadesOriginais(especialidadesLista)
    setEditandoId(m.idMedico || null)
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
      const localErrors: { crm?: string; nome?: string; especialidade?: string } = {}
      if (!form.nome || form.nome.trim().length === 0) {
        localErrors.nome = 'Nome é obrigatório.'
      } else if (form.nome.trim().length < 3 || form.nome.trim().length > 100) {
        localErrors.nome = 'Nome deve ter entre 3 e 100 caracteres.'
      }
      if (!form.crm || form.crm === 'CRM' || form.crm.length !== 11) {
        localErrors.crm = 'CRM deve ter exatamente 11 caracteres.'
      }
      if (form.crm && form.crm.length === 11) {
        const numeroDeDigitos = (form.crm.match(/\d/g) || []).length
        if (numeroDeDigitos < 4 || numeroDeDigitos > 6) {
          localErrors.crm = 'CRM deve conter entre 4 e 6 números.'
        }
      }
      if (especialidadesSelecionadas.length === 0) {
        localErrors.especialidade = 'Selecione pelo menos uma especialidade.'
      }
      if (Object.keys(localErrors).length) {
        setErrors(localErrors)
        setLoading(false)
        return
      }

      const { idMedico, crm, especialidade, ...rest } = form
      const dadosMedico = {
        ...rest,
        nome: form.nome.trim(),
        crmMedico: form.crm
      }

      if (editandoId && idMedico) {
        const res = await fetch(`https://hc-conecta-sprint-4-1.onrender.com/medicos/${idMedico}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(dadosMedico),
        })
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Falha ao atualizar médico')
        }

        const especialidadesRemovidas = especialidadesOriginais.filter(esp => !especialidadesSelecionadas.includes(esp))
        const especialidadesAdicionadas = especialidadesSelecionadas.filter(esp => !especialidadesOriginais.includes(esp))
        
        const errosEspecialidades: string[] = []
        
        for (const nomeEspecialidade of especialidadesRemovidas) {
          try {
            const nomeEncoded = encodeURIComponent(nomeEspecialidade.trim())
            const urlDelete = `https://hc-conecta-sprint-4-1.onrender.com/medicos-especialidades/medico/${idMedico}/especialidade/nome/${nomeEncoded}`
            console.log('DELETE:', urlDelete)
            const delRes = await fetch(urlDelete, {
              method: 'DELETE',
              headers: { 'Accept': 'application/json' }
            })
            if (!delRes.ok) {
              const texto = await delRes.text()
              console.error('Erro DELETE:', texto)
              errosEspecialidades.push(`Falha ao remover ${nomeEspecialidade}: ${texto}`)
            }
          } catch (err) {
            console.error('Erro ao remover especialidade:', err)
            const mensagemErro = err instanceof Error ? err.message : 'Erro desconhecido'
            if (mensagemErro.includes('Failed to fetch')) {
              errosEspecialidades.push(`Erro de rede ao remover ${nomeEspecialidade}. Verifique se o servidor está online.`)
        } else {
              errosEspecialidades.push(`Erro ao remover ${nomeEspecialidade}: ${mensagemErro}`)
            }
          }
        }
        
        for (const nomeEspecialidade of especialidadesAdicionadas) {
          try {
            const nomeEspecialidadeEncoded = encodeURIComponent(nomeEspecialidade.trim())
            const urlPost = `https://hc-conecta-sprint-4-1.onrender.com/medicos-especialidades/medico/${idMedico}/especialidade/nome/${nomeEspecialidadeEncoded}`
            console.log('POST:', urlPost)
            const especialidadeRes = await fetch(urlPost, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            })
            if (!especialidadeRes.ok) {
              let mensagemErro = 'Falha ao cadastrar especialidade'
              try {
                const texto = await especialidadeRes.text()
                console.error('Erro POST:', texto)
                if (texto && texto.trim().length > 0) {
                  mensagemErro = texto.trim()
                } else {
                  mensagemErro = `Erro ao cadastrar especialidade: ${especialidadeRes.status} ${especialidadeRes.statusText}`
                }
              } catch (_) {
                mensagemErro = `Erro ao cadastrar especialidade: ${especialidadeRes.status} ${especialidadeRes.statusText}`
              }
              errosEspecialidades.push(`${nomeEspecialidade}: ${mensagemErro}`)
            }
          } catch (err) {
            console.error('Erro ao adicionar especialidade:', err)
            const mensagemErro = err instanceof Error ? err.message : 'Erro desconhecido'
            if (mensagemErro.includes('Failed to fetch')) {
              errosEspecialidades.push(`Erro de rede ao adicionar ${nomeEspecialidade}. Verifique se o servidor está online.`)
            } else {
              errosEspecialidades.push(`${nomeEspecialidade}: ${mensagemErro}`)
            }
          }
        }
        
        if (errosEspecialidades.length > 0) {
          throw new Error(`Médico atualizado, mas houve erros nas especialidades: ${errosEspecialidades.join('; ')}`)
        }

        setSucesso('Médico atualizado com sucesso!')
        setForm({ nome: '', crm: 'CRM', especialidade: '' })
        setEspecialidadesSelecionadas([])
        setEspecialidadesOriginais([])
        setMostrarFormulario(false)
        setEditandoId(null)
        carregarMedicos()
      } else {
        const res = await fetch('https://hc-conecta-sprint-4-1.onrender.com/medicos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(dadosMedico),
        })
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Falha ao cadastrar médico')
        }

        let novoIdMedico: number | undefined
        try {
          const body = await res.json()
          novoIdMedico = body?.idMedico
        } catch {}

        if (!novoIdMedico) {
          try {
            const busca = await fetch('https://hc-conecta-sprint-4-1.onrender.com/medicos', { headers: { 'Accept': 'application/json' } })
            if (busca.ok) {
              const lista = await busca.json()
              const encontrado = Array.isArray(lista) ? lista.find((m: any) => m?.crmMedico === form.crm) : undefined
              if (encontrado?.idMedico) novoIdMedico = encontrado.idMedico
            }
          } catch {}
        }

        if (novoIdMedico && especialidadesSelecionadas.length > 0) {
          const errosEspecialidades: string[] = []
          for (const nomeEspecialidade of especialidadesSelecionadas) {
            try {
              const nomeEspecialidadeEncoded = encodeURIComponent(nomeEspecialidade.trim())
              const especialidadeRes = await fetch(`https://hc-conecta-sprint-4-1.onrender.com/medicos-especialidades/medico/${novoIdMedico}/especialidade/nome/${nomeEspecialidadeEncoded}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              })
              if (!especialidadeRes.ok) {
                let mensagemErro = 'Falha ao cadastrar especialidade'
                try {
                  const texto = await especialidadeRes.text()
                  if (texto && texto.trim().length > 0) {
                    mensagemErro = texto.trim()
                  } else {
                    mensagemErro = `Erro ao cadastrar especialidade: ${especialidadeRes.status} ${especialidadeRes.statusText}`
                  }
                } catch (_) {
                  mensagemErro = `Erro ao cadastrar especialidade: ${especialidadeRes.status} ${especialidadeRes.statusText}`
                }
                errosEspecialidades.push(`${nomeEspecialidade}: ${mensagemErro}`)
              }
            } catch (err) {
              errosEspecialidades.push(`${nomeEspecialidade}: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
            }
          }
          if (errosEspecialidades.length > 0) {
            throw new Error(`Médico criado, mas falha ao cadastrar algumas especialidades: ${errosEspecialidades.join('; ')}`)
          }
        }

         setSucesso('Médico cadastrado com sucesso!')
         setForm({ nome: '', crm: 'CRM', especialidade: '' })
         setEspecialidadesSelecionadas([])
         setMostrarFormulario(false)
         carregarMedicos()
      }
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro inesperado'
      
      if (/crm/i.test(mensagem)) {
        setErrors(prev => ({ ...prev, crm: mensagem }))
      } else if (/nome/i.test(mensagem)) {
        setErrors(prev => ({ ...prev, nome: mensagem }))
      } else if (/especialidade/i.test(mensagem)) {
        setErrors(prev => ({ ...prev, especialidade: mensagem }))
      } else {
        setErrors(prev => ({ ...prev, geral: mensagem }))
      }
      setErro('')
    } finally {
      setLoading(false)
    }
  }

  const confirmarExclusao = async () => {
    if (!idParaExcluir) return
    
    setLoading(true)
    setDeletandoId(idParaExcluir)
    setErro('')
    setSucesso('')
    setMostrarModalExcluir(false)
    
    try {
      const urlMedico = `https://hc-conecta-sprint-4-1.onrender.com/medicos/${idParaExcluir}`
      const delMedico = await fetch(urlMedico, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      })
      
      if (!delMedico.ok) {
        const texto = await delMedico.text()
        
        if (texto.includes('Erro ao remover medico') || texto.includes('Erro ao remover médico')) {
          throw new Error('Erro ao remover médico: Este médico já tem agendamentos cadastrados.')
        }
        
        throw new Error(texto || 'Falha ao excluir médico')
      }

      setSucesso('Médico excluído com sucesso')
      await carregarMedicos()
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro inesperado ao excluir'
      setErro(mensagem)
    } finally {
      setLoading(false)
      setDeletandoId(null)
      setIdParaExcluir(null)
    }
  }

  const handleDelete = (idMedico?: number) => {
    if (!idMedico) return
    setIdParaExcluir(idMedico)
    setMostrarModalExcluir(true)
  }

  return (
     <div className="bg-white py-8">
       <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-end">
          <Link to="/admin" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200">
            Voltar ao Painel
          </Link>
        </header>

            <section className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-xl font-bold text-blue-600">Médicos Cadastrados</h2>
                 <button
                   onClick={() => {
                     setMostrarFormulario(!mostrarFormulario)
                     if (!mostrarFormulario) {
                      setForm({ nome: '', crm: 'CRM', especialidade: '' })
                      setEspecialidadesSelecionadas([])
                      setEspecialidadesOriginais([])
                       setEditandoId(null)
                       setErro('')
                       setSucesso('')
                       setErrors({})
                     }
                   }}
                   className="hover:opacity-70 transition-opacity p-2 bg-green-100 rounded text-green-600"
                   aria-label="Adicionar médico"
                 >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                   </svg>
                 </button>
               </div>
          {loadingLista ? (
            <div className="text-slate-600">Carregando...</div>
          ) : medicos.length > 0 ? (
            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-blue-600 min-w-[200px]">Nome</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-blue-600 min-w-[140px]">CRM</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-blue-600 min-w-[200px]">Especialidade</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-blue-600 min-w-[120px]">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {medicos.map((m, i) => {
                      return (
                         <tr key={i} className="hover:bg-gray-50 transition-colors">
                           <td className="px-6 py-4 text-sm text-slate-700 font-medium">{m.nome}</td>
                           <td className="px-6 py-4 text-sm text-slate-700">{m.crm}</td>
                           <td className="px-6 py-4 text-sm text-slate-700">
                             {m.especialidades && m.especialidades.length > 0 
                               ? m.especialidades.map((e: Especialidade, idx: number) => (
                                   <span key={idx}>
                                     {extrairNomeEspecialidade(e)}
                                     {idx < m.especialidades!.length - 1 && ', '}
                                   </span>
                                 ))
                               : 'N/A'
                             }
                           </td>
                           <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-3">
                              <button
                                onClick={() => handleEdit(m)}
                                className="hover:opacity-70 transition-opacity p-2 bg-blue-100 rounded text-blue-600"
                                aria-label="Editar médico"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(m.idMedico)}
                                disabled={deletandoId === m.idMedico}
                                className={`transition-opacity p-2 rounded ${deletandoId === m.idMedico ? 'opacity-60 bg-red-100 text-red-400' : 'hover:opacity-70 bg-red-100 text-red-600'}`}
                                aria-label="Excluir médico"
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
              Nenhum médico cadastrado.
            </div>
          )}
        </section>

         {sucesso && (
           <div className={`mb-4 text-sm font-medium ${sucesso.toLowerCase().includes('exclu') ? 'text-red-600' : 'text-green-600'}`}>
             {sucesso}
           </div>
         )}
         {erro && <div ref={erroRef} className="mb-4 text-red-600 text-sm font-medium">{erro}</div>}

         {mostrarFormulario && (
           <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
             <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
               <div className="flex justify-between items-center p-6 border-b border-gray-200">
                 <h3 className="text-lg font-semibold text-slate-900">{editandoId ? 'Editar Médico' : 'Cadastrar Novo Médico'}</h3>
                 <button
                   onClick={() => {
                     setMostrarFormulario(false)
                     setEditandoId(null)
                     setForm({ nome: '', crm: 'CRM', especialidade: '' })
                     setEspecialidadesSelecionadas([])
                     setEspecialidadesOriginais([])
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
                   {errors.nome && (
                     <div className="mt-1 text-sm text-red-600">{errors.nome}</div>
                   )}
                 </div>
                <div>
                  <label htmlFor="crm" className="block text-sm font-medium text-slate-700 mb-2">CRM/NúmeroCRM/Estado = (SIGLA)</label>
                  <input 
                    id="crm" 
                    name="crm" 
                    value={form.crm} 
                    onChange={handleChange} 
                    maxLength={11}
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  />
                   {errors.crm && (
                     <div className="mt-1 text-sm text-red-600">{errors.crm}</div>
                   )}
                </div>
                 <div>
                   <label htmlFor="especialidade" className="block text-sm font-medium text-slate-700 mb-2">Especialidades</label>
                   {especialidadesSelecionadas.length > 0 && (
                     <div className="flex flex-wrap gap-2 mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[50px]">
                       {especialidadesSelecionadas.map((esp, index) => (
                         <div
                           key={index}
                           className="group inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                         >
                           <button
                             type="button"
                             onClick={() => handleRemoverEspecialidade(index)}
                             className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-800 mr-1 flex-shrink-0"
                             aria-label={`Remover especialidade ${esp}`}
                           >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                             </svg>
                           </button>
                           <span className="whitespace-nowrap">{esp}</span>
                         </div>
                       ))}
                     </div>
                   )}
                   <select 
                     id="especialidade" 
                     name="especialidade" 
                     value={form.especialidade} 
                     onChange={(e) => {
                       const valor = e.target.value
                       if (valor && !especialidadesSelecionadas.includes(valor)) {
                         setEspecialidadesSelecionadas(prev => [...prev, valor])
                         setForm(prev => ({ ...prev, especialidade: '' }))
                         setErrors(prev => ({ ...prev, especialidade: undefined }))
                       }
                     }}
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                   >
                     <option value="">Selecione uma especialidade</option>
                     {especialidadesDisponiveis
                       .filter(esp => !especialidadesSelecionadas.includes(esp.nomeEspecialidade))
                       .map((esp) => (
                         <option key={esp.idEspecialidade} value={esp.nomeEspecialidade}>
                           {esp.nomeEspecialidade}
                         </option>
                       ))}
                   </select>
                   {errors.especialidade && (
                     <div className="mt-1 text-sm text-red-600">{errors.especialidade}</div>
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
                       setForm({ nome: '', crm: 'CRM', especialidade: '' })
                       setEspecialidadesSelecionadas([])
                       setEspecialidadesOriginais([])
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

        {mostrarModalExcluir && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Excluir Médico</h3>
              <p className="text-slate-700 mb-6">
                Tem certeza que deseja <span className="font-semibold text-red-600">excluir</span> este médico? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setMostrarModalExcluir(false)
                    setIdParaExcluir(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarExclusao}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
