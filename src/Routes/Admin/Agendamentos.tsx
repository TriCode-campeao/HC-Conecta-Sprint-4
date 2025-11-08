import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'

const API_URL = (import.meta.env as unknown as { VITE_API_URL: string }).VITE_API_URL

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
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [medicosFiltrados, setMedicosFiltrados] = useState<Medico[]>([])
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loadingLista, setLoadingLista] = useState(false)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [nomePaciente, setNomePaciente] = useState('')
  const [loadingPaciente, setLoadingPaciente] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS')
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<Agendamento | null>(null)
  const [mostrarModalReagendar, setMostrarModalReagendar] = useState(false)
  const [mostrarModalConfirmar, setMostrarModalConfirmar] = useState(false)
  const [confirmandoId, setConfirmandoId] = useState<number | null>(null)
  const [cancelandoId, setCancelandoId] = useState<number | null>(null)
  const [dataHoraOriginal, setDataHoraOriginal] = useState<string>('')
  const [mostrarAvisoReagendamento, setMostrarAvisoReagendamento] = useState(false)
  const [confirmadoReagendamento, setConfirmadoReagendamento] = useState(false)
  const [idMedicoOriginal, setIdMedicoOriginal] = useState<number | undefined>(undefined)
  const [carregandoMedicos, setCarregandoMedicos] = useState(false)
  const erroRef = useRef<HTMLDivElement>(null)

  const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm<Agendamento>({
    defaultValues: {
      cpfPaciente: '',
      idPaciente: undefined,
      idMedico: 0,
      idEspecialidade: undefined,
      especialidade: '',
      dataHora: '',
      status: 'PENDENTE',
      tipoConsulta: 'PRESENCIAL'
    }
  })

  const cpfPacienteValue = watch('cpfPaciente')
  const especialidadeValue = watch('especialidade')
  const tipoConsultaValue = watch('tipoConsulta')
  const dataHoraValue = watch('dataHora')

  const carregarPacientes = async () => {
    try {
      const res = await fetch(`${API_URL}/pacientes`, {
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
      const res = await fetch(`${API_URL}/medicos/${idMedico}`, {
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
      const res = await fetch(`${API_URL}/especialidades/${idEspecialidade}`, {
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
      const res = await fetch(`${API_URL}/unidades-saude/${idUnidade}`, {
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

  const buscarPacientePorId = async (idPaciente: number) => {
    if (!idPaciente || idPaciente === 0) return null
    try {
      const res = await fetch(`${API_URL}/pacientes/${idPaciente}`, {
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

  const carregarAgendamentos = async (status?: string) => {
    setLoadingLista(true)
    try {
      const url = status && status !== 'TODOS' 
        ? `${API_URL}/agendamentos/status/${status}`
        : `${API_URL}/agendamentos`
      
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      })
      
      if (res.ok) {
        const data = await res.json()
        const agendamentosArray = Array.isArray(data) ? data : []
        
        const agendamentosEnriquecidos = await Promise.all(
          agendamentosArray.map(async (agendamento: any) => {
            const idUnidadeParaBuscar = agendamento.idUnidadeSaude || agendamento.idUnidade
            const [pacienteData, medicoData, especialidadeData, unidadeData] = await Promise.all([
              buscarPacientePorId(agendamento.idPaciente),
              buscarMedicoPorId(agendamento.idMedico),
              buscarEspecialidadePorId(agendamento.idEspecialidade),
              buscarUnidadePorId(idUnidadeParaBuscar)
            ])
            
            return {
              ...agendamento,
              nomePaciente: pacienteData?.nome || 'N/A',
              cpfPaciente: pacienteData?.cpf || '',
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
      const res = await fetch(`${API_URL}/especialidades`, {
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
      const res = await fetch(`${API_URL}/unidades-saude`, {
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
      setValue('idPaciente', undefined, { shouldValidate: false })
      return
    }

    setLoadingPaciente(true)
    try {
      const res = await fetch(`${API_URL}/pacientes/cpf/${cpfLimpo}`, {
        headers: { 'Accept': 'application/json' },
      })
      
      if (res.ok) {
        const paciente = await res.json()
        setNomePaciente(paciente.nome || '')
        setValue('idPaciente', paciente.idPaciente, { shouldValidate: false })
      } else {
        setNomePaciente('')
        setValue('idPaciente', undefined, { shouldValidate: false })
      }
    } catch (_) {
      setNomePaciente('')
      setValue('idPaciente', undefined, { shouldValidate: false })
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
      setCarregandoMedicos(false)
      return
    }

    setCarregandoMedicos(true)
    try {
      const especialidadeEncoded = encodeURIComponent(especialidadeNome)
      const res = await fetch(`${API_URL}/medicos-especialidades/especialidade/${especialidadeEncoded}/medicos`, {
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
    } finally {
      setCarregandoMedicos(false)
    }
  }

  useEffect(() => {
    carregarAgendamentos()
    carregarEspecialidades()
    carregarPacientes()
    carregarUnidades()
  }, [])

  useEffect(() => {
    carregarAgendamentos(filtroStatus)
  }, [filtroStatus])


  useEffect(() => {
    if (erro && erroRef.current) {
      erroRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [erro])

  useEffect(() => {
    if (cpfPacienteValue) {
      const apenasNumeros = cpfPacienteValue.replace(/\D/g, '')
      const limitado = apenasNumeros.slice(0, 11)
      let formatado = limitado
      if (limitado.length > 9) {
        formatado = limitado.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4')
      } else if (limitado.length > 6) {
        formatado = limitado.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3')
      } else if (limitado.length > 3) {
        formatado = limitado.replace(/(\d{3})(\d{0,3})/, '$1.$2')
      }
      if (formatado !== cpfPacienteValue) {
        setValue('cpfPaciente', formatado, { shouldValidate: false })
      }
      
      if (limitado.length === 11) {
        buscarPacientePorCPF(formatado)
      } else {
        setNomePaciente('')
      }
    }
  }, [cpfPacienteValue, setValue])

  useEffect(() => {
    if (especialidadeValue) {
      const especialidadeSelecionada = especialidades.find(e => e.nomeEspecialidade === especialidadeValue)
      if (especialidadeSelecionada) {
        setValue('idEspecialidade', especialidadeSelecionada.idEspecialidade, { shouldValidate: false })
        filtrarMedicosPorEspecialidade(especialidadeValue)
        if (!editandoId) {
          setValue('idMedico', 0, { shouldValidate: false })
        }
      }
    } else if (!especialidadeValue && !editandoId) {
      setMedicosFiltrados([])
      setValue('idMedico', 0, { shouldValidate: false })
    }
  }, [especialidadeValue, especialidades, setValue, editandoId])

  useEffect(() => {
    if (tipoConsultaValue === 'ONLINE') {
      setValue('idUnidade', undefined, { shouldValidate: false })
    }
  }, [tipoConsultaValue, setValue])

  useEffect(() => {
    if (editandoId && medicosFiltrados.length > 0 && idMedicoOriginal && idMedicoOriginal > 0) {
      const medicoExiste = medicosFiltrados.some(m => m.idMedico === idMedicoOriginal)
      if (medicoExiste) {
        setValue('idMedico', idMedicoOriginal, { shouldValidate: false })
      }
    }
  }, [medicosFiltrados, editandoId, idMedicoOriginal, setValue])

  useEffect(() => {
    if (editandoId && dataHoraOriginal && dataHoraValue && dataHoraValue !== dataHoraOriginal) {
      setConfirmadoReagendamento(false)
      setMostrarAvisoReagendamento(false)
    }
  }, [dataHoraValue, dataHoraOriginal, editandoId])

  const handleEdit = async (a: Agendamento) => {
    setDataHoraOriginal(a.dataHora || '')
    setNomePaciente(a.nomePaciente || '')
    setIdMedicoOriginal(a.idMedico)
    
    reset({
      idAgendamento: a.idAgendamento,
      cpfPaciente: a.cpfPaciente || '',
      idPaciente: a.idPaciente,
      idMedico: a.idMedico || 0,
      idEspecialidade: a.idEspecialidade,
      especialidade: a.especialidade || '',
      dataHora: a.dataHora || '',
      status: a.status || 'PENDENTE',
      tipoConsulta: a.tipoConsulta || 'PRESENCIAL',
      idUnidade: a.idUnidade
    })
    
    setEditandoId(a.idAgendamento || null)
    setMostrarFormulario(true)
    setErro('')
    setSucesso('')
    
    if (a.especialidade) {
      filtrarMedicosPorEspecialidade(a.especialidade)
    }
    
    if (a.cpfPaciente) {
      buscarPacientePorCPF(a.cpfPaciente)
    }
  }

  const buscarConsultaPorIdAgendamento = async (idAgendamento: number) => {
    try {
      const res = await fetch(`${API_URL}/consultas`, {
        headers: { 'Accept': 'application/json' },
      })
      if (res.ok) {
        const consultas = await res.json()
        const consultasArray = Array.isArray(consultas) ? consultas : []
        return consultasArray.find((c: any) => c.idAgendamento === idAgendamento)
      }
    } catch (_) {
      return null
    }
    return null
  }

  const onSubmit = async (form: Agendamento) => {
    setErro('')
    setSucesso('')
    
    if (editandoId && form.idAgendamento) {
      const agendamentoOriginal = agendamentos.find(a => a.idAgendamento === form.idAgendamento)
      const dataHoraAlterada = dataHoraOriginal && form.dataHora && dataHoraOriginal !== form.dataHora
      const statusConfirmado = agendamentoOriginal?.status === 'CONFIRMADO' || form.status === 'CONFIRMADO'
      
      if (dataHoraAlterada && statusConfirmado && !confirmadoReagendamento) {
        setMostrarAvisoReagendamento(true)
        return
      }
    }
    
    setLoading(true)
    
    try {

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
        const agendamentoOriginal = agendamentos.find(a => a.idAgendamento === form.idAgendamento)
        const dataHoraAlterada = dataHoraOriginal && form.dataHora && dataHoraOriginal !== form.dataHora
        const tipoAtendimentoAlterado = agendamentoOriginal?.tipoConsulta !== form.tipoConsulta
        const statusConfirmado = agendamentoOriginal?.status === 'CONFIRMADO' || form.status === 'CONFIRMADO'
        
        const res = await fetch(`${API_URL}/agendamentos/${form.idAgendamento}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(dadosAgendamento),
        })
        
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Falha ao atualizar agendamento')
        }

        if (statusConfirmado && form.idAgendamento) {
          const medicoAlterado = agendamentoOriginal?.idMedico !== form.idMedico
          const especialidadeAlterada = agendamentoOriginal?.idEspecialidade !== form.idEspecialidade
          const unidadeAlterada = agendamentoOriginal?.idUnidade !== form.idUnidade
          const pacienteAlterado = agendamentoOriginal?.idPaciente !== form.idPaciente
          
          if (dataHoraAlterada || tipoAtendimentoAlterado || medicoAlterado || especialidadeAlterada || unidadeAlterada || pacienteAlterado) {
            try {
              const consulta = await buscarConsultaPorIdAgendamento(form.idAgendamento)
              if (consulta && consulta.idConsulta) {
                const dataHora = new Date(form.dataHora)
                const dataFormatada = dataHora.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })
                const horarioFormatado = dataHora.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })
                const dataHoraISO = dataHora.toISOString()

                let cpfPaciente = consulta.cpfPaciente || ''
                if (pacienteAlterado && form.idPaciente) {
                  const paciente = await buscarPacientePorId(form.idPaciente)
                  if (paciente && paciente.cpf) {
                    cpfPaciente = String(paciente.cpf).replace(/\D/g, '')
                  }
                }

                let nomeMedico = consulta.nomeMedico || ''
                if (medicoAlterado && form.idMedico) {
                  const medico = await buscarMedicoPorId(form.idMedico)
                  if (medico) {
                    nomeMedico = medico.nome || ''
                  }
                }

                let nomeEspecialidade = consulta.especialidade || form.especialidade || ''
                if (especialidadeAlterada && form.especialidade) {
                  nomeEspecialidade = form.especialidade
                }

                let nomeUnidade = consulta.nomeUnidade || ''
                if (unidadeAlterada && form.tipoConsulta === 'PRESENCIAL' && form.idUnidade) {
                  const unidade = unidades.find(u => u.idUnidadeSaude === form.idUnidade)
                  if (unidade) {
                    nomeUnidade = unidade.nomeUnidadeSaude || ''
                  }
                } else if (form.tipoConsulta === 'ONLINE') {
                  nomeUnidade = 'Online'
                }

                const idUnidadeParaConsulta = form.tipoConsulta === 'PRESENCIAL' ? form.idUnidade : 1
                const dadosConsultaAtualizada = {
                  ...consulta,
                  cpfPaciente: cpfPaciente,
                  idMedico: form.idMedico,
                  idEspecialidade: form.idEspecialidade,
                  idUnidade: idUnidadeParaConsulta,
                  tipoAtendimento: form.tipoConsulta || 'PRESENCIAL',
                  nomeMedico: nomeMedico,
                  especialidade: nomeEspecialidade,
                  nomeUnidade: nomeUnidade,
                  data: dataFormatada,
                  horario: horarioFormatado,
                  dataHora: dataHoraISO,
                  status: dataHoraAlterada ? 'REAGENDADA' : consulta.status
                }

                const consultaRes = await fetch(`${API_URL}/consultas/${consulta.idConsulta}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                  body: JSON.stringify(dadosConsultaAtualizada),
                })

                if (!consultaRes.ok) {
                  await consultaRes.text()
                }
              }
            } catch (err) {
            }
          }
        }

        setSucesso('Agendamento atualizado com sucesso!')
      } else {
        const res = await fetch(`${API_URL}/agendamentos`, {
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
      
      reset({ 
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
      setDataHoraOriginal('')
      setMostrarAvisoReagendamento(false)
      setConfirmadoReagendamento(false)
      setIdMedicoOriginal(undefined)
      carregarAgendamentos(filtroStatus)
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro inesperado'
      setErro(mensagem)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelarAgendamento = async (agendamento: Agendamento) => {
    setLoading(true)
    setCancelandoId(agendamento.idAgendamento || null)
    setErro('')
    setSucesso('')
    
    try {
      const url = `${API_URL}/agendamentos/${agendamento.idAgendamento}/status?status=CANCELADO`
      
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Accept': 'application/json' },
      })
      
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Falha ao cancelar agendamento')
      }

      await res.json()
      
      setSucesso('Agendamento cancelado com sucesso!')
      await carregarAgendamentos(filtroStatus)
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao cancelar agendamento'
      setErro(mensagem)
    } finally {
      setLoading(false)
      setCancelandoId(null)
    }
  }

  const handleAlterarStatus = async (agendamento: Agendamento, novoStatus: string) => {
    setLoading(true)
    setErro('')
    setSucesso('')
    
    if (novoStatus === 'CONFIRMADO' && agendamento.idAgendamento) {
      setConfirmandoId(agendamento.idAgendamento)
    }
    
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

      const res = await fetch(`${API_URL}/agendamentos/${agendamento.idAgendamento}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(dadosAgendamento),
      })
      
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Falha ao atualizar status')
      }

      if (novoStatus === 'CONFIRMADO' && agendamento.idPaciente && agendamento.idMedico) {
        try {
          const paciente = await buscarPacientePorId(agendamento.idPaciente)
          if (!paciente || !paciente.cpf) {
            throw new Error('Não foi possível obter o CPF do paciente')
          }

          const cpfLimpo = String(paciente.cpf).replace(/\D/g, '')

          const medico = await buscarMedicoPorId(agendamento.idMedico)
          if (!medico) {
            throw new Error('Não foi possível obter os dados do médico')
          }
          const dataHora = new Date(agendamento.dataHora)
          const dataFormatada = dataHora.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
          const horarioFormatado = dataHora.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          })
          const dataHoraISO = dataHora.toISOString()

          const idUnidadeParaConsulta = (agendamento as any).idUnidadeSaude || agendamento.idUnidade || 1
          const tipoAtendimento = agendamento.tipoConsulta || (agendamento as any).tipoAtendimento || 'PRESENCIAL'
          const dadosConsulta = {
            idAgendamento: agendamento.idAgendamento,
            cpfPaciente: cpfLimpo,
            idMedico: agendamento.idMedico,
            idEspecialidade: agendamento.idEspecialidade,
            idUnidade: idUnidadeParaConsulta,
            tipoAtendimento: tipoAtendimento,
            especialidade: agendamento.especialidade || '',
            nomeMedico: medico.nome || agendamento.nomeMedico || '',
            data: dataFormatada,
            horario: horarioFormatado,
            dataHora: dataHoraISO,
            status: 'AGENDADA',
            link: 'https://meet.google.com/'
          }

          const consultaRes = await fetch(`${API_URL}/consultas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(dadosConsulta),
          })

          if (!consultaRes.ok) {
            await consultaRes.text()
          } else {
            await consultaRes.json()
          }
        } catch (consultaErr) {
        }
      }

      setSucesso('Status atualizado com sucesso!')
      await carregarAgendamentos(filtroStatus)
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao atualizar status'
      setErro(mensagem)
    } finally {
      setLoading(false)
      setConfirmandoId(null)
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

  return (
    <div className="bg-white py-4 sm:py-6 lg:py-8 min-h-screen overflow-x-hidden">
      <div className="mx-auto max-w-[95%] px-3 sm:px-4 md:px-6 lg:px-8 w-full box-border">
        <header className="mb-4 sm:mb-6 lg:mb-8 flex items-center justify-end">
          <Link to="/admin" className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200 whitespace-nowrap">
            Voltar ao Painel
          </Link>
        </header>

        <section className="mb-6 sm:mb-8">
          <div className="flex flex-row items-center gap-3 mb-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">Agendamentos Cadastrados</h2>
            <button
              onClick={() => {
                setMostrarFormulario(!mostrarFormulario)
                if (!mostrarFormulario) {
                  reset({ 
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
                  setIdMedicoOriginal(undefined)
                  setErro('')
                  setSucesso('')
                }
              }}
              className="hover:opacity-70 transition-opacity p-2 bg-green-100 rounded text-green-600 flex-shrink-0 min-h-[44px] sm:min-h-0 flex items-center justify-center"
              aria-label="Adicionar agendamento"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>

          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <label htmlFor="filtroStatus" className="text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap">Filtrar por Status:</label>
            <select 
              id="filtroStatus"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm w-full sm:w-auto min-h-[44px] sm:min-h-0"
            >
              <option value="TODOS">Todos</option>
              <option value="CONFIRMADO">Confirmado</option>
              <option value="PENDENTE">Pendente</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
          
          {loadingLista ? (
            <div className="text-slate-600 text-sm sm:text-base py-4">Carregando...</div>
          ) : agendamentos.length > 0 ? (
            <>
              <div className="hidden md:block bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
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
                      {agendamentos.map((a, i) => (
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
                              {a.status !== 'CANCELADO' ? (
                                <>
                                  {a.status === 'PENDENTE' && (
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
                                  {a.status !== 'CONFIRMADO' && (
                                    <button
                                      onClick={() => {
                                        setAgendamentoSelecionado(a)
                                        setMostrarModalReagendar(true)
                                      }}
                                      className="hover:opacity-70 transition-opacity p-2 bg-red-100 rounded text-red-600"
                                      aria-label="Cancelar agendamento"
                                      title="Cancelar agendamento"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  )}
                                </>
                              ) : (
                                <span className="text-sm text-gray-400 italic">Sem ações disponíveis</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="md:hidden space-y-3">
                {agendamentos.map((a, i) => (
                  <div key={i} className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
                    <div className="space-y-2 mb-3">
                      <div>
                        <span className="text-xs text-slate-500 font-medium">Paciente:</span>
                        <p className="text-sm text-slate-700 font-medium">{obterNomePaciente(a.idPaciente)}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 font-medium">Médico:</span>
                        <p className="text-sm text-slate-700">{a.nomeMedico || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 font-medium">Especialidade:</span>
                        <p className="text-sm text-slate-700">{a.especialidade || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 font-medium">Data/Hora:</span>
                        <p className="text-sm text-slate-700">{formatarDataHora(a.dataHora)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">Status:</span>
                        <span className="text-xs sm:text-sm text-slate-700">{a.status}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 font-medium">Tipo:</span>
                        <p className="text-sm text-slate-700">{a.tipoConsulta}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 font-medium">Unidade:</span>
                        <p className="text-sm text-slate-700">{a.nomeUnidade || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      {a.status !== 'CANCELADO' ? (
                        <div className="flex justify-center gap-2">
                          {a.status === 'PENDENTE' && (
                            <button
                              onClick={() => {
                                setAgendamentoSelecionado(a)
                                setMostrarModalConfirmar(true)
                              }}
                              className="flex-1 hover:opacity-70 transition-opacity px-3 py-2 bg-green-100 rounded text-green-600 text-sm font-medium min-h-[44px] flex items-center justify-center"
                              aria-label="Confirmar"
                            >
                              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Confirmar
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(a)}
                            className="flex-1 hover:opacity-70 transition-opacity px-3 py-2 bg-blue-100 rounded text-blue-600 text-sm font-medium min-h-[44px] flex items-center justify-center"
                            aria-label="Editar agendamento"
                          >
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                          </button>
                          {a.status !== 'CONFIRMADO' && (
                            <button
                              onClick={() => {
                                setAgendamentoSelecionado(a)
                                setMostrarModalReagendar(true)
                              }}
                              className="flex-1 hover:opacity-70 transition-opacity px-3 py-2 bg-red-100 rounded text-red-600 text-sm font-medium min-h-[44px] flex items-center justify-center"
                              aria-label="Cancelar agendamento"
                            >
                              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Cancelar
                            </button>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic text-center">Sem ações disponíveis</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 sm:p-6 text-center text-slate-600 text-sm sm:text-base">
              {filtroStatus === 'TODOS' 
                ? 'Nenhum agendamento cadastrado.' 
                : `Nenhum agendamento com status "${filtroStatus}".`
              }
            </div>
          )}
        </section>

        {sucesso && (
          <div className={`mb-4 text-sm font-medium ${sucesso.toLowerCase().includes('cancelado') ? 'text-red-600' : 'text-green-600'}`}>
            {sucesso}
          </div>
        )}
        {erro && <div ref={erroRef} className="mb-4 text-red-600 text-sm font-medium">{erro}</div>}

        {mostrarFormulario && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[95vh] overflow-y-auto relative">
              {mostrarAvisoReagendamento && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[60] rounded-lg">
                  <div className="bg-white mx-4 sm:mx-6 p-4 sm:p-6 rounded-lg shadow-xl max-w-md w-full border-2 border-yellow-400">
                    <div className="mb-4">
                      <h4 className="text-base sm:text-lg font-bold text-yellow-800 mb-2">
                        Atenção: Alteração de Data/Hora
                      </h4>
                      <p className="text-sm sm:text-base text-yellow-900 mb-4">
                        Você está alterando a data e hora de um agendamento confirmado. Ao atualizar, o status da consulta será alterado para <strong>REAGENDADA</strong> e o paciente será notificado sobre a mudança.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setMostrarAvisoReagendamento(false)
                          setConfirmadoReagendamento(true)
                        }}
                        className="flex-1 bg-yellow-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-yellow-700 transition-colors text-sm sm:text-base min-h-[44px] sm:min-h-0"
                      >
                        Estou Ciente!
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMostrarAvisoReagendamento(false)
                          setValue('dataHora', dataHoraOriginal, { shouldValidate: false })
                        }}
                        className="flex-1 bg-gray-200 text-gray-800 px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm sm:text-base min-h-[44px] sm:min-h-0"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 break-words pr-2">{editandoId ? 'Editar Agendamento' : 'Criar Novo Agendamento'}</h3>
                <button
                  onClick={() => {
                    setMostrarFormulario(false)
                    setEditandoId(null)
                    setDataHoraOriginal('')
                    setMostrarAvisoReagendamento(false)
                    setConfirmadoReagendamento(false)
                    setIdMedicoOriginal(undefined)
                    reset({ 
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
                  }}
                  disabled={loading}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 min-h-[44px] sm:min-h-0 flex items-center justify-center"
                  aria-label="Fechar formulário"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4">
                <div>
                  <label htmlFor="cpfPaciente" className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">CPF do Paciente</label>
                  <input 
                    id="cpfPaciente" 
                    {...register('cpfPaciente', {
                      required: 'CPF é obrigatório',
                      validate: (value) => {
                        if (!value) return 'CPF é obrigatório'
                        const cpfLimpo = value.replace(/\D/g, '')
                        if (cpfLimpo.length !== 11) {
                          return 'CPF deve ter 11 dígitos.'
                        }
                        return true
                      }
                    })} 
                    type="text"
                    placeholder="000.000.000-00"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base min-h-[44px] sm:min-h-0"
                  />
                  {errors.cpfPaciente && (
                    <div className="mt-1 text-xs sm:text-sm text-red-600">{errors.cpfPaciente.message}</div>
                  )}
                  {loadingPaciente && (
                    <div className="mt-1 text-xs sm:text-sm text-blue-600">Buscando paciente...</div>
                  )}
                </div>

                <div>
                  <label htmlFor="nomePaciente" className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Nome do Paciente</label>
                  <input 
                    id="nomePaciente" 
                    name="nomePaciente" 
                    type="text"
                    value={nomePaciente} 
                    readOnly
                    disabled
                    placeholder="Digite o CPF para buscar o paciente"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed text-sm sm:text-base min-h-[44px] sm:min-h-0"
                  />
                </div>

                <div>
                  <label htmlFor="especialidade" className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Especialidade</label>
                  <select 
                    id="especialidade" 
                    {...register('especialidade', { required: 'Selecione uma especialidade' })} 
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base min-h-[44px] sm:min-h-0"
                  >
                    <option value="">Selecione uma especialidade</option>
                    {especialidades.map((e) => (
                      <option key={e.idEspecialidade} value={e.nomeEspecialidade}>
                        {e.nomeEspecialidade}
                      </option>
                    ))}
                  </select>
                  {errors.especialidade && (
                    <div className="mt-1 text-xs sm:text-sm text-red-600">{errors.especialidade.message}</div>
                  )}
                </div>

                <div>
                  <label htmlFor="idMedico" className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Médico</label>
                  {carregandoMedicos && (
                    <div className="mb-2 text-xs sm:text-sm text-blue-600">Carregando médico...</div>
                  )}
                  <select 
                    id="idMedico" 
                    {...register('idMedico', { 
                      required: 'Selecione um médico',
                      validate: (value) => value !== 0 || 'Selecione um médico'
                    })} 
                    disabled={!especialidadeValue || carregandoMedicos}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed text-sm sm:text-base min-h-[44px] sm:min-h-0"
                  >
                    <option value={0}>
                      {carregandoMedicos 
                        ? 'Carregando médico...' 
                        : especialidadeValue 
                          ? 'Selecione um médico' 
                          : 'Selecione uma especialidade primeiro'}
                    </option>
                    {medicosFiltrados.map((m) => (
                      <option key={m.idMedico} value={m.idMedico}>
                        {m.nome} - {m.crmMedico}
                      </option>
                    ))}
                  </select>
                  {errors.idMedico && (
                    <div className="mt-1 text-xs sm:text-sm text-red-600">{errors.idMedico.message}</div>
                  )}
                </div>

                <div>
                  <label htmlFor="dataHora" className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Data e Hora</label>
                  <input 
                    id="dataHora" 
                    {...register('dataHora', { required: 'Selecione data e hora' })} 
                    type="datetime-local"
                    min="2000-01-01T00:00"
                    max="9999-12-31T23:59"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base min-h-[44px] sm:min-h-0"
                  />
                  {errors.dataHora && (
                    <div className="mt-1 text-xs sm:text-sm text-red-600">{errors.dataHora.message}</div>
                  )}
                </div>

                <div>
                  <label htmlFor="tipoConsulta" className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Tipo de Atendimento</label>
                  <select 
                    id="tipoConsulta" 
                    {...register('tipoConsulta')}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base min-h-[44px] sm:min-h-0"
                  >
                    <option value="PRESENCIAL">Presencial</option>
                    <option value="ONLINE">Online</option>
                  </select>
                </div>

                {tipoConsultaValue === 'PRESENCIAL' && (
                  <div>
                    <label htmlFor="idUnidade" className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Unidade de Atendimento</label>
                    <select 
                      id="idUnidade" 
                      {...register('idUnidade', { 
                        required: tipoConsultaValue === 'PRESENCIAL' ? 'Selecione uma unidade' : false
                      })} 
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base min-h-[44px] sm:min-h-0"
                    >
                      <option value="">Selecione uma unidade</option>
                      {unidades.map((unidade) => (
                        <option key={unidade.idUnidadeSaude} value={unidade.idUnidadeSaude}>
                          {unidade.nomeUnidadeSaude}
                        </option>
                      ))}
                    </select>
                    {errors.idUnidade && (
                      <div className="mt-1 text-xs sm:text-sm text-red-600">{errors.idUnidade.message}</div>
                    )}
                  </div>
                )}

                {erro && (
                  <div className="text-xs sm:text-sm text-red-600">{erro}</div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarFormulario(false)
                      setEditandoId(null)
                      setDataHoraOriginal('')
                      setMostrarAvisoReagendamento(false)
                      setConfirmadoReagendamento(false)
                      setIdMedicoOriginal(undefined)
                      reset({ 
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
                    }}
                    disabled={loading}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white min-h-[44px] sm:min-h-0 text-sm sm:text-base"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 min-h-[44px] sm:min-h-0 text-sm sm:text-base"
                  >
                    {loading ? 'Salvando...' : editandoId ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {mostrarModalReagendar && agendamentoSelecionado && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 break-words">Cancelar Agendamento</h3>
              <p className="text-sm sm:text-base text-slate-700 mb-4 sm:mb-6 break-words">
                Tem certeza que deseja marcar este agendamento como <span className="font-semibold text-red-600">CANCELADO</span>?
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setMostrarModalReagendar(false)
                    setAgendamentoSelecionado(null)
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px] sm:min-h-0 text-sm sm:text-base"
                >
                  Voltar
                </button>
                <button
                  onClick={async () => {
                    if (agendamentoSelecionado) {
                      setMostrarModalReagendar(false)
                      setAgendamentoSelecionado(null)
                      await handleCancelarAgendamento(agendamentoSelecionado)
                    }
                  }}
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white px-4 py-2.5 sm:py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px] sm:min-h-0 text-sm sm:text-base"
                >
                  Cancelar Agendamento
                </button>
              </div>
            </div>
          </div>
        )}

        {mostrarModalConfirmar && agendamentoSelecionado && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4 break-words">Confirmar Agendamento</h3>
              <p className="text-sm sm:text-base text-slate-700 mb-4 sm:mb-6 break-words">
                Tem certeza que deseja marcar este agendamento como <span className="font-semibold text-green-600">CONFIRMADO</span>?
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setMostrarModalConfirmar(false)
                    setAgendamentoSelecionado(null)
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px] sm:min-h-0 text-sm sm:text-base"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (agendamentoSelecionado) {
                      handleAlterarStatus(agendamentoSelecionado, 'CONFIRMADO')
                    }
                    setMostrarModalConfirmar(false)
                    setAgendamentoSelecionado(null)
                  }}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white px-4 py-2.5 sm:py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px] sm:min-h-0 text-sm sm:text-base"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmandoId && (
          <div className="fixed inset-0 z-[60] flex items-center">
            <div className="w-full py-6 bg-green-200/80 shadow-lg text-center">
              <span className="text-green-600 text-3xl sm:text-4xl md:text-5xl font-extrabold">Confirmando...</span>
            </div>
          </div>
        )}

        {cancelandoId && (
          <div className="fixed inset-0 z-[60] flex items-center">
            <div className="w-full py-6 bg-red-200/80 shadow-lg text-center">
              <span className="text-red-600 text-3xl sm:text-4xl md:text-5xl font-extrabold">Cancelando...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

