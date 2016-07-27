(function(){

	var dataService = angular.module('dataService', [])

	.factory('dataService', ['$filter','$http','$q', function($filter,$http,$q) {
		return {
			getForm: function(id){
				return $http.get("/api/Forms/GetForm/"+id);
			},
			getForms: function(){
				return $http.get("/api/Forms/GetBlockIDs");
			},
			postForm: function(data,id){
				if(id && !data.blockId) data.blockId = id;
				return $http.post("/api/Forms/PostForm",{formData: JSON.stringify(data)});
			},
			getLists: function (id, types) {
			    var t = types || ['country', 'unitsOfMeasure', 'suppliers', 'formsMap', 'formFields'];
				return $http.get("/api/Forms/GetLists?blockId="+id+"&listTypes="+t.join(','), {cache: true});
			},
			getSchema: function(id,types){
				return $http.get("/Forms/json-schemas/master-submission.json");
			},
			getFormDef: function(id,post){
				var def = $q.defer();
				if (id == 9 || id == 32 || id == 37 || id >= 46 && id < 200)
					if (post!=undefined)
						return $http.get("/Forms/form-schemas-defs/"+id+"-"+post+".json");
					else
						return $http.get("/Forms/form-schemas-defs/"+id+".json");
				else
					return $http.get("/Forms/form-schemas-defs/empty.json");
			}
		}
	}])


/*	.factory('dataService', ['$filter','$http','$q', function($filter,$http,$q) {
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
				return $http.get("/Forms/sample-data/forms.json");
			},
			postForm: function(data,id){
				if(id && !data.blockId) data.blockId = id;
				return $http.post("http://52.25.174.100/api/Forms/PostForm",{formData: JSON.stringify(data)});
			},
			getLists: function(id,types){
				return $http.get("/Forms/sample-data/lists.json");
			},
			getSchema: function(id,types){
				return $http.get("/Forms/json-schemas/master.json");
			},
			getFormDef: function(id,types){
				var def = $q.defer();
				if (id == 32 || id >= 46)
					return $http.get("/Forms/form-schemas-defs/"+id+".json");
				else
					return $http.get("/Forms/form-schemas-defs/empty.json");
			}
		}
	}]);
*/
})();
