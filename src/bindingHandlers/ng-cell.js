/// <reference path="../../lib/knockout-2.2.0.js" />
ko.bindingHandlers['ngCell'] = (function () {
    return {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var col = valueAccessor();
            var cell = $(col.cellTemplate);
            ko.applyBindings(viewModel, cell[0]);
            $(element).append(cell);
        }
    };
}());