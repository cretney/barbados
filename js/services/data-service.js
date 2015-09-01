(function(){

	var dataService = angular.module('dataService', [])

	.factory('dataService', ['$q','$http', function($q,$http) {
		return {
			getForm: function(id){
				return $http.get("file:///Users/joe/Documents/GitHub/barbados/sample-data/item.json");
			},
			getForms: function(){
				return $http.get("http://52.25.174.100/Forms/GetFormData");
			},
			getLists: function(){
				return $http.get("http://52.25.174.100/Forms/GetLists", {cache: true});
			}
		}
	}]);
	
})();