(function(){

'use strict';

angular.module('taskControllApp').directive('pagination', function(PaginationService){

        return {
          scope : {
            pager         : '=',
            currentTasks  : '=',
            allTasks      : '='
          },
          
          restrict : 'E',
          
          replace: true,
          
          template : '<div id="my-pagination" class="text-primary"><span id="page-link-prev"> <i class="fa fa-angle-double-left" aria-hidden="true"></i> </span> <span> Page </span> <span id="current-page-no"> {{pager.currentPageNo()}} </span> <span> of {{pager.totalPages}}</span> <span id="page-link-next"> <i class="fa fa-angle-double-right" aria-hidden="true"></i> </span></div>',
          
          link : function (scope,element,attrs) {

            angular.element('#page-link-prev').on('click', function(){
              scope.pager.getPrevPage();
              scope.currentPage = scope.pager.currentPageNo();
              scope.currentTasks = scope.allTasks.slice(scope.pager.getStartIndex(),scope.pager.getEndIndex());
              scope.$apply();
            });

            angular.element('#page-link-next').on('click', function(){
              scope.pager.getNextPage();
              scope.currentPage = scope.pager.currentPageNo();
              scope.currentTasks = scope.allTasks.slice(scope.pager.getStartIndex(),scope.pager.getEndIndex());
              scope.$apply();
            });


          }   

          
        };
    });


})();