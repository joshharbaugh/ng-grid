ko.bindingHandlers['ngGrid'] = (function () {
    return {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var options = valueAccessor();
            var elem = $(element);
            options.gridDim = new ng.Dimension({ outerHeight: elem.height(), outerWidth: elem.width() });
            var grid = new ng.Grid(options);
            var gridElem = $(ng.defaultGridTemplate());
            ng.gridService.StoreGrid(element, grid);
            grid.footerController = new ng.Footer(grid);
            // if it is a string we can watch for data changes. otherwise you won't be able to update the grid data
            options.data.subscribe(function (a) {
                if (!a) return;
                grid.sortedData = $.extend(true, [], a);
                grid.searchProvider.evalFilter();
                grid.configureColumnWidths();
                grid.refreshDomSizes();
            }, options.watchDataItems);
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
        }
    };
}());