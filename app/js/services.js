angular.module('mapApp.services',[])

.service('userData',function($http){

this.getUserData = function(){
	return $http.get('assets/client.json');
	}
});