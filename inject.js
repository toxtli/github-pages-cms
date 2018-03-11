function loadLibrary(url) {  
  var s = document.createElement('script');
  s.type = 'text/javascript';
  s.src = url;
  (top.document.body || top.document.getElementsByTagName('head')[0]).appendChild(s);
}

function loadLibraries() {
  loadLibrary('//www.carlostoxtli.com/github-pages-cms/raptor.js');
  if(typeof jQuery=='undefined') {
    loadLibrary('//code.jquery.com/jquery-3.3.1.js');
  }
}

function init() {
  $('body').raptor();
}

loadLibraries();
init();
alert('Code injected');
