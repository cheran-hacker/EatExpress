import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons
const restaurantIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1046/1046784.png', // Restaurant Icon
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

const homeIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/25/25694.png', // House Icon
    iconSize: [35, 35],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20]
});

const bikeIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/741/741407.png', // Delivery Bike
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    className: 'delivery-marker' // For optional CSS rotation
});

// Component to handle map bounds
const RecenterAutomatically = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
};

const deliveryPartners = [
    { name: "Valarmathi", icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" },
    { name: "Arunkumar", icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" },
    { name: "Suresh", icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" },
    { name: "Priya", icon: "https://cdn-icons-png.flaticon.com/512/3135/3135768.png" },
    { name: "Anjali", icon: "https://cdn-icons-png.flaticon.com/512/3135/3135768.png" },
    { name: "Karthick", icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" },
    { name: "Deepak", icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }
];

const TrackingMap = ({ status, createdAt, orderId }) => {
    // Mock Coordinates (Avinashi / Tirupur region approx)
    const startPos = [11.1085, 77.3411]; // Restaurant
    const endPos = [11.1285, 77.3611];   // Home (Slightly away)

    const [driverPos, setDriverPos] = useState(startPos);
    const [progress, setProgress] = useState(0);
    const [partner, setPartner] = useState(deliveryPartners[0]);

    useEffect(() => {
        // Consistently pick a random partner based on orderId
        // This ensures a new order gets a random partner, but the same order keeps its partner
        if (orderId) {
            // Simple hash of the ID string
            let hash = 0;
            for (let i = 0; i < orderId.length; i++) {
                hash = orderId.charCodeAt(i) + ((hash << 5) - hash);
            }
            const index = Math.abs(hash) % deliveryPartners.length;
            setPartner(deliveryPartners[index]);
        }
    }, [orderId]);

    useEffect(() => {
        // Calculate Interpolated Position based on Time
        const interval = setInterval(() => {
            const now = new Date();
            const created = new Date(createdAt);
            const totalDurationSecs = 180; // 3 minutes total delivery time
            let diffSeconds = (now - created) / 1000;

            // Normalize progress (0 to 1)
            let prog = Math.min(Math.max(diffSeconds / totalDurationSecs, 0), 1);

            // If Delivered, force 100%
            if (status === 'DELIVERED') prog = 1;
            else if (status === 'CANCELLED') prog = 0;

            setProgress(prog);

            // Linear Interpolation: P(t) = P0 + t * (P1 - P0)
            const lat = startPos[0] + prog * (endPos[0] - startPos[0]);
            const lng = startPos[1] + prog * (endPos[1] - startPos[1]);

            setDriverPos([lat, lng]);

        }, 1000);

        return () => clearInterval(interval);
    }, [createdAt, status]);


    return (
        <div className="rounded-4 overflow-hidden shadow-sm border position-relative" style={{ height: '30vh', minHeight: '200px', width: '100%', zIndex: 1 }}>
            <MapContainer
                center={driverPos}
                zoom={14}
                scrollWheelZoom={false}
                className="h-100 w-100"
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Driver */}
                <Marker position={driverPos} icon={bikeIcon}>
                    <Popup>
                        <div className="text-center">
                            <strong>{partner.name}</strong><br />
                            {Math.round(progress * 100)}% to destination
                        </div>
                    </Popup>
                </Marker>

                {/* Restaurant */}
                <Marker position={startPos} icon={restaurantIcon}>
                    <Popup>Restaurant</Popup>
                </Marker>

                {/* Home */}
                <Marker position={endPos} icon={homeIcon}>
                    <Popup>Home</Popup>
                </Marker>

                {/* Auto Pan */}
                <RecenterAutomatically lat={driverPos[0]} lng={driverPos[1]} />
            </MapContainer>

            {/* Overlay Status Card */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="position-absolute bottom-0 start-0 end-0 m-3"
                style={{ zIndex: 999 }}
            >
                <div className="bg-white p-3 rounded-4 shadow-lg d-flex align-items-center gap-3 border">
                    <div className="bg-light rounded-circle shadow-sm border" style={{ width: '50px', height: '50px', overflow: 'hidden' }}>
                        <img src={partner.icon} className="w-100 h-100 object-fit-cover" alt="Partner" />
                    </div>
                    <div className="flex-grow-1">
                        <h6 className="fw-bold mb-0 text-dark small">{partner.name}</h6>
                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>{status === 'DELIVERED' ? 'Order Delivered' : 'Arriving in ' + Math.max(1, Math.round((1 - progress) * 5)) + ' mins'}</small>
                    </div>
                    <div>
                        <a href="tel:+" className="btn btn-outline-success btn-sm rounded-circle p-2 ms-2 shadow-sm"><i className="fas fa-phone"></i></a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default TrackingMap;
