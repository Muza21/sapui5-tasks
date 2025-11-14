sap.ui.define(
  [
    "project1/controller/Base.controller",
    "project1/model/books",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
  ],
  function (
    BaseController,
    books,
    Filter,
    FilterOperator,
    JSONModel,
    MessageToast,
    MessageBox
  ) {
    "use strict";

    return BaseController.extend("project1.controller.App", {
      onInit: function () {
        const oBooksModel = books.createBooksModel();
        this.setModel(oBooksModel, "booksModel");
      },

      onSubmitForm: function () {
        const oMode = this.getModel("booksModel").getProperty("/mode");
        const oModel = this.getModel("booksModel");
        const aBooks = oModel.getProperty("/books");
        const oBookData = oModel.getProperty("/dialogBook");
        const sError = this._validateBookData(oBookData);
        if (sError) {
          MessageToast.show(sError);
          return;
        }
        if (oMode === "edit") {
          const iIndex = aBooks.findIndex((b) => b.ID === oBookData.ID);
          if (iIndex !== -1) {
            aBooks[iIndex] = { ...oBookData };
          }
        } else {
          aBooks.push({ ID: Date.now(), ...oBookData });
        }
        oModel.refresh();
        this.oFormDialog.close();
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
        this.oSortDialog ??= await this.loadFragment({
          name: "project1.view.SortDialog",
        });

        this.oSortDialog.open();
      },

      onCancelSortDialog: function () {
        this.oSortDialog.close();
      },

      onCloseDialogWithSort: function () {
        if (!this.oSortDialog) return;
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
        this.oSortDialog.close();
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
        const oContext = oButton.getBindingContext("booksModel");
        const oBookData = { ...oContext.getObject() };
        this.onOpenFormDialog(oBookData, true);
      },

      onOpenConfirmDialog: async function () {
        const oResourceBundle = this.getOwnerComponent()
          .getModel("i18n")
          .getResourceBundle();
        MessageBox.warning(oResourceBundle.getText("confirmQuestion"), {
          actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
          emphasizedAction: MessageBox.Action.OK,
          onClose: (sAction) => {
            if (sAction === MessageBox.Action.OK) {
              this.onDeleteRecord();
            }
          },
          dependentOn: this.getView(),
        });
      },

      onOpenFormDialog: async function (oBookData, bEditmode = false) {
        this.oFormDialog ??= await this.loadFragment({
          name: "project1.view.FormDialog",
        });
        const oBooksModel = this.getModel("booksModel");
        const oBookDataNew = bEditmode
          ? oBookData
          : {
              Name: "",
              Author: "",
              Genre: "",
              ReleaseDate: "",
              AvailableQuantity: "",
            };
        oBooksModel.setProperty("/mode", bEditmode ? "edit" : "create");
        oBooksModel.setProperty("/dialogBook", oBookDataNew);
        this.oFormDialog.open();
      },

      onCloseFormDialog: function () {
        this.oFormDialog.close();
      },

      _validateBookData: function (oBookData) {
        if (!oBookData.Name) return "Name is required";
        if (!oBookData.Author) return "Author is required";
        if (!oBookData.Genre) return "Genre is required";
        if (
          !oBookData.ReleaseDate ||
          isNaN(Date.parse(oBookData.ReleaseDate))
        ) {
          return "Release Date must be a valid date";
        }
        if (
          oBookData.AvailableQuantity === "" ||
          isNaN(oBookData.AvailableQuantity)
        ) {
          return "Available Quantity must be a number";
        }
        return null;
      },
    });
  }
);
