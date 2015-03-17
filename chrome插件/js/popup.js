function deactive() {
  window.close();
}

function init(){
   extension = chrome.extension.getBackgroundPage();
  $('#collectBtn').click(function(){
	   chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
			function(tabs){
			extension.collect_all({track_from: 'from_popup'}, tabs[0]);
		}
		);
		deactive();
  });
};

 $(document).ready(function(){
  init();
});

