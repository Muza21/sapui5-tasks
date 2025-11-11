sap.ui.define(
  ["project1/controller/Base.controller", "project1/model/books"],
  function (BaseController, books) {
    "use strict";

    return BaseController.extend("project1.controller.App", {
      onInit: function () {
        const oBooksModel = books.createBooksModel();
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

      onOpenSortDialog: async function () {
        this.oDialog ??= await this.loadFragment({
          name: "project1.view.SortDialog",
        });

        this.oDialog.open();
      },

      onCloseDialog: function () {
        this.byId("SortDialog").close();
      },

      onCloseDialogWithSort: function () {
        if (!this.byId("SortDialog")) return;
        debugger;
        const oFieldCombo = this.byId("sortField");
        const oOrderCombo = this.byId("sortOrder");
        const sField = oFieldCombo.getSelectedKey();
        const sOrder = oOrderCombo.getSelectedKey();
        const oModel = this.getModel("booksModel");
        const aBooks = oModel.getProperty("/books");
        this.getView()
          .byId("booksTable")
          .getBinding("items")
          .sort(new sap.ui.model.Sorter(sField, sOrder !== "asc"));
        oModel.refresh();
        this.byId("SortDialog").close();
      },
    });
  }
);
