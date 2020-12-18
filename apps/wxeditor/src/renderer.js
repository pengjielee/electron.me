var { clipboard } = require('electron');
var { dialog, app } = require('electron').remote;
var cheerio = require('cheerio');
var path = require('path');
var request = require('request');
var fs = require('fs');
var pell = require('pell');

var content = '';

var savePath = path.join(app.getAppPath(), '../temp/');
if (process.env.NODE_ENV === 'development') {
  savePath = path.join(__dirname, '/uploads/');
}

fs.stat(savePath, function (err, stats) {
  if (err) {
    fs.mkdir(savePath, err => {
      console.log(err);
    });
  }
});

var isProcessed = false;

var masker = document.querySelector('#masker');

var editor = pell.init({
  element: document.querySelector('#editor'),
  actions: [
    'bold',
    'italic',
    'underline',
    'strikethrough',
    'heading1',
    'heading2',
    'paragraph',
    'olist',
    'ulist',
    'code',
    'line',
  ],
  onChange: function (html) {
    content = html;
  },
});

var download = function (uri, filename, callback) {
  if (uri) {
    request.head(uri, function (err, res, body) {
      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
  }
};

var upload = function (filename, callback) {
  var formData = {
    Filename: 'sjb.png',
    USER: 'leonayang',
    file: fs.createReadStream(filename),
  };
  request.post(
    {
      url: 'http://c.shijiebang.com/op/opfileupload/',
      formData: formData,
    },
    function (err, res, body) {
      if (err) {
        console.log('err');
      }
      callback(res);
    },
  );
};

document.querySelector('#process').addEventListener('click', function (argument) {
  console.log(isProcessed);
  if (isProcessed) {
    return;
  }
  var $ = cheerio.load(content);
  var current = 0;
  var total = $('img').length;
  if (total > 0) {
    masker.style.display = 'block';
    $('img').each(function (index, item) {
      var filesrc = $(item).attr('src');
      var filelink = $(item).attr('data-src') || filesrc;
      var filename = path.join(savePath, Math.random().toString().split('.').pop() + '.jpg');

      download(filelink, filename, function (dfile) {
        upload(filename, function (res) {
          var data = JSON.parse(res.body);
          filesrc = filesrc.replace(/&/g, '&amp;');
          content = content.replace(filesrc, data.file);
          current++;
          if (current === total) {
            var keyword = 'crossorigin="anonymous"';
            var reg = new RegExp('' + keyword + '', 'g');
            var keyword2 = 'data-src';
            var reg2 = new RegExp('' + keyword2 + '', 'g');
            content = content.replace(reg, '');
            content = content.replace(reg2, 'data-sjb');
            editor.content.innerHTML = content;
            isProcessed = true;
            masker.style.display = 'none';
            dialog.showMessageBox({
              message: '共发现' + total + '张图片，处理成功' + current + '张。',
            });
          }
        });
      });
    });
  } else {
    editor.content.innerHTML = content;
  }
});

document.querySelector('#reset').addEventListener('click', function (argument) {
  editor.content.innerHTML = '';
  isProcessed = false;
  masker.style.display = 'none';
  content = '';
  fs.readdir(savePath, function (err, files) {
    if (err) {
      console.log(err);
    }
    files.forEach(function (item, index) {
      fs.unlinkSync(path.join(savePath, item));
    });
  });
});

document.querySelector('#copy').addEventListener('click', function (argument) {
  if (content.length > 0) {
    clipboard.writeText(content);
    dialog.showMessageBox({ message: '已复制到剪贴板。' });
  }
});
