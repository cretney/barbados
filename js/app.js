﻿(function(){

	var app = angular.module('app', ['ngMessages','ui.bootstrap','dataService','ui.select'])
	
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

	.directive('openForm', ['$modal','dataService', function($modal,dataService){
		return{
			restrict: 'A',
			scope: {
				itemId: '@openForm'
			},
			link: function(scope, elem, attrs){
				scope.ila = {};
				elem.on('click', function(){
					scope.form = {
						spinner: 'img/spinner.gif',
						modal: $modal.open({
				      		templateUrl: './forms/views/forms/form-default.html',
				      		size: 'lg',
				      		//backdrop: 'static',
				      		scope: scope
				    	}),
				    	submit: function(form){
				    		if(form.$valid){
				    			scope.form.saving = true;
				    			dataService.postForm(this.data, scope.ila.blockId).then(
				    				function(res){ //post success
					    				scope.form.modal.close();
					    			},
					    			function(err){ //post fail
					    				scope.form.postError = 'Oops! Something went wrong. Please try again';
					    				scope.form.saving = false;
					    				console.log('Error posting data: '+JSON.stringify(err));
					    			}
				    			);
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

	.directive('embedForm', ['dataService', function(dataService){
		return{
			restrict: 'A',
			replace: true,
			scope: {
				itemId: '@embedForm'
			},
			templateUrl: './forms/views/forms/form-default.html',
			link: function(scope, elem, attrs){
				scope.ila = {};
				scope.form = {
					spinner: 'img/spinner.gif',
					submit: function(form){
			    		if(form.$valid){
			    			scope.form.saving = true;
			    			dataService.postForm(this.data, scope.ila.blockId).then(
			    				function(res){ //post success
				    				submitted(); //ATS function
				    			},
				    			function(err){ //post fail
				    				scope.form.postError = 'Oops! Something went wrong. Please try again';
				    				scope.form.saving = false;
				    				console.log('Error posting data: '+JSON.stringify(err));
				    			}
			    			);
			    		}
			    	},
			    	cancel: function(){
			    		cancelled(); //ATS function
			    	}
				}
			}

		}
	}])

	.directive('lpcoForm', ['$http','$q','$filter','dataService', function($http,$q,$filter,dataService){
		return{
			restrict: 'A',
			link: function(scope, elem, attrs){
				$q.all([dataService.getForm(scope.itemId),dataService.getLists(scope.itemId)]).then(function(data){
					scope.ila = angular.copy(data[0].data); //set item variable
					//any List logic based on the current item would go here...
					var formsMap = $filter('filter')(data[1].data,{listType: 'formsMap'}, true)[0].list; //get form mappings
					var form = $filter('filter')(formsMap,{id: scope.ila.formId}, true)[0]; //select current form mapping
					angular.extend(scope.form, {
						template: 'forms/views/forms/'+form.template,
						config:{
							currency:{
								symbol: {
									long: 'BBD $',
									short: '$'
								},
								min: 0,
								pattern: new RegExp("(?=.)^\\$?(([1-9][0-9]{0,2}(,[0-9]{3})*)|[0-9]+)?(\\.[0-9]{1,2})?$") //regex matching currency
							},
							quantity:{
								min: 0
							},
							date: {
								dateformat: 'MM/dd/yyyy',
								datepickerformat: 'yyyy-mm-dd'
							}
						},
						data: {
							commodities: angular.copy(scope.ila.submission.commodities) || []
						},
						showSubmission: function(){
							return scope.ila.status == 'Submitted';
						},
						options: {
							countries: $filter('filter')(data[1].data,{listType: 'country'}, true)[0].list,
							suppliers: $filter('filter')(data[1].data,{listType: 'suppliers'}, true)[0].list,
							formFields: $filter('filter')(data[1].data,{listType: 'formFields'}, true)[0].list
						}
				    });
				});
			}
		}
	}])

	.directive('viewCommodities', [function(){
		return{
			restrict: 'A',
			replace: true,
			templateUrl: './forms/views/partials/view-commodities.html'
		}
	}])

	.directive('editCommodities', [function(){
		return{
			restrict: 'A',
			replace: true,
			templateUrl: './forms/views/partials/edit-commodities.html'
		}
	}])

	.directive('validateCommodities', [function(){
		return{
			restrict: 'A',
			replace: true,
			templateUrl: './forms/views/partials/validate-commodities.html'
		}
	}])

	.directive('fieldName', ['$filter', function($filter){
		return{
			restrict: 'A',
			replace: true,
			scope: {
				id: '@fieldName',
				fields: '=formFields',
				tt: '@fieldTooltip'
			},
			templateUrl: './forms/views/partials/field-name.html',
			link: function(scope, elem, attrs){
				scope.field = $filter('filter')(scope.fields, {id: parseInt(scope.id)}, true)[0];
				if(scope.tt && scope.tt.toLowerCase() == 'true') scope.field.tooltip = true;
			}
		}
	}])

	.filter('propsFilter', [function() {
  		return function(items, props) {
    		var out = [];

		    if (angular.isArray(items)) {
		      items.forEach(function(item) {
		        var itemMatches = false;

		        var keys = Object.keys(props);
		        for (var i = 0; i < keys.length; i++) {
		          var prop = keys[i];
		          var text = props[prop].toLowerCase();
		          if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
		            itemMatches = true;
		            break;
		          }
		        }

		        if (itemMatches) {
		          out.push(item);
		        }
		      });
		    } else {
		      // Let the output be the input untouched
		      out = items;
		    }

    		return out;
  		}
	}])
	
})();