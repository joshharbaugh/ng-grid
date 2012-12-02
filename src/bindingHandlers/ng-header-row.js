ko.bindingHandlers['ngHeaderRow'] = (function () {
    return {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var headerRow = $(viewModel.headerRowTemplate);
            ko.applyBindings(viewModel, headerRow[0]);
            $(element).append(headerRow);
            return { controlsDescendantBindings: true };
        }
    };
}());