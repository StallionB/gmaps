var map;
var infoWindow;
var defaultLocation;
var autocomplete;
var myLocationIcon;
var geocoder;
var myCurrentLocation;
var marker;
var destinationLocation;
var destinationMarker;
var directionsService;
var directionsDisplay;
  function initMap() {
	
	// Default location to show if user disables location requests in browser.
	var defaultLocation = new google.maps.LatLng(6.903754,79.871558);
	
	// If the user has rejected location requests or if the user has not clicked
	// on a location on the map as the destination location, then set the destination location
	// to default location.
	destinationLocation = defaultLocation;
	
	// Create the map using above default coordinates.
	createMap('map', 15, defaultLocation);
	
	// Create a geocoder
	createGeocoder();
	
	// Create the autocomplete search box.
	createSearchBox('searchInput', map);
	
	// Create the info window for the default location.
	// If the user has enabled location requests, then this 
	// info window will be opened at his current location
	createInfoWindow();
	
	// Set the default coordinates using the above default location.
	setCoordinatesInTextBox('coordinates', defaultLocation);
	
	// Create the marker object.
	createMyLocationMarker();
	
	// Create the destination marker. But don't place it on the map
	// until the user clicks on a preferred location.
	createDestinationMarker();
	
	// Create DirectionsService
	directionsService = new google.maps.DirectionsService;
	directionsDisplay = new google.maps.DirectionsRenderer;
	directionsDisplay.setMap(map);
	directionsDisplay.setPanel(document.getElementById('routeDetails'));
	
	// HTML5 geolocation.
	if (navigator.geolocation) {
	  navigator.geolocation.getCurrentPosition(function(position) {
				
		// Get coordinates for my current location.
		var myCurrentLat = position.coords.latitude;
		var myCurrentLng = position.coords.longitude
		myCurrentLocation = new google.maps.LatLng(myCurrentLat, myCurrentLng);
		
		// Display the coordinates for your current location.
		setCoordinatesInTextBox('myCurrentLocation', myCurrentLocation);
		
		
		// Display the marker at your current location.
		marker.setPosition(myCurrentLocation);
		
		// Configure the info window
		infoWindow.setPosition(myCurrentLocation);
		var contentString = '<span class="infoWindowTextBold orange">My current location:</span><br><span class="infoWindowTextBold darkGrey">' +
								document.getElementById("myCurrentLocation").value +
								'</span><hr class="custom"><a href=ela/t1.py?latlong=' + document.getElementById("myCurrentLocation").value + ' class="btn btn-primary btn-xs"> Generate ELA </a>';
		infoWindow.setContent(contentString);
		infoWindow.open(map, marker);
		map.setCenter(myCurrentLocation);
		
		// Create a custom icon to navigate to my current location.
		createMyLocationIcon()
		
		// Add a DOM event to go to my current location when the icon is clicked.
		myLocationIcon.addEventListener('click', function() {
			setCoordinatesInTextBox('myCurrentLocation', myCurrentLocation);
			marker.setPosition(myCurrentLocation);
			infoWindow.setPosition(myCurrentLocation);
			var contentString = '<span class="infoWindowTextBold orange">My current location:</span><br><span class="infoWindowTextBold darkGrey">' +
									document.getElementById("myCurrentLocation").value +
									'</span><hr class="custom"><a href=ela/t1.py?latlong=' + document.getElementById("myCurrentLocation").value + ' class="btn btn-primary btn-xs"> Generate ELA </a>';
			infoWindow.setContent(contentString);
			infoWindow.open(map, marker);
			map.setCenter(myCurrentLocation);
		});
		
	  }, function() {
		// Browser supports geolocation, but user rejects location requests.
		// In that case, place the marker on the default location.
		marker.setPosition(defaultLocation);
		handleLocationError(true, infoWindow, map.getCenter());
	  });
	} else {
	  // Browser doesn't support Geolocation.
	  // In that case, place the marker on the default location.
	  marker.setPosition(defaultLocation);
	  handleLocationError(false, infoWindow, map.getCenter());
	}

	// Add a DOM event to show the coordinates of the clicked location in the map.
	map.addListener('click', function(event) {
	  infoWindow.close();
	  destinationLocation = event.latLng;
	  setCoordinatesInTextBox('coordinates', event.latLng);
	  destinationMarker.setPosition(event.latLng);
	});
	
	// Add a DOM event to show the coordinates when the destination marker is dragged.
	destinationMarker.addListener('drag', function(event) {
	  setCoordinatesInTextBox('coordinates', event.latLng);
	  infoWindow.close();
	  destinationLocation = event.latLng;
	  var dragContentString = '<span class="infoWindowTextBold lightBlue">Location coordinates:</span><br><span class="infoWindowTextBold darkGrey">' +
							document.getElementById("coordinates").value + 
							'</span><hr class="custom">' +
							'<a href=ela/t1.py?latlong=' + document.getElementById("coordinates").value + ' class="btn btn-primary btn-xs"> Generate ELA </a>'
		infoWindow.setContent(dragContentString);
		infoWindow.open(map, destinationMarker);
	});
	
	// Add a DOM event to show the coordinates when the my location marker is dragged.
	marker.addListener('drag', function(event) {
	  infoWindow.close();
	  myCurrentLocation = event.latLng;
	  /* var dragContentString = '<span class="infoWindowTextBold lightBlue">Location coordinates:</span><br><span class="infoWindowTextBold darkGrey">' +
							document.getElementById("coordinates").value + 
							'</span><hr class="custom">' +
							'<a href=ela/t1.py?latlong=' + document.getElementById("coordinates").value + ' class="btn btn-primary btn-xs"> Generate ELA </a>'
		infoWindow.setContent(dragContentString);
		infoWindow.open(map, destinationMarker); */
	});
	
	// Add a DOM event to open the infowindow when the destination marker is clicked.
	destinationMarker.addListener('click', function(){
		infoWindow.close();
		var contentString = '<span class="infoWindowTextBold lightBlue">Location coordinates:</span><br><span class="infoWindowTextBold darkGrey">' +
							document.getElementById("coordinates").value +
							'</span><hr class="custom">' +
							'<a href=ela/t1.py?latlong=' + document.getElementById("coordinates").value + ' class="btn btn-primary btn-xs"> Generate ELA </a>'
		infoWindow.setContent(contentString);
		infoWindow.open(map, destinationMarker);
	});
	
	// Add a DOM event to open the infowindow when my location marker is clicked.
	marker.addListener('click', function(){
		infoWindow.close();
		var contentString = '<span class="infoWindowTextBold lightBlue">Location coordinates:</span><br><span class="infoWindowTextBold darkGrey">' +
							document.getElementById("myCurrentLocation").value +
							'</span><hr class="custom">' +
							'<a href=ela/t1.py?latlong=' + document.getElementById("myCurrentLocation").value + ' class="btn btn-primary btn-xs"> Generate ELA </a>'
		infoWindow.setContent(contentString);
		infoWindow.open(map, marker);
	});
	
	// Add a DOM event to handle the search box when the user selects a location from it.
	autocomplete.addListener('place_changed', function() {
	  infoWindow.close();
	  var place = autocomplete.getPlace();
	  
	  // If the user entered the name of a place which is not suggested and pressed enter key
	  // or the place details request failed.
	  if (!place.geometry) {
		return;
	  }

	  // If the place has a geometry, then show it on the map
	  if (place.geometry.viewport) {
		map.fitBounds(place.geometry.viewport);
	  } else {
		map.setCenter(place.geometry.location);
		map.setZoom(17);
	  }
	  
	  // Set the location to the selected location
	  destinationLocation = place.geometry.location;
	  
	  // Place the marker on the selected location.
	  destinationMarker.setPosition(place.geometry.location);
	  
	  // Update coordinates in the text box.
	  setCoordinatesInTextBox('coordinates', place.geometry.location);
	});
}
  
