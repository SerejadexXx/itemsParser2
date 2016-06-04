var module = angular.module('indexApp', ['ui.router']);

module.config(function($urlRouterProvider) {
    $urlRouterProvider.otherwise("/home");
});
