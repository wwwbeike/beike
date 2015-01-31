/*
* header风格控制
*/

var leftcanHide = false; //标记左菜单栏是否可隐藏层
var rightcanHide =false;//标记右菜单栏是否可隐藏

function doHide(){   //是否隐藏层中这里处理
	if(leftcanHide)
		$("#header_main_menu").hide();
	if(rightcanHide)
		$("#header_user_menu").hide();
}
function xxx(){}
function headerStyle()
{
	$("#header_main_menu").hide();   //先将层隐藏起来
	$("#header_user_menu").hide();

	
	$("#left_menu_nav").hover(function(){ //鼠标进入
		$(".nav_icon").css("background","url('image/menu_sprite.svg')-50px 0 no-repeat");
		$("#header_main_menu").show(); //显示
		leftcanHide = false; //标记不可隐藏
	},function(){
		$(".nav_icon").css("background","url('image/menu_sprite.svg')0 0 no-repeat");	
		leftcanHide = true; //鼠标移出可隐藏
		window.clearTimeout(t); //将上次的定时器清除,重新设置
		var t = window.setTimeout(doHide,500); //在间隔1000毫秒后执行是否隐藏处理
	}
	);
	
	//主要依靠定时器来将两者关联起来
	$("#header_main_menu").hover(function(){ //鼠标进入
		$(".nav_icon").css("background","url('image/menu_sprite.svg')-50px 0 no-repeat");
		leftcanHide = false;    //不可隐藏
	},function(){
	$(".nav_icon").css("background","url('image/menu_sprite.svg')0 0 no-repeat");
		leftcanHide = true;     //鼠标移出可隐藏
		window.clearTimeout(t);
		var t = window.setTimeout(doHide,500);
	});
	
	/*user的hover事件*/
	$("#right_menu_nav").hover(function(){ //鼠标进入
		$("#header_user_menu").show(); //显示
		rightcanHide = false; //标记不可隐藏
	},function(){
		rightcanHide = true; //鼠标移出可隐藏
		window.clearTimeout(t); //将上次的定时器清除,重新设置
		var t = window.setTimeout(doHide,500); //在间隔1000毫秒后执行是否隐藏处理
	}
	);
	
	//主要依靠定时器来将两者关联起来
	$("#header_user_menu").hover(function(){ //鼠标进入
		leftcanHide = false;    //不可隐藏
	},function(){
		leftcanHide = true;     //鼠标移出可隐藏
		window.clearTimeout(t);
		var t = window.setTimeout(doHide,500);
	});
}
