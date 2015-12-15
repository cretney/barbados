(function(){

	var app = angular.module('app', ['ui.bootstrap','dataService'])
	
	.config(['$httpProvider', function ($httpProvider) {
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

	.directive('a', [function() {
		return {
			restrict: 'E',
			link: function(scope, elem, attrs) {
				if(attrs.ngClick || attrs.href === '' || attrs.href === '#'){
					elem.on('click', function(e){
						e.preventDefault();
					});
				}
			}
		};
	}])

	.directive('submission', [function() {
		return {
			restrict: 'A',
			scope: {
				submission: '='
			},
			replace: 'true',
			templateUrl: 'views/submission.html'
		};
	}])

	.directive('history', [function() {
		return {
			restrict: 'A',
			scope: {
				tasks: '=history'
			},
			replace: 'true',
			templateUrl: 'views/history.html'
		};
	}])

	.directive('openForm', ['$http','$q','$modal','$filter','dataService', function($http,$q,$modal,$filter,dataService){
		return{
			restrict: 'A',
			scope: {
				itemId: '@openForm'
			},
			link: function(scope, elem, attrs){
				$q.all([dataService.getForm(scope.itemId),dataService.getLists(scope.itemId)]).then(function(data){
					elem.on('click', function(){
						scope.item = angular.copy(data[0].data); //set item variable
						//any List logic based on the current item would go here...
						var formsMap = $filter('filter')(data[1].data,{listType: 'formsMap'}, true)[0].list; //get form mappings
						var form = $filter('filter')(formsMap,{id: scope.item.formId}, true)[0]; //select current form mapping
						var pre = {}; //create empty object for holding form data
						if(form.data) pre = scope.item[form.data]; //prefill data
						scope.form = {
							page: -1,
							pageUp: function(validation){
								if(validation){
									if(validation.$valid) this.page++;
								}
								else this.page++;
							},
							pageDn: function(){
								this.page--;
							},
							template: 'views/forms/'+form.template,
							data: pre,
							showSubmission: function(){
								return scope.item.status != 'Draft';
							},
							options: {
								countries: $filter('filter')(data[1].data,{listType: 'country'}, true)[0].list,
								suppliers: $filter('filter')(data[1].data,{listType: 'suppliers'}, true)[0].list,
								companies: $filter('filter')(data[1].data,{listType: 'companies'}, true)[0].list,
								approvalCodes: $filter('filter')(data[1].data,{listType: 'approvalCodes'}, true)[0].list
							},
							datepicker: {
								format: 'MM/dd/yyyy'
							},
							modal: $modal.open({
					      		templateUrl: form.shell || 'views/forms/form-default.html',
					      		size: form.size || 'md',
					      		backdrop: 'static',
					      		scope: scope
					    	}),
					    	submit: function(form){
					    		if(form.$valid){
					    			dataService.postForm(this.data, scope.item.blockId).then(
					    				function(res){ //post success
						    				scope.form.modal.close();
						    			},
						    			function(){ //post fail
						    				scope.form.postError = 'Oops! Something went wrong. Please try again';
						    				console.log('Error posting data: '+JSON.stringify(res));
						    			}
					    			);
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