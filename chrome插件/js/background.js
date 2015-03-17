var display_tab_id = null;

var contexts = ["page", "image", "selection","editable","link","video","audio"];
chrome.contextMenus.create({
  "title": "采集到贝壳", 
  "contexts":contexts,  
  "onclick": function(info, tab) { 
    if(info.mediaType == 'image') {
      collect_single(info, tab); 
    } else {
      collect_all(info, tab);  
    }
  }
});

function collect_single(info, tab) {
  var target = info.srcUrl;
  window.open('http://www.beike.com/'+target,'beikeCollect','height=400,width=650,top=40%,left=40%');
}

function collect_all(info, tab) {  
  chrome.tabs.sendRequest(tab.id, { type : "display-all-images"}, function(res) {
    res = res || {};
    res.track_from = info.track_from;
    create_display_page(tab.id, res); 
  });
}

function find_display_view(url) {
  var views = chrome.extension.getViews();
  for(var i=0; i < views.length; i++) {
    var view = views[i];
    if(view.location.href == url) {
      return view;
    }
  }
}

function create_display_page(context_tab_id,  res) {  
  var manager_url = chrome.extension.getURL("display.html");
  focus_or_create_tab(manager_url, (function(id, res) { return function(view) { view.display_images(id, res) } })(context_tab_id, res));
}


function focus_or_create_tab(url, func) {
	var view = find_display_view(url);
	if(view) {
	view.focus();
	func(view);
	} else {
   chrome.tabs.onUpdated.addListener(function listener(tab_id, changed_props) {
      if(tab_id != display_tab_id || changed_props.status != "complete")
        return;
      chrome.tabs.onUpdated.removeListener(listener);
      var view = find_display_view(url);
      if(view) {
        view.focus();
        func(view);
      }
    });
    chrome.tabs.create({"url":url, "selected":true}, function on_tab_created(tab) { display_tab_id = tab.id; });
  }
}


