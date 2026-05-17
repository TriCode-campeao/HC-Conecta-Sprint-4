# 🏥 HC Conecta 

# 📋 Sobre o Projeto

O **HC Conecta** é uma plataforma inovadora que conecta pacientes ao Hospital das Clínicas, facilitando o acesso aos serviços de saúde (teleconsultas) e melhorando a experiência do usuário. O projeto visa reduzir o absenteísmo em teleconsultas oferecendo instruções simples, linguagem acessível e suporte passo a passo.

## ⚙️ Login de Administrador

- **Username** admin
- **Senha** HcConecta

## 🛠️ Como Manipular o Sistema (Pelo GitHub)

### 📋 Pré-requisitos (Para Execução no Github)
- **Node.js** (Caso não tenha **não será possível** executar os comandos npm)
- **Git** (Necessário para clonar o repositorio)
- **É necessário um ambiente para executar o projeto, remomendamos o Visual Studio Code**

### ⚠️ ATENÇÃO

Caso não possua algum dos pré-requisitos listados acima, recomendamos que siga a seguinte ordem de instalação:

1. **Visual Studio Code** → https://code.visualstudio.com/Download

2. **Git** → https://git-scm.com/downloads

3. **Node.js** → https://nodejs.org/en/download



- Se qualquer um desses itens não estiver devidamente instalado, não será possível executar a aplicação.

- Após concluir todas as instalações, reinicie o computador para garantir que as configurações sejam aplicadas corretamente.



### 🚀 Instalação e Execução (Passo a Passo - GitHub)

#### **Passo 1: Clone o repositório**
```bash
git clone https://github.com/TriCode-campeao/HC-Conecta-Sprint-4.git
```

#### **Passo 2: Entre na pasta do projeto**
```bash
cd HC-CONECTA-SPRINT-4
```

#### **Passo 3: Instalar dependências (TERMINAL PROMPT DE COMANDO)**
```bash
npm install
```

#### **CASO NÃO APAREÇA ERRO NO TERMINAL VÁ DIRETO AO PASSO 4**

#### **CASO OCORRA UM ERRO NO PASSO 3, insira o código abaixo no (TERMINAL PROMPT DE COMANDO)**

#### **Instalar Tailwind v4 (TERMINAL PROMPT DE COMANDO)**
```bash
npm i tailwindcss @tailwindcss/vite
```

#### **Passo 4: Executar o projeto**
```bash
npm run dev
```

#### **Passo 5: Abrir no navegador**
1. Abra seu navegador
2. Digite na barra de endereço: `http://localhost:5173`
3. Pressione Enter
4. O projeto deve abrir!

## 🛠️ Como Manipular o Sistema (Pela Vercel)

### 🚀 Execução (Passo a Passo - Vercel)

#### **Passo 1: Abrir no navegador**
1. Abra seu navegador
2. Digite na barra de endereço: `https://hc-conecta-sprint-4.vercel.app/`
3. Pressione Enter
4. O projeto deve abrir!

## 🚀 Tecnologias Utilizadas

| Tecnologia | Versão |

| **React** | 19.1.1 |
| **TypeScript** | 5.9.3 |
| **Vite** | 7.1.7 |
| **Tailwind CSS** | v4 |
| **React Router DOM** | 7.9.4 |

## 👥 Integrantes da Equipe

| Nome | RM | Turma | GitHub | LinkedIn |

