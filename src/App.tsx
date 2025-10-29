import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './Components/Estrutura/Estrutura'
import Home from './Routes/Home'
import Integrantes from './Routes/integrantes'
import Sobre from './Routes/Sobre'
import FAQ from './Routes/FAQ'
import FAQDetalhe from './Routes/FAQDetalhe'
import Contato from './Routes/Contato'
import Consultas from './Routes/Consultas'
import Login from './Routes/Login'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/integrantes" element={<Integrantes />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/consultas" element={<Consultas />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/faq/:slug" element={<FAQDetalhe />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
