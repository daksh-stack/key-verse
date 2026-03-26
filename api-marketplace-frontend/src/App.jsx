import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyApis from './pages/MyApis';
import Studio from './pages/Studio';
import ApiDetails from './pages/ApiDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="login" element={<Login />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="my-apis" element={<MyApis />} />
          <Route path="studio/:apiId" element={<Studio />} />
          <Route path="api/:apiId" element={<ApiDetails />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;