(function(){

	var dataService = angular.module('dataService', [])

	.factory('dataService', ['$filter','$http','$q', function($filter,$http,$q) {
		return {
			getForm: function(id){
				return $http.get("http://52.25.174.100/api/Forms/GetForm/"+id);
			},
			getForms: function(){
				return $http.get("http://52.25.174.100/api/Forms/GetBlockIDs");
			},
			postForm: function(data,id){
				if(id && !data.blockId) data.blockId = id;
				return $http.post("http://52.25.174.100/api/Forms/PostForm",{formData: JSON.stringify(data)});
			},
			getLists: function(id,types){
				var t = types || ['country','unitsOfMeasure','suppliers','reason','comment','recommendation','condition','companies','formsMap','approvalCodes'];
				return $http.get("http://52.25.174.100/api/Forms/GetLists?blockId="+id+"&listTypes="+t.join(','), {cache: true});
			}
		}
	}]);
	
})();