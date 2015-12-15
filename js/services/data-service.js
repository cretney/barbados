(function(){

	var dataService = angular.module('dataService', [])

	.factory('dataService-Prod', ['$filter','$http','$q', function($filter,$http,$q) {
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
	}])

	.factory('dataService', ['$filter','$http','$q', function($filter,$http,$q) {
		return {
			getForm: function(id){
				var def = $q.defer();
				this.getForms().then(function(data){
					var item = $filter('filter')(data.data, {blockId: parseInt(id)}, true)[0];
					def.resolve({data: item});
				});
				return def.promise;
			},
			getForms: function(){
				return $http.get("sample-data/forms.json");
			},
			postForm: function(data,id){
				if(id && !data.blockId) data.blockId = id;
				return $http.post("http://52.25.174.100/api/Forms/PostForm",{formData: JSON.stringify(data)});
			},
			getLists: function(id,types){
				return $http.get("sample-data/lists.json");
			}
		}
	}]);
	
})();