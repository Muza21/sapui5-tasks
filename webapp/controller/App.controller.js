sap.ui.define(
  [
    "sapui5-tasks/controller/Base.controller",
    "sapui5-tasks/model/models",
    "sap/m/MessageToast",
  ],
  function (BaseController, models, MessageToast) {
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

      onOpenSortDialog: async function () {
        this.oDialog ??= await this.loadFragment({
          name: "sapui5-tasks.view.SortDialog",
        });

        this.oDialog.open();
      },

      onCloseDialog: function () {
        this.byId("SortDialog").close();
      },

      onCloseDialogWithSort: function () {
        if (!this.byId("SortDialog")) return;

        const oFieldCombo = this.byId("sortField");
        const oOrderCombo = this.byId("sortOrder");
        const sField = oFieldCombo.getSelectedKey();
        const sOrder = oOrderCombo.getSelectedKey();
        const oModel = this.getModel("booksModel");
        const aBooks = oModel.getProperty("/books");
        if (sField) {
          aBooks.sort((a, b) => {
            let valA = a[sField];
            let valB = b[sField];
            if (typeof valA === "number" && typeof valB === "number") {
              return sOrder === "asc" ? valA - valB : valB - valA;
            }
            if (sField === "ReleaseDate") {
              valA = new Date(valA);
              valB = new Date(valB);
              return sOrder === "asc" ? valA - valB : valB - valA;
            }
            valA = valA.toString().toLowerCase();
            valB = valB.toString().toLowerCase();
            if (valA < valB) return sOrder === "asc" ? -1 : 1;
            if (valA > valB) return sOrder === "asc" ? 1 : -1;
            return 0;
          });
        }
        oModel.refresh();
        this.byId("SortDialog").close();
      },
    });
  }
);
