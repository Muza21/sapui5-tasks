sap.ui.define(
  ["sapui5-tasks/controller/Base.controller", "sapui5-tasks/model/models"],
  function (BaseController, models) {
    "use strict";

    return BaseController.extend("sapui5-tasks.controller.App", {
      onInit: function () {
        const oBooksModel = models.createBooksModel();
        this.setModel(oBooksModel, "booksModel");
      },

      onAddRecord: function () {
        const oModel = this.getModel("booksModel");
        const aBooks = oModel.getProperty("/books");
        const iMaxIdNum = aBooks.reduce((iMax, oBook) => {
          const iNum = parseInt(oBook.ID.slice(1), 10);
          return Math.max(iMax, iNum);
        }, 0);
        const sNextId = "b" + String(iMaxIdNum + 1).padStart(3, "0");
        aBooks.push({
          ID: sNextId,
          Name: "",
          Author: "",
          Genre: "",
          ReleaseDate: "",
          AvailableQuantity: 0,
        });
        oModel.refresh();
      },

      onDeleteRecord: function () {
        const oTable = this.byId("booksTable");
        const oModel = this.getModel("booksModel");
        const aBooks = oModel.getProperty("/books");
        const oSelected = oTable.getSelectedItem();
        if (oSelected) {
          const oContext = oSelected.getBindingContext("booksModel");
          const iIndex = parseInt(oContext.getPath().split("/").pop(), 10);
          aBooks.splice(iIndex, 1);
          oModel.refresh();
        }
      },
    });
  }
);
