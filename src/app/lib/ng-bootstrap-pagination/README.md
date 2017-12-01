# ng-bootstrap-pagination
> An angularjs pagination directive for bootstrap

## Installation
```sh
$ npm install ng-bootstrap-pagination --save
```

## Usage
```javascript
var angular = require('angular');
require('ng-bootstrap-pagination').tpl('template html').defaults({
  showFirst: true,
  showLast: true,
  showPrev: true,
  showNext: true,
  showPrevSet: true,
  showNextSet: true,
  firstText: '«',
  prevText: '‹',
  nextText: '›',
  lastText: '»',
  prevSetText: '...',
  nextSetText: '...',
  setCount: 5
});;

angular.module('app', ['ngBootstrapPagination']);
```

```html
<pagination ng-model="paging"></pagination>
<pagination ng-model="paging" set-count="10" first-text="«" prev-text="‹" next-text="›" last-text="»" prev-set-text="..." next-set-text="..." show-first="true" show-last="true" show-prev-set="true" show-next-set="true" show-prev="false" show-next="false"></pagination>
```

```javascript
angular.module('app').controller('list', ['$scope', function($scope) {
  function refresh(options) {
    if( typeof options === 'number' ) options = {offset:options};
    if( typeof options === 'string' ) options = {search:options};
    options = options || {};
    
    var offset = options.offset || 0;
    var limit = options.limit || 50;
    
    $scope.paging = {
        total: 100,
        offset: offset,
        limit: limit,
        go: function(index) {
          refresh((index * limit) - limit);
        }
    };
  }
  
  refresh();
}]);
```

