'use strict';

/**
 * @ngdoc function
 * @name AngularSharePointApp.controller:GatewayCtrl
 * @description
 * # GatewayCtrl
 * Controller of the AngularSharePointApp
 */

angular.module('AngularSharePointApp').controller('GatewayCtrl', ['SharePoint', '$rootScope', '$location', function (SharePoint, $rootScope, $location) {

	if (!$rootScope.isInitlialize) {

		SharePoint.init($rootScope.sp.host, $rootScope.sp.app, $rootScope.sp.sender).then(function () {
			$rootScope.isInitlialize = true;
			$location.path('/home');
		});

	} else {
		$location.path('/home');
	}

}]);





