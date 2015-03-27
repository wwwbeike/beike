function returnToTop(){
	$("#elevator_item").hide()//隐藏go to top按钮
	$(function(){
		$(window).scroll(function(){
			if($(this).scrollTop()>1){//当window的scrolltop距离大于1时，go to top按钮淡出，反之淡入
				$("#elevator_item").fadeIn(100);
			} else {
				$("#elevator_item").fadeOut(100);
			}
		});
	});
	// 给go to top按钮一个点击事件
	$("#elevator_item #elevator").click(function(){
		$("html,body").animate({scrollTop:0},150);//点击go to top按钮时，以800的速度回到顶部，这里的800可以根据你的需求修改
		return false;
	});

}

function getScrollTop(){
	var scrollTop = document.documenElement.scrollTop||window.pageYOffset || document.body.scrollTop;
	return scrollTop;
}