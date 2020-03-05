define([
  "underscore",
  "qlik",
  "core.utils/deferred",
], function ( _, qlik, Deferred ) {
  "use strict";

  return {
    definition: {
      type: "items",
      component: "accordion",
      items: {
        appearance: {
          uses: "settings",
          items: {
            test: {
              type: "items",
              label: "Config",
              items: {
                objId: {
                  ref: "objId",
                  label: "Object ID",
                  type: "string"
                }
              }
            }
          }
        }
      }
    },
    support: {
      export: false,
      exportData: false,
      snapshot: false
    },
    initialProperties: {},
    snapshot: {canTakeSnapshot: false},

    controller: ["$scope", "$element", function ( $scope, $element ) {
      var qlikApp, qlikSheetObj;

      $scope.jailbreak = function() {
        var qlikObjectId  = $scope.layout.objId;
        qlikApp
          .getObject( qlikObjectId )
          .then(function( qlikObject ){
            return qlikObject.getParent();
          })
          //.then(function (qlikSeet) {}, function (error) {console.log(error)});
          .then(function( qlikSheet ){
            qlikSheetObj = qlikSheet;
            return qlikSheet.getProperties();
          })
          .then(function( qlikSheetProperties ){
            qlikSheetProperties.cells = qlikSheetProperties.cells.map(function( cell ){
              if( cell.name == qlikObjectId ) {
                cell.row = 0;
                cell.col = 0;
                cell.bounds.x = 0;
                cell.bounds.y = 0;
              }
              return cell;
            })
            return Deferred.resolve( qlikSheetProperties )
          })
          .then( function(qlikSheetProperties){
            qlikSheetObj.setProperties( qlikSheetProperties );
          })
          .catch(function( err ){
            console.log(err);
          })
      }

      return {
        onInit: function() {
          qlikApp = qlik.currApp();
          return Deferred.resolve(true);
        }
      };
    }],

    template: '<button class="lui-button lui-button--block" ng-click="jailbreak()")> <span class="lui-button__text">Unchain Object with ID "<span class="CodeMirror">{{layout.objId}}</span>"</span> </button>'
  };
});