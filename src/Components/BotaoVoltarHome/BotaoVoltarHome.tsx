import { useNavigate } from 'react-router-dom'

interface BotaoVoltarHomeProps {
  className?: string
}

export default function BotaoVoltarHome({ className = '' }: BotaoVoltarHomeProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate('/')
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium ${className}`}
    >
      Voltar ao Início!
    </button>
  )
}
