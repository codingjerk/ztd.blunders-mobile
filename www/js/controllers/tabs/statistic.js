"use strict";

app.controller('StatisticTabCtrl', function($scope, $state, $ionicSideMenuDelegate, $ionicTabsDelegate, $timeout) {

  $scope.charts = {
    'ratingByDate': {},
    'blundersByDate': {},
    'blundersCount': {}
  }

  $scope.ratingByDateReloadChart = function(result) {
    $scope.charts.ratingByDate.options = {
                chart: {
                    type: 'stackedAreaChart',
                    height: 250,
                    margin : {
                        top: 20,
                        right: 20,
                        bottom: 40,
                        left: 50
                    },
                    showControls: false,
                    showLegend: false,
                    forceY: 1500,
                    interpolate: "Linear", //http://www.d3noob.org/2013/01/smoothing-out-lines-in-d3js.html
                    x: function(d){ return d.x; },
                    y: function(d){ return d.y; },
                    xAxis: {
                        axisLabel: 'Date',
                        showMaxMin: false,
                        tickFormat: function(d) {
                            return d3.time.format('%b %d')(new Date(d))
                        },
                    },
                    yAxis: {
                        axisLabel: 'Elo rating',
                        tickFormat: function(d){
                            return d3.format('d')(d);
                        },
                        axisLabelDistance: -10
                    }
                }
      };

      var series = result.data["rating-statistic"].map(function(elem){
        return {x:new Date(elem[0]), y:elem[1]}
      })

      $scope.charts.ratingByDate.data = [
                {
                    values: series,      //values - represents the array of {x,y} data points
                    //key: 'JackalSh'//, //key  - the name of the series.
                    //color: '#0000FF'  //color - optional: choose your own line color.
                }];
    }

    $scope.blundersByDateReloadChart = function(result) {
      $scope.charts.blundersByDate.options = {
                  chart: {
                      type: "multiBarChart",
                      height: 250,
                      margin : {
                          top: 20,
                          right: 20,
                          bottom: 40,
                          left: 50
                      },
                      clipEdge: true,
                      stacked: true,
                      showControls: true,
                      showLegend: false,
                      xAxis: {
                          axisLabel: 'Date',
                          showMaxMin: false,
                          tickFormat: function(d) {
                              return d3.time.format('%b %d')(new Date(d))
                          },
                      },
                      yAxis: {
                          axisLabel: 'Number of blunders',
                          tickFormat: function(d){
                              return d3.format('d')(d);
                          },
                          axisLabelDistance: -10
                      }
                    }
      };


    var seriesSolved = result.data["blunder-count-statistic"].solved.map(function(elem){
      return {x:new Date(elem[0]), y:elem[1]}
    })

    var seriesFailed = result.data["blunder-count-statistic"].failed.map(function(elem){
      return {x:new Date(elem[0]), y:elem[1]}
    })

    $scope.charts.blundersByDate.data = [
              {
                  values: seriesSolved,      //values - represents the array of {x,y} data points
                  key: 'Succesful solved'//, //key  - the name of the series.
                  //color: '#0000FF'  //color - optional: choose your own line color.
              },
              {
                  values: seriesFailed,      //values - represents the array of {x,y} data points
                  key: 'Failed to solve',//, //key  - the name of the series.
                  color: '#DD0000'  //color - optional: choose your own line color.
              }];
  }

  $scope.reloadStatisticTab = function() {

    buffer.user.ratingByDate({
      token: $scope.token(),
      interval: 'last-month',
      onSuccess: function(result) {
        if (result.status !== 'ok') {
          return $scope.processError(result);
        }
        $timeout(function(){ $scope.ratingByDateReloadChart(result) })
      },
      onFail: function(result) {
        notify.error("Can't connect to server.<br>Check your connection");
      },
      onAnimate: function(state) {
        $scope.triggerSemaphore({
          networkBusy: state
        })
      }
    });

    buffer.user.blundersByDate({
      token: $scope.token(),
      interval: 'last-month',
      onSuccess: function(result) {
        if (result.status !== 'ok') {
          return $scope.processError(result);
        }
        $timeout(function(){ $scope.blundersByDateReloadChart(result) })
      },
      onFail: function(result) {
        notify.error("Can't connect to server.<br>Check your connection");
      },
      onAnimate: function(state) {
        $scope.triggerSemaphore({
          networkBusy: state
        })
      }
    });

    buffer.user.blundersCount({
      token: $scope.token(),
      onSuccess: function(result) {
        if (result.status !== 'ok') {
          return $scope.processError(result);
        }
        $timeout(function(){
          $scope.charts.blundersCount = result.data;
         })
      },
      onFail: function(result) {
        notify.error("Can't connect to server.<br>Check your connection");
      },
      onAnimate: function(state) {
        $scope.triggerSemaphore({
          networkBusy: state
        })
      }
    });

  }
})
