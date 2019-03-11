

var validate = {

  /*
    * 昵称格式检测
    * @param  {string} string 昵称
    * @return {string}        结果信息
    */
  nickname: function(string: string): string {

    var result = 'ok';
    // var regex = /^[a-z\d\u4E00-\u9FA5\-\_\.]+$/i;
    // var regex2 = /^([a-z\d\u4E00-\u9FA5])(.*)([a-z\d\u4E00-\u9FA5])$/i;

    switch (true) {
      case !string:
        result = 'blank error';
        break;
      case string.replace(/ /g, '').length == 0:
        result = 'blank error';
        break;
      case string.replace(/[^\x00-\xff]/g, 'xx').length > 20:
        result = 'invalid error';
        break;
      /*
      case !regex2.test(string):
        result = 'format error';
        break;
      case !regex.test(string):
        result = 'format error';
        break;
      */
    }
    return result;
  },

  /*
    * 邮箱地址格式检测
    * @param  {string} string 邮箱地址
    * @return {string}        结果信息
    */
  email: function(string: string): string {

    var regex = /^([a-z0-9]{1,})([a-z0-9\.\_\-]{0,})@([a-z0-9\-]{1,})\.(?:[a-z]{2,}\.[a-z]{2,}|[a-z]{2,})$/;
    var result = 'ok';

    switch (true) {
      case !string:
        result = 'blank error';
        break;
      case string.length > 30:
        result = 'too long error';
        break;
      case !regex.test(string):
        result = 'invalid error';
        break;
    }
    return result;
  },

  /*
    * 密码格式检测
    * @param  {string} string 密码
    * @return {string}        结果信息
    */
  password: function(string: string): string {

    var result = 'ok';

    switch (true) {
      case !string:
      result = 'blank error';
        break;
      case string.length < 6:
        result = 'invalid error';
        break;
      case string.length > 30:
        result = 'too long error';
        break;
    }
    return result;
  },

  /*
    * 日期检测
    * @param  {string} date 日期格式2014-11-29
    * @return {string}      结果信息
    */
  date: function(date: string): string {

    var regex = /^(\d{4})\-(\d{2})\-(\d{2})$/;

    var year = new Date(date).getFullYear();
    var month: any = new Date(date).getMonth() + 1;
    var day = new Date(year).getDate();
    var days = new Date(year, parseInt(month, 10), 0).getDate();

    var result = 'ok';

    if (!regex.test(date) ||
      isNaN(year) || isNaN(month) || isNaN(day) || isNaN(days) ||
      year <= 0 || month <= 0 || month > 12 || day <= 0 || day > 31 || day > days
    ) {
      result = 'invalid error';
    }
    return result;
  },

  /*
    * 日期格式检测
    * @param  {number} year 年
    * @param  {number} month 月
    * @param  {number} day 日
    * @return {string}        结果信息
    */
  birthday: function(date: string): string {

    var result = validate.date(date);

    if (result === 'ok') {
      var currentYear = new Date().getFullYear();
      var year = new Date(date).getFullYear();
      if (year > currentYear || year < currentYear - 110) {
        result = 'invalid error';
      }
    }

    return result;
  },

  /*
    * 身高范围检测
    * @param  {number} height 身高
    * @return {string}        结果信息
    */
  /*
  height: function(height) {

    var result = 'ok';

    if (isNaN(height) || height <= 54 || height > 272) {
      result = 'invalid error';
    }
    return result;
  },
  */

  /*
    * 体重范围检测
    * @param  {number} weight 体重
    * @return {string}        结果信息
    */
  /*
  weight: function(weight) {

    var result = 'ok';

    if (isNaN(weight) || weight <= 2 || weight > 635) {
      result = 'invalid error';
    }
    return result;
  },
  */

  /*
    * 血型
    * @param  {string} blood 体重
    * @return {string}        结果信息
    */
  blood: function(blood: string): string {
    var result = 'ok';
    if (!blood || blood === 'A' || blood === 'B' || blood === 'AB' || blood === 'O') {
    } else {
      result = 'invalid error';
    }
    return result;
  },

  /*
    * 性别
    * @param  {string or number} gender 性别, 1男／0女
    * @return {string}        结果信息
    */
  gender: function(gender: number): string {
    var result = 'ok';
    if (gender === 1 || gender === 0) {
    } else {
      result = 'invalid error';
    }
    return result;
  },

  /*
  getFeedContentLength: function(content: string): number {

    if (content === '<br>') return 0;

    // 加入的表情当作一个字符
    content = content.replace(/<img.*?>/g, "1");
    content = content.replace(/<br>/g, "1");

    // 过虑只有空的输入
    if (content.length === 0 || (content.replace(/<.*?>/g, "").replace(/&nbsp;/g, "").replace(/\s/g, "")).length === 0) {
      return 0;
    }

    // 加入的表情当作一个字符
    content = content.replace(/<img.*?>/g, "1");
    // 输入框当作一个字符
    content = content.replace(/<input.*?>/g, "1");
    // 其他标签替换成空
    content = content.replace(/<.*?>/g, "");
    // 将text中，包含&gt;的内容，进行替换
    // 写入的<会被转化成assic码，因此要转换后计算
    content = content.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ");

    return content.length;

  }
 
  feedContent: function(content) {

    if (content === '<br>') return 0;

    // 加入的表情当作一个字符
    content = content.replace(/<img.*?>/g, "1");
    content = content.replace(/<br>/g, "1");

    // 过虑只有空的输入
    if (content.length === 0 || (content.replace(/<.*?>/g, "").replace(/&nbsp;/g, "").replace(/\s/g, "")).length === 0) {
      return 'blank error';
    }

    // 输入框当作一个字符
    content = content.replace(/<input.*?>/g, "1");
    // 其他标签替换成空
    content = content.replace(/<.*?>/g, "");
    // 将text中，包含&gt;的内容，进行替换
    // 写入的<会被转化成assic码，因此要转换后计算
    content = content.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ");

    if (content.length > 400) {
      return 'too long error';
    } else {
      return 'ok';
    }

  }
  */

}


export default validate