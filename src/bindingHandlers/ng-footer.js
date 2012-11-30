/// <reference path="../../lib/knockout-2.2.0.js" />
/// <reference path="../constants.js" />
﻿/// <reference path="../templates/aggregateTemplate.js" />
/// <reference path="../namespace.js" />
ko.bindingHandlers['ngFooter'] = (function () {
    return {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var footer = valueAccessor();
            var footerElem = $(ng.defaultFooterTemplate());
            ko.applyBindings(footer, footerElem[0]);
            $(element).append(footerElem);
        }
    };
}());