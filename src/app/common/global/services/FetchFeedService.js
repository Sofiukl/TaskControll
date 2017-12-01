(function() {

	'use strict';

	function FetchFeedService($http, $log, $q, toastr) {
		 
		var actionHandler = {};

		actionHandler = {
			baseUrl : 'http://localhost:8081',
			feedEndPoint : '/api/feeds'
		}


		actionHandler.saveFeed = function(data){
			return $http.post(actionHandler.feedEndPoint, data);
		}

		actionHandler.getFeed = function(feedId, userId){
			var url = actionHandler.feedEndPoint + '/' + feedId;

			return $http.get(url, {
				params : {user_id : userId}
			});
		}

		actionHandler.getGlobalFeed = function(criteria){
			var url = actionHandler.feedEndPoint + '/' + criteria.feed_id;
			return $http.get(url);
		}

		actionHandler.getAllFeeds = function(criteria){
			var url = actionHandler.feedEndPoint;
			return $http.get(url, {
				params : criteria
			});
		}

		actionHandler.deleteFeed = function(FeedId, userId){
			var url = actionHandler.feedEndPoint + '/' + FeedId;
			return $http.delete(url, {
				params : {user_id : userId}
			});
		}

		actionHandler.deleteFeedByName = function(feedName, userId){
			
			var defer = $q.defer();

			actionHandler.getAllFeeds({name : feedName, user_id : userId}).
			then(function(response){

				if(!response.data || !response.data[0]._id){
					
					var response = {
						error : {
							error_message : 'No feed founnd with the name of project ' + feedName
						}
					}
					defer.reject(response);
				}
				var url = actionHandler.feedEndPoint + '/' + response.data[0]._id;
				
				return $http.delete(url, {
					params : {user_id : userId}
				});

			})
			.then(function(result){
				defer.resolve(result);
			})
			.catch(function(err){
				defer.reject(err);
			});

			return defer.promise;
		}

		return actionHandler;
	}

	angular.module('taskControllApp').factory('FetchFeedService', FetchFeedService);


})();