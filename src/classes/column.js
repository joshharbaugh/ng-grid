﻿ng.Column = function (config, grid) {
    var self = this,
        colDef = config.colDef,
		delay = 500,
        clicks = 0,
        timer = null;
    self.width = colDef.width;
    self.minWidth = !colDef.minWidth ? 50 : colDef.minWidth;
    self.maxWidth = !colDef.maxWidth ? 9000 : colDef.maxWidth;
    self.headerRowHeight = config.headerRowHeight;
    self.displayName = ko.observable(colDef.displayName || colDef.field);
    self.index = config.index;
    self.isAggCol = config.isAggCol;
    self.cellClass = ko.observable(colDef.cellClass);
    self.cellFilter = colDef.cellFilter;
    self.field = colDef.field;
    self.aggLabelFilter = colDef.cellFilter || colDef.aggLabelFilter;
    self._visible = ko.observable(ng.utils.isNullOrUndefined(colDef.visible) || colDef.visible);
    self.visible = ko.computed({
        read: function() {
            return self._visible();
        },
        write: function(val) {
            self.toggleVisible(val);
        }
    });
    self.sortable = ko.observable(ng.utils.isNullOrUndefined(colDef.sortable) || colDef.sortable);
    self.resizable = ko.observable(ng.utils.isNullOrUndefined(colDef.resizable) || colDef.resizable);
    self.sortDirection = ko.observable(undefined);
    self.sortingAlgorithm = colDef.sortFn;
    self.headerClass = ko.observable(colDef.headerClass);
    self.headerCellTemplate = colDef.headerCellTemplate || ng.defaultHeaderCellTemplate();
    self.cellTemplate = colDef.cellTemplate || ng.defaultCellTemplate().replace(CUSTOM_FILTERS, self.cellFilter);
    self.getProperty = function (row) {
        var ret;
        if (self.cellFilter) {
            ret = self.cellFilter(row.getProperty(self.field));
        } else {
            ret = row.getProperty(self.field);
        }
        return ret;
    };
    self.toggleVisible = function (val) {
        var v;
        if (ng.utils.isNullOrUndefined(val) || typeof val == "object") {
            v = !self._visible();
        } else {
            v = val;
        }
        self._visible(v);
        ng.domUtilityService.BuildStyles(grid);
    };

    self.showSortButtonUp = ko.computed(function () {
        return self.sortable ? self.sortDirection() === DESC : self.sortable;
    });
    self.showSortButtonDown = ko.computed(function () {
        return self.sortable ? self.sortDirection() === ASC : self.sortable;
    });     
    self.noSortVisible = ko.computed(function () {
        return !self.sortDirection();
    });
    self.sort = function () {
        if (!self.sortable()) {
            return true; // column sorting is disabled, do nothing
        }
        var dir = self.sortDirection() === ASC ? DESC : ASC;
        self.sortDirection(dir);
        config.sortCallback(self, dir);
        return false;
    };   
    self.gripClick = function () {
        clicks++;  //count clicks
        if (clicks === 1) {
            timer = setTimeout(function () {
                //Here you can add a single click action.
                clicks = 0;  //after action performed, reset counter
            }, delay);
        } else {
            clearTimeout(timer);  //prevent single-click action
            config.resizeOnDataCallback(self);  //perform double-click action
            clicks = 0;  //after action performed, reset counter
        }
    };
    self.gripOnMouseDown = function (event) {
        if (event.ctrlKey) {
            self.toggleVisible();
            ng.domUtilityService.BuildStyles(grid);
            return true;
        }
        document.body.style.cursor = 'col-resize';
        event.target.parentElement.style.cursor = 'col-resize';
        self.startMousePosition = event.clientX;
        self.origWidth = self.width;
        $(document).mousemove(self.onMouseMove);
        $(document).mouseup(self.gripOnMouseUp);
        return false;
    };
    self.onMouseMove = function (event) {
        var diff = event.clientX - self.startMousePosition;
        var newWidth = diff + self.origWidth;
        self.width = (newWidth < self.minWidth ? self.minWidth : (newWidth > self.maxWidth ? self.maxWidth : newWidth));
        ng.domUtilityService.BuildStyles(grid);
        return false;
    };
    self.gripOnMouseUp = function () {
        $(document).off('mousemove');
        $(document).off('mouseup');
        document.body.style.cursor = 'default';
        return false;
    };
};