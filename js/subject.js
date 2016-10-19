/**
 * Created by 蔡树祥 on 2016/9/22.
 * 题库模块
 */
angular.module("app.subjectModule",["ng"])
    .controller("subjectDelController",["$routeParams","$location","subjectService",function ($routeParams,$location,subjectService){
        subjectService.delSubject($routeParams.id,function (data) {
            alert(data);
            $location.path("/SubjectList/dpId/0/topicId/0/levelId/0/typeId/0");
        });

    }])
    .controller("subjectCheckController",["$routeParams","$location","subjectService",function ($routeParams,$location,subjectService){
        subjectService.checkSubject($routeParams.id,$routeParams.state,function (data) {
            alert(data);
            $location.path("/SubjectList/dpId/0/topicId/0/levelId/0/typeId/0");
        });

    }])
    .controller("subjectController",["$scope","commentService","subjectService","$filter","$routeParams","$location",function ($scope,commentService,subjectService,$filter,$routeParams,$location){
        $scope.param = $routeParams;
        //封装筛选数据时用的模板对象
        var subjectModel = (function () {
            var obj = {};
            if($routeParams.typeId!=0){
                obj['subject.subjectType.id'] = $scope.param.typeId;
            }
            if($routeParams.dpId!=0){
                obj['subject.department.id'] = $scope.param.dpId;
            }
            if($routeParams.topicId!=0){
                obj['subject.topic.id'] = $scope.param.topicId;
            }
            if($routeParams.levelId!=0){
                obj['subject.subjectLevel.id'] = $scope.param.levelId;
            }
            return obj;
        })();
        $scope.model={
            typeId:1,
            levelId:1,
            topicId:1,
            departmentId:1,
            stem:"",
            answer:"",
            analysis:"",
            choiceContent:[],
            choiceCorrect:[false,false,false,false]
        };
        commentService.getAllType(function (data) {
            $scope.types = data;
        });
        commentService.getAllDepartments(function (data) {
            $scope.departments = data;
        });
        commentService.getAllTopics(function (data) {
            $scope.topics = data;
        });
        commentService.getAllLevels(function (data) {
            $scope.levels = data;
        });



        //调用subjectService获取所有题目信息
        subjectService.getAllSubjects(subjectModel,function (data) {
            //遍历所有题目，计算出正确答案，并赋给空answer
          $scope.subjects = data;
            data.forEach(function (subject) {
                if(subject.subjectType&&subject.subjectType.id!=3){
                    var answer = [];
                    subject.choices.forEach(function (choice,index) {
                        if(choice.correct){
                            //将正确答案的索引值 转成ABCD
                            var no = $filter('numToLetter')(index);
                            answer.push(no);
                        }
                    });
                    subject.answer = answer.toString();
                }
            });
        });


        $scope.add = function () {
            //调用subjectService保存题目信息
            subjectService.saveSubject($scope.model,function (data) {
                //console.log(data);
            });
            var model={
                typeId:1,
                levelId:1,
                topicId:1,
                departmentId:1,
                stem:"",
                answer:"",
                analysis:"",
                choiceContent:[],
                choiceCorrect:[false,false,false,false]
            };
            //重置$scope
            angular.copy(model,$scope.model);
        };
        $scope.addAndClose = function () {
            subjectService.saveSubject($scope.model,function (data) {
                //console.log(data);
            });
            $location.path("/SubjectList/dpId/0/topicId/0/levelId/0/typeId/0");
        }

    }])

    .service("subjectService",["$http","$httpParamSerializer",function ($http,$httpParamSerializer) {
      this.getAllSubjects = function (param,handler){
          $http.get("http://172.16.0.5:7777/test/exam/manager/getAllSubjects.action",{
          //$http.get("data/subjects.json",{
              param:param
          }).success(function (data) {
              handler(data);
          });
      };
      //保存数据函数
      this.saveSubject = function (params,handler) {
          var obj = {};
          for(var key in params){
              var val = params[key];
              switch (key){
                  case "typeId":
                      obj['subject.subjectType.id']=val;
                      break;
                  case "levelId":
                      obj['subject.subjectLevel.id']=val;
                      break;
                  case "departmentId":
                      obj['subject.department.id']=val;
                      break;
                  case "topicId":
                      obj['subject.topic.id']=val;
                      break;
                  case "stem":
                      obj['subject.stem']=val;
                      break;
                  case "answer":
                      obj['subject.answer']=val;
                      break;
                  case "analysis":
                      obj['subject.analysis']=val;
                      break;
                  case "choiceContent":
                      obj['choiceContent']=val;
                      break;
                  case "choiceCorrect":
                      obj['choiceCorrect']=val;
                      break;
              }
          }
          //将对象数据转换为表单编码样式的数据
          obj = $httpParamSerializer(obj);
          $http.post("http://172.16.0.5:7777/test/exam/manager/saveSubject.action",obj,{
              headers:{
                  "Content-Type":"application/x-www-form-urlencoded"
              }
          }).success(function (data) {
              handler(data);
          });
      };
      this.delSubject = function (id,handler){
          $http.get("http://172.16.0.5:7777/test/exam/manager/delSubject.action",{
                params:{
                    'subject.id':id
                }
          }).success(function (data) {
              handler(data);
          })
      };
      this.checkSubject = function (id,state,handler){
            $http.get("http://172.16.0.5:7777/test/exam/manager/checkSubject.action",{
                params:{
                    'subject.id':id,
                    'subject.checkState': state
                }
            }).success(function (data) {
                handler(data);
            })
        };
    }])
    .filter("topicsAccordingDepart",function () {
        return function (input,id) {
            //console.log(input);
            if(input){
                return input.filter(function (item,index) {
                    return item.department.id ==id;
                });
            }
        }
    })

    .filter("numToLetter",function () {
        //过滤器 功能：将题目选项的对应的index值转为ABCD
        return function (input) {
        return input==0?'A':(input==1?'B':(input==2?'C':'D'));
        }
    })
    .provider("commentService",function () {
        /*this.url = "";
        this.setUrl = function (url) {
            this.url = url;
        };*/
        this.$get = function ($http) {
            //var self = this;
            return{
                getAllType:function (handler) {
                    //$http.get("http://172.16.0.5:7777/test/exam/manager/getAllSubjectType.action").success(function (data) {
                   $http.get("data/types.json").success(function (data) {
                        handler(data);
                    });
                },
                getAllDepartments:function (handler) {
                    //$http.get("http://172.16.0.5:7777/test/exam/manager/getAllDepartmentes.action").success(function (data) {
                    $http.get("data/departments.json").success(function (data) {
                        handler(data);
                    });
                },
                getAllTopics:function (handler) {
                    //$http.get("http://172.16.0.5:7777/test/exam/manager/getAllTopics.action").success(function (data) {
                    $http.get("data/topics.json").success(function (data) {
                        handler(data);
                    });
                },
                getAllLevels:function (handler) {
                    //$http.get("http://172.16.0.5:7777/test/exam/manager/getAllSubjectLevel.action").success(function (data) {
                   $http.get("data/levels.json").success(function (data) {
                        handler(data);
                    });
                }
            };
        };
    })
    //指令 操作Dom,选项按钮发生变化，拿值并将值赋给answer
    .directive("selectOption",function () {
        return{
            restrict:"A",
            link:function (scope,element) {
                console.log(element);
                element.on("change",function () {
                    var type = element.attr("type");
                    var ischeck = element.prop("checked");
                    if(type=="radio"){
                        scope.model.choiceCorrect=[false,false,false,false];
                        var index = angular.element(this).val();
                        scope.model.choiceCorrect[index]=true;
                    }else if(type=="checkbox"&&ischeck){
                        //scope.model.choiceCorrect=[false,false,false,false];
                        var index = angular.element(this).val();
                        scope.model.choiceCorrect[index]=true;
                    }
                    //强制将scope更新
                    scope.$digest();
                });



            }
        }
    });

