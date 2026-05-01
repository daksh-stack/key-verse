import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Marketing from './pages/Marketing';
import Landing from './pages/Landing'; // This is now the /hub
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyApis from './pages/MyApis';
import Studio from './pages/Studio';
import ApiDetails from './pages/ApiDetails';
import PublishApi from './pages/PublishApi';

function App() {
  return (
    <Router>
      <Routes>
        {/* Marketing standalone page */}
        <Route path="/" element={<Marketing />} />

        {/* Platform shell */}
        <Route path="/" element={<Layout />}>
          <Route path="hub" element={<Landing />} />
          <Route path="login" element={<Login />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="my-apis" element={<MyApis />} />
          <Route path="publish" element={<PublishApi />} />
          <Route path="studio/:apiId" element={<Studio />} />
          <Route path="api/:apiId" element={<ApiDetails />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;