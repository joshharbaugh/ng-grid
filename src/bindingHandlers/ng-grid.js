﻿ko.bindingHandlers['ngGrid'] = (function () {
    return {
        'init': function (element, valueAccessor) {
            var options = valueAccessor();
            var elem = $(element);
            options.gridDim = new ng.Dimension({ outerHeight: elem.height(), outerWidth: elem.width() });
            var grid = new ng.Grid(options);
            var gridElem = $(ng.defaultGridTemplate());
            ng.gridService.StoreGrid(element, grid);
            // if it is a string we can watch for data changes. otherwise you won't be able to update the grid data
            options.data.subscribe(function (a) {
                if (!a) return;
                grid.sortedData(a);
                grid.searchProvider.evalFilter();
                grid.configureColumnWidths();
                grid.refreshDomSizes();
            });
            // if columndefs are observable watch for changes and rebuild columns.
            if (ko.isObservable(options.columnDefs)) {
                options.columnDefs.subscribe(function (newDefs) {
                    grid.columns([]);
                    grid.config.columnDefs = newDefs;
                    grid.buildColumns();
                    grid.configureColumnWidths();
                    ng.domUtilityService.BuildStyles(grid);
                });
            }
            //set the right styling on the container
            elem.addClass("ngGrid")
                .addClass("ui-widget")
                .addClass(grid.gridId.toString());
            //call update on the grid, which will refresh the dome measurements asynchronously
            elem.append(gridElem);// make sure that if any of these change, we re-fire the calc logic
            ko.applyBindings(grid, gridElem[0]);
            //walk the element's graph and the correct properties on the grid
            ng.domUtilityService.AssignGridContainers(elem, grid);
            grid.configureColumnWidths();
            //now use the manager to assign the event handlers
            ng.gridService.AssignGridEventHandlers(grid);
            grid.aggregateProvider = new ng.AggregateProvider(grid);
            //initialize plugins.
            $.each(grid.config.plugins, function (i, p) {
                p.init(grid);
            });
            return { controlsDescendantBindings: true };
        }
    };
}());