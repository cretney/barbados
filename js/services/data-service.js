(function(){

	var dataService = angular.module('dataService', [])

	.factory('dataService', ['$q','$http', function($q,$http) {
		return {
			getForms: function(){
				return $http.get("file:///Users/joe/Documents/GitHub/barbados/sample-data/items.json");
			}
		}
	}]);
	
})();