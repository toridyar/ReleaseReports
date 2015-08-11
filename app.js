(function(){
  var app= angular.module('releaseReports',['ngRoute','releaseReportsControllers']);

  app.config(['$routeProvider',
    function($routeProvider){
      $routeProvider.when('/invalidLinks',{
        templateUrl: 'invalidLinks.html',
        controller: 'invalidLinksCtrl',
      })
    }
  ]);

})();
