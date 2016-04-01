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
      var type = map.getAttribute('data-type');
      var id = map.getAttribute('id');

      console.log(id);

      var mapObject = L.map(id).setView([lat, lng], zoom);
      this.maps.push(mapObject);
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
          id: `mapbox.${type}`,
          accessToken: 'pk.eyJ1IjoibGluZGVrYWVyIiwiYSI6ImNpbWV4MmxhajAwNGF3MGx1aDZtMnVyaGcifQ.hRO_0kjf-RttjttrnO4Lfg'
      }).addTo(mapObject);
    }
  }

}

export default Map;