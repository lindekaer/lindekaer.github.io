/*
-----------------------------------------------------------------------------------
|
| Imports
|
-----------------------------------------------------------------------------------
*/

import { isMobile } from '../utils'

/*
-----------------------------------------------------------------------------------
|
| Map modules
|
-----------------------------------------------------------------------------------
*/

class Map {
  constructor () {
    this.els = Array.apply(null, document.querySelectorAll('[id*="map"]'))
    if (this.els === null) return

    this.maps = []

    this.setMapSettings()
    this.initMaps()
  }

  setMapSettings () {
    L.Icon.Default.imagePath = '/frontend/dist/images'
  }

  initMaps () {
    for (let map of this.els) {
      var lat = parseFloat(map.getAttribute('data-lat'))
      var lng = parseFloat(map.getAttribute('data-lng'))
      var zoom = parseFloat(map.getAttribute('data-zoom'))

      // Zoom out of on mobile device
      if (isMobile()) zoom--

      var type = map.getAttribute('data-type')
      var id = map.getAttribute('id')
      var markers = Array.apply(null, map.querySelectorAll('*'))

      var mapObject = L.map(id, {
        scrollWheelZoom: false,
        touchZoom: !isMobile(),
        doubleClickZoom: !isMobile(),
        dragging: !isMobile(),
        tap: !isMobile()
      }).setView([lat, lng], zoom)
      this.maps.push(mapObject)
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        id: `mapbox.${type}`,
        accessToken: 'pk.eyJ1IjoibGluZGVrYWVyIiwiYSI6ImNpbWV4MmxhajAwNGF3MGx1aDZtMnVyaGcifQ.hRO_0kjf-RttjttrnO4Lfg'
      }).addTo(mapObject)

      for (let marker of markers) {
        const markerLat = parseFloat(marker.getAttribute('data-lat'))
        const markerLng = parseFloat(marker.getAttribute('data-lng'))
        var label = marker.getAttribute('data-label')
        L.marker([markerLat, markerLng]).addTo(mapObject).bindPopup(label)
      }
    }
  }
}

/*
-----------------------------------------------------------------------------------
|
| Exports
|
-----------------------------------------------------------------------------------
*/

export default Map
