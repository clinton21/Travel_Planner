angular.module('mapApp.services', [])

.service('userData', function($http, $q) {

	this.getUserData = function(circle_data) {
		// http://awmphoenix.com/api/v1/phoenix-users/addresses?filters[firm_id]=205
		var q = $q.defer();
		$http.get("http://awmphoenix.com/api/v1/phoenix-users/addresses?"+$.param(circle_data))
		.then(function(data){
			console.log(data);
			q.resolve(data);
		},function(error){
			console.log('Error fetching user Data');
			q.reject('error');
		});
		return q.promise;
	}
	this.getEventData = function() {
		var q = $q.defer();
		$http.get('assets/mock_events.json').then(function(data) {
			q.resolve(data);
		},function(error){
			console.log('Error fetching Event Data');
		});
		return q.promise;
	}
});