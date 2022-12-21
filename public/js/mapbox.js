/* eslint-disable */

export const displayMap = (location) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZHRnY3NsIiwiYSI6ImNsYnRkcDVrdTF3NGkzcXBqZTczcHprOTUifQ.j7MSD0vCWsIPookXYMuc8Q';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/dtgcsl/clbtepcah000v14ogim0xp6xq',
    scrollZoom: false,
    // center: [-118.113491, 34.111745],
    // zoom: 10,
    // interactive: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  location.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
