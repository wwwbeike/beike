
var t = null;
var content_load_ok = false;
var source_tab_id = null;
var request_data = {imgs: null, data: null};
var boardNum=4;
var selected=0;

function initialize () {
  var _this = t = this;
  var blocked_images = [];
  var accept_length  = 0;
  var wayixia_images_loading = 0;
  var wayixia_container = $('#wayixia-list');
  

  if(request_data.imgs) {
    _this.display_valid_images(request_data.imgs, request_data.data)();
  }
  
  // test code
  //drag_screen_images_begin();
  content_load_ok = true;
  console.log('content is loaded');
};

function refreshPage()
{
	$("#waterfall").empty();
	renderCollects();
}
		
function showSelect()
{
	$("#waterfall").delegate("div.batchCell[ischeck=no]","mouseover",function(){
			$(this).find(".batchImgOver").show();
	});
	$("#waterfall").delegate("div.batchCell[ischeck=no]","mouseout",function(){
			$(this).find(".batchImgOver").hide();
	});
}

function deactive() {
    back2page();
    window.close();
}

function back2page() {
  if(source_tab_id) {
    chrome.tabs.update(source_tab_id, {selected: true});
  }
}

function display_images(tab_id, packet) {
  source_tab_id = tab_id;
  if(content_load_ok) {
	var testCollects = [];
	var imgs = packet.imgs;
	var title = packet.data.title;
	for (var i = 0; i < imgs.length; i++) {
		var viewHeight = 350,imgWidth=236,imgHeight=350;
		if( imgs[i].width>0 ) imgWidth=imgs[i].width;
		if( imgs[i].height>0) imgHeight=imgs[i].height;
		if( imgs[i].width>0 && imgs[i].height>0)  viewHeight=imgs[i].height/imgs[i].width*236;
		var model = {
			imgUrl: imgs[i].src,
			height: viewHeight,
			imgWidth: imgWidth,
			imgHeight:imgHeight
		}
		testCollects.push(model);
	}

	var xwf = XUtil.XWaterfall({
		src: testCollects,
		initialSize: 50,
		colNum: boardNum,
		colWidth: 252,
		contentWidth: 252,
		fetchSize: 20,
		marginTop: 16,
		url: '',
		renderTo: $('#waterfall')[0],
		renderer: function (model) {
			var html = "<div class='batchCell' ischeck='no'><div class='batchImgHolder'>"+
					   "<img src='"+model.imgUrl+"' height='"+model.height+"'>"+
					   "<div class='batchImgOver'><div class=' btn collect rbtn '>采集</div><div class='selectBtn'></div>"+
					   "</div></div><div class='imgSize'>"+model.imgWidth+" x "+model.imgHeight+"</div>"+
					   "<textarea class='imgDescription' style='height: 36px;'>"+title+"</textarea></div>";
			return html;
		}
	});
	xwf.init();
  } else {
    request_data.imgs = packet.imgs;
    request_data.data = packet.data;
    initialize();
  }
}

			
$(document).ready(function(){

	if(screen.width>=1600) 
	{
		$("#headWapper").addClass("wrapper1600");
		$("#pageWapper").addClass("wrapper1600");
		boardNum=6;
	}
	else if( screen.width>=1360 )
	{
		$("#headWapper").addClass("wrapper1360");
		$("#pageWapper").addClass("wrapper1360");
		boardNum=5;
	}	
	else 
	{
		$("#headWapper").addClass("wrapper1280");
		$("#pageWapper").addClass("wrapper1280");
		boardNum=4;
	}
	window.onresize = function()
	{
		var flag=false;
		if(window.innerWidth>=1600)
		{
			$("#headWapper").removeClass();
			$("#pageWapper").removeClass();
			$("#headWapper").addClass("wrapper1600");
			$("#pageWapper").addClass("wrapper1600");
			if(boardNum!=6)
			{
				boardNum=6;
				flag=true;
			}
			if(flag) refreshPage();
		}
		else if(window.innerWidth>=1360)
		{
			$("#headWapper").removeClass();
			$("#pageWapper").removeClass();
			$("#headWapper").addClass("wrapper1360");
			$("#pageWapper").addClass("wrapper1360");
			if(boardNum!=5)
			{
				boardNum=5;
				flag=true;
			}
			if(flag) refreshPage();
		}
		else 
		{
			$("#headWapper").removeClass();
			$("#pageWapper").removeClass();
			$("#headWapper").addClass("wrapper1280");
			$("#pageWapper").addClass("wrapper1280");
			if(boardNum!=4)
			{
				boardNum=4;
				flag=true;
			}
			if(flag) refreshPage();
		}
	}
	initialize();
	headerHover();
	/*backtotp*/
	returnToTop();
	showSelect();
	
	$("#waterfall").delegate("div.selectBtn","click",function(){
			var parent = $(this).parents(".batchCell");
			var state = parent.attr("ischeck");
			if(state=='no')
			{
				if(selected>=10) alert("您最多只能选取十张图片！");
				else 
				{
					parent.attr("ischeck","yes");
					$(this).css('background-position','0 -40px');
					selected++;
				}
			}
			else 
			{
				parent.attr("ischeck","no");
				$(this).css('background-position','0 0');
				selected--;
			}
			$("#selected").html(selected);
			$("div.batchInfo").show();
			$("div.batchButtons").show();
			$("#collectLogo").hide();
	});
	$("#operCancel").click(function(){
		$("div.batchInfo").hide();
		$("div.batchButtons").hide();
		$("#collectLogo").show();
		selected=0;
		$("div.selectBtn").css('background-position','0 0');
		$("div.batchCell").attr('ischeck','no');
		$("div.batchImgOver").hide();
	});
	$("#operConfirm").click(function(){
		var images = [];
		$("div.batchCell[ischeck=yes]").each(function(){
			var url = $(this).find("img").attr("src");
			images.push(url);
		});
		console.log(images);
		$.post("",{ 'images[]': images },function(url){
			if(url) window.open(url,"batchCollect",'height=400,width=650,top=40%,left=40%');
		});
	});
});



