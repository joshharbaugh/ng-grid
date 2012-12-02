﻿/// <reference path="../../lib/knockout-2.2.0.js" />
ko.bindingHandlers['ngCell'] = (function () {
    return {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var col = viewModel;
            col.$parent = bindingContext.$parent;
            var cell = $(col.cellTemplate);
            ko.applyBindings(col, cell[0]);
            $(element).append(cell);
            return { controlsDescendantBindings: true };
        }
    };
}());