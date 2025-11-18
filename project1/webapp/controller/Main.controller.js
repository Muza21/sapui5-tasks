sap.ui.define(
  [
    "project1/controller/Base.controller",
    "project1/model/books",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
  ],
  function (
    BaseController,
    books,
    Filter,
    FilterOperator,
    MessageToast,
    MessageBox
  ) {
    "use strict";

    return BaseController.extend("project1.controller.App", {
      onInit: function () {
        const oBooksModel = books.createBooksModel();
        this.setModel(oBooksModel, "booksModel");
        const oODataV2Model = this.getOwnerComponent().getModel("odataV2Model");
        this.setModel(oODataV2Model, "odataV2Model");
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

      onDeleteMultiSelectedItems: function () {
        const oTable = this.byId("productsTableV2");
        const odataV2Model = this.getModel("odataV2Model");
        const aSelected = oTable.getSelectedItems();
        aSelected.forEach((item) => {
          const path = item.getBindingContext("odataV2Model").getPath();
          odataV2Model.remove(path, { groupId: "deleteBatch" });
        });
        odataV2Model.submitChanges({
          groupId: "deleteBatch",
          success: () => MessageToast.show("Deleted"),
          error: () => MessageToast.show("Error deleting"),
        });
      },

      onSearchProductsV2: function (oEvent) {
        const sQuery = oEvent.getParameter("newValue");
        const oTable = this.byId("productsTableV2");
        const oBinding = oTable.getBinding("items");
        const aFilters = [];
        if (sQuery && sQuery.length > 0) {
          aFilters.push(
            new Filter("Description", FilterOperator.Contains, sQuery)
          );
        }

        oBinding.filter(aFilters);
      },

      _validateBookData: function (oBookData) {
        const oResourceBundle = this.getOwnerComponent()
          .getModel("i18n")
          .getResourceBundle();
        if (!oBookData.Name) {
          return oResourceBundle.getText("required", ["Name"]);
        }
        if (!oBookData.Author) {
          return oResourceBundle.getText("required", ["Author"]);
        }
        if (!oBookData.Genre) {
          return oResourceBundle.getText("required", ["Genre"]);
        }
        if (
          !oBookData.ReleaseDate ||
          isNaN(Date.parse(oBookData.ReleaseDate))
        ) {
          return oResourceBundle.getText("invalidDate");
        }
        if (
          oBookData.AvailableQuantity === "" ||
          isNaN(oBookData.AvailableQuantity)
        ) {
          return oResourceBundle.getText("invalidQuantity");
        }
        return null;
      },
    });
  }
);
