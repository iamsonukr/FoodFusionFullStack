import React from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';

const Navbar = () => {
  const handleLogout = () => {
    // Clear username and password from localStorage
    localStorage.removeItem('username');
    localStorage.removeItem('password');

    // Optionally reload the page or redirect to login
    window.location.reload();
  };

  return (
    <div className='navbar'>
      <img className='logo' src={assets.logo} alt="Foodies Fusion Logo" />
      <h1 className='admin-title'>Foodies Fusion Admin Panel</h1>
      <div className='img-btn'>
        {
          localStorage.getItem('username')==='root'
            ? <>

              <button onClick={handleLogout} type="button" className="logout-button">
                Logout
              </button>
              <img className='profile' src={assets.profile_image} alt="Profile" />
            </>
            : "d"
        }
      </div>
    </div>
  );
};

export default Navbar;
