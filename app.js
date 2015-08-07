(function(){
  var app= angular.module('releaseReports',['ngRoute','releaseReportsControllers']);

  app.config(['$routeProvider',
    function($routeProvider){
      $routeProvider.when('/search',{
        templateUrl: 'search.html',
        controller: 'searchCtrl',
      })
    }
  ]);

})();
