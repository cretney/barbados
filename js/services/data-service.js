(function(){

	var dataService = angular.module('dataService', [])

	.factory('dataService', ['$filter','$http','$q', function($filter,$http,$q) {
		return {
			getForm: function(id){
				return $http.get("http://52.25.174.100/Forms/GetForm/"+id);
			},
			getForms: function(){
				return $http.get("http://52.25.174.100/Forms/GetFormData");
			},
			postForm: function(data,id){
				if(id && !data.blockId) data.blockId = id;
				return $http.post("http://52.25.174.100/Forms/PostForm",{formData: JSON.stringify(data)});
			},
			getLists: function(id,types){
				var t = types || ['country','unitsOfMeasure','suppliers','reason','comment','recommendation','condition','organisations','formsMap','approvalCodes'];
				return $http.get("http://52.25.174.100/Forms/GetLists?blockId="+id+"&listTypes="+t.join(','), {cache: true});
			}
		}
	}]);
	
})();