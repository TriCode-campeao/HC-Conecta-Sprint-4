import BotaoVoltarHome from '../../Components/BotaoVoltarHome/BotaoVoltarHome'

export default function Contato() {
  return (
    <div className="bg-white py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <header className="mb-6">
          <div className="mb-4">
            <BotaoVoltarHome />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-blue-600 mb-6">Entre em contato via WhatsApp</h1>
            <p className="text-lg text-slate-700 mb-8">Para dúvidas sobre teleconsultas, entre em contato conosco pelo WhatsApp. Nossa equipe está disponível para ajudar!</p>
            <a
              href="https://www.whatsapp.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-green-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-600 transition-colors shadow-lg"
              aria-label="Abrir WhatsApp para contato"
            >
              <img src="img/WhatsApp.png" alt="WhatsApp" className="w-6 h-6" />
              Clique aqui!
            </a>
          </div>
        </header>
      </div>
    </div>
  )
}
