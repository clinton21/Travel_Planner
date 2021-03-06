/**
 * Created by Clinton on 01-02-2015.
 */
angular
	.module('mapApp.controllers', ['cb.x2js', 'ui.utils', 'ui.bootstrap', 'ui.bootstrap-slider', 'daterangepicker'])

.controller(
	'mapController', [
		'$rootScope',
		'$scope',
		'$http',
		'$stateParams',
		'x2js',
		'userData',
		'$q',
		function($rootScope, $scope, $http, $stateParams, x2js, userData, $q) {

			var LatLong = new google.maps.LatLng(51.5072,0.1275);
			var markers = [];

			//colors for routes
			$scope.colors = ['Red', 'Orange', 'Yellow',
				'Green', 'Blue', 'Indigo', 'Violet', '#308FE3'
			];

			$rootScope.infoFrom = 'file';


			$scope.routesList = []; //info about the routes
			$scope.routeCallbackData; //route response from server
			$scope.polyLineData = [];
			$scope.stationLocation = [];
			$scope.stationData = [];
			$scope.suggestionList = [];
			$scope.polyLine = [];
			var circles = [];
			var srcDestMarkers = [];
			$scope.tMode;
			$scope.loadingStatus = false;
			$scope.searchRadius = 2;
			$scope.tempIndex; //stores index for changing size of circle
			$scope.errorMsg;
			$scope.geoPoint;
			var cicle_data = {};
			$scope.eventList = [];
			$scope.startDate, $scope.endDate;
			$scope.sliderFlag = false;
			$scope.BASEURL = BASEURL;
			var rendererOptions = {
				draggable: true,
				suppressMarkers: true
			};

			var directionsDisplay;
			var directionsService;
			$scope.modRoute = false;
			$scope.date = {
				startDate: null,
				endDate: null
			};



			$scope.init = function() {
				var mapOptions = {
					zoom: 10,
					center: LatLong,
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					styles: [{
						"featureType": "water",
						"elementType": "all",
						"stylers": [{
							"hue": "#7fc8ed"
						}, {
							"saturation": 55
						}, {
							"lightness": -6
						}, {
							"visibility": "on"
						}]
					}, {
						"featureType": "water",
						"elementType": "labels",
						"stylers": [{
							"hue": "#7fc8ed"
						}, {
							"saturation": 55
						}, {
							"lightness": -6
						}, {
							"visibility": "off"
						}]
					}, {
						"featureType": "poi.park",
						"elementType": "geometry",
						"stylers": [{
							"hue": "#83cead"
						}, {
							"saturation": 1
						}, {
							"lightness": -15
						}, {
							"visibility": "on"
						}]
					}, {
						"featureType": "landscape",
						"elementType": "geometry",
						"stylers": [{
							"hue": "#f3f4f4"
						}, {
							"saturation": -84
						}, {
							"lightness": 59
						}, {
							"visibility": "on"
						}]
					}, {
						"featureType": "landscape",
						"elementType": "labels",
						"stylers": [{
							"hue": "#ffffff"
						}, {
							"saturation": -100
						}, {
							"lightness": 100
						}, {
							"visibility": "off"
						}]
					}, {
						"featureType": "road",
						"elementType": "geometry",
						"stylers": [{
							"hue": "#ffffff"
						}, {
							"saturation": -100
						}, {
							"lightness": 100
						}, {
							"visibility": "on"
						}]
					}, {
						"featureType": "road",
						"elementType": "labels",
						"stylers": [{
							"hue": "#bbbbbb"
						}, {
							"saturation": -100
						}, {
							"lightness": 26
						}, {
							"visibility": "on"
						}]
					}, {
						"featureType": "road.arterial",
						"elementType": "geometry",
						"stylers": [{
							"hue": "#ffcc00"
						}, {
							"saturation": 100
						}, {
							"lightness": -35
						}, {
							"visibility": "simplified"
						}]
					}, {
						"featureType": "road.highway",
						"elementType": "geometry",
						"stylers": [{
							"hue": "#ffcc00"
						}, {
							"saturation": 100
						}, {
							"lightness": -22
						}, {
							"visibility": "on"
						}]
					}, {
						"featureType": "poi.school",
						"elementType": "all",
						"stylers": [{
							"hue": "#d7e4e4"
						}, {
							"saturation": -60
						}, {
							"lightness": 23
						}, {
							"visibility": "on"
						}]
					}]

				};
				$scope.map = new google.maps.Map(document
					.getElementById('map-canvas'),
					mapOptions);
				var eventControlDiv = document.createElement('div');
				var eventControl = new EventControl(eventControlDiv);
				eventControlDiv.index = 1; //TODO: check if this is necessary
				$scope.map.controls[google.maps.ControlPosition.TOP_CENTER].push(eventControlDiv);
				var legendDiv = document.createElement('DIV');
				var legend = new Legend(legendDiv);
				legendDiv.index = 1; //TODO: check if this is necessary
				$scope.map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(legendDiv);
			};

			//Update the start and end date in the date range picker
			$scope.updateDate = function() {

				$scope.startDate = moment($scope.date.startDate).format("DD/MM/YYYY");
				$scope.endDate = moment($scope.date.endDate).format("DD/MM/YYYY");
				showEvents();
			}

			//GeoCode Address
			function geoCodeAddress() {
				var geocoder = new google.maps.Geocoder();
				var q = $q.defer();
				geocoder.geocode({
					'address': $scope.origin_address
				}, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						var data = results[0].geometry.location;
						createMarker(
							data,
							$scope.origin_address, "src_dest");
						return q.resolve(data);
					} else {
						console.log(status);
						return q.reject('error');
					}
				});
				return q.promise;
			}
			$scope.resetDestination = function() {
				if (!$scope.showDestination) {
					$scope.destination_address = null;
					$scope.travelMode = false;
				}
			}

			function Legend(controlDiv) {
				// Set CSS styles for the DIV containing the control
				// Setting padding to 5 px will offset the control
				// from the edge of the map
				controlDiv.style.padding = '5px';

				// Set CSS for the control border
				var controlUI = document.createElement('DIV');
				controlUI.style.backgroundColor = 'white';
				controlUI.style.borderStyle = 'solid';
				controlUI.style.borderWidth = '1px';
				controlUI.title = 'Legend';
				controlDiv.appendChild(controlUI);

				// Set CSS for the control text
				var controlText = document.createElement('DIV');
				controlText.style.fontFamily = 'Roboto';
				controlText.style.fontSize = '16px';
				controlText.style.paddingLeft = '4px';
				controlText.style.paddingRight = '4px';

				// Add the text
				controlText.innerHTML = '<b>Legend</b><br />' +
					'<img src="' + $scope.BASEURL + '/assets/src_dest_marker.png" /> Source/Destination Marker ' +
					'<img src="' + $scope.BASEURL + '/assets/station_marker.png" /> Station ' +
					'<img src="' + $scope.BASEURL + '/assets/people_marker.png" /> Client '
				controlUI.appendChild(controlText);
			}

			function EventControl(controlDiv) {

				// // Set CSS for the control border
				var controlUI = document.createElement('div');
				controlUI.style.backgroundColor = '#fff';
				controlUI.style.border = '2px solid #fff';
				controlUI.style.borderRadius = '3px';
				controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
				controlUI.style.cursor = 'pointer';
				controlUI.style.marginBottom = '22px';
				controlUI.style.textAlign = 'center';
				controlDiv.appendChild(controlUI);

				var checkbox = document.createElement('input');
				checkbox.type = "checkbox";
				checkbox.name = "eventCheckBox";
				checkbox.value = "value";
				checkbox.id = "eventCheckBox";

				var label = document.createElement('label')
				label.style.fontFamily = 'Roboto';
				label.style.fontSize = '20px';
				label.style.paddingLeft = '5px';
				label.style.paddingRight = '5px';
				label.htmlFor = "id";
				label.id = "eventLabel";
				label.name = "eventLabel";
				label.innerHTML = 'Show Events';

				controlUI.appendChild(checkbox);
				controlUI.appendChild(label);

				google.maps.event.addDomListener(checkbox, 'change', function() {
					if ($('#eventCheckBox').prop("checked")) {
						document.getElementById('eventLabel').innerHTML = 'Showing Your Events';
						// $scope.startDate = moment().add($scope.searchDate, 'd').format("DD/MM/YYYY");
						// $scope.endDate = moment().add(($scope.searchDate + 30), 'd').format("DD/MM/YYYY");
						$scope.sliderFlag = true;
						showEvents();

					} else {
						emptyEventList()
						removeMarkers();
						$scope.sliderFlag = false;
						document.getElementById('eventLabel').innerHTML = 'Show Events';
						$scope.$apply();
					}
				});

			}

			function emptyEventList() {
				$scope.eventList = [];
				//TODO: check if this is necessary
				// for (var i = 0; i < $scope.eventList.length; i++) {
				// 	$scope.eventList.splice(i, 1);
				// }
			}

			function showEvents() {
				emptyEventList()
				removeMarkers();
				var Events = userData.getEventData();
				Events.then(function(eventData) {
					eventData = eventData.data;
					for (var index = 0; index < eventData.length; index++) {
						var meeting_date = moment(eventData[index].meeting_date, 'D/MM/YYYY');
						var flag = moment(meeting_date, 'D/MM/YYYY').isBetween(moment($scope.startDate, 'D/MM/YYYY').subtract(1, 'd'), moment($scope.endDate, 'D/MM/YYYY').subtract(1, 'd'));
						if (flag) {
							meeting_date = moment(meeting_date, 'D/MM/YYYY').format('MMM DD YYYY');
							var map_center = new google.maps.LatLng(
								Number(eventData[index].meeting_location.lat),
								Number(eventData[index].meeting_location.lng));
							var address = eventData[index].meeting_location_humanized;
							var meeting_participants = eventData[index].meeting_participants;

							var time = eventData[index].meeting_time;
							$scope.eventList.push({
								date: meeting_date,
								address: address,
								participants: meeting_participants,
								time: time,
								center: map_center
							});
							createMarker(map_center, address, 'event');
						}

					}
				}, function(error) {
					console.log('Error Showing Events');
				});
			}

			function createMarker(map_center, map_address,
				marker_type) {
				var infowindow = new google.maps.InfoWindow();
				var img;
				if (marker_type === "src_dest") {
					img = {
						url: $scope.BASEURL + '/assets/src_dest_marker.png',
						origin: new google.maps.Point(0, 0),
					};

				} else if (marker_type === "station") {
					img = {
						url: $scope.BASEURL + '/assets/station_marker.png',
						origin: new google.maps.Point(0, 0),
					};
				} else if (marker_type === "suggestion") {
					img = {
						url: $scope.BASEURL + '/assets/people_marker.png',
						origin: new google.maps.Point(0, 0),
					};
				} else if (marker_type === "event") {
					img = {
						url: $scope.BASEURL + '/assets/event_marker.png',
						origin: new google.maps.Point(0, 0),
					};
				}
				var marker = new google.maps.Marker({
					map: $scope.map,
					position: map_center,
					title: map_address,
					icon: img

				});

				google.maps.event.addListener(marker,
					'mouseover',
					function() {
						infowindow.setContent(map_address);
						infowindow.open($scope.map, this);
						marker.setMap($scope.map);

					});

				google.maps.event.addListener(marker,
					'mouseout',
					function() {
						infowindow.close();
					});
				if (marker_type === "src_dest") {
					srcDestMarkers.push(marker);
				} else {
					markers.push(marker);
				}

			};

			$scope.setMapCenter = function(center_point) {
				$scope.map.setCenter(center_point);
				$scope.map.setZoom(16);
			};

			//Searchbox for source and destination
			var input1 = (document
				.getElementById('origin-input'));
			var input2 = (document
				.getElementById('destination-input'));

			searchListener(input1, 'origin-input', '1');
			searchListener(input2, 'destination-input', '2');

			function searchListener(input, htmlID, address_type) {
				var defaultbounds = new google.maps.LatLngBounds(
					new google.maps.LatLng(48.33069, -14.02954),
					new google.maps.LatLng(64.46569, 1.52710));
				var searchBox = new google.maps.places.SearchBox(
					(input), {
						bounds: defaultbounds
					});
				google.maps.event
					.addListener(
						searchBox,
						'places_changed',
						function() {
							var places = searchBox
								.getPlaces();
							if (address_type === '1') {
								$scope.origin_address = (document
									.getElementById(htmlID)).value;
							} else if (address_type === '2') {
								$scope.destination_address = (document
									.getElementById(htmlID)).value;
							}

							if (places.length == 0) {
								return;
							}

						});
			};

			removePolyLines = function() {
				if ($scope.polyLine.length > 0) {
					for (var i = 0; i < $scope.polyLine.length; i++) {
						$scope.polyLine[i].setMap(null);
					}
				}
			};

			$scope.calcRoute = function() {
				$scope.modRoute = false
				if (directionsDisplay != null) {
					directionsDisplay.setMap(null);
					directionsDisplay = null;
				}
				directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
				directionsService = new google.maps.DirectionsService();
				$scope.loadingStatus = true;
				removeMarkers();
				removePolyLines();
				removeCircles();
				for (var i = 0; i < srcDestMarkers.length; i++) {
					srcDestMarkers[i].setMap(null);
				}
				srcDestMarkers.length = 0;
				$scope.routesList.length = 0;
				$scope.suggestionList.length = 0;

				var start = $scope.origin_address;
				if (_.isUndefined($scope.destination_address) || _.isNull($scope.destination_address)) {
					geoCodeAddress().then(function(geoData) {
						$scope.geoPoint = geoData;
						$scope.sendEndLocations(-1);

					}, function(error) {
						console.log('GeoCoding Error');
					});
				} else {

					var end = $scope.destination_address;
					var request;
					$scope.tMode = $scope.travelMode;
					if ($scope.tMode === 'Subway') {
						request = {
							origin: start,
							destination: end,
							optimizeWaypoints: true,
							travelMode: google.maps.TravelMode.TRANSIT,
							provideRouteAlternatives: true,
							transitOptions: {
								modes: [google.maps.TransitMode.SUBWAY],
							},
						};
					} else if ($scope.tMode === 'Car') {
						request = {
							origin: start,
							destination: end,
							optimizeWaypoints: true,
							travelMode: google.maps.TravelMode.DRIVING,
							provideRouteAlternatives: true,
						};
					} else if ($scope.tMode === 'Walking') {
						request = {
							origin: start,
							destination: end,
							optimizeWaypoints: true,
							travelMode: google.maps.TravelMode.WALKING,
							provideRouteAlternatives: true,
						};
					}

					directionsService.route(request, plotRoute);
					directionsDisplay.setMap($scope.map);
					google.maps.event.addListener(directionsDisplay, 'directions_changed', function() {
						$scope.modRoute = true;
						$scope.routesList.length = 0;
						$scope.routeCallbackData = directionsDisplay.directions;
						var currentRoute = directionsDisplay.directions.routes[0];
						var colour = $scope.colors.length - 1;
						setRouteToArray(currentRoute, colour);
					});
				}
			};

			function plotRoute(response, status) {
				if (status == google.maps.DirectionsStatus.OK) {
					// console.log(response);		

					var leng = response.routes[0].legs[0].steps.length;
					createMarker(
						response.routes[0].legs[0].steps[0].start_point,
						$scope.origin_address, "src_dest");
					createMarker(
						response.routes[0].legs[0].steps[leng - 1].end_point,
						$scope.destination_address,
						"src_dest");
					$scope.routeCallbackData = response;
					initPolylineRender(response);
					$scope.loadingStatus = false;
					$scope.$apply();
					var bounds = new google.maps.LatLngBounds();
					bounds
						.extend(response.routes[0].legs[0].steps[0].start_point);
					bounds
						.extend(response.routes[0].legs[0].steps[leng - 1].end_point);

					$scope.map.fitBounds(bounds);

				}

			};

			function initPolylineRender(response) {
				for (var i = 0, len = response.routes.length; i < len; i++) {
					var currentRoute = response.routes[i];
					$scope.polyLineData[i] = currentRoute.overview_path;
					createPolyRoute(i, currentRoute);


				}
			}

			function setMarkers() {
				for (var i = 0; i < markers.length; i++) {
					markers[i].setMap($scope.map);
				}
			};

			function removeMarkers() {
				for (var i = 0; i < markers.length; i++) {
					markers[i].setMap(null);
				}
				markers.length = 0;
			};

			function createPolyRoute(i, currentRoute) {
				var steps = currentRoute.legs[0].steps;
				var path = Array();
				var width = ["10", "8", "6", "4", "2", "1"];
				var routeAlreadyExists = false;
				if ($scope.routesList.length === 0) {
					for (var step = 0; step < steps.length; step++) {
						for (var stepP = 0; stepP < steps[step].path.length; stepP++) {
							path.push(steps[step].path[stepP]);
						}
					}
				} else {
					routeAlreadyExists = false;
					for (var index = 0; index < $scope.routesList.length; index++) {
						if (currentRoute.overview_polyline === $scope.routesList[index].pOverview)
							routeAlreadyExists = true;
						break;
					}
					if (routeAlreadyExists === false) {
						for (var step = 0; step < steps.length; step++) {
							for (var stepP = 0; stepP < steps[step].path.length; stepP++) {
								path
									.push(steps[step].path[stepP]);
							}
						}
					}

				}
				if (routeAlreadyExists === false) {

					var polySelected = {
						'strokeWeight': '10',
						'strokeColor': 'black',
						'strokeOpacity': '1'
					};
					var polyUnselected = {
						'strokeWeight': width[i],
						'strokeColor': $scope.colors[i],
						'strokeOpacity': '1',
					};

					var newPoly = new google.maps.Polyline(
						polyUnselected);
					newPoly.setPath(path);
					newPoly.setMap($scope.map);
					google.maps.event
						.addListener(
							newPoly,
							'mouseover',
							function() {
								newPoly
									.setOptions(polySelected);
							});
					google.maps.event
						.addListener(
							newPoly,
							'mouseout',
							function() {
								newPoly
									.setOptions(polyUnselected);
							});
					google.maps.event
						.addListener(
							newPoly,
							'click',
							function() {
								// console.log($scope.routeCallbackData);
								removePolyLines();
								// console.log($scope.routeCallbackData);
								var temp = $scope.routeCallbackData;
								var obj = $scope.routeCallbackData.routes[i];
								temp.routes.length = 0;
								temp.routes.push(obj);
								directionsDisplay.setDirections(temp);

							});
					$scope.polyLine.push(newPoly);
					setRouteToArray(currentRoute, i);
				}

			};

			function setRouteToArray(currentRoute, colour) {
				var steps = currentRoute.legs[0].steps;
				var route_info = [];
				route_info.length = 0;
				for (var j = 0; j < steps.length; j++) {
					if (steps[j].travel_mode === "TRANSIT") {
						var stop_name = steps[j].transit.arrival_stop.name;
						var line_name;
						if (steps[j].transit.line.short_name === null) {
							line_name = steps[j].transit.line.name;
						} else {
							line_name = steps[j].transit.line.short_name;
						}
						var vech = steps[j].transit.line.vehicle.name;
						var icon = steps[j].transit.line.vehicle.icon;
						route_info
							.push({
								travelInfo: "Take " + vech + " to " + stop_name + " along " + line_name,
								vechIcon: $scope.BASEURL + "/assets/_subway.png",
								end_location: steps[j].end_location
							});
					} else if (steps[j].travel_mode === "DRIVING") {
						route_info
							.push({
								travelInfo: steps[j].instructions,
								vechIcon: $scope.BASEURL + "/assets/_car.png",
							});

					} else {
						route_info
							.push({
								travelInfo: steps[j].instructions,
								vechIcon: $scope.BASEURL + "/assets/_walking.png",
							});

					}
				}
				$scope.routesList
					.push({
						distanceOfRoute: currentRoute.legs[0].distance.text,
						timeOfRoute: currentRoute.legs[0].duration.text,
						routeColor: $scope.colors[colour],
						routeInfo: route_info,
						pOverview: currentRoute.overview_polyline
					});
				$scope.loadingStatus = false;
				$scope.$apply();
			}
			removeCircles = function() {
				if (circles.length > 0) {
					for (var i = 0; i < circles.length; i++) {
						circles[i].setMap(null);
					}
				}
			};

			function remove_duplicates(objectsArray) {
				var usedObjects = {};

				for (var i = objectsArray.length - 1; i >= 0; i--) {
					var so = JSON.stringify(objectsArray[i]);

					if (usedObjects[so]) {
						objectsArray.splice(i, 1);
						$scope.pincodeArray.splice(i, 1);

					} else {
						usedObjects[so] = true;
					}
				}

				// return objectsArray;

			}

			function renderCircle(center_point, single_point_flag) {
				var c = new google.maps.Circle({
					strokeColor: '#000000',
					strokeOpacity: 0.8,
					strokeWeight: 2,
					fillColor: "#FFB733",
					fillOpacity: 0.20,
					map: $scope.map,
					center: center_point,
					radius: ($scope.searchRadius * 1000)
				});
				circles.push(c);
				if (single_point_flag == -1) {
					$scope.map.fitBounds(c.getBounds());
				}

			}

			function create_circle_data() {
				q = $q.defer();
				cicle_data.length = 0;
				cicle_data = {
					radius: $scope.searchRadius * 1000,
					filters: {
						firm_id: 205
					},
					points: []
				};
				for (var i = 0; i < circles.length; i++) {
					var center = circles[i].center;
					cicle_data.points.push({
						lat: center.lat(),
						lng: center.lng()
					});
				}
				// console.log(cicle_data);
				q.resolve();
				return q.promise;
			}

			function createCircles(routeIndex) {
				q = $q.defer();
				if (routeIndex != -1) {
					if ($scope.tMode === 'Subway') {
						for (var counter = 0; counter < $scope.routesList[routeIndex].routeInfo.length; counter++) {
							$scope.locData[counter] = $scope.routesList[routeIndex].routeInfo[counter].end_location;
							if (typeof $scope.locData[counter] !== 'undefined') {
								renderCircle($scope.locData[counter], 1);
							}
						}
					} else if ($scope.tMode === 'Car' || $scope.tMode === 'Walking') {
						renderCircle($scope.routeCallbackData.routes[0].legs[0].end_location, 1);
						var tempDist = 0;


						for (var i = 0; i < $scope.routeCallbackData.routes[routeIndex].legs[0].steps.length; i++) {
							if (tempDist < 2000) {
								tempDist += $scope.routeCallbackData.routes[routeIndex].legs[0].steps[i].distance.value;
							} else if (tempDist > 2000) {
								renderCircle($scope.routeCallbackData.routes[routeIndex].legs[0].steps[i - 1].end_location, 1);
								tempDist = $scope.routeCallbackData.routes[routeIndex].legs[0].steps[i].distance.value;
							}
						}

					}
					create_circle_data().then(function() {
						q.resolve();
					}, function(error) {
						q.reject('error');
					});
				} else if (routeIndex == -1) {
					renderCircle($scope.geoPoint, -1);
					create_circle_data().then(function() {
						q.resolve();
					}, function(error) {
						q.reject('error');
					});

				} else {
					q.reject('error');
				}
				return q.promise;
			};

			function findClients(payload) {
				$scope.suggestionList.length = 0;
				var dataObj = payload.data;

				for (var userIndex = 0; userIndex < dataObj.length; userIndex++) {
					$scope.addressArray = [];
					$scope.addressArray.length = 0;
					$scope.pincodeArray = [];
					$scope.pincodeArray.length = 0;
					var sname;

					for (var addressIndex = 0; addressIndex < dataObj[userIndex].known_addresses.length; addressIndex++) {
						var current_user_address = dataObj[userIndex].known_addresses[addressIndex];
						var within_bounds = current_user_address.within_bounds;
						var map_center = new google.maps.LatLng(
							Number(current_user_address.lat),
							Number(current_user_address.lng));
						if ($rootScope.infoFrom === 'url') {
							if (within_bounds) {
								$scope.addressArray.push({
									address_type: current_user_address.address_type + " - " + current_user_address.address_humanized
								});
								$scope.pincodeArray.push({
									pincode: current_user_address.pincode
								});
								sname = dataObj[userIndex].first_name + " " + dataObj[userIndex].last_name;
								createMarker(
									map_center,
									sname + " - " + current_user_address.address_type,
									"suggestion");

							}
						} else if ($rootScope.infoFrom === 'file') {
							for (var circleIndex = 0; circleIndex < circles.length; circleIndex++) {


								var bounds = circles[circleIndex].getBounds();
								var map_center = new google.maps.LatLng(
									Number(current_user_address.lat),
									Number(current_user_address.lng));
								if (bounds.contains(map_center)) {
									$scope.addressArray.push({
										address_type: current_user_address.address_type + " - " + current_user_address.address_humanized
									});
									$scope.pincodeArray.push({
										pincode: current_user_address.pincode
									});

									sname = dataObj[userIndex].first_name + " " + dataObj[userIndex].last_name;
									createMarker(
										map_center,
										sname + " - " + current_user_address.address_type,
										"suggestion");
								}
							}


						}

					}

					if ($scope.addressArray.length > 0) {
						remove_duplicates($scope.addressArray)
						$scope.suggestionList
							.push({
								name: sname,
								emailID: dataObj[userIndex].email,
								id: dataObj[userIndex].id,
								pincodes: $scope.pincodeArray,
								addresses: $scope.addressArray,
								rowspan: $scope.addressArray.length
							});

					}

				}
				if ($scope.suggestionList.length <= 0) {
					$scope.errorMsg = "No clients found. Please try selecting a different route or increase the search radius."
				}
			}


			function findStations(routeIndex) {
				$http
					.get(
						$scope.BASEURL + '/assets/stations.kml')
					.then(
						function(
							response) {
							var tempRouteData = $scope.routeCallbackData.routes[routeIndex].overview_path;
							var stations = x2js
								.xml_str2json(response.data);
							var StationObj = stations.kml.Document.Placemark
							var stations = [];

							for (var index = 0; index < StationObj.length; index++) {
								var Sname = StationObj[index].name;
								var temp1 = StationObj[index].Point.coordinates;
								var temp2 = temp1
									.split(",");
								temp2[0] = temp2[0]
									.replace(
										"-.",
										"-0.");
								temp2[1] = temp2[1]
									.replace(
										"-.",
										"-0.");

								var map_center = new google.maps.LatLng(
									Number(temp2[1]),
									Number(temp2[0]));
								for (var j = 0; j < tempRouteData.length; j++) {
									var point_center = new google.maps.LatLng(
										tempRouteData[j]
										.lat(),
										tempRouteData[j]
										.lng());
									var dist = google.maps.geometry.spherical
										.computeDistanceBetween(
											map_center,
											point_center);

									dist = Number(dist)
									if (dist < 150) {
										stations
											.push({
												stationName: Sname,
												stationLat: temp2[1],
												stationLng: temp2[0]
											});
										createMarker(
											map_center,
											Sname,
											"station");
										break;
									}
								}
							}
							$scope.stationData = stations;

						});
			}



			$scope.sendEndLocations = function(routeIndex) {
				if (_.isUndefined(routeIndex)) {
					routeIndex = -1;
				}
				if (_.isUndefined($scope.origin_address) || _.isNull($scope.origin_address)) {
					return false;
				}
				$scope.tempIndex = routeIndex;
				$scope.loadingStatus = true;
				$scope.locData = [];
				removeMarkers();
				removeCircles();
				circles.length = 0;
				$scope.suggestionList.length = 0;
				$scope.suggestionList = [];
				$scope.locData.length = 0;
				createCircles(routeIndex).then(function() {
					var getData = userData
						.getUserData(cicle_data);
					getData
						.then(
							function(
								payload) {
								findClients(payload);
							},
							function(
								errorPayload) {
								$log
									.error(
										'failure loading list',
										errorPayload);
							});
					if ($scope.tMode === 'Subway' && (!_.isUndefined($scope.destination_address) || !_.isNull($scope.destination_address))) {
						findStations(routeIndex);
					}
					setMarkers();
					$scope.loadingStatus = false;




				}, function(error) {
					console.log('Error in generating circles');
				});


			}

		}
	])

.filter('htmlToPlaintext', [function() {
	return function(text) {
		return String(text).replace(/<[^>]+>/gm, '');
	};
}]);