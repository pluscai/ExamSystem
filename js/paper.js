/**
 * Created by 蔡树祥 on 2016/9/28.
 * 试卷模块
 */
angular.module("app.paperModule",["ng","app.subjectModule"])
    .controller("paperAddController",["$scope","commentService","$routeParams","paperModel","paperService",function ($scope,commentService,$routeParams,paperModel,paperService) {
        //调用app.subjectModule模块中的commentService服务，完成所属方向数据的加载
        commentService.getAllDepartments(function (data) {
            $scope.departments = data;
        });


        var id = $routeParams.id;
        //var ids = +$routeParams.ids;

        if(id!=0){
            paperModel.addSubjectId(id);
            paperModel.addSubject(angular.copy($routeParams));
        }
       // paperModel.model.subjects.filter(function (subject,index) {
          //  return subject.id==ids;
       // });
        $scope.model =paperModel.model;
    }])
    .factory("paperModel",function () {
        return{
            model:{
                dId:1,
                title:"",
                desc:"",
                tpoint:"",
                answerTime:"",
                subjectId:[],
                subjects:[],
                scores:[]
            },
            addSubjectId:function (id) {
                this.model.subjectId.push(id);
            },
            addSubject:function (subject) {
                this.model.subjects.push(subject);
            }
        };
    })
    //试卷服务
    .service("paperService",["$http","$httpParamSerializer",function ($http,$httpParamSerializer) {
        //保存试卷功能
        this.savePaper = function (params,handler) {
            var obj = {};
            for(var key in params){
                var val = params[key];
                switch (key){
                    case "dId":
                        obj['paper.department.id']=val;
                        break;
                    case "title":
                        obj['paper.title']=val;
                        break;
                    case "desc":
                        obj['paper.description']=val;
                        break;
                    case "tpoint":
                        obj['paper.totalPoints']=val;
                        break;
                    case "answerTime":
                        obj['paper.answerQuestionTime']=val;
                        break;
                    case "subjectId":
                        obj['subjectIds']=val;
                        break;
                    case "scores":
                        obj['scores']=val;
                        break;
                }
            }
            //将对象数据转换为表单编码样式的数据
            obj = $httpParamSerializer(obj);
            $http.post("http://172.16.0.5:7777/test/exam/manager/saveExamPaper.action",obj,{
                headers:{
                    "Content-Type":"application/x-www-form-urlencoded"
                }
            }).success(function (data) {
                handler(data);
            });
        };
    }])
    .controller("paperListController",["$scope",function ($scope) {

    }]);