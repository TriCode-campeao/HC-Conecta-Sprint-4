import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Botao from '../Botao/Botao'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Sobre', href: '/sobre' },
    { name: 'Integrantes', href: '/integrantes' },
    { name: 'Consultas', href: '/consultas' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contato', href: '/contato' },
  ]

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center">
              <img
                src="/img/hc.png"
                alt="HC Conecta Logo"
                className="w-12 h-12 rounded-lg"
              />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 mr-2">Logado como:</span>
              <Link
                to="/consultas"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Paciente
              </Link>
              <button
                type="button"
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                X
              </button>
            </div>
          </div>

          <nav className="hidden md:flex space-x-1" role="navigation" aria-label="Menu principal">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === item.href
                    ? 'text-blue-600 bg-blue-100'
                    : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                  }`}
                aria-current={location.pathname === item.href ? 'page' : undefined}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="md:hidden">
            <Botao
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              variant="primary"
              size="sm"
              className="p-2"
              aria-label="Abrir menu de navegação"
              aria-expanded={isMenuOpen}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Botao>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden" role="navigation" aria-label="Menu mobile">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${location.pathname === item.href
                      ? 'text-blue-600 bg-blue-100'
                      : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                  aria-current={location.pathname === item.href ? 'page' : undefined}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
