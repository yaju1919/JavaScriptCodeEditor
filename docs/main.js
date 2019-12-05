(function () {
    'use strict';
    var FONT_COLOR = "lightgreen";
    var BACK_COLOR = "black";
    //-------------------------------------------------------------------------------
    var clearAll_Interval;
    (function () { // setTimeout & setInterval
        var setTimeout_copy = window.setInterval;
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
            $("<pre>").appendTo(result_js)
                .css({
                backgroundColor: back,
                color: font
            })
                .text('　' + (symbol || g_line_counter++) + '　-　' + text)
            result_js.scrollTop(result_js.get(0).scrollHeight);
        }
        var list = { // [ back-color, font-color, symbol, func ]
            log: [ "white", "black", "" ],
            error: [ "pink", "red", "×" ],
            warn: [ "lightyellow", "orange", "▲" ],
            info: [ "lightblue", "blue", "●" ],
        }
        var origin = {};
        for(var k in list){
            origin[k] = window.console[k];
            var ar = list[k];
            window.console[k] = (function({key = k, back = ar[0], font = ar[1], symbol = ar[2]}={}){
                return function(){
                    origin[key](arguments);
                    var str = "";
                    if(arguments.length === 1) {
                        var type = Object.prototype.toString.call(arguments[0]);
                        if(["Number", "String", "Array"].indexOf(type.replace(/\[object |\]/g,"")) === -1) str = type;
                    }
                    if(!str) str = Array.prototype.join.call(arguments);
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
    var h_html = $("<div>").appendTo(h).css({float: "left", width: "50%"});
    var h_js = $("<div>").appendTo(h).css({float: "right", width: "50%"});
    //-------------------------------------------------------
    var ui_html = $("<div>").appendTo(h_html);
    var ui_js = $("<div>").appendTo(h_js);
    //-------------------------------------------------------
    var input_html = $("<textarea>",{placeholder: "HTMLを入力"}).appendTo(h_html);
    var shapeCode = function(){};
    var input_js = $("<textarea>",{placeholder: "JavaScriptを入力"}).appendTo(h_js).keyup(function(e){
        if(['}',']',';','Enter'].indexOf(e.key) !== -1) shapeCode();
    });
    $("textarea").css({
        width: "90%",
        height: $(window).height()/3,
        padding : "1em",
        boxSizing : 'border-box',
        "overflow-y": "scroll",
        backgroundColor: BACK_COLOR,
        color: FONT_COLOR
    });
    //-------------------------------------------------------
    var result_html = $("<div>").appendTo(h_html);
    var result_js = $("<div>").appendTo(h_js);
    result_html.add(result_js).css({
        width: "90%",
        "max-height": $(window).height()/3,
        padding : "1em",
        boxSizing : 'border-box',
        "overflow-y": "scroll",
    });
    //-------------------------------------------------------------------------------
    function appendBtn (parent, title, func) {
        return $("<button>").text(title).click(func).appendTo(parent);
    }
    function appendCheckBox (parent, title, value, change) { // チェックボックスを追加
        var flag = value;
        var h = $("<span>").appendTo(parent);
        var check = $("<input>",{type:"checkbox"});
        function set (bool, isClick) {
            flag = bool;
            btn.css("background-color", flag ? "orange" : "gray");
            check.prop("checked",flag);
            if(change && isClick) change(flag);
        };
        var btn = $("<button>").appendTo(h)
        .append(check).append(title).click(function(){
            set(!flag);
        });
        set(flag);
        return function () { return flag; } ;
    };
    function clear_console () {
        clearAll_Interval();
        result_js.empty();
        g_line_counter = 0;
    }
    function run () {
        clear_console();
        var v = input_js.val();
        try {
            console.log(eval(v));
        }
        catch (e) {
            console.error(e);
        }
    }
    //-------------------------------------------------------------------------------
    var ui = {
        js: ui_js,
        html: ui_html
    }
    var input = {
        js: input_js,
        html: input_html
    }
    var array = ['js','html'];
    array.forEach(function(v){
        appendBtn(ui[v], "上に移動", function(){ input[v].stop().animate({scrollTop:input[v].scrollTop()-input[v].height()}) });
        appendBtn(ui[v], "下に移動", function(){ input[v].stop().animate({scrollTop:input[v].scrollTop()+input[v].height()}) });
    });
    appendBtn(ui_js, "実行", run);
    appendBtn(ui_js, "クリア", clear_console);
    //-------------------------------------------------------
    appendBtn(ui_html, "反映", function(){
        result_html.html(input_html.val());
    });
    appendBtn(ui_html, "クリア", function(){
        result_html.empty();
    });
    shapeCode = function () {
        if(!flag_AutoShapeCode()) return;
        var result = js_beautify(input_js.val(),{max_preserve_newlines:2});
        input_js.val(result).focus().get(0);
    }
    var flag_AutoShapeCode = appendCheckBox(ui_js, "自動コード整形", false, shapeCode);
    //-------------------------------------------------------------------------------
})();
