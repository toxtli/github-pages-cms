function loadLibrary(url) {  
  var s = document.createElement('script');
  s.type = 'text/javascript';
  s.src = url;
  (top.document.body || top.document.getElementsByTagName('head')[0]).appendChild(s);
  return s;
}

function loadLibraries() {
  loadLibrary('//www.carlostoxtli.com/github-pages-cms/raptor.js');
  if(typeof jQuery=='undefined') {
    var s = loadLibrary('//code.jquery.com/jquery-3.3.1.js');
    s.onload = init;
  } else {
    init();
  }
}

function init() {
  $('body').raptor();
}

loadLibraries();
alert('Code injected');
