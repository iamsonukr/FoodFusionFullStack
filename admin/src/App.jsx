import { useEffect, useState } from 'react';
import Navbar from './components/navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import { Route, Routes,useLocation   } from 'react-router-dom';
import Add from './pages/Add/Add';
import List from './pages/List/List';
import Orders from './pages/Orders/Orders';
import Login from './pages/Login/Login';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  // const url = "http://localhost:5000";
  const url='https://foodfusionfullstack.onrender.com'
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  const handleLogin = (username, password) => {
    if (username === 'thesonukumar357@gmail.com' && password === 'thesonukumar357') {
      localStorage.setItem('username', 'root');
      localStorage.setItem('password', 'root123');
      setIsAuthenticated(true);
    } else {
      alert("Invalid username or password");
    }
  };

  const checkAuth = () => {
    const localuser = localStorage.getItem('username');
    const localpassword = localStorage.getItem('password');

    if (localuser === 'root' && localpassword === 'root123') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth(); // Check authentication state on component mount
  }, []);

  return (
    <>
      <ToastContainer />
      <Navbar />
      {isAuthenticated ? (
        <>
          <hr />
          <div className="app-component">

            <div className="main-sidebar">
              <Sidebar />
            </div>
            


            <div className="main-container">
              <Routes>
                <Route path="/" element={<Add url={url} />} />
                <Route path="/add" element={<Add url={url} />} />
                <Route path="/orders" element={<Orders url={url} />} />
                <Route path="/list" element={<List url={url} />} />
              </Routes>
            </div>
          </div>
        </>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </>
  );
}

export default App;
