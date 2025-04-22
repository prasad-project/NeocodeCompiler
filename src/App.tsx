import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Compiler from './components/Compiler';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/compiler" element={<Compiler />} />
      </Routes>
    </BrowserRouter>
  );
}
