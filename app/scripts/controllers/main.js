'use strict';

/**
 * @ngdoc function
 * @name AngularSharePointApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the AngularSharePointApp
 */

angular.module('AngularSharePointApp').controller('MainCtrl', ['$scope', 'MetroTileMenu', 'ipCookie', '$window', 'cfpLoadingBar', 'SharePoint', '$rootScope', function ($scope, MetroTileMenu, ipCookie, $window, cfpLoadingBar, SharePoint, $rootScope) {
	
	cfpLoadingBar.start();

	MetroTileMenu.fetch().then(function (items) {
		$scope.items = items;
		if ($rootScope.sp.isWebPart) {
			SharePoint.resizeCWP();
		}
		cfpLoadingBar.complete();
		console.log('Menu is builded');
	});

	$scope.clickTitle = function (idx) {
		var clickedItem = $scope.items[idx];

		if (clickedItem.ListCount && clickedItem.NotificationList) {
			ipCookie(clickedItem.NotificationList, clickedItem.ListCount, { expires: 365 });
		}

		switch(clickedItem.Target) {
			case '_top' : window.parent.location.href = clickedItem.Href; break;
			case '_blank' : $window.open(clickedItem.Href, '_blank'); break;
			default : window.location.href = clickedItem.Href;
		}


	};

}]);




