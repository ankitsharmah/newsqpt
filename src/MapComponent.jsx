// // import React, { useState, useEffect, useRef } from 'react';
// // import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
// // import 'leaflet/dist/leaflet.css';
// // import L from 'leaflet';

// // // Fix marker icons manually
// // import iconUrl from 'leaflet/dist/images/marker-icon.png';
// // import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
// // import axios from 'axios';

// // const DefaultIcon = L.icon({
// //   iconUrl:"./img/placeholder.png",
// //   shadowUrl,
// //   iconSize: [30, 41],
// //   iconAnchor: [12, 41],
// //   popupAnchor: [1, -34],
// //   shadowSize: [41, 41],
// // });
// // L.Marker.prototype.options.icon = DefaultIcon;

// // // Recenter map component
// // const RecenterMap = ({ lat, lon }) => {
// //   const map = useMap();
// //   useEffect(() => {
// //     // Center the map with a higher zoom level to ensure the marker is centered
// //     map.setView([lat, lon], 16, { animate: true });
// //   }, [lat, lon, map]);

// //   return null;
// // };
// // // import axios from 'axios';





// // // Example usage

// // const MapComponent = () => {
// //   const [lat, setLat] = useState(28.386533);
// //   const [lon, setLon] = useState(76.966109);
// //   const [searchQuery, setSearchQuery] = useState('');
// //   const [markerPosition, setMarkerPosition] = useState({ lat, lon });
// //   const [center, setCenter] = useState({ lat, lon });
// //   const markerRef = useRef(null);

// //   // Update marker position when lat/lon changes
// //   useEffect(() => {
// //     setMarkerPosition({ lat, lon });
// //   }, [lat, lon]);

// //   // Open the popup when markerPosition changes
// //   useEffect(() => {
// //     const timeout = setTimeout(() => {
// //       if (markerRef.current) {
// //         markerRef.current.openPopup();
// //       }
// //     }, 100); // slight delay to ensure rendering is complete
// //     return () => clearTimeout(timeout);
// //   }, [markerPosition]);

// //   const handleSearch = async () => {
// //     if (!searchQuery.trim()) return;

// //     const encodedQuery = encodeURIComponent(searchQuery);
// //     const apiKey = 'pk.8dc5e299f53929224a20616fcd81c3e5'; // Replace with your actual API key
// //     const url = `https://us1.locationiq.com/v1/search?key=${AIzaSyA82Y8RmFo5cDOUX0vqa6-cDkq-SoNbSjg}&q=${encodedQuery}&format=json`;

// //     try {
// //       const res = await fetch(url);
// //       const data = await res.json();

// //       if (Array.isArray(data) && data.length > 0) {
// //         const { lat: newLat, lon: newLon } = data[0];
// //         const parsedLat = parseFloat(newLat);
// //         const parsedLon = parseFloat(newLon);
        
// //         setLat(parsedLat);
// //         setLon(parsedLon);
// //         setCenter({ lat: parsedLat, lon: parsedLon });
// //         setMarkerPosition({ lat: parsedLat, lon: parsedLon });
// //       } else {
// //         alert('Location not found.');
// //       }
// //     } catch (err) {
// //       console.error(err);
// //       alert('Error fetching location data.');
// //     }
// //   };

// //   const mapRef = useRef(null);
  
// //   const handleNavigate = () => {
// //     // Update both center and marker position to ensure they're in sync
// //     setCenter({ lat, lon });
// //     setMarkerPosition({ lat, lon });
    
// //     // Force the map to recenter with the marker in the exact center
// //     if (mapRef.current) {
// //       mapRef.current.flyTo([lat, lon], 16, {
// //         animate: true,
// //         duration: 1
// //       });
// //     }
// //   };
// //   useEffect(()=>{
   
// //     // const getLatLongFromGemini = async (address) => {
// //     //     const apiKey = 'AIzaSyA82Y8RmFo5cDOUX0vqa6-cDkq-SoNbSjg'; // Replace with your actual Gemini API key
// //     //     const model = 'models/gemini-1.0'; // Try also: models/gemini-1.5-flash
// //     //     const endpoint = `https://generativelanguage.googleapis.com/v1/${model}:generateContent?key=${apiKey}`;
      
// //     //     const prompt = `What are the latitude and longitude of ${address}? Respond only in JSON format like {"latitude": ..., "longitude": ...}`;
      
// //     //     try {
// //     //       const response = await axios.post(
// //     //         endpoint,
// //     //         {
// //     //           contents: [{ parts: [{ text: prompt }] }],
// //     //         },
// //     //         {
// //     //           headers: {
// //     //             'Content-Type': 'application/json',
// //     //           },
// //     //         }
// //     //       );
      
