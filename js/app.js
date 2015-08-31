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

	.directive('createImport', ['$modal','crudService','dataService', function($modal,formService,dataService){
		return{
			restrict: 'A',
			scope: {
				items: '=?'
			},
			link: function(scope, elem, attrs){
				elem.on('click', function(){
					if(!scope.items) scope.items = [];
					scope.form = {
						data: {
							importItems: [{}]
						},
						options: {
							units: ['Tons','Pounds','Something Else'] //this should be dynamically pulled from DB
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
				});
			}
		}
	}])

	.directive('editImport', ['$modal','crudService','dataService', function($modal,crudService,dataService){
		return{
			restrict: 'A',
			scope: {
				itemId: '=editImport',
				items: '=?'
			},
			link: function(scope, elem, attrs){
				elem.on('click', function(){
					crudService.get(scope.itemId).then(function(item){
						if(!scope.items) scope.items = [];
						scope.form = {
							data: item.data,
							options: {
								units: ['Tons','Pounds','Something Else'] //this should be dynamically pulled from DB
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