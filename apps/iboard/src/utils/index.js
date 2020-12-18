const encode = str => {
  var s = '';
  if (str.length == 0) return '';
  s = str.replace(/&/g, '&amp;');
  s = s.replace(/</g, '&lt;');
  s = s.replace(/>/g, '&gt;');
  s = s.replace(/\s/g, '&nbsp;');
  s = s.replace(/\'/g, '&#39;');
  s = s.replace(/\"/g, '&quot;');
  return s;
};

const decode = str => {
  var s = '';
  if (str.length == 0) return '';
  s = str.replace(/&amp;/g, '&');
  s = s.replace(/&lt;/g, '<');
  s = s.replace(/&gt;/g, '>');
  s = s.replace(/&nbsp;/g, ' ');
  s = s.replace(/&#39;/g, "'");
  s = s.replace(/&quot;/g, '"');
  return s;
};

const getContent = (type, notes) => {
  type = type || 'json';
  notes = notes || [];
  let content = '';
  if (type === 'json') {
    const obj = {};
    obj.notes = notes.map(item => {
      return {
        date: `${item.createDate} ${item.createTime}`,
        content: item.content,
      };
    });
    content = JSON.stringify(obj, null, 4);
  } else {
    content = notes
      .map(item => {
        item.content = decode(item.content);
        return `${item.createDate} ${item.createTime}\r\n${item.content} \r\n\r\n`;
      })
      .join('');
  }
  return content;
};

module.exports = {
  encode: encode,
  decode: decode,
  getContent: getContent,
};