// //     //       const result = response.data.candidates[0]?.content?.parts[0]?.text;
// //     //       console.log('Gemini Response:', result);
// //     //       return result;
// //     //     } catch (error) {
// //     //       console.error('Gemini API Error:', error.response?.data || error.message);
// //     //       return null;
// //     //     }
// //     //   };
      

// //       const getLatLongFromGemini = async (address) => {
// //         const apiKey = 'AIzaSyA82Y8RmFo5cDOUX0vqa6-cDkq-SoNbSjg'; // Replace with your actual Gemini API key
// //         const endpoint = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';
      
// //         const prompt = `Give only the latitude and longitude of this address in JSON format: "${address}"`;
      
// //         try {
// //           const response = await axios.post(
// //             `${endpoint}?key=${apiKey}`,
// //             {
// //               contents: [
// //                 {
// //                   parts: [
// //                     { text: prompt }
// //                   ]
// //                 }
// //               ]
// //             },
// //             {
// //               headers: {
// //                 'Content-Type': 'application/json',
// //               },
// //             }
// //           );
      
// //           const result = response.data.candidates[0]?.content?.parts[0]?.text;
// //           console.log('Gemini Response:', result);
// //           return result;
// //         } catch (error) {
// //           console.error('Gemini API Error:', error.response?.data || error.message);
// //           return null;
// //         }
// //       };
      

// // // const getLatLongFromGemini = async (address) => {
// // //     const apiKey = 'AIzaSyA82Y8RmFo5cDOUX0vqa6-cDkq-SoNbSjg'; // Replace with your actual Gemini API key
// // //     const endpoint = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';

// // //   const prompt = `What are the latitude and longitude of ${address}? Respond in JSON format like {"latitude": ..., "longitude": ...}`;

// // //   try {
// // //     const response = await axios.post(
// // //       `${endpoint}?key=${apiKey}`,
// // //       {
// // //         contents: [{ parts: [{ text: prompt }] }],
// // //       },
// // //       {
// // //         headers: {
// // //           'Content-Type': 'application/json',
// // //         },
// // //       }
// // //     );

// // //     const text = response.data.candidates[0]?.content?.parts[0]?.text;
// // //     console.log('Gemini Response:', text);
// // //     return text;
// // //   } catch (error) {
// // //     console.error('Gemini API Error:', error.response?.data || error.message);
// // //     return null;
// // //   }
// // // };



// //     getLatLongFromGemini('atal chowk pusta road ismailpur faridabad');
// // console.log("ererer")
// // },[])
// //   return (
// //     <>
// //       {/* Controls */}
// //       <div>
// //         <label>
// //           Latitude:
// //           <input
// //             type="number"
// //             value={lat}
// //             onChange={(e) => setLat(parseFloat(e.target.value))}
// //             step="0.0001"
// //             style={{ width: '200px', marginLeft: '5px' }}
// //           />
// //         </label>
// //         <br />
// //         <label>
// //           Longitude:
// //           <input
// //             type="number"
// //             value={lon}
// //             onChange={(e) => setLon(parseFloat(e.target.value))}
// //             step="0.0001"
// //             style={{ width: '200px', marginLeft: '5px' }}
// //           />
// //         </label>
// //         <br />
// //         <label>
// //           Search Location:
// //           <input
// //             type="text"
// //             value={searchQuery}
// //             onChange={(e) => setSearchQuery(e.target.value)}
// //             style={{ width: '200px', marginLeft: '5px', marginTop: '5px' }}
// //           />
// //         </label>
// //         <br />
// //         <button onClick={handleSearch} style={{ marginTop: '10px' }}>
// //           Search
// //         </button>
// //       </div>

// //       {/* Map */}
// //       <div style={{ height: '60vh', width: '75%', position: 'relative' }}>
// //         <MapContainer
// //           center={[center.lat, center.lon]}
// //           zoom={16}
// //           style={{ height: '100%', width: '100%' }}
// //           ref={mapRef}
// //         >
// //           <TileLayer
// //             url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
// //             attribution='&copy; OpenStreetMap contributors'
// //           />

// //           <Marker position={[markerPosition.lat, markerPosition.lon]} ref={markerRef}>
// //             <Popup closeButton={false} autoClose={false} closeOnClick={false}>
// //               📍 DLF THE PRIMUS
// //             </Popup>
// //           </Marker>

// //           <RecenterMap lat={center.lat} lon={center.lon} />
// //         </MapContainer>

