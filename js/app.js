(function(){

	var app = angular.module('app', ['ui.bootstrap','crudService','dataService'])
	
	.config(['$httpProvider', function ($httpProvider) {
	    $httpProvider.defaults.headers.common.Accept = "application/json;odata=verbose";
		$httpProvider.defaults.headers.post['Content-Type'] = 'application/json;odata=verbose';
		$httpProvider.defaults.headers.post['X-Requested-With'] = 'XMLHttpRequest';
		$httpProvider.defaults.headers.post['If-Match'] = "*";
	}])

	.controller('appCtrl', ['$scope', 'dataService',function($scope, dataService){
		dataService.getForms().then(function(forms){
			$scope.home = {
				documents: forms.data
			};
		});
	}])

	.directive('createImport', ['$modal','$filter','crudService','dataService', function($modal,$filter,crudService,dataService){
		return{
			restrict: 'A',
			scope: {
				items: '=?'
			},
			link: function(scope, elem, attrs){
				var lists = dataService.getLists();
				elem.on('click', function(){
					lists.then(function(data){
						if(!scope.items) scope.items = [];
						scope.form = {
							data: {
								importItems: [{}]
							},
							options: {
								units: $filter('filter')(data.data,{listType: 'unitsOfMeasure'}, true)[0].list,
								countries: $filter('filter')(data.data,{listType: 'country'}, true)[0].list,
								states: $filter('filter')(data.data,{listType: 'countryState'}, true)[0].list
							},
							modal: $modal.open({
					      		templateUrl: 'views/forms/create-import.html',
					      		scope: scope
					    	}),
					    	submit: function(form){
					    		if(form.$valid && form.$dirty){ //Validate Form
					    			crudService.create(this.data).then(function(item){ //POST data
					    				scope.form.data.formInstanceId = 'abc123'+scope.items.length; //remove later when real GUID is returned
					    				scope.items.unshift(scope.form.data); //POST - Success - later the returned item object will be used to update view
					    			},
					    			function(err){
					    				console.log(JSON.stringify(err)); //POST - Fail
					    			});
						    		this.modal.close();
					    		}
					    	},
					    	cancel: function(){
					    		this.modal.close();
					    	}
					    }
				    });
				});
			}
		}
	}])

	.directive('editImport', ['$modal','$q','$filter','crudService','dataService', function($modal,$q,$filter,crudService,dataService){
		return{
			restrict: 'A',
			scope: {
				itemId: '=editImport',
				items: '=?'
			},
			link: function(scope, elem, attrs){
				var lists = dataService.getLists();
				elem.on('click', function(){
					$q.all([lists, dataService.getForm(scope.itemId)]).then(function(data){
						if(!scope.items) scope.items = [];
						scope.form = {
							data: data[1].data,
							options: {
								units: $filter('filter')(data[0].data,{listType: 'unitsOfMeasure'}, true)[0].list,
								countries: $filter('filter')(data[0].data,{listType: 'country'}, true)[0].list,
								states: $filter('filter')(data[0].data,{listType: 'countryState'}, true)[0].list
							},
							modal: $modal.open({
					      		templateUrl: 'views/forms/create-import.html',
					      		scope: scope
					    	}),
					    	submit: function(form){
					    		if(form.$valid && form.$dirty){
					    			console.log(JSON.stringify(this.data));
									scope.items.unshift(this.data);
						    		this.modal.close();
					    		}
					    	},
					    	cancel: function(){
					    		this.modal.close();
					    	}
					    }
					})
				});
			}
		}
	}])

	.directive('deleteDoc', [function(){
		return{
			restrict: 'A',
			scope: {
				doc: '=deleteDoc',
				items: '=?'
			},
			link: function(scope, elem, attrs){
				elem.on('click', function(){
					//make delete POST, then...
					if(scope.items){
						var index = scope.items.indexOf(scope.doc);
						if(index != -1){
							scope.$apply(function(){
								scope.items.splice(index, 1);
							});
						}
					}
				});
			}
		}
	}])
	
})();