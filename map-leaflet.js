document.addEventListener('DOMContentLoaded', function() {
  // Basic Leaflet map initialization with example markers
  try {
    if (!window.L) return; // Leaflet not loaded

    var map = L.map('leafletMap', { zoomControl: true }).setView([30.0444, 31.2357], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Example markers (latitude, longitude)
    var samplePoints = [
      { lat: 30.0444, lng: 31.2357, type: 'food', title: 'Central Market', desc: 'Central Market — surplus fruits & veg' },
      { lat: 30.0626, lng: 31.2497, type: 'upcycle', title: 'Riverside Workshop', desc: 'Riverside Workshop — accepts plastics & textiles' },
      { lat: 30.0131, lng: 31.2089, type: 'agri', title: 'Hilltop Fields', desc: 'Hilltop Fields — crop residue available' }
    ];

    samplePoints.forEach(function(p) {
      var color = p.type === 'food' ? '#ffb703' : (p.type === 'upcycle' ? '#00b4d8' : '#90e0ef');

      // Use circle marker for a clean color dot
      var marker = L.circleMarker([p.lat, p.lng], {
        radius: 9,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 1
      }).addTo(map);

      marker.bindPopup('<strong>' + p.title + '</strong><div>' + p.desc + '</div>');
    });

  } catch (err) {
    console.error('Leaflet init error', err);
  }
});
