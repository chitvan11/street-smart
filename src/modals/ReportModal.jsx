import React, { useState, useEffect } from "react";

const ReportModal = ({ isOpen, onClose, openLogin, isLoggedIn, setCity, navigateToMap, selectedLocation, onSelectLocationOnMap }) => {
    const defaultIssues = ['Pothole', 'Illegal Dumping', 'Broken Signage', 'Streetlight Out', 'Graffiti', 'Water Leak'];
    const [selectedIssues, setSelectedIssues] = useState([]);
    const [reportCity, setReportCity] = useState('');
    const [locationMethod, setLocationMethod] = useState('current'); // 'current', 'map', 'manual'
    const [photoPreview, setPhotoPreview] = useState(null);

    const toggleIssue = (issue) => {
        setSelectedIssues(prev => 
            prev.includes(issue)
                ? prev.filter(i => i !== issue)
                : [...prev, issue]
        );
    };

    // Handle photo upload
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setPhotoPreview(null);
            setLocationMethod('current');
        }
    }, [isOpen]);

    // Handle selecting location on map
    const handleSelectOnMap = () => {
        onClose(); // Close modal
        onSelectLocationOnMap(); // Start location selection mode
    };

    const handleReportClick = (e) => {
        e.preventDefault();
        
        // --- AUTHENTICATION CHECK ---
        if (!isLoggedIn) {
            onClose(); // Close report modal
            openLogin(); // Open login modal
            return;
        }

        // --- VALIDATION AND NAVIGATION ---
        if (!reportCity.trim()) {
            // Replaced alert() with console.error/log as per instructions
            console.error("Please enter the city where the issue is located.");
            return;
        }

        // 1. Set global state for city (used by Map view)
        setCity(reportCity.trim());
        
        // 2. Navigate to Map page
        navigateToMap();
        
        // 3. Close the modal
        onClose(); 

        // [Optional: Logging data for developer view]
        console.log("Report Submitted:", {
            issues: selectedIssues,
            description: document.getElementById('issue-description').value,
            city: reportCity.trim()
        });
    };
    
    // If not logged in, show a simple message and redirect
    if (!isLoggedIn) {
        return (
             <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
                <div className="report-modal" onClick={e => e.stopPropagation()}>
                    <button className="close-button" onClick={onClose}>&times;</button>
                    <h2 style={{ textAlign: 'center' }}>Action Required</h2>
                    <p style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--color-form-text)' }}>
                        You must be signed in to report an issue.
                    </p>
                    <button 
                        className="report-proceed-btn" 
                        onClick={handleReportClick}
                        style={{ background: 'var(--color-secondary-accent)' }}
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    // If logged in, show the full form
    return (
        <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className="report-modal report-modal-enhanced" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>&times;</button>
                <h2>Report an Issue</h2>

                <form onSubmit={handleReportClick}>
                    {/* Location Section */}
                    <div className="report-form-group">
                        <label>Issue Location</label>
                        <div className="location-options">
                            <button 
                                type="button"
                                className={`location-option-btn ${locationMethod === 'current' ? 'active' : ''}`}
                                onClick={() => setLocationMethod('current')}
                            >
                                <span className="loc-icon">📍</span>
                                <span>Use My Location</span>
                            </button>
                            <button 
                                type="button"
                                className={`location-option-btn ${locationMethod === 'map' ? 'active' : ''}`}
                                onClick={handleSelectOnMap}
                            >
                                <span className="loc-icon">🗺️</span>
                                <span>Pin on Map</span>
                            </button>
                        </div>
                        {selectedLocation && (
                            <div className="selected-location-display">
                                Location selected: {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}
                            </div>
                        )}
                    </div>

                    {/* Issue Type Selection */}
                    <div className="report-form-group">
                        <label>Issue Type (select one or more)</label>
                        <div className="issue-options">
                            {defaultIssues.map(issue => (
                                <button
                                    key={issue}
                                    type="button"
                                    className={`issue-btn ${selectedIssues.includes(issue) ? 'selected' : ''}`}
                                    onClick={() => toggleIssue(issue)}
                                >
                                    {issue}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="report-form-group">
                        <label htmlFor="issue-description">Description (Optional)</label>
                        <textarea 
                            id="issue-description" 
                            placeholder="Add more details about the issue..."
                            className="report-input-field" 
                            rows={3}
                        />
                    </div>

                    {/* Photo Upload */}
                    <div className="report-form-group">
                        <label>Add Photo (Optional)</label>
                        <div className="photo-upload-area">
                            {photoPreview ? (
                                <div className="photo-preview-container">
                                    <img src={photoPreview} alt="Preview" className="photo-preview" />
                                    <button 
                                        type="button" 
                                        className="remove-photo-btn"
                                        onClick={() => setPhotoPreview(null)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <label className="photo-upload-label">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handlePhotoChange}
                                        style={{ display: 'none' }}
                                    />
                                    <span className="upload-icon">📷</span>
                                    <span>Click to upload photo</span>
                                </label>
                            )}
                        </div>
                    </div>

                    <button type="submit" className="report-proceed-btn">
                        Submit Report
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReportModal;