// Function to handle rejected location requests.
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
infoWindow.setPosition(pos);
infoWindow.setContent(browserHasGeolocation ?
  '<span class="infoWindowTextBold red">Warning:</span><br>Geo-location service failed<br>(<b>Generate ELA,</b> possible)<br><br><span class="infoWindowTextBold">Click on your prefered location</span><br>(Marker draggable)' :
  '<span class="infoWindowTextBold red">Error:</span><br>Your browser doesn\'t support geo-location');
infoWindow.open(map, marker);
}
  
// Function to initialize the map.
function createMap(mapDivID, zoomLevel, location){
	var mapDiv = document.getElementById(mapDivID);
	map = new google.maps.Map(mapDiv, {
	zoom: zoomLevel,
	center: location,
	gestureHandling: 'greedy'
	});
}
  
// Function to initialize the marker.
function createMyLocationMarker(){
	marker = new google.maps.Marker({
	draggable: false,
	map: map,
	title: "Click to view info",
	icon: 'images/man.png'
	});
}
	
// Function to create destination marker
function createDestinationMarker(){
	destinationMarker = new google.maps.Marker({
		draggable: true,
		map: map,
		title: 'Destination',
		icon: 'images/flag.png'
	});
}
  
// Function to set the coordinates inside the text box.
function setCoordinatesInTextBox(coordinatesBoxID, location){
	var coordinatesBox = document.getElementById(coordinatesBoxID);
	coordinatesBox.value = (location.lat()).toFixed(6) + ',' + (location.lng()).toFixed(6);
}
  
