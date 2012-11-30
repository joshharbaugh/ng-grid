ko.bindingHandlers['ngHeaderCell'] = (function () {
    return {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var col = valueAccessor();
            viewModel.$index = bindingContext.$index;
            var headerCell = $(col.headerCellTemplate);
            ko.applyBindings(viewModel, headerCell[0]);
            $(element).append(headerCell);
        }
    };
}());