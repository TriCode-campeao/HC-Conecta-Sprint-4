import BotaoVoltarHome from '../Components/BotaoVoltarHome/BotaoVoltarHome.tsx'

interface Integrante {
  id: number
  nome: string
  rm: string
  turma: string
  foto: string
  github: string
  linkedin: string
}

export default function Integrantes() {
  const integrantes: Integrante[] = [
    {
      id: 1,
      nome: "Geovanne Coneglian Passos",
      rm: "562673",
      turma: "1TDSPY",
      foto: "/img/geovanne.png",
      github: "https://github.com/GeovanneCP",
      linkedin: "https://www.linkedin.com/in/geovanne-coneglian-775472353/"
    },
    {
      id: 2,
      nome: "Guilherme Soares de Almeida",
      rm: "563143",
      turma: "1TDSPY",
      foto: "/img/guilherme.jpg",
      github: "https://github.com/GuuiSOares",
      linkedin: "https://www.linkedin.com/in/guilherme-soares-de-almeida"
    },
    {
      id: 3,
      nome: "Lucas Silva Gastão Pinheiro",
      rm: "563960",
      turma: "1TDSPY",
      foto: "/img/lucas.png",
      github: "https://github.com/Lucasgastaop",
      linkedin: "https://www.linkedin.com/in/lucas-pinheiro-1a7154291/"
    }
  ]

  return (
    <div className="bg-white py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        <header className="mb-6">
          <div className="mb-4">
            <BotaoVoltarHome />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-blue-600 mb-4">
              Integrantes
            </h1>
            <p className="text-lg text-slate-700">
              Conheça nossa equipe de desenvolvimento.
            </p>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8" aria-label="Equipe de desenvolvimento">
          {integrantes.map((integrante) => (
            <article
              key={integrante.id}
              className="text-center"
            >
              <div className="mb-4">
                <img
                  src={integrante.foto}
                  alt={`Foto de ${integrante.nome}`}
                  className="w-32 h-32 rounded-full mx-auto object-cover"
                />
              </div>
              <h2 className="text-xl font-bold text-blue-600 mb-2">
                {integrante.nome}
              </h2>
              <p className="text-slate-600 mb-4">
                RM{integrante.rm} - {integrante.turma}
              </p>
              <nav className="flex justify-center gap-4" aria-label={`Links de ${integrante.nome}`}>
                <a
                  href={integrante.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  aria-label={`GitHub de ${integrante.nome}`}
                >
                  <img
                    src="/img/github.png"
                    alt="GitHub"
                    className="w-8 h-8"
                  />
                </a>
                <a
                  href={integrante.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  aria-label={`LinkedIn de ${integrante.nome}`}
                >
                  <img
                    src="/img/linkedin.png"
                    alt="LinkedIn"
                    className="w-8 h-8"
                  />
                </a>
              </nav>
            </article>
          ))}
        </section>

      </div>
    </div>
  )
}
