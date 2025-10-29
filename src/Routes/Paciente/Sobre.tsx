import BotaoVoltarHome from '../../Components/BotaoVoltarHome/BotaoVoltarHome'

export default function Sobre() {
  return (
    <div className="bg-white py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <header className="mb-6">
          <div className="mb-4">
            <BotaoVoltarHome />
          </div>
          <h1 className="text-4xl font-bold text-blue-600 mb-6">
            Sobre o Projeto
          </h1>
          <p className="text-lg text-slate-700 leading-relaxed">
            O HC Conecta é um projeto com foco em ChatBot integrado com WhatsApp/Telegram que também tem sua versão web desenvolvida para facilitar o acesso de pacientes à saúde digital (teleconsultas), com foco especial em usuários com baixa afinidade tecnológica. O projeto visa reduzir o absenteísmo em teleconsultas oferecendo instruções simples, linguagem acessível e suporte passo a passo.
          </p>
        </header>
      </div>
    </div>
  )
}
