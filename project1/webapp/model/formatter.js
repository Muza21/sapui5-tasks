sap.ui.define([], () => {
  "use strict";

  return {
    dateDisplay: function (sDate) {
      const oDate = new Date(sDate);
      return "Published: " + oDate.getFullYear();
    },
  };
});
