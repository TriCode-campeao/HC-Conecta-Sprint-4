import { useParams, Link } from 'react-router-dom'

interface FAQItem {
  id: number
  slug: string
  pergunta: string
  resposta: string
}

export default function FAQDetalhe() {
  const { slug } = useParams<{ slug: string }>()

  const faqData: FAQItem[] = [
    {
      id: 1,
      slug: "entrar-teleconsulta-celular",
      pergunta: "Como eu entro na teleconsulta pelo celular?",
      resposta: "Abra o WhatsApp e toque no link que a equipe enviou. Permita acesso à câmera e microfone quando solicitado. Aguarde o médico entrar na chamada. Certifique-se de ter uma conexão estável com a internet."
    },
    {
      id: 2,
      slug: "instalar-aplicativo",
      pergunta: "Preciso instalar algum aplicativo?",
      resposta: "Não. O atendimento ocorre pelo navegador do seu celular. Basta ter o WhatsApp instalado para receber o link da consulta. Use o navegador Chrome ou Safari para melhor compatibilidade."
    },
    {
      id: 3,
      slug: "teste-camera-audio",
      pergunta: "Como faço o teste de câmera e áudio?",
      resposta: "Antes da consulta, toque em 'Testar câmera e microfone'. Se não funcionar, verifique as permissões do navegador. Reinicie o navegador se necessário. Teste com um familiar antes da consulta real."
    },
    {
      id: 4,
      slug: "link-nao-abre",
      pergunta: "O link não abre. O que fazer?",
      resposta: "Copie o link e cole no Chrome. Verifique os dados móveis ou o wi-fi. Tente em outro navegador. Se persistir, entre em contato conosco pelo WhatsApp para receber um novo link."
    },
    {
      id: 5,
      slug: "documentos-necessarios",
      pergunta: "Quais documentos tenho que ter em mãos?",
      resposta: "Tenha RG/CPF, cartão do SUS e sua lista de medicamentos. Se tiver exames recentes, deixe-os por perto. Tenha também o número do seu telefone para contato de emergência."
    },
    {
      id: 6,
      slug: "remarcar-consulta",
      pergunta: "Como remarcar se eu não puder comparecer?",
      resposta: "Avise a equipe com antecedência pelo WhatsApp para liberar o horário para outro paciente. A remarcação deve ser feita com pelo menos 24h de antecedência. Casos de emergência serão avaliados individualmente."
    },
    {
      id: 7,
      slug: "conexao-ruim",
      pergunta: "A conexão está ruim. Tenho alternativa?",
      resposta: "Desligue o vídeo e mantenha só o áudio. Se possível, mude para um local com melhor sinal. Use fones de ouvido para melhor qualidade. Em último caso, podemos reagendar para outro horário."
    }
  ]

  const faqItem = faqData.find(item => item.slug === slug)

  if (!faqItem) {
    return (
      <div className="bg-white py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <header className="mb-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-red-600 mb-4">
                FAQ não encontrado
              </h1>
              <p className="text-lg text-slate-700 mb-8">
                A pergunta solicitada não foi encontrada.
              </p>
              <Link
                to="/faq"
                state={{ fromFAQDetalhe: true }}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                aria-label="Voltar para a lista de perguntas frequentes"
              >
                ← Voltar ao FAQ
              </Link>
            </div>
          </header>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <header className="mb-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-blue-600 mb-4">
              {faqItem.pergunta}
            </h1>
          </div>
        </header>

        <article className="bg-gray-50 border border-gray-200 rounded-lg p-8">
          <div className="prose max-w-none">
            <p className="text-lg text-slate-700 leading-relaxed">
              {faqItem.resposta}
            </p>
          </div>
        </article>

        <nav className="mt-8 text-center" aria-label="Navegação de retorno">
          <Link
            to="/faq"
            state={{ fromFAQDetalhe: true }}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            aria-label="Voltar para a lista de perguntas frequentes"
          >
            ← Voltar ao FAQ
          </Link>
        </nav>
      </div>
    </div>
  )
}
