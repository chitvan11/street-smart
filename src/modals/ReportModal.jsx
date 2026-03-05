import React, { useState } from "react";

const ReportModal = ({ isOpen, onClose, openLogin, isLoggedIn, setCity, navigateToMap }) => {
    const defaultIssues = ['Pothole', 'Illegal Dumping', 'Broken Signage', 'Streetlight Out', 'Graffiti', 'Water Leak'];
    const [selectedIssues, setSelectedIssues] = useState([]);
    const [reportCity, setReportCity] = useState(''); // Local state for city input

    const toggleIssue = (issue) => {
        setSelectedIssues(prev => 
            prev.includes(issue)
                ? prev.filter(i => i !== issue)
                : [...prev, issue]
        );
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
            <div className="report-modal" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>&times;</button>
                <h2>Report an Issue</h2>

                <form onSubmit={handleReportClick}>
                    <div className="report-form-group">
                        <label htmlFor="issue-description">Describe the Issue (Optional)</label>
                        <textarea 
                            id="issue-description" 
                            placeholder="e.g., There's a large pothole near the intersection of Main St and Elm Ave."
                            className="report-input-field" 
                        />
                    </div>
                    
                    <div className="report-form-group">
                        <label>Or select common issues (select multiple)</label>
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

                    <div className="report-form-group">
                        <label htmlFor="issue-city">City of Issue</label>
                        <input 
                            id="issue-city" 
                            type="text" 
                            className="report-city-input report-input-field" 
                            placeholder="e.g., New Delhi, London, New York"
                            value={reportCity}
                            onChange={(e) => setReportCity(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="report-proceed-btn">
                        Proceed
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReportModal;