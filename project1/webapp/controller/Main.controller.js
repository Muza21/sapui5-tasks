sap.ui.define(
  [
    "project1/controller/Base.controller",
    "project1/model/books",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (BaseController, books, Filter, FilterOperator) {
    "use strict";

    return BaseController.extend("project1.controller.App", {
      onInit: function () {
        const oBooksModel = books.createBooksModel();
        const aGenres = [
          ...new Set(
            oBooksModel.getProperty("/books").map((book) => book.Genre)
          ),
        ];
        aGenres.unshift("All Genres");
        const oGenresModel = new sap.ui.model.json.JSONModel(aGenres);
        this.setModel(oBooksModel, "booksModel");
        this.setModel(oGenresModel, "genresModel");
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

      onEditPress: function (oEvent) {
        const oButton = oEvent.getSource();
        const oInput = oButton.getParent().getCells()[0];
        oButton.setText("Save");
        oButton.setIcon("sap-icon://save");
        oButton.attachPress(this.onSavePress.bind(this));
        oButton.detachPress(this.onEditPress);
        oInput.setEditable(true);
        oInput.getValue();
      },

      onSavePress: function (oEvent) {
        const oButton = oEvent.getSource();
        const oRow = oButton.getParent();
        const oInput = oRow.getCells()[0];
        const oBook = oRow.getBindingContext("booksModel");
        oButton.setText("Edit Title");
        oButton.setIcon("sap-icon://edit");
        oButton.attachPress(this.onEditPress.bind(this));
        oButton.detachPress(this.onSavePress);
        oInput.setEditable(false);
        oBook.getModel().setProperty("Name", oInput.getValue(), oBook);
      },
    });
  }
);
