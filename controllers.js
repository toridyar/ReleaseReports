var releaseReportsControllers = angular.module('releaseReportsControllers',[]);


releaseReportsControllers.controller('searchCtrl',['$scope','$http',
  function($scope, $http){

    $http.defaults.headers.get={'Content-Type':'application/json'};
    $http.get("http://devopsapi.ignitionone.com/release/jiradata").success(function(data){
     $scope.devReleaseResults=data;
     });

    var path = "/rest/api/2/search";
    var parameters = "?jql=project in (MEDIACORE,DISPLAY,DISPLAYTWO,DISPLAYDA,PROFILE,SEARCHDEV) AND issuetype = Bug AND status != Closed AND created >= '2015/07/22' AND created <= '2015/08/03'&fields=issuekey,priority,summary,reporter,status,issuelinks";

    $http.defaults.headers.get={'Content-Type':'application/json'};
    $http.get("http://localhost:3000/jira/"+encodeURIComponent(path)+parameters).success(function(data){
     $scope.searchResults=data.issues;
     });

}]);
