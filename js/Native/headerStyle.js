/*
* header������
*/

var leftcanHide = false; //�����˵����Ƿ�����ز�
var rightcanHide =false;//����Ҳ˵����Ƿ������

function doHide(){   //�Ƿ����ز������ﴦ��
	if(leftcanHide)
		$("#header_main_menu").hide();
	if(rightcanHide)
		$("#header_user_menu").hide();
}
function xxx(){}
function headerStyle()
{
	$("#header_main_menu").hide();   //�Ƚ�����������
	$("#header_user_menu").hide();

	
	$("#left_menu_nav").hover(function(){ //������
		$(".nav_icon").css("background","url('image/menu_sprite.svg')-50px 0 no-repeat");
		$("#header_main_menu").show(); //��ʾ
		leftcanHide = false; //��ǲ�������
	},function(){
		$(".nav_icon").css("background","url('image/menu_sprite.svg')0 0 no-repeat");	
		leftcanHide = true; //����Ƴ�������
		window.clearTimeout(t); //���ϴεĶ�ʱ�����,��������
		var t = window.setTimeout(doHide,500); //�ڼ��1000�����ִ���Ƿ����ش���
	}
	);
	
	//��Ҫ������ʱ���������߹�������
	$("#header_main_menu").hover(function(){ //������
		$(".nav_icon").css("background","url('image/menu_sprite.svg')-50px 0 no-repeat");
		leftcanHide = false;    //��������
	},function(){
	$(".nav_icon").css("background","url('image/menu_sprite.svg')0 0 no-repeat");
		leftcanHide = true;     //����Ƴ�������
		window.clearTimeout(t);
		var t = window.setTimeout(doHide,500);
	});
	
	/*user��hover�¼�*/
	$("#right_menu_nav").hover(function(){ //������
		$("#header_user_menu").show(); //��ʾ
		rightcanHide = false; //��ǲ�������
	},function(){
		rightcanHide = true; //����Ƴ�������
		window.clearTimeout(t); //���ϴεĶ�ʱ�����,��������
		var t = window.setTimeout(doHide,500); //�ڼ��1000�����ִ���Ƿ����ش���
	}
	);
	
	//��Ҫ������ʱ���������߹�������
	$("#header_user_menu").hover(function(){ //������
		leftcanHide = false;    //��������
	},function(){
		leftcanHide = true;     //����Ƴ�������
		window.clearTimeout(t);
		var t = window.setTimeout(doHide,500);
	});
}
