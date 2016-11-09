app.controller('StatisticTabCtrl', function($scope, $state, $ionicSideMenuDelegate, $ionicTabsDelegate, $timeout) {

  $scope.charts = {
    'ratingByDate': {},
    'blundersByDate': {}
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
                        left: 70
                    },
                    showControls: false,
                    showLegend: false,
                    forceY: 1500,
                    interpolate: "cardinal", //http://www.d3noob.org/2013/01/smoothing-out-lines-in-d3js.html
                    x: function(d){ return d.x; },
                    y: function(d){ return d.y; },
                    useInteractiveGuideline: false,
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
                      type: 'stackedAreaChart',
                      height: 250,
                      margin : {
                          top: 20,
                          right: 20,
                          bottom: 40,
                          left: 70
                      },
                      showControls: false,
                      showLegend: false,
                      interpolate: "cardinal", //http://www.d3noob.org/2013/01/smoothing-out-lines-in-d3js.html
                      x: function(d){ return d.x; },
                      y: function(d){ return d.y; },
                      useInteractiveGuideline: false,
                      showControls: true,
                      controlOptions: ['Stacked', 'Expanded'],
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
    console.log($scope.charts.blundersByDate.data)
  }

  $scope.GGG = function() {
    console.log($scope.charts.blundersByDate.data)
  }

  $scope.reloadStatisticTab = function() {

    api.user.ratingByDate({
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
      }
    });

    api.user.blundersByDate({
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
      }
    });

  }
})
