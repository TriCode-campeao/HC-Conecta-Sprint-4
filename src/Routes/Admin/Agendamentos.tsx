import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

type Medico = {
  idMedico: number
  nome: string
  crmMedico: string
}

type Especialidade = {
  idEspecialidade: number
  nomeEspecialidade: string
  descricao: string
}

type Unidade = {
  idUnidadeSaude: number
  nomeUnidadeSaude: string
  endereco?: string
}

type Paciente = {
  idPaciente: number
  nome: string
  cpf: string
  dataNascimento: string
}

type Agendamento = {
  idAgendamento?: number
  cpfPaciente?: string
  idPaciente?: number
  nomePaciente?: string
  idMedico: number
  nomeMedico?: string
  crmMedico?: string
  idEspecialidade?: number
  especialidade: string
  dataHora: string
  status?: string
  tipoConsulta?: string
  idUnidade?: number
  nomeUnidade?: string
  notificado?: string
  dataHoraNotificacao?: string | null
}

export default function AdminAgendamentos() {
  const [form, setForm] = useState<Agendamento>({ 
    cpfPaciente: '',
    idPaciente: undefined,
    idMedico: 0,
    idEspecialidade: undefined,
    especialidade: '', 
    dataHora: '',
    status: 'PENDENTE',
    tipoConsulta: 'PRESENCIAL'
  })
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [sucesso, setSucesso] = useState('')
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [medicosFiltrados, setMedicosFiltrados] = useState<Medico[]>([])
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loadingLista, setLoadingLista] = useState(false)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [deletandoId, setDeletandoId] = useState<number | null>(null)
  const [nomePaciente, setNomePaciente] = useState('')
  const [loadingPaciente, setLoadingPaciente] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS')
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<Agendamento | null>(null)
  const [mostrarModalReagendar, setMostrarModalReagendar] = useState(false)
  const [mostrarModalConfirmar, setMostrarModalConfirmar] = useState(false)
  const [mostrarModalExcluir, setMostrarModalExcluir] = useState(false)
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null)
  const erroRef = useRef<HTMLDivElement>(null)

  const carregarPacientes = async () => {
    try {
      const res = await fetch('https://hc-conecta-sprint-4-1.onrender.com/pacientes', {
        headers: { 'Accept': 'application/json' },
      })
      if (res.ok) {
        const data = await res.json()
        setPacientes(Array.isArray(data) ? data : [])
      }
    } catch (_) {
      setPacientes([])
    }
  }

  const buscarMedicoPorId = async (idMedico: number) => {
    if (!idMedico || idMedico === 0) return null
    try {
      const res = await fetch(`https://hc-conecta-sprint-4-1.onrender.com/medicos/${idMedico}`, {
        headers: { 'Accept': 'application/json' },
      })
      if (res.ok) {
        return await res.json()
      }
    } catch (_) {
      return null
    }
    return null
  }

  const buscarEspecialidadePorId = async (idEspecialidade: number) => {
    if (!idEspecialidade || idEspecialidade === 0) return null
    try {
      const res = await fetch(`https://hc-conecta-sprint-4-1.onrender.com/especialidades/${idEspecialidade}`, {
        headers: { 'Accept': 'application/json' },
      })
      if (res.ok) {
        return await res.json()
      }
    } catch (_) {
      return null
    }
    return null
  }

  const buscarUnidadePorId = async (idUnidade: number) => {
    if (!idUnidade || idUnidade === 0) return null
    try {
      const res = await fetch(`https://hc-conecta-sprint-4-1.onrender.com/unidades-saude/${idUnidade}`, {
        headers: { 'Accept': 'application/json' },
      })
      if (res.ok) {
        return await res.json()
      }
    } catch (_) {
      return null
    }
    return null
  }

  const carregarAgendamentos = async () => {
    setLoadingLista(true)
    try {
      const res = await fetch('https://hc-conecta-sprint-4-1.onrender.com/agendamentos', {
        headers: { 'Accept': 'application/json' },
      })
      
      if (res.ok) {
        const data = await res.json()
        const agendamentosArray = Array.isArray(data) ? data : []
        
        const agendamentosEnriquecidos = await Promise.all(
          agendamentosArray.map(async (agendamento: any) => {
            const idUnidadeParaBuscar = agendamento.idUnidadeSaude || agendamento.idUnidade
            const [medicoData, especialidadeData, unidadeData] = await Promise.all([
              buscarMedicoPorId(agendamento.idMedico),
              buscarEspecialidadePorId(agendamento.idEspecialidade),
              buscarUnidadePorId(idUnidadeParaBuscar)
            ])
            
            return {
              ...agendamento,
              nomeMedico: medicoData?.nome || 'N/A',
              especialidade: especialidadeData?.nomeEspecialidade || 'N/A',
              nomeUnidade: unidadeData?.nomeUnidadeSaude || (agendamento.tipoAtendimento === 'ONLINE' ? 'Online' : 'N/A'),
              tipoConsulta: agendamento.tipoAtendimento || agendamento.tipoConsulta || 'N/A',
              idUnidade: idUnidadeParaBuscar
            }
          })
        )
        
        setAgendamentos(agendamentosEnriquecidos)
      }
    } catch (_) {
      setAgendamentos([])
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
        setEspecialidades(Array.isArray(data) ? data : [])
      }
    } catch (_) {
      setEspecialidades([])
    }
  }

  const carregarUnidades = async () => {
    try {
      const res = await fetch('https://hc-conecta-sprint-4-1.onrender.com/unidades-saude', {
        headers: { 'Accept': 'application/json' },
      })
      if (res.ok) {
        const data = await res.json()
        setUnidades(Array.isArray(data) ? data : [])
      }
    } catch (_) {
      setUnidades([])
    }
  }

  const buscarPacientePorCPF = async (cpf: string) => {
    const cpfLimpo = cpf.replace(/\D/g, '')
    
    if (cpfLimpo.length !== 11) {
      setNomePaciente('')
      setForm(prev => ({ ...prev, idPaciente: undefined }))
      return
    }

    setLoadingPaciente(true)
    try {
      const res = await fetch(`https://hc-conecta-sprint-4-1.onrender.com/pacientes/cpf/${cpfLimpo}`, {
        headers: { 'Accept': 'application/json' },
      })
      
      if (res.ok) {
        const paciente = await res.json()
        setNomePaciente(paciente.nome || '')
        setForm(prev => ({ ...prev, idPaciente: paciente.idPaciente }))
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.cpfPaciente
          return newErrors
        })
      } else {
        setNomePaciente('')
        setForm(prev => ({ ...prev, idPaciente: undefined }))
        setErrors(prev => ({ ...prev, cpfPaciente: 'CPF não encontrado' }))
      }
    } catch (_) {
      setNomePaciente('')
      setForm(prev => ({ ...prev, idPaciente: undefined }))
      setErrors(prev => ({ ...prev, cpfPaciente: 'Erro ao buscar paciente' }))
    } finally {
      setLoadingPaciente(false)
    }
  }

  const obterNomePaciente = (idPaciente?: number): string => {
    if (!idPaciente) return 'N/A'
    const paciente = pacientes.find(p => p.idPaciente === idPaciente)
    return paciente?.nome || 'N/A'
  }

  const filtrarMedicosPorEspecialidade = async (especialidadeNome: string) => {
    if (!especialidadeNome) {
      setMedicosFiltrados([])
      return
    }

    try {
      const especialidadeEncoded = encodeURIComponent(especialidadeNome)
      const res = await fetch(`https://hc-conecta-sprint-4-1.onrender.com/medicos-especialidades/especialidade/${especialidadeEncoded}/medicos`, {
        headers: { 'Accept': 'application/json' },
      })
      
      if (res.ok) {
        const medicosData = await res.json()
        setMedicosFiltrados(Array.isArray(medicosData) ? medicosData : [])
      } else {
        setMedicosFiltrados([])
      }
    } catch (_) {
      setMedicosFiltrados([])
    }
  }

  useEffect(() => {
    carregarAgendamentos()
    carregarEspecialidades()
    carregarPacientes()
    carregarUnidades()
  }, [])

  useEffect(() => {
    if (form.especialidade) {
      filtrarMedicosPorEspecialidade(form.especialidade)
    } else {
      setMedicosFiltrados([])
    }
  }, [form.especialidade])

  useEffect(() => {
    if (erro && erroRef.current) {
      erroRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [erro])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name === 'cpfPaciente') {
      const apenasNumeros = value.replace(/\D/g, '')
      const limitado = apenasNumeros.slice(0, 11)
      let formatado = limitado
      if (limitado.length > 9) {
        formatado = limitado.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4')
      } else if (limitado.length > 6) {
        formatado = limitado.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3')
      } else if (limitado.length > 3) {
        formatado = limitado.replace(/(\d{3})(\d{0,3})/, '$1.$2')
      }
      setForm(prev => ({ ...prev, [name]: formatado }))
      
      if (limitado.length === 11) {
        buscarPacientePorCPF(formatado)
      } else {
        setNomePaciente('')
      }
    } else if (name === 'especialidade') {
      const especialidadeSelecionada = especialidades.find(e => e.nomeEspecialidade === value)
      setForm(prev => ({ 
        ...prev, 
        especialidade: value, 
        idEspecialidade: especialidadeSelecionada?.idEspecialidade,
        idMedico: 0 
      }))
    } else if (name === 'tipoConsulta') {
      setForm(prev => ({ 
        ...prev, 
        [name]: value,
        idUnidade: value === 'ONLINE' ? undefined : prev.idUnidade
      }))
    } else if (name === 'idMedico') {
      setForm(prev => ({ ...prev, [name]: Number(value) }))
    } else if (name === 'idUnidade') {
      const valorNumerico = value ? Number(value) : undefined
      setForm(prev => ({ ...prev, [name]: valorNumerico }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
    
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[name]
      delete newErrors.geral
      return newErrors
    })
  }

  const handleEdit = (a: Agendamento) => {
    setForm({
      idAgendamento: a.idAgendamento,
      cpfPaciente: a.cpfPaciente || '',
      idPaciente: a.idPaciente,
      idMedico: a.idMedico || 0,
      idEspecialidade: a.idEspecialidade,
      especialidade: a.especialidade || '',
      dataHora: a.dataHora || '',
      status: a.status || 'PENDENTE',
      tipoConsulta: a.tipoConsulta || 'PRESENCIAL'
    })
    setNomePaciente(a.nomePaciente || '')
    if (a.cpfPaciente) {
      buscarPacientePorCPF(a.cpfPaciente)
    }
    setEditandoId(a.idAgendamento || null)
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
      const localErrors: { [key: string]: string } = {}
      
      if (!form.cpfPaciente || form.cpfPaciente.replace(/\D/g, '').length !== 11) {
        localErrors.cpfPaciente = 'CPF deve ter 11 dígitos.'
      }
      if (!form.idPaciente) {
        localErrors.cpfPaciente = 'Paciente não encontrado. Verifique o CPF.'
      }
      if (!form.especialidade) {
        localErrors.especialidade = 'Selecione uma especialidade.'
      }
      if (!form.idEspecialidade) {
        localErrors.especialidade = 'Especialidade não encontrada.'
      }
      if (!form.idMedico || form.idMedico === 0) {
        localErrors.idMedico = 'Selecione um médico.'
      }
      if (!form.dataHora) {
        localErrors.dataHora = 'Selecione data e hora.'
      }
      if (form.tipoConsulta === 'PRESENCIAL' && !form.idUnidade) {
        localErrors.idUnidade = 'Selecione uma unidade de atendimento.'
      }
      
      if (Object.keys(localErrors).length) {
        setErrors(localErrors)
        setLoading(false)
        return
      }

      const dadosAgendamento: any = {
        idPaciente: form.idPaciente,
        idMedico: form.idMedico,
        idEspecialidade: form.idEspecialidade,
        dataHora: form.dataHora,
        status: form.status,
        tipoAtendimento: form.tipoConsulta || 'PRESENCIAL',
        idUnidadeSaude: form.tipoConsulta === 'PRESENCIAL' ? form.idUnidade : 1,
        notificado: 'N',
        dataHoraNotificacao: null
      }

      if (editandoId && form.idAgendamento) {
        const res = await fetch(`https://hc-conecta-sprint-4-1.onrender.com/agendamentos/${form.idAgendamento}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(dadosAgendamento),
        })
        
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Falha ao atualizar agendamento')
        }

        setSucesso('Agendamento atualizado com sucesso!')
      } else {
        const res = await fetch('https://hc-conecta-sprint-4-1.onrender.com/agendamentos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(dadosAgendamento),
        })
        
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Falha ao criar agendamento')
        }

        setSucesso('Agendamento criado com sucesso!')
      }
      
      setForm({ 
        cpfPaciente: '', 
        idPaciente: undefined,
        idMedico: 0,
        idEspecialidade: undefined,
        especialidade: '', 
        dataHora: '',
        status: 'PENDENTE',
        tipoConsulta: 'PRESENCIAL'
      })
      setNomePaciente('')
      setMostrarFormulario(false)
      setEditandoId(null)
      carregarAgendamentos()
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro inesperado'
      setErrors(prev => ({ ...prev, geral: mensagem }))
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
      const res = await fetch(`https://hc-conecta-sprint-4-1.onrender.com/agendamentos/${idParaExcluir}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      })
      
      if (!res.ok) {
        const texto = await res.text()
        console.log('Erro do backend:', texto)
        
        if (res.status === 404) {
          if (texto.includes('Erro ao remover agendamento')) {
            throw new Error('Não é possível excluir este agendamento. Existem registros relacionados (notificações, histórico, etc.) que impedem a exclusão.')
          }
          throw new Error(texto || 'Agendamento não encontrado.')
        }
        
        if (res.status === 400) {
          throw new Error(texto || 'Erro na validação do agendamento.')
        }
        
        throw new Error(texto || 'Falha ao excluir agendamento')
      }

      setSucesso('Agendamento excluído com sucesso')
      await carregarAgendamentos()
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro inesperado ao excluir'
      setErro(mensagem)
    } finally {
      setLoading(false)
      setDeletandoId(null)
      setIdParaExcluir(null)
    }
  }

  const handleDelete = (idAgendamento?: number) => {
    if (!idAgendamento) return
    setIdParaExcluir(idAgendamento)
    setMostrarModalExcluir(true)
  }

  const handleAlterarStatus = async (agendamento: Agendamento, novoStatus: string) => {
    try {
      const dadosAgendamento: any = {
        idPaciente: agendamento.idPaciente,
        idMedico: agendamento.idMedico,
        idEspecialidade: agendamento.idEspecialidade,
        dataHora: agendamento.dataHora,
        status: novoStatus,
        tipoAtendimento: agendamento.tipoConsulta || 'PRESENCIAL',
        idUnidadeSaude: agendamento.tipoConsulta === 'PRESENCIAL' ? agendamento.idUnidade : 1,
        notificado: agendamento.notificado || 'N',
        dataHoraNotificacao: agendamento.dataHoraNotificacao || null
      }

      const res = await fetch(`https://hc-conecta-sprint-4-1.onrender.com/agendamentos/${agendamento.idAgendamento}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(dadosAgendamento),
      })
      
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Falha ao atualizar status')
      }

      setSucesso('Status atualizado com sucesso!')
      await carregarAgendamentos()
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao atualizar status'
      setErro(mensagem)
    }
  }

  const formatarDataHora = (dataHora: string) => {
    try {
      const data = new Date(dataHora)
      return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dataHora
    }
  }

  const agendamentosFiltrados = filtroStatus === 'TODOS' 
    ? agendamentos 
    : agendamentos.filter(a => a.status === filtroStatus)

  return (
    <div className="bg-white py-8">
      <div className="mx-auto max-w-[95%] px-4 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-end">
          <Link to="/admin" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200">
            Voltar ao Painel
          </Link>
        </header>

        <section className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-xl font-bold text-blue-600">Agendamentos Cadastrados</h2>
            <button
              onClick={() => {
                setMostrarFormulario(!mostrarFormulario)
                if (!mostrarFormulario) {
                  setForm({ 
                    cpfPaciente: '', 
                    idPaciente: undefined,
                    idMedico: 0,
                    idEspecialidade: undefined,
                    especialidade: '', 
                    dataHora: '',
                    status: 'PENDENTE',
                    tipoConsulta: 'PRESENCIAL'
                  })
                  setNomePaciente('')
                  setEditandoId(null)
                  setErro('')
                  setSucesso('')
                  setErrors({})
                }
              }}
              className="hover:opacity-70 transition-opacity p-2 bg-green-100 rounded text-green-600"
              aria-label="Adicionar agendamento"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>

          <div className="mb-4 flex items-center gap-3">
            <label htmlFor="filtroStatus" className="text-sm font-medium text-slate-700">Filtrar por Status:</label>
            <select 
              id="filtroStatus"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="TODOS">Todos</option>
              <option value="PENDENTE">Pendente</option>
              <option value="REAGENDADO">Reagendado</option>
              <option value="CONCLUIDO">Concluído</option>
            </select>
          </div>
          
          {loadingLista ? (
            <div className="text-slate-600">Carregando...</div>
          ) : agendamentosFiltrados.length > 0 ? (
            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-blue-600 min-w-[160px]">Nome Paciente</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-blue-600 min-w-[160px]">Nome Médico</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-blue-600 min-w-[140px]">Especialidade</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-blue-600 min-w-[130px]">Data/Hora</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-blue-600 min-w-[110px]">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-blue-600 min-w-[130px]">Tipo</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-blue-600 min-w-[180px]">Unidade</th>
                      <th className="px-2 py-3 text-center text-sm font-medium text-blue-600 w-[160px]">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {agendamentosFiltrados.map((a, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-slate-700 font-medium">{obterNomePaciente(a.idPaciente)}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{a.nomeMedico || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{a.especialidade || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{formatarDataHora(a.dataHora)}</td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-700">{a.status}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">{a.tipoConsulta}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{a.nomeUnidade || 'N/A'}</td>
                        <td className="px-2 py-3 text-center">
                          <div className="flex justify-center gap-1">
                            {a.status === 'PENDENTE' && (
                              <>
                                <button
                                  onClick={() => {
                                    setAgendamentoSelecionado(a)
                                    setMostrarModalConfirmar(true)
                                  }}
                                  className="hover:opacity-70 transition-opacity p-2 bg-green-100 rounded text-green-600"
                                  aria-label="Confirmar"
                                  title="Confirmar agendamento"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleEdit(a)}
                              className="hover:opacity-70 transition-opacity p-2 bg-blue-100 rounded text-blue-600"
                              aria-label="Editar agendamento"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(a.idAgendamento)}
                              disabled={deletandoId === a.idAgendamento}
                              className={`transition-opacity p-2 rounded ${deletandoId === a.idAgendamento ? 'opacity-60 bg-red-100 text-red-400' : 'hover:opacity-70 bg-red-100 text-red-600'}`}
                              aria-label="Excluir agendamento"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 text-center text-slate-600">
              {filtroStatus === 'TODOS' 
                ? 'Nenhum agendamento cadastrado.' 
                : `Nenhum agendamento com status "${filtroStatus}".`
              }
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
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
                <h3 className="text-lg font-semibold text-slate-900">{editandoId ? 'Editar Agendamento' : 'Criar Novo Agendamento'}</h3>
                <button
                  onClick={() => {
                    setMostrarFormulario(false)
                    setEditandoId(null)
                    setForm({ 
                      cpfPaciente: '', 
                      idPaciente: undefined,
                      idMedico: 0,
                      idEspecialidade: undefined,
                      especialidade: '', 
                      dataHora: '',
                      status: 'PENDENTE',
                      tipoConsulta: 'PRESENCIAL'
                    })
                    setNomePaciente('')
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
                  <label htmlFor="cpfPaciente" className="block text-sm font-medium text-slate-700 mb-2">CPF do Paciente</label>
                  <input 
                    id="cpfPaciente" 
                    name="cpfPaciente" 
                    type="text"
                    value={form.cpfPaciente || ''} 
                    onChange={handleChange} 
                    placeholder="000.000.000-00"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  {errors.cpfPaciente && (
                    <div className="mt-1 text-sm text-red-600">{errors.cpfPaciente}</div>
                  )}
                  {loadingPaciente && (
                    <div className="mt-1 text-sm text-blue-600">Buscando paciente...</div>
                  )}
                </div>

                <div>
                  <label htmlFor="nomePaciente" className="block text-sm font-medium text-slate-700 mb-2">Nome do Paciente</label>
                  <input 
                    id="nomePaciente" 
                    name="nomePaciente" 
                    type="text"
                    value={nomePaciente} 
                    readOnly
                    disabled
                    placeholder="Digite o CPF para buscar o paciente"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="especialidade" className="block text-sm font-medium text-slate-700 mb-2">Especialidade</label>
                  <select 
                    id="especialidade" 
                    name="especialidade" 
                    value={form.especialidade} 
                    onChange={handleChange} 
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Selecione uma especialidade</option>
                    {especialidades.map((e) => (
                      <option key={e.idEspecialidade} value={e.nomeEspecialidade}>
                        {e.nomeEspecialidade}
                      </option>
                    ))}
                  </select>
                  {errors.especialidade && (
                    <div className="mt-1 text-sm text-red-600">{errors.especialidade}</div>
                  )}
                </div>

                <div>
                  <label htmlFor="idMedico" className="block text-sm font-medium text-slate-700 mb-2">Médico</label>
                  <select 
                    id="idMedico" 
                    name="idMedico" 
                    value={form.idMedico} 
                    onChange={handleChange} 
                    required
                    disabled={!form.especialidade}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value={0}>{form.especialidade ? 'Selecione um médico' : 'Selecione uma especialidade primeiro'}</option>
                    {medicosFiltrados.map((m) => (
                      <option key={m.idMedico} value={m.idMedico}>
                        {m.nome} - {m.crmMedico}
                      </option>
                    ))}
                  </select>
                  {errors.idMedico && (
                    <div className="mt-1 text-sm text-red-600">{errors.idMedico}</div>
                  )}
                </div>

                <div>
                  <label htmlFor="dataHora" className="block text-sm font-medium text-slate-700 mb-2">Data e Hora</label>
                  <input 
                    id="dataHora" 
                    name="dataHora" 
                    type="datetime-local"
                    value={form.dataHora} 
                    onChange={handleChange} 
                    min="2000-01-01T00:00"
                    max="9999-12-31T23:59"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  {errors.dataHora && (
                    <div className="mt-1 text-sm text-red-600">{errors.dataHora}</div>
                  )}
                </div>

                <div>
                  <label htmlFor="tipoConsulta" className="block text-sm font-medium text-slate-700 mb-2">Tipo de Atendimento</label>
                  <select 
                    id="tipoConsulta" 
                    name="tipoConsulta" 
                    value={form.tipoConsulta} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="PRESENCIAL">Presencial</option>
                    <option value="ONLINE">Online</option>
                  </select>
                </div>

                {form.tipoConsulta === 'PRESENCIAL' && (
                  <div>
                    <label htmlFor="idUnidade" className="block text-sm font-medium text-slate-700 mb-2">Unidade de Atendimento</label>
                    <select 
                      id="idUnidade" 
                      name="idUnidade" 
                      value={form.idUnidade || ''} 
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Selecione uma unidade</option>
                      {unidades.map((unidade) => (
                        <option key={unidade.idUnidadeSaude} value={unidade.idUnidadeSaude}>
                          {unidade.nomeUnidadeSaude}
                        </option>
                      ))}
                    </select>
                    {errors.idUnidade && (
                      <div className="mt-1 text-sm text-red-600">{errors.idUnidade}</div>
                    )}
                  </div>
                )}

                {errors.geral && (
                  <div className="text-sm text-red-600">{errors.geral}</div>
                )}
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarFormulario(false)
                      setEditandoId(null)
                      setForm({ 
                        cpfPaciente: '', 
                        idPaciente: undefined,
                        idMedico: 0,
                        idEspecialidade: undefined,
                        especialidade: '', 
                        dataHora: '',
                        status: 'PENDENTE',
                        tipoConsulta: 'PRESENCIAL'
                      })
                      setNomePaciente('')
                      setErro('')
                      setSucesso('')
                      setErrors({})
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                  >
                    {loading ? 'Salvando...' : editandoId ? 'Atualizar' : 'Criar'}
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

        {mostrarModalReagendar && agendamentoSelecionado && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Reagendar Agendamento</h3>
              <p className="text-slate-700 mb-6">
                Tem certeza que deseja marcar este agendamento como <span className="font-semibold text-red-600">REAGENDADO</span>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setMostrarModalReagendar(false)
                    setAgendamentoSelecionado(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (agendamentoSelecionado) {
                      handleAlterarStatus(agendamentoSelecionado, 'REAGENDADO')
                    }
                    setMostrarModalReagendar(false)
                    setAgendamentoSelecionado(null)
                  }}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Reagendar
                </button>
              </div>
            </div>
          </div>
        )}

        {mostrarModalConfirmar && agendamentoSelecionado && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Confirmar Agendamento</h3>
              <p className="text-slate-700 mb-6">
                Tem certeza que deseja marcar este agendamento como <span className="font-semibold text-green-600">CONCLUÍDO</span>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setMostrarModalConfirmar(false)
                    setAgendamentoSelecionado(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (agendamentoSelecionado) {
                      handleAlterarStatus(agendamentoSelecionado, 'CONCLUIDO')
                    }
                    setMostrarModalConfirmar(false)
                    setAgendamentoSelecionado(null)
                  }}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {mostrarModalExcluir && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Excluir Agendamento</h3>
              <p className="text-slate-700 mb-6">
                Tem certeza que deseja <span className="font-semibold text-red-600">excluir</span> este agendamento? Esta ação não pode ser desfeita.
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

