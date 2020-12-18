var { dialog, app } = require('electron').remote;
var { ipcRenderer } = require('electron');
var path = require('path');
var fs = require('fs');
var MarkdownIt = require('markdown-it');
var md = new MarkdownIt();

var $content = document.getElementById('content');
var $preview = document.getElementById('preview');
var $save = document.getElementById('save');
var $clear = document.getElementById('clear');
var $spliter = document.getElementById('spliter');

$content.onkeyup = function () {
  var value = $content.value;
  if (value) {
    var html = md.render(value);
    $preview.innerHTML = html;
  }
};

$save.onclick = function () {
  ipcRenderer.send('open-directory-dialog');
  ipcRenderer.on('select-directory', function (e, filePath) {
    if (filePath) {
      var content = $content.value;
      var fileName = path.resolve(filePath, Date.now() + '.md');
      fs.writeFile(fileName, content, 'utf8', function (err) {
        if (!err) {
          dialog.showMessageBox({ message: '保存成功' });
        }
      });
    }
  });
};

$clear.onclick = function () {
  $content.value = '';
  $preview.innerHTML = '';
};

function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

var minWidth = 200;
var maxStep = 10;

$spliter.onmousedown = function (e) {
  var initX = e.clientX;
  var initWidth = window.innerWidth / 2;

  document.onmousemove = debounce(function (e) {
    var moveX = e.clientX;
    var deltaX = 0;
    if (moveX > initX) {
      deltaX = moveX - initX;
      if (deltaX > maxStep) {
        deltaX = maxStep;
      }
      var width = initWidth - deltaX;
      if (width < minWidth) {
        width = minWidth;
      }
      $preview.style.width = width + 'px';
      $content.style.width = '100%';
    } else {
      deltaX = initX - moveX;
      if (deltaX > maxStep) {
        deltaX = maxStep;
      }
      var width = initWidth - deltaX;
      if (width < minWidth) {
        width = minWidth;
      }
      $content.style.width = width + 'px';
      $preview.style.width = '100%';
    }
  }, 50);

  document.onmouseup = function (e) {
    document.onmousemove = null;
    document.onmouseup = null;
  };
};

window.onresize = debounce(function () {
  var width = window.innerWidth / 2;
  width = width - 2;
  $preview.style.width = width + 'px';
  $content.style.width = width + 'px';
}, 200);
