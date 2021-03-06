﻿(function(){

	var app = angular.module('app', ['ngMessages','ui.bootstrap','dataService','ui.select','schemaForm','pw.canvas-painter'])

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

			$scope.current_date = new Date();

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
				scope.current_date = new Date();

				elem.on('click', function(){
					scope.currentStep = 1;
					scope.form = {
						spinner: '/Forms/img/spinner.gif',
						modal: $modal.open({
				      		templateUrl: '/Forms/forms/views/forms/form-default.html',
				      		size: 'lg',
				      		//backdrop: 'static',
				      		scope: scope
				    	}),


			        next: function (form) {
			            // $scope.toTheTop();


			            if (form.$valid) {
			            	form.$setPristine();
			                nextStep();
			            } else {
			                var field = null, firstError = null;
			                for (field in form) {
			                    if (field[0] != '$') {
			                        if (firstError === null && !form[field].$valid) {
			                            firstError = form[field].$name;
			                        }

			                        if (form[field].$pristine) {
			                            form[field].$dirty = true;
			                        }
			                    }
			                }

			                angular.element('.ng-invalid[name=' + firstError + ']').focus();
			                errorMessage();
			            }
			        },
			        prev: function (form) {
			            // $scope.toTheTop();
			            prevStep();
			        },
			        goTo: function (form, i) {
			            if (parseInt(scope.currentStep) > parseInt(i)) {
			                // $scope.toTheTop();
			                goToStep(i);

			            } else {
			                if (form.$valid) {
			                    // $scope.toTheTop();
			                    goToStep(i);

			                } else
			                    errorMessage();
			            }
			        },
			        reset: function () {

			        },

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
				  };

			    var nextStep = function () {
			        scope.currentStep++;
			    };
			    var prevStep = function () {
			        scope.currentStep--;
			    };
			    var goToStep = function (i) {
			        scope.currentStep = i;
			    };
			    var errorMessage = function (i) {
			        // toaster.pop('error', 'Error', 'please complete the form in this step before proceeding');
			    };


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
			templateUrl: '/Forms/forms/views/forms/form-default.html',
			link: function(scope, elem, attrs){
				scope.ila = {};
				scope.current_date = new Date();

				scope.form = {
					spinner: '/Forms/img/spinner.gif',
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

				  // scope.form1 = [
				  //   "description",
				  //   {
				  //     type: "submit",
				  //     title: "Save"
				  //   }
				  // ];
				  scope.model = {};

					dataService.getSchema(
						// scope.itemId
					).then(function(schema){
					  scope.schema = schema.data;
					});

					//any List logic based on the current item would go here...
					var formsMap = $filter('filter')(data[1].data,{listType: 'formsMap'}, true)[0].list; //get form mappings
					var form = $filter('filter')(formsMap,{id: scope.ila.formId}, true)[0]; //select current form mapping
					dataService.getFormDef(scope.ila.formId).then(function(formdef){
					  scope.formdef = formdef.data;
					  // console.log(scope.formdef);
					});
					dataService.getFormDef(scope.ila.formId, '1').then(function(formdef){
					  scope.formdef1 = formdef.data;
					  // console.log(scope.formdef);
					});
					dataService.getFormDef(scope.ila.formId, '2').then(function(formdef){
					  scope.formdef2 = formdef.data;
					  // console.log(scope.formdef);
					});
					angular.extend(scope.form, {
						template: '/Forms/forms/views/forms/'+form.template,
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
						data: angular.copy(scope.ila.submission) || [],
						// data: {
						// 	commodities: angular.copy(scope.ila.submission.commodities) || []
						// },
						showSubmission: function(){
							return scope.ila.status == 'Submitted';
						},
						options: {
							countries: $filter('filter')(data[1].data,{listType: 'country'}, true)[0].list,
							suppliers: $filter('filter')(data[1].data,{listType: 'suppliers'}, true)[0].list,
							// formFields: $filter('filter')(data[1].data,{listType: 'formFields'}, true)[0].list
							gsp_countries_other:[
								{"id":"AF","name":"Afghanistan"},{"id":"AX","name":"Åland Islands"},{"id":"AL","name":"Albania"},{"id":"DZ","name":"Algeria"},{"id":"AS","name":"American Samoa"},{"id":"AD","name":"AndorrA"},{"id":"AO","name":"Angola"},{"id":"AQ","name":"Antarctica"},{"id":"AR","name":"Argentina"},{"id":"AM","name":"Armenia"},{"id":"AW","name":"Aruba"},{"id":"AZ","name":"Azerbaijan"},{"id":"BS","name":"Bahamas"},{"id":"BH","name":"Bahrain"},{"id":"BD","name":"Bangladesh"},{"id":"BY","name":"Belarus"},{"id":"BJ","name":"Benin"},{"id":"BM","name":"Bermuda"},{"id":"BT","name":"Bhutan"},{"id":"BO","name":"Bolivia"},{"id":"BA","name":"Bosnia and Herzegovina"},{"id":"BW","name":"Botswana"},{"id":"BV","name":"Bouvet Island"},{"id":"BR","name":"Brazil"},{"id":"IO","name":"British Indian Ocean Territory"},{"id":"BN","name":"Brunei Darussalam"},{"id":"BG","name":"Bulgaria"},{"id":"BF","name":"Burkina Faso"},{"id":"BI","name":"Burundi"},{"id":"KH","name":"Cambodia"},{"id":"CM","name":"Cameroon"},{"id":"CV","name":"Cape Verde"},{"id":"KY","name":"Cayman Islands"},{"id":"CF","name":"Central African Republic"},{"id":"TD","name":"Chad"},{"id":"CL","name":"Chile"},{"id":"CN","name":"China"},{"id":"CX","name":"Christmas Island"},{"id":"CC","name":"Cocos (Keeling) Islands"},{"id":"KM","name":"Comoros"},{"id":"CG","name":"Congo"},{"id":"CD","name":"Congo, The Democratic Republic of the"},{"id":"CK","name":"Cook Islands"},{"id":"CI","name":"Cote D'Ivoire"},{"id":"HR","name":"Croatia"},{"id":"CY","name":"Cyprus"},{"id":"CZ","name":"Czech Republic"},{"id":"DJ","name":"Djibouti"},{"id":"EC","name":"Ecuador"},{"id":"EG","name":"Egypt"},{"id":"SV","name":"El Salvador"},{"id":"GQ","name":"Equatorial Guinea"},{"id":"ER","name":"Eritrea"},{"id":"EE","name":"Estonia"},{"id":"ET","name":"Ethiopia"},{"id":"FK","name":"Falkland Islands (Malvinas)"},{"id":"FO","name":"Faroe Islands"},{"id":"FJ","name":"Fiji"},{"id":"GF","name":"French Guiana"},{"id":"PF","name":"French Polynesia"},{"id":"TF","name":"French Southern Territories"},{"id":"GA","name":"Gabon"},{"id":"GM","name":"Gambia"},{"id":"GE","name":"Georgia"},{"id":"GH","name":"Ghana"},{"id":"GI","name":"Gibraltar"},{"id":"GL","name":"Greenland"},{"id":"GP","name":"Guadeloupe"},{"id":"GU","name":"Guam"},{"id":"GT","name":"Guatemala"},{"id":"GG","name":"Guernsey"},{"id":"GN","name":"Guinea"},{"id":"GW","name":"Guinea-Bissau"},{"id":"HT","name":"Haiti"},{"id":"HM","name":"Heard Island and Mcdonald Islands"},{"id":"VA","name":"Holy See (Vatican City State)"},{"id":"HN","name":"Honduras"},{"id":"HK","name":"Hong Kong"},{"id":"HU","name":"Hungary"},{"id":"IS","name":"Iceland"},{"id":"IN","name":"India"},{"id":"ID","name":"Indonesia"},{"id":"IR","name":"Iran, Islamic Republic Of"},{"id":"IQ","name":"Iraq"},{"id":"IM","name":"Isle of Man"},{"id":"IL","name":"Israel"},{"id":"JE","name":"Jersey"},{"id":"JO","name":"Jordan"},{"id":"KZ","name":"Kazakhstan"},{"id":"KE","name":"Kenya"},{"id":"KI","name":"Kiribati"},{"id":"KP","name":"Korea, Democratic People'S Republic of"},{"id":"KR","name":"Korea, Republic of"},{"id":"KW","name":"Kuwait"},{"id":"KG","name":"Kyrgyzstan"},{"id":"LA","name":"Lao People'S Democratic Republic"},{"id":"LV","name":"Latvia"},{"id":"LB","name":"Lebanon"},{"id":"LS","name":"Lesotho"},{"id":"LR","name":"Liberia"},{"id":"LY","name":"Libyan Arab Jamahiriya"},{"id":"LI","name":"Liechtenstein"},{"id":"LT","name":"Lithuania"},{"id":"MO","name":"Macao"},{"id":"MK","name":"Macedonia, The Former Yugoslav Republic of"},{"id":"MG","name":"Madagascar"},{"id":"MW","name":"Malawi"},{"id":"MY","name":"Malaysia"},{"id":"MV","name":"Maldives"},{"id":"ML","name":"Mali"},{"id":"MT","name":"Malta"},{"id":"MH","name":"Marshall Islands"},{"id":"MQ","name":"Martinique"},{"id":"MR","name":"Mauritania"},{"id":"MU","name":"Mauritius"},{"id":"YT","name":"Mayotte"},{"id":"MX","name":"Mexico"},{"id":"FM","name":"Micronesia, Federated States of"},{"id":"MD","name":"Moldova, Republic of"},{"id":"MC","name":"Monaco"},{"id":"MN","name":"Mongolia"},{"id":"MA","name":"Morocco"},{"id":"MZ","name":"Mozambique"},{"id":"MM","name":"Myanmar"},{"id":"NA","name":"Namibia"},{"id":"NR","name":"Nauru"},{"id":"NP","name":"Nepal"},{"id":"AN","name":"Netherlands Antilles"},{"id":"NC","name":"New Caledonia"},{"id":"NI","name":"Nicaragua"},{"id":"NE","name":"Niger"},{"id":"NG","name":"Nigeria"},{"id":"NU","name":"Niue"},{"id":"NF","name":"Norfolk Island"},{"id":"MP","name":"Northern Mariana Islands"},{"id":"OM","name":"Oman"},{"id":"PK","name":"Pakistan"},{"id":"PW","name":"Palau"},{"id":"PS","name":"Palestinian Territory, Occupied"},{"id":"PA","name":"Panama"},{"id":"PG","name":"Papua New Guinea"},{"id":"PY","name":"Paraguay"},{"id":"PE","name":"Peru"},{"id":"PH","name":"Philippines"},{"id":"PN","name":"Pitcairn"},{"id":"PL","name":"Poland"},{"id":"QA","name":"Qatar"},{"id":"RE","name":"Reunion"},{"id":"RO","name":"Romania"},{"id":"RU","name":"Russian Federation"},{"id":"RW","name":"RWANDA"},{"id":"SH","name":"Saint Helena"},{"id":"PM","name":"Saint Pierre and Miquelon"},{"id":"WS","name":"Samoa"},{"id":"SM","name":"San Marino"},{"id":"ST","name":"Sao Tome and Principe"},{"id":"SA","name":"Saudi Arabia"},{"id":"SN","name":"Senegal"},{"id":"CS","name":"Serbia and Montenegro"},{"id":"SC","name":"Seychelles"},{"id":"SL","name":"Sierra Leone"},{"id":"SG","name":"Singapore"},{"id":"SK","name":"Slovakia"},{"id":"SI","name":"Slovenia"},{"id":"SB","name":"Solomon Islands"},{"id":"SO","name":"Somalia"},{"id":"ZA","name":"South Africa"},{"id":"GS","name":"South Georgia and the South Sandwich Islands"},{"id":"LK","name":"Sri Lanka"},{"id":"SD","name":"Sudan"},{"id":"SJ","name":"Svalbard and Jan Mayen"},{"id":"SZ","name":"Swaziland"},{"id":"SY","name":"Syrian Arab Republic"},{"id":"TW","name":"Taiwan, Province of China"},{"id":"TJ","name":"Tajikistan"},{"id":"TZ","name":"Tanzania, United Republic of"},{"id":"TH","name":"Thailand"},{"id":"TL","name":"Timor-Leste"},{"id":"TG","name":"Togo"},{"id":"TK","name":"Tokelau"},{"id":"TO","name":"Tonga"},{"id":"TN","name":"Tunisia"},{"id":"TR","name":"Turkey"},{"id":"TM","name":"Turkmenistan"},{"id":"TC","name":"Turks and Caicos Islands"},{"id":"TV","name":"Tuvalu"},{"id":"UG","name":"Uganda"},{"id":"UA","name":"Ukraine"},{"id":"AE","name":"United Arab Emirates"},{"id":"UM","name":"United States Minor Outlying Islands"},{"id":"UY","name":"Uruguay"},{"id":"UZ","name":"Uzbekistan"},{"id":"VU","name":"Vanuatu"},{"id":"VN","name":"Viet Nam"},{"id":"VI","name":"Virgin Islands, U.S."},{"id":"WF","name":"Wallis and Futuna"},{"id":"EH","name":"Western Sahara"},{"id":"YE","name":"Yemen"},{"id":"ZM","name":"Zambia"},{"id":"ZW","name":"Zimbabwe"}
							],
							gsp_countries_cbi:[
								{"id":"PR", "name":'Puerto Rico'},{"id":"US", "name":'United States'}
							],
							gsp_countries_caribcan:[
								{"id":"CA", "name":'Canada'}
							],
							gsp_countries_gsp:[
								{"id":"AU","name":"Australia"},{"id":"AT","name":"Austria"},{"id":"BE","name":"Belgium"},{"id":"DK","name":"Denmark"},{"id":"FI","name":"Finland"},{"id":"FR","name":"France"},{"id":"DE","name":"Germany"},{"id":"GR","name":"Greece"},{"id":"IE","name":"Ireland"},{"id":"IT","name":"Italy"},{"id":"JP","name":"Japan"},{"id":"LU","name":"Luxembourg"},{"id":"NL","name":"Netherlands"},{"id":"NZ","name":"New Zealand"},{"id":"NO","name":"Norway"},{"id":"PT","name":"Portugal"},{"id":"ES","name":"Spain"},{"id":"SE","name":"Sweden"},{"id":"CH","name":"Switzerland"},{"id":"GB","name":"United Kingdom"},{"id":"VG","name":"Virgin Islands, British"}
							],
							gsp_countries_caricom:[
								{"id":"AI","name":"Anguilla"},{"id":"AG","name":"Antigua and Barbuda"},{"id":"BZ","name":"Belize"},{"id":"DM","name":"Dominica"},{"id":"GD","name":"Grenada"},{"id":"GY","name":"Guyana"},{"id":"JM","name":"Jamaica"},{"id":"MS","name":"Montserrat"},{"id":"KN","name":"Saint Kitts and Nevis"},{"id":"LC","name":"Saint Lucia"},{"id":"VC","name":"Saint Vincent and the Grenadines"},{"id":"SR","name":"Suriname"},{"id":"TT","name":"Trinidad and Tobago"}
							],
							caricom_countries_venezuela:[
								{"id":"VE", "name":'Venezuela'}
							],
							formFields:
							[
								{
									"id": 1,
									"field": "submitter",
									"display": "Submitter",
									"definition": "The person who submitted the application."
								},
								{
									"id": 2,
									"field": "applicant",
									"display": "Applicant",
									"definition": "The person or company applying for the licence."
								},
								{
									"id": 13,
									"field": "hsCode",
									"display": "HS Code",
									"definition": "The unique code for the commodity."
								},
								{
									"id": 16,
									"field": "description",
									"display": "Description",
									"definition": "Description of the item."
								},
								{
									"id": 18,
									"field": "unitType",
									"display": "Unit of Sale",
									"definition": "The unit of sale."
								},
								{
									"id": 19,
									"field": "quantity",
									"display": "Quantity",
									"definition": "The quantity in units of sale."
								},
								{
									"id": 20,
									"field": "pricePerUnit",
									"display": "Price Per Unit",
									"definition": "In Barbados Dollars"
								},
								{
									"id": 21,
									"field": "cifValue",
									"display": "Customs Value",
									"definition": "In Barbados Dollars"
								},
								{
									"id": 4,
									"field": "origin",
									"display": "Country of Origin",
									"definition": "The country from where the goods originated.",
									"fieldtype": "Dropdown"
								},
								{
									"id": 5,
									"field": "countryConsigned",
									"display": "Country Whence Consigned",
									"definition": "The country where the goods were consigned.",
									"fieldtype": "Dropdown"
								},
								{
									"id": 8,
									"field": "supplier",
									"display": "Supplier",
									"definition": "The name of the Supplier of the goods.",
									"fieldtype": "Dropdown"
								},
								{
									"id": 6,
									"field": "expectedArrival",
									"display": "Expected Time of Arrival",
									"definition": "The date that the goods will arrive in Barbados."
								},
								{
									"id": 33,
									"field": "consigments",
									"display": "Number of Consignments",
									"definition": ""
								},
								{
									"id": 34,
									"field": "intendedUse",
									"display": "Intended use",
									"definition": "",
									"options": ["Consumption","Processing","Sale Distribution","Sowing/Propagation","Other"]
								},
								{
									"id": 35,
									"field": "meansConveyance",
									"display": "Means of Conveyance",
									"definition": "",
									"options": ["Sea","Air","Mail","Personal Baggage"]
								},
								{
									"id": 36,
									"field": "vehicleBrand",
									"display": "Brand of Vehicle",
									"definition": "Make or Brand of vehicle"
								},
								{
									"id": 37,
									"field": "vehicleModel",
									"display": "Model of Vehicle",
									"definition": ""
								},
								{
									"id": 38,
									"field": "vehicleYear",
									"display": "Year of Vehicle",
									"definition": ""
								},
								{
									"id": 39,
									"field": "vehicleEngine",
									"display": "Engine capacity",
									"definition": "Engine capacity of vehicle"
								},
								{
									"id": 40,
									"field": "odometer",
									"display": "Odometer (Kms)",
									"definition": "Odometer reading in kilometers",
									"datatype": "String"
								},
								{
									"id": 41,
									"field": "vehicleCase",
									"display": "Application for",
									"definition": "Select type of application",
									"datatype": "Dropdown"
								},
								{
									"id": 42,
									"field": "displayDescription",
									"display": "Display Description",
									"definition": "Description about the display including dates and location of event",
									"datatype": "Text"
								},
								{
									"id": 43,
									"field": "displayRisponsible",
									"display": "Display Risponsible",
									"definition": "Who will be in charge of the display",
									"datatype": "Text"
								},
								{
									"id": 44,
									"field": "contactInspection",
									"display": "Contact for Inspection",
									"definition": "Person name, contact information and locations to inspect",
									"datatype": "Text"
								},
								{
									"id": 50,
									"field": "containerNumber",
									"display": "Container Number",
									"definition": ""
								},
								{
									"id": 51,
									"field": "inspectionPlace",
									"display": "Place of Inspection",
									"definition": "The place of inspection."
								},
								{
									"id": 59,
									"field": "useByDescription",
									"display": "To be used by",
									"definition": "Description about to whom would you like permition to use by"
								},
								{
									"id": 60,
									"field": "attachment",
									"display": "Attachment Letter",
									"definition": "Please attach any document required"
								},
								{
									"id": 61,
									"field": "endUsers",
									"display": "Users",
									"definition": "List employees or other personel whom will be end users of the equipment"
								},
								{
									"id": 62,
									"field": "contracts",
									"display": "Contracts",
									"definition": "List clients or contacts to whom you provide services"
								},
								{
									"id": 63,
									"field": "nameAgency",
									"display": "Name of Agency",
									"definition": ""
								},
								{
									"id": 64,
									"field": "registrationAgency",
									"display": "Registration of Agency",
									"definition": ""
								},
								{
									"id": 65,
									"field": "addressAgency",
									"display": "Address of Agency",
									"definition": ""
								},
								{
									"id": 66,
									"field": "numberOfGuards",
									"display": "Number of Guards",
									"definition": ""
								},
								{
									"id": 67,
									"field": "numberOfFirearms",
									"display": "Number of Firearms",
									"definition": ""
								},
								{
									"id": 68,
									"field": "typesFirearms",
									"display": "types of Firearms",
									"definition": ""
								},
								{
									"id": 69,
									"field": "reasonDesiringFirearms",
									"display": "Reason(s) for desiring to have firearms",
									"definition": ""
								},
								{
									"id": 70,
									"field": "previousApplication",
									"display": "Any previous application(s)",
									"definition": ""
								},
								{
									"id": 71,
									"field": "numberFirearmsAlreadyIssued",
									"display": "Firearms already issued",
									"definition": "Number of firearms for which licences have already been issued"
								},
								{
									"id": 72,
									"field": "arrangementsTrainingGuards",
									"display": "Arrangements Training Guards",
									"definition": "arrangements made for training of guards who be required to use a firearm"
								},
								{
									"id": 73,
									"field": "otherTypesInstruments",
									"display": "Other types of instrument",
									"definition": "other types of instrument of defence"
								},
								{
									"id": 74,
									"field": "reasonDesiringOtherInstruments",
									"display": "Reason of other instrument",
									"definition": "reason(s) for desiring to have other types of instrument of defence"
								},
								{
									"id": 75,
									"field": "destinationCountry",
									"fieldtype":"Dropdown",
									"display": "Destination Country",
									"definition": "Destination Country to Export to"
								},
								{
									"id": 76,
									"field": "observations",
									"fieldtype":"Text",
									"display": "Observations",
									"definition": ""
								},
								{
									"id": 77,
									"field": "fobValue",
									"display": "FOB Value (US$)",
									"definition": "In US Dollars"
								},
								{
									"id": 78,
									"field": "preferenceCriterion",
									"display": "Preference Criterion",
									"definition": ""
								},
								{
									"id": 79,
									"field": "inFreeTradeZone",
									"display": "Manufacturer premises located in Free Trade Zone",
									"definition": "whether Producer is located in the Free Zone"
								},
								{
									"id": 80,
									"field": "tradedSpecial",
									"display": "Traded under Special Arrangements",
									"definition": "Whether the good is on the list in Annex III.04.06 to be traded under Special Arrangements"
								},
								{
									"id": 81,
									"field": "othersAnnex",
									"display": "Others Annex",
									"definition": "Others: if in determining the origin of the good one of the procedures set forth in Articles 1V.06 or IV.05 of the Agreement, was used, indicate:"
								},
								{
									"id": 82,
									"field": "grossWeight",
									"display": "Gross Weight",
									"definition": "Indicate the Gross Weight of the Goods in Kilograms (kg)."
								},
								{
									"id": 83,
									"field": "rulesOrigin",
									"display": "Rules of Origin",
									"definition": "Enter the criteria of origin applicable to each of the goods included."
								},
								{
									"id": 84,
									"field": "portShipment",
									"display": "Port of Shipment",
									"definition": "Indicate Port of Shipment."
								},
								{
									"id": 85,
									"field": "modeTransport",
									"display": "Mode of Transportation",
									"definition": "Mode of Transportation"
								},
								{
									"id": 86,
									"field": "routeTransport",
									"display": "Route",
									"definition": "Route of Transportation"
								},
								{
									"id": 87,
									"field": "invoiceNumber",
									"display": "Invoice Number",
									"definition": "Enter the Number of the Commercial Invoice."
								},
								{
									"id": 88,
									"field": "invoiceDate",
									"display": "Invoice Date",
									"definition": "Enter the Date of the Commercial Invoice."
								},
								{
									"id": 89,
									"field": "portDischarge",
									"display": "Port of Discharge",
									"definition": "Indicate Port of Discharge."
								},
								{
									"id": 90,
									"field": "periodRequestStart",
									"display": "Period Starting",
									"definition": "Period Starting of Request"
								},
								{
									"id": 91,
									"field": "periodRequestEnding",
									"display": "Period Ending",
									"definition": "Period Ending of Request"
								},
								{
									"id": 92,
									"field": "requestType",
									"display": "Type of Request",
									"definition": "Request Type (New Request/Renewal)"
								},
								{
									"id": 93,
									"field": "previousNumber",
									"display": "Previous Number",
									"definition": "Previous Permit Number"
								},
								{
									"id": 94,
									"field": "previousExpiration",
									"display": "Date Expired",
									"definition": "Expiration date of previous permit"
								},
								{
									"id": 95,
									"field": "approvalNumber",
									"display": "Approval Number",
									"definition": "Number of Approval Document"
								},
								{
									"id": 96,
									"field": "receptionDate",
									"display": "Date Received",
									"definition": ""
								},
								{
									"id": 97,
									"field": "issuedDate",
									"display": "Date Issued",
									"definition": ""
								},
								{
									"id": 98,
									"field": "approvedBy",
									"display": "Approved By",
									"definition": ""
								},
								{
									"id": 99,
									"field": "inspectionLocation",
									"display": "Inspection Location",
									"definition": ""
								},
								{
									"id": 100,
									"field": "inspectionDate",
									"display": "Date Inspection",
									"definition": ""
								},
								{
									"id": 101,
									"field": "inspector",
									"display": "Inspector",
									"definition": ""
								},
								{
									"id": 102,
									"field": "inspector",
									"display": "Inspector",
									"definition": ""
								},
								{
									"id": 103,
									"field": "typeFoodCategory",
									"display": "Food Category",
									"definition": ""
								},
								{
									"id": 104,
									"field": "typeFoodDetail",
									"display": "Food Type",
									"definition": ""
								},
								{
									"id": 105,
									"field": "consignee",
									"display": "Consignee",
									"definition": ""
								},
								{
									"id": 106,
									"field": "vessel",
									"display": "Vessel",
									"definition": ""
								},
								{
									"id": 107,
									"field": "rotationNumber",
									"display": "Rotation Number",
									"definition": ""
								},
								{
									"id": 108,
									"field": "dateInspection",
									"display": "Date of Inspection",
									"definition": ""
								},
								{
									"id": 109,
									"field": "timeInspection",
									"display": "Time of Inspection",
									"definition": ""
								},
								{
									"id": 110,
									"field": "entryDate",
									"display": "Entry Date",
									"definition": ""
								},
								{
									"id": 111,
									"field": "species",
									"display": "Species",
									"definition": ""
								},
								{
									"id": 112,
									"field": "breed",
									"display": "Breed",
									"definition": ""
								},
								{
									"id": 113,
									"field": "age",
									"display": "Age (years)",
									"definition": ""
								},
								{
									"id": 114,
									"field": "sex",
									"display": "M/F",
									"definition": ""
								},
								{
									"id": 115,
									"field": "microchipNum",
									"display": "Microchip Number",
									"definition": ""
								},
								{
									"id": 116,
									"field": "currencyType",
									"display": "Currency",
									"definition": "Choose the applicable currency"
								}
							]
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
			templateUrl: '/Forms/forms/views/partials/view-commodities2.html'
		}
	}])

	.directive('editCommodities', [function(){
		return{
			restrict: 'A',
			replace: true,
			templateUrl: '/Forms/forms/views/partials/edit-commodities2.html'
		}
	}])
	.directive('editCommoditiesCostaRica', [function(){
		return{
			restrict: 'A',
			replace: true,
			templateUrl: '/Forms/forms/views/partials/edit-commodities-costa-rica.html'
		}
	}])
	.directive('editCommoditiesColombia', [function(){
		return{
			restrict: 'A',
			replace: true,
			templateUrl: '/Forms/forms/views/partials/edit-commodities-colombia.html'
		}
	}])
	.directive('editCommoditiesCuba', [function(){
		return{
			restrict: 'A',
			replace: true,
			templateUrl: '/Forms/forms/views/partials/edit-commodities-cuba.html'
		}
	}])
	.directive('editCommoditiesVenezuela', [function(){
		return{
			restrict: 'A',
			replace: true,
			templateUrl: '/Forms/forms/views/partials/edit-commodities-venezuela.html'
		}
	}])
	.directive('editCommoditiesCaribbeanCm', [function(){
		return{
			restrict: 'A',
			replace: true,
			templateUrl: '/Forms/forms/views/partials/edit-commodities-caribbean-cm.html'
		}
	}])
	.directive('editCommoditiesProductsFood', [function(){
		return{
			restrict: 'A',
			replace: true,
			templateUrl: '/Forms/forms/views/partials/edit-commodities-products-food.html'
		}
	}])
	.directive('editCommoditiesRulesOrigin', [function(){
		return{
			restrict: 'A',
			replace: true,
			templateUrl: '/Forms/forms/views/partials/edit-commodities-rules-origin.html'
		}
	}])

	.directive('viewCommoditiesProductsFood', [function(){
		return{
			restrict: 'A',
			replace: true,
			templateUrl: '/Forms/forms/views/partials/view-commodities-products-food.html'
		}
	}])
	.directive('viewCommoditiesCostaRica', [function(){
		return{
			restrict: 'A',
			replace: true,
			templateUrl: '/Forms/forms/views/partials/view-commodities-costa-rica.html'
		}
	}])
	.directive('viewCommoditiesColombia', [function(){
		return{
			restrict: 'A',
			replace: true,
			templateUrl: '/Forms/forms/views/partials/view-commodities-colombia.html'
		}
	}])
	.directive('viewCommoditiesCuba', [function(){
		return{
			restrict: 'A',
			replace: true,
			templateUrl: '/Forms/forms/views/partials/view-commodities-cuba.html'
		}
	}])
	// .directive('viewCommoditiesBds', [function(){
	// 	return{
	// 		restrict: 'A',
	// 		replace: true,
	// 		templateUrl: '/Forms/forms/views/partials/view-commodities-bds.html'
	// 	}
	// }])
	.directive('viewCommoditiesVenezuela', [function(){
		return{
			restrict: 'A',
			replace: true,
			templateUrl: '/Forms/forms/views/partials/view-commodities-venezuela.html'
		}
	}])
	.directive('viewCommoditiesCaribbeanCm', [function(){
		return{
			restrict: 'A',
			replace: true,
			templateUrl: '/Forms/forms/views/partials/view-commodities-caribbean-cm.html'
		}
	}])
	.directive('viewCommoditiesRulesOrigin', [function(){
		return{
			restrict: 'A',
			replace: true,
			templateUrl: '/Forms/forms/views/partials/view-commodities-rules-origin.html'
		}
	}])
	.directive('viewCommoditiesNoPrice', [function(){
		return{
			restrict: 'A',
			replace: true,
			templateUrl: '/Forms/forms/views/partials/view-commodities-no-price.html'
		}
	}])
	.directive('viewCommoditiesWithFields', [function(){
		return{
			restrict: 'A',
			replace: true,
			templateUrl: '/Forms/forms/views/partials/view-commodities-with-fields.html'
		}
	}])

	// .directive('viewCommoditiesWithFields', [function(){
	// 	return{
	// 		restrict: 'A',
	// 		replace: true,
	// 		templateUrl: './forms/views/partials/view-commodities-with-fields.html'
	// 	}
	// }])

	.directive('editCommoditiesNoPrice', [function(){
		return{
			restrict: 'A',
			replace: true,
			templateUrl: '/Forms/forms/views/partials/edit-commodities-no-price.html'
		}
	}])

	.directive('editCommoditiesAnimals', [function(){
		return{
			restrict: 'A',
			replace: true,
			templateUrl: '/Forms/forms/views/partials/edit-commodities-animals.html'
		}
	}])

	.directive('editCommoditiesWithFields', [function(){
		return{
			restrict: 'A',
			replace: true,
			templateUrl: '/Forms/forms/views/partials/edit-commodities-with-fields.html',
	    // scope : {
	    //   item : "="
	    // },
			link: function(scope, elem, attrs){
		    // scope.entries = 5;
		    // item.entries = [];
		    scope.updateEntries = function (item) {
		        item.entries = [];
		        for (var i = 0; i < item.quantity; i++) {
		            item.entries.push({});
		        }
		    };
		    // scope.upateEntries();
			}
		}
	}])

	.directive('editCommodities3', [function(){
		return{
			restrict: 'A',
			replace: true,
			templateUrl: '/Forms/forms/views/partials/edit-commodities3.html'
		}
	}])

	.directive('validateCommodities', [function(){
		return{
			restrict: 'A',
			replace: true,
			templateUrl: '/Forms/forms/views/partials/validate-commodities.html'
		}
	}])

	.directive('labelValue', [function() {
	    return {
	        restrict: 'E',
	        replace: true,
					templateUrl: '/Forms/forms/views/partials/label-value.html',
	        scope: {
	            label: "=",
	            value: "="
	        }
	    };
	}])

	.directive('fieldName', ['$filter', function($filter){
		return{
			restrict: 'A',
			replace: true,
			scope: {
				id: '@fieldName',
				fields: '=formFields',
				tt: '@fieldTooltip',
				readonly: '=readonly',
				withAddress: '=withAddress',
				datatype: '=datatype',
				fieldtype: '=fieldtype',
				ila: '=ila',
				form: '=form',
				options: '=options',
				item: '=item'
			},
			link: function(scope, elem, attrs){
				// console.log(scope);
				scope.fields = scope.fields || scope.form.options.formFields;
				scope.field = $filter('filter')(scope.fields, {id: parseInt(scope.id)}, true)[0];
				scope.field.options = scope.field.options || scope.options
				if(scope.tt && scope.tt.toLowerCase() == 'true') scope.field.tooltip = true;
				scope.getContentUrl = function() {
					if (scope.field.withAddress || scope.withAddress)
						return '/Forms/forms/views/partials/field-name-readonly-with-address.html';
					else if (scope.field.readonly || scope.readonly)
						return '/Forms/forms/views/partials/field-name-readonly.html';
					else if ((scope.field.fieldtype == "Dropdown" || scope.fieldtype == "Dropdown") && (scope.field.id == 8))
							return '/Forms/forms/views/partials/field-name-select-supplier.html';
					else if (scope.field.fieldtype == "Dropdown" || scope.fieldtype == "Dropdown")
						return '/Forms/forms/views/partials/field-name-select.html';
					else if (scope.field.options)
						return '/Forms/forms/views/partials/field-name-radio-options.html';
					else if (scope.field.datatype == "String" || scope.datatype == "String")
						return '/Forms/forms/views/partials/field-name-string.html';
					else if (scope.field.datatype == "Text" || scope.datatype == "Text")
						return '/Forms/forms/views/partials/field-name-text.html';
					else if (scope.field.datatype == "Date" || scope.datatype == "Date")
						return '/Forms/forms/views/partials/field-name-date.html';
					else {
						return '/Forms/forms/views/partials/field-name.html';
					}
        }
			},
			template: '<div ng-include="getContentUrl()"></div>'
		}
	}])

	.filter('sum', function() {
     return function(groups, index) {
         var total = 0;
         for (i=0; i<groups.length; i++) {
             total = total + groups[i].units[index].quantity;
          };
         return total;
     };
 	})

	.filter('totalCif', function() {
		 return function(c) {
				 var total = 0;
				 for (i=0; i<c.length; i++) {
						 total = total + c[i].units[0].cifValue;
					};
				 return total;
		 };
	})

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
