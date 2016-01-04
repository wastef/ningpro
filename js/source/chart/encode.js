      //最后使用multiPolygon
        function ecode_test(coordi){
            var obj={};
            var coordinates = coordi
            var encodeOffsets = [];
            coordinates.forEach(function (coordinate, idx){
                coordinates[idx] = encodePolygon(
                    coordinate, encodeOffsets[idx] = []
                );
            });
            obj.encodeOffsets=encodeOffsets;
            obj.coordinates=coordinates;
            return  obj;
       /*     document.write(JSON.stringify(encodeOffsets))
            document.write(JSON.stringify(coordinates))*/
            console.dir(encodeOffsets);//这个数据也需要拼接到map.js中对应的
            console.dir(coordinates);//这个数据也需要拼接到map.js中对应的
        }
        function encodePolygon(coordinate, encodeOffsets) {
            var result = '';

            var prevX = quantize(coordinate[0][0]);
            var prevY = quantize(coordinate[0][1]);
            // Store the origin offset
            encodeOffsets[0] = prevX;
            encodeOffsets[1] = prevY;

            for (var i = 0; i < coordinate.length; i++) {
                var point = coordinate[i];
                result+=encode(point[0], prevX);
                result+=encode(point[1], prevY);

                prevX = quantize(point[0]);
                prevY = quantize(point[1]);
            }

            return result;
        }

        function encode(val, prev){
            // Quantization
            val = quantize(val);
            // var tmp = val;
            // Delta
            val = val - prev;

            if (((val << 1) ^ (val >> 15)) + 64 === 8232) { 
                //WTF, 8232 will get syntax error in js code
                val--;
            }
            // ZigZag
            val = (val << 1) ^ (val >> 15);
            // add offset and get unicode
            return String.fromCharCode(val+64);
            // var tmp = {'tmp' : str};
            // try{
            //     eval("(" + JSON.stringify(tmp) + ")");
            // }catch(e) {
            //     console.log(val + 64);
            // }
        }

        function quantize(val) {
            return Math.ceil(val * 1024);
        }
