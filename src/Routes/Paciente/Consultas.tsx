import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import Botao from '../../Components/Botao/Botao'
import BotaoVoltarHome from '../../Components/BotaoVoltarHome/BotaoVoltarHome'

interface CpfFormData {
  cpf: string
}

interface Consulta {
  id?: number
  especialidade: string
  medico: string
  nomeMedico?: string
  cpf?: string
  cpfPaciente?: string
  data: string
  horario: string
  status: string
  link: string
  tipoAtendimento?: string
  local?: string
}

export default function Consultas() {
  const [cpfSalvo, setCpfSalvo] = useState('')
  const [showCpfInput, setShowCpfInput] = useState(false)
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loadingConsultas, setLoadingConsultas] = useState(false)
  const [tooltipConsulta, setTooltipConsulta] = useState<{ id: number | string, mensagem: string } | null>(null)
  const [atualizacaoTempo, setAtualizacaoTempo] = useState(Date.now())

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<CpfFormData>({
    defaultValues: {
      cpf: ''
    }
  })

  const buscarMedicoPorId = async (idMedico?: number) => {
    if (!idMedico) return null
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

  const buscarEspecialidadePorId = async (idEspecialidade?: number) => {
    if (!idEspecialidade) return null
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

  const buscarAgendamentoPorId = async (idAgendamento?: number) => {
    if (!idAgendamento) return null
    try {
      const res = await fetch(`https://hc-conecta-sprint-4-1.onrender.com/agendamentos/${idAgendamento}`, {
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

  const buscarUnidadePorId = async (idUnidade?: number) => {
    if (!idUnidade) return null
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

  const carregarConsultas = useCallback(async (cpf: string) => {
    if (!cpf) return
    
    setLoadingConsultas(true)
    try {
      const cpfLimpo = cpf.replace(/\D/g, '')
      const url = `https://hc-conecta-sprint-4-1.onrender.com/consultas/paciente/${cpfLimpo}`
      
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      })
      
      if (res.ok) {
        const dados = await res.json()
        
        let consultasArray: any[] = []
        
        if (Array.isArray(dados)) {
          consultasArray = dados
        } else if (dados && typeof dados === 'object') {
          if (dados.content && Array.isArray(dados.content)) {
            consultasArray = dados.content
          } else if (dados.consultas && Array.isArray(dados.consultas)) {
            consultasArray = dados.consultas
          } else if (dados.data && Array.isArray(dados.data)) {
            consultasArray = dados.data
          } else {
            consultasArray = [dados]
          }
        }
        
        const consultasEnriquecidas = await Promise.all(
          consultasArray.map(async (consulta: any) => {
            const idAgendamento = consulta.idAgendamento
            const idMedico = consulta.idMedico
            const idEspecialidade = consulta.idEspecialidade
            const idUnidade = consulta.idUnidade || (consulta as any).idUnidadeSaude
            
            let agendamentoData = null
            let medicoData = null
            let especialidadeData = null
            let unidadeData = null
            
            if (idAgendamento) {
              agendamentoData = await buscarAgendamentoPorId(idAgendamento)
              if (agendamentoData && !idEspecialidade && agendamentoData.idEspecialidade) {
                especialidadeData = await buscarEspecialidadePorId(agendamentoData.idEspecialidade)
              }
              if (agendamentoData && !idUnidade) {
                const idUnidadeAgendamento = agendamentoData.idUnidadeSaude || agendamentoData.idUnidade
                if (idUnidadeAgendamento) {
                  unidadeData = await buscarUnidadePorId(idUnidadeAgendamento)
                }
              }
            }
            
            if (idMedico) {
              medicoData = await buscarMedicoPorId(idMedico)
            }
            
            if (idEspecialidade && !especialidadeData) {
              especialidadeData = await buscarEspecialidadePorId(idEspecialidade)
            }
            
            if (idUnidade && !unidadeData) {
              unidadeData = await buscarUnidadePorId(idUnidade)
            }
            
            let especialidade = consulta.especialidade || ''
            let nomeMedico = consulta.nomeMedico || consulta.medico || ''
            let data = consulta.data || ''
            let horario = consulta.horario || ''
            let tipoAtendimento = consulta.tipoAtendimento || consulta.tipoConsulta || ''
            let local = consulta.local || consulta.nomeUnidade || ''
            let statusConsulta = consulta.status || ''
            
            if (agendamentoData) {
              if (agendamentoData.dataHora) {
                const dataHora = new Date(agendamentoData.dataHora)
                data = dataHora.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })
                horario = dataHora.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })
              }
              
              if (agendamentoData.especialidade && !especialidade) {
                especialidade = agendamentoData.especialidade
              }
              
              if (agendamentoData.nomeMedico && !nomeMedico) {
                nomeMedico = agendamentoData.nomeMedico
              }
              
              if (agendamentoData.tipoAtendimento && !tipoAtendimento) {
                tipoAtendimento = agendamentoData.tipoAtendimento
              } else if (agendamentoData.tipoConsulta && !tipoAtendimento) {
                tipoAtendimento = agendamentoData.tipoConsulta
              }
              
              if (agendamentoData.nomeUnidade && !local) {
                local = agendamentoData.nomeUnidade
              }
            }
            
            if (especialidadeData) {
              especialidade = especialidadeData.nomeEspecialidade || especialidade
            }
            
            if (medicoData) {
              nomeMedico = medicoData.nome || nomeMedico
            }
            
            if (unidadeData) {
              local = unidadeData.nomeUnidadeSaude || local
            }
            
            if (tipoAtendimento === 'ONLINE' && !local) {
              local = 'Online'
            }
            
            const statusFinal = statusConsulta || 'Agendada'
            const statusUpper = statusFinal.toUpperCase()
            
            return {
              id: consulta.idConsulta || consulta.id,
              especialidade: especialidade || 'Especialidade não informada',
              medico: nomeMedico,
              nomeMedico: nomeMedico,
              data: data,
              horario: horario,
              status: statusFinal,
              link: consulta.link || 'https://meet.google.com/',
              tipoAtendimento: tipoAtendimento || 'PRESENCIAL',
              local: local || 'Não informado',
              statusConsulta: statusUpper
            }
          })
        )
        
        const consultasFiltradasPorStatus = consultasEnriquecidas.filter((consulta: any) => {
          const status = consulta.statusConsulta || consulta.status?.toUpperCase() || ''
          return status !== 'CANCELADO' && status !== 'CANCELADA'
        })
        
        setConsultas(consultasFiltradasPorStatus)
      } else {
        setConsultas([])
      }
    } catch (error) {
      setConsultas([])
    } finally {
      setLoadingConsultas(false)
    }
  }, [])

  useEffect(() => {
    if (cpfSalvo) {
      carregarConsultas(cpfSalvo)
    } else {
      setConsultas([])
    }
  }, [cpfSalvo, carregarConsultas])

  useEffect(() => {
    if (consultas.length === 0) return
    
    const interval = setInterval(() => {
      setAtualizacaoTempo(Date.now())
    }, 60000)
    
    const handleScroll = () => {
      setTooltipConsulta(null)
    }
    
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [consultas])

  const verificarAcessoConsulta = (data: string, horario: string) => {
    try {
      const [dia, mes, ano] = data.split('/')
      const [hora, minuto] = horario.split(':')
      
      const dataHoraConsulta = new Date(
        parseInt(ano),
        parseInt(mes) - 1,
        parseInt(dia),
        parseInt(hora),
        parseInt(minuto)
      )
      
      const agora = new Date()
      const quinzeMinutosAntes = new Date(dataHoraConsulta.getTime() - 15 * 60 * 1000)
      const cincoMinutosDepois = new Date(dataHoraConsulta.getTime() + 5 * 60 * 1000)
      
      if (agora < quinzeMinutosAntes) {
        return {
          acessivel: false,
          mensagem: 'Você só poderá acessar a chamada 15 minutos antes do horário agendado.'
        }
      } else if (agora >= quinzeMinutosAntes && agora <= cincoMinutosDepois) {
        return {
          acessivel: true,
          mensagem: ''
        }
      } else {
        return {
          acessivel: false,
          mensagem: 'O horário da consulta já passou. Em caso de atraso, entre em contato conosco.'
        }
      }
    } catch {
      return {
        acessivel: false,
        mensagem: 'Erro ao verificar horário da consulta.'
      }
    }
  }


  const validarCPF = (cpf: string): boolean => {
    const cpfLimpo = cpf.replace(/\D/g, '')

    if (cpfLimpo.length !== 11) return false

    if (/^(\d)\1{10}$/.test(cpfLimpo)) return false

    let soma = 0
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (10 - i)
    }
    let resto = soma % 11
    let digito1 = resto < 2 ? 0 : 11 - resto
    if (parseInt(cpfLimpo.charAt(9)) !== digito1) return false

    soma = 0
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (11 - i)
    }
    resto = soma % 11
    let digito2 = resto < 2 ? 0 : 11 - resto
    if (parseInt(cpfLimpo.charAt(10)) !== digito2) return false

    return true
  }

  const formatarCPF = (valor: string): string => {
    const cpfLimpo = valor.replace(/\D/g, '')
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, '')
    if (valor.length <= 11) {
      setValue('cpf', valor)
    }
  }

  const onSubmit = (data: CpfFormData) => {
    if (data.cpf.length === 11) {
      if (validarCPF(data.cpf)) {
        setCpfSalvo(formatarCPF(data.cpf))
        setShowCpfInput(false)
        reset()
      }
    }
  }

  const excluirCPF = () => {
    setCpfSalvo('')
    setConsultas([])
    reset()
  }

  const editarCPF = () => {
    setValue('cpf', cpfSalvo.replace(/\D/g, ''))
    setShowCpfInput(true)
  }


  return (
    <div className="bg-white py-4 sm:py-6 lg:py-8 min-h-screen overflow-x-hidden">
      <div className="mx-auto max-w-4xl px-3 sm:px-4 md:px-6 lg:px-8 w-full box-border">
        <header className="mb-4 sm:mb-6">
          <div className="mb-3 sm:mb-4">
            <BotaoVoltarHome />
          </div>
          <div className="text-center px-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-blue-600 mb-2 sm:mb-3 md:mb-4">
              Minhas Consultas
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-700 px-2">
              Visualize suas consultas confirmadas e acesse os links para as teleconsultas.
            </p>
          </div>
        </header>

        <section className="flex justify-center sm:justify-end mb-6 sm:mb-8" aria-label="Status de login">
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 sm:p-4 w-full max-w-md">
            <div className="flex flex-col items-start gap-2 w-full">
              <span className="text-slate-600 text-xs sm:text-sm">Logado como:</span>
              {!showCpfInput ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full">
                  <span className="text-slate-700 text-xs sm:text-sm md:text-base break-all flex-1 min-w-0">
                    {cpfSalvo || 'CPF não informado'}
                  </span>
                  {cpfSalvo ? (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Botao
                        onClick={editarCPF}
                        variant="primary"
                        size="sm"
                        className="flex-1 sm:flex-none"
                      >
                        Editar
                      </Botao>
                      <Botao
                        onClick={excluirCPF}
                        variant="danger"
                        size="sm"
                        className="flex-1 sm:flex-none"
                      >
                        ✕
                      </Botao>
                    </div>
                  ) : (
                    <Botao
                      onClick={() => setShowCpfInput(true)}
                      variant="primary"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      Preencher
                    </Botao>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2 w-full">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      placeholder="Insira seu CPF"
                      {...register('cpf', {
                        required: 'CPF é obrigatório',
                        minLength: {
                          value: 11,
                          message: 'CPF deve ter 11 dígitos'
                        },
                        validate: (value) => {
                          if (value.length === 11) {
                            return validarCPF(value) || 'CPF inválido'
                          }
                          return true
                        }
                      })}
                      onChange={handleCpfChange}
                      maxLength={11}
                      className="border border-gray-300 rounded px-3 py-2 sm:py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-1 min-w-0"
                    />
                    <Botao
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="w-full sm:w-auto min-h-[44px] sm:min-h-0"
                    >
                      Salvar
                    </Botao>
                  </div>
                  {errors.cpf && (
                    <span className="text-red-600 text-xs">{errors.cpf.message}</span>
                  )}
                </form>
              )}
            </div>
          </div>
        </section>

        <section className="mb-6 sm:mb-8" aria-label="Lista de consultas">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 mb-2 px-2">
            Suas Consultas
          </h2>
          <p className="text-slate-700 mb-3 sm:mb-4 text-sm sm:text-base px-2">
            Visualize suas consultas confirmadas e acesse os links das teleconsultas.
          </p>

          {cpfSalvo && (
            <div className="mt-4 sm:mt-6 w-full">
              {loadingConsultas ? (
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 sm:p-8 text-center">
                  <p className="text-slate-700 text-sm sm:text-base">Carregando consultas...</p>
                </div>
              ) : consultas.length > 0 ? (
                <div className="space-y-3 sm:space-y-4 w-full" role="list" aria-label="Lista de consultas agendadas">
                  {consultas.map((consulta, index) => (
                    <article key={consulta.id || `consulta-${index}`} className="bg-gray-100 border border-gray-300 rounded-lg p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow w-full box-border overflow-visible" role="listitem">
                      <div className="flex flex-col mb-4 gap-3 w-full">
                        <div className="w-full">
                          <h3 className="text-base sm:text-lg md:text-xl font-bold text-blue-600 mb-3 break-words">
                            {consulta.especialidade}
                          </h3>
                          <div className="space-y-2 mb-3">
                            <p className="text-slate-700 text-sm break-words">
                              <strong className="font-semibold">Médico:</strong> {consulta.medico}
                            </p>
                            <p className="text-slate-700 text-sm break-words">
                              <strong className="font-semibold">Tipo de Atendimento:</strong> {consulta.tipoAtendimento === 'ONLINE' ? 'Online' : 'Presencial'}
                            </p>
                            <p className="text-slate-700 text-sm break-words">
                              <strong className="font-semibold">Local:</strong> {consulta.local}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-row items-center justify-between gap-3 pt-3 border-t border-gray-300">
                          <div className="flex flex-col gap-1">
                            <p className="text-slate-700 text-sm">
                              <strong className="font-semibold">Data:</strong> {consulta.data}
                            </p>
                            <p className="text-slate-700 text-sm">
                              <strong className="font-semibold">Horário:</strong> {consulta.horario}
                            </p>
                          </div>
                          <span className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap flex-shrink-0 ${consulta.status === 'Agendada' || consulta.status === 'AGENDADA'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                            }`}>
                            {consulta.status}
                          </span>
                        </div>
                      </div>
                      {consulta.tipoAtendimento === 'ONLINE' && (() => {
                        atualizacaoTempo
                        const acesso = verificarAcessoConsulta(consulta.data, consulta.horario)
                        const consultaId = consulta.id || `consulta-${index}`
                        const mostrarTooltip = tooltipConsulta?.id === consultaId
                        
                        return (
                          <div className="w-full mt-3 pt-3 border-t border-gray-300">
                            {acesso.acessivel ? (
                              <a
                                href={consulta.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm sm:text-base font-bold hover:bg-blue-700 active:bg-blue-800 transition-colors w-full text-center block min-h-[44px] flex items-center justify-center box-border"
                                aria-label={`Entrar na consulta de ${consulta.especialidade} com ${consulta.medico}`}
                              >
                                Entrar na Consulta
                              </a>
                            ) : (
                              <div className="relative z-[1000]">
                                {mostrarTooltip && tooltipConsulta && (
                                  <div 
                                    className="absolute bottom-full left-0 right-0 mb-2 bg-gray-900 text-white text-xs sm:text-sm px-4 py-3 rounded-lg shadow-xl z-[1001]"
                                  >
                                    <p className="whitespace-normal break-words text-center">{tooltipConsulta.mensagem}</p>
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                      <div className="w-3 h-3 bg-gray-900 rotate-45"></div>
                                    </div>
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    if (mostrarTooltip && tooltipConsulta?.id === consultaId) {
                                      setTooltipConsulta(null)
                                    } else {
                                      setTooltipConsulta({ id: consultaId, mensagem: acesso.mensagem })
                                    }
                                  }}
                                  className="bg-blue-400 text-white px-6 py-3 rounded-lg text-sm sm:text-base font-bold cursor-not-allowed opacity-60 w-full text-center min-h-[44px] flex items-center justify-center box-border"
                                  aria-label={acesso.mensagem}
                                >
                                  Entrar na Consulta
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 sm:p-8 text-center">
                  <p className="text-slate-700 text-sm sm:text-base px-2 break-words">
                    Nenhuma consulta confirmada para este CPF.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {!cpfSalvo && (
          <section className="bg-gray-100 border border-gray-300 rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 w-full box-border" aria-label="Instruções para visualizar consultas">
            <div className="text-center w-full">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-3 sm:mb-4 break-words">
                Informe seu CPF!
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-slate-700 px-2 break-words">
                Para visualizar suas consultas, preencha o CPF acima.
              </p>
            </div>
          </section>
        )}

        <section className="bg-gray-100 border border-gray-300 rounded-lg p-4 sm:p-6 lg:p-8 w-full box-border" aria-label="Informações importantes sobre consultas">
          <div className="mb-3 sm:mb-4 w-full">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-red-600 break-words">
              Informações Importantes
            </h3>
          </div>
          <ul className="space-y-2 text-sm text-slate-700 list-disc list-inside break-words mb-4 sm:mb-6 pl-2" role="list">
            <li className="break-words"><strong>Consultas Online:</strong> Acesse o link da consulta 5 minutos antes do horário agendado</li>
            <li className="break-words"><strong>Consultas Online:</strong> Certifique-se de ter uma conexão estável com a internet</li>
            <li className="break-words"><strong>Consultas Online:</strong> Teste sua câmera e microfone antes da consulta</li>
            <li className="break-words"><strong>Consultas Presenciais:</strong> Chegue com pelo menos 15 minutos de antecedência</li>
            <li className="break-words"><strong>Consultas Presenciais:</strong> Traga um documento de identidade com foto</li>
            <li className="break-words"><strong>Consultas Presenciais:</strong> Dirija-se ao local indicado na sua consulta</li>
          </ul>
          <div className="text-center pt-4 border-t border-gray-300">
            <p className="text-sm text-slate-700 mb-4">
              Em caso de problemas ou dúvidas
            </p>
            <Link to="/contato" className="inline-block w-full sm:w-auto">
              <Botao
                variant="primary"
                size="md"
                className="w-full sm:w-auto min-h-[44px]"
              >
                Entre em contato conosco
              </Botao>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
