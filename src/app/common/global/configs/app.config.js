var app = angular.module('taskControllApp');

app.config(['$httpProvider',function ($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
 }])
 .config(['$provide', function($provide) {
    $provide.decorator('$log', ['$delegate',
      function($delegate) {
        
        ['log', 'warn', 'info', 'error', 'debug'].forEach(function(o) {
          var originalFn = $delegate[o];
          $delegate[o] = function () {
                  var args = Array.prototype.slice.call(arguments);
                  args[0] = [new Date().toString(), ': ', args[0]].join('');
              
                  originalFn.apply(null, args)
              };
        });

        return $delegate;
      }]);
  }])
 .config(['$logProvider', function($logProvider) {
    $logProvider.debugEnabled(true);
  }])
.config(
  function($stateProvider, $urlRouterProvider, growlProvider, USER_ROLES) {

     /**
     * Helper auth functions
     */
    var skipIfLoggedIn = ['$q', '$auth', '$state', '$log', '$timeout' , function($q, $auth, $state, $log, $timeout) {
      var deferred = $q.defer();
      if ($auth.isAuthenticated()) {
        $timeout(function () {
          $state.go('root.home.dashboard');
        });
          deferred.reject();
      } else {
          deferred.resolve();
      }
      return deferred.promise;
    }];

    var loginRequired = ['$q', '$state', '$auth' , function($q, $state, $auth) {
      var deferred = $q.defer();
      if ($auth.isAuthenticated()) {
          deferred.resolve();
      } else {
        $timeout(function(){
          $state.go('root.login');;
        });
        deferred.reject();
      }
      return deferred.promise;
    }];

    $urlRouterProvider.otherwise('/todos/login');
    $stateProvider.
    state('root', {
      url: '/todos',
      abstract:true,
      views: {
        'header' :{
            templateUrl: 'modules/root/views/partials/header.html',
            controller: 'HeaderController',
            controllerAs: 'header'
        },
        'content': {
            template: '<div ui-view="content"> </div>'
        },
        'footer' :{
            templateUrl: 'modules/root/views/partials/footer.html'
        },
      },
      onEnter: function(){
        console.log('in /root');
      }
    }).
    state('root.login', {
      url: '/login',
      views: {
        'content' : {
          templateUrl: 'modules/login/views/partials/login.html',
          controller: 'LogInController',
          controllerAs: 'login'
        }
      },
      resolve: {
        skipIfLoggedIn: skipIfLoggedIn
      }
    }).
    state('root.home',{
      url: '/home',
      abstract:true,
      views: {
          'content' : {
            templateUrl: 'modules/home/views/partials/home.html',
            controller: 'HomeController',
            controllerAs: 'home'
          }
      },
      resolve: {
        loginRequired: loginRequired
      },
      onEnter: function() {
        console.log('in /home');
      }
    }).
    state('root.home.dashboard',{
      url: '/dashboard',
      views: {
          'detailContent' : {
            templateUrl: 'modules/dashboard/views/partials/dashboard.html',
            controller: 'DashboardController',
            controllerAs: 'dashboard'
          }
      },
      onEnter: function() {
        console.log('in /dashboard');
      }
    }).
    state('root.home.projectEntry',{
      url: '/projectEntry',
      views: {
          'detailContent' : {
            templateUrl: 'modules/project/views/partials/projectEntry.html',
            controller: 'ProjectController',
            controllerAs: 'projectCtrl'
          }
      },
      onEnter: function() {
        console.log('in /projectEntry');
      }
    }).
    state('root.home.taskEntry',{
      url: '/taskEntry',
      views: {
          'detailContent' : {
            templateUrl: 'modules/task/views/partials/taskEntry.html',
            controller: 'TaskController',
            controllerAs: 'taskCtrl'
          }
      },
      onEnter: function() {
        console.log('in /taskEntry');
      }
    }).
    state('root.home.viewTask',{
      url: '/viewTask/:feedId',
      views: {
          'detailContent' : {
            templateUrl: 'modules/task/views/partials/taskView.html',
            controller: 'TaskViewController',
            controllerAs: 'taskViewCtrl'
          }
      },
      resolve: {

        feedInfo : ['$stateParams', 'FetchFeedService', 'UserService', function($stateParams,FetchFeedService,UserService){
            return FetchFeedService.getFeed($stateParams.feedId,UserService.getLoggedInUser().id);
        }]
      },
      onEnter: function() {
        console.log('in /viewTask');
      }
    }).
    state('root.home.viewDefaultProject',{
      url: '/viewDefaultProject/:feedId',
      views: {
          'detailContent' : {
            templateUrl: 'modules/task/views/partials/taskView.html',
            controller: 'TaskViewController',
            controllerAs: 'taskViewCtrl'
          }
      },
      resolve: {

        feedInfo : ['$stateParams', 'FetchFeedService', 'UserService', function($stateParams,FetchFeedService,UserService){
            return FetchFeedService.getGlobalFeed({feed_id : $stateParams.feedId});
        }]
      },
      onEnter: function() {
        console.log('in /viewDefaultProject');
      }
    }).
    state('root.home.viewSearchedTask', {
      url : '/viewSearchedTask/:searchedText',
      views: {
          'detailContent' : {
            templateUrl: 'modules/task/views/partials/tasksearchView.html',
            controller: 'TaskSearchController',
            controllerAs: 'taskSearchCtrl'
          }
      },
      onEnter: function() {
        console.log('in /viewSearchedTask');
      }
    }).
    state('root.home.viewJiraTask', {
      url : '/viewJiraTask',
      views: {
          'detailContent' : {
            templateUrl: 'modules/jira/views/partials/jiraTaskView.html',
            controller: 'JiraSearchController',
            controllerAs: 'jiraSearchCtrl'
          }
      },
      onEnter: function() {
        console.log('in /viewJiraTask');
      }
    }).
    state('root.home.taskUpload',{
      url: '/taskUpload',
      views: {
          'detailContent' : {
            templateUrl: 'modules/task/views/partials/taskUpload.html',
            controller: 'TaskUploadController',
            controllerAs: 'taskUpldCtrl'
          }
      },
      onEnter: function() {
        console.log('in /taskUpload');
      }
    });

    growlProvider.onlyUniqueMessages(false);
    growlProvider.globalInlineMessages(true);

  });

//@todo : need to explore event broadcast

app.run(['$rootScope', '$state', '$auth', function($rootScope, $state, $auth){
   $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {

    /*if(angular.isDefined(toState.accessRole)){
      var isAccessible = false;
      angular.forEach(toState.accessRole.role, function(value,key){
          if(value == $rootScope.userRole){
              isAccessible = true;
              return;
          }
      });
    }else {
      var isAccessible = true;
    }

    if(!isAccessible){
     $rootScope.$broadcast('unAuthorizedAccess', {})
     event.preventDefault();
    }*/

});

}]);