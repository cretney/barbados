(function(){

	var app = angular.module('app', ['ui.bootstrap','dataService'])
	
	.config(['$httpProvider', function ($httpProvider) {
	    $httpProvider.defaults.headers.common.Accept = "application/json;odata=verbose";
		$httpProvider.defaults.headers.post['Content-Type'] = 'application/json;odata=verbose';
		$httpProvider.defaults.headers.post['X-Requested-With'] = 'XMLHttpRequest';
		$httpProvider.defaults.headers.post['If-Match'] = "*";
	}])

	.controller('appCtrl', ['$scope', '$modal',function($scope, $modal){
		$scope.home = {
			documents: []
		};
		for(var i = 1; i < 6; i++){
			$scope.home.documents.push({id: i, name: 'Document '+i}); //load up some sample data
		}
	}])

	.directive('createImport', ['$modal','formService','dataService', function($modal,formService,dataService){
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
		
	.factory('sampleService', ['$q','$timeout', function($q,$timeout) {
		return {
			get: function(){
				var def = $q.defer();
				var randomDate = function (start, end) {
    				return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
				};
				$timeout(function(){ //simulate get request
					var sampleData = [
						{name: 'Sample Form 1', description: 'This is the first sample form', date: randomDate(new Date(2015, 0, 1), new Date()), created: randomDate(new Date(2015, 0, 1), new Date())},
						{name: 'Sample Form 2', description: 'This is the second sample form', date: randomDate(new Date(2015, 0, 1), new Date()), created: randomDate(new Date(2015, 0, 1), new Date())},
						{name: 'Sample Form 3', description: 'This is the third sample form', date: randomDate(new Date(2015, 0, 1), new Date()), created: randomDate(new Date(2015, 0, 1), new Date())},
						{name: 'Sample Form 4', description: 'This is the fourth sample form', date: randomDate(new Date(2015, 0, 1), new Date()), created: randomDate(new Date(2015, 0, 1), new Date())},
						{name: 'Sample Form 5', description: 'This is the fifth sample form', date: randomDate(new Date(2015, 0, 1), new Date()), created: randomDate(new Date(2015, 0, 1), new Date())}
					];
					def.resolve(sampleData);
				},2500);

				return def.promise;
			},
			post: function(data){
				var def = $q.defer();

				$timeout(function(){ //simulate post request
					data.created = new Date();
					def.resolve(data);
				},1000);

				return def.promise;
			}
		}

	}]);
	
})();