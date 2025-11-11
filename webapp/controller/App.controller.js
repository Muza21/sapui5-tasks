sap.ui.define(
  ["sapui5-tasks/controller/Base.controller", "sapui5-tasks/model/models"],
  function (BaseController, models) {
    "use strict";

    return BaseController.extend("sapui5-tasks.controller.App", {
      onInit: function () {
        const oBooksModel = models.createBooksModel();
        this.setModel(oBooksModel, "booksModel");
      },
    });
  }
);
