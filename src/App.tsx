// import { Navbar,Welcome,Footer,Service,Transcations } from './components';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Main from './components/main'
function App() {

  return (
    <Router>
       <Routes>
     <Route  path="/" element={<Main/>} />
     </Routes>
    </Router>
  )
}



export default App
