import React, { useState, useEffect } from 'react'; 
import MapPlaceholder from "./components/MapPlaceholder";
import LoginModal from "./modals/LoginModal";
import RegisterModal from "./modals/RegisterModal";
import ReportModal from "./modals/ReportModal";
import Navbar from "./components/Navbar";


const App = () => {
    // --- Authentication Simulation ---
    const [isLoggedIn, setIsLoggedIn] = useState(false); 
    
    // --- Global State for City / Map Focus ---
    const [city, setCity] = useState('World View'); 
    
    // --- Modal States ---
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    
    // --- Page State for navigation (simulates a router) ---
    const [currentPage, setCurrentPage] = useState('home');
    
    // --- New State for Leaflet Load Check ---
    const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);

    // --- Dynamic Leaflet Script Loader ---
    useEffect(() => {
        // Ensure the script is not already present or successfully loaded
        if (typeof window.L !== 'undefined') {
            setIsLeafletLoaded(true);
            return;
        }

        const scriptId = 'leaflet-script';
        // Only load if it hasn't been added yet
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.id = scriptId;
            script.async = true; // Use async to prevent blocking

            script.onload = () => {
                setIsLeafletLoaded(true);
                console.log("Leaflet script loaded successfully.");
            };
            script.onerror = () => {
                 console.error("Failed to load Leaflet script.");
            };
            document.body.appendChild(script);
        }
        
    }, []); // Only runs once on mount

    // --- Handlers ---
    const openLoginModal = () => {
        setIsRegisterModalOpen(false);
        setIsReportModalOpen(false);
        setIsLoginModalOpen(true);
    };

    const openRegisterModal = () => {
        setIsLoginModalOpen(false);
        setIsReportModalOpen(false);
        setIsRegisterModalOpen(true);
    };
    
    const handleReportAccess = () => {
        if (isLoggedIn) {
            setIsReportModalOpen(true);
        } else {
            // Directs to login if not logged in
            openLoginModal();
        }
    };
    
    // Mock Logout Function
    const handleLogout = () => {
        setIsLoggedIn(false);
        setCurrentPage('home'); // Go back to home page after logging out
    };
    
    const navigate = (page) => {
        if (page === 'report') {
            handleReportAccess();
        } else if (page === 'map' && !isLoggedIn) {
            openLoginModal();
        } else {
            setCurrentPage(page);
        }
    };
    
    // Helper function for ReportModal to navigate to map
    const navigateToMap = () => {
        setCurrentPage('map');
    };
    
    // --- Dynamic Content Rendering ---
    const renderContent = () => {
        // If we are on the map page, render the map component
        if (currentPage === 'map' && isLoggedIn) {
            return (
                <div className="scrolling-content">
                    {/* Render MapPlaceholder ONLY if Leaflet JS is loaded */}
                    {isLeafletLoaded ? (
                        <MapPlaceholder city={city} />
                    ) : (
                        <div className="map-placeholder">
                            <h2>🗺️ Loading Map...</h2>
                            <p style={{marginTop: '10px', color: 'var(--color-form-text)'}}>Initializing mapping library. Please wait.</p>
                        </div>
                    )}
                </div>
            );
        }
        
        // Default Home Page Content
        return (
            <div className="scrolling-content">
                <div className="scroll-push"></div> 

                <div className="hero-button-anchor">
                    {/* Primary Button now triggers access check */}
                    <button 
                        className="btn primary"
                        onClick={handleReportAccess}
                    >
                        Report an Issue
                    </button>
                </div>
                
                {/* 5. HOW IT WORKS (Slides over the fixed hero) */}
                <section 
                    className="how-sliding"
                >
                    <h2>How It Works</h2>
                    <div className="steps">
                        <div className="card">
                            <h3>📍 Locate</h3>
                            <p>Pin the exact spot of the issue on the map.</p>
                        </div>
                        <div className="card">
                            <h3>📸 Report</h3>
                            <p>Upload photos and describe what’s wrong.</p>
                        </div>
                        <div className="card">
                            <h3>⭐ Review</h3>
                            <p>Others verify, upvote, and track the fix progress.</p>
                        </div>
                    </div>
                </section>

                {/* 6. REMAINING CONTENT */}
                <section className="coming">
                    <h2>City Health Monitor</h2>
                    <p>Live color-coded map of your city’s issue status 🚦 — coming soon.</p>
                </section>
            </div>
        );
    };


    return (
        <div className="app-container">

            {/* Modals */}
            <LoginModal 
                isOpen={isLoginModalOpen} 
                onClose={() => setIsLoginModalOpen(false)} 
                openRegister={openRegisterModal}
                setIsLoggedIn={setIsLoggedIn}
            />

            <RegisterModal 
                isOpen={isRegisterModalOpen} 
                onClose={() => setIsRegisterModalOpen(false)} 
                openLogin={openLoginModal}
                setIsLoggedIn={setIsLoggedIn}
            />
            
            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                openLogin={openLoginModal}
                isLoggedIn={isLoggedIn}
                setCity={setCity} // Pass setter to update city state
                navigateToMap={() => navigateToMap()} // Pass navigation logic
            />
            
            <Navbar
                isLoggedIn={isLoggedIn}
                navigate={navigate}
                openLoginModal={openLoginModal}
                openRegisterModal={openRegisterModal}
                handleLogout={handleLogout}
            />

            {/* 1. FIXED HERO SECTION */}
            <section className="hero-fixed">
                <div className="overlay" />
                <div className="hero-content">
                    <h1>
                        Report. Review. <span className="highlight">Resolve.</span>
                    </h1> 
                    <p>Empowering citizens to make cities smarter — one report at a time.</p>
                </div>
            </section>

            {/* 2. SCROLLING CONTENT WRAPPER - This is handled by renderContent now */}
            
            {renderContent()}

            {/* Footer is rendered outside renderContent for consistency, regardless of page view */}
            <footer>
                <p>© 2025 Street Smart. Built with ❤️ for smarter cities.</p>
            </footer>
        </div>
    );
};

export default App;