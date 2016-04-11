import { isMobile } from '../utils';

class Map {
  constructor() {
    this.els = document.querySelectorAll('[id*="map"]');
    if (this.els === null) return;
    
    this.maps = [];

    this.setMapSettings();
    this.initMaps();
  }

  setMapSettings() {
    L.Icon.Default.imagePath = '/img';
  }

  initMaps() {
    for (let map of Array.apply(null, this.els)) {
      var lat = parseFloat(map.getAttribute('data-lat'));
      var lng = parseFloat(map.getAttribute('data-lng'));
      var zoom = parseFloat(map.getAttribute('data-zoom'));

      // Zoom out of on mobile device
      if (isMobile()) zoom--;

      var type = map.getAttribute('data-type');
      var id = map.getAttribute('id');
      var markers = Array.apply(null, map.querySelectorAll('*'));

      var mapObject = L.map(id, { 
        scrollWheelZoom: false, 
        touchZoom: isMobile() ? false : true,
        doubleClickZoom: isMobile() ? false : true, 
        dragging: isMobile() ? false : true,
        tap: isMobile() ? false : true,
      }).setView([lat, lng], zoom);
      this.maps.push(mapObject);
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
          id: `mapbox.${type}`,
          accessToken: 'pk.eyJ1IjoibGluZGVrYWVyIiwiYSI6ImNpbWV4MmxhajAwNGF3MGx1aDZtMnVyaGcifQ.hRO_0kjf-RttjttrnO4Lfg'
      }).addTo(mapObject);

      for (let marker of markers) {
        var lat = parseFloat(marker.getAttribute('data-lat'));
        var lng = parseFloat(marker.getAttribute('data-lng'));
        var label = marker.getAttribute('data-label');
        var marker = L.marker([lat, lng]).addTo(mapObject);
        marker.bindPopup(label);
      }
    }
  }

}

export default Map;