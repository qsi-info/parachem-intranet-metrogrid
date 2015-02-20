'use strict';

/**
 * @ngdoc overview
 * @name AngularSharePointApp
 * @description
 * # AngularSharePointApp
 *
 * Main module of the application.
 */

 /*jshint loopfunc: true */


function parseQueryString() {
  var query = (window.location.search || '?').substr(1);
  var map = {};
  query.replace(/([^&=]+)=?([^&]*)(?:&+|$)/g, function (match, key, value) {
    (map[key] = map[key] || []).push(window.decodeURIComponent(value));
  });
  return map;
}



angular
  .module('AngularSharePointApp', [
    // 'ngResource',
    'ngRoute',
    'cfp.loadingBar',
    'ipCookie'
  ])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider

      // Home
      .when('/home', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })

      // Setup
      .when('/gateway', {
        template: '',
        controller: 'GatewayCtrl',
      })

      // Default
      .otherwise({
        redirectTo: '/gateway'
      });


  }])


  .run(['$location', '$rootScope', function ($location, $rootScope) {

    var host, app, params, sender, isWebPart = true;

    try {
      params = parseQueryString();
      host = params.SPHostUrl[0];
      app = params.SPAppWebUrl[0];
      sender = params.SenderId[0];
    } catch(e) {
      params = $location.search();
      host = params.SPHostUrl;
      app = params.SPAppWebUrl;
      sender = params.SenderId;
      isWebPart = false;
    }


    $rootScope.sp = {
      host: host,
      app: app, 
      sender: sender,
      isWebPart: isWebPart,
      _params: params,
    };

    $rootScope.isInitialize = false;


  }])


  .factory('SPMenuGridList', ['SharePoint', function (SharePoint) {
    return new SharePoint.API.List('SPMenuGridList');
  }])


  .factory('MetroTileMenu', ['SharePoint', 'SPMenuGridList', '$q', 'ipCookie', '$rootScope',  function (SharePoint, SPMenuGridList, $q, ipCookie, $rootScope) {

    var factory = {};

    // var groupCaching;

    factory.fetch = function () {
      var deferred = $q.defer();

      // Eventually check cache 

      var referenceMenu = $rootScope.sp._params.ReferenceMenu || 'Home';

      // Get currentUser groups
      SharePoint.API.groups().then(function (groups) {
        // Creates the odata filter for the groups
        var filter = '$filter=' + SharePoint.OData().groupFilter(groups) + ' and (ReferenceMenu eq \'' + referenceMenu + '\')';  
        var select = '$select=Title,Target,FontAwesomeIcon,Color,Href,NotificationList';
        var orderBy = '$orderby=Order';
        var query = [filter,select,orderBy].join('&');
        // Get the MenuGrid items related with the groups
        SPMenuGridList.find(query).then(function (items) {
          _setup_notifications(items).then(function (items) {
            deferred.resolve(items);
          });
        });
      });
      return deferred.promise;
    };


    function _setup_notifications (items) {
      var promises = [];
      items.forEach(function (item) {
        var deferred = $q.defer();
        if (item.NotificationList) {
          var list = new SharePoint.API.List(item.NotificationList);
          list.count().then(function (result) {
            if (result.ItemCount) {
              var cookieCount = ipCookie(window.encodeURIComponent(item.NotificationList)) || 0;
              if (cookieCount < result.ItemCount) {
                item.ItemCount = result.ItemCount - cookieCount;
              }
              item.ListCount = result.ItemCount;
            }
            deferred.resolve(item);
          });
        } else {
          deferred.resolve(item);
        }
        promises.push(deferred.promise);
      });
      return $q.all(promises);
    }

    return factory;

  }]);











