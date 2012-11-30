ng.Footer = function (grid) {
    var self = this;
    self.jqueryUITheme = grid.config.jqueryUITheme;
    self.maxRows = Math.max(grid.config.pagingOptions.totalServerItems || grid.sortedData.length, 1);
    self.maxRowsDisplay = ko.computed(function() {
        return self.maxRows;
    });
    self.multiSelect = ko.observable((grid.config.canSelectRows && grid.config.multiSelect));
    self.selectedItemCount = ko.computed(function() {
        return grid.selectedItemCount;
    });
    self.maxPages = ko.computed(function () {
        self.maxRows = Math.max(grid.config.pagingOptions.totalServerItems || grid.sortedData.length, 1);
        return Math.ceil(self.maxRows / grid.pagingOptions.pageSize());
    });
    self.pageForward = function() {
        var page = grid.config.pagingOptions.currentPage();
        grid.config.pagingOptions.currentPage = Math.min(page + 1, self.maxPages());
    };
    self.pageBackward = function () {
        var page = grid.config.pagingOptions.currentPage();
        grid.config.pagingOptions.currentPage = Math.max(page - 1, 1);
    };
    self.pageToFirst = function () {
        grid.config.pagingOptions.currentPage = 1;
    };
    self.pageToLast = function () {
        var maxPages = self.maxPages();
        grid.config.pagingOptions.currentPage = maxPages;
    };
    self.cantPageForward = ko.computed(function () {
        var curPage = grid.config.pagingOptions.currentPage();
        var maxPages = self.maxPages();
        return !(curPage < maxPages);
    });
    self.cantPageBackward = ko.computed(function () {
        var curPage = grid.config.pagingOptions.currentPage();
        return !(curPage > 1);
    });
    self.footerStyle = ko.computed(function () {
        return { "width": grid.rootDim.outerWidth + "px", "height": grid.config.footerRowHeight + "px" };
    });
};