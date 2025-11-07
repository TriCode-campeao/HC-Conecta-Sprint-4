import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './Components/Estrutura/Estrutura'
import Home from './Routes/Paciente/Home'
import Integrantes from './Routes/Paciente/integrantes'
import Sobre from './Routes/Paciente/Sobre'
import FAQDetalhe from './Routes/Paciente/FAQDetalhe'
import Login from './Routes/Paciente/Login'
import Consultas from './Routes/Paciente/Consultas'
import Admin from './Routes/Admin/Admin'
import AdminAgendamentos from './Routes/Admin/Agendamentos'
import AdminMedicos from './Routes/Admin/Medicos'
import AdminPacientes from './Routes/Admin/Pacientes'
import PacienteFAQ from './Routes/Paciente/FAQ'
import PacienteContato from './Routes/Paciente/Contato'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/integrantes" element={<Integrantes />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/consultas" element={<Consultas />} />
          <Route path="/paciente/consultas" element={<Consultas />} />
          <Route path="/faq" element={<PacienteFAQ />} />
          <Route path="/faq/:slug" element={<FAQDetalhe />} />
          <Route path="/contato" element={<PacienteContato />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/pacientes" element={<AdminPacientes />} />
          <Route path="/admin/agendamentos" element={<AdminAgendamentos />} />
          <Route path="/admin/medicos" element={<AdminMedicos />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
