(function () {
    'use strict';
    var start_flag = false;
    //-------------------------------------------------------------------------------
    var clearAll_Interval;
    (function () { // setTimeout & setInterval
        var setTimeout_copy = window.setTimeout;
        var setInterval_copy = window.setInterval;
        var set_IDs = [];
        clearAll_Interval = function () { // 時間差関数を消去
            while(set_IDs.length) clearInterval(set_IDs.pop());
        }
        window.setTimeout = function (func, delay, param1, param2, param3) { // clearInterval
            var id = setTimeout_copy(func, delay, param1, param2, param3);
            set_IDs.push(id);
            return id;
        }
        window.setInterval = function (func, delay, param1, param2, param3) { // clearInterval
            var id = setInterval_copy(func, delay, param1, param2, param3);
            set_IDs.push(id);
            return id;
        }
    })();
    //-------------------------------------------------------------------------------
    var g_line_counter = 0; // consoleの行数
    (function () {
        function appendResult (text, back, font, symbol) {
            var line = $("<div>").css({
                backgroundColor: back,
                color: font,
                "text-align": "left",
                maxWidth: "100%",
            }).appendTo(result_js);
            var color = yaju1919.getCSS(line).backgroundColor.match(/[0-9]+/g).map(function(v,i){
                var n = Number(v);
                var d = (n - n*0.1);
                return d >= 0 ? d : 0;
            });
            $("<div>").text(symbol || g_line_counter++).css({
                backgroundColor: "rgb(" + color + ")",
                width: "3em",
                "text-align": "center",
            }).appendTo(line);
            $("<div>").text(text).appendTo(line).css({
                "margin-left": "1em"
            });
            line.find("div").css({
                display: "inline-block"
            });
        }
        var list = { // [ back-color, font-color, symbol, func ]
            log: [ "white", "black", "" ],
            error: [ "pink", "red", "×" ],
            warn: [ "lightyellow", "orange", "▲" ],
            info: [ "lightblue", "blue", "●" ],
        }
        var origin = {};
        if(!window.console) window.console = {};
        for(var k in list){
            origin[k] = window.console[k] || function(){};
            var ar = list[k];
            window.console[k] = (function(){
                var key = k, back = ar[0], font = ar[1], symbol = ar[2];
                return function(){
                    var thisArg = arguments;
                    origin[key].apply(console, thisArg);
                    var str = yaju1919.makeArray(thisArg.length).map(function(i){
                        var x = thisArg[i];
                        if(yaju1919.judgeType(x,"Object")){
                            return '{' + Object.keys(x).map(function(k){
                                return k + ':' + String(x[k])
                            }).join(',') + '}';
                        }
                        else if(yaju1919.judgeType(x,"Array")){
                            return '[' + String(x) + ']';
                        }
                        else if(!yaju1919.judgeType(x,["Number", "String", "RegExp", "Boolean", "Error"])) return yaju1919.getType(x);
                        return String(x);
                    }).join(', ');
                    appendResult(str, back, font, symbol);
                }
            })();
        }
    })();
    //-------------------------------------------------------------------------------
    var h = $("<div>").appendTo($("body")).css({
        padding : "1em",
    });
    $("<h1>",{text:"HTML & JavaScript エディタ"}).appendTo(h);
    var h_html = $("<div>").appendTo(h);
    var h_js = $("<div>").appendTo(h);
    function resize(){
        var w = $(window).width();
        if(w > 500) {
            h_html.css({float: "left", width: "50%"});
            h_js.css({float: "right", width: "50%"});
        }
        else {
            h_html.css({float: "none", width: "100%"});
            h_js.css({float: "none", width: "100%"});
        }
    }
    $(window).resize(resize);
    resize();
    //-------------------------------------------------------
    var ui_html = $("<div>").appendTo(h_html);
    var ui_js = $("<div>").appendTo(h_js);
    //-------------------------------------------------------
    var input_html = yaju1919.addInputText(h_html,{
        id: "html",
        textarea: true,
        placeholder: "HTMLを入力" + yaju1919.repeat(' ',100),
        save: "html",
    });
    var shapeCode = function(){};
    var input_js = yaju1919.addInputText(h_js,{
        id: "js",
        textarea: true,
        placeholder: "JavaScriptを入力" + yaju1919.repeat(' ',100),
        save: "js",
    });
    $("#js").keyup(function(e){
        if('}];'.indexOf(e.key) !== -1) shapeCode();
    });
    //-------------------------------------------------------
    var result_html = $("<div>").appendTo(h_html);
    var result_js = $("<div>").appendTo(h_js);
    result_html.add(result_js).css({
        width: "90%",
        "max-height": $(window).height()/3,
        padding : "1em",
        boxSizing : 'border-box',
        overflow: "visible scroll"
    });
    //-------------------------------------------------------------------------------
    function addBtn (parentNode, title, func) {
        return $("<button>").text(title).click(func).appendTo(parentNode);
    }
    function clear_console () {
        clearAll_Interval();
        result_js.empty();
        g_line_counter = 0;
    }
    function run () {
        clear_console();
        var v = input_js();
        try {
            console.log(eval(v));
        }
        catch (e) {
            console.error(e);
        }
    }
    //------------------------------------------------------------------------------
    addBtn(ui_js, "JSを実行", run);
    addBtn(ui_js, "クリア", clear_console);
    //-------------------------------------------------------
    addBtn(ui_html, "HTMLを反映", function(){
        result_html.html(input_html());
    });
    addBtn(ui_html, "クリア", function(){
        result_html.empty();
    });
    shapeCode = function () {
        if(!start_flag) return;
        if(!flag_AutoShapeCode()) return;
        var result = js_beautify(input_js(),{max_preserve_newlines:2});
        $("#js").val(result).focus().get(0);
    }
    var flag_AutoShapeCode = yaju1919.addInputBool(ui_js,{
        title: "自動コード整形",
        change: shapeCode,
        save: "shapeCode"
    });
    start_flag = true;
    //-------------------------------------------------------------------------------
})();
