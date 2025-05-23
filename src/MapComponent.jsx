import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix marker icons manually
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import axios from 'axios';

const DefaultIcon = L.icon({
  iconUrl:"./img/placeholder.png",
  shadowUrl,
  iconSize: [30, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Recenter map component
const RecenterMap = ({ lat, lon }) => {
  const map = useMap();
  useEffect(() => {
    // Center the map with a higher zoom level to ensure the marker is centered
    map.setView([lat, lon], 16, { animate: true });
  }, [lat, lon, map]);

  return null;
};
// import axios from 'axios';





// Example usage

const MapComponent = () => {
  const [lat, setLat] = useState(28.386533);
  const [lon, setLon] = useState(76.966109);
  const [searchQuery, setSearchQuery] = useState('');
  const [markerPosition, setMarkerPosition] = useState({ lat, lon });
  const [center, setCenter] = useState({ lat, lon });
  const markerRef = useRef(null);

  // Update marker position when lat/lon changes
  useEffect(() => {
    setMarkerPosition({ lat, lon });
  }, [lat, lon]);

  // Open the popup when markerPosition changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (markerRef.current) {
        markerRef.current.openPopup();
      }
    }, 100); // slight delay to ensure rendering is complete
    return () => clearTimeout(timeout);
  }, [markerPosition]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    const encodedQuery = encodeURIComponent(searchQuery);
    const apiKey = 'pk.8dc5e299f53929224a20616fcd81c3e5'; // Replace with your actual API key
    const url = `https://us1.locationiq.com/v1/search?key=${AIzaSyA82Y8RmFo5cDOUX0vqa6-cDkq-SoNbSjg}&q=${encodedQuery}&format=json`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        const { lat: newLat, lon: newLon } = data[0];
        const parsedLat = parseFloat(newLat);
        const parsedLon = parseFloat(newLon);
        
        setLat(parsedLat);
        setLon(parsedLon);
        setCenter({ lat: parsedLat, lon: parsedLon });
        setMarkerPosition({ lat: parsedLat, lon: parsedLon });
      } else {
        alert('Location not found.');
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching location data.');
    }
  };

  const mapRef = useRef(null);
  
  const handleNavigate = () => {
    // Update both center and marker position to ensure they're in sync
    setCenter({ lat, lon });
    setMarkerPosition({ lat, lon });
    
    // Force the map to recenter with the marker in the exact center
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lon], 16, {
        animate: true,
        duration: 1
      });
    }
  };
  useEffect(()=>{
   
    // const getLatLongFromGemini = async (address) => {
    //     const apiKey = 'AIzaSyA82Y8RmFo5cDOUX0vqa6-cDkq-SoNbSjg'; // Replace with your actual Gemini API key
    //     const model = 'models/gemini-1.0'; // Try also: models/gemini-1.5-flash
    //     const endpoint = `https://generativelanguage.googleapis.com/v1/${model}:generateContent?key=${apiKey}`;
      
    //     const prompt = `What are the latitude and longitude of ${address}? Respond only in JSON format like {"latitude": ..., "longitude": ...}`;
      
    //     try {
    //       const response = await axios.post(
    //         endpoint,
    //         {
    //           contents: [{ parts: [{ text: prompt }] }],
    //         },
    //         {
    //           headers: {
    //             'Content-Type': 'application/json',
    //           },
    //         }
    //       );
      
    //       const result = response.data.candidates[0]?.content?.parts[0]?.text;
    //       console.log('Gemini Response:', result);
    //       return result;
    //     } catch (error) {
    //       console.error('Gemini API Error:', error.response?.data || error.message);
    //       return null;
    //     }
    //   };
      

      const getLatLongFromGemini = async (address) => {
        const apiKey = 'AIzaSyA82Y8RmFo5cDOUX0vqa6-cDkq-SoNbSjg'; // Replace with your actual Gemini API key
        const endpoint = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';
      
        const prompt = `Give only the latitude and longitude of this address in JSON format: "${address}"`;
      
        try {
          const response = await axios.post(
            `${endpoint}?key=${apiKey}`,
            {
              contents: [
                {
                  parts: [
                    { text: prompt }
                  ]
                }
              ]
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
      
          const result = response.data.candidates[0]?.content?.parts[0]?.text;
          console.log('Gemini Response:', result);
          return result;
        } catch (error) {
          console.error('Gemini API Error:', error.response?.data || error.message);
          return null;
        }
      };
      

// const getLatLongFromGemini = async (address) => {
//     const apiKey = 'AIzaSyA82Y8RmFo5cDOUX0vqa6-cDkq-SoNbSjg'; // Replace with your actual Gemini API key
//     const endpoint = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';

//   const prompt = `What are the latitude and longitude of ${address}? Respond in JSON format like {"latitude": ..., "longitude": ...}`;

//   try {
//     const response = await axios.post(
//       `${endpoint}?key=${apiKey}`,
//       {
//         contents: [{ parts: [{ text: prompt }] }],
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     const text = response.data.candidates[0]?.content?.parts[0]?.text;
//     console.log('Gemini Response:', text);
//     return text;
//   } catch (error) {
//     console.error('Gemini API Error:', error.response?.data || error.message);
//     return null;
//   }
// };



    getLatLongFromGemini('atal chowk pusta road ismailpur faridabad');
console.log("ererer")
},[])
  return (
    <>
      {/* Controls */}
      <div>
        <label>
          Latitude:
          <input
            type="number"
            value={lat}
            onChange={(e) => setLat(parseFloat(e.target.value))}
            step="0.0001"
            style={{ width: '200px', marginLeft: '5px' }}
          />
        </label>
        <br />
        <label>
          Longitude:
          <input
            type="number"
            value={lon}
            onChange={(e) => setLon(parseFloat(e.target.value))}
            step="0.0001"
            style={{ width: '200px', marginLeft: '5px' }}
          />
        </label>
        <br />
        <label>
          Search Location:
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '200px', marginLeft: '5px', marginTop: '5px' }}
          />
        </label>
        <br />
        <button onClick={handleSearch} style={{ marginTop: '10px' }}>
          Search
        </button>
      </div>

      {/* Map */}
      <div style={{ height: '60vh', width: '75%', position: 'relative' }}>
        <MapContainer
          center={[center.lat, center.lon]}
          zoom={16}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          <Marker position={[markerPosition.lat, markerPosition.lon]} ref={markerRef}>
            <Popup closeButton={false} autoClose={false} closeOnClick={false}>
              📍 DLF THE PRIMUS
            </Popup>
          </Marker>

          <RecenterMap lat={center.lat} lon={center.lon} />
        </MapContainer>

        {/* Navigate Button */}
        <button
          onClick={handleNavigate}
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            height:"80px",
            zIndex: 1000,
            padding: '10px 15px',
            background: 'transparent',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          <img style={{height:"100%"}} src="./img/center.png" alt="" />
        </button>
      </div>
    </>
  );
};

export default MapComponent;

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
