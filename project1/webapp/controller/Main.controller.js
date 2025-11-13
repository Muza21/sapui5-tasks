sap.ui.define(
  [
    "project1/controller/Base.controller",
    "project1/model/books",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
  ],
  function (BaseController, books, Filter, FilterOperator, JSONModel) {
    "use strict";

    return BaseController.extend("project1.controller.App", {
      onInit: function () {
        const oBooksModel = books.createBooksModel();
        this.setModel(oBooksModel, "booksModel");
      },

      onAddRecord: function () {
        const oModel = this.getModel("booksModel");
        const aBooks = oModel.getProperty("/books");
        const oBookData = this.oDialog.getModel("book").getData();
        aBooks.push({
          ID: Date.now(),
          ...oBookData,
          editable: false,
        });
        oModel.refresh();
        this.oDialog.close();
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
        this.oDialog.close();
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
        const oFieldCombo = this.byId("sortField");
        const oOrderCombo = this.byId("sortOrder");
        const sField = oFieldCombo.getSelectedKey();
        const sOrder = oOrderCombo.getSelectedKey();
        const oModel = this.getModel("booksModel");
        this.getView()
          .byId("booksTable")
          .getBinding("items")
          .sort(new sap.ui.model.Sorter(sField, sOrder !== "asc"));
        oModel.refresh();
        this.byId("SortDialog").close();
      },

      onFilterBooks: function () {
        const sBookName = this.getView().byId("titleFilter").getValue();
        const sGenre = this.getView().byId("genreFilter").getSelectedKey();
        const oBinding = this.getView().byId("booksTable").getBinding("items");

        const aFilters = [];
        if (sBookName) {
          aFilters.push(new Filter("Name", FilterOperator.Contains, sBookName));
        }
        if (sGenre !== "All Genres") {
          aFilters.push(new Filter("Genre", FilterOperator.EQ, sGenre));
        }
        oBinding.filter(aFilters);
      },

      onEditToggle: function (oEvent) {
        const oButton = oEvent.getSource();
        const oContext = oButton.getBindingContext("booksModel");
        const oModel = oContext.getModel();
        const sPath = oContext.getPath();
        const bEditable = oModel.getProperty(sPath + "/editable");
        oModel.setProperty(sPath + "/editable", !bEditable);
      },

      onOpenConfirmDialog: async function () {
        this.oDialog ??= await this.loadFragment({
          name: "project1.view.ConfirmDialog",
        });

        this.oDialog.open();
      },

      onCloseConfirmDialog: function () {
        this.byId("ConfirmDialog").close();
      },

      onOpenFormDialog: async function () {
        this.oDialog ??= await this.loadFragment({
          name: "project1.view.FormDialog",
        });

        const oFormModel = new JSONModel({
          Name: "",
          Author: "",
          Genre: "",
          ReleaseDate: "",
          AvailableQuantity: "",
        });

        this.oDialog.setModel(oFormModel, "book");
        this.oDialog.open();
      },
    });
  }
);
