app.controller('StatisticTabCtrl', function($scope, $state, $ionicSideMenuDelegate, $ionicTabsDelegate, $timeout) {

  $scope.charts = {
    'ratingByDate': {}
  }
  //console.log($scope.charts.ratingByDate.data)

  $scope.ratingByDateReloadChart = function(result) {
    $scope.charts.ratingByDate.options = {
                chart: {
                    type: 'stackedAreaChart',
                    height: 450,
                    margin : {
                        top: 20,
                        right: 20,
                        bottom: 40,
                        left: 70
                    },
                    zoom : {
                      enabled: true,
                      scaleExtent: [1,10],
                      useFixedDomain: false,
                      useNiceScale: false,
                      horizontalOff: false,
                      verticalOff: true,
                      unzoomEventType: "dblclick.zoom",
                    },
                    showControls: false,
                    showLegend: false,
                    forceY: 1500,
                    interpolate: "bundle", //http://www.d3noob.org/2013/01/smoothing-out-lines-in-d3js.html
                    x: function(d){ return d.x; },
                    y: function(d){ return d.y; },
                    useInteractiveGuideline: true,
                    dispatch: {
                        stateChange: function(e){ console.log("stateChange"); },
                        changeState: function(e){ console.log("changeState"); },
                        tooltipShow: function(e){ console.log("tooltipShow"); },
                        tooltipHide: function(e){ console.log("tooltipHide"); }
                    },
                    xAxis: {
                        axisLabel: 'Date',
                        tickFormat: function(d) {
                            console.log(d)
                            //console.log(new Date(d))
                            return d3.time.format('%y/%m/%d')(new Date(d))
                        },
                    },
                    yAxis: {
                        axisLabel: 'Elo rating',
                        tickFormat: function(d){
                            return d3.format('.d')(d);
                        },
                        axisLabelDistance: -10
                    },
                    callback: function(chart){
                        console.log("!!! lineChart callback !!!");
                    }
                }
    };


    var data1 = result.data["rating-statistic"].map(function(elem){
      return {x:new Date(elem[0]), y:elem[1]}
    }).sort(function(a,b) {
      return b.x - a.x;
    })

    console.log(data1)
    $scope.charts.ratingByDate.data = [
              {
                  values: data1,      //values - represents the array of {x,y} data points
                  key: 'JackalSh'//, //key  - the name of the series.
                  //color: '#0000FF'  //color - optional: choose your own line color.
              }];

    console.log($scope.charts.ratingByDate)
  }

  $scope.reloadStatisticTab = function() {

    api.user.ratingByDate({
      token: $scope.token(),
      username: "JackalSh",
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

  }
})
