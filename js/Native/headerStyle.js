/*
* headerHover控制
*/

(function($){
    $.fn.hoverDelay = function(options){
        var defaults = {
            hoverDuring: 400,
            outDuring: 400,
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
		hoverEvent:function(){
			$("#left_menu_nav .nav_icon").css("background","url('image/menu_sprite.svg')-50px 0 no-repeat");
			$("#left_menu_nav .menu").show();
		},
		outEvent:function(){
			$("#left_menu_nav .nav_icon").css("background","url('image/menu_sprite.svg')0 0 no-repeat");
			$("#left_menu_nav .menu").hide();
		}
	});
	
	$("#add_nav").hoverDelay({
		hoverEvent:function(){
			$("#add_nav .nav_icon").css("background","url('image/menu_sprite.svg')-50px -150px no-repeat");
			$("#add_nav .menu").show();
		},
		outEvent:function(){
			$("#add_nav .nav_icon").css("background","url('image/menu_sprite.svg')0 -150px no-repeat");
			$("#add_nav .menu").hide();
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
