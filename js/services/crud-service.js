(function(){

	var crudService = angular.module('crudService', [])

	.factory('crudService', ['$q','$http', function($q,$http) {
		return {
			create: function(data){
				return $http({
                    method: "post",
                    url: "http://52.25.174.100/Forms/TestPostForm",
                    data: data
                });
			}
		}
	}])
	
})();