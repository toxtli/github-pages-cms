function init() {
  Aloha.ready( function() {
            Aloha.jQuery('body').aloha();
  });
}

function loadLibrary(url, next) {  
  var s = document.createElement('script');
  s.type = 'text/javascript';
  s.src = url;
  if (next) {
    s.onload = next;
  }
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
  loadLibrary('//www.carlostoxtli.com/github-pages-cms/aloha.js', function(){
      loadStyle('//www.carlostoxtli.com/github-pages-cms/aloha.css', function(){
        init();
      });
  });
}

function loadLibraries() {
  loadLibrary('//www.carlostoxtli.com/github-pages-cms/require.js', function(){
    if(typeof jQuery=='undefined') {
      var s = loadLibrary('//code.jquery.com/jquery-3.3.1.js', function(){
        loadEditor();
      });
    } else {
      loadEditor();
    }
  });
}

loadLibraries();
alert('Code injected');
