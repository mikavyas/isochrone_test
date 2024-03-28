mapboxgl.accessToken = 'pk.eyJ1IjoibWlrYXZ5YXMiLCJhIjoiY2xoczhjcDR1MGZqMzNjcW1scm1paTRpNyJ9.yYDAti9jKKB23RGPg8SeRA';

const map = new mapboxgl.Map({
  container: 'my-map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-79.39390704282365, 43.70777081498133],
  zoom: 9.8
});

// Zoom controls
map.addControl(new mapboxgl.NavigationControl(), 'top-left');

// Full screen control
map.addControl(new mapboxgl.FullscreenControl(), 'top-left');

// Event listener for reset button
document.getElementById('reset-button').addEventListener('click', () => {
  map.flyTo({
    center: [-79.39390704282365, 43.70777081498133],
    zoom: 9.8,
    essential: true
  });
});

let cycle;

// Fetch housing data and add it to the map
fetch('https://tor.publicbikesystem.net/ube/gbfs/v1/en/station_information')
  .then(response => response.json())
  .then(response => {
    cycle = response;
  });

map.on('load', () => {
  // Add housing data as a GeoJSON source
  map.addSource('housing', {
    type: 'geojson',
    data: 'https://raw.githubusercontent.com/mikavyas/isochrone_test/main/Affordable-housing.geojson'
  });

  // Add housing data as a layer
  map.addLayer({
    id: 'houses',
    type: 'circle',
    source: 'housing',
    paint: {
      'circle-color': '#600094',
      'circle-opacity': 1.0,
      'circle-radius': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        11,
        4
      ],
      'circle-outline': '#002aff'
    }
  });

  // Event listener for mousemove on houses layer
  let parksize = null;
  map.on('mousemove', 'houses', (e) => {
    if (e.features.length > 0) {
      if (parksize !== null) {
        map.setFeatureState(
          { source: 'housing', id: parksize },
          { hover: false }
        );
      }
      parksize = e.features[0].id;
      map.setFeatureState(
        { source: 'housing', id: parksize },
        { hover: true }
      );
    }
  });

  // Event listener for mouseleave on houses layer
  map.on('mouseleave', 'houses', () => {
    if (parksize !== null) {
      map.setFeatureState(
        { source: 'housing', id: parksize },
        { hover: false }
      );
    }
    parksize = null;
  });

  // Event listener for click on houses layer
  map.on('click', 'houses', (e) => {
    const coordinates1 = e.lngLat;
    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML("<b>Address: </b>" + e.features[0].properties.Address + "<br>" +
        "<b>Number of Units proposed:</b> " + e.features[0].properties.Most_recent_number_of_affordab + "<br>" +
        "<b>Number of Units built:</b> " + e.features[0].properties.Units_Built_Num + "<br>" +
        "<b>Construction start date:</b> " + e.features[0].properties.Construction_Start_Date + "<br>" +
        "<b>Construction completion date:</b> " + e.features[0].properties.Actual_Construction_Completion + "<br>" + "<br>" +
        '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<button class="btn btn-primary btn-sm" id="zoom-in">Zoom to Feature')
      .addTo(map);
    document.getElementById('zoom-in').addEventListener('click', () => {
      map.flyTo({
        center: coordinates1,
        zoom: 13,
        essential: true
      });
    });
  });

  // Event listener for change on affordable housing checkbox
  document.getElementById('affordable-housing-id').addEventListener('change', (e) => {
    map.setLayoutProperty(
      'houses',
      'visibility',
      e.target.checked ? 'visible' : 'none'
    );
  });

  // Add Isochrone API implementation here...
});
