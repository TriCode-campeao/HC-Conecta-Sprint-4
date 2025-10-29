import { Link } from 'react-router-dom'

export default function Home() {

  const cards = [
    {
      icon: "img/consulta.png",
      title: "Minhas Consultas",
      description: "Consulte suas consultas agendadas e acesse os links das teleconsultas.",
      link: "/consultas"
    },
    {
      icon: "img/guia.png",
      title: "FAQ - Passo a passo",
      description: "Orientações rápidas: entrar na consulta, testar câmera e mais.",
      link: "/faq"
    },
    {
      icon: "img/equipe.png",
      title: "Equipe",
      description: "Conheça quem fez o HC Conecta: Nome, RM e Turma.",
      link: "/integrantes"
    },
    {
      icon: "img/contato.png",
      title: "Contato",
      description: "Dúvidas? Fale com a equipe.",
      link: "/contato"
    },
    {
      icon: "img/hc.png",
      title: "Sobre o Projeto",
      description: "Conheça mais sobre o HC Conecta e nossa missão.",
      link: "/sobre"
    }
  ]

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-6">
            HC Conecta
          </h1>
          <p className="text-lg text-slate-700 max-w-4xl mx-auto leading-relaxed">
            O HC Conecta é uma plataforma inovadora que conecta pacientes ao Hospital das Clínicas,
            facilitando o acesso aos serviços de saúde (teleconsultas) e melhorando a experiência do usuário.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto" aria-label="Serviços disponíveis">
          {cards.map((card, index) => (
            <article key={index}>
              <Link
                to={card.link}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-slate-200 hover:border-blue-300 group block"
                aria-label={`Acessar ${card.title}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 group-hover:scale-110 transition-transform">
                    <img
                      src={card.icon}
                      alt={`Ícone de ${card.title}`}
                      className="w-12 h-12"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-slate-900 mb-3">
                      {card.title}
                    </h2>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}
