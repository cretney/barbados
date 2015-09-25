(function(){

	var dataService = angular.module('dataService', [])

	.factory('dataService', ['$filter','$http','$q', function($filter,$http,$q) {
		return {
			getForm: function(id){
				return $http.get("http://52.25.174.100/Forms/GetForm/"+id);
				/*
				var def = $q.defer();  //testing with local data
				this.getForms().then(function(forms){
					forms.data = $filter('filter')(forms.data,{blockId: parseInt(id)},true)[0];
					def.resolve(forms);
				});
				return def.promise;
				*/
			},
			getForms: function(){
				return $http.get("http://52.25.174.100/Forms/GetFormData");
				//return $http.get("sample-data/forms.json", {cache: true}); //testing with local data
			},
			postForm: function(data,id){
				if(id && !data.blockId) data.blockId = id;
				return $http.post("http://52.25.174.100/Forms/PostForm",{formData: JSON.stringify(data)});
			},
			getLists: function(id,types){
				var t = types || ['country','unitsOfMeasure','suppliers','reason','comment','recommendation','condition','organisations','formsMap','approvalCodes'];
				return $http.get("http://52.25.174.100/Forms/GetLists?blockId="+id+"&listTypes="+t.join(','), {cache: true});
				//return $http.get("sample-data/lists.json", {cache: true}); //testing with local data
			}
		}
	}]);
	
})();