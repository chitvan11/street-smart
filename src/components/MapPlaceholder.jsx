import { useEffect, useRef } from "react";

// --- MOCK DATA ---
const MOCK_CITY_COORDINATES = {
    'DELHI': [28.7041, 77.1025],
    'NEW YORK': [40.7128, -74.0060],
    'LONDON': [51.509865, -0.118092],
    'DEFAULT': [28.7041, 77.1025] // Default to Delhi
};

const getCityCoordinates = (city) => {
    const key = city.toUpperCase().trim();
    return MOCK_CITY_COORDINATES[key] || MOCK_CITY_COORDINATES['DEFAULT'];
};

const MapPlaceholder = ({ city }) => {
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
        const coords = getCityCoordinates(city);
        const [lat, lng] = coords;
        const zoomLevel = 12;

        if (!mapRef.current) {
             const map = window.L.map('map-container', {
                 zoomControl: false, 
             }).setView([lat, lng], zoomLevel);
             
             mapRef.current = map;

             window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                 attribution: '&copy; OpenStreetMap contributors'
             }).addTo(map);
             
        } else {
             mapRef.current.setView([lat, lng], zoomLevel);
             if (markerRef.current) {
                 markerRef.current.remove();
                 markerRef.current = null;
             }
        }
        
        if (coords[0] !== 0) {
            const marker = window.L.marker([lat, lng]).addTo(mapRef.current)
                .bindPopup(`<b>${city}</b><br>Active Issues Area`)
                .openPopup();
            markerRef.current = marker;
        }

        // --- THE GREY TILE FIX ---
        // Forces Leaflet to recalculate the container size after the DOM paints
        const timer = setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
            if (mapRef.current) {
                 mapRef.current.invalidateSize(); 
            }
        }, 250); 

        return () => {
             clearTimeout(timer);
             if (mapRef.current) {
                 if (mapRef.current.getContainer()) {
                     mapRef.current.remove();
                 }
                 mapRef.current = null;
             }
        };
        
    }, [city]);

    return (
        <div className="map-placeholder">
            
            {/* Top Floating Search/Filter Bar */}
            <div className="map-top-overlay">
                <div className="search-bar">🔍 Search Location...</div>
                <div className="filter-pill">📍 {city}</div>
                <div className="filter-pill">🔴 Active Issues</div>
            </div>

            {/* The Map */}
            <div id="map-container"></div>

        </div>
    );
};

export default MapPlaceholder;