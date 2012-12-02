ko.bindingHandlers['ngHeaderCell'] = (function () {
    return {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var col = viewModel;
            col.$index = bindingContext.$index;
            col.$grid = bindingContext.$parent;
            var headerCell = $(col.headerCellTemplate);
            ko.applyBindings(col, headerCell[0]);
            $(element).append(headerCell);
            return { controlsDescendantBindings: true };
        }
    };
}());