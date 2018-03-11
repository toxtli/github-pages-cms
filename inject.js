function init() {
  Aloha.ready( function() {
    //Aloha.jQuery('body').aloha();
    Aloha.jQuery('body').children().aloha();
  });
}

function loadLibrary(url, next, extra) {  
  var s = document.createElement('script');
  s.type = 'text/javascript';
  if (extra) {
    for(var i in extra) {
      s.setAttribute(i, extra[i]);
    }
  }
  if (next) {
    s.onload = next;
  }
  s.src = url;
  (top.document.getElementsByTagName('head')[0] || top.document.body).appendChild(s);
  return s;
}

function loadStyle(url, next) {  
  var s = document.createElement('link');
  s.rel = 'stylesheet';
  s.type = 'text/css';
  s.href = url;
  if (next) {
    s.onload = next;
  }
  (top.document.getElementsByTagName('head')[0] || top.document.body).appendChild(s);
  return s;
}

function loadEditor() {
  loadStyle('//www.carlostoxtli.com/github-pages-cms/css/aloha.css', function(){
      loadLibrary('//www.carlostoxtli.com/github-pages-cms/lib/require.js', function(){
        loadLibrary('//www.carlostoxtli.com/github-pages-cms/lib/aloha.js', function(){
          init();
        }, {"data-aloha-plugins":"common/ui,common/format,common/table,common/list,common/link,common/highlighteditables,common/undo"});
        //common/ui,common/format,common/table,common/list,common/link,common/highlighteditables,common/undo,common/contenthandler,common/paste,common/characterpicker,common/commands,common/block,common/image,common/abbr,common/horizontalruler,common/align,common/dom-to-xhtml,extra/textcolor,extra/formatlesspaste,extra/hints,extra/toc,extra/headerids,extra/listenforcer,extra/metaview,extra/numerated-headers,extra/ribbon,extra/textcolor,extra/wai-lang,extra/linkbrowser,extra/imagebrowser,extra/cite
      });
  });
}

loadEditor();
//alert('Code injected');
