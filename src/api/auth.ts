export type AuthCredentials = {
  username: string
  senha: string
}

export type AuthResponse = unknown

const AUTH_URL = 'https://hc-conecta-sprint-4-1.onrender.com/logins/autenticar'

export async function authenticateLogin(credentials: AuthCredentials): Promise<AuthResponse> {
  const url = new URL(AUTH_URL)
  url.searchParams.set('login', credentials.username)
  url.searchParams.set('senha', credentials.senha)

  let res: Response
  try {
    res = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
    })
  } catch (_) {
    throw new Error('Não foi possível conectar à API (rede/CORS/servidor inativo).')
  }

  if (!res.ok) {
    let backendMessage: string | undefined
    try {
      const text = await res.text()
      if (text && text.trim().length > 0) {
        backendMessage = text.trim()
      }
    } catch (_) {}
    if (!backendMessage) {
      try {
        const data = await res.clone().json() as unknown
        if (typeof data === 'string') backendMessage = data
        else if (data && typeof data === 'object') {
          const anyData = data as { message?: string; error?: string; detalhe?: string }
          backendMessage = anyData.message || anyData.error || anyData.detalhe
        }
      } catch (_) {}
    }

    if (!backendMessage && res.status === 401) {
      backendMessage = 'Credenciais inválidas'
    }
    const statusText = res.statusText || 'Erro'
    const message = backendMessage || `Falha na autenticação (status ${res.status} ${statusText})`
    throw new Error(message)
  }

  return res.json()
}


