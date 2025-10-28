import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Botao from '../components/Botao/Botao'
import BotaoVoltarHome from '../components/BotaoVoltarHome/BotaoVoltarHome'

interface CpfFormData {
  cpf: string
}

export default function Consultas() {
  const [cpfSalvo, setCpfSalvo] = useState('')
  const [showCpfInput, setShowCpfInput] = useState(false)

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<CpfFormData>({
    defaultValues: {
      cpf: ''
    }
  })

  const [consultas] = useState([
    {
      id: 1,
      especialidade: 'Clínica Geral',
      medico: 'Dr. Carlos Oliveira',
      cpf: '771.583.130-18',
      data: '15/01/2025',
      horario: '09:00',
      status: 'Agendada',
      link: 'https://meet.google.com/'
    },
    {
      id: 2,
      especialidade: 'Pediatria',
      medico: 'Dra. Ana Costa',
      cpf: '771.583.130-18',
      data: '18/01/2025',
      horario: '14:30',
      status: 'Confirmada',
      link: 'https://meet.google.com/'
    },
    {
      id: 3,
      especialidade: 'Ginecologia',
      medico: 'Dra. Maria Santos',
      cpf: '771.583.130-18',
      data: '22/01/2025',
      horario: '10:15',
      status: 'Agendada',
      link: 'https://meet.google.com/'
    },
    {
      id: 4,
      especialidade: 'Dermatologia',
      medico: 'Dr. Pedro Lima',
      cpf: '771.583.130-18',
      data: '25/01/2025',
      horario: '16:00',
      status: 'Confirmada',
      link: 'https://meet.google.com/'
    },
    {
      id: 5,
      especialidade: 'Cardiologia',
      medico: 'Dr. João Silva',
      cpf: '771.583.130-18',
      data: '28/01/2025',
      horario: '11:30',
      status: 'Agendada',
      link: 'https://meet.google.com/'
    }
  ])

  const [consultasFiltradas, setConsultasFiltradas] = useState(consultas)
  const [especialidadeFiltro, setEspecialidadeFiltro] = useState('Todas')
  const [showFiltros, setShowFiltros] = useState(false)

  const especialidades = ['Todas', 'Clínica Geral', 'Pediatria', 'Ginecologia', 'Dermatologia', 'Cardiologia']

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
    reset()
  }

  const editarCPF = () => {
    setValue('cpf', cpfSalvo.replace(/\D/g, ''))
    setShowCpfInput(true)
  }


  return (
    <div className="bg-white py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <header className="mb-6">
          <div className="mb-4">
            <BotaoVoltarHome />
          </div>
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-4">
              Minhas Consultas
            </h1>
            <p className="text-base sm:text-lg text-slate-700">
              Visualize suas consultas agendadas e acesse os links para as teleconsultas.
            </p>
          </div>
        </header>

        <section className="flex justify-end mb-8" aria-label="Status de login">
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 w-full max-w-md">
            <div className="flex flex-col items-start gap-2">
              <span className="text-slate-600">Logado como:</span>
              {!showCpfInput ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
                  <span className="text-slate-700 text-sm sm:text-base break-all">
                    {cpfSalvo || 'CPF não informado'}
                  </span>
                  {cpfSalvo ? (
                    <div className="flex gap-2">
                      <Botao
                        onClick={editarCPF}
                        variant="primary"
                        size="sm"
                      >
                        Editar
                      </Botao>
                      <Botao
                        onClick={excluirCPF}
                        variant="danger"
                        size="sm"
                      >
                        ✕
                      </Botao>
                    </div>
                  ) : (
                    <Botao
                      onClick={() => setShowCpfInput(true)}
                      variant="primary"
                      size="sm"
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
                      className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500 flex-1"
                    />
                    <Botao
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="w-full sm:w-auto"
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

        <section className="mb-8" aria-label="Lista de consultas">
          <h2 className="text-xl font-bold text-blue-600 mb-2">
            Suas Consultas
          </h2>
          <p className="text-slate-700 mb-4">
            Gerencie suas consultas e acesse os links das teleconsultas.
          </p>
          <div className="relative">
            <button
              onClick={() => setShowFiltros(!showFiltros)}
              className="bg-white border border-blue-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 w-full sm:w-auto"
              aria-label="Filtrar consultas por especialidade"
              aria-expanded={showFiltros}
            >
              <span className="hidden sm:inline">Filtrar por Especialidade:</span>
              <span className="sm:hidden">Filtrar:</span>
              <span className="truncate">{especialidadeFiltro}</span>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showFiltros && (
              <div className="absolute top-full left-0 right-0 sm:right-auto mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 w-full sm:w-48" role="menu" aria-label="Opções de filtro">
                {especialidades.map((especialidade) => (
                  <button
                    key={especialidade}
                    onClick={() => filtrarConsultas(especialidade)}
                    className={`w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors text-sm ${especialidadeFiltro === especialidade ? 'bg-blue-100 text-blue-700' : 'text-slate-700'
                      }`}
                    role="menuitem"
                    aria-label={`Filtrar por ${especialidade}`}
                  >
                    {especialidade}
                  </button>
                ))}
              </div>
            )}
          </div>

          {cpfSalvo && (
            <div className="mt-6">
              {consultasFiltradas.length > 0 ? (
                <div className="space-y-4" role="list" aria-label="Lista de consultas agendadas">
                  {consultasFiltradas.map((consulta) => (
                    <article key={consulta.id} className="bg-gray-100 border border-gray-300 rounded-lg p-4" role="listitem">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-3 gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-blue-600 mb-2">
                            {consulta.especialidade}
                          </h3>
                          <div className="space-y-1">
                            <p className="text-slate-700 text-sm sm:text-base">
                              <strong>Médico:</strong> {consulta.medico}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:gap-1 lg:text-right">
                          <div className="flex flex-col sm:flex-row lg:flex-col gap-1">
                            <p className="text-slate-700 text-sm sm:text-base">
                              <strong>Data:</strong> {consulta.data}
                            </p>
                            <p className="text-slate-700 text-sm sm:text-base">
                              <strong>Horário:</strong> {consulta.horario}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium self-start sm:self-center lg:self-end ${consulta.status === 'Agendada'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                            }`}>
                            {consulta.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <a
                          href={consulta.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors w-full text-center block"
                          aria-label={`Entrar na consulta de ${consulta.especialidade} com ${consulta.medico}`}
                        >
                          Entrar na Consulta
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-slate-700">
                    {especialidadeFiltro === 'Todas'
                      ? 'Nenhuma consulta agendada para este CPF.'
                      : `Nenhuma consulta de ${especialidadeFiltro} agendada.`
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {!cpfSalvo && (
          <section className="bg-gray-100 border border-gray-300 rounded-lg p-4 sm:p-6 lg:p-8 mb-8" aria-label="Instruções para visualizar consultas">
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">
                Informe seu CPF!
              </h3>
              <p className="text-sm sm:text-base text-slate-700">
                Para visualizar suas consultas, preencha o CPF acima.
              </p>
            </div>
          </section>
        )}

        <section className="bg-gray-100 border border-gray-300 rounded-lg p-4 sm:p-6 lg:p-8" aria-label="Informações importantes sobre consultas">
          <div className="mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-red-600">
              Informações Importantes
            </h3>
          </div>
          <ul className="space-y-2 text-sm sm:text-base text-slate-700" role="list">
            <li>• Acesse o link da consulta 5 minutos antes do horário agendado</li>
            <li>• Certifique-se de ter uma conexão estável com a internet</li>
            <li>• Teste sua câmera e microfone antes da consulta</li>
            <li>• Em caso de problemas, entre em contato conosco</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
