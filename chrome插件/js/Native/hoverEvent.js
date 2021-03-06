/*
* HoverEvent控制
*/

(function($){
    $.fn.hoverDelay = function(options){
        var defaults = {
            hoverDuring: 200,
            outDuring: 200,
            hoverEvent: function(){
                $.noop();
            },
            outEvent: function(){
                $.noop();    
            }
        };
        var sets = $.extend(defaults,options || {});
        var hoverTimer, outTimer;
        return $(this).each(function(){
            $(this).hover(function(){
                clearTimeout(outTimer);
                hoverTimer = setTimeout(sets.hoverEvent, sets.hoverDuring);
            },function(){
                clearTimeout(hoverTimer);
                outTimer = setTimeout(sets.outEvent, sets.outDuring);
            });    
        });
    }      
})(jQuery);

function headerHover(){

	//Jquery自定义
	$("#left_menu_nav").hoverDelay({
		hoverDuring:0,
		hoverEvent:function(){
			$("#left_menu_nav .nav_icon").css("background","url('../image/navigation_icon1_1.png')center center  no-repeat");
			$("#left_menu_nav .menu").show();
		},
		outEvent:function(){
			$("#left_menu_nav .nav_icon").css("background","url('../image/navigation_icon1.png')center center no-repeat");
			$("#left_menu_nav .menu").hide();
		}
	});
	
	$("#add_nav").hoverDelay({
		hoverDuring:0,
		hoverEvent:function(){
			$("#add_nav .nav_icon").css("background","url('../image/navigation_icon2_2.png')center center no-repeat");
			$("#add_nav .menu").show();
		},
		outEvent:function(){
			$("#add_nav .nav_icon").css("background","url('../image/navigation_icon2.png')center center no-repeat");
			$("#add_nav .menu").hide();
		}
	});
	$("#message_nav").hoverDelay({
		hoverDuring:0,
		hoverEvent:function(){
			$("#message_nav .nav_icon").css("background","url('../image/navigation_icon3_3.png')center center no-repeat");
			$("#message_popup").show();
		},
		outEvent:function(){
			$("#message_nav .nav_icon").css("background","url('../image/navigation_icon3.png')center center no-repeat");
			$("#message_popup").hide();
		}
	});
	$("#user_nav").hoverDelay({
		hoverEvent:function(){
			$("#user_nav .menu").show();
		},
		outEvent:function(){
			$("#user_nav .menu").hide();
		}
	});
}

function styleBoardPageHover()
{
	$("div.more").hoverDelay({
		hoverDuring:0,
		hoverEvent:function(){
			$("div.more #menu").show();
			$("div.more .triangle").show();
		},
		outEvent:function(){
			$("div.more #menu").hide();
			$("div.more .triangle").hide();
		}
	});
}

/*
*header栏消息接收里Tab切换
*/
$(document).ready(function(){

});
	
			
