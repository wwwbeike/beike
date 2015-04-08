function aLinkHover(){
	$(".pin_view .tool_bar_bottom .repin_btn").hover(function(){
		//mouseenter
		$(this).css("border","1px solid #D9D9D9");
		var $i = $(".pin_view .tool_bar_bottom .repin_btn i");  
		$i.css("background","url(../image/bt_action_icons.svg) -30px -30px no-repeat");
	},
		//mouseleave
	function(){
		$(this).css("border","1px solid #EDEDED");
		var $i = $(".pin_view .tool_bar_bottom .repin_btn i");  
		$i.css("background","url(../image/bt_action_icons.svg) -30px 0 no-repeat");
	});
	
	$(".pin_view .tool_bar_bottom .like_btn").hover(function(){
		//mouseenter
		$(this).css("border","1px solid #D9D9D9");
		var $i = $(".pin_view .tool_bar_bottom .like_btn i");  
		$i.css("background","url(../image/bt_action_icons.svg) 0 -30px no-repeat");
	},
		//mouseleave
	function(){
		$(this).css("border","1px solid #EDEDED");
		var $i = $(".pin_view .tool_bar_bottom .like_btn i");  
		$i.css("background","url(../image/bt_action_icons.svg) 0 0 no-repeat");
	});
	
	$(".pin_view .tool_bar_bottom .comment_btn").hover(function(){
		//mouseenter
		$(this).css("border","1px solid #D9D9D9");
		var $i = $(".pin_view .tool_bar_bottom .comment_btn i");  
		$i.css("background","url(../image/bt_action_icons.svg) -60px -30px no-repeat");
	},
		//mouseleave
	function(){
		$(this).css("border","1px solid #EDEDED");
		var $i = $(".pin_view .tool_bar_bottom .comment_btn i");  
		$i.css("background","url(../image/bt_action_icons.svg) -60px 0 no-repeat");
	});
	
	$(".pin_view .tool_bar_bottom .report_btn").hover(function(){
		//mouseenter
		$(this).css("border","1px solid #D9D9D9");
		var $i = $(".pin_view .tool_bar_bottom .report_btn i");  
		$i.css("background","url(../image/report_icon.svg) 0 -40px no-repeat");
	},
		//mouseleave
	function(){
		$(this).css("border","1px solid #EDEDED");
		var $i = $(".pin_view .tool_bar_bottom .report_btn i");  
		$i.css("background","url(../image/report_icon.svg) 0px -20px no-repeat");
	});
	
	
	$(".pin_view .tool_bar_bottom .source").hover(function(){
		//mouseenter
		$(this).css("border","1px solid #D9D9D9");
	},
		//mouseleave
	function(){
		$(this).css("border","1px solid #EDEDED");
	});
	
	$(".pin_view .siblings_piece .inner").hover(function(){
		$(".pin_view .siblings_piece .inner .site").css("color","#e47f7f");
		$(".pin_view .siblings_piece .inner .arrow").css("background","url(../image/icon_arrow.png) 0 -30px no-repeat")
	},
	
	function(){
		$(".pin_view .siblings_piece .inner .site").css("color","#444");
		$(".pin_view .siblings_piece .inner .arrow").css("background","url(../image/icon_arrow.png) 0 0 no-repeat")
	})
}

$(function(){
	$(".clear_input").focus(function(){
		$("#pin_view_add_comment a").css("display","block"); 
		
	});
});

function commentTrue(){
	$("#pin_view_add_comment a").removeClass("disabled");
}

function followBoard(){
	var $strong = $(this).children("strong");
	$strong.text("取消关注");

}
