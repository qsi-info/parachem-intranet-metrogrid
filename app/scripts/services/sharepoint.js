'use strict';

/**
 * QSI : SharePoint CrossDomain API wrapper
 * 
 * @author: Alexandre Page
 * @version 0.0.0.0
 *
 */
angular.module('AngularSharePointApp').factory('SharePoint', ['$q', function ($q) {

  /*jshint validthis:true */
  /*global $:false */
  /*jslint browser: true, plusplus: true */  
  /*jshint loopfunc: true */



  var app, host, executor, sender;


  function _sharepoint_get_request (endpoint, odata) {
    odata = typeof odata !== 'undefined' ? '&' + odata : '';
    var deferred = $q.defer();
    executor.executeAsync({
      url: app + '/_api/SP.AppContextSite(@target)' + endpoint + '?@target=\'' + host +'\'' + odata,
      method: 'GET',
      headers: {
        'accept': 'application/json;odata=verbose'
      },
      success: deferred.resolve,
      error: deferred.reject
    });
    return deferred.promise;  
  }


  function _sharepoint_post_request (endpoint, payload) {
    payload = typeof payload !== 'undefined' ? payload : {};
    var deferred = $q.defer();
    executor.executeAsync({
      url: app + '/_api/SP.AppContextSite(@target)' + endpoint + '?@target=\'' + host +'\'',
      method: 'POST',
      headers: {
        'accept' : 'application/json;odata=verbose',
        'content-type' : 'application/json;odata=verbose'       
      },
      body: JSON.stringify(payload),
      success: deferred.resolve,
      error: deferred.reject,
    });
    return deferred.promise;    
  }



  function _sharepoint_put_request (endpoint, payload) {
    payload = typeof payload !== 'undefined' ? payload : {};
    var deferred = $q.defer();
    executor.executeAsync({
      url: app + '/_api/SP.AppContextSite(@target)' + endpoint + '?@target=\'' + host +'\'',
      method: 'POST',
      headers: {
        'IF-MATCH' : '*',
        'X-HTTP-METHOD' : 'MERGE',
        'content-type' : 'application/json;odata=verbose',
      },
      body: JSON.stringify(payload),
      success: deferred.resolve,
      error: deferred.reject,         
    });
    return deferred.promise;    
  }


  function _sharepoint_delete_request (endpoint) {
    var deferred = $q.defer();
    executor.executeAsync({
      url: app + '/_api/SP.AppContextSite(@target)' + endpoint + '?@target=\'' + host +'\'',
      method: 'POST',
      headers: {
        'IF-MATCH' : '*',
        'X-HTTP-METHOD' : 'DELETE',
      },
      success: deferred.resolve,
      error: deferred.reject,         
    });
    return deferred.promise;      
  }


  function _List (listTitle) {

    listTitle = window.encodeURIComponent(listTitle).replace(/\'/g, '%27%27');

    this.info = function () {
      var deferred = $q.defer();
      _sharepoint_get_request('/web/lists/getByTitle(\'' + listTitle + '\')')
      .then(function (response) {
        deferred.resolve(JSON.parse(response.body).d);
      })
      .catch(deferred.reject);
      return deferred.promise;
    };

    this.add = function (payload) {
      var deferred = $q.defer();
      _sharepoint_get_request('/web/lists/getByTitle(\'' + listTitle + '\')', '$select=ListItemEntityTypeFullName')
      .then(function (response) {
        payload.__metadata = {
          'type': JSON.parse(response.body).d.ListItemEntityTypeFullName
        };
        _sharepoint_post_request('/web/lists/getByTitle(\'' + listTitle + '\')/items', payload)
        .then(function (response) {
          deferred.resolve(JSON.parse(response.body).d);
        })
        .catch(deferred.reject);
      })
      .catch(deferred.reject);
      return deferred.promise;
    };

    this.update = function (id, payload) {
      var deferred = $q.defer();
      _sharepoint_get_request('/web/lists/getByTitle(\'' + listTitle + '\')', '$select=ListItemEntityTypeFullName')
      .then(function (response) {
        payload.__metadata = {
          'type': JSON.parse(response.body).d.ListItemEntityTypeFullName
        };
        _sharepoint_put_request('/web/lists/getByTitle(\'' + listTitle + '\')/items(\''+ id + '\')', payload)
        .then(function (response) {
          deferred.resolve(response);
        })
        .catch(deferred.reject);
      })
      .catch(deferred.reject);
      return deferred.promise;      
    };


    this.all = function (odata) {
      var deferred = $q.defer();
      _sharepoint_get_request('/web/lists/getByTitle(\'' + listTitle + '\')/items', odata)
      .then(function (response) {
        deferred.resolve(JSON.parse(response.body).d.results);
      })
      .catch(deferred.reject);
      return deferred.promise;      
    };

    this.findOne = function (id, odata) {
      var deferred = $q.defer();
      _sharepoint_get_request('/web/lists/getByTitle(\'' + listTitle + '\')/items(\''+ id + '\')', odata)
      .then(function (response) {
        deferred.resolve(JSON.parse(response.body).d);
      })
      .catch(deferred.reject);
      return deferred.promise;        
    };


    this.find = function (where) {
      var acc;
      if (typeof where !== 'string') {
        acc = '';
        for(var i=0, len=where.length; i < len; i++) {
          acc += where[i];
          if (i < len - 1) {
            acc += '&';
          }
        }
      }

      if (typeof acc !== 'undefined') {
        where = acc;
      }

      var deferred = $q.defer();
      _sharepoint_get_request('/web/lists/getByTitle(\'' + listTitle + '\')/items', where)
      .then(function (response) {
        deferred.resolve(JSON.parse(response.body).d.results);
      })
      .catch(deferred.reject);
      return deferred.promise;
    };


    this.remove = function (id) {
      var deferred = $q.defer();
      _sharepoint_delete_request('/web/lists/getByTitle(\'' + listTitle + '\')/items(\''+ id + '\')')
      .then(function (response) {
        deferred.resolve(response);
      })
      .catch(deferred.reject);
      return deferred.promise;        
    };


    this.fields = function () {
      var deferred = $q.defer();
      _sharepoint_get_request('/web/lists/getByTitle(\'' + listTitle + '\')/fields')
      .then(function (response) {
        deferred.resolve(JSON.parse(response.body).d.results);
      })
      .catch(deferred.reject);
      return deferred.promise;          
    };

    this.count = function () {
      var deferred = $q.defer();
      _sharepoint_get_request('/web/lists/getByTitle(\'' + listTitle + '\')/ItemCount')
      .then(function (response) {
        deferred.resolve(JSON.parse(response.body).d);
      })
      .catch(deferred.reject);
      return deferred.promise;        
    };

    this.lastModification = function () {
      var deferred = $q.defer();
      _sharepoint_get_request('/web/lists/getByTitle(\'' + listTitle + '\')/LastItemModifiedDate')
      .then(function (response) {
        deferred.resolve(JSON.parse(response.body).d);
      })
      .catch(deferred.reject);
      return deferred.promise;       
    };
    
  }



  function _sharepoint_get_current_user () {
    var context, factory, appContextSite, user, deferred;
    context = new window.SP.ClientContext(app);
    factory = new window.SP.ProxyWebRequestExecutorFactory(app);
    context.set_webRequestExecutorFactory(factory);
    appContextSite = new window.SP.AppContextSite(context, host);

    user = appContextSite.get_web().get_currentUser();
    context.load(user);

    deferred = $q.defer();
    context.executeQueryAsync(function () {
      deferred.resolve(user);
    }, deferred.reject);
    return deferred.promise;
  }


  function _sharepoint_get_user_group () {
    var context, factory, appContextSite, user, deferred;
    context = new window.SP.ClientContext(app);
    factory = new window.SP.ProxyWebRequestExecutorFactory(app);
    context.set_webRequestExecutorFactory(factory);
    appContextSite = new window.SP.AppContextSite(context, host);

    user = appContextSite.get_web().get_currentUser();
    context.load(user);


    deferred = $q.defer();
    context.executeQueryAsync(function () {
      var groups = user.get_groups();
      context.load(groups);
      context.executeQueryAsync(function () {
        var groupArray = [];
        var groupEnumerator = groups.getEnumerator();
        while (groupEnumerator.moveNext()) {
          groupArray.push(groupEnumerator.get_current());
        }
        deferred.resolve(groupArray);
      });
    });

    return deferred.promise;
  }



  function _init (hostUrl, appUrl, senderId) {

    host = hostUrl;
    app  = appUrl;
    sender = senderId;


    var init = $q.defer();


    $.getScript(host + '/_layouts/15/MicrosoftAjax.js', function () {
      $.getScript(host + '/_layouts/15/sp.runtime.js', function () {
        $.getScript(host + '/_layouts/15/sp.js', function () {
          $.getScript(host + '/_layouts/15/sp.requestexecutor.js', function () {
            console.log('done');
            executor = new window.SP.RequestExecutor(app);      
            init.resolve(true);
          });
        });
      });
    });


    return init.promise;
  }



  function _OData () {

    return {

      filter: function (v1, cmp, v2) {
        return ' (' + v1 + ' ' + cmp + ' \'' + v2 + '\') ';
      },

      groupFilter: function (groups)  {
        var acc = '(';
        var EVERYONE_GROUP_ID = 4;
        // If user has no group, he is part of the everyone group
        // Unfortunately, SharePoint doesnt handle well the Everyone group.
        // This variable can be change or the next line remove is a common group is setup.
        acc += 'GroupFilter/Id eq ' + EVERYONE_GROUP_ID;
        if (groups.length > 0) {
            acc += ' or ';
        }
        for (var i = 0, len = groups.length; i < len; i++) {
          acc += 'GroupFilter/Id eq ' + groups[i].get_id();
          if (i < len - 1) { 
            acc += ' or '; 
          }
        }
        return acc + ')';    
      }
    };


  }



  return {
    API: {
      List : _List,
      _get : _sharepoint_get_request,
      _post : _sharepoint_post_request,
      _put: _sharepoint_put_request,
      _delete : _sharepoint_delete_request,
      me: _sharepoint_get_current_user,
      groups: _sharepoint_get_user_group,
    },
    OData: _OData,
    init: _init,
    resizeCWP: function (suggestHeight) {
      var width = '100%';
      var height = suggestHeight || document.body.clientHeight;
      window.parent.postMessage('<message senderId=' + sender + '>resize(' + width + ',' + height + ')</message>', '*');      
    }
  };


}]);









