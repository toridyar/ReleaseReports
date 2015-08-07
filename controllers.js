var releaseReportsControllers = angular.module('releaseReportsControllers',[]);


releaseReportsControllers.controller('searchCtrl',['$scope','$http',
  function($scope, $http){

	var auth="username:password";
    var auth64 = btoa(auth);
    $http.defaults.headers.common.Authorization = 'Basic ' + auth64;
    $http.defaults.headers.get={'Access-Control-Allow-Origin' : '*','Content-Type':'text/plain'};
    delete $http.defaults.headers.common['X-Requested-With']
    $http.get("http://url/rest/api/2/search").success(function(data){
     $scope.searchResults=data;
     });

}]);
