import xss from 'xss';

export default (content_html) => {

  let _content_html = content_html || '';

  _content_html = _content_html.replace(/<[^>]+>/g,"");
  _content_html = _content_html.replace(/(^\s*)|(\s*$)/g, "");

  if (!content_html || !_content_html) {
    return '提交内容不能为空'
  }

  // content and conrent_html
  // content = xss(content, {
  //   whiteList: {},
  //   stripIgnoreTag: true,
  //   onTagAttr: (tag, name, value, isWhiteAttr) => ''
  // });

  content_html = xss(content_html, {
    whiteList: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt'],
      p: [],
      div: [],
      br: [],
      blockquote: [],
      li: [],
      ol: [],
      ul: [],
      strong: [],
      em: [],
      u: [],
      pre: [],
      b: [],
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: [],
      h7: []
    },
    stripIgnoreTag: true,
    onIgnoreTagAttr: function (tag, name, value, isWhiteAttr) {
      if (tag == 'div' && name.substr(0, 5) === 'data-') {
        // 通过内置的escapeAttrValue函数来对属性值进行转义
        return name + '="' + xss.escapeAttrValue(value) + '"';
      }
    }
  });

  let _contentHTML = content_html
  _contentHTML = _contentHTML.replace(/<img[^>]+>/g,"1")
  _contentHTML = _contentHTML.replace(/<[^>]+>/g,"")

  if (!content_html || _contentHTML == '') {
    return '提交内容不能为空'
  }

  return '';
  
}