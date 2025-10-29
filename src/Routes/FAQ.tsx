import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Botao from '../Components/Botao/Botao'
import BotaoVoltarHome from '../Components/BotaoVoltarHome/BotaoVoltarHome'

export default function FAQ() {
  const [feedback, setFeedback] = useState<'none' | 'yes' | 'no'>('none')
  const location = useLocation()

  useEffect(() => {
    if (location.state?.fromFAQDetalhe) {
      const savedScrollPosition = sessionStorage.getItem('faqScrollPosition')
      if (savedScrollPosition) {
        window.scrollTo(0, parseInt(savedScrollPosition))
        sessionStorage.removeItem('faqScrollPosition')
      }
    }
  }, [location.state])

  const handleLinkClick = () => {
    sessionStorage.setItem('faqScrollPosition', window.scrollY.toString())
  }

  const faqData = [
    {
      id: 1,
      slug: "entrar-teleconsulta-celular",
      pergunta: "Como eu entro na teleconsulta pelo celular?",
      descricao: "Abra o WhatsApp e toque no link que a equipe enviou. Permita acesso à...",
      link: "Ler mais"
    },
    {
      id: 2,
      slug: "instalar-aplicativo",
      pergunta: "Preciso instalar algum aplicativo?",
      descricao: "Não. O atendimento ocorre pelo navegador do seu celular. Basta...",
      link: "Ler mais"
    },
    {
      id: 3,
      slug: "teste-camera-audio",
      pergunta: "Como faço o teste de câmera e áudio?",
      descricao: "Antes da consulta, toque em 'Testar câmera e microfone'. Se não...",
      link: "Ler mais"
    },
    {
      id: 4,
      slug: "link-nao-abre",
      pergunta: "O link não abre. O que fazer?",
      descricao: "Copie o link e cole no Chrome. Verifique os dados móveis ou o wi-...",
      link: "Ler mais"
    },
    {
      id: 5,
      slug: "documentos-necessarios",
      pergunta: "Quais documentos tenho que ter em mãos?",
      descricao: "Tenha RG/CPF, cartão do SUS e sua lista de medicamentos. Se tiver...",
      link: "Ler mais"
    },
    {
      id: 6,
      slug: "remarcar-consulta",
      pergunta: "Como remarcar se eu não puder comparecer?",
      descricao: "Avise a equipe com antecedência pelo WhatsApp para liberar o horári...",
      link: "Ler mais"
    },
    {
      id: 7,
      slug: "conexao-ruim",
      pergunta: "A conexão está ruim. Tenho alternativa?",
      descricao: "Desligue o vídeo e mantenha só o áudio. Se possível, mude para um...",
      link: "Ler mais"
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
              Perguntas Frequentes
            </h1>
            <p className="text-lg text-slate-700">
              Dúvidas comuns sobre teleconsulta, testes de câmera/áudio e conexão.
            </p>
          </div>
        </header>

        <div className="flex justify-center mb-12">
          <img
            src="/img/guia.png"
            alt="Guia FAQ"
            className="w-24 h-24"
          />
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Lista de perguntas frequentes">
          {faqData.map((item) => (
            <article
              key={item.id}
              className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
            >
              <h2 className="text-lg font-bold text-blue-600 mb-3">
                {item.pergunta}
              </h2>
              <p className="text-slate-700 mb-4 text-sm leading-relaxed flex-grow">
                {item.descricao}
              </p>
              <Link
                to={`/faq/${item.slug}`}
                onClick={handleLinkClick}
                className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors mt-auto"
                aria-label={`Ler mais sobre: ${item.pergunta}`}
              >
                {item.link}
              </Link>
            </article>
          ))}
        </section>

        <section className="mt-16 text-center" aria-label="Feedback sobre as perguntas frequentes">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">
            Respondemos suas dúvidas?
          </h2>

          {(feedback === 'none' || feedback === 'yes') && (
            <div className="flex justify-center gap-4 mb-6">
              <Botao
                onClick={() => setFeedback('yes')}
                variant="primary"
                size="lg"
              >
                Sim
              </Botao>
              <Botao
                onClick={() => setFeedback('no')}
                variant="primary"
                size="lg"
              >
                Não
              </Botao>
            </div>
          )}

          {feedback === 'yes' && (
            <div className="text-blue-600 text-xl font-semibold mb-4">
              Que Bom!
            </div>
          )}

          {feedback === 'no' && (
            <div className="text-center">
              <Botao
                onClick={() => window.location.href = '/contato'}
                variant="primary"
                size="lg"
              >
                Entre em contato conosco!
              </Botao>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
