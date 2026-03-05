import React from "react";

const Navbar = ({
  isLoggedIn,
  navigate,
  openLoginModal,
  openRegisterModal,
  handleLogout
}) => {
  return (
    <header className="navbar">
      <div className="logo">Street<span>Smart</span></div>

      <nav>
        <a href="#" onClick={(e) => { e.preventDefault(); navigate('home'); }}>Home</a>
        <a href="#" onClick={(e) => { e.preventDefault(); navigate('report'); }}>Report</a>
        <a href="#" onClick={(e) => { e.preventDefault(); navigate('map'); }}>Map</a>
        <a href="#">About</a>
      </nav>

      <div className="auth">
        {isLoggedIn ? (
          <>
            <button 
              className="btn account-icon"
              onClick={() => console.log('Account Settings Placeholder')}
            >
              <img 
                src="https://raw.githubusercontent.com/google/material-design-icons/master/png/1x/account_circle_white_24dp.png" 
                alt="User Account" 
                onError={(e) => { 
                  e.target.onerror = null; 
                  e.target.src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzQwMTAxNyIgZD0iTTEyIDBDNS4zNzMgMCAwIDUuMzczIDAgMTJzNS4zNzMgMTIgMTIgMTJjNi42MjcgMCAxMi01LjM3MyAxMi0xMlMzMC42MjcgMCAyMy45OTkgMFoiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjkuMCIgcj0iMy4wIiBmaWxsPSIjRERERERFIi8+PHBhdGggZmlsbD0iI0RERERERCIgZD0iTTEyIDEzLjVjLTMuMyAwLTYuNSAyLjMtNi41IDYuNUgxOC41Yy0wLjAtNC4yLTMuMi02LjUtNi41LTYuNVoiLz48L3N2Zz4="; 
                }}
              />
            </button>

            <button 
              className="btn logout-primary"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button className="btn login" onClick={openLoginModal}>
              Login
            </button>

            <button className="btn signup" onClick={openRegisterModal}>
              Sign Up
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;