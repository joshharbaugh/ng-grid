ko.bindingHandlers['ngHeaderRow'] = (function () {
    return {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var grid = valueAccessor();
            var headerRow = $(grid.headerRowTemplate);
            ko.applyBindings(grid, headerRow[0]);
            $(element).append(headerRow);
            return { controlsDescendantBindings: true };
        }
    };
}());