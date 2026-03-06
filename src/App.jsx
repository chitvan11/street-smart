import React, { useState } from 'react'; 
import MapPlaceholder from "./components/MapPlaceholder";
import LoginModal from "./modals/LoginModal";
import RegisterModal from "./modals/RegisterModal";
import ReportModal from "./modals/ReportModal";
import Navbar from "./components/Navbar";

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false); 
    const [city, setCity] = useState('World View'); 
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState('home');
    const [isSelectingLocation, setIsSelectingLocation] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);

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
            openLoginModal();
        }
    };
    
    // Handle opening report from map (with location)
    const handleOpenReportFromMap = (location) => {
        if (!isLoggedIn) {
            openLoginModal();
            return;
        }
        setSelectedLocation(location);
        setIsReportModalOpen(true);
    };
    
    // Handle location selection from map
    const handleLocationSelect = (location) => {
        setSelectedLocation(location);
    };
    
    // Start location selection mode
    const startLocationSelection = () => {
        setIsSelectingLocation(true);
        setCurrentPage('map');
    };
    
    // Cancel location selection
    const cancelLocationSelection = () => {
        setIsSelectingLocation(false);
        setSelectedLocation(null);
    };
    
    const handleLogout = () => {
        setIsLoggedIn(false);
        setCurrentPage('home'); 
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
    
    const navigateToMap = () => {
        setCurrentPage('map');
    };
    
    const renderContent = () => {
        // We no longer need to check if Leaflet is loaded since it's in index.html
        if (currentPage === 'map' && isLoggedIn) {
            return (
                <div className="scrolling-content">
                    <MapPlaceholder 
                        city={city} 
                        onLocationSelect={handleLocationSelect}
                        isSelectingLocation={isSelectingLocation}
                        onOpenReport={handleOpenReportFromMap}
                    />
                </div>
            );
        }
        
        return (
            <div className="scrolling-content">
                <div className="scroll-push"></div> 

                <div className="hero-button-anchor">
                    <button className="btn primary" onClick={handleReportAccess}>
                        Report an Issue
                    </button>
                </div>
                
                <section className="how-sliding">
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

                <section className="coming">
                    <h2>City Health Monitor</h2>
                    <p>Live color-coded map of your city’s issue status 🚦 — coming soon.</p>
                </section>
            </div>
        );
    };

    return (
        <div className="app-container">
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
                onClose={() => {
                    setIsReportModalOpen(false);
                    setIsSelectingLocation(false);
                }}
                openLogin={openLoginModal}
                isLoggedIn={isLoggedIn}
                setCity={setCity} 
                navigateToMap={navigateToMap}
                selectedLocation={selectedLocation}
                onSelectLocationOnMap={startLocationSelection}
            />
            <Navbar
                isLoggedIn={isLoggedIn}
                navigate={navigate}
                openLoginModal={openLoginModal}
                openRegisterModal={openRegisterModal}
                handleLogout={handleLogout}
            />

            <section className="hero-fixed">
                <div className="overlay" />
                <div className="hero-content">
                    <h1>
                        Report. Review. <span className="highlight">Resolve.</span>
                    </h1> 
                    <p>Empowering citizens to make cities smarter — one report at a time.</p>
                </div>
            </section>

            {renderContent()}

            <footer>
                <p>© 2025 Street Smart. Built with ❤️ for smarter cities.</p>
            </footer>
        </div>
    );
};

export default App;
