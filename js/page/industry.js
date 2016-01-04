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
        $( "#slider" ).slider({
            value:1000,
            min: 1000,
            max: 5000,
            step: 1,
            slide: function( event, ui ) {
                $( "#radius" ).val( ui.value+"米" );
                txmap.circle.setRadius(ui.value);
            },
            stop:function( event, ui ){
                searchSever();
            }
        });
        function searchSever(){
            var val=$(".color").data("query");
            var color = $(".color").data('color');
            txmap.clearOverlays(CONFIG["Overlays"]);
            var region = txmap.marker.getPosition();
            txmap.setSearchServiceObject({color:color,val:val});
            txmap.searchService.setPageCapacity(20);
            txmap.searchService.searchNearBy(val, region, txmap.circle.getRadius());
        }

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
                queryTarget();

        });


        //区域搜索
        $( "#radius" ).val( $( "#slider" ).slider( "value" ) +"米");
        $(".tools-con li").on('click',function(){
            var index=$(this).index();
            $(".side-info .nav li").eq(index).addClass("active");
            $(".side-info .nav li").eq(index).siblings().removeClass("active");
            $(this).siblings().css({
                'background-color':'#fff',
                'color':'#000'
            }).removeClass('color');
            $(this).addClass('color');
            txmap.clearOverlays(CONFIG["Overlays"]);
            var val = $(this).data('query');
            CONFIG["Overlays"]=val;
            var color = $(this).data('color');
            $(this).css({
                'background-color':color,
                'color':'#fff'
            }).addClass('color');

            var region = txmap.marker.getPosition();
            txmap.setSearchServiceObject({color:color,val:val});
            txmap.searchService.setPageCapacity(20);
            txmap.searchService.searchNearBy(val, region, txmap.circle.getRadius());
            $(".side-info").css("display","block");
        });
        $(".side-info .nav li").on('click',function(){
            var index=$(this).index();
            var currentLi=$(".tools-con li");
            var color = currentLi.eq(index).data('color');
            currentLi.eq(index).css({
                'background-color':color,
                'color':'#fff'
            }).addClass("color");
            currentLi.eq(index).siblings().css({
                'background-color':'#fff',
                'color':'#000'
            }).removeClass("color");
            txmap.clearOverlays(CONFIG["Overlays"]);
            var val = currentLi.eq(index).data('query');
            CONFIG["Overlays"]=val;

            var region = txmap.marker.getPosition();
            txmap.setSearchServiceObject({color:color,val:val});
            txmap.searchService.setPageCapacity(20);
            txmap.searchService.searchNearBy(val, region, txmap.circle.getRadius());
        })
        //区域搜索结束

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
            var searchServices=$(".tools-con li");
            for(var i=0;i<searchServices.length;i++){
                $(searchServices[i]).removeClass("color");
                $(searchServices[i]).css({"background-color":"#fff","color":"#000"});
                txmap.clearOverlays($(searchServices[i]).html());
            }
            var LatLng=new txmap.maps.LatLng(parseFloat(CONFIG[content].lat),parseFloat(CONFIG[content].lng));
            var center = txmap.map.panTo(LatLng);
            txmap.marker.setPosition(LatLng);
            txmap.circle.setCenter(LatLng);
            $(".tools-con li").removeClass("color")
        }
        function queryTarget(){
            if($(".city").val()){
                if(isEmpty(CONFIG)){
                    var content = $(".city").attr("data-val");
                    changeSearch(content);//改变地图中心
                    renew();//周边行业分析还原
                }else{
                    alert("目标区域不存在");
                }
            }else{
                alert("请输入搜索内容！");
            }
        }
        function renew(){
            $(".tools-con li").css({
                'background-color':'#fff',
                'color':'#000'
            }).removeClass("color");
            $(".side-info").css("display","none");
        }

    }
);