// //         {/* Navigate Button */}
// //         <button
// //           onClick={handleNavigate}
// //           style={{
// //             position: 'absolute',
// //             bottom: '20px',
// //             right: '20px',
// //             height:"80px",
// //             zIndex: 1000,
// //             padding: '10px 15px',
// //             background: 'transparent',
// //             color: 'white',
// //             border: 'none',
// //             borderRadius: '6px',
// //             cursor: 'pointer'
// //           }}
// //         >
// //           <img style={{height:"100%"}} src="./img/center.png" alt="" />
// //         </button>
// //       </div>
// //     </>
// //   );
// // };

// // export default MapComponent;

// import React, { useState, useRef, useEffect } from 'react';
// import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';

// // Marker icon fix
// import iconUrl from 'leaflet/dist/images/marker-icon.png';
// import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// const DefaultIcon = L.icon({
//   iconUrl,
//   shadowUrl,
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
//   shadowSize: [41, 41]
// });
// L.Marker.prototype.options.icon = DefaultIcon;

// // Dummy property locations
// const properties = [
//   {
//     id: 1,
//     name: 'Green Villa',
//     lat: 28.4971,
//     lon: 77.3444,
//     description: 'Spacious and green villa.'
//   },
//   {
//     id: 2,
//     name: 'Sky Heights',
//     lat: 28.4992,
//     lon: 77.3455,
//     description: 'Modern apartments with skyline views.'
//   },
//   {
//     id: 3,
//     name: 'City Corner',
//     lat: 28.4953,
//     lon: 77.3423,
//     description: 'Close to shopping and metro.'
//   }
// ];

// // Recenter component
// const RecenterMap = ({ lat, lon }) => {
//   const map = useMap();
//   useEffect(() => {
//     map.setView([lat, lon], map.getZoom(), { animate: true });
//   }, [lat, lon]);
//   return null;
// };

// const MapComponent = () => {
//   const [highlightedId, setHighlightedId] = useState(null);
//   const [center, setCenter] = useState({ lat: properties[0].lat, lon: properties[0].lon });
//   const popupRefs = useRef({});

//   const handleMarkerClick = (id) => {
//     setHighlightedId(id);
//     const popup = popupRefs.current[id];
//     if (popup) popup.openOn(popup._map);
//   };

//   const handleNavigate = (lat, lon, id) => {
//     setCenter({ lat, lon });
//     setHighlightedId(id);
//     const popup = popupRefs.current[id];
//     if (popup) popup.openOn(popup._map);
//   };

//   return (
//     <div style={{ display: 'flex', height: '100vh' }}>
//       {/* Left: Location Cards */}
//       <div style={{ width: '30%', overflowY: 'scroll', padding: '10px' }}>
//         <h3>Properties</h3>
//         {properties.map((prop) => (
//           <div
//             key={prop.id}
//             style={{
//               border: '1px solid #ccc',
//               padding: '10px',
//               marginBottom: '10px',
//               borderRadius: '5px',
//               backgroundColor: highlightedId === prop.id ? '#f0f8ff' : '#fff'
//             }}
//           >
//             <h4>{prop.name}</h4>
//             <p>{prop.description}</p>
//             <button onClick={() => handleNavigate(prop.lat, prop.lon, prop.id)}>Navigate</button>
//           </div>
//         ))}
//       </div>

//       {/* Right: Map */}
//       <div style={{ width: '70%' }}>
//         <MapContainer center={[center.lat, center.lon]} zoom={15} style={{ height: '100%', width: '100%' }}>
//           <TileLayer
//             url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
//             attribution='&copy; OpenStreetMap contributors'
//           />
//           {properties.map((prop) => (
//             <Marker
//               key={prop.id}
//               position={[prop.lat, prop.lon]}
//               eventHandlers={{
//                 click: () => handleMarkerClick(prop.id),
//                 mouseover: (e) => e.target.openPopup(),
//                 mouseout: (e) => e.target.closePopup()
//               }}
//             >
//               <Popup ref={(el) => (popupRefs.current[prop.id] = el)}>
//                 <strong>{prop.name}</strong><br />
//                 {prop.description}
//               </Popup>
//             </Marker>
//           ))}
//           <RecenterMap lat={center.lat} lon={center.lon} />
//         </MapContainer>
//       </div>
//     </div>
//   );
// };

// export default MapComponent;



import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Home, Star, Filter, Eye, Navigation, Phone, Heart, Share2, Grid, List, X, ChevronDown, Maximize2, Settings, Info } from 'lucide-react';

