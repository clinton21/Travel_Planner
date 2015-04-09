/**
 * Created by Clinton on 01-02-2015.
 */
angular
	.module('mapApp.controllers', ['cb.x2js', 'ui.utils', 'ui.bootstrap', 'ui.bootstrap-slider'])

.controller(
	'mapController', [
		'$scope',
		'$http',
		'$stateParams',
		'x2js',
		'userData',
		function($scope, $http, $stateParams, x2js, userData) {

			var LatLong = new google.maps.LatLng(51.5072,
				0.1275);
			// $scope.geocoder = new google.maps.Geocoder();
			$scope.markers = [];
			$scope.colors = ['Red', 'Orange', 'Yellow',
				'Green', 'Blue', 'Indigo', 'Violet'
			];
			$scope.routesList = [];
			$scope.routeCallbackData;
			$scope.polyLineData = [];
			$scope.stationLocation = [];
			$scope.stationData = [];
			$scope.suggestionList = [];
			$scope.polyLine = [];
			$scope.circles = [];
			$scope.srcDestMarkers = [];
			$scope.tMode;
			$scope.loadingStatus = false;
			$scope.searchRadius = 2;
			$scope.tempIndex;
			$scope.sliderDate;

			$scope.init = function() {
				var mapOptions = {
					zoom: 10,
					center: LatLong,
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					styles: [{"featureType":"water","elementType":"all","stylers":[{"hue":"#7fc8ed"},{"saturation":55},{"lightness":-6},{"visibility":"on"}]},{"featureType":"water","elementType":"labels","stylers":[{"hue":"#7fc8ed"},{"saturation":55},{"lightness":-6},{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"hue":"#83cead"},{"saturation":1},{"lightness":-15},{"visibility":"on"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"hue":"#f3f4f4"},{"saturation":-84},{"lightness":59},{"visibility":"on"}]},{"featureType":"landscape","elementType":"labels","stylers":[{"hue":"#ffffff"},{"saturation":-100},{"lightness":100},{"visibility":"off"}]},{"featureType":"road","elementType":"geometry","stylers":[{"hue":"#ffffff"},{"saturation":-100},{"lightness":100},{"visibility":"on"}]},{"featureType":"road","elementType":"labels","stylers":[{"hue":"#bbbbbb"},{"saturation":-100},{"lightness":26},{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"hue":"#ffcc00"},{"saturation":100},{"lightness":-35},{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"hue":"#ffcc00"},{"saturation":100},{"lightness":-22},{"visibility":"on"}]},{"featureType":"poi.school","elementType":"all","stylers":[{"hue":"#d7e4e4"},{"saturation":-60},{"lightness":23},{"visibility":"on"}]}]

				};
				$scope.sliderDate = moment().add(0, 'd').format("DD/MM/YYYY");
				$scope.map = new google.maps.Map(document
					.getElementById('map-canvas'),
					mapOptions);
				var eventControlDiv = document.createElement('div');
				var eventControl = new CenterControl(eventControlDiv);
				eventControlDiv.index = 1;
				$scope.map.controls[google.maps.ControlPosition.TOP_CENTER].push(eventControlDiv);
			};

			$scope.updateDate = function() {
				$scope.sliderDate = moment().add($scope.searchDate, 'd').format("DD/MM/YYYY");
				console.log($scope.sliderDate);
			}
			$scope.formaterFn = function(value) {
				return moment().add($scope.searchDate, 'd').format("DD/MM/YYYY");
			};
			// $scope.geocodeAddress = function () {
			// var origin_address = $scope.origin_address;
			// var destination_address =
			// $scope.destination_address;
			// $scope.geocoder.geocode({ 'address':
			// origin_address}, getGeoCode);
			// $scope.geocoder.geocode({ 'address':
			// destination_address}, getGeoCode);
			// calcRoute();
			// };

			// function outputDistance(response, status) {
			// if (status !=
			// google.maps.DistanceMatrixStatus.OK) {
			// alert('Error was: ' + status);
			// } else {
			// var origins = response.originAddresses;
			// var destinations = response.destinationAddresses;
			// var outputDiv =
			// document.getElementById('outputDiv');
			// // outputDiv.innerHTML = '';
			// // deleteOverlays();
			//
			// for (var i = 0; i < origins.length; i++) {
			// var results = response.rows[i].elements;
			// for (var j = 0; j < results.length; j++) {
			// outputDiv.innerHTML = origins[i] + ' to ' +
			// destinations[j]
			// + ': ' + results[j].distance.text + ' in '
			// + results[j].duration.text + '<br>';
			//
			// // $scope.distance = origins[i] + ' to ' +
			// destinations[j]
			// // + ': ' + results[j].distance.text + ' in '
			// // + results[j].duration.text + '<br>';
			// }
			// }
			// }
			// };
			function CenterControl(controlDiv) {

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
				label.id="eventLabel";
				label.name="eventLabel";
				label.innerHTML = 'Show Events';

				controlUI.appendChild(checkbox);
				controlUI.appendChild(label);

				google.maps.event.addDomListener(checkbox, 'change', function() {
					if ($('#eventCheckBox').prop("checked")) {
						console.log('Is Checked');
						document.getElementById('eventLabel').innerHTML = 'Showing Your Events';
					} else {
						console.log('Is Unchecked');
						document.getElementById('eventLabel').innerHTML = 'Show Events';
					}
				});

			}

			function createMarker(map_center, map_address,
				marker_type) {
				var infowindow = new google.maps.InfoWindow();
				var img;
				if (marker_type === "src_dest") {
					img = {
						url: 'assets/src_dest_marker.png',
						origin: new google.maps.Point(0, 0),
					};

				} else if (marker_type === "station") {
					img = {
						url: 'assets/station_marker.png',
						origin: new google.maps.Point(0, 0),
					};
				} else if (marker_type === "suggestion") {
					img = {
						url: 'assets/people_marker.png',
						origin: new google.maps.Point(0, 0),
					};
				}
				var marker = new google.maps.Marker({
					map: $scope.map,
					position: map_center,
					// animation: google.maps.Animation.BOUNCE,
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
					$scope.srcDestMarkers.push(marker);
				} else {
					$scope.markers.push(marker);
				}

			};

			function setMapCenter(center_point) {
				$scope.map.setCenter(center_point);
			};

			// function setOriginDestination() {
			// var leng = $scope.markers.length;
			// var origin = $scope.markers[leng - 2].title;
			// var destination = $scope.markers[leng - 1].title;
			// var service = new
			// google.maps.DistanceMatrixService();
			// service.getDistanceMatrix(
			// {
			// origins: [origin],
			// destinations: [destination],
			// travelMode: google.maps.TravelMode.DRIVING,
			// unitSystem: google.maps.UnitSystem.METRIC,
			// avoidHighways: false,
			// avoidTolls: false
			// }, outputDistance);
			// var bounds = new google.maps.LatLngBounds(
			// $scope.markers[leng - 2].getPosition(),
			// $scope.markers[leng - 1].getPosition()
			// );
			// $scope.map.fitBounds(bounds);
			// };

			// function getGeoCode(results, status) {
			// if (status == google.maps.GeocoderStatus.OK) {
			// console.log(results[0].geometry.location);
			// setMapCenter(results[0].geometry.location)
			// marker =
			// createMarker(results[0].geometry.location,
			// results[0].formatted_address);
			// $scope.markers.push(marker);
			// for (var i = 0; i < $scope.markers.length; i++) {
			// $scope.markers[i].setMap($scope.map);
			// console.log($scope.markers[i].title + " " +
			// $scope.markers[i].getPosition());
			// }
			// if ($scope.markers.length > 1) {
			// setOriginDestination();
			// }
			// } else {
			// alert('Geocode was not successful for the
			// following reason: ' + status);
			// }
			//
			// };

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
				// searchBox.setBounds()
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
				$scope.loadingStatus = true;
				removeMarkers();
				removePolyLines();
				removeCircles();
				for (var i = 0; i < $scope.srcDestMarkers.length; i++) {
					$scope.srcDestMarkers[i].setMap(null);
				}
				$scope.srcDestMarkers.length = 0;
				$scope.routesList.length = 0;
				$scope.suggestionList.length = 0;
				var directionsService = new google.maps.DirectionsService();
				var directionsDisplay = new google.maps.DirectionsRenderer();
				$scope.origin_address = document
					.getElementById('origin-input').value;
				$scope.destination_address = document
					.getElementById('destination-input').value;
				var start = $scope.origin_address;
				var end = $scope.destination_address;
				var request;
				$scope.tMode = $scope.travelMode;
				if ($scope.tMode === 'subway') {
					request = {
						origin: start,
						destination: end,
						optimizeWaypoints: true,
						// travelMode:
						// google.maps.TravelMode.DRIVING,
						travelMode: google.maps.TravelMode.TRANSIT,
						provideRouteAlternatives: true,
						transitOptions: {
							modes: [google.maps.TransitMode.SUBWAY],
						},
					};
				} else if ($scope.tMode === 'car') {
					request = {
						origin: start,
						destination: end,
						optimizeWaypoints: true,
						travelMode: google.maps.TravelMode.DRIVING,
						provideRouteAlternatives: true,
					};
				}

				directionsService.route(request, plotRoute);
				directionsDisplay.setMap($scope.map);

			};

			function plotRoute(response, status) {
				if (status == google.maps.DirectionsStatus.OK) {

					var leng = response.routes[0].legs[0].steps.length;
					createMarker(
						response.routes[0].legs[0].steps[0].start_point,
						$scope.origin_address, "src_dest");
					createMarker(
						response.routes[0].legs[0].steps[leng - 1].end_point,
						$scope.destination_address,
						"src_dest");
					$scope.routeCallbackData = response;
					// console.log(response);
					for (var i = 0, len = response.routes.length; i < len; i++) {
						var currentRoute = response.routes[i];
						var steps = currentRoute.legs[0].steps;
						// console.log(currentRoute.overview_path);
						$scope.polyLineData[i] = currentRoute.overview_path;
						createPolyRoute(steps, i, currentRoute);
						// new google.maps.DirectionsRenderer({
						// map: $scope.map,
						// directions: response,
						// routeIndex: i,
						// suppressMarkers: true,
						// optimizeWaypoints: true,
						// polylineOptions: {
						// strokeColor: $scope.colors[i],
						// strokeOpacity: 0.6,
						// strokeWeight: 5
						// }
						// });

					}
					var bounds = new google.maps.LatLngBounds();
					bounds
						.extend(response.routes[0].legs[0].steps[0].start_point);
					bounds
						.extend(response.routes[0].legs[0].steps[leng - 1].end_point);

					$scope.map.fitBounds(bounds);

				}

			};

			function setMarkers() {
				for (var i = 0; i < $scope.markers.length; i++) {
					$scope.markers[i].setMap($scope.map);
				}
			};

			function removeMarkers() {
				for (var i = 0; i < $scope.markers.length; i++) {
					$scope.markers[i].setMap(null);
				}
				$scope.markers.length = 0;
			};

			// function getRouteBox(routeIndex){
			// $scope.stationLocation.length=0;
			// var routeBoxer = new RouteBoxer();
			// var distance = .7; // km
			// var service = new
			// google.maps.places.PlacesService($scope.map);
			// var path =
			// $scope.routeCallbackData.routes[routeIndex].overview_path;
			// var boxes = routeBoxer.box(path, distance);
			// for (var i = 0; i < boxes.length; i++) {
			// var box_bounds = boxes[i];
			// // console.log(box_bounds);
			// var rectangle = new google.maps.Rectangle({
			// bounds: box_bounds,
			// fillOpacity: 0,
			// strokeOpacity: 1.0,
			// strokeColor: '#000000',
			// strokeWeight: 1,
			// map: $scope.map
			// });
			// var search_request = {
			// bounds:box_bounds,
			// types: ['subway_station','train_station'],
			// };
			// service.nearbySearch(search_request,
			// searchStationCallback);

			// }
			// stationFilter(routeIndex);
			// };
			// function searchStationCallback(results, status){
			// if (status ==
			// google.maps.places.PlacesServiceStatus.OK) {
			// for (var i = 0; i < results.length; i++) {
			// $scope.stationLocation.push({stationCoods:results[i].geometry.location,stationName:results[i].name});
			// //var place = results[i];
			// //console.log(results);
			// //var
			// marker=createMarker(results[i].geometry.location,results[i].name);
			// //$scope.markers.push(marker);
			// //marker.setMap($scope.map);
			// }
			// }
			// };
			// function stationFilter(routeIndex){
			// console.log("overview_path
			// "+$scope.routeCallbackData.routes[routeIndex].overview_path.length);
			// console.log("stations
			// "+$scope.stationLocation.length);
			// var
			// routePoints=$scope.routeCallbackData.routes[routeIndex].overview_path;
			// var sLocs=$scope.stationLocation;

			// for(var
			// rPointIndex=0;rPointIndex<routePoints.length;rPointIndex++){
			// var p1=routePoints[rPointIndex];

			// for(var
			// sLocIndex=0;sLocIndex<sLocs.length;sLocIndex++){
			// console.log("Inside 2nd for loop");
			// var p2=new
			// google.maps.LatLng(sLocs[sLocIndex].stationLocation);
			// var
			// dist=google.maps.geometry.spherical.computeDistanceBetween(p1,p2);
			// // if(dist < 1.5){
			// // console.log("on Path");
			// // }
			// }
			// }

			// };

			function createPolyRoute(steps, i, currentRoute) {
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
					var route_info = [];
					route_info.length = 0;
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
					$scope.polyLine.push(newPoly);
					// console.log(steps.length);
					// console.log('Route'+(Number(i)+1));
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
							// console.log("Station
							// Stop:"+stop_name+"
							// Line:"+line_name+" Icon:"+icon);
							route_info
								.push({
									travelInfo: "Take " + vech + " to " + stop_name + " along " + line_name,
									vechIcon: "assets/_subway.png",
									end_location: steps[j].end_location
								});
						} else if (steps[j].travel_mode === "DRIVING") {
							route_info
								.push({
									travelInfo: steps[j].instructions,
									vechIcon: "assets/_car.png",
									// end_location:steps[j].end_location
								});

						} else {
							route_info
								.push({
									travelInfo: steps[j].instructions,
									vechIcon: "assets/_walking.png",
									// end_location:steps[j].end_location
								});

						}
					}
					$scope.routesList
						.push({
							distanceOfRoute: currentRoute.legs[0].distance.text,
							timeOfRoute: currentRoute.legs[0].duration.text,
							routeIndexValue: i,
							routeColor: $scope.colors[i],
							routeInfo: route_info,
							pOverview: currentRoute.overview_polyline
						});

					// console.log(currentRoute.legs[0].distance.text
					// + " " +
					// currentRoute.legs[0].duration.text);

					// console.log($scope.routesList);
					$scope.loadingStatus = false;
					$scope.$apply();
				}

			};
			removeCircles = function() {
				if ($scope.circles.length > 0) {
					for (var i = 0; i < $scope.circles.length; i++) {
						$scope.circles[i].setMap(null);
					}
				}
			};

			$scope.sendEndLocations = function(routeIndex) {
				$scope.tempIndex = routeIndex;
				$scope.loadingStatus = true;
				var locData = [];
				removeMarkers();
				removeCircles();
				$scope.circles.length = 0;
				$scope.suggestionList.length = 0;
				$scope.suggestionList = [];
				locData.length = 0;

				if ($scope.tMode === 'subway') {
					for (var counter = 0; counter < $scope.routesList[routeIndex].routeInfo.length; counter++) {
						// console.log($scope.routesList[routeIndex].routeInfo[counter].end_location);
						locData[counter] = $scope.routesList[routeIndex].routeInfo[counter].end_location;
						if (typeof locData[counter] !== 'undefined') {
							var c = new google.maps.Circle({
								strokeColor: '#000000',
								strokeOpacity: 0.8,
								strokeWeight: 2,
								fillColor: "#EBB11A",
								fillOpacity: 0.20,
								map: $scope.map,
								center: locData[counter],
								radius: ($scope.searchRadius * 1000)
							});
							$scope.circles.push(c);
						}
					}
				} else if ($scope.tMode === 'car') {
					var c = new google.maps.Circle({
						strokeColor: '#000000',
						strokeOpacity: 0.8,
						strokeWeight: 2,
						fillColor: "#EBB11A",
						fillOpacity: 0.20,
						map: $scope.map,
						center: $scope.routeCallbackData.routes[0].legs[0].end_location,
						radius: ($scope.searchRadius * 1000)
					});
					$scope.circles.push(c);
					var tempDist = 0;


					for (var i = 0; i < $scope.routeCallbackData.routes[routeIndex].legs[0].steps.length; i++) {
						// console.log($scope.routeCallbackData.routes[routeIndex].legs[0].steps[i].distance.value);
						// tempDist+=$scope.routeCallbackData.routes[routeIndex].legs[0].steps[i].distance.value;
						if (tempDist < 2000) {
							tempDist += $scope.routeCallbackData.routes[routeIndex].legs[0].steps[i].distance.value;
						} else if (tempDist > 2000) {
							var c = new google.maps.Circle({
								strokeColor: '#000000',
								strokeOpacity: 0.8,
								strokeWeight: 2,
								fillColor: "#EBB11A",
								fillOpacity: 0.20,
								map: $scope.map,
								center: $scope.routeCallbackData.routes[routeIndex].legs[0].steps[i - 1].end_location,
								radius: ($scope.searchRadius * 1000)
							});
							$scope.circles.push(c);
							tempDist = $scope.routeCallbackData.routes[routeIndex].legs[0].steps[i].distance.value;
						}
					}
					// console.log(tempDist);

				}

				$http({
						url: '',
						method: "POST",
						data: angular.toJson(locData),
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
						}
					})
					.success(
						function(data) {
							// alert("Data Sent");
							var getData = userData
								.getUserData();
							getData
								.then(
									function(
										payload) {
										// console.log(payload.data);
										$scope.suggestionList.length = 0;
										var dataObj = payload.data;
										for (var i = 0; i < $scope.circles.length; i++) {
											var bounds = $scope.circles[i]
												.getBounds();
											for (var j = 0; j < dataObj.length; j++) {
												var map_center = new google.maps.LatLng(
													Number(dataObj[j].lat),
													Number(dataObj[j].lng));
												if (bounds
													.contains(map_center)) {
													var sname = dataObj[j].first_name + " " + dataObj[j].last_name;
													//here is where u get clien details from the JSON file
													$scope.suggestionList
														.push({
															name: sname,
															emailID: dataObj[j].email,
															id: dataObj[j].id,
															postCode: dataObj[j].Postcode
														});
													createMarker(
														map_center,
														sname,
														"suggestion");
												}
											}

										}

									},
									function(
										errorPayload) {
										$log
											.error(
												'failure loading list',
												errorPayload);
									});
							if ($scope.tMode === 'subway') {
								// getRouteBox(routeIndex);
								$http
									.get(
										'assets/stations.kml')
									.then(
										function(
											response) {
											var tempRouteData = $scope.routeCallbackData.routes[routeIndex].overview_path;
											var stations = x2js
												.xml_str2json(response.data);
											var StationObj = stations.kml.Document.Placemark
											var stations = [];
											// console.log(tempRouteData);

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
														// console.log(dist);
													if (dist < 150) {
														// console.log(dist);
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

						});
				setMarkers();
				$scope.loadingStatus = false;
			};

		}
	]).filter('htmlToPlaintext', [function() {
	return function(text) {
		return String(text).replace(/<[^>]+>/gm, '');
	};
}]);