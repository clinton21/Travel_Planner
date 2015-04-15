/**
 * Created by Clinton on 01-02-2015.
 */
angular.module('mapsApp', ['ui.router', 'mapApp.controllers','mapApp.services'])
    .config(['$stateProvider', '$urlRouterProvider', '$httpProvider',function ($stateProvider, $urlRouterProvider,$httpProvider) {
    	var contentType = 'application/x-www-form-urlencoded; charset=UTF-8';
    	$httpProvider.defaults.headers.common['Content-Type'] = contentType;
        $stateProvider
            .state('viewMap', {
                url: '/viewMap',
                templateUrl: 'partials/viewMap.html',
                controller: 'mapController'
            });
        $urlRouterProvider.otherwise('/viewMap');

    }]);
