sap.ui.define([], () => {
  "use strict";

  return {
    dateDisplay: function (sDate) {
      const oDate = new Date(sDate);
      const oResourceBundle = this.getOwnerComponent()
        .getModel("i18n")
        .getResourceBundle();
      return oResourceBundle.getText("releaseDateByFullYear", [
        oDate.getFullYear(),
      ]);
    },
  };
});
