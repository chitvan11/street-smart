import { useEffect, useRef, useState } from "react";

// --- MOCK ISSUES DATA ---
const MOCK_ISSUES = [
    { id: 1, lat: 28.7041, lng: 77.1025, type: 'Pothole', status: 'active', votes: 12, description: 'Large pothole near intersection', createdAt: '2025-01-15' },
    { id: 2, lat: 28.7080, lng: 77.0980, type: 'Streetlight Out', status: 'active', votes: 8, description: 'Street light not working for 3 days', createdAt: '2025-01-18' },
    { id: 3, lat: 28.7000, lng: 77.1100, type: 'Illegal Dumping', status: 'active', votes: 25, description: 'Garbage dumped on roadside', createdAt: '2025-01-10' },
    { id: 4, lat: 28.7120, lng: 77.0950, type: 'Broken Signage', status: 'resolved', votes: 5, description: 'Stop sign bent', createdAt: '2025-01-05' },
    { id: 5, lat: 28.6980, lng: 77.1150, type: 'Water Leak', status: 'active', votes: 18, description: 'Water pipe leak flooding street', createdAt: '2025-01-20' },
    { id: 6, lat: 28.7060, lng: 77.1080, type: 'Graffiti', status: 'active', votes: 3, description: 'Graffiti on public wall', createdAt: '2025-01-19' },
];

// Issue type icons and colors
const ISSUE_ICONS = {
    'Pothole': { icon: '🕳️', color: '#e74c3c' },
    'Streetlight Out': { icon: '💡', color: '#f39c12' },
    'Illegal Dumping': { icon: '🗑️', color: '#8e44ad' },
    'Broken Signage': { icon: '🚧', color: '#3498db' },
    'Water Leak': { icon: '💧', color: '#1abc9c' },
    'Graffiti': { icon: '🎨', color: '#e67e22' },
    'Other': { icon: '⚠️', color: '#95a5a6' },
};

// Create custom icon for issue markers
const createIssueIcon = (type, status) => {
    const issueData = ISSUE_ICONS[type] || ISSUE_ICONS['Other'];
    const bgColor = status === 'resolved' ? '#27ae60' : issueData.color;
    
    return window.L.divIcon({
        className: 'custom-issue-marker',
        html: `<div style="
            background: ${bgColor};
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.3);
            border: 3px solid white;
        ">${issueData.icon}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
    });
};

// Create user location icon
const createUserIcon = () => {
    return window.L.divIcon({
        className: 'user-location-marker',
        html: `<div style="
            background: #3498db;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 4px solid white;
            box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.3), 0 3px 10px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });
};

