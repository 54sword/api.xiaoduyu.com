import config from '@config';

export default (content: string) => {
  
  const main = `
    <table width="100%" height="100%" bgcolor="#eceef0" style="min-width: 348px; font-family: 'Helvetica Neue', 'Luxi Sans', 'DejaVu Sans', Tahoma, 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;" border="0" cellspacing="0" cellpadding="0">
      <tr height="32px"></tr>
      <tr align="center">
        <td width="32px"></td>
        <td>
          <table style="max-width: 600px;" width="100%" border="0" cellspacing="0" cellpadding="0">

            <!-- head -->
            <tr>
              <td>
                <table style="border-top-left-radius: 3px; border-top-right-radius: 3px;" bgcolor="#f9f9f9" width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr><td height="15px"></td></tr>
                  <tr>
                    <td width="15px"></td>
                    <td>
                      <a href="${config.officialWebsite}" target="_blank" style="text-decoration:none;">
                      <table>
                        <tr>
                          <td><img src="${config.officialWebsite}/favicon.png" height="30" art="${config.name}" /></td>
                          <td style="font-size:20px; color:#0084ff;">
                            ${config.name}
                          </td>
                        </tr>
                      </table>
                      </a>
                    </td>
                    <td width="100px" align="center">
                    </td>
                  </tr>
                  <tr><td height="15px"></td></tr>
                </table>
              </td>
            </tr>
            <!-- head end -->

            <!-- body -->
            <tr>
              <td>
                <table style="border-bottom: 1px solid #eeeeee;" bgcolor="#fff"  width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr><td height="30px"></td></tr>

                  <tr>
                    <td width="32px"></td>
                    <td style="padding:0px; font-size:14px; color:#888;">
                      ${content}
                    </td>
                    <td width="32px"></td>
                  </tr>

                  <tr><td height="30px"></td></tr>
                </table>
              </td>
            </tr>
            <!-- body end -->

            <!-- footer -->
            <tr>
              <td>
                <table style="border-bottom-left-radius: 3px; border-bottom-right-radius: 3px;" bgcolor="#fdfdfd" width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr><td height="20px"></td></tr>
                  <tr>
                    <td width="32px"></td>
                    <td style="font-size:12px; color:#888; line-height:22px; word-break:break-all;">
                      此电子邮件地址无法接收回复。要就此提醒向我们提供反馈，<a href="mailto:${config.email.feedback}?subject=问题反馈[${config.name}]" style="color:#14a0f0; text-decoration: none;" target="_blank">请点击此处。</a><br />
                      如需更多信息，请访问 <a href="${config.officialWebsite}" style="color:#14a0f0; text-decoration: none;" target="_blank">${config.name}</a>。
                    </td>
                    <td width="32px"></td>
                  </tr>
                  <tr><td height="20px"></td></tr>
                </table>
              </td>
            </tr>
            <!-- footer end -->

          </table>
        </td>
        <td width="32px"></td>
      </tr>
      <tr height="32px"></tr>
    </table>
  `

  return main;
}