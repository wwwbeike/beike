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
	$("#elevator_item a").click(function(){
		$("html,body").animate({scrollTop:0},150);//���go to top��ťʱ����800���ٶȻص������������800���Ը�����������޸�
		return false;
	});

}/* 

function scrollTest(){
     $("#page").scroll(function(){
         var $this =$(this),
         viewH =$(this).height(),//�ɼ��߶�
         contentH =$(this).get(0).scrollHeight,//���ݸ߶�
         scrollTop =$(this).scrollTop();//�����߶�
        //if(contentH - viewH - scrollTop <= 100) { //����ײ�100pxʱ,����������
        if(scrollTop/(contentH -viewH)>=0.95){ //����ײ�100pxʱ,����������
			$(".loading").show();
        }
     });
} */