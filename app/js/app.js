/**
 * Created by Clinton on 01-02-2015.
 */
angular.module('mapsApp', ['ui.router', 'mapApp.controllers','mapApp.services'])
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('viewMap', {
                url: '/viewMap',
                templateUrl: 'partials/viewMap.html',
                controller: 'mapController'
            });
        $urlRouterProvider.otherwise('/viewMap');

    }]);
