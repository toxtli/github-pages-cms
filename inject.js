function init() {
  Aloha.ready( function() {
    //Aloha.jQuery('body').aloha();
    Aloha.jQuery('#instructions').aloha();
  });
}

function loadLibrary(url, next, extra) {  
  var s = document.createElement('script');
  s.type = 'text/javascript';
  if (extra) {
    for(var i in extra) {
      s[i] = extra[i];
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
  loadStyle('//www.carlostoxtli.com/github-pages-cms/aloha.css', function(){
      loadLibrary('//www.carlostoxtli.com/github-pages-cms/require.js', function(){
        loadLibrary('//www.carlostoxtli.com/github-pages-cms/aloha.js', function(){
          init();
        }, {"data-aloha-plugins":"common/ui,common/format,common/highlighteditables,common/link"});
      });
  });
}

loadEditor();
alert('Code injected');
