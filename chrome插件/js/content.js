function get_all_images() {
  var links  = [];
  var docs = [].slice.apply(window.frames);
  docs = docs.map(function(e) {
    return e.document;
  });
  docs.push(document);
  for(var i=0; i < docs.length; i++) {
    var images = get_document_images(docs[i]);
    links = links.concat(images);
  }

  return links;
}

function get_document_images(doc) {
  var imgs = doc.getElementsByTagName('img');
  var links = [].slice.apply(imgs);
  links = links.map(function(element) {
    return {src: element.src,width: element.width,height:element.height};
  });
  
  var all = document.all;
  for(var i=0; i != all.length; i++) {
    var e = all[i];
    if(e.nodeType == 1) {
      var url = "";
	  var width=0,height=0;
      if(e.currentStyle && e.currentStyle.backgroundImage) {
        url = e.currentStyle.backgroundImage
      } else if(e.style && e.style.backgroundImage) {
        url = e.style.backgroundImage;  
      }
      if(url !="" && /^url\(/.test(url)) {
        url =url.replace(/^url\(/, '').replace(/\)$/, '');      
		var img = new Image();
		img.src = url;
		if( img.complete )
		{
			width=img.width;
			height=img.height;
		}
		else
		{
			img.onload = function(){width=img.width;height=img.height;};
		}
        links.push({src: url,width:width,height:height});
      }
    }
  }

  return links;
}

function generate_response(imgs) {
  return {
      type : 'display-images', 
      imgs : imgs,
      data : {
        cookie : document.cookie,  
        title  : document.title,   
        pageUrl: location.href     
      }
  };
}
// listener
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) 
{
  switch (request.type) {
  case "display-all-images": 
    sendResponse(generate_response(get_all_images()));
    break;
  default:
    sendResponse({});
    break;
  }
});

