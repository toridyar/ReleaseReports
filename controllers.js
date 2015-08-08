var releaseReportsControllers = angular.module('releaseReportsControllers',[]);


releaseReportsControllers.controller('searchCtrl',['$scope','$http',
  function($scope, $http){
    var path = "/release/jiradata"
    $http.defaults.headers.get={'Content-Type':'application/json'};
    $http.get("http://localhost:3000/api/devopsapi.ignitionone.com/"+encodeURIComponent(path)).success(function(data){
     $scope.devReleaseResults=data;
     });

    var path = "/rest/api/2/search?jql=project in (DMSDEV) AND issuetype in subTaskIssueTypes() AND created >= '2015/07/22' AND created <= '2015/08/03'&fields=issuekey,priority,summary,reporter,status,issuelinks";

    $http.defaults.headers.get={'Content-Type':'application/json'};
    $http.get("http://localhost:3000/jira/"+encodeURIComponent(path)).success(function(data){
     $scope.searchResults=data.issues;
     });

     $scope.isLinkKeyPlusLinkTypeInvalid=isLinkKeyPlusLinkTypeInvalid;


}]);


var isLinkKeyPlusLinkTypeInvalid = function(issue,linkKey) {
  var typeName = "Found During Regression";
  for(i=0;i<issue.fields.issuelinks.length;i++){
    if(issue.fields.issuelinks[i].inwardIssue!==undefined && issue.fields.issuelinks[i].inwardIssue.key===linkKey && issue.fields.issuelinks[i].type.name===typeName)  {
      return false;
    }
    if(issue.fields.issuelinks[i].outwardIssue!==undefined && issue.fields.issuelinks[i].outwardIssue.key===linkKey && issue.fields.issuelinks[i].type.name===typeName)  {
      return false;
    }
  }
  return true;
}
