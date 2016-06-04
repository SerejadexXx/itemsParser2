var module = angular.module('indexApp');

module.config(function($stateProvider) {
    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: 'home/home.html',
            controller: 'homeCtrl'
        })
})
    .controller('homeCtrl', function($scope, $http, $rootScope) {
        $scope.accessCode = "2";
        $scope.currentPDFUrl = 'data/' + $scope.accessCode + '_data.pdf';

        $http.get('/data/json', {
            params: {
                accessCode: $scope.accessCode
            }
        }).then(
            function(res) {
                var data = JSON.parse(res.data);
                $scope.version = Number(data.version);
                $scope.imagesCount = Number(data.imgCount);
                $scope.items = data.values;
                $scope.displayImageNumber = 0;

                if (data.names) {
                    $scope.names = data.names;
                } else {
                    $scope.names = [];
                }

                if (data.imageList) {
                    $scope.imageList = data.imageList;
                } else {
                    $scope.imageList = [];
                    for (var i = 0; i < $scope.imagesCount; i++) {
                        $scope.imageList.push("data/" + $scope.accessCode + "_imgs/Img_" + (i + 1));
                    }
                }
            },
            function(err) {
                console.log(err);
            }
        );

        $scope.dataLoaded = 1;
        var SomethingUpdated = function() {
            $scope.version++;
            $scope.dataLoaded = 0;
            $http.post('/data/newData', {
                accessCode: $scope.accessCode,
                data: {
                    version: $scope.version,
                    values: $scope.items,
                    imgCount: $scope.imagesCount,
                    imageList: $scope.imageList,
                    names: $scope.names
                }
            }).then(
                function() {
                    $scope.dataLoaded = 1;
                },
                function(err) {
                    $scope.dataLoaded = 2;
                }
            );
        };
        $scope.UpdateToServer = function() {
            if (confirm("Отправить данные?")) {
                SomethingUpdated();
            }
        };

        var AddToHidden = function() {

        };
        var AddToList = function(color) {
            $scope.imageList.splice(0, 0, color);
            SomethingUpdated();
        };
        var RemoveFromList = function(index) {
            $scope.imageList.splice(index, 1);
            if ($scope.displayImageNumber >= $scope.imageList.length) {
                $scope.displayImageNumber = $scope.imageList.length - 1;
            }
            SomethingUpdated();
        };

        $scope.displayImageNumber = -1;
        $scope.imageList = [];

        $scope.HideImage = function() {
            if ($scope.displayImageNumber < 0) {
                return;
            }
            if (confirm("Скрыть изображение?")) {
                AddToHidden();
                RemoveFromList($scope.displayImageNumber);
            } else {
            }
        };



        $scope.NextImage = function() {
            if ($scope.displayImageNumber + 1 < $scope.imagesCount) {
                $scope.displayImageNumber++;
            }
        };
        $scope.PrevImage = function() {
            if ($scope.displayImageNumber - 1 >= 0) {
                $scope.displayImageNumber--;
            }
        };

        $scope.item = {
            code: ""
        };
        $scope.task = {
            type: 0,
            desc: ''
        };
        $scope.answer = {
            text: ''
        };

        $scope.NextTask = function() {
            var codeItem = $scope.items.filter(function(_item) {
                return _item.code == $scope.item.code;
            });
            if (codeItem.length == 0) {
                $scope.task.type = 1;
                $scope.task.desc = 'Код не найден';
                $scope.task.code = $scope.item.code;
                return;
            }
            /*
            var name = $scope.names.filter(function(_item) {
                return _item.code == $scope.item.code;
            });

            if (name.length == 0) {
                $scope.task.type = 2;
                $scope.task.desc = 'Скопируйте название возле кода';
                $scope.task.code = $scope.item.code;
                $scope.answer.text = '';
                return;
            }*/
            for (var i = 0; i < codeItem.length; i++) {
                if (!codeItem[i].colorUrl) {
                    $scope.task.type = 3;
                    $scope.task.desc = 'Найдите картинку, что соответсвует коду: '
                        + codeItem[i].colorDesc + '[' + codeItem[i].colorCode + ']';
                    $scope.task.code = $scope.item.code;
                    $scope.task.colorCode = codeItem[i].colorCode;
                    return;
                }
            }
            $scope.task.type = 4;
            $scope.task.desc = 'Все задания выполнены';
        };


        $scope.Answer = function() {
            if ($scope.task.type == 3) {
                $scope.items.filter(function(_item) {
                    return _item.code == $scope.task.code && _item.colorCode == $scope.task.colorCode;
                })[0].colorUrl = $rootScope.currentUrl;
                RemoveFromList($scope.displayImageNumber);
            }
            if ($scope.task.type == 2) {
                $scope.names.push({
                    code: $scope.task.code,
                    name: $scope.answer.text
                });
                SomethingUpdated();
            }

            $scope.task.type = 0;
            $scope.NextTask();
        };

        $scope.infoEnabled = false;
        $scope.info = {
            code: '',
            name: '',
            urls: [],
            complete: true,
            DeleteName: function() {
                $scope.info.complete = false;
                $scope.names = $scope.names.filter(function(_item) {
                    return _item.code != $scope.info.code;
                });
                $scope.info.name = '';
                SomethingUpdated();
            },
            ToUrl: function(url) {
                console.log("'url(" + url + ")'");
                return "'url(" + url + ")'";
            },
            RemoveImage: function(code, index) {
                $scope.info.complete = false;
                var color = $scope.items.filter(function(_item) {
                    return _item.code == $scope.info.code && _item.colorCode == code;
                })[0];
                AddToList(color.colorUrl);
                color.colorUrl = null;
                $scope.info.urls.splice(index, 1);
                SomethingUpdated();

            }
        };
        $scope.GetInfo = function() {
            var codeItem = $scope.items.filter(function(_item) {
                return _item.code == $scope.item.code;
            });
            if (codeItem.length == 0) {
                $scope.task.type = 1;
                $scope.task.desc = 'Код не найден';
                $scope.task.code = $scope.item.code;
                return;
            }
            $scope.info.code = $scope.item.code;
            var name = $scope.names.filter(function(_item) {
                return _item.code == $scope.item.code;
            });
            if (name.length != 0) {
                $scope.info.name = name[0].name;
                $scope.info.complete = true;
            } else {
                $scope.info.name = '';
                $scope.info.complete = false;
            }
            $scope.info.urls = [];
            for (var i = 0; i < codeItem.length; i++) {
                if (codeItem[i].colorUrl) {
                    $scope.info.urls.push({
                        code: codeItem[i].colorCode,
                        desc: codeItem[i].colorDesc,
                        url: codeItem[i].colorUrl
                    });
                } else {
                    $scope.info.complete = false;
                }
            }
            $scope.infoEnabled = true;
        };
        $scope.CloseInfo = function() {
            $scope.infoEnabled = false;
        };
    });