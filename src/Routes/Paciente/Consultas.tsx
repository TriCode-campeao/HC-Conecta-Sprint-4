import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
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
}

export default function Consultas() {
  const [cpfSalvo, setCpfSalvo] = useState('')
  const [showCpfInput, setShowCpfInput] = useState(false)
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [consultasFiltradas, setConsultasFiltradas] = useState<Consulta[]>([])
  const [especialidadeFiltro, setEspecialidadeFiltro] = useState('Todas')
  const [showFiltros, setShowFiltros] = useState(false)
  const [loadingConsultas, setLoadingConsultas] = useState(false)

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<CpfFormData>({
    defaultValues: {
      cpf: ''
    }
  })

  const carregarConsultas = useCallback(async (cpf: string) => {
    if (!cpf) return
    
    setLoadingConsultas(true)
    try {
      const cpfLimpo = cpf.replace(/\D/g, '')
      console.log('Buscando consultas para CPF:', cpfLimpo)
      
      let res = await fetch(`https://hc-conecta-sprint-4-1.onrender.com/consultas/cpf/${cpfLimpo}`, {
        headers: { 'Accept': 'application/json' },
      })
      
      if (!res.ok || res.status === 404) {
        console.log('Endpoint por CPF não encontrado, buscando todas as consultas')
        res = await fetch('https://hc-conecta-sprint-4-1.onrender.com/consultas', {
          headers: { 'Accept': 'application/json' },
        })
      }
      
      if (res.ok) {
        const todasConsultas = await res.json()
        const consultasArray = Array.isArray(todasConsultas) ? todasConsultas : []
        
        console.log('Total de consultas retornadas:', consultasArray.length)
        console.log('Todas as consultas:', consultasArray)
        console.log('Resposta completa da API:', JSON.stringify(todasConsultas, null, 2))
        
        const consultasDoPaciente = consultasArray.filter((consulta: any) => {
          const cpfConsulta = String(consulta.cpfPaciente || consulta.cpf || consulta.cpfPaciente || '')
          const cpfConsultaLimpo = cpfConsulta.replace(/\D/g, '')
          
          const statusConsulta = String(consulta.status || '').toUpperCase()
          const statusValido = statusConsulta === 'AGENDADA' ||
                               statusConsulta === 'CONFIRMADA' || 
                               statusConsulta === 'CONFIRMADO' ||
                               consulta.status === 'Agendada' ||
                               consulta.status === 'Confirmada' ||
                               consulta.status === 'Confirmado'
          
          const cpfMatch = cpfConsultaLimpo === cpfLimpo
          
          console.log('Consulta:', {
            cpfConsulta: cpfConsulta,
            cpfConsultaLimpo,
            cpfLimpo,
            cpfMatch,
            status: consulta.status,
            statusValido
          })
          
          return cpfMatch && statusValido
        })
        
        console.log('Consultas do paciente encontradas:', consultasDoPaciente.length, consultasDoPaciente)
        
        const consultasFormatadas: Consulta[] = consultasDoPaciente.map((consulta: any) => ({
          id: consulta.idConsulta || consulta.id,
          especialidade: consulta.especialidade || '',
          medico: consulta.nomeMedico || consulta.medico || '',
          nomeMedico: consulta.nomeMedico || consulta.medico || '',
          data: consulta.data || '',
          horario: consulta.horario || '',
          status: consulta.status || 'Agendada',
          link: consulta.link || 'https://meet.google.com/'
        }))
        
        console.log('Consultas formatadas:', consultasFormatadas)
        
        setConsultas(consultasFormatadas)
        setConsultasFiltradas(consultasFormatadas)
      } else {
        console.error('Erro ao buscar consultas. Status:', res.status)
        setConsultas([])
        setConsultasFiltradas([])
      }
    } catch (error) {
      console.error('Erro ao carregar consultas:', error)
      setConsultas([])
      setConsultasFiltradas([])
    } finally {
      setLoadingConsultas(false)
    }
  }, [])

  useEffect(() => {
    if (cpfSalvo) {
      carregarConsultas(cpfSalvo)
    } else {
      setConsultas([])
      setConsultasFiltradas([])
    }
  }, [cpfSalvo, carregarConsultas])

  const especialidades = ['Todas', 'Cardiologia', 'Pediatria', 'Ortopedia', 'Dermatologia', 'Ginecologia', 'Neurologia', 'Psiquiatria', 'Oftalmologia', 'Endocrinologia', 'Gastroenterologia', 'Pneumologia', 'Infectologia']

  const filtrarConsultas = (especialidade: string) => {
    setEspecialidadeFiltro(especialidade)
    if (especialidade === 'Todas') {
      setConsultasFiltradas(consultas)
    } else {
      setConsultasFiltradas(consultas.filter(consulta => consulta.especialidade === especialidade))
    }
    setShowFiltros(false)
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
        console.log('CPF válido:', formatarCPF(data.cpf))
      }
    }
  }

  const excluirCPF = () => {
    setCpfSalvo('')
    setConsultas([])
    setConsultasFiltradas([])
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
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setShowFiltros(!showFiltros)}
              className="bg-white border border-blue-300 text-slate-700 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg hover:bg-blue-50 active:bg-blue-100 transition-colors flex items-center justify-between gap-2 w-full sm:w-auto min-h-[44px] sm:min-h-0"
              aria-label="Filtrar consultas por especialidade"
              aria-expanded={showFiltros}
            >
              <span className="hidden sm:inline text-sm sm:text-base flex-shrink-0">Filtrar por Especialidade:</span>
              <span className="sm:hidden text-sm font-medium flex-shrink-0">Filtrar:</span>
              <span className="truncate text-sm sm:text-base min-w-0 flex-1 text-left">{especialidadeFiltro}</span>
              <svg className={`w-4 h-4 flex-shrink-0 transition-transform ${showFiltros ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showFiltros && (
              <>
                <div 
                  className="fixed inset-0 z-[5] sm:hidden" 
                  onClick={() => setShowFiltros(false)}
                  aria-hidden="true"
                />
                <div className="absolute top-full left-0 right-0 sm:left-auto sm:right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 w-full sm:w-48 max-h-[60vh] sm:max-h-none overflow-y-auto" role="menu" aria-label="Opções de filtro">
                  {especialidades.map((especialidade) => (
                    <button
                      key={especialidade}
                      onClick={() => filtrarConsultas(especialidade)}
                      className={`w-full text-left px-3 sm:px-3 py-2.5 sm:py-2 hover:bg-blue-50 active:bg-blue-100 transition-colors text-sm sm:text-base min-h-[44px] sm:min-h-0 flex items-center ${especialidadeFiltro === especialidade ? 'bg-blue-100 text-blue-700 font-medium' : 'text-slate-700'
                        }`}
                      role="menuitem"
                      aria-label={`Filtrar por ${especialidade}`}
                    >
                      {especialidade}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {cpfSalvo && (
            <div className="mt-4 sm:mt-6 w-full">
              {loadingConsultas ? (
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 sm:p-8 text-center">
                  <p className="text-slate-700 text-sm sm:text-base">Carregando consultas...</p>
                </div>
              ) : consultasFiltradas.length > 0 ? (
                <div className="space-y-3 sm:space-y-4 w-full" role="list" aria-label="Lista de consultas agendadas">
                  {consultasFiltradas.map((consulta, index) => (
                    <article key={consulta.id || `consulta-${index}`} className="bg-gray-100 border border-gray-300 rounded-lg p-3 sm:p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow w-full box-border" role="listitem">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-3 sm:mb-4 gap-3 sm:gap-4 w-full">
                        <div className="flex-1 min-w-0 w-full">
                          <h3 className="text-base sm:text-lg md:text-xl font-bold text-blue-600 mb-2 break-words">
                            {consulta.especialidade}
                          </h3>
                          <div className="space-y-1">
                            <p className="text-slate-700 text-xs sm:text-sm md:text-base break-words">
                              <strong className="font-semibold">Médico:</strong> <span className="break-words">{consulta.medico}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-row sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-2 sm:gap-3 lg:gap-1 lg:text-right flex-shrink-0 w-full sm:w-auto">
                          <div className="flex flex-col gap-1 sm:gap-0.5 flex-shrink-0">
                            <p className="text-slate-700 text-xs sm:text-sm md:text-base">
                              <strong className="font-semibold">Data:</strong> <span className="whitespace-nowrap">{consulta.data}</span>
                            </p>
                            <p className="text-slate-700 text-xs sm:text-sm md:text-base">
                              <strong className="font-semibold">Horário:</strong> <span className="whitespace-nowrap">{consulta.horario}</span>
                            </p>
                          </div>
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0 ${consulta.status === 'Agendada'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                            }`}>
                            {consulta.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 sm:mt-4 w-full">
                        <a
                          href={consulta.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors w-full text-center block min-h-[44px] sm:min-h-0 flex items-center justify-center box-border"
                          aria-label={`Entrar na consulta de ${consulta.especialidade} com ${consulta.medico}`}
                        >
                          Entrar na Consulta
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 sm:p-8 text-center">
                  <p className="text-slate-700 text-sm sm:text-base px-2 break-words">
                    {especialidadeFiltro === 'Todas'
                      ? 'Nenhuma consulta confirmada para este CPF.'
                      : `Nenhuma consulta confirmada de ${especialidadeFiltro} para este CPF.`
                    }
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
          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm md:text-base text-slate-700 list-disc list-inside break-words" role="list">
            <li className="break-words">Acesse o link da consulta 5 minutos antes do horário agendado</li>
            <li className="break-words">Certifique-se de ter uma conexão estável com a internet</li>
            <li className="break-words">Teste sua câmera e microfone antes da consulta</li>
            <li className="break-words">Em caso de problemas, entre em contato conosco</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