| Geovanne Coneglian Passos | 562673 | 1TDSPY |
[@GeovanneCP](https://github.com/GeovanneCP) | 
[LinkedIn](https://www.linkedin.com/in/geovanne-coneglian-775472353/)

| Guilherme Soares de Almeida | 563143 | 1TDSPY | 
[@GuuiSOares](https://github.com/GuuiSOares) | 
[LinkedIn](https://www.linkedin.com/in/guilherme-soares-de-almeida)

| Lucas Silva Gastão Pinheiro | 563960 | 1TDSPY | 
[@Lucasgastaop](https://github.com/Lucasgastaop) | 
[LinkedIn](https://www.linkedin.com/in/lucas-pinheiro-1a7154291/) |

## 🖼️ Imagens e Ícones do Projeto

O projeto utiliza as seguintes imagens e ícones:
- **hc.png** - Logo do HC Hospital da Clínicas
- **consulta.png** - Foto de Ícone de consulta
- **guia.png** - Foto de Ícone do guia
- **equipe.png** - Foto de Ícone de equipe
- **contato.png** - Foto de Ícone de contato
- **WhatsApp.png** - Foto logo do WhatsApp
- **github.png** - Foto logo do GitHub
- **linkedin.png** - Foto logo do LinkedIn
- **geovanne.png** - Foto do integrante
- **guilherme.jpg** - Foto do integrante
- **lucas.png** - Foto do integrante

## 📁 Estrutura das Pastas
```bash
HC Conecta/
├── 📁 src/
│   ├── 📁 assets/
│   │   └── 📁 img/
│   │       ├── 📄 hc.png             # Logo do HC Hospital da Clínicas
│   │       ├── 📁 Icones/
│   │       │   ├── 📄 consulta.png   # Ícone de consulta
│   │       │   ├── 📄 contato.png    # Ícone de contato
│   │       │   ├── 📄 equipe.png     # Ícone de equipe
│   │       │   └── 📄 guia.png       # Ícone do guia
│   │       ├── 📁 Participantes/
│   │       │   ├── 📄 geovanne.png   # Foto do integrante
│   │       │   ├── 📄 guilherme.jpg  # Foto do integrante
│   │       │   └── 📄 lucas.png      # Foto do integrante
│   │       └── 📁 Redes/
│   │           ├── 📄 github.png     # Logo do GitHub
│   │           ├── 📄 linkedin.png   # Logo do LinkedIn
│   │           └── 📄 WhatsApp.png   # Logo do WhatsApp
│   ├── 📁 Components/
│   │   ├── 📁 Botao/
│   │   │   └── 📄 Botao.tsx          # Componente de botão reutilizável
│   │   ├── 📁 BotaoVoltarHome/
│   │   │   └── 📄 BotaoVoltarHome.tsx # Botão para voltar para o início
│   │   ├── 📁 Cabecalho/
│   │   │   └── 📄 Cabecalho.tsx      # Cabeçalho com navegação responsiva
│   │   ├── 📁 Estrutura/
│   │   │   └── 📄 Estrutura.tsx      # Layout principal da aplicação
│   │   └── 📁 Rodape/
│   │       └── 📄 Rodape.tsx         # Rodapé
│   ├── 📁 Types/
│   │   └── 📄 AutenticacaoLogin.ts   # Lógica de autenticação e login
│   ├── 📁 Routes/
│   │   ├── 📁 Admin/
│   │   │   ├── 📄 Admin.tsx          # Dashboard administrativo
│   │   │   ├── 📄 Agendamentos.tsx   # Gerenciamento de agendamentos
│   │   │   ├── 📄 Medicos.tsx        # Gerenciamento de médicos
│   │   │   └── 📄 Pacientes.tsx      # Gerenciamento de pacientes
│   │   └── 📁 Paciente/
│   │       ├── 📄 Consultas.tsx      # Sistema de consultas
│   │       ├── 📄 Contato.tsx        # Página de contato
│   │       ├── 📄 FAQ.tsx            # Perguntas frequentes
│   │       ├── 📄 FAQDetalhe.tsx     # Página de detalhe das perguntas
│   │       ├── 📄 Home.tsx           # Página inicial
│   │       ├── 📄 integrantes.tsx    # Página dos desenvolvedores
│   │       ├── 📄 Login.tsx          # Página de login
│   │       └── 📄 Sobre.tsx          # Página sobre o projeto
│   ├── 📄 App.tsx                    # Componente principal
│   ├── 📄 globals.css                # Estilos globais
│   └── 📄 main.tsx                   # Ponto de entrada
├── 📄 .env                           # Variáveis de ambiente
├── 📄 .gitignore                     # Arquivos ignorados pelo Git
├── 📄 eslint.config.js               # Configuração eslint
├── 📄 index.html                     # Arquivo HTML principal
├── 📄 package.json                   # Configurações do projeto
├── 📄 package-lock.json              # Lock file das dependências
├── 📄 README.md                      # Documentação do projeto
├── 📄 tsconfig.app.json              # Configuração do TypeScript (app)
├── 📄 tsconfig.json                  # Configuração do TypeScript
├── 📄 tsconfig.node.json             # Configuração do TypeScript (node)
└── 📄 vite.config.ts                 # Configuração do Vite
```

## 🔗 Links Obrigatórios

### 📱 GitHub
**Repositório do Projeto**: [https://github.com/TriCode-campeao/HC-Conecta-Sprint-4]

### 🎥 Vídeo do YouTube
**Vídeo de Apresentação**: [https://www.youtube.com/watch?v=WB5CzDd7JOQ]

**Desenvolvido pela equipe TriCode**
