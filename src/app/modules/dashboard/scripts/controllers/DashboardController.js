(function () {
	 
	'use strict';

	function DashboardController($scope, $http, growl, $timeout, $state, $interval, $log, FetchFeedService , UserService, TaskCountService, DashboardViewService, toastr){
		
		var vm = this;
		vm.activeView = DashboardViewService.getActiveView();
		vm.activeViewClass = DashboardViewService.getActiveViewClass();
		
		vm.fetchAllFeeds = function () {
        	
	        FetchFeedService.getAllFeeds(
	                {
	                user_id : UserService.getLoggedInUser().id,
	                status : 'Active'
	                }
	            )
	            .then(function(response){
	                var modifiedFeedPromise = TaskCountService.getCountForAllTaskFeed(response.data);
                    modifiedFeedPromise.then(function(feedArrayWithCount){
                    	vm.allFeeds = feedArrayWithCount;
                    });
	            }, function(response){
	                toastr.error(response.data.message, '[Error]');
	            });         
    	};

    	vm.refreshFeedCount = function(index){
    		var feed = vm.allFeeds[index];
    		var feedArr = [];
    		feedArr.push(feed);

    		var feedWithCount = TaskCountService.getCountForAllTaskFeed(feedArr);
    		feed = feedWithCount;

    	};

    	vm.changeViewType = function(index) {
    		DashboardViewService.changeViewType(index);
    		
    		vm.activeView = DashboardViewService.getActiveView();
			vm.activeViewClass = DashboardViewService.getActiveViewClass();

    	};

    	vm.deleteFeed = function (index) {
	         $log.debug('Inside vm.deleteFeed()..' + index);
	         
	         var feed = vm.allFeeds[index];
	         
	         FetchFeedService.deleteFeedByName(feed.name, UserService.getLoggedInUser().id)
	         .then(function(success){
	            vm.allFeeds.splice(index, 1);
	            toastr.info('Feed ' + feed.name + ' deleted.', '[success]');  
	         }).catch(function(err){
	            toastr.error(err.data.error_message, '[Error]');
	         });
    	};

    	vm.fetchAllFeeds();

    	$interval(vm.fetchAllFeeds, 60000);

	};


	angular.module('taskControllApp').controller('DashboardController',DashboardController);


})();