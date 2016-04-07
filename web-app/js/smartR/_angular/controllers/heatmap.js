//# sourceURL=heatmap.js

function HeatmapController($scope, commonWorkflowService) {

    commonWorkflowService.initializeWorkflow('heatmap', $scope);

    // ------------------------------------------------------------- //
    // Fetch data                                                    //
    // ------------------------------------------------------------- //
    $scope.fetch = {
        conceptBoxes: {
            highDimensional: [],
            numerical: [],
            categorical: []
        },
        disabled: false,
        running: false,
        loaded: false,
        selectedBiomarkers: [],
        scriptResults: {},
        totalSamples: 0,
        subsets: 0
    };

    // ------------------------------------------------------------- //
    // Preprocess                                                    //
    // ------------------------------------------------------------- //
    $scope.preprocess = {
        params:  {
            aggregateProbes: false
        },
        disabled: true,
        running: false,
        scriptResults: {}
    };

    // ------------------------------------------------------------- //
    // Run Heatmap                                                   //
    // ------------------------------------------------------------- //
    $scope.runAnalysis = {
        params: {
            max_row: 100,
            sorting: 'nodes',
            ranking: 'coef'
        },
        download: {
            disabled: true
        },
        disabled: true,
        running: false,
        subsets: 0,
        scriptResults: {}
    };

    $scope.$watchGroup(['fetch.running', 'preprocess.running', 'runAnalysis.running'],
        function(newValues) {
            var fetchRunning = newValues[0],
                preprocessRunning = newValues[1],
                runAnalysisRunning = newValues[2];

            // clear old results
            if (fetchRunning) {
                $scope.preprocess.scriptResults = {};
                $scope.runAnalysis.scriptResults = {};
            }

            // clear old results
            if (preprocessRunning) {
                $scope.runAnalysis.scriptResults = {};
            }

            // disable tabs when certain criteria are not met
            $scope.fetch.disabled = preprocessRunning || runAnalysisRunning;
            $scope.preprocess.disabled = fetchRunning || runAnalysisRunning || !$scope.fetch.loaded
                || $scope.fetch.totalSamples <= 1;
            $scope.runAnalysis.disabled = fetchRunning || preprocessRunning || !$scope.fetch.loaded;

            // disable buttons when certain criteria are not met
            $scope.runAnalysis.download.disabled = runAnalysisRunning || $.isEmptyObject($scope.runAnalysis.scriptResults);

            // set ranking criteria
            $scope.runAnalysis.subsets = $scope.fetch.subsets;
            if ($scope.fetch.totalSamples < 2) {
                $scope.runAnalysis.params.ranking = 'mean';
            } else if ($scope.fetch.subsets < 2) {
                $scope.runAnalysis.params.ranking = 'coef';
            } else if ($scope.fetch.subsets > 1 &&
                    ['logfold', 'bval', 'pval', 'adjpval', 'ttest'].indexOf($scope.runAnalysis.params.ranking) === -1) {
                $scope.runAnalysis.params.ranking = 'bval';
            }
        }
    );
}

window.smartRApp.controller('HeatmapController',
    ['$scope', 'smartRUtils', 'commonWorkflowService', HeatmapController]);
