Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(),    //day
        "h+": this.getHours(),   //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
        "S": this.getMilliseconds() //millisecond
    };
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)if (new RegExp("(" + k + ")").test(format))
        format = format.replace(RegExp.$1,
            RegExp.$1.length == 1 ? o[k] :
                ("00" + o[k]).substr(("" + o[k]).length));
    return format;
};
require.config({
    paths: {
        echarts: 'js/source',
        js : 'js/page'
    }
});
require(
    [
        'echarts',
        'echarts/chart/map',
        'echarts/chart/pie',
        'echarts/chart/line',
        'js/tenmap'

    ],
    function (ec,emap,ecf,line,txmap) {
        var CONFIG={},
            pois={},
            MapOption,
            flag=false,
            heatmap,
            myChart;
        window.polygons={};
        polygons["before"]={};
        CONFIG["Overlays"]="";
        //区域搜索开始

        changeDate(90);
        //默认初始化结束


        $(".city").autocomplete({
            delay: 800,
            source: function( request, response ) {
                var content=request.term;
                if(content){
                    if(!$.isNumeric(content)){
                        var _url="db/buis_supervise/get_search_poi.php?query_text="+content;
                        $.ajax({
                            type: "get",
                            url: _url,
                            dataType: "json",//数据类型为json
                            success: function (data) {
                                if(data){
                                    var ary=[];
                                    var resule=data.result;
                                    resule=JSON.parse(decodeURIComponent(JSON.stringify(resule)));
                                    for(var i=0;i<resule.length;i++){
                                        ary.push(resule[i].region.city+" "+resule[i].region.dist+" "+resule[i].name);
                                        CONFIG[resule[i].name]={};
                                        CONFIG[resule[i].name].name=resule[i].name;
                                        CONFIG[resule[i].name].poi_id=resule[i].id;
                                    }


                                    /*  CONFIG[data[0].city_name] = {};
                                     CONFIG[data[0].city_name]["adcode"] = data[0].city_code;
                                     ary.push(data[0].city_name);*/
                                    response(ary);
                                }
                            }
                        });
                    }else{
                        var url="db/buis_supervise/get_poi_id.php?poi_id="+content;
                        $.ajax({
                            type:"get",
                            url:url,
                            dataType:"json",
                            success:function(data){
                                if(data){
                                    $(".city").attr("data-val",data[0].poi_name);
                                    if(CONFIG[data[0].poi_name]==undefined){
                                        CONFIG[data[0].poi_name]={};
                                        CONFIG[data[0].poi_name].name=data[0].poi_name;
                                        CONFIG[data[0].poi_name].poi_id=content;
                                    }
                                    CONFIG[data[0].poi_name].lng=data[0].lng;
                                    CONFIG[data[0].poi_name].lat=data[0].lat;
                                    CONFIG[data[0].poi_name].coordinate=""+data[0].lat+","+data[0].lng;
                                }
                            }
                        })
                    }
                }


            },
            select: function( event, ui ) {

                var content=ui.item.value;
                var ary=content.split(" ");

                var url="db/buis_supervise/get_poi_id.php?poi_id="+CONFIG[ary[2]].poi_id;
                $.ajax({
                    type:"get",
                    url:url,
                    dataType:"json",
                    success:function(data){
                        if(data){
                            $(".city").attr("data-val",data[0].poi_name);
                            CONFIG[data[0].poi_name].lng=data[0].lng;
                            CONFIG[data[0].poi_name].lat=data[0].lat;
                            CONFIG[data[0].poi_name].coordinate=""+data[0].lat+","+data[0].lng;
                        }
                    }
                })
                /*  $(".city").attr("data-adcode",CONFIG[content].adcode);*/

                var terms = ui.item.value.split(",");
                // 移除当前输入
                terms=[];
                // 添加被选项
                terms.push( ui.item.label );
                // 添加占位符，在结尾添加逗号+空格
                terms.push( "" );
                this.value = terms.join( "" );
                return false;
            }

        })

        //查询区域
        $('#search').click(function(){
            //判断是否输入内容
            clearInterval(window.timer);
            queryTarget();
        });

        //查询类型切换
        $(".btn-default").click(function(){
            $(this).siblings().removeClass("current");
            $(this).addClass("current");
            prepareLineChart();
        });

        $("#dateBefore").focus(function(){
            WdatePicker({isShowClear:false,maxDate:'#F{$dp.$D(\'dateAfter\')}'});
        });
        $("#dateAfter").focus(function(){
            WdatePicker({isShowClear:false,minDate:'#F{$dp.$D(\'dateBefore\')}',maxDate:'%y-%M-%d'});
        });
        $(".cursor").bind("click",changeTime);
        function changeTime() {
            $(this).addClass("current");
            $(this).siblings().removeClass("current");
            switch ($(this).index()) {
                case 3:
                    changeDate(7);
                    break;
                case 4:
                    changeDate(14);
                    break;
                case 5:
                    changeDate(30);
                    break;
                case 6:
                    changeDate(90);
                    break;
            }
        }
        $(".date").blur(function(){
            var begin=$("#dateBefore").val();
            $("#dateBefore").attr("value",begin);
            var after=$("#dateAfter").val();
            $("#dateAfter").attr("value",after);
            $(".time-panel-date").html(after);

            var beginArr = begin.split("-");
            var afterArr = after.split("-");

            var dateBefore=new Date(beginArr[0],beginArr[1],beginArr[2]);
            var dateAfter=new  Date(afterArr[0],afterArr[1],afterArr[2]);
            var result = (dateAfter-dateBefore)/(24*60*60*1000)+1;
            $(".cursor").each(function(){
                if(result==parseFloat(this.innerHTML)){
                    $(this).addClass("current");
                }else{
                    $(this).removeClass("current");
                }
            });
        });
        //判断是不是空对象
        function isEmpty(obj) {
            for(var name in obj) {
                return true;
            }
            return false;
        }
        function changeDate(days) {
            var today = new Date(); // 获取今天时间
            var begin;
            var end,end1;
            if (days == 1) {
                today.setTime(today.getTime() - 1 * 24 * 3600 * 1000);
                begin = today.format('yyyy-MM-dd');
                end = new Date().format('yyyy-MM-dd');
                end1= new Date().format('hh:mm');
            } else if (days == 7) {
                today.setTime(today.getTime() - 7 * 24 * 3600 * 1000);
                begin = today.format('yyyy-MM-dd');
                end = new Date().format('yyyy-MM-dd');
                end1= new Date().format('hh:mm');
            } else if (days == 14) {
                today.setTime(today.getTime() - 14 * 24 * 3600 * 1000);
                begin = today.format('yyyy-MM-dd');
                end = new Date().format('yyyy-MM-dd');
                end1= new Date().format('hh:mm');
            } else if (days == 30) {
                today.setTime(today.getTime() - 30 * 24 * 3600 * 1000);
                begin = today.format('yyyy-MM-dd');
                end = new Date().format('yyyy-MM-dd');
                end1= new Date().format('hh:mm');
            } else if (days == 90) {
                today.setTime(today.getTime() - 90 * 24 * 3600 * 1000);
                begin = today.format('yyyy-MM-dd');
                end = new Date().format('yyyy-MM-dd');
                end1= new Date().format('hh:mm');
            }
            $("#dateBefore").val(begin);
            $("#dateAfter").val(end);
            $(".time-panel-date").html(end);
            $(".time-panel-time").html(end1);
        }
        //更改搜索区域，执行区域内检索

        function queryTarget(){
            if($(".city").val()){
                if(isEmpty(CONFIG)){
                    var content = $(".city").attr("data-val");
                    prepareLineChart();
                }else{
                    alert("目标区域不存在");
                }
            }else{
                alert("请输入搜索内容！");
            }
        }
        function prepareLineChart(){//为生成折线图做准备
            var content = $(".city").attr("data-val");
            var Start_time = $("#dateBefore").val();
            var End_time = $("#dateAfter").val();
            var Type=$(".btn-default.current").data('type');
            var getUserPv = ["db/buis_supervise/get_poi_timeline.php?",
                "poi_id="+CONFIG[content].poi_id ,
                "&start_time=" + Start_time ,
                "&end_time=" + End_time ,
                "&type=" + Type].join('');
            $.ajax({
                type: "get",
                url: getUserPv,
                dateType: "json",
                success: function (data){
                    var data=eval("("+data+")");
                    var lineAry=[],dateAry=[],obj={};
                    if(Type!="HOUR"){
                        obj.name=content;
                        obj.data=[];
                        for(var i=0;i<data.length;i++){
                            obj.data.push(eval(data[i].uv_result)[0]);
                            dateAry.push(data[i].date_info);
                        }
                        lineAry.push(obj);
                    }else{
                        obj.name=content;
                        obj.data=[];
                        for(i=0;i<data.length;i++){
                            for(var j=0;j<eval(data[i].uv_result).length;j++){
                                obj.data.push(eval(data[i].uv_result)[j]);
                                dateAry.push(data[i].date_info+" "+j+"时")
                            }
                        }
                        lineAry.push(obj);
                    }
                    initLineChart(obj.name,obj.data,dateAry);


                }
            });
        }

        function initLineChart( name,lineAry, dateAry) {
            var chart=ec.init(document.getElementById('lineChart'));
            var option={
                tooltip : {
                    trigger: 'axis'
                },

                backgroundColor:"#fff",
                toolbox: {
                    show : false,
                    feature : {
                        mark : {show: true},
                        dataZoom : {show: true},
                        dataView : {show: true},
                        magicType : {show: true, type: ['line', 'bar', 'stack', 'tiled']},
                        restore : {show: true},
                        saveAsImage : {show: true}
                    }
                },
                calculable : true,
                dataZoom : {
                    show : true,
                    realtime : true,
                    start : 0,
                    end : 100
                },
                xAxis : [
                    {
                        type : 'category',
                        boundaryGap : false,
                        data : dateAry
                    }
                ],
                yAxis : [
                    {
                        type : 'value'
                    }
                ],
                series : [
                    {
                        name:name,
                        type:'line',
                        data:lineAry
                    }
                ]
            }
            chart.clear();
            chart.setOption(option);
        }
    }
);




