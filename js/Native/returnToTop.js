function returnToTop(){
	$("#elevator_item").hide()//����go to top��ť
	$(function(){
		$(window).scroll(function(){
			if($(this).scrollTop()>1){//��window��scrolltop�������1ʱ��go to top��ť��������֮����
				$("#elevator_item").fadeIn(100);
			} else {
				$("#elevator_item").fadeOut(100);
			}
		});
	});
	// ��go to top��ťһ������¼�
	$("#elevator_item #elevator").click(function(){
		$("html,body").animate({scrollTop:0},150);//���go to top��ťʱ����800���ٶȻص������������800���Ը�����������޸�
		return false;
	});

}

function getScrollTop(){
	var scrollTop = document.documenElement.scrollTop||window.pageYOffset || document.body.scrollTop;
	return scrollTop;
}