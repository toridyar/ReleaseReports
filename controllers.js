var releaseReportsControllers = angular.module('releaseReportsControllers',[]);


releaseReportsControllers.controller('invalidLinksCtrl',['$scope','$http',
  function($scope, $http){
    var path = "/release/jiradata"
    var ReleaseDateCutoff =new Date();
    var ReleaseDateRelease = new Date();
    var ReleaseIncludedProjects = '';
    $scope.errors=[];
    $http.defaults.headers.get={'Content-Type':'application/json'};
    $http.get("http://localhost:3000/api/devopsapi.ignitionone.com/"+encodeURIComponent(path)).success(function(data){
     $scope.devReleaseResults=data;

    // defining release products
    if (data.ReleaseIncludedProjects !== undefined && data.ReleaseIncludedProjects.length > 0)
    {
      ReleaseIncludedProjects=data.ReleaseIncludedProjects.toString();
    }
    else
    {
      $scope.errors.push('Error: No Release Projects supplied');
    }

  // define dates
         if (data.ReleaseDateCutoff !== undefined)
     {
       ReleaseDateCutoff = new Date(Date.parse($scope.devReleaseResults.ReleaseDateCutoff));
     }else{
       $scope.errors.push('Error: No Release Date cutoff supplied');
     }

     if (data.ReleaseDateRelease !== undefined)
     {
       ReleaseDateRelease = new Date(Date.parse($scope.devReleaseResults.ReleaseDateRelease));
     }else{
       $scope.errors.push('Error: No Release Date supplied');
     }


    // building url
     var path = "/rest/api/2/search?jql=project in ("+ReleaseIncludedProjects +") AND issuetype = BUG AND created >=";
     path = path + "'" + ReleaseDateCutoff.yyyymmdd('/') + "' AND created <= '" + ReleaseDateRelease.yyyymmdd('/') + "'&fields=issuekey,priority,summary,reporter,status,issuelinks";
     $http.defaults.headers.get={'Content-Type':'application/json'};
     $http.get("http://localhost:3000/jira/"+encodeURIComponent(path)).success(function(data){
      $scope.searchResults=data.issues;
      });
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

Date.prototype.yyyymmdd = function(delimiter) {
   var yyyy = this.getFullYear().toString();
   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = this.getDate().toString();
   return yyyy + delimiter + (mm[1]?mm:"0"+mm[0]) + delimiter +(dd[1]?dd:"0"+dd[0]); // padding
  };
