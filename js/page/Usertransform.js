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
        /* 修改样式 start*/
        $(".user-area").css("width",$(window).width()-460-30);
        $("body").css("min-width",1100);
        $(window).resize(function(){
            $(".user-area").css("width",document.body.scrollLeft+document.body.offsetWidth-460-30);
            /*$("body").css("min-width",document.body.scrollWidth)*/
        });
        /* 修改样式 end*/

        changeDate(90);
        //默认初始化结束

        myChart=ec.init(document.getElementById('FunnelChart'));
        var dataStyle = {
            normal: {
                label: {
                    show:false,
                    position : 'outer'
                },
                labelLine: {
                    show:false
                    /* length : 80*/
                }
            },
            emphasis:{
                label: {
                    show:false,
                    position : 'outer'
                },
                labelLine: {
                    show:false
                    /* length : 80*/
                }
            }
        };
        var placeHolderStyle = {
            normal : {
                color: 'rgba(0,0,0,0)',
                label: {show:false},
                labelLine: {show:false}
            },
            emphasis : {
                color: 'rgba(0,0,0,0)',
                label: {show:false},
                labelLine: {show:false}
            }
        };
        MapOption= {
            title: {
                text: '',
                subtext: '',

                offsetCenter: ['80%', '40%'],
                itemGap: 20,
                textStyle : {
                    color : 'rgba(30,144,255,0.8)',
                    fontFamily : '微软雅黑',
                    fontSize : 35,
                    fontWeight : 'bolder'
                }
            },
            tooltip : {
                show: false,
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            color:["#04477c","#ffbb1c","#049ff1","#70e1ff"],
            legend: {
                show:true,
                orient : 'vertical',
                x : document.getElementById('FunnelChart').offsetWidth / 2,
                y : 32,
                color:'auto',
                textStyle:{
                    fontFamily:"微软雅黑",
                    fontSize:14
                },
                selectedMode:true,
                selected:true,
                itemGap:20,
                data:[]
            },
            toolbox: {
                show : false,
                feature : {
                    mark : {show: true},
                    dataView : {show: true, readOnly: false},
                    restore : {show: true},
                    saveAsImage : {show: true}
                }

            },
            series : [
                {
                    name:'1',
                    type:'pie',
                    clockWise:false,
                    radius : [140, 175],
                    itemStyle : dataStyle,
                    data:[
                        {
                            value:68,
                            name:'68%的人表示过的不错'
                        },
                        {
                            value:32,
                            name:'invisible',
                            itemStyle : placeHolderStyle
                        }
                    ]
                },
                {
                    name:'2',
                    type:'pie',
                    clockWise:false,
                    radius : [105, 140],
                    itemStyle : dataStyle,
                    data:[
                        {
                            value:25,
                            name:'29%的人表示生活压力很大'
                        },
                        {
                            value:75,
                            name:'invisible',
                            itemStyle : placeHolderStyle
                        }
                    ]
                },
                {
                    name:'3',
                    type:'pie',
                    clockWise:false,
                    radius : [70, 105],
                    itemStyle : dataStyle,
                    data:[
                        {
                            value:4,
                            name:'3%的人表示“我姓曾”'
                        },
                        {
                            value:96,
                            name:'invisible',
                            itemStyle : placeHolderStyle
                        }
                    ]
                },
                {
                    name:'4',
                    type:'pie',
                    clockWise:false,
                    radius : [35, 70],
                    itemStyle : dataStyle,
                    data:[
                        {
                            value:3,
                            name:'3%“我姓曾”'
                        },
                        {
                            value:97,
                            name:'invisible',
                            itemStyle : placeHolderStyle
                        }
                    ]
                }
            ]
        };

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


        $(".distanceChange").click(function(){
            $(this).siblings().removeClass("curr");
            $(this).addClass("curr");
            var gourp_id=$(".user-category.border").data("gourpid");
            clearInterval(window.timer);
            TargetPopulationGrid(gourp_id);
        });
        $(".classification").click(function(){
            $(this).siblings().removeClass("curr");
            $(this).addClass("curr");
            var gourp_id=$(".user-category.border").data("gourpid");
            if($(this).html()=="常驻地区"){
                $(".distance").css("display","none");
                $(".level").css("display","none");
                $(".side").css("display","block");
                clearInterval(window.timer);
                if(polygons["before"]["before_size"]!=undefined){
                    if(polygons["before"]["before_size"].length>0){
                        for(var j=0;j<polygons["before"]["before_size"].length;j++){
                            polygons["before"]["before_size"][j].setVisible(false);
                        }
                        polygons["before"]["before_size"]=[];
                    }
                }
                PermanentArea();
            }else{
                $(".distance").css("display","block");
                $(".level").css("display","block");
                $(".side").css("display","none");
                TargetPopulationGrid(gourp_id);
            }
        });

        $(".nav").on("click","li",function(){
            $(this).siblings().removeClass("active");
            $(this).addClass("active");
            PermanentArea();
        });

        function PermanentArea(){//常驻区域分布
            var gourp_id=$(".user-category.border").data("gourpid");
            var type=$(".nav .active a").data("type");
            /*type=3;*/
            var url="db/buis_supervise/get_group_area.php?group_id="+gourp_id+"&type="+type;
            $.ajax({
                type:"get",
                url:url,
                dataType:"json",
                success:function(data){
                    /* var data=eval("("+data+")");*/
                    var json_result=eval("("+data[0].json_result+")");
                    var strBefore=['<li class="row interval">',
                        '<span class="hd-name">排名</span>',
                        '<span class="hotTrend hd-city">名称</span>',
                        '<span class="hd-per left1">用户量</span>',
                        '<span class="hd-per left2">用户占比</span>',
                        '<span class="hd-per left3">用户等比</span>',
                        '</li>'].join('');
                    var str='';
                    for(var i=0;i<10;i++){
                        if(json_result[i]!=undefined){
                            var num=json_result[i].num;
                            var weight=json_result[i].weight;
                            var pcnt=json_result[i].pcnt;
                            var name=decodeURIComponent(json_result[i].name);
                            str+=['<li class="row space">',
                                '<span class="text-center serial-number">'+(i+1)+'</span>',
                                '<span class="content-city">'+name+'</span>',
                                '<span class="per pre1">'+num+'</span>',
                                '<span class="per pre2">'+pcnt+'</span>',
                                '<span class="per pre3">'+weight+'</span>',
                                '</li>'].join('');
                        }

                    }
                    str=strBefore+str;
                    $(".tab-pane.active").html(str);

                }
            })
        }
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
        function changeSearch(content){
            var LatLng=new txmap.maps.LatLng(parseFloat(CONFIG[content].lat),parseFloat(CONFIG[content].lng));
            var center = txmap.map.panTo(LatLng);
            txmap.userAreaMap.panTo(LatLng);
        }
        function initFunnel(){
            if(isEmpty(CONFIG)){
                var content = $(".city").attr("data-val");
                var end_time = $("#dateAfter").val();
                var targetFunnelC="db/buis_supervise/get_funnel.php?poi_id="+CONFIG[content].poi_id+"&day_time="+end_time;
                $.ajax({
                    type: "get",
                    url: targetFunnelC,
                    dateType: "json",
                    success: function (data) {
                        if($(".user-category-all").length>0){
                            $("div").remove(".user-category-all");
                        }
                        var data=eval("("+data+")");
                        var name,ary=[],max= 0,value,sum= 0,str="",nameAry=[],gourp_id;
                        for(var i=0;i<data.length;i++){
                            if(data[i].group_type=="0"){
                                name="用户群";
                                sum=Number(data[i].group_uv);
                                gourp_id=data[i].group_id;
                            }else if(data[i].group_type=="1"){
                                name="活跃用户群";
                            }else if(data[i].group_type=="2"){
                                name="忠诚用户群";
                            }
                            value=Number(data[i].group_uv);
                            if(value>max){
                                max=value;
                            }
                            nameAry.push(name);
                            ary.push({"name":name,"value":value,"gourp_id":data[i].group_id})
                        }
                        ary.unshift({"name":"潜在用户群","value":sum*0.8,"gourp_id":"undefined"});
                        MapOption.legend.data=[];
                        for(var i=0;i<ary.length;i++){
                            if(ary[i].value==sum){
                                MapOption.series[i].data[0].name=((sum/sum)*100).toFixed(2)+'% '+ary[i].name+"["+ary[i].value+"]";
                                MapOption.series[i].data[0].value=sum*0.75;
                                MapOption.series[i].data[1].value=sum*0.25;
                                MapOption.legend.data.push({name:((sum/sum)*100).toFixed(2)+'% '+ary[i].name+"["+ary[i].value+"]",textStyle:{color:'#D8B81B'}})
                            }else if(ary[i].name=="潜在用户群"){
                                MapOption.series[i].data[0].name=/*((sum*1.2/sum)*100).toFixed(2)+'% '+*/ary[i].name;
                                MapOption.series[i].data[0].value=sum*0.8;
                                MapOption.series[i].data[1].value=sum*0.2;
                                MapOption.legend.data.push(/*(*//*(sum*1.2/sum)*100).toFixed(2)+'% '+*/{name:ary[i].name,textStyle:{color:'#04477c'}})
                            }else{
                                MapOption.series[i].data[0].name=(((ary[i].value)/sum)*100).toFixed(2)+'% '+ary[i].name+"["+ary[i].value+"]";
                                MapOption.series[i].data[0].value=ary[i].value*0.75;
                                MapOption.series[i].data[1].value=sum-ary[i].value*0.75;
                                if(ary[i].name=='活跃用户群'){
                                    MapOption.legend.data.push({name:(((ary[i].value)/sum)*100).toFixed(2)+'% '+ary[i].name+"["+ary[i].value+"]",textStyle:{color:'#049ff1'}})
                                }else if(ary[i].name=='忠诚用户群'){
                                    MapOption.legend.data.push({name:(((ary[i].value)/sum)*100).toFixed(2)+'% '+ary[i].name+"["+ary[i].value+"]",textStyle:{color:'#70e1ff'}})
                                }

                            }
                        }
                        myChart.clear();
                        myChart.setOption(MapOption);
                        str=['<div class="user-category-all">',
                            '<div class="user-category" style="background-color: #04477c" data-gourpid="'+ary[0].gourp_id+'">'+'潜在用户群'+'</div>',
                            '<div class="user-category border" style="background-color: #065fb9" data-gourpid="'+ary[1].gourp_id+'">'+'用户群'+'</div>',
                            '<div class="user-category" style="background-color: #049ff1" data-gourpid="'+ary[2].gourp_id+'">'+'活跃用户群'+'</div>',
                            '<div class="user-category" style="background-color: #70e1ff" data-gourpid="'+ary[3].gourp_id+'">'+'忠诚用户群'+'</div></div>'].join('');
                        $(".user-transformation .region-search").append(str);
                        if($(".user-name").length==0){
                            var userStr="<span class='user-name'>"+"- 用户群"+"</span>";
                            $(".user-area").find(".region-search").append(userStr);
                        }else{
                            $(".user-name").html("- 用户群");
                        }

                        /*  str+='<div class="common_div " style="width: 500px"><span class="top">潜在用户群</span></div>'
                         for(i=0;i<ary.length;i++){
                         var divWidth=ary[i].value/(max*1.2)*500;
                         if(ary[i].name=="用户群"){
                         str+='<div class="common_div cur " data-gourpid='+ary[i].gourp_id+' style="width: '+divWidth+'px"><span class="top">'+ary[i].name+'</span></div>'
                         }else{
                         str+='<div class="common_div "  data-gourpid='+ary[i].gourp_id+' style="width: '+divWidth+'px"><span class="top">'+ary[i].name+'</span></div>'
                         }

                         }
                         $("#FunnelChart").html(str);*/

                        if($(".classification.curr").html()=="热力"){
                            TargetPopulationGrid(gourp_id);
                        }else{
                            PermanentArea();
                        }

                    }})
            }else{
                alert("请输入搜索内容！");
            }
        }
        $(".user-transformation").on("click",".user-category",function(){//用户类型切换
            $(".user-name").html("- " +$(this).html());
            var ary=['潜在用户群','用户群','活跃用户群','忠诚用户群'];
            var colorAry=["#04477c","#065fb9","#049ff1","#70e1ff"];
            var index=$(this).html();
            for(var i=0;i<ary.length;i++){
                if(ary[i]==index){
                    index=i;
                }
            }
            colorAry[index]="#ffbb1c";
            MapOption.color=colorAry;
            for(i=0;i<MapOption.legend.data.length;i++){
                if(i==index){
                    MapOption.legend.data[index]={name:MapOption.legend.data[index].name,textStyle:{color:'#D8B81B'}};
                }else{
                    MapOption.legend.data[i]={name:MapOption.legend.data[i].name,textStyle:{color:colorAry[i]}};
                }
            }

            /*MapOption.legend.data=MapOption.legend.data;*/
            myChart.clear();
            myChart.setOption(MapOption);
            $(this).siblings().removeClass("border");
            $(this).addClass("border");
            var gourp_id=$(this).data("gourpid");
            clearInterval(window.timer);
            if(gourp_id!=undefined){
                if($(".classification.curr").html()=="热力"){
                    TargetPopulationGrid(gourp_id);
                }else{
                    PermanentArea();
                }
            }
        });
        function initTargetPopulationGrid(group_id,view_size,_this){//进行画点操作
            var TargetPopulationGrid="db/buis_supervise/get_group_grid.php?group_id="+group_id+"&view_size="+view_size;
            $.ajax({
                type: "get",
                url: TargetPopulationGrid,
                dateType: "json",
                success: function (data) {
                    var size;
                    if(view_size==0){
                        size=1;
                    }else if(view_size==1){
                        size=10
                    }else if(view_size==2){
                        size=100
                    }
                    var data=eval("("+data+")");
                    var hotview_json,lnglat,rectangle,length=0;
                    if(data.length>0){
                        var colorAry=["#ff0000","#ff4f00","#ffb400","#fff700","#adff00","#47ff00","#00ff34","#00ffb0","#00ffff","#00b0ff"];
                        colorAry.reverse();
                        clearInterval(_this.timer);
                        var q=0;
                        _this.timer=window.setInterval(function(){
                            if(q<data.length){
                                hotview_json= eval("("+data[q].hotview_json+")");
                                length=hotview_json.length;
                                var i=0;
                                for(;i<length;i++){
                                    lnglat=hotview_json[i].lnglat.split(",");
                                    rectangle=[[lnglat[1]-(0.00004*size),Number(lnglat[0])+(0.00005*size)],[Number(lnglat[1])+(0.00005*size),Number(lnglat[0])+(0.00005*size)],[Number(lnglat[1])+(0.00005*size),lnglat[0]-(0.00004*size)],[Number(lnglat[1])-(0.00004*size),Number(lnglat[0])-(0.00004*size)]];
                                    txmap.polygonFn(rectangle,group_id,view_size,colorAry[hotview_json[i].count-1]);
                                }
                            }else{
                                clearInterval(_this.timer);
                            }
                            q++;
                            if(q>=data.length){
                                polygons[group_id]["flag"]=true;
                                clearInterval(window.timer);
                            }
                        },500);
                    }
                }
            })
        }
        function TargetPopulationGrid(group_id){
            var _this=this;
            clearInterval(window.timer);
            var view_size=$(".distanceChange.curr").data("view_size");
            if(polygons["before"]["before_size"]!=undefined){//清除画点
                if(polygons["before"]["before_size"].length>0){
                    for(var j=0;j<polygons["before"]["before_size"].length;j++){
                        polygons["before"]["before_size"][j].setVisible(false);
                    }
                    polygons["before"]["before_size"]=[];
                }
            }
            if(polygons[group_id]==undefined||polygons[group_id][view_size]==undefined){//未曾画点

                initTargetPopulationGrid(group_id,view_size,_this);
            }else if(polygons[group_id]["flag"]!=undefined&&polygons[group_id]["flag"]==false){//由于清除定时器，未画完点

                initTargetPopulationGrid(group_id,view_size,_this);
            }else{//已经画过点

                for(var j=0;j<polygons[group_id][view_size].length;j++){
                    polygons[group_id][view_size][j].setVisible(true);
                    polygons["before"]["before_size"].push(polygons[group_id][view_size][j]);
                }
            }
        }

        function queryTarget(){
            if($(".city").val()){
                if(isEmpty(CONFIG)){
                    var content = $(".city").attr("data-val");
                    changeSearch(content);//改变地图中心
                    initFunnel();
                }else{
                    alert("目标区域不存在");
                }
            }else{
                alert("请输入搜索内容！");
            }
        }



    }
);




