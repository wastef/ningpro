define(function(){

    var msColorArray = [],
        jdColorArray = [],
        xxColorArray = [],
        xxylColorArray = [],
        gwColorArray = [],
        ylColorArray = [];
    var CONFIG = {
        "美食" : msColorArray,
        "酒店" : jdColorArray,
        "教育学校" : xxColorArray,
        "购物" : gwColorArray,
        "休闲娱乐" : xxylColorArray,
        "医疗" : ylColorArray
    };

    //腾讯地图初始化

    var center = new qq.maps.LatLng(39.936273,116.44004334);
    var map = new qq.maps.Map(document.getElementById('tmap-searchmap'),{
        center: center,
        zoom: 13,//腾讯地图的级别是min:4 , max: 18
        noClear: false,
        mapTypeControl : false
    });
    var hotMap = new qq.maps.Map(document.getElementById('map-canvas'),{
        center: center,
        zoom: 16,//腾讯地图的级别是min:4 , max: 18
        noClear: false,
        mapTypeControl : false
    });
    var userAreaMap=new qq.maps.Map(document.getElementById('userAreaMap'),{
        center: center,
        zoom: 16,//腾讯地图的级别是min:4 , max: 18
        minZoom:4,             //此处设置地图的缩放级别  最小值是6
        maxZoom:18,
        noClear: false,
        mapTypeControl : false
    });
    var bounds;
    var polygon;
    userAreaMap.zoomTo(userAreaMap.getZoom()-2);
    qq.maps.event.addListener(userAreaMap, 'bounds_changed', function(){

        bounds = userAreaMap.getBounds();
        var b = [bounds.getSouthWest().getLng(),
            ',',
            bounds.getNorthEast().getLat(),
            ',',
            bounds.getNorthEast().getLng(),
            ',',
            bounds.getSouthWest().getLat()].join('');

        if(!polygon){
            //polygon.setMap(null);

            var path1=[
                new qq.maps.LatLng(85.051128,-180),
                new qq.maps.LatLng(85.051128, 180),
                new qq.maps.LatLng(-74.54271712290108, 180),
                new qq.maps.LatLng(-74.54271712290108,-180)
            ];

            polygon = new qq.maps.Polygon({
                path:path1,
                strokeColor: new qq.maps.Color(25,25,112,0.6),
                strokeWeight: 5,
                fillColor: new qq.maps.Color(25,25,112,0.6),
                map: userAreaMap
            });
        }else{

            polygon.setPath([
                new qq.maps.LatLng(85.051128,-180),
                new qq.maps.LatLng(85.051128, 180),
                new qq.maps.LatLng(-74.54271712290108, 180),
                new qq.maps.LatLng(-74.54271712290108,-180)

            ]);
        }

    });

   function polygonFn(data,group_id,view_size,color){

        var path=[];

        for(var i=0;i<data.length;i++){
            path.push(new qq.maps.LatLng(data[i][0],data[i][1]));
        }
        //添加折线覆盖物
     /*  var color1=qq.maps.Color.fromHex(color,0.5)*/
        var polygon = new qq.maps.Polygon({
            //绘制路径
            path:path,
            strokeColor: color,
            strokeWeight: 1,
            fillColor: color,
            map: userAreaMap
        });
       if(polygons[group_id]==undefined||polygons[group_id][view_size]==undefined){
           polygons[group_id]={};
           polygons[group_id][view_size]=[];
           polygons[group_id]["flag"]=false;

       }
       polygons[group_id][view_size].push(polygon);
       if(polygons["before"]["before_size"]==undefined){
           polygons["before"]["before_size"]=[];
       }
       polygons["before"]["before_size"].push(polygon);



    }


    var realtimerender = {
        LayerFactory: function(style){
            var servers = [
                "http://rt0.map.gtimg.com/realtimerender",
                "http://rt1.map.gtimg.com/realtimerender",
                "http://rt2.map.gtimg.com/realtimerender",
                "http://rt3.map.gtimg.com/realtimerender"
            ];
            var serverLength = servers.length;
            return new qq.maps.ImageMapType({
                name: '地图',
                alt: 'realtime',
                tileSize: new qq.maps.Size(256, 256),
                minZoom: 4,
                maxZoom: 18,
                modulo: function(a, b) {
                    var r = a % b;
                    return r * b < 0 ? r + b : r;
                },
                moduloG: function(a, b, c) {
                    var d = b << c;
                    if (0 > a.y || a.y >= d) {
                        return null;
                    }
                    if (0 <= a.x && a.x < d) {
                        return a;
                    }
                    var e = new qq.maps.Point(a.x, a.y);
                    e.x = (a.x % d + d) % d;
                    return e;
                },
                getTileUrl: function (tile, zoom) {
                    var x = tile.x;
                    var y = tile.y;
                    y = Math.pow(2, zoom) - y - 1;
                    var s = this.modulo(x + y, serverLength);
                    var p = this.moduloG(tile, 1, zoom);
                    if (!p) return null;
                    x = p.x;
                    return servers[s] + "?z=" + zoom + "&x=" + x + "&y=" + y + "&type=vector&style="+style+"&v=1.1";
                }
            });
        }
    };

    var size = new qq.maps.Size(25, 35),
        origin = new qq.maps.Point(0, 0),
        icon = new qq.maps.MarkerImage('images/marker.png', size, origin);
    //marker
    var marker = new qq.maps.Marker({//初始标记
        icon:icon,
        position:map.getCenter(),
        map: map
    });
    //circle

    var circle = new qq.maps.Circle({
        center: center,
        radius: 1000,
        map: map,
        fillColor : new qq.maps.Color(237,243,251,0.6)
    });

    var latlngBounds = new qq.maps.LatLngBounds();
    //调用Poi检索类
    var searchService = new qq.maps.SearchService({
        complete : function(results){
            var pois = results.detail.pois;
            console.log(pois);
            var strBefore='<li class="row interval"><span class="hd-name-info">排名</span><span class="hotTrend hd-city-info">名称</span></li>';
            var str='';
            for(i=0;i<10;i++){
                str+=[' <li class="row space">',
                    '<span class="text-center serial-number">'+(i+1)+'</span>',
                    '<span class="content-city-info">'+pois[i].name+'</span>',
                    '</li>'].join('');
            }
            $(".side-info .tab-pane.active").html(strBefore+str);
            for(var i = 0,l = pois.length;i < l; i++){
                var poi = pois[i];

                latlngBounds.extend(poi.latLng);
                var circle = new qq.maps.Circle({
                    center: poi.latLng,
                    radius: 15,
                    map: map,
                    fillColor : searchServiceColor,
                    strokeColor: searchServiceColor
                });

                CONFIG[searchServiceVal].push(circle);
            }
        }
    });
    var searchServiceColor,
        searchServiceVal;
    function setSearchServiceObject(object){
        searchServiceColor = object.color;
        searchServiceVal = object.val;
    }
    function clearOverlays(query) {
        if (CONFIG[query]) {
            for (i in CONFIG[query]) {
                CONFIG[query][i].setMap(null);
            }
        }
    }
    return {
        circle : circle,
        searchService : searchService,
        clearOverlays : clearOverlays,
        map: map,
        maps:qq.maps,
        marker:marker,
        setSearchServiceObject : setSearchServiceObject,
        hotMap:hotMap,
        userAreaMap:userAreaMap,
        polygonFn:polygonFn
    }
});