// Function to create the autocomplete search box.
function createSearchBox(searchBoxID, map){
	var searchBox = document.getElementById(searchBoxID);
	autocomplete = new google.maps.places.Autocomplete(searchBox);
	autocomplete.bindTo('bounds', map);
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(searchBox);
}
  
// Function to create "Go to my location" icon.
function createMyLocationIcon(){
	var controlDiv = document.createElement('div');

	// Styles for image icon.
	myLocationIcon = document.createElement('div');
	myLocationIcon.style.cursor = 'pointer';
	myLocationIcon.style.backgroundImage = "url(images/my_location.png)";
	myLocationIcon.style.height = '28px';
	myLocationIcon.style.width = '25px';
	myLocationIcon.style.marginRight = '11px';
	myLocationIcon.style.marginTop = '5px';
	myLocationIcon.style.marginBottom = '1px';
	myLocationIcon.title = 'Go to my current location';
	controlDiv.appendChild(myLocationIcon);

	// Place the icon on the map (RIGHT_BOTTOM).
	map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
}
	
// Function to show the location when the user provides coordinates and 
// clicks on the "Show Location" button
function showLocation(geocoder, map, infowindow){
	var input = document.getElementById('coordinates').value;
	var latlngStr = input.split(',', 2);
	var latlng = {lat: parseFloat(latlngStr[0]), lng: parseFloat(latlngStr[1])};
	
	// Using reverse geocoding for retrieving location details using coordinates 
	// provided by user
	geocoder.geocode({'location': latlng}, function(results, status) {
	  if (status === 'OK') {
		if (results[0]) {
		  map.setZoom(15);
		  destinationMarker.setPosition(latlng);
		  
		  /* If you want multiple markers for each time user searches 
			for a place, then use below syntax
			
		  var marker = new google.maps.Marker({
			position: latlng,
			map: map
		  }); 
		  
		  */
		  infoWindow.close()
		  infoWindow.setContent(results[0].formatted_address);
		  infoWindow.open(map, destinationMarker);
		} else {
		  // If location details are not available.
		  alert('No results found');
		}
	  } else {
		// If GEO Coding API is not anabled or some other backend reason
		alert('Geocoder failed due to: ' + status);
	  }
	});
}
	
// Function to initialize geocoder
function createGeocoder(){
	geocoder = new google.maps.Geocoder;
}
	
// Function to initialize infoWindow
function createInfoWindow(){
	infoWindow = new google.maps.InfoWindow;
}

// Function to calculate and display route between my location and destination selected by user.
function calculateAndDisplayRoute(directionsService, directionsDisplay){
	var selectedMode = document.getElementById('mode').value;
	directionsService.route({
		origin: myCurrentLocation,
		destination: destinationLocation,
		travelMode: selectedMode
	}, function(response, status){
		if (status === 'OK') {
			directionsDisplay.setDirections(response);
		} else {
			alert('Directions request failed due to: ' + status);
		}
	});
}
	
$(document).ready(function(){
	// Initializing tooltips
	$('[data-toggle="tooltip"]').tooltip({
	title: '<span class="usageheader">ELA: (12 Digit & Alphanumeric) \'Location Address\' based on Decimal Degrees (DD)</span><hr class=custom>' + 
			['<span class="lightPale">1. Sample at.', '2. sample text sample sample', '3. Sample text. sample', '4. sample text', '5. Sample text sample</span>' ].join('<br>'),
	html: true,
	placement: 'bottom'
	});
	
	// Show location details when user clicks on the "Show Location" button
	$('#showLocationButton').on('click', function(){
		showLocation(geocoder, map, infoWindow);
	});
	
	// Show directions when user clicks on "Show Route"
	$('#showRouteButton').on('click', function(){
		calculateAndDisplayRoute(directionsService, directionsDisplay);
	});
	
	// Styling the dropdown lists.
	$(".chosenSelect").chosen();
	
	// Ajax for fetching location details.
	$('#locButton').on('click', function(){
		$.ajax({
			url: 'https://maps.googleapis.com/maps/api/geocode/json',
			data: {
				address: document.getElementById('loc').value,
				key: 'AIzaSyAeMkNHXitD6DRFYAT9t0pdeGqy19N4o_E'
			}
		}).done(function(response){			
			console.log(response);
			
			var addressComponents = response.results[0].address_components;
			var addressComponentOutput = '';
			for(var i = 0; i < addressComponents.length; i++){
				addressComponentOutput += `
					<strong>${addressComponents[i].types[0]}</strong>: 
					${addressComponents[i].long_name}<br>
				`;
			}			
			document.getElementById('locationDetails').innerHTML = addressComponentOutput;
		});
	});
});		