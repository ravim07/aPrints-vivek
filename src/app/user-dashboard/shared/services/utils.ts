declare var $: any;
export const copyToClipboard = (str: string): void => {
  const el = document.createElement('textarea');
  el.value = str;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  const selected =
    document.getSelection().rangeCount > 0
      ? document.getSelection().getRangeAt(0)
      : false;
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  if (selected) {
    document.getSelection().removeAllRanges();
    document.getSelection().addRange(selected);
  }
};

export const apiCopyToClipboard = (str: string): Promise<any> => {
  return navigator.clipboard.writeText(str);
};

export const cleanupHtml = (content: string) => {
  const parsedHtml = $(content);
  const strings = ['\xa0'];
  parsedHtml
    .filter('p')
    .each(async function (i, elem) {
      const o = $(elem);
      // console.log(elem, o, o.text(), strings.includes(o.text()));
      if (strings.includes(o.text())) {
        o.remove();
      }
    })
    .end();
  return $('<div>').append(parsedHtml).html();
};
