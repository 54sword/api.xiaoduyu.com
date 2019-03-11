import xss from 'xss';

export default (content_html: string) => {

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
      h7: [],
      video: []
    },
    stripIgnoreTag: true,
    onIgnoreTagAttr: function (tag: string, name: string, value: string, isWhiteAttr: any) {
      if (tag == 'div' && name.substr(0, 5) === 'data-') {
        // 通过内置的escapeAttrValue函数来对属性值进行转义
        return name + '="' + xss.escapeAttrValue(value) + '"';
      }
    }
  });

  return content_html;
  
}