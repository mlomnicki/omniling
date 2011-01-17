var utils = {
  hover : {
    capture : function(evt)
    {
      utils.hover.word = null;

      if (!evt.rangeParent || !evt.rangeParent.nodeType ||
        (evt.rangeParent.nodeType != Node.TEXT_NODE))
      {
        return;
      }

      var myWin = evt.originalTarget.ownerDocument.defaultView;

      utils.hover.mouseX = evt.screenX;
      utils.hover.mouseY = evt.screenY;

      if (utils.hover.mousemoveTimeoutId)
        window.clearTimeout(utils.hover.mousemoveTimeoutId);

      utils.hover.mousemoveTimeoutId = window.setTimeout(
        utils.hover.getPointedWord,
        500, 
        evt.rangeParent, 
        evt.rangeOffset,
        utils.hover.mouseX,
        utils.hover.mouseY,
        evt.ctrlKey);

      //log("utils.hover.capture ends");
    },

    getPointedWord : function(parnt, offset, x, y, isWithCtrl)
    {
      log("utils.hover.getPointedWord starts: offset:" + offset
        + ", x:" + x + ", y:" + y);

      utils.hover.word = null;

      if (utils.hover.mouseX != x || utils.hover.mouseY != y)
      {
        log("utils.hover.getPointedWord Mouse moved away");
        return;
      }

      var text = parnt.textContent;

      if (text && text.length > 0)
      {
        utils.hover.word = utils.hover.getWord(text, offset);

        if (isWithCtrl)
          lingpl.dicInline.translate(utils.hover.word, lingpl.popup.show, utils.hover.mouseX, utils.hover.mouseY);
      }

      log("utils.hover.getPointedWord ends");
    },

    getWord: function(text, offset)
    {
      log("utils.hover.getWord starts: text:" + text + ", offset:" + offset);

      var ch = text.charAt(offset);

      log("utils.hover.getWord charAt(offset):" + ch);

      if (!ch || ch.length == 0 || utils.hover.isSymbol(ch))
      {
        log("utils.hover.getWord: no word");
        return null;
      }

      var len = text.length;
      var s = offset;
      var e = offset + 1;

      while (s > 0)
      {
        s--;

        ch = text.charAt(s);

        if (utils.hover.isSymbol(ch))
        {
          // separator
          s++;
          break;
        }
      }

      while (e < len)
      {
        ch = text.charAt(e);

        if (utils.hover.isSymbol(ch))
        {
          // separator
          break;
        }

        e++;
      }

      var word = text.substring(s, e);

      log("utils.hover.getWord returns: " + word);

      return word;
    },

    isSymbol: function(ch)
    {
      if (ch < 'A' ||
        (ch > 'Z' && ch <'a') ||
        (ch > 'z' && ch <= '\x7f') ||
        (ch >= '\u0080' && ch <= '\u00BF') ||
        (ch >= '\u3000' && ch <= '\u303F') ||
        (ch >= '\uFF01' && ch <= '\uFF20') ||
        (ch >= '\uFF3B' && ch <= '\uFF40') ||
        (ch >= '\uFF5B' && ch <= '\uFF5E'))
      {
        return true;
      }
      else
        return false;
    }

  },

  mouseX: 0,
  mouseY: 0,

  tab: {
    open: function(url) {
      var win = Components.classes['@mozilla.org/appshell/window-mediator;1']
      .getService(Components.interfaces.nsIWindowMediator)
      .getMostRecentWindow('navigator:browser');
      win.openUILinkIn(url, 'tab');
    }
  }
}
