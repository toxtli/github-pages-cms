function loadLibrary(url, next) {  
  var s = document.createElement('script');
  s.type = 'text/javascript';
  s.src = url;
  (top.document.body || top.document.getElementsByTagName('head')[0]).appendChild(s);
  return s;
}

function loadLibraries() {
  if(typeof jQuery=='undefined') {
    var s = loadLibrary('//code.jquery.com/jquery-3.3.1.js');
    s.onload = loadRaptor;
  } else {
    loadRaptor();
  }
}

function loadRaptor() {
  loadLibrary('//www.carlostoxtli.com/github-pages-cms/raptor.js');
  s.onload = init;
}

function init() {
  $('body').raptor();
}

loadLibraries();
alert('Code injected');
