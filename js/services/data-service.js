(function(){

	var dataService = angular.module('dataService', [])

	.factory('formService', ['$q','$timeout', function($q,$timeout) {
		return {
			get: function(id){
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

			}
		}
	}])

	.factory('dataService', ['$q','$timeout', function($q,$timeout) {
		return {
			get: function(id){
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

			}
		}
	}]);
	
})();