const PropertyMapComponent = () => {
  // Property data
  const properties = [
    {
      id: 1,
      name: 'Green Villa',
      lat: 28.3866,
      lon: 76.9660,
      description: 'Spacious and green villa with garden.',
      price: '₹2.5 Cr',
      type: 'Villa',
      bedrooms: 4,
      bathrooms: 3,
      area: '2400 sq ft',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300&h=200&fit=crop',
      amenities: ['Garden', 'Parking', 'Security'],
      contact: '+91-9876543210',
      status: 'available',
      featured: true
    },
    {
      id: 2,
      name: 'Sky Heights',
      lat: 28.4992,
      lon: 77.3455,
      description: 'Modern apartments with skyline views.',
      price: '₹1.8 Cr',
      type: 'Apartment',
      bedrooms: 3,
      bathrooms: 2,
      area: '1800 sq ft',
      rating: 4.2,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300&h=200&fit=crop',
      amenities: ['Gym', 'Pool', 'Elevator'],
      contact: '+91-9876543211',
      status: 'available',
      featured: false
    },
    {
      id: 3,
      name: 'City Corner',
      lat: 28.4953,
      lon: 76.3423,
      description: 'Close to shopping and metro.',
      price: '₹1.2 Cr',
      type: 'Apartment',
      bedrooms: 2,
      bathrooms: 2,
      area: '1200 sq ft',
      rating: 4.0,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&h=200&fit=crop',
      amenities: ['Metro Access', 'Shopping', 'Restaurants'],
      contact: '+91-9876543212',
      status: 'sold',
      featured: false
    },
    {
      id: 4,
      name: 'Riverside Retreat',
      lat: 28.5010,
      lon: 77.3480,
      description: 'Peaceful riverside property.',
      price: '₹3.2 Cr',
      type: 'Villa',
      bedrooms: 5,
      bathrooms: 4,
      area: '3000 sq ft',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=300&h=200&fit=crop',
      amenities: ['River View', 'Garden', 'Boating'],
      contact: '+91-9876543213',
      status: 'available',
      featured: true
    }
  ];

  // State management
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [mapLoaded, setMapLoaded] = useState(false);
  const [viewMode, setViewMode] = useState('card');
  const [showFilters, setShowFilters] = useState(false);
  const [mapStyle, setMapStyle] = useState('standard');
  const [satelliteProvider, setSatelliteProvider] = useState('esri'); // ADD THIS LINE
  const [hoveredId, setHoveredId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);

  // Refs
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markers = useRef({});

  // Filter properties
  const filteredProperties = properties.filter(prop => {
    const matchesSearch = prop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prop.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || prop.type.toLowerCase() === filterType.toLowerCase();
    const matchesStatus = filterStatus === 'all' || prop.status === filterStatus;
    const matchesFeatured = !showFeaturedOnly || prop.featured;
    
    return matchesSearch && matchesType && matchesStatus && matchesFeatured;
  });

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapLoaded) return;

    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
    script.onload = () => {
      initializeMap();
      setMapLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (mapInstance.current) {
        mapInstance.current.remove();
      }
    };
  }, []);

  // Initialize Leaflet map - REPLACE THIS ENTIRE FUNCTION
  const initializeMap = () => {
    if (!window.L || !mapRef.current) return;

    mapInstance.current = window.L.map(mapRef.current).setView([28.4971, 77.3444], 15);
    
    // Commercial-friendly satellite providers (all free for commercial use)
    const satelliteProviders = {
      esri: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '© Esri | © Maxar, Microsoft, Facebook, Inc., Earthstar Geographics',
        maxZoom: 19,
        name: 'Esri Satellite'
      },
      cartodb: {
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        attribution: '© CartoDB | © OpenStreetMap contributors',
        maxZoom: 18,
        name: 'CartoDB Voyager'
      },
      wikimedia: {
        url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png',
        attribution: '© Wikimedia Foundation | © OpenStreetMap contributors',
        maxZoom: 18,
        name: 'Wikimedia Maps'
      },
      stamen_terrain: {
        url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg',
        attribution: '© Stamen Design | © OpenStreetMap contributors',
        maxZoom: 18,
        name: 'Stamen Terrain'
      },
      opentopomap: {
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '© OpenTopoMap | © OpenStreetMap contributors',
        maxZoom: 17,
        name: 'OpenTopo Map'
      }
    };
    
    const getCurrentTileConfig = () => {
      if (mapStyle === 'satellite') {
        return {
          url: satelliteProviders[satelliteProvider].url,
          attribution: satelliteProviders[satelliteProvider].attribution,
          maxZoom: satelliteProviders[satelliteProvider].maxZoom
        };
      }
      
      const configs = {
        standard: {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        },
        dark: {
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          attribution: '© CartoDB | © OpenStreetMap contributors',
          maxZoom: 19
        },
        terrain: {
          url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          attribution: '© OpenTopoMap | © OpenStreetMap contributors',
          maxZoom: 17
        }
      };
      
      return configs[mapStyle] || configs.standard;
    };

    const tileConfig = getCurrentTileConfig();
    window.L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
      tileSize: 256
    }).addTo(mapInstance.current);

    addMarkersToMap();
  };

  // Create custom marker
  const createCustomMarker = (property) => {
    if (!window.L) return null;

    const isSelected = selectedId === property.id;
    const isHovered = hoveredId === property.id;
    const color = property.status === 'sold' ? '#ef4444' : 
                 property.featured ? '#f59e0b' : 
                 isSelected ? '#10b981' : '#3b82f6';
    
    const icon = property.type === 'Villa' ? '🏠' : '🏢';
    const scale = isSelected ? 1.3 : isHovered ? 1.1 : 1;

    return window.L.divIcon({
      html: `<div style="
        background: linear-gradient(135deg, ${color}, ${color}dd);
        width: ${30 * scale}px;
        height: ${30 * scale}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        animation: ${isSelected ? 'pulse 2s infinite' : 'none'};
      ">${icon}</div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      </style>`,
      className: 'custom-div-icon',
      iconSize: [30 * scale, 30 * scale],
      iconAnchor: [15 * scale, 15 * scale],
      popupAnchor: [0, -15 * scale],
    });
  };

  // Create popup content
  const createPopupContent = (property) => {
    return `
      <div style="padding: 0; min-width: 280px; border-radius: 12px; overflow: hidden; font-family: 'Inter', sans-serif;">
        <div style="position: relative;">
          <img src="${property.image}" alt="${property.name}" 
               style="width: 100%; height: 140px; object-fit: cover;">
          <div style="position: absolute; top: 8px; right: 8px; 
                      background: rgba(0,0,0,0.7); color: white; 
                      padding: 4px 8px; border-radius: 12px; 
                      font-size: 11px; text-transform: uppercase; 
                      backdrop-filter: blur(10px);">${property.status}</div>
        </div>
        <div style="padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <h3 style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">${property.name}</h3>
            ${property.featured ? '<div style="background: linear-gradient(45deg, #f59e0b, #f97316); color: white; padding: 2px 6px; border-radius: 8px; font-size: 10px; font-weight: 600;">FEATURED</div>' : ''}
          </div>
          <div style="font-size: 20px; font-weight: 700; color: #3b82f6; margin-bottom: 8px;">${property.price}</div>
          <div style="display: flex; gap: 12px; font-size: 13px; color: #6b7280; margin-bottom: 12px;">
            <span>🛏️ ${property.bedrooms}BR</span>
            <span>🚽 ${property.bathrooms}BA</span>
            <span>📐 ${property.area}</span>
          </div>
          <p style="margin: 0 0 12px 0; font-size: 14px; color: #4b5563; line-height: 1.5;">${property.description}</p>
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px;">
            ${property.amenities.slice(0, 3).map(amenity => 
              `<span style="background: linear-gradient(135deg, #f3f4f6, #e5e7eb); 
                            color: #374151; padding: 4px 8px; 
                            border-radius: 8px; font-size: 11px; font-weight: 500;">${amenity}</span>`
            ).join('')}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <div style="display: flex; align-items: center;">
                ${'⭐'.repeat(Math.floor(property.rating))}
                <span style="margin-left: 4px; font-size: 13px; color: #6b7280;">${property.rating}</span>
              </div>
            </div>
            <button onclick="alert('Calling ${property.contact} for ${property.name}')"
                    style="background: linear-gradient(135deg, #3b82f6, #2563eb); 
                          color: white; border: none; 
                          padding: 8px 16px; border-radius: 8px; cursor: pointer; 
                          font-size: 12px; font-weight: 600; 
                          display: flex; align-items: center; gap: 6px;
                          transition: all 0.2s ease;
                          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);">
              📞 Contact
            </button>
          </div>
        </div>
      </div>
    `;
  };

  // Add markers to map
  const addMarkersToMap = () => {
    if (!window.L || !mapInstance.current) return;

    // Clear existing markers
    Object.values(markers.current).forEach(marker => mapInstance.current.removeLayer(marker));
    markers.current = {};

    filteredProperties.forEach(property => {
      const marker = window.L.marker([property.lat, property.lon], {
        icon: createCustomMarker(property)
      }).addTo(mapInstance.current);

      const popup = window.L.popup({
        maxWidth: 320,
        className: 'custom-popup',
        closeButton: true,
        autoPan: true
      }).setContent(createPopupContent(property));

      marker.bindPopup(popup);

      marker.on('click', () => {
        selectProperty(property.id);
      });

      marker.on('mouseover', () => {
        setHoveredId(property.id);
        if (selectedId !== property.id) {
          marker.openPopup();
        }
      });

      marker.on('mouseout', () => {
        setHoveredId(null);
        if (selectedId !== property.id) {
          marker.closePopup();
        }
      });

      markers.current[property.id] = marker;
    });
  };

  // Update markers when filters change
  useEffect(() => {
    if (mapLoaded) {
      addMarkersToMap();
    }
  }, [filteredProperties, selectedId, hoveredId, mapLoaded]);

  // Update map tiles when style or satellite provider changes - ADD THIS NEW EFFECT
  useEffect(() => {
    if (mapLoaded && mapInstance.current) {
      // Remove existing tile layers
      mapInstance.current.eachLayer((layer) => {
        if (layer._url) {
          mapInstance.current.removeLayer(layer);
        }
      });
      
      // Satellite providers configuration
      const satelliteProviders = {
        esri: {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: '© Esri | © Maxar, Microsoft, Facebook, Inc., Earthstar Geographics',
          maxZoom: 19
        },
        cartodb: {
          url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
          attribution: '© CartoDB | © OpenStreetMap contributors',
          maxZoom: 18
        },
        wikimedia: {
          url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png',
          attribution: '© Wikimedia Foundation | © OpenStreetMap contributors',
          maxZoom: 18
        },
        stamen_terrain: {
          url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg',
          attribution: '© Stamen Design | © OpenStreetMap contributors',
          maxZoom: 18
        },
        opentopomap: {
          url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          attribution: '© OpenTopoMap | © OpenStreetMap contributors',
          maxZoom: 17
        }
      };
      
      // Get current tile configuration
      const getCurrentTileConfig = () => {
        if (mapStyle === 'satellite') {
          return {
            url: satelliteProviders[satelliteProvider].url,
            attribution: satelliteProviders[satelliteProvider].attribution,
            maxZoom: satelliteProviders[satelliteProvider].maxZoom
          };
        }
        
        const configs = {
          standard: {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          },
          dark: {
            url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            attribution: '© CartoDB | © OpenStreetMap contributors',
            maxZoom: 19
          },
          terrain: {
            url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
            attribution: '© OpenTopoMap | © OpenStreetMap contributors',
            maxZoom: 17
          }
        };
        
        return configs[mapStyle] || configs.standard;
      };

      const tileConfig = getCurrentTileConfig();
      window.L.tileLayer(tileConfig.url, {
        attribution: tileConfig.attribution,
        maxZoom: tileConfig.maxZoom
      }).addTo(mapInstance.current);
    }
  }, [mapStyle, satelliteProvider, mapLoaded]);

  // Select property
  const selectProperty = (id) => {
    setSelectedId(id);
    const property = properties.find(p => p.id === id);
    
    if (property && mapInstance.current) {
      mapInstance.current.setView([property.lat, property.lon], 16, { animate: true });
      
      setTimeout(() => {
        if (markers.current[id]) {
          markers.current[id].openPopup();
        }
      }, 500);
    }
  };

  // Toggle favorite
  const toggleFavorite = (id) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  // Property Card Component
  const PropertyCard = ({ property, isSelected }) => (
    <div
      className={`property-card ${isSelected ? 'selected' : ''}`}
      onClick={() => selectProperty(property.id)}
      onMouseEnter={() => setHoveredId(property.id)}
      onMouseLeave={() => setHoveredId(null)}
      style={{
        border: `2px solid ${isSelected ? '#3b82f6' : 'transparent'}`,
        padding: '16px',
        marginBottom: '16px',
        borderRadius: '16px',
        background: isSelected ? 'linear-gradient(135deg, #dbeafe, #f0f9ff)' : '#ffffff',
        boxShadow: isSelected ? '0 8px 32px rgba(59, 130, 246, 0.2)' : '0 4px 20px rgba(0,0,0,0.08)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {property.featured && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'linear-gradient(45deg, #f59e0b, #f97316)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '8px',
          fontSize: '10px',
          fontWeight: '600',
          zIndex: 2
        }}>
          FEATURED
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ position: 'relative' }}>
          <img 
            src={property.image} 
            alt={property.name}
            style={{ 
              width: '120px', 
              height: '90px', 
              objectFit: 'cover', 
              borderRadius: '12px',
              flexShrink: 0
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: '6px',
            left: '6px',
            background: property.status === 'sold' ? '#ef4444' : '#10b981',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: '600',
            textTransform: 'uppercase'
          }}>
            {property.status}
          </div>
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <h4 style={{ margin: 0, color: '#1f2937', fontSize: '17px', fontWeight: '600' }}>
              {property.name}
            </h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(property.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <Heart 
                size={18} 
                fill={favorites.has(property.id) ? '#ef4444' : 'none'} 
                color={favorites.has(property.id) ? '#ef4444' : '#6b7280'} 
              />
            </button>
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#3b82f6' }}>
              {property.price}
            </span>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px', display: 'flex', gap: '12px' }}>
              <span>🛏️ {property.bedrooms}BR</span>
              <span>🚽 {property.bathrooms}BA</span>
              <span>📐 {property.area}</span>
            </div>
          </div>
          
          <p style={{ margin: '4px 0', fontSize: '13px', color: '#4b5563', lineHeight: '1.4' }}>
            {property.description}
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {'⭐'.repeat(Math.floor(property.rating))}
                <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '4px' }}>{property.rating}</span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                selectProperty(property.id);
              }}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
            >
              <Navigation size={12} />
              Navigate
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const PropertyListItem = ({ property, isSelected }) => (
    <div
      onClick={() => selectProperty(property.id)}
      onMouseEnter={() => setHoveredId(property.id)}
      onMouseLeave={() => setHoveredId(null)}
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid #f3f4f6',
        backgroundColor: isSelected ? '#f0f9ff' : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        borderLeft: isSelected ? '4px solid #3b82f6' : '4px solid transparent'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h5 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>
              {property.name}
            </h5>
            {property.featured && (
              <span style={{
                background: 'linear-gradient(45deg, #f59e0b, #f97316)',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '6px',
                fontSize: '9px',
                fontWeight: '600'
              }}>
                FEATURED
              </span>
            )}
          </div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#3b82f6', marginBottom: '2px' }}>
            {property.price}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {property.bedrooms}BR • {property.bathrooms}BA • {property.area}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <Star size={12} fill="#fbbf24" color="#fbbf24" />
            <span style={{ fontSize: '12px', color: '#6b7280' }}>{property.rating}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(property.id);
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
          >
            <Heart 
              size={14} 
              fill={favorites.has(property.id) ? '#ef4444' : 'none'} 
              color={favorites.has(property.id) ? '#ef4444' : '#9ca3af'} 
            />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      background: '#f8fafc'
    }}>
      {/* Left Panel */}
      <div style={{ 
        width: isFullscreen ? '0px' : '420px',
        display: 'flex', 
        flexDirection: 'column',
        borderRight: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        transition: 'width 0.3s ease',
        overflow: 'hidden'
      }}>{/* Header */}
      <div style={{ 
        padding: '20px', 
        borderBottom: '1px solid #e2e8f0',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
            Property Finder
          </h2>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Maximize2 size={18} />
          </button>
        </div>
        
        {/* Search Bar */}
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: '#9ca3af' 
          }} />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '14px',
              backgroundColor: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
              style={{
                background: '#f3f4f6',
                border: 'none',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {viewMode === 'card' ? <List size={16} /> : <Grid size={16} />}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                background: showFilters ? '#3b82f6' : '#f3f4f6',
                color: showFilters ? 'white' : '#374151',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              <Filter size={14} />
              Filters
            </button>
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {filteredProperties.length} properties
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div style={{ 
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            marginBottom: '16px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#374151', fontWeight: '500', marginBottom: '4px', display: 'block' }}>
                  Property Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '12px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="villa">Villa</option>
                  <option value="apartment">Apartment</option>
                </select>
              </div>
              
              <div>
                <label style={{ fontSize: '12px', color: '#374151', fontWeight: '500', marginBottom: '4px', display: 'block' }}>
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '12px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            </div>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#374151' }}>
              <input
                type="checkbox"
                checked={showFeaturedOnly}
                onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                style={{ margin: 0 }}
              />
              Featured properties only
            </label>
          </div>
        )}
      </div>

      {/* Properties List */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        padding: viewMode === 'list' ? '0' : '0 16px'
      }}>
        {filteredProperties.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            color: '#6b7280'
          }}>
            <Home size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
            <p>No properties match your criteria</p>
          </div>
        ) : (
          filteredProperties.map(property => (
            viewMode === 'card' ? (
              <PropertyCard 
                key={property.id} 
                property={property} 
                isSelected={selectedId === property.id}
              />
            ) : (
              <PropertyListItem 
                key={property.id} 
                property={property} 
                isSelected={selectedId === property.id}
              />
            )
          ))
        )}
      </div>
    </div>

    {/* Map Container */}
    <div style={{ 
      flex: 1, 
      position: 'relative',
      backgroundColor: '#f3f4f6'
    }}>
      {/* Map Controls */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {/* Map Style Selector */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', color: '#374151', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
              Map Style
            </label>
            <select
              value={mapStyle}
              onChange={(e) => setMapStyle(e.target.value)}
              style={{
                width: '140px',
                padding: '6px 8px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '12px',
                backgroundColor: 'white'
              }}
            >
              <option value="standard">Standard</option>
              <option value="satellite">Satellite</option>
              <option value="dark">Dark</option>
              <option value="terrain">Terrain</option>
            </select>
          </div>
          
          {mapStyle === 'satellite' && (
            <div>
              <label style={{ fontSize: '12px', color: '#374151', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                Satellite Provider
              </label>
              <select
                value={satelliteProvider}
                onChange={(e) => setSatelliteProvider(e.target.value)}
                style={{
                  width: '140px',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '12px',
                  backgroundColor: 'white'
                }}
              >
                <option value="esri">Esri World</option>
                <option value="cartodb">CartoDB</option>
                <option value="wikimedia">Wikimedia</option>
                <option value="stamen_terrain">Stamen</option>
                <option value="opentopomap">OpenTopo</option>
              </select>
            </div>
          )}
        </div>

        {/* Additional Controls */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <button
            onClick={() => {
              if (mapInstance.current) {
                mapInstance.current.setView([28.4971, 77.3444], 12, { animate: true });
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <Home size={14} />
            Reset View
          </button>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <Maximize2 size={14} />
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </button>
        </div>
      </div>

      {/* Map */}
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: isFullscreen ? '0' : '0 0 0 16px'
        }} 
      />
      
      {/* Loading State */}
      {!mapLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #f3f4f6',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 12px auto'
          }} />
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Loading map...</p>
        </div>
      )}

      {/* Selected Property Info */}
      {selectedId && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: isFullscreen ? '200px' : '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.2)',
          maxWidth: '400px'
        }}>
          {(() => {
            const selectedProperty = properties.find(p => p.id === selectedId);
            return selectedProperty ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                    {selectedProperty.name}
                  </h4>
                  <button
                    onClick={() => setSelectedId(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '6px',
                      color: '#6b7280'
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#3b82f6', marginBottom: '8px' }}>
                  {selectedProperty.price}
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
                  {selectedProperty.bedrooms}BR • {selectedProperty.bathrooms}BA • {selectedProperty.area}
                </div>
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#4b5563', lineHeight: '1.4' }}>
                  {selectedProperty.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {'⭐'.repeat(Math.floor(selectedProperty.rating))}
                      <span style={{ fontSize: '13px', color: '#6b7280', marginLeft: '4px' }}>
                        {selectedProperty.rating}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => toggleFavorite(selectedProperty.id)}
                      style={{
                        background: favorites.has(selectedProperty.id) ? '#fef2f2' : '#f9fafb',
                        border: '1px solid #e5e7eb',
                        padding: '8px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Heart 
                        size={16} 
                        fill={favorites.has(selectedProperty.id) ? '#ef4444' : 'none'} 
                        color={favorites.has(selectedProperty.id) ? '#ef4444' : '#6b7280'} 
                      />
                    </button>
                    <button
                      onClick={() => alert(`Calling ${selectedProperty.contact} for ${selectedProperty.name}`)}
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Phone size={14} />
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>

    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .custom-popup {
        border-radius: 12px !important;
      }
      
      .custom-popup .leaflet-popup-content-wrapper {
        border-radius: 12px !important;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15) !important;
        border: 1px solid rgba(255,255,255,0.2) !important;
      }
      
      .custom-popup .leaflet-popup-tip {
        background: white !important;
        border: 1px solid rgba(255,255,255,0.2) !important;
      }
      
      .custom-div-icon {
        background: transparent !important;
        border: none !important;
      }
      
      .property-card:hover {
        transform: translateY(-4px) !important;
        box-shadow: 0 12px 40px rgba(0,0,0,0.12) !important;
      }
      
      input:focus, select:focus {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 2px !important;
      }
      
      button:hover {
        transform: translateY(-1px);
      }
      
      button:active {
        transform: translateY(0);
      }
    `}</style>
  </div>
  );
};

export default PropertyMapComponent;