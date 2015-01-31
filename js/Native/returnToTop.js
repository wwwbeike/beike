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
	$("#elevator_item a").click(function(){
		$("html,body").animate({scrollTop:0},150);//点击go to top按钮时，以800的速度回到顶部，这里的800可以根据你的需求修改
		return false;
	});

}/* 

function scrollTest(){
     $("#page").scroll(function(){
         var $this =$(this),
         viewH =$(this).height(),//可见高度
         contentH =$(this).get(0).scrollHeight,//内容高度
         scrollTop =$(this).scrollTop();//滚动高度
        //if(contentH - viewH - scrollTop <= 100) { //到达底部100px时,加载新内容
        if(scrollTop/(contentH -viewH)>=0.95){ //到达底部100px时,加载新内容
			$(".loading").show();
        }
     });
} */