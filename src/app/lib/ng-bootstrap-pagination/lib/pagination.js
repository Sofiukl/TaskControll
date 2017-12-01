var tpl = require('./tpl.html');
var defaults = {};

var directive = ['$templateCache', function($templateCache) {
  return {
    require: '?ngModel',
    template: $templateCache.get('ng-bootstrap-pagination') || tpl,
    replace: true,
    restrict: 'E',
    link: function(scope, element, attrs, ngModel) {
      var modelname = attrs.ngModel || defaults.model || 'paging';
      var set_count = +attrs.setCount || +defaults.setCount || 10;
      
      var getvalue = function(key) {
        return attrs[key] || defaults[key];
      };
      
      var getboolean = function(key, def) {
        if( typeof def != 'boolean' ) def = false;
        if( typeof attrs[key] == 'boolean' ) return attrs[key];
        if( typeof defaults[key] == 'boolean' ) return defaults[key];
        if( key in attrs ) return attrs[key] == 'true' ? true : attrs[key] == 'false' ? false : def;
        if( key in defaults ) return defaults[key] == 'true' ? true : defaults[key] == 'false' ? false : def;
        return def;
      };
      
      var render = function() {
        var paging = scope.$eval(modelname);
        var pages = [];
        
        if( paging ) {
          var total = +paging.total || 0;
          var offset = +paging.offset || 0;
          var limit = +paging.limit;
          var current = (Math.floor(offset / limit) + 1) || 1;
          var prevable = offset > 0;
          var nextable = (offset + limit) < total;
          var set_index = Math.floor((current - 1) / set_count) + 1;
          var setfirstindex = (set_index * set_count) - set_count + 1;
          var setlastindex = (set_index * set_count);
          var lastindex = Math.floor((total + limit - 1) / limit);
          
          if( setlastindex > lastindex ) setlastindex = lastindex;
          
          for(var i=setfirstindex; i <= setlastindex; i++) {
            if( i > total ) break;
            pages.push({
              active: i === current,
              page: i
            });
          }
          
          scope.current = current;
          scope.prevable = prevable;
          scope.nextable = nextable;
          scope.pages = pages;
          scope.setfirstindex = setfirstindex;
          scope.setlastindex = setlastindex;
          scope.lastindex = lastindex;
        } else {
          scope.current = 1;
          scope.prevable = false;
          scope.nextable = false;
          scope.setfirstindex = 1;
          scope.setlastindex = 1;
          scope.lastindex = 1;
        }
        
        scope.pages = pages;
        if( !pages.length ) pages.push({active: true, page: 1});
        
        scope.showFirst = getboolean('showFirst');
        scope.showLast = getboolean('showLast');
        scope.showPrev = getboolean('showPrev', true);
        scope.showNext = getboolean('showNext', true);
        scope.showPrevSet = getboolean('showPrevSet');
        scope.showNextSet = getboolean('showNextSet');
        scope.txt_first = getvalue('firstText');
        scope.txt_prev = getvalue('prevText');
        scope.txt_next = getvalue('nextText');
        scope.txt_last = getvalue('lastText');
        scope.txt_prevset = getvalue('prevSetText');
        scope.txt_nextset = getvalue('nextSetText');
        
        if( scope.current <= set_count ) scope.showPrevSet = false;
        if( scope.setlastindex >= scope.lastindex ) scope.showNextSet = false;
      };
      
      scope.first = function() {
        go(1);
      };
      
      scope.prev = function() {
        go(scope.current - 1);
      };
      
      scope.next = function() {
        go(scope.current + 1);
      };
      
      scope.last = function() {
        go(scope.lastindex);
      };
      
      scope.prevset = function() {
        go(scope.setfirstindex - 1);
      };
      
      scope.nextset = function() {
        go(scope.setlastindex + 1);
      };
      
      var go = scope.go = function(index) {
        if( index < 1 || index > scope.lastindex ) return;
        if( index === scope.current ) return;
        var paging = scope.$eval(modelname);
        if( paging ) paging.go(index);
      };
      
      scope.$watch(modelname, function(value) {
        if( scope.$$phase == '$apply' || scope.$$phase == '$digest' || scope.$root.$$phase == '$apply' || scope.$root.$$phase == '$digest' ) {
          render();
        } else {
          scope.$apply(function() {
            render();
          });
        }
      });
    }
  };
}];

var app = angular.module('ngBootstrapPagination', [])
.filter('unsafe', ['$sce', function($sce) { return $sce.trustAsHtml; }])
.directive('pagination', directive);

app.tpl = function(html) {
  if( !arguments.length ) return tpl;
  tpl = html || tpl;
  return this;
};

app.defaults = function(o) {
  if( o && typeof o == 'object' ) defaults = o;
  return this;
};

module.exports = app;