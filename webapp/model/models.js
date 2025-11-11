sap.ui.define(["sap/ui/model/json/JSONModel"], function (JSONModel) {
  "use strict";

  return {
    createBooksModel: function () {
      const oData = {
        books: [
          {
            ID: "b001",
            Name: "Limitless",
            Author: "Jim Kwik",
            Genre: "Self-improvement",
            ReleaseDate: "2020-04-07",
            AvailableQuantity: 5,
          },
        ],
      };
      return new JSONModel(oData);
    },
  };
});
