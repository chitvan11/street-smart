import { useEffect, useRef } from "react";

// --- MOCK DATA ---
// Map coordinates for demonstrating city focus
const MOCK_CITY_COORDINATES = {
    'DELHI': [28.7041, 77.1025],
    'NEW YORK': [40.7128, -74.0060],
    'LONDON': [51.509865, -0.118092],
    'DEFAULT': [0, 0]
};

const getCityCoordinates = (city) => {
    const key = city.toUpperCase().trim();
    return MOCK_CITY_COORDINATES[key] || MOCK_CITY_COORDINATES['DEFAULT'];
};

// --- Map Component ---
const MapPlaceholder = ({ city }) => {
    // mapRef will hold the Leaflet map instance
    const mapRef = useRef(null);
    const markerRef = useRef(null); // Ref to hold the marker instance

    useEffect(() => {
        // We know Leaflet (window.L) is loaded due to conditional rendering in App

        const coords = getCityCoordinates(city);
        const [lat, lng] = coords;
        const zoomLevel = coords[0] === 0 ? 2 : 10; 

        // 1. Initialize Map OR Update View
        if (!mapRef.current) {
             // 1a. Initialize the Map (Only runs once on first render)
             const map = window.L.map('map-container', {
                 zoomControl: true,
             }).setView([lat, lng], zoomLevel);
             
             mapRef.current = map; // Store map instance

             // 1b. Add Tile Layer 
             window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                 attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
             }).addTo(map);
             
        } else {
             // Update existing map view when city prop changes
             mapRef.current.setView([lat, lng], zoomLevel);

             // Clear old marker
             if (markerRef.current) {
                 markerRef.current.remove();
                 markerRef.current = null;
             }
        }
        
        // 2. Add/Update Marker
        if (coords[0] !== 0) {
            const marker = window.L.marker([lat, lng]).addTo(mapRef.current)
                .bindPopup(`Focus: ${city}`)
                .openPopup();
            markerRef.current = marker;
        }

        // --- FIX: Guarantee Size Invalidation ---
        // We call this inside a setTimeout to ensure the map container has fully finished
        // rendering within the DOM before Leaflet tries to draw the tiles.
        const timer = setTimeout(() => {
            if (mapRef.current) {
                 mapRef.current.invalidateSize(); 
            }
        }, 10); // A very short delay is usually enough

        // 3. Cleanup function (Prevents Memory Leaks)
        return () => {
             clearTimeout(timer);
             if (mapRef.current) {
                 if (mapRef.current.getContainer()) {
                     mapRef.current.remove();
                 }
                 mapRef.current = null;
             }
        };
        
    }, [city]); // Dependency on city to re-run and update the map focus

    return (
        <div className="map-placeholder">
            <h2>🗺️ City Issues Map</h2>
            <p style={{marginBottom: '20px'}}>
                Displaying real-time issues in: **{city}**
            </p>
            <div id="map-container"></div>
        </div>
    );
};

export default MapPlaceholder;
