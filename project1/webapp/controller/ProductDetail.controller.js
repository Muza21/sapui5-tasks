sap.ui.define(
  ["project1/controller/Base.controller"],
  function (BaseController) {
    "use strict";

    return BaseController.extend("project1.controller.ProductDetail", {
      onInit: function () {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("ProductDetail")
          .attachPatternMatched(this._onRouteMatched, this);
      },
      _onRouteMatched: function (oEvent) {
        const sProductID = oEvent.getParameter("arguments").ProductID;
        const oView = this.getView();
        oView.bindElement({
          path: `/Products(${sProductID})`,
          model: "odataV2Model",
        });
      },
    });
  }
);
