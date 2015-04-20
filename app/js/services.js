angular.module('mapApp.services', [])

.service('userData', function($rootScope,$http, $q) {

	this.getUserData = function(circle_data) {
		// http://awmphoenix.com/api/v1/phoenix-users/addresses?filters[firm_id]=205
		var q = $q.defer();
		//Uncomment this to use the live url
		if($rootScope.infoFrom ==='url'){
		$http.get("http://awmphoenix.com/api/v1/phoenix-users/addresses?" + $.param(circle_data))
			.then(function(data) {

				q.resolve(data);
		
			}, function(error) {
				console.log('Error fetching user Data');
				q.reject('error');
			});
		}else if($rootScope.infoFrom ==='file'){
			$http.get("assets/client.json")
			.then(function(data) {
				q.resolve(data);
			}, function(error) {
				console.log('Error fetching user Data');
				q.reject('error');
			});
		}

		return q.promise;
	}
	this.getEventData = function() {
		var q = $q.defer();
		$http.get('assets/mock_events.json').then(function(data) {
			q.resolve(data);
		}, function(error) {
			console.log('Error fetching Event Data');
			q.reject('error');
		});
		return q.promise;
	}

	this.getHumaizedAddress=function(lat,lng){
		var q = $q.defer();
		$http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng).then(function(data) {
			var temp = data.data.results[0];
			address = temp.formatted_address;
			pin = temp.address_components[temp.address_components.length-1].long_name;
			var returnData={
				address:address,
				pin:pin
			}
			q.resolve(returnData);
		}, function(error) {
			console.log('Error fetching Location Data');
			q.reject('error');
		});
		return q.promise;
	}
});