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
    if($scope.errors.length<=0){
       path = "/rest/api/2/search?jql=project in ("+ReleaseIncludedProjects +") AND issuetype = BUG AND created >=";
       path = path + "'" + ReleaseDateCutoff.yyyymmdd('/') + "' AND created <= '" + ReleaseDateRelease.yyyymmdd('/') + "'&maxResults=1000&fields=issuekey,priority,summary,reporter,status,issuelinks";
       $http.defaults.headers.get={'Content-Type':'application/json'};
       $http.get("http://localhost:3000/jira/"+encodeURIComponent(path)).success(function(data){
         $scope.searchResults=data.issues;
        });
      }
    });

     $scope.isLinkKeyPlusLinkTypeInvalid=isLinkKeyPlusLinkTypeInvalid;

}]);

//qaownerstatus
releaseReportsControllers.controller('qaownerstatusCtrl',['$scope','$http',
  function($scope, $http){

    $scope.getSprints = function(id){
      getSprints($scope,$http,id);
    }
    $scope.getEpics = function(id){
      getEpics($scope,$http,id);
    }
}]);

// checking if Bug is linked incorrectly or linked to a different ticket
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

function findAndReplace(array, key, replace){
  for(var i=0;i<array.length;i++){
    if(array[i].key == key){
      array[i] = replace;
      return array;
      break;
    }
  }
  array.push(replace);
  return array;
}

//formatting dates
Date.prototype.yyyymmdd = function(delimiter) {
   var yyyy = this.getFullYear().toString();
   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = this.getDate().toString();
   return yyyy + delimiter + (mm[1]?mm:"0"+mm[0]) + delimiter +(dd[1]?dd:"0"+dd[0]); // padding
  };

//QAOwnerstatus - get sprints for dropdown
var getSprints = function($scope, $http, id){
  var agileBoardID =id;
  var path = '';
  $('.page-header>h1>span').html($('#pointSolution-'+id).html()+":");
  $('.page-header>h1>small').html("Sprint");
  path = "/rest/agile/1.0/board/"+agileBoardID+"/sprint?state=Active";
  $http.defaults.headers.get={'Content-Type':'application/json'};
  $http.get("http://localhost:3000/jira/"+encodeURIComponent(path)).success(function(data){
    $scope.sprints = data.values;
    $('#sprintDropdown').removeClass('hide');
  });
}
//QAOwnerstatus - get Epics for table
var getEpics = function($scope, $http, id){
    var sprintID = id;
    var path1 = '';
    var path2 = '';
    var epicLink = {};
    var epicLinks = '';
    var epicArray = [];
    $('.page-header>h1>small').html($('#sprint-'+id).html());
    path = "/rest/api/2/search?jql=sprint ="+sprintID+" AND issuetype in standardissuetypes()";
    path = path + "&maxResults=1000&fields=customfield_12443";
    $http.get("http://localhost:3000/jira/"+encodeURIComponent(path)).success(function(data){
      for(i=0;i<data.issues.length;i++){
        if(data.issues[i].fields.customfield_12443!==undefined && data.issues[i].fields.customfield_12443!==null)
        {
        epicLink[data.issues[i].fields.customfield_12443]=data.issues[i].fields.customfield_12443;
        }
      }
      $.each(epicLink, function(key, value) {
      epicArray.push( value);
    })
    epicLinks =  epicArray.toString();
    //get epic details from epicLinks.
     //customfield_12444 = Epic Name, customfield_11441 = QA Owner Object
    path1 = "/rest/api/2/search?jql=issue in ("+epicLinks+")&maxResults=1000&fields=customfield_12444,customfield_11441";
      $http.get("http://localhost:3000/jira/"+encodeURIComponent(path1)).success(function(data){
        $scope.epicDetails = data.issues;
          });
    //get stories from epicLinks
    path2 = "/rest/api/2/search?jql='Epic Link' in ("+epicLinks+")&maxResults=1000";   // max results is only 1000, need to add pagination
      $http.get("http://localhost:3000/jira/"+encodeURIComponent(path2)).success(function(data){
        debugger
        var resultsArray = [];
        var stories = data.issues;
        for(var i=0; i<stories.length;i++){
          var epicObject = {};
          epicObject.stories =[];
          epicObject.storyStatuses=[];
          var result = $.grep(resultsArray,  function(e){
              var temp = stories[i].fields.customfield_12443;
             return e.key == temp });
          if(result.length>0){
            epicObject = result[0];
          }else{
            var r = $.grep(  $scope.epicDetails, function(e){
                var temp = stories[i].fields.customfield_12443;
               return e.key == temp });
            if(r.length>0){
              epicObject.key = r[0].key;
              epicObject.name = r[0].fields.customfield_12444;
              if(r[0].fields.customfield_11441 === undefined || r[0].fields.customfield_11441 === null ){
                epicObject.qaowner = "";
              }else{
                epicObject.qaowner = r[0].fields.customfield_11441.displayName;
              }
            }
          }
          if(epicObject.key!==undefined){
            epicObject.stories.push(stories[i]);
            var storyStatus ={};
            storyStatus.name= stories[i].fields.status.name;
            storyStatus.key= stories[i].fields.status.name
            storyStatus.tickets=1;
            r = $.grep( epicObject.storyStatuses, function(e){
                var temp = stories[i].fields.status.name;
               return e.name == temp });
            if(r.length>0){
              storyStatus = r[0];
              storyStatus.tickets=storyStatus.tickets+1;
            }
            storyStatus.percentage=storyStatus.tickets/epicObject.stories.length;

            epicObject.storyStatuses = findAndReplace(epicObject.storyStatuses,storyStatus.name,storyStatus);



            resultsArray = findAndReplace(resultsArray,epicObject.key,epicObject);
          }
        }
        $scope.completeResults = resultsArray;
        debugger
  });
    });

}
