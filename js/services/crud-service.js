(function(){

	var crudService = angular.module('crudService', [])

	.factory('crudService', ['$q','$http', function($q,$http) {
		return {
			get: function(id){
				return $http.get("file:///Users/joe/Documents/GitHub/barbados/sample-data/item.json");
			},
			post: function(data){

			}
		}
	}])
	
})();