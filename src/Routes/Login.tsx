import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Botao from '../Components/Botao/Botao'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  })
  const [userType, setUserType] = useState<'paciente' | 'admin'>('paciente')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Dados do login:', formData, 'Tipo:', userType)
    navigate('/consultas')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="bg-white py-8">
      <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-8">
          <div className="mb-6">
            <img
              src="/img/hc.png"
              alt="HC Conecta Logo"
              className="w-16 h-16 rounded-lg mx-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-blue-600 mb-4">
            Login
          </h1>
          <p className="text-lg text-slate-700 mb-6">
            Faça login para acessar sua conta
          </p>
          
          <div className="flex justify-center gap-4 mb-8">
            <button
              type="button"
              onClick={() => setUserType('paciente')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                userType === 'paciente'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Paciente
            </button>
            <button
              type="button"
              onClick={() => setUserType('admin')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                userType === 'admin'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Admin
            </button>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {userType === 'admin' && (
            <>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label htmlFor="senha" className="block text-sm font-medium text-slate-700 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  id="senha"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Sua senha"
                />
              </div>
            </>
          )}

          <Botao
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
          >
            Entrar
          </Botao>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}