// Create pin marker for selecting location
const createPinIcon = () => {
    return window.L.divIcon({
        className: 'pin-location-marker',
        html: `<div style="
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            filter: drop-shadow(0 3px 5px rgba(0,0,0,0.4));
        ">📍</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
    });
};

const MapPlaceholder = ({ city, onLocationSelect, isSelectingLocation, onOpenReport }) => {
    const mapRef = useRef(null);
    const issueMarkersRef = useRef([]);
    const userMarkerRef = useRef(null);
    const pinMarkerRef = useRef(null);
    
    const [userLocation, setUserLocation] = useState(null);
    const [isLocating, setIsLocating] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'resolved'
    const [pinnedLocation, setPinnedLocation] = useState(null);

    // Get user's live location
    const getUserLocation = () => {
        setIsLocating(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ lat: latitude, lng: longitude });
                    setIsLocating(false);
                    
                    // Center map on user location
                    if (mapRef.current) {
                        mapRef.current.setView([latitude, longitude], 15);
                    }
                },
                (error) => {
                    console.error("Error getting location:", error.message);
                    setIsLocating(false);
                    // Fallback to Delhi
                    setUserLocation({ lat: 28.7041, lng: 77.1025 });
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            console.error("Geolocation not supported");
            setIsLocating(false);
        }
    };

    // Initialize map
    useEffect(() => {
        const defaultCoords = [28.7041, 77.1025];
        const zoomLevel = 14;

        if (!mapRef.current) {
            const map = window.L.map('map-container', {
                zoomControl: false,
            }).setView(defaultCoords, zoomLevel);
            
            mapRef.current = map;

            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            // Add zoom control to bottom right
            window.L.control.zoom({ position: 'bottomright' }).addTo(map);

            // Handle map clicks for pinning location
            map.on('click', (e) => {
                if (isSelectingLocation) {
                    const { lat, lng } = e.latlng;
                    setPinnedLocation({ lat, lng });
                    if (onLocationSelect) {
                        onLocationSelect({ lat, lng });
                    }
                }
            });
        }

        // Grey tile fix
        const timer = setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
            if (mapRef.current) {
                mapRef.current.invalidateSize();
            }
        }, 250);

        // Get user location on mount
        getUserLocation();

        return () => {
            clearTimeout(timer);
            if (mapRef.current) {
                if (mapRef.current.getContainer()) {
                    mapRef.current.remove();
                }
                mapRef.current = null;
            }
        };
    }, []);

    // Update click handler when isSelectingLocation changes
    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.off('click');
            mapRef.current.on('click', (e) => {
                if (isSelectingLocation) {
                    const { lat, lng } = e.latlng;
                    setPinnedLocation({ lat, lng });
                    if (onLocationSelect) {
                        onLocationSelect({ lat, lng });
                    }
                }
            });
        }
    }, [isSelectingLocation, onLocationSelect]);

    // Update user location marker
    useEffect(() => {
        if (mapRef.current && userLocation) {
            if (userMarkerRef.current) {
                userMarkerRef.current.remove();
            }
            
            userMarkerRef.current = window.L.marker(
                [userLocation.lat, userLocation.lng],
                { icon: createUserIcon() }
            ).addTo(mapRef.current)
                .bindPopup('<b>You are here</b>');
        }
    }, [userLocation]);

    // Update pinned location marker
    useEffect(() => {
        if (mapRef.current) {
            if (pinMarkerRef.current) {
                pinMarkerRef.current.remove();
                pinMarkerRef.current = null;
            }
            
            if (pinnedLocation && isSelectingLocation) {
                pinMarkerRef.current = window.L.marker(
                    [pinnedLocation.lat, pinnedLocation.lng],
                    { icon: createPinIcon() }
                ).addTo(mapRef.current)
                    .bindPopup('<b>Report location</b><br>Click "Report Here" to continue')
                    .openPopup();
            }
        }
    }, [pinnedLocation, isSelectingLocation]);

    // Update issue markers based on filter
    useEffect(() => {
        if (!mapRef.current) return;

        // Clear existing markers
        issueMarkersRef.current.forEach(marker => marker.remove());
        issueMarkersRef.current = [];

        // Filter issues
        const filteredIssues = activeFilter === 'all' 
            ? MOCK_ISSUES 
            : MOCK_ISSUES.filter(issue => issue.status === activeFilter);

        // Add markers for each issue
        filteredIssues.forEach(issue => {
            const marker = window.L.marker(
                [issue.lat, issue.lng],
                { icon: createIssueIcon(issue.type, issue.status) }
            ).addTo(mapRef.current);

            marker.on('click', () => {
                setSelectedIssue(issue);
            });

            marker.bindPopup(`
                <div style="min-width: 150px;">
                    <b>${issue.type}</b><br>
                    <span style="color: ${issue.status === 'active' ? '#e74c3c' : '#27ae60'};">
                        ${issue.status === 'active' ? 'Active' : 'Resolved'}
                    </span><br>
                    <small>${issue.votes} votes</small>
                </div>
            `);

            issueMarkersRef.current.push(marker);
        });
    }, [activeFilter]);

    const handleCenterOnUser = () => {
        if (userLocation && mapRef.current) {
            mapRef.current.setView([userLocation.lat, userLocation.lng], 16);
        } else {
            getUserLocation();
        }
    };

    const handleReportAtLocation = () => {
        if (pinnedLocation && onOpenReport) {
            onOpenReport(pinnedLocation);
        } else if (userLocation && onOpenReport) {
            onOpenReport(userLocation);
        }
    };

    return (
        <div className="map-placeholder">
            
            {/* Top Floating Bar */}
            <div className="map-top-overlay">
                <div className="search-bar">Search Location...</div>
                <button 
                    className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('all')}
                >
                    All Issues
                </button>
                <button 
                    className={`filter-pill ${activeFilter === 'active' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('active')}
                >
                    Active
                </button>
                <button 
                    className={`filter-pill ${activeFilter === 'resolved' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('resolved')}
                >
                    Resolved
                </button>
            </div>

            {/* Location Selection Mode Banner */}
            {isSelectingLocation && (
                <div className="location-select-banner">
                    <span>Tap on the map to select issue location</span>
                    {pinnedLocation && (
                        <button className="report-here-btn" onClick={handleReportAtLocation}>
                            Report Here
                        </button>
                    )}
                </div>
            )}

            {/* The Map */}
            <div id="map-container"></div>

            {/* Floating Action Buttons */}
            <div className="map-fab-container">
                <button 
                    className="map-fab location-fab" 
                    onClick={handleCenterOnUser}
                    disabled={isLocating}
                    title="Center on my location"
                >
                    {isLocating ? '...' : '📍'}
                </button>
                {!isSelectingLocation && (
                    <button 
                        className="map-fab report-fab" 
                        onClick={() => onOpenReport && onOpenReport(userLocation)}
                        title="Report an issue"
                    >
                        +
                    </button>
                )}
            </div>

            {/* Issue Detail Card */}
            {selectedIssue && (
                <div className="issue-detail-card">
                    <button className="close-issue-card" onClick={() => setSelectedIssue(null)}>×</button>
                    <div className="issue-header">
                        <span className="issue-icon">{ISSUE_ICONS[selectedIssue.type]?.icon || '⚠️'}</span>
                        <div>
                            <h3>{selectedIssue.type}</h3>
                            <span className={`issue-status ${selectedIssue.status}`}>
                                {selectedIssue.status === 'active' ? 'Active' : 'Resolved'}
                            </span>
                        </div>
                    </div>
                    <p className="issue-description">{selectedIssue.description}</p>
                    <div className="issue-meta">
                        <span>Reported: {selectedIssue.createdAt}</span>
                        <span className="issue-votes">{selectedIssue.votes} helpful votes</span>
                    </div>
                    <div className="issue-actions">
                        <button className="vote-btn">👍 Helpful</button>
                        <button className="vote-btn">👎 Not there</button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default MapPlaceholder;
