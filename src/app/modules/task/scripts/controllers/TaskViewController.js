(function() {

    'use strict';

    function TaskViewController($scope, $state, $log, toastr, DbActionService, UserService, FetchFeedService, feedInfo, moment, MakePriorityService, DropdownService, FetchProjectsService, socket, PaginationService) {

        var vm = this;
        vm.allTasks = [];
        vm.currentTasks = [];
        vm.labels = [];
        vm.data = [];
        vm.chartStatuslabels = [];
        vm.chartStatusData = [];
        vm.projects = [{ name: '', id: '' }];
        vm.firstStar = "none";
        vm.secondStar = "none";
        vm.thirdStar = "none"
        vm.searchText = '';
        var task = {};
        var userInfo = {};
        vm.pager = {};

        var init = function() {
            vm.task = task;
            task.name = '';
            task.assignedTo = '';
            task.dueDate = '';
            task.parentTask = '';
            task.priority = 0;
            userInfo.userId = UserService.getLoggedInUser().id;
            userInfo.name = UserService.getLoggedInUser().name;
            //retrieve feed criteria
            angular.forEach(feedInfo.data, function(value, index) {
                            vm.feedName = value.name;
                            vm.task = value.feed_criteria;

                            if (value.feed_criteria.parentTask) {
                                            vm.task.parentTask = value.feed_criteria.parentTask;
                            }

                            if (value.feed_criteria.priority && value.feed_criteria.priority != 0) {
                                            var priorityObj = MakePriorityService.decodePriority(value.feed_criteria.priority);
                                            if (priorityObj.firstStar) {
                                                            vm.firstStar = priorityObj.firstStar;
                                            }
                                            if (priorityObj.secondStar) {
                                                            vm.secondStar = priorityObj.secondStar;
                                            }
                                            if (priorityObj.thirdStar) {
                                                            vm.thirdStar = priorityObj.thirdStar;
                                            }
                            }

            });

            FetchProjectsService.getAllProjects(userInfo).then(function(projects) {
                            vm.projects = projects;
            }, function(r) {
                            toastr.error(r.data.error_message, '[Error]');
            });
            
            datePopulator();
            vm.fetchTasks();
            vm.statusList = DropdownService.dropdown.task.status;
            vm.orderByList = DropdownService.dropdown.task.orderBy;

            vm.orderByString = 'dueDate';
            vm.sortOrderDesc = true;

        };


        var datePopulator = function() {
            if (vm.task.dueDate == '$today') {
                            vm.task.dueDate = moment().format('DD/MM/YYYY');
            }
            if (vm.task.dueDate == '$tomorrow') {
                            var today = moment();
                            var tomorrow = today.add(1, 'days')
                            vm.task.dueDate = moment(tomorrow).format('DD/MM/YYYY');

            }
            if (vm.task.dueDate == '$nextWeek') {
                            var today = moment();
                            var nextWeek = today.add('days', 7)
                            vm.task.dueDate = moment(nextWeek).format('DD/MM/YYYY');

            }
        }

        vm.fetchTasks = function() {

            var criteria = {};
            criteria.userId = userInfo.userId;
            criteria.status = vm.task.status;

            if (vm.task.dueDate && vm.task.dueDate != '') {
                            criteria.dueDate = vm.task.dueDate;
            }
            if (vm.task.name && vm.task.name != '') {
                            criteria.name = vm.task.name;
            }
            if (vm.task.assignedTo && vm.task.assignedTo != '') {
                            criteria.assignedTo = vm.task.assignedTo;
            }
            if (vm.task.parentTask && vm.task.parentTask != '') {
                            criteria.parentTask = vm.task.parentTask;
            }
            var priority = MakePriorityService.encodePriority({ firstStar: vm.firstStar, secondStar: vm.secondStar, thirdStar: vm.thirdStar });
            if (priority != 0) {
                            criteria.priority = priority;
            }

            var sortObj = {};

            sortObj[vm.orderByString] = vm.sortOrderDesc ? -1 : 1;

            DbActionService.getAllTasks(criteria, sortObj)
                .then(function(response) {
                                vm.allTasks = response.data;

                                console.log(JSON.stringify(vm.allTasks));

                                angular.forEach(vm.allTasks, function(task, index) {
                                        task.editing = false;
                                        task.parentTask.id = task.parentTask._id;
                                });

                                vm.initPagination();

                                /*vm.noOfPages = Math.ceil(vm.allTasks.length / vm.numPerPage);
                                alert('vm.noOfPages: ' + vm.noOfPages);
                                
                                vm.setPage();*/

                                vm.labels = [];
                                vm.data = [];
                                vm.chartStatuslabels = [];
                                vm.chartStatusData = [];

                                const arrChartObjs = [];
                                var asssigneeChartColor = ['#FFA700', '#949FB1', '#803690', '#00ADF9', '#DCDCDC', '#46BFBD', '#4D5360'];
                                var colorIndex = 0;
                                angular.forEach(vm.allTasks, function(task, index) {
                                        
                                        if(arrChartObjs.length == 0){
                                            var newObj = {};
                                            newObj.key = task.assignedTo;
                                            newObj.count = 1;
                                            newObj.color = asssigneeChartColor[colorIndex];
                                            colorIndex = colorIndex + 1;
                                            arrChartObjs.push(newObj);
                                        }else {
                                            var isExist = false;
                                            angular.forEach(arrChartObjs, function(obj){
                                                if(task.assignedTo == obj.key){
                                                    obj.count = obj.count +1;
                                                    isExist = true;
                                                }
                                            })

                                            if(!isExist){
                                                var newObj = {};
                                                newObj.key = task.assignedTo;
                                                newObj.count = 1;
                                                newObj.color = asssigneeChartColor[colorIndex];
                                                colorIndex = colorIndex + 1;
                                                arrChartObjs.push(newObj);
                                            }
                                           
                                        }

                                        
                                });

                                
                               vm.colors = [];

                               vm.options = {cutoutPercentage: 75};

                               angular.forEach(arrChartObjs, function(obj){
                                    vm.labels.push(obj.key);
                                    vm.data.push(obj.count);
                                    vm.colors.push(obj.color);
                                })


                                var arrStatusChartObjs = [];
                                var statusChartColor = ['#00ADF9', '#803690', '#DCDCDC', '#FDB45C', '#949FB1', '#46BFBD', '#4D5360'];
                                colorIndex = 0;
                                angular.forEach(vm.allTasks, function(task, index) {

                                        if(arrStatusChartObjs.length == 0){
                                            var newObj = {};
                                            newObj.key = task.status;
                                            newObj.count = 1;
                                            newObj.color = statusChartColor[colorIndex];
                                            colorIndex = colorIndex + 1;
                                            arrStatusChartObjs.push(newObj);
                                        }else {
                                            var isExist = false;
                                            angular.forEach(arrStatusChartObjs, function(obj){
                                                if(task.status == obj.key){
                                                    obj.count = obj.count +1;
                                                    isExist = true;
                                                }
                                            })

                                            if(!isExist){
                                                var newObj = {};
                                                newObj.key = task.status;
                                                newObj.count = 1;
                                                newObj.color = statusChartColor[colorIndex];
                                                colorIndex = colorIndex + 1;
                                                arrStatusChartObjs.push(newObj);
                                            }
                                           
                                        }

                                        
                                });

                                vm.statusChartcolors = [];

                                angular.forEach(arrStatusChartObjs, function(obj){
                                    vm.chartStatuslabels.push(obj.key);
                                    vm.chartStatusData.push(obj.count);
                                    vm.statusChartcolors.push(obj.color);
                                })


                }, function(response) {
                                toastr.error(response.data.error_message, '[Error]');
                });
        }


        vm.enableNewFeedInput = function() {
            vm.clickedFeedBtn = true;
        }

        vm.saveNewFeed = function() {

            var newFeed = {};
            newFeed.name = vm.newFeedName;
            newFeed.description = 'A new custom feed';
            newFeed.status = 'Active';
            newFeed.userId = userInfo.userId;

            var priority = MakePriorityService.encodePriority({ firstStar: vm.firstStar, secondStar: vm.secondStar, thirdStar: vm.thirdStar });
            vm.task.priority = priority;

            newFeed.feed_criteria = vm.task;


            FetchFeedService.saveFeed(newFeed)
                            .then(function(response) {
                                            toastr.info('Saved new feed', '[Success]');
                                            vm.clickedFeedBtn = true;
                                            vm.newFeedName = '';
                            }, function(response) {
                                            $log.debug('Error response: \n ' + JSON.stringify(response));
                                            toastr.error(response.data.error_message, '[Error]');
                            });

        }


        vm.handleTaskEdit = function(taskId) {
            var task = null;
            vm.allTasks.forEach(function(t) {
                if(t._id === taskId){
                    task = t;
                    return;
                }
            });
            
            vm.projects.forEach(function(p){
                if(p.name === 'Default'){
                    task.parentProjectId = p.id;
                }
            });

            vm.projects.forEach(function(p){
                if(p.id === task.parentTask.id){
                    task.parentTask.name = p.name;
                }
            });


            DbActionService.updateTask(task._id, task)
                            .then(function(response) {
                                            task.editing = false;
                                            toastr.info('Task Updated', '[Success]');
                            }, function(response) {
                                            toastr.error(response.data.error_message, '[Error]');
                            });
            //create event information for sharing
            const event = {
                message : 'Hey!! One task shared with you'
            };

            const creator = {
                id : userInfo.userId,
                name : userInfo.name
            };

            const listener = {
                      id : '',
                      name : task.sharedWith  
            };
            const listeners = [];
            listeners.push(listener);

            socket.emit('share', creator, listeners, event);
            console.log('emitted task share event..');

        };

        vm.cancelTaskEdit = function(taskId) {
            if (confirm('Are you sure to cancel the modification?')) {
                            var task = null;
                            vm.allTasks.forEach(function(t) {
                                if(t._id === taskId){
                                    task = t;
                                    return;
                                }
                            });
                            DbActionService.getTask(task._id, userInfo.userId)
                                            .then(function(response) {
                                                            task.name = response.data[0].name;
                                                            task.status = response.data[0].status;
                                                            task.assignedTo = response.data[0].assignedTo;
                                                            task.sharedWith = response.data[0].sharedWith;
                                                            task.editing = false;
                                                            toastr.info('Task update cancelled', '[Success]');
                                            }, function(response) {
                                                            toastr.error(response.data.error_message, '[Error]');
                                            });
            }

        };

        vm.deleteTask = function(taskId) {
            if (confirm('Are you sure to delete the task feed?')) {
                var task = null;
                vm.allTasks.forEach(function(t) {
                    if(t._id === taskId){
                        task = t;
                        return;
                    }
                });

                DbActionService.deleteTask(task._id, userInfo.userId)
                                .then(function(response) {
                                                var newList = vm.allTasks.filter(function(obj){
                                                    return obj._id !== taskId
                                                })
                                                vm.allTasks = newList;
                                                toastr.info('Task deleted', '[Success]');
                                }, function(response) {
                                                toastr.error(response.data.error_message, '[Error]');
                                });
            }

        };

        /*vm.sortTaskList = function(){
            var criteria = {};
            criteria.userId = userInfo.userId;
            criteria.status = vm.task.status;
            
            if(vm.task.dueDate && vm.task.dueDate != ''){
                criteria.dueDate = vm.task.dueDate;
            }
            if(vm.task.name && vm.task.name != ''){
                criteria.name = vm.task.name;
            }
            if(vm.task.assignedTo && vm.task.assignedTo != ''){
                criteria.assignedTo = vm.task.assignedTo;
            }
            var priority = MakePriorityService.encodePriority({ firstStar : vm.firstStar, secondStar : vm.secondStar, thirdStar : vm.thirdStar});

            if(priority != 0){
                criteria.priority = priority;
            }
            if(vm.task.parentTask && vm.task.parentTask != ''){
                criteria.parentTask = vm.task.parentTask;
            }
            var sortKey = vm.orderByString;
            var sortValue = vm.sortOrderDesc;

            var sortObj = {};
            sortObj[sortKey] = sortValue ?  -1 : 1;

            DbActionService.getAllTasks(criteria, sortObj)
                .then(function(response){
                    vm.allTasks = response.data;
                    angular.forEach(vm.allTasks, function(task,index){
                        task.editing = false;
                    });

                }, function(response){
                    toastr.error(response.data.error_message, '[Error]');
            });
        };*/
        vm.changePriorityClass = function(startPos) {
            var x = 'none';
            if (startPos == 1) {
                            x = (vm.firstStar === "yellow-star-1") ? "none" : "yellow-star-1";
                            vm.firstStar = x;
            } else if (startPos == 2) {
                            x = (vm.secondStar === "yellow-star-2") ? "none" : "yellow-star-2";
                            vm.secondStar = x;
            } else if (startPos == 3) {
                            x = (vm.thirdStar === "yellow-star-3") ? "none" : "yellow-star-3";
                            vm.thirdStar = x;
            }

        };

        vm.getDataForReport = function(){
            var data = [];
            angular.forEach(vm.allTasks, function(task,index){
                var t = {};
                t.name = task.name;
                t.priority = task.priority;
                t.parent = task.parentTask.name;
                t.assignedTo = task.assignedTo;
                t.dueDate = task.dueDate;
                t.status = task.status;
                data.push(t);
            });
            return data;
        }
        
        vm.initPagination = function () {
            var pager = PaginationService.getPager(2,vm.allTasks.length);
            vm.pager = pager;
            vm.currentPage = 1;
            vm.totalPages = pager.totalPages;
            vm.recordPerPage = pager.recordPerPage;
            vm.currentTasks = vm.allTasks.slice(vm.pager.getStartIndex(),vm.pager.getEndIndex());
        }

        init();
    };


    angular.module('taskControllApp').controller('TaskViewController', TaskViewController);


})();
