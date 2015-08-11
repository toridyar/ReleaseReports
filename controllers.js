var releaseReportsControllers = angular.module('releaseReportsControllers',[]);


releaseReportsControllers.controller('invalidLinksCtrl',['$scope','$http',
  function($scope, $http){
    var path = "/release/jiradata"
    var PreReleaseDate ='';
    var ReleaseDate = new Date().yyyymmdd("/");
    $http.defaults.headers.get={'Content-Type':'application/json'};
    $http.get("http://localhost:3000/api/devopsapi.ignitionone.com/"+encodeURIComponent(path)).success(function(data){
     $scope.devReleaseResults=data;

     //hardcoding release ticket
    // $scope.devReleaseResults.ReleaseQATicket='DMSREL-1800';

     for(i=0;i<data.ReleaseActions.length;i++){
       if (data.ReleaseActions[i].ActionItem==="Complete Pre-Release")
       {
         PreReleaseDate = $scope.devReleaseResults.ReleaseActions[i].ActionCompleted.split('T')[0];
         break;
       }

       if (data.ReleaseActions[i].ActionItem !== undefined && data.ReleaseActions[i].ActionItem==="Release")
       {
         ReleaseDate = $scope.devReleaseResults.ReleaseActions[i].ActionCompleted.split('T')[0];
         break;
       }
     }
     //hardcoding PreReleaseDate
     //PreReleaseDate='2015/07/22';

     //hardcoding ReleaseDate
     //ReleaseDate='2015/08/03';


     var path = "/rest/api/2/search?jql=project in (MEDIACORE,SEARCHDEV) AND issuetype = BUG AND created >=";
     path = path + "'" + PreReleaseDate + "' AND created <= '" + ReleaseDate + "'&fields=issuekey,priority,summary,reporter,status,issuelinks";
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
