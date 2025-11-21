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

      onEditProductsV2: function (oEvent) {
        const oButton = oEvent.getSource();
        const oContext = oButton.getBindingContext("odataV2Model");
        const oProductV2Data = oContext.getObject();
        this.onOpenFormV2Dialog(oProductV2Data, true);
      },

      onOpenFormV2Dialog: async function (oProductV2Data, bEditMode = false) {
        this.oFormV2Dialog ??= await this.loadFragment({
          name: "project1.view.FormV2Dialog",
        });
        const oModel = this.getModel("odataV2Model");

        const oContextNew = bEditMode
          ? oModel.getContext(`/Products(${oProductV2Data.ID})`)
          : oModel.createEntry("/Products", {
              properties: {
                Name: "",
                Description: "",
                ReleaseDate: null,
                Rating: null,
                Price: null,
              },
            });

        this.oFormV2Dialog.setBindingContext(oContextNew, "odataV2Model");
        this._bEditMode = bEditMode;
        this.oFormV2Dialog.open();
      },

      onSubmitV2Form: function () {
        const oModel = this.getModel("odataV2Model");
        const oContext = this.oFormV2Dialog.getBindingContext("odataV2Model");
        const oData = oContext.getObject();
        const sError = this._validateProductV2Data(oData);
        if (sError) {
          MessageToast.show(sError);
          return;
        }
        oModel.submitChanges({
          success: () => {
            const sMessage = this._bEditMode ? "Updated" : "Created";
            MessageToast.show(sMessage);
          },
          error: (err) => MessageToast.show("Error"),
        });
        this.oFormV2Dialog.close();
      },

      onCloseFormV2Dialog: function () {
        const oModel = this.getModel("odataV2Model");

        if (!this._bEditMode) {
          const oContext = this.oFormV2Dialog.getBindingContext("odataV2Model");
          if (oContext) oModel.deleteCreatedEntry(oContext);
        } else {
          oModel.resetChanges();
        }

        this.oFormV2Dialog.close();
      },

      onDeleteMultiSelectedItems: function () {
        const oTable = this.byId("productsTableV2");
        const odataV2Model = this.getModel("odataV2Model");
        const aSelected = oTable.getSelectedItems();
        aSelected.forEach((item) => {
          const path = item.getBindingContext("odataV2Model").getPath();
          odataV2Model.remove(path, {
            success: () => MessageToast.show("Deleted"),
            error: () => MessageToast.show("Error deleting"),
          });
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

      onEditProductsV4: function (oEvent) {
        const oButton = oEvent.getSource();
        const oContext = oButton.getBindingContext("odataV4Model");
        const oProductV4Data = oContext.getObject();
        this.onOpenFormV4Dialog(oProductV4Data, true);
      },

      onOpenFormV4Dialog: async function (oProductV4Data, bEditMode = false) {
        this.oFormV4Dialog ??= await this.loadFragment({
          name: "project1.view.FormV4Dialog",
        });

        const oModel = this.getModel("odataV4Model");
        const oContextNew = bEditMode
          ? oModel
              .bindContext(`/Products(${oProductV4Data.ID})`, null, {
                $$updateGroupId: "productChanges",
              })
              .getBoundContext()
          : oModel.bindList("/Products").create({
              Name: "",
              Description: "",
              ReleaseDate: null,
              Rating: null,
              Price: null,
            });

        this.oFormV4Dialog.setBindingContext(oContextNew, "odataV4Model");
        this._bEditMode = bEditMode;
        this.oFormV4Dialog.open();
      },

      onSubmitV4Form: function () {
        const oModel = this.getModel("odataV4Model");
        const oContext = this.oFormV4Dialog.getBindingContext("odataV4Model");
        const oData = oContext.getObject();
        const sError = this._validateProductV4Data(oData);
        if (sError) {
          MessageToast.show(sError);
          return;
        }
        oModel
          .submitBatch("productChanges")
          .then(async () => {
            const sMessage = this._bEditMode ? "updated" : "created";
            MessageToast.show(sMessage);
            const oTable = this.byId("productsTableV4");
            await oTable.getBinding("items").requestRefresh();
            this.oFormV4Dialog.close();
          })
          .catch((oError) => {
            MessageToast.show("Error updating product");
            console.error(oError);
          });
      },

      onCloseFormV4Dialog: function () {
        const oModel = this.getModel("odataV4Model");
        const oContext = this.oFormV4Dialog.getBindingContext("odataV4Model");
        if (!this._bEditMode) {
          if (oContext) oContext.delete();
        } else {
          const oBinding = oContext.getBinding();
          if (oBinding) {
            oBinding.resetChanges();
          }
        }
        this.oFormV4Dialog.close();
      },

      onDeleteMultiSelectedItemsV4: function () {
        const oTable = this.byId("productsTableV4");
        const oModel = this.getModel("odataV4Model");
        const aSelected = oTable.getSelectedItems();
        if (aSelected.length === 0) {
          MessageToast.show("select at least one item");
          return;
        }
        const deletePromises = aSelected.map((oItem) => {
          const oContext = oItem.getBindingContext("odataV4Model");
          return oContext.delete();
        });
        Promise.all(deletePromises)
          .then(() => MessageToast.show("Deleted"))
          .catch(() => MessageToast.show("Error deleting"));
      },

      onSearchProductsV4: function (oEvent) {
        const sQuery = oEvent.getParameter("newValue");
        const oTable = this.byId("productsTableV4");
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

      _validateProductV2Data: function (oData) {
        if (!oData.Name || oData.Name.trim() === "") {
          return "Name is required and cannot be empty";
        }
        if (!oData.Description || oData.Description.trim() === "") {
          return "Description is required and cannot be empty";
        }
        if (!oData.ReleaseDate || isNaN(Date.parse(oData.ReleaseDate))) {
          return "Valid Release Date is required";
        }
        const iRating = parseInt(oData.Rating, 10);
        if (isNaN(iRating) || oData.Rating === "" || oData.Rating === null) {
          return "Rating must be a valid number";
        }
        const fPrice = parseFloat(oData.Price);
        if (isNaN(fPrice) || oData.Price === "" || oData.Price === null) {
          return "Price must be a valid number";
        }
        return null;
      },

      _validateProductV4Data: function (oData) {
        if (!oData.Name || oData.Name.trim() === "") {
          return "Name is required";
        }
        if (!oData.Description || oData.Description.trim() === "") {
          return "Description is required";
        }
        if (!oData.ReleaseDate) {
          return "Release Date is required";
        }
        if (
          oData.Rating === null ||
          oData.Rating === undefined ||
          oData.Rating === ""
        ) {
          return "Rating is required";
        }
        if (
          oData.Price === null ||
          oData.Price === undefined ||
          oData.Price === ""
        ) {
          return "Price is required";
        }
        const nRating = parseFloat(oData.Rating);
        if (isNaN(nRating) || nRating < 0 || nRating > 5) {
          return "Rating must be a number between 0 and 5";
        }
        const nPrice = parseFloat(oData.Price);
        if (isNaN(nPrice) || nPrice < 0) {
          return "Price must be a positive number";
        }
        return null;
      },
    });
  }
);
