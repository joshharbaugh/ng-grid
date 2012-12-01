/***********************************************
* ng-grid JavaScript Library
* Authors: https://github.com/Crash8308/ng-grid/blob/master/README.md
* License: MIT (http://www.opensource.org/licenses/mit-license.php)
* Compiled At: 11/30/2012 20:18:31
***********************************************/

(function(window, undefined){

/***********************************************
* FILE: ..\src\namespace.js
***********************************************/
if (!window.ng) {
    window.ng = {};
}

/***********************************************
* FILE: ..\src\constants.js
***********************************************/
var SELECTED_PROP = '__ng_selected__'; 
var GRID_KEY = '__koGrid__';
// the # of rows we want to add to the top and bottom of the rendered grid rows 
var EXCESS_ROWS = 8;
var SCROLL_THRESHOLD = 6;
var ASC = "asc"; // constant for sorting direction
var DESC = "desc"; // constant for sorting direction
var NG_FIELD = '_ng_field_';
var NG_DEPTH = '_ng_depth_';
var NG_HIDDEN = '_ng_hidden_';
var NG_COLUMN = '_ng_column_';
var CUSTOM_FILTERS = /CUSTOM_FILTERS/g;
var TEMPLATE_REGEXP = /^<.+>/;

/***********************************************
* FILE: ..\src\navigation.js
***********************************************/
//set event binding on the grid so we can select using the up/down keys
ng.moveSelectionHandler = function (grid, evt) {
    // null checks 
    if (grid === null || grid === undefined) return true;
    if (grid.config.selectedItems === undefined) return true;
    var charCode = (evt.which) ? evt.which : event.keyCode;
    // detect which direction for arrow keys to navigate the grid
    var offset = (charCode == 38 ? -1 : (charCode == 40 ? 1 : null));
    if (!offset) return true;
    var items = grid.renderedRows;
    var index = items.indexOf(grid.selectionService.lastClickedRow) + offset;
    if (index == -1) return true;
    grid.selectionService.ChangeSelection(grid.renderedRows[index], evt);
    return false;
}; 

/***********************************************
* FILE: ..\src\utils.js
***********************************************/
if (!Array.prototype.indexOf)
{
	Array.prototype.indexOf = function(elt /*, from*/){
		var len = this.length >>> 0;
		var from = Number(arguments[1]) || 0;
		from = (from < 0) ? Math.ceil(from) : Math.floor(from);
		if (from < 0) from += len;
		for (; from < len; from++){
			if (from in this && this[from] === elt) return from;
		}
		return -1;
	};
}
if (!Array.prototype.filter)
{
  Array.prototype.filter = function(fun /*, thisp */)
  {
    "use strict";
    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")throw new TypeError();
    var res = [];
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in t)
      {
        var val = t[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, t))
          res.push(val);
      }
    }
    return res;
  };
}
ng.utils = {
    visualLength: function (node) {
        var elem = document.getElementById('testDataLength');
        if (!elem) {
            elem = document.createElement('SPAN');
            elem.id = "testDataLength";
            elem.style.visibility = "hidden";
            document.body.appendChild(elem);
        }
        $(elem).css('font', $(node).css('font'));
        elem.innerHTML = $(node).text();
        return elem.offsetWidth;
    },
    forIn: function (obj, action) {
         for (var prop in obj) {
            if(obj.hasOwnProperty(prop)){
                action(obj[prop], prop);
            }
        }
    },
    evalProperty: function (entity, path) {
        var e = ko.utils.unwrapObservable(entity);
        var propPath = path.split('.'), i = 0;
        var tempProp = ko.utils.unwrapObservable(e[propPath[i++]]), links = propPath.length;
        while (tempProp && i < links) {
            tempProp = ko.utils.unwrapObservable(tempProp[propPath[i++]]);
        }
        return tempProp;
    },
    endsWith: function (str, suffix) {
        if (!str || !suffix || typeof str != "string") return false;
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    },
    isNullOrUndefined: function (obj) {
        if (obj === undefined || obj === null) return true;
        return false;
    },
    getElementsByClassName: function(cl) {
        var retnode = [];
        var myclass = new RegExp('\\b'+cl+'\\b');
        var elem = document.getElementsByTagName('*');
        for (var i = 0; i < elem.length; i++) {
            var classes = elem[i].className;
            if (myclass.test(classes)) retnode.push(elem[i]);
        }
        return retnode;
    },
    newId: (function () {
        var seedId = new Date().getTime();
        return function () {
            return seedId += 1;
        };
    })(),
    
    // we copy KO's ie detection here bc it isn't exported in the min versions of KO
    // Detect IE versions for workarounds (uses IE conditionals, not UA string, for robustness) 
    ieVersion: (function () {
        var version = 3, div = document.createElement('div'), iElems = div.getElementsByTagName('i');
        // Keep constructing conditional HTML blocks until we hit one that resolves to an empty fragment
        while (
            div.innerHTML = '<!--[if gt IE ' + (++version) + ']><i></i><![endif]-->',
            iElems[0]
        );
        return version > 4 ? version : undefined;
    })()
};

$.extend(ng.utils, {
    isIe6: (function(){ 
        return ng.utils.ieVersion === 6;
    })(),
    isIe7: (function(){ 
        return ng.utils.ieVersion === 7;
    }    )(),
    isIe: (function () { 
        return ng.utils.ieVersion !== undefined; 
    })()
}); 

/***********************************************
* FILE: ..\src\templates\gridTemplate.html
***********************************************/
ng.defaultGridTemplate = function(){ return '<div data-bind="css: {\'ui-widget\': jqueryUITheme}"><div class="ngTopPanel" data-bind="css: {\'ui-widget-header\':jqueryUITheme, \'ui-corner-top\': jqueryUITheme}, style: $data.topPanelStyle"><div class="ngGroupPanel" data-bind="visible: showGroupPanel, style: headerStyle()"><div class="ngGroupPanelDescription" data-bind="visible: configGroups.length == 0">Drag a column header here and drop it to group by that column</div><ul data-bind="visible: configGroups.length > 0" class="ngGroupList"><li class="ngGroupItem" data-bind="foreach: configGroups"><span class="ngGroupElement"><span class="ngGroupName" data-bind="text: displayName"><span data-bind="click: removeGroup" class="ngRemoveGroup">x</span></span><span data-bind="visible: $index > $parent.configGroups.length" class="ngGroupArrow"></span></span></li></ul></div><div class="ngHeaderContainer" data-bind="style: headerStyle"><div class="ngHeaderScroller" data-bind="style: headerScrollerStyle, ngHeaderRow: $data" ></div></div><div class="ngHeaderButton" data-bind="visible: ($data.showColumnMenu || $data.showFilter), click: toggleShowMenu"><div class="ngHeaderButtonArrow"></div></div><div data-bind="visible: showMenu" class="ngColMenu"><div data-bind="visible: showFilter"><input placeholder="Seach Field:Value" type="text" data-bind="value: filterText"/></div><div data-bind="visible: showColumnMenu"><span class="ngMenuText">Choose Columns:</span><ul class="ngColList"><li class="ngColListItem" data-bind="foreach: nonAggColumns"><label><input type="checkbox" class="ngColListCheckbox" data-bind="value: visible"/><span data-bind="text: displayName"></span><a title="Group By" class="ngGroupIcon" data-bind="visible: (field != \'\u2714\'), click: $parent.groupBy"></a></label></li></ul></div></div></div><div class="ngViewport" data-bind="css: {\'ui-widget-content\': jqueryUITheme}, style: viewportStyle"><div class="ngCanvas" data-bind="style: canvasStyle"><div data-bind="foreach: renderedRows"><div data-bind="style: { \'top\': offsetTop, \'height\': $parent.rowHeight + \'px\' }, click: toggleSelected, css: {\'selected\': selected, \'even\': isEven , \'odd\': isOdd }, ngRow: $data" class="ngRow"></div></div></div></div><div class="ngFooterPanel" data-bind="ngFooter: $data, css: {\'ui-widget-content\': jqueryUITheme, \'ui-corner-bottom\': jqueryUITheme}, style: footerStyle"><div class="ngTotalSelectContainer" data-bind="visible: footerVisible"><div class="ngFooterTotalItems" data-bind="css: {\'ngNoMultiSelect\': !multiSelect}" ><span class="ngLabel">Total Items: <span data-bind="text: maxRowsDisplay"></span></span><span data-bind="visible: filterText.length > 0" class="ngLabel">(Showing: <span data-bind="text: totalFilteredItemsLength"></span>)</span></div><div class="ngFooterSelectedItems" data-bind="visible: multiSelect"><span class="ngLabel">Selected Items: <span data-bind="text: selectedItemCount"></span></span></div></div><div class="ngPagerContainer" style="float: right; margin-top: 10px;" data-bind="visible: (footerVisible && enablePaging), css: {\'ngNoMultiSelect\': !multiSelect}"><div style="float:left; margin-right: 10px;" class="ngRowCountPicker"><span style="float: left; margin-top: 3px;" class="ngLabel">Page Size:</span><select style="float: left;height: 27px; width: 100px" data-bind="value: pagingOptions.pageSize, options: pagingOptions.pageSizes"></select></div><div style="float:left; margin-right: 10px; line-height:25px;" class="ngPagerControl" style="float: left; min-width: 135px;"><button class="ngPagerButton" data-bind="click: pageToFirst, disable: cantPageBackward()" title="First Page"><div class="ngPagerFirstTriangle"><div class="ngPagerFirstBar"></div></div></button><button class="ngPagerButton" data-bind="click: pageBackward, disable: cantPageBackward()" title="Previous Page"><div class="ngPagerFirstTriangle ngPagerPrevTriangle"></div></button><input class="ngPagerCurrent" type="text" style="width:50px; height: 24px; margin-top: 1px; padding: 0px 4px;" data-bind="value: pagingOptions.currentPage"/><button class="ngPagerButton" data-bind="click: pageForward, disable: cantPageForward()" title="Next Page"><div class="ngPagerLastTriangle ngPagerNextTriangle"></div></button><button class="ngPagerButton" data-bind="click: pageToLast, disable: cantPageForward()" title="Last Page"><div class="ngPagerLastTriangle"><div class="ngPagerLastBar"></div></div></button></div></div></div></div>';};

/***********************************************
* FILE: ..\src\templates\rowTemplate.html
***********************************************/
ng.defaultRowTemplate = function(){ return '<div data-bind="foreach: $parent.visibleColumns, css: { \'ui-widget-content\': $parent.jqueryUITheme }"><div data-bind="attr: { \'class\': \'ngCell col\' + $index() + \' \' + $data.cellClass() }, ngCell: $data"></div></div>';};

/***********************************************
* FILE: ..\src\templates\cellTemplate.html
***********************************************/
ng.defaultCellTemplate = function(){ return '<div data-bind="attr: { \'class\': \'ngCellText colt\' + $index()}, html: $parent.getProperty($data.field)"></div>';};

/***********************************************
* FILE: ..\src\templates\aggregateTemplate.html
***********************************************/
ng.aggregateTemplate = function(){ return '<div data-bind="click: $data.toggleExpand, style: {\'left\': $data.offsetleft}" class="ngAggregate"><span class="ngAggregateText" data-bind="html: $data.label">(<span data-bind="html: totalChildren"></span> Items)</span><div data-bind="attr: {\'class\': aggClass"></div></div>';};

/***********************************************
* FILE: ..\src\templates\headerRowTemplate.html
***********************************************/
ng.defaultHeaderRowTemplate = function(){ return '<div data-bind="foreach: visibleColumns"><div data-bind="ngHeaderCell: $data, attr: { \'class\': \'ngHeaderCell col\' + $index() }"></div></div>';};

/***********************************************
* FILE: ..\src\templates\headerCellTemplate.html
***********************************************/
ng.defaultHeaderCellTemplate = function(){ return '<div data-bind="click: sort, css: { \'ngSorted\': !noSortVisible }, attr: {\'class\': \'ngHeaderSortColumn \' + headerClass()}"><div data-bind="attr: { \'class\': \'colt\' + $index() + \' ngHeaderText\' }, html: displayName"></div><div class="ngSortButtonDown" data-bind="visible: showSortButtonDown"></div><div class="ngSortButtonUp" data-bind="visible: showSortButtonUp"></div></div><div data-bind="visible: resizable, click: gripClick, event: { onmousedown: gripOnMouseDown }" class="ngHeaderGrip" ></div>';};

/***********************************************
* FILE: ..\src\classes\aggregate.js
***********************************************/
ng.Aggregate = function (aggEntity, rowFactory) {
    var self = this;
    self.index = 0;
    self.offsetTop = ko.observable(0);
    self.entity = aggEntity;
    self.label = ko.observable(aggEntity.gLabel);
    self.field = aggEntity.gField;
    self.depth = aggEntity.gDepth;
    self.parent = aggEntity.parent;
    self.children = aggEntity.children;
    self.aggChildren = aggEntity.aggChildren;
    self.aggIndex = aggEntity.aggIndex;
    self.collapsed = true;
    self.isAggRow = true;
    self.offsetleft = aggEntity.gDepth * 25;
    self.aggLabelFilter = aggEntity.aggLabelFilter;
    self.toggleExpand = function() {
        self.collapsed = self.collapsed ? false : true;
        self.notifyChildren();
    };
    self.setExpand = function (state) {
        self.collapsed = state;
        self.notifyChildren();
    };
    self.notifyChildren = function() {
        $.each(self.aggChildren, function (i, child) {
            child.entity[NG_HIDDEN] = self.collapsed;
            if (self.collapsed) {
                child.setExpand(self.collapsed);
            }
        });
        $.each(self.children, function (i, child) {
            child[NG_HIDDEN] = self.collapsed;
        });
        rowFactory.rowCache = [];
        var foundMyself = false;
        $.each(rowFactory.aggCache, function (i, agg) {
            if (foundMyself) {
                var offset = (30 * self.children.length);
                agg.offsetTop(self.collapsed ? agg.offsetTop - offset : agg.offsetTop + offset);
            } else {
                if (i == self.aggIndex) {
                    foundMyself = true;
                }
            }
        });
        rowFactory.renderedChange();
    };
    self.aggClass = ko.computed(function() {
        return self.collapsed ? "ngAggArrowCollapsed" : "ngAggArrowExpanded";
    });
    self.totalChildren = ko.computed(function() {
        if (self.aggChildren.length > 0) {
            var i = 0;
            var recurse = function (cur) {
                if (cur.aggChildren.length > 0) {
                    $.each(cur.aggChildren, function (i, a) {
                        recurse(a);
                    });
                } else {
                    i += cur.children.length;
                }
            };
            recurse(self);
            return i;
        } else {
            return self.children.length;
        }
    });
}; 

/***********************************************
* FILE: ..\src\classes\aggregateProvider.js
***********************************************/
ng.AggregateProvider = function (grid, gridService) {
    var self = this;
    // The init method gets called during the ng-grid directive execution.
    self.colToMove = undefined;
	self.groupToMove = undefined;
    self.assignEvents = function () {
        // Here we set the onmousedown event handler to the header container.
		if(grid.config.jqueryUIDraggable){
			grid.$groupPanel.droppable({
				addClasses: false,
				drop: function(event) {
					self.onGroupDrop(event);
				}
			});
			$(document).ready(self.setDraggables);	
		} else {
			grid.$groupPanel.on('mousedown', self.onGroupMouseDown).on('dragover', self.dragOver).on('drop', self.onGroupDrop);
			grid.$headerScroller.on('mousedown', self.onHeaderMouseDown).on('dragover', self.dragOver).on('drop', self.onHeaderDrop);
			if (grid.config.enableRowRerodering) {
				grid.$viewport.on('mousedown', self.onRowMouseDown).on('dragover', self.dragOver).on('drop', self.onRowDrop);
			}
		}
        grid.columns.subscribe(self.setDraggables);
    };
    self.dragOver = function(evt) {
        evt.preventDefault();
    };	
	
	//For JQueryUI
	self.setDraggables = function(){
		if(!grid.config.jqueryUIDraggable){	
			$('.ngHeaderSortColumn').attr('draggable', 'true').on('dragstart', self.onHeaderDragStart).on('dragend', self.onHeaderDragStop);
		} else {
			$('.ngHeaderSortColumn').draggable({
				helper: "clone",
				appendTo: 'body',
				addClasses: false,
				start: function(event){
					self.onHeaderMouseDown(event);
				}
			}).droppable({
				drop: function(event) {
					self.onHeaderDrop(event);
				}
			});
		}
	};
    
    self.onGroupDragStart = function () {
        // color the header so we know what we are moving
        if (self.groupToMove) {
            self.groupToMove.header.css('background-color', 'rgb(255, 255, 204)');
        }
    };	
    
    self.onGroupDragStop = function () {
        // Set the column to move header color back to normal
        if (self.groupToMove) {
            self.groupToMove.header.css('background-color', 'rgb(247,247,247)');
        }
    };

    self.onGroupMouseDown = function(event) {
        var groupItem = $(event.target);
        // Get the scope from the header container
		if(groupItem[0].className != 'ngRemoveGroup'){
		    var groupItemScope = ko.dataFor(groupItem);
			if (groupItemScope) {
				// set draggable events
				if(!grid.config.jqueryUIDraggable){
					groupItem.attr('draggable', 'true');
					groupItem.on('dragstart', self.onGroupDragStart).on('dragend', self.onGroupDragStop);
				}
				// Save the column for later.
				self.groupToMove = { header: groupItem, groupName: groupItemScope.group, index: groupItemScope.$index };
			}
		} else {
			self.groupToMove = undefined;
		}
    };

    self.onGroupDrop = function(event) {
        // clear out the colToMove object
        var groupContainer;
        var groupScope;
        if (self.groupToMove) {
			self.onGroupDragStop();
            // Get the closest header to where we dropped
            groupContainer = $(event.target).closest('.ngGroupElement'); // Get the scope from the header.
            if (groupContainer.context.className == 'ngGroupPanel') {
                grid.configGroups.splice(self.groupToMove.index, 1);
                grid.configGroups.push(self.groupToMove.groupName);
            } else {
                groupScope = ko.dataFor(groupContainer);
                if (groupScope) {
                    // If we have the same column, do nothing.
                    if (self.groupToMove.index != groupScope.$index){
						// Splice the columns
                        grid.configGroups.splice(self.groupToMove.index, 1);
                        grid.configGroups.splice(groupScope.$index, 0, self.groupToMove.groupName);
					}
                }
            }			
			self.groupToMove = undefined;
        } else {	
			self.onHeaderDragStop();
			if (grid.configGroups.indexOf(self.colToMove.col) == -1) {
                groupContainer = $(event.target).closest('.ngGroupElement'); // Get the scope from the header.
				if (groupContainer.context.className == 'ngGroupPanel' || groupContainer.context.className == 'ngGroupPanelDescription') {
				    grid.configGroups.push(self.colToMove.col);
				} else {
				    groupScope = ko.dataFor(groupContainer);
				    if (groupScope) {
						// Splice the columns
				        grid.configGroups.splice(groupScope.$index + 1, 0, self.colToMove.col);
					}
				}	
            }			
			self.colToMove = undefined;
        }
    };
	
    //Header functions
    self.onHeaderMouseDown = function (event) {
        // Get the closest header container from where we clicked.
        var headerContainer = $(event.target).closest('.ngHeaderSortColumn');
        // Get the scope from the header container
        var headerScope = ko.dataFor(headerContainer);
        if (headerScope) {
            // Save the column for later.
            self.colToMove = { header: headerContainer, col: headerScope.col };
        }
    };
    
    self.onHeaderDragStart = function () {
        // color the header so we know what we are moving
        if (self.colToMove) {
            self.colToMove.header.css('background-color', 'rgb(255, 255, 204)');
        }
    };
    
    self.onHeaderDragStop = function () {
        // Set the column to move header color back to normal
        if (self.colToMove) {
            self.colToMove.header.css('background-color', 'rgb(234, 234, 234)');
        }
    };

    self.onHeaderDrop = function (event) {
        if (!self.colToMove) return;
        self.onHeaderDragStop();
        // Get the closest header to where we dropped
        var headerContainer = $(event.target).closest('.ngHeaderSortColumn');
        // Get the scope from the header.
        var headerScope = ko.dataFor(headerContainer);
        if (headerScope) {
            // If we have the same column, do nothing.
            if (self.colToMove.col == headerScope.col) return;
            // Splice the columns
            grid.columns.splice(self.colToMove.col.index, 1);
            grid.columns.splice(headerScope.col.index, 0, self.colToMove.col);
            grid.fixColumnIndexes();
            // Finally, rebuild the CSS styles.
            ng.domUtilityService.BuildStyles(grid);
            // clear out the colToMove object
            self.colToMove = undefined;
        }
    };
    
    // Row functions
    self.onRowMouseDown = function (event) {
        // Get the closest row element from where we clicked.
        var targetRow = $(event.target).closest('.ngRow');
        // Get the scope from the row element
        var rowScope = ko.dataFor(targetRow);
        if (rowScope) {
            // set draggable events
            targetRow.attr('draggable', 'true');
            // Save the row for later.
            gridService.eventStorage.rowToMove = { targetRow: targetRow, scope: rowScope };
        }
    };

    self.onRowDrop = function (event) {
        // Get the closest row to where we dropped
        var targetRow = $(event.target).closest('.ngRow');
        // Get the scope from the row element.
        var rowScope = ko.dataFor(targetRow);
        if (rowScope) {
            // If we have the same Row, do nothing.
            var prevRow = gridService.eventStorage.rowToMove;
            if (prevRow.scope.row == rowScope.row) return;
            // Splice the Rows via the actual datasource
            var sd = grid.sortedData();
            var i = sd.indexOf(prevRow.scope.row.entity);
            var j = sd.indexOf(rowScope.row.entity);
            grid.sortedData.splice(i, 1);
            grid.sortedData.splice(j, 0, prevRow.scope.row.entity);
            grid.searchProvider.evalFilter();
            // clear out the rowToMove object
            gridService.eventStorage.rowToMove = undefined;
            // if there isn't an apply already in progress lets start one
        }
    };
    // In this example we want to assign grid events.
    self.assignEvents();
};

/***********************************************
* FILE: ..\src\classes\column.js
***********************************************/
ng.Column = function (config, grid) {
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
    self.visible = ko.observable(ng.utils.isNullOrUndefined(colDef.visible) || colDef.visible);
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
    self.toggleVisible = function () {
        self.visible = !self.visible;
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

/***********************************************
* FILE: ..\src\classes\dimension.js
***********************************************/
ng.Dimension = function (options) {
    this.outerHeight = null;
    this.outerWidth = null;
    $.extend(this, options);
};

/***********************************************
* FILE: ..\src\classes\rowFactory.js
***********************************************/
ng.RowFactory = function(grid) {
    var self = this;
    // we cache rows when they are built, and then blow the cache away when sorting
    self.rowCache = [];
    self.aggCache = {};
    self.parentCache = []; // Used for grouping and is cleared each time groups are calulated.
    self.dataChanged = true;
    self.parsedData = [];
    self.rowConfig = {};
    self.selectionService = grid.selectionService;
    self.rowHeight = 30;
    self.numberOfAggregates = 0;
    self.groupedData = undefined;
    self.rowHeight = grid.config.rowHeight;
    self.rowConfig = {
        canSelectRows: grid.config.canSelectRows,
        rowClasses: grid.config.rowClasses,
        selectedItems: grid.config.selectedItems,
        selectWithCheckboxOnly: grid.config.selectWithCheckboxOnly,
        beforeSelectionChangeCallback: grid.config.beforeSelectionChange,
        afterSelectionChangeCallback: grid.config.afterSelectionChange
    };

    self.renderedRange = new ng.Range(0, grid.minRowsToRender() + EXCESS_ROWS);
    // Builds rows for each data item in the 'filteredData'
    // @entity - the data item
    // @rowIndex - the index of the row
    self.buildEntityRow = function(entity, rowIndex) {
        var row = self.rowCache[rowIndex]; // first check to see if we've already built it
        if (!row) {
            // build the row
            row = new ng.Row(entity, self.rowConfig, self.selectionService);
            row.rowIndex(rowIndex + 1); //not a zero-based rowIndex
            row.offsetTop(self.rowHeight * rowIndex);
            row.selected(entity[SELECTED_PROP]);
            // finally cache it for the next round
            self.rowCache[rowIndex] = row;
        }
        return row;
    };

    self.buildAggregateRow = function(aggEntity, rowIndex) {
        var agg = self.aggCache[aggEntity.aggIndex]; // first check to see if we've already built it 
        if (!agg) {
            // build the row
            agg = new ng.Aggregate(aggEntity, self);
            self.aggCache[aggEntity.aggIndex] = agg;
        }
        agg.index = rowIndex + 1; //not a zero-based rowIndex
        agg.offsetTop(self.rowHeight * rowIndex);
        return agg;
    };
    self.UpdateViewableRange = function(newRange) {
        self.renderedRange = newRange;
        self.renderedChange();
    };
    self.filteredDataChanged = function() {
        // check for latebound autogenerated columns
        if (grid.lateBoundColumns && grid.filteredData.length > 1) {
            grid.config.columnDefs = undefined;
            grid.buildColumns();
            grid.lateBoundColumns = false;
        }
        self.dataChanged = true;
        self.rowCache = []; //if data source changes, kill this!
        self.selectionService.toggleSelectAll(false);
        if (grid.config.groups.length > 0) {
            self.getGrouping(grid.config.groups);
        }
        self.UpdateViewableRange(self.renderedRange);
    };

    self.renderedChange = function() {
        if (!self.groupedData || grid.config.groups.length < 1) {
            self.renderedChangeNoGroups();
            grid.refreshDomSizes();
            return;
        }
        self.parentCache = [];
        var rowArr = [];
        var dataArray = self.parsedData.filter(function(e) {
            return e[NG_HIDDEN] === false;
        }).slice(self.renderedRange.topRow, self.renderedRange.bottomRow);
        $.each(dataArray, function(indx, item) {
            var row;
            if (item.isAggRow) {
                row = self.buildAggregateRow(item, self.renderedRange.topRow + indx);
            } else {
                row = self.buildEntityRow(item, self.renderedRange.topRow + indx);
            }
            //add the row to our return array
            rowArr.push(row);
        });
        grid.setRenderedRows(rowArr);
        grid.refreshDomSizes();
    };

    self.renderedChangeNoGroups = function() {
        var rowArr = [];
        var dataArr = grid.filteredData.slice(self.renderedRange.topRow, self.renderedRange.bottomRow);
        $.each(dataArr, function (i, item) {
            var row = self.buildEntityRow(item, self.renderedRange.topRow + i);
            //add the row to our return array
            rowArr.push(row);
        });
        grid.setRenderedRows(rowArr);
    };

    //magical recursion. it works. I swear it. I figured it out in the shower one day.
    self.parseGroupData = function(g) {
        if (g.values) {
            $.each(g.values, function (i, item) {
                // get the last parent in the array because that's where our children want to be
                self.parentCache[self.parentCache.length - 1].children.push(item);
                //add the row to our return array
                self.parsedData.push(item);
            });
        } else {
            for (var prop in g) {
                // exclude the meta properties.
                if (prop == NG_FIELD || prop == NG_DEPTH || prop == NG_COLUMN) {
                    continue;
                } else if (g.hasOwnProperty(prop)) {
                    //build the aggregate row
                    var agg = self.buildAggregateRow({
                        gField: g[NG_FIELD],
                        gLabel: prop,
                        gDepth: g[NG_DEPTH],
                        isAggRow: true,
                        '_ng_hidden_': false,
                        children: [],
                        aggChildren: [],
                        aggIndex: self.numberOfAggregates++,
                        aggLabelFilter: g[NG_COLUMN].aggLabelFilter
                    }, 0);
                    //set the aggregate parent to the parent in the array that is one less deep.
                    agg.parent = self.parentCache[agg.depth - 1];
                    // if we have a parent, set the parent to not be collapsed and append the current agg to its children
                    if (agg.parent) {
                        agg.parent.collapsed = false;
                        agg.parent.aggChildren.push(agg);
                    }
                    // add the aggregate row to the parsed data.
                    self.parsedData.push(agg.entity);
                    // the current aggregate now the parent of the current depth
                    self.parentCache[agg.depth] = agg;
                    // dig deeper for more aggregates or children.
                    self.parseGroupData(g[prop]);
                }
            }
        }
    };
    //Shuffle the data into their respective groupings.
    self.getGrouping = function(groups) {
        self.aggCache = [];
        self.rowCache = [];
        self.numberOfAggregates = 0;
        self.groupedData = {};
        // Here we set the onmousedown event handler to the header container.
        var data = grid.filteredData();
        var maxDepth = groups.length;
        var cols = grid.columns();

        $.each(data, function (i, item) {
            item[NG_HIDDEN] = true;
            var ptr = self.groupedData;
            $.each(groups, function(depth, group) {
                if (!cols[depth].isAggCol && depth <= maxDepth) {
                    cols.splice(item.gDepth, 0, new ng.Column({
                        colDef: {
                            field: '',
                            width: 25,
                            sortable: false,
                            resizable: false,
                            headerCellTemplate: '<div class="ngAggHeader"></div>',
                        },
                        isAggCol: true,
                        index: item.gDepth,
                        headerRowHeight: grid.config.headerRowHeight
                    }));
                }
                var col = cols.filter(function(c) { return c.field == group; })[0];
                var val = ng.utils.evalProperty(item, group).toString();
                if (!ptr[val]) ptr[val] = {};
                if (!ptr[NG_FIELD]) ptr[NG_FIELD] = group;
                if (!ptr[NG_DEPTH]) ptr[NG_DEPTH] = depth;
                if (!ptr[NG_COLUMN]) ptr[NG_COLUMN] = col;
                ptr = ptr[val];
            });
            if (!ptr.values) ptr.values = [];
            ptr.values.push(item);
        });
        grid.fixColumnIndexes();
        self.parsedData.length = 0;
        self.parseGroupData(self.groupedData);
    };

    if (grid.config.groups.length > 0 && grid.filteredData.length > 0) {
        self.getGrouping(grid.config.groups);
    }
};

/***********************************************
* FILE: ..\src\classes\grid.js
***********************************************/
ng.Grid = function (options) {
    var defaults = {
            rowHeight: 30,
            columnWidth: 100,
            headerRowHeight: 30,
            footerRowHeight: 55,
            footerVisible: true,
            canSelectRows: true,
            data: [],
            columnDefs: undefined,
            selectedItems: [], // array, if multi turned off will have only one item in array
            displaySelectionCheckbox: true, //toggles whether row selection check boxes appear
            selectWithCheckboxOnly: false,
            useExternalSorting: false,
            sortInfo: undefined, // similar to filterInfo
            multiSelect: ko.observable(true),
            tabIndex: -1,
            disableTextSelection: false,
            enableColumnResize: ko.observable(true),
            maintainColumnRatios: undefined,
            enableSorting:ko.observable(true),
            beforeSelectionChange: function () { return true;},
            afterSelectionChange: function () { return true;},
            rowTemplate: undefined,
            headerRowTemplate: undefined,
            jqueryUITheme: false,
            jqueryUIDraggable: false,
            plugins: [],
            keepLastSelected: true,
            groups: [],
            showGroupPanel: ko.observable(false),
            enableRowReordering: ko.observable(false),
            showColumnMenu: ko.observable(true),
            showFilter: ko.observable(true),
            filterOptions: {
                filterText: ko.observable(""),
                useExternalFilter: false,
            },
            //Paging 
            enablePaging: false,
            pagingOptions: {
                pageSizes: ko.observableArray([250, 500, 1000]), //page Sizes
                pageSize: ko.observable(250), //Size of Paging data
                totalServerItems: ko.observable(0), //how many items are on the server (for paging)
                currentPage: ko.observable(1), //what page they are currently on
            },
        },
        self = this;
    
    self.maxCanvasHt = ko.observable(0);
    //self vars
    self.config = $.extend(defaults, options);
    self.gridId = "ng" + ng.utils.newId();
    self.$root = null; //this is the root element that is passed in with the binding handler
	self.$groupPanel = null;
    self.$topPanel = null;
    self.$headerContainer = null;
    self.$headerScroller = null;
    self.$headers = null;
    self.$viewport = null;
    self.$canvas = null;
    self.rootDim = self.config.gridDim;
    self.sortInfo = self.config.sortInfo;
    self.sortedData = ko.observableArray([]);
    self.lateBindColumns = false;
    self.filteredData = ko.observableArray([]);
    self.lastSortedColumn = undefined;
    self.showFilter = self.config.showFilter;
    self.filterText = self.config.filterOptions.filterText;
    self.calcMaxCanvasHeight = function() {
        return (self.config.groups.length > 0) ? (self.rowFactory.parsedData.filter(function (e) {
            return e[NG_HIDDEN] === false;
        }).length * self.config.rowHeight) : (self.filteredData.length * self.config.rowHeight);
    };
    self.elementDims = {
        scrollW: 0,
        scrollH: 0,
        rowIndexCellW: 25,
        rowSelectedCellW: 25,
        rootMaxW: 0,
        rootMaxH: 0,
    };
    // Set new default footer height if not overridden, and multi select is disabled
    if (self.config.footerRowHeight === defaults.footerRowHeight
        && !self.config.canSelectRows) {
        defaults.footerRowHeight = 30;
        self.config.footerRowHeight = 30;
    }
    //self funcs
    self.setRenderedRows = function (newRows) {
        self.renderedRows(newRows);
        self.refreshDomSizes();
    };
    self.minRowsToRender = function () {
        var viewportH = self.viewportDimHeight() || 1;
        return Math.floor(viewportH / self.config.rowHeight);
    };
    self.refreshDomSizes = function () {
        var dim = new ng.Dimension();
        dim.outerWidth = self.elementDims.rootMaxW;
        dim.outerHeight = self.elementDims.rootMaxH;
        self.rootDim = dim;		
        self.maxCanvasHt(self.calcMaxCanvasHeight());
    };
    self.buildColumnDefsFromData = function () {
        var sd = self.sortedData();
        if (!self.config.columnDefs > 0) {
            self.config.columnDefs = [];
        }
        if (!sd || !sd[0]) {
            self.lateBoundColumns = true;
            return;
        }
        var item;
        item = sd[0];

        ng.utils.forIn(item, function (prop, propName) {
            self.config.columnDefs.push({
                field: propName
            });
        });
    };
    self.buildColumns = function () {
        var columnDefs = self.config.columnDefs,
            cols = [];

        if (!columnDefs) {
            self.buildColumnDefsFromData();
            columnDefs = self.config.columnDefs;
        }
        if (self.config.displaySelectionCheckbox) {
            columnDefs.splice(0, 0, {
                field: '\u2714',
                width: self.elementDims.rowSelectedCellW,
                sortable: false,
                resizable: false,
                headerCellTemplate: '<input class="ngSelectionHeader" type="checkbox" data-bind="visible: $grid.multiSelect, checked: $grid.allSelected, click: $grid.toggleSelectAll"/>',
                cellTemplate: '<div class="ngSelectionCell"><input class="ngSelectionCheckbox" type="checkbox" data-bind="checked: $parent.selected" /></div>'
            });
        }
        if (columnDefs.length > 0) {
            $.each(columnDefs, function (i, colDef) {
                var column = new ng.Column({
                    colDef: colDef, 
                    index: i, 
                    headerRowHeight: self.config.headerRowHeight,
                    sortCallback: self.sortData, 
                    resizeOnDataCallback: self.resizeOnData,
                    enableResize: self.config.enableColumnResize
                }, self);
                cols.push(column);
                var indx = self.config.groups.indexOf(colDef.field);
                if (indx != -1) {
                    self.configGroups.splice(indx, 0, column);
                }
            });
            self.columns(cols);
        }
    };
    self.configureColumnWidths = function() {
        var cols = self.config.columnDefs;
        var numOfCols = cols.length,
            asterisksArray = [],
            percentArray = [],
            asteriskNum = 0,
            totalWidth = 0;
        var columns = self.columns();
        $.each(cols, function (i, col) {
            var isPercent = false, t = undefined;
            //if width is not defined, set it to a single star
            if (ng.utils.isNullOrUndefined(col.width)) {
                col.width = "*";
            } else { // get column width
                isPercent = isNaN(col.width) ? ng.utils.endsWith(col.width, "%") : false;
                t = isPercent ? col.width : parseInt(col.width);
            }
            // check if it is a number
            if (isNaN(t)) {
                t = col.width;
                // figure out if the width is defined or if we need to calculate it
                if (t == 'auto') { // set it for now until we have data and subscribe when it changes so we can set the width.
                    columns[i].width = col.minWidth;
                    var temp = col;
                    $(document).ready(function() { self.resizeOnData(temp, true); });
                    return;
                } else if (t.indexOf("*") != -1) {
                    // if it is the last of the columns just configure it to use the remaining space
                    if (i + 1 == numOfCols && asteriskNum == 0) {
                        columns[i].width = (self.rootDim.outerWidth - ng.domUtilityService.scrollW) - totalWidth;
                    } else { // otherwise we need to save it until the end to do the calulations on the remaining width.
                        asteriskNum += t.length;
                        col.index = i;
                        asterisksArray.push(col);
                        return;
                    }
                } else if (isPercent) { // If the width is a percentage, save it until the very last.
                    col.index = i;
                    percentArray.push(col);
                    return;
                } else { // we can't parse the width so lets throw an error.
                    throw "unable to parse column width, use percentage (\"10%\",\"20%\", etc...) or \"*\" to use remaining width of grid";
                }
            } else {
                totalWidth += columns[i].width = parseInt(col.width);
            }
        });
        // check if we saved any asterisk columns for calculating later
        if (asterisksArray.length > 0) {
            self.config.maintainColumnRatios === false ? $.noop() : self.config.maintainColumnRatios = true;
            // get the remaining width
            var remainigWidth = self.rootDim.outerWidth - totalWidth;
            // calculate the weight of each asterisk rounded down
            var asteriskVal = Math.floor(remainigWidth / asteriskNum);
            // set the width of each column based on the number of stars
            $.each(asterisksArray, function (i, col) {
                var t = col.width.length;
                columns[col.index].width = asteriskVal * t;
                if (col.index + 1 == numOfCols && self.maxCanvasHt() > self.viewportDimHeight()) columns[col.index].width -= (ng.domUtilityService.ScrollW + 2);
                totalWidth += columns[col.index].width;
            });
        }
        // Now we check if we saved any percentage columns for calculating last
        if (percentArray.length > 0) {
            // do the math
            $.each(percentArray, function (i, col) {
                var t = col.width;
                columns[col.index].width = Math.floor(self.rootDim.outerWidth * (parseInt(t.slice(0, -1)) / 100));
            });
        }
        self.columns(columns);
    };
    self.init = function () {
        //factories and services
        self.selectionService = new ng.SelectionService(self);
        self.rowFactory = new ng.RowFactory(self);
        self.selectionService.Initialize(self.rowFactory);
        self.searchProvider = new ng.SearchProvider(self);
        self.styleProvider = new ng.StyleProvider(self);
        self.buildColumns();
        ng.sortService.columns = self.columns,
        self.configGroups.subscribe(function (a) {
            if (!a) return;
            var tempArr = [];
            $.each(a, function (i, item) {
                tempArr.push(item.field || item);
            });
            self.config.groups = tempArr;
            self.rowFactory.filteredDataChanged();
        });
        self.columns.subscribe(function () {
            ng.domUtilityService.BuildStyles(self);
        }, true);
        self.maxCanvasHt(self.calcMaxCanvasHeight());
    };
    self.prevScrollTop = 0;
    self.prevScrollIndex = 0;
    self.adjustScrollTop = function (scrollTop, force) {
        if (self.prevScrollTop === scrollTop && !force) { return; }
        var rowIndex = Math.floor(scrollTop / self.config.rowHeight);
        // Have we hit the threshold going down?
        if (self.prevScrollTop < scrollTop && rowIndex < self.prevScrollIndex + SCROLL_THRESHOLD) return;
        //Have we hit the threshold going up?
        if (self.prevScrollTop > scrollTop && rowIndex > self.prevScrollIndex - SCROLL_THRESHOLD) return;
        self.prevScrollTop = scrollTop;
        self.rowFactory.UpdateViewableRange(new ng.Range(Math.max(0, rowIndex - EXCESS_ROWS), rowIndex + self.minRowsToRender() + EXCESS_ROWS));
        self.prevScrollIndex = rowIndex;
    };
    self.adjustScrollLeft = function (scrollLeft) {
        if (self.$headerContainer) {
            self.$headerContainer.scrollLeft(scrollLeft);
        }
    };
    self.resizeOnData = function (col) {
        // we calculate the longest data.
        var longest = col.minWidth;
        var arr = ng.utils.getElementsByClassName('col' + col.index);
        $.each(arr, function (index, elem) {
            var i;
            if (index == 0) {
                var kgHeaderText = $(elem).find('.ngHeaderText');
                i = ng.utils.visualLength(kgHeaderText) + 10;// +10 some margin
            } else {
                var ngCellText = $(elem).find('.ngCellText');
                i = ng.utils.visualLength(ngCellText) + 10; // +10 some margin
            }
            if (i > longest) {
                longest = i;
            }
        });
        col.width = col.longest = Math.min(col.maxWidth, longest + 7); // + 7 px to make it look decent.
        ng.domUtilityService.BuildStyles(self);
    };
    self.sortData = function(col, direction) {
        sortInfo = {
            column: col,
            direction: direction
        };
        self.clearSortingData(col);
        ng.sortService.Sort(sortInfo, self.sortedData);
        self.lastSortedColumn = col;
        self.searchProvider.evalFilter();
    };
    self.clearSortingData = function (col) {
        if (!col) {
            $.each(self.columns(), function (i, c) {
                c.sortDirection("");
            });
        } else if (self.lastSortedColumn && col != self.lastSortedColumn) {
            self.lastSortedColumn.sortDirection("");
        }
    };
    self.fixColumnIndexes = function() {
        //fix column indexes
        $.each(self.columns(), function (i, col) {
            col.index = i;
        });
    };
    //self vars
    self.elementsNeedMeasuring = true;
    self.columns = ko.observableArray([]);
    self.renderedRows = ko.observableArray([]);
    self.headerRow = null;
    self.rowHeight = self.config.rowHeight;
	self.jqueryUITheme = ko.observable(self.config.jqueryUITheme);
    self.footer = null;
    self.selectedItems = self.config.selectedItems;
    self.multiSelect = self.config.multiSelect;
    self.footerVisible = self.config.footerVisible;
    self.showColumnMenu = self.config.showColumnMenu;
    self.showMenu = ko.observable(false);
    self.configGroups = ko.observableArray([]);

    //Paging
    self.enablePaging = self.config.enablePaging;
    self.pagingOptions = self.config.pagingOptions;
    //Templates
    self.rowTemplate = self.config.rowTemplate || ng.defaultRowTemplate();
    self.headerRowTemplate = self.config.headerRowTemplate || ng.defaultHeaderRowTemplate();
    //scope funcs
    self.visibleColumns = ko.computed(function () {
        var cols = self.columns();
        return cols.filter(function (col) {
            var isVis = col.visible();
            return isVis;
        });
    });
    self.nonAggColumns = ko.computed(function () {
        return self.columns().filter(function (col) {
            return !col.isAggCol;
        });
    });
    self.toggleShowMenu = function () {
        self.showMenu(!self.showMenu());
    };
    self.allSelected = ko.observable(false);
    self.toggleSelectAll = function () {
        var s = self.allSelected();
        self.allSelected(!s);
        self.selectionService.toggleSelectAll(self.allSelected());
    };
    self.totalFilteredItemsLength = ko.computed(function () {
        return Math.max(self.filteredData.length);
    });
	self.showGroupPanel = ko.computed(function(){
		return self.config.showGroupPanel;
	});
	self.topPanelHeight = ko.computed(function(){
	    return self.config.showGroupPanel == true ? self.config.headerRowHeight * 2 : self.config.headerRowHeight;
	});
	self.viewportDimHeight = ko.computed(function () {
        return Math.max(0, self.rootDim.outerHeight - self.topPanelHeight() - self.config.footerRowHeight - 2);
    });
    self.groupBy = function(col) {
        var indx = self.configGroups.indexOf(col);
        if (indx == -1) {
            self.configGroups.push(col);
        } else {
            self.configGroups.splice(indx, 1);
            self.columns.splice(indx, 1);
        }
    };
    self.removeGroup = function(index) {
        self.columns.splice(index, 1);
        self.configGroups.splice(index, 1);
        if (self.configGroups.length == 0) {
            self.fixColumnIndexes();
            ng.domUtilityService.apply();
        }
    };
    self.totalRowWidth = function () {
        var totalWidth = 0,
            cols = self.visibleColumns();
        $.each(cols, function (i, col) {
            totalWidth += col.width;
        });
        return totalWidth;
    };
    self.headerScrollerDim = function () {
        var viewportH = self.viewportDimHeight(),
            maxHeight = self.maxCanvasHt(),
            vScrollBarIsOpen = (maxHeight > viewportH),
            newDim = new ng.Dimension();

        newDim.autoFitHeight = true;
        newDim.outerWidth = self.totalRowWidth();
        if (vScrollBarIsOpen) { newDim.outerWidth += self.elementDims.scrollW; }
        else if ((maxHeight - viewportH) <= self.elementDims.scrollH) { //if the horizontal scroll is open it forces the viewport to be smaller
            newDim.outerWidth += self.elementDims.scrollW;
        }
        return newDim;
    };
    //footer
    self.jqueryUITheme = self.config.jqueryUITheme;
    self.maxRows = ko.observable(Math.max(self.config.pagingOptions.totalServerItems() || self.sortedData().length, 1));
    self.maxRowsDisplay = ko.computed(function () {
        return self.maxRows();
    });
    self.multiSelect = ko.observable((self.config.canSelectRows && self.config.multiSelect));
    self.selectedItemCount = ko.computed(function () {
        return self.selectedItems().length;
    });
    self.maxPages = ko.computed(function () {
        self.maxRows(Math.max(self.config.pagingOptions.totalServerItems() || self.sortedData().length, 1));
        return Math.ceil(self.maxRows() / self.pagingOptions.pageSize());
    });
    self.pageForward = function () {
        var page = self.config.pagingOptions.currentPage();
        self.config.pagingOptions.currentPage = Math.min(page + 1, self.maxPages());
    };
    self.pageBackward = function () {
        var page = self.config.pagingOptions.currentPage();
        self.config.pagingOptions.currentPage = Math.max(page - 1, 1);
    };
    self.pageToFirst = function () {
        self.config.pagingOptions.currentPage = 1;
    };
    self.pageToLast = function () {
        var maxPages = self.maxPages();
        self.config.pagingOptions.currentPage = maxPages;
    };
    self.cantPageForward = ko.computed(function () {
        var curPage = self.config.pagingOptions.currentPage();
        var maxPages = self.maxPages();
        return !(curPage < maxPages);
    });
    self.cantPageBackward = ko.computed(function () {
        var curPage = self.config.pagingOptions.currentPage();
        return !(curPage > 1);
    });
    self.footerStyle = ko.computed(function () {
        return { "width": self.rootDim.outerWidth + "px", "height": self.config.footerRowHeight + "px" };
    });
    //call init
    self.init();
};

/***********************************************
* FILE: ..\src\classes\range.js
***********************************************/
ng.Range = function (top, bottom) {
    this.topRow = top;
    this.bottomRow = bottom;
};

/***********************************************
* FILE: ..\src\classes\row.js
***********************************************/
ng.Row = function (entity, config, selectionService) {
    var self = this, // constant for the selection property that we add to each data item
        canSelectRows = config.canSelectRows;

    self.rowClasses = config.rowClasses;
    self.selectedItems = config.selectedItems;
    self.entity = entity;
    self.selectionService = selectionService;
    //selectify the entity
    if (self.entity[SELECTED_PROP] === undefined) {
        self.entity[SELECTED_PROP] = false;
    }
    self.selected = ko.observable(false);
    self.toggleSelected = function (row, event) {
        if (!canSelectRows) {
            return true;
        }
        var element = event.target || event;
        //check and make sure its not the bubbling up of our checked 'click' event 
        if (element.type == "checkbox" && element.parentElement.className != "ngSelectionCell ng-scope") {
            return true;
        } 
        if (config.selectWithCheckboxOnly && element.type != "checkbox"){
            return true;
        } else {
            if (self.beforeSelectionChange(self)) {
                self.selectionService.ChangeSelection(self, event);
                return self.afterSelectionChange();
            }
        }
        return false;
    };
    self.rowIndex = ko.observable(0);
    self.offsetTop = ko.observable(0);
    self.rowDisplayIndex = 0;
    self.isEven = ko.computed(function () {
        if (self.rowIndex() % 2 == 0) return true;
        return false;
    });
    self.isOdd = ko.computed(function () {
        if (self.rowIndex() % 2 != 0) return true;
        return false;
    });
    self.beforeSelectionChange = config.beforeSelectionChangeCallback;
    self.afterSelectionChange = config.afterSelectionChangeCallback;
    self.propertyCache = {};
    self.getProperty = function (path) {
        return self.propertyCache[path] || ng.utils.evalProperty(self.entity, path);
    };
}; 

/***********************************************
* FILE: ..\src\classes\searchProvider.js
***********************************************/
ng.SearchProvider = function(grid) {
    var self = this;
    self.field = "";
    self.value = "";
    self.extFilter = grid.config.filterOptions.useExternalFilter;
    self.showFilter = grid.config.showFilter;
    self.filterText = grid.config.filterOptions.filterText;
    self.fieldMap = {};
    self.evalFilter = function() {
        var ft = self.filterText().toLowerCase();
        var v = self.value;
        grid.filteredData = grid.sortedData().filter(function(item) {
            if (!self.filterText) {
                return true;
            } else if (!self.field) {
                return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
            } else if (item[self.field] && self.value) {
                return item[self.field].toString().toLowerCase().indexOf(v) != -1;
            } else if (item[self.fieldMap[self.field]] && self.value) {
                return item[self.fieldMap[self.field]].toString().toLowerCase().indexOf(v) != -1;
            }
            return true;
        });
        grid.rowFactory.filteredDataChanged();
    };
    self.filterText.subscribe(function(a) {
        grid.config.filterOptions.filterText = a;
        if (self.extFilter) return;
        self.premise = a.split(':');
        if (self.premise.length > 1) {
            self.field = self.premise[0].toLowerCase().replace(' ', '_');
            self.value = self.premise[1].toLowerCase();
        } else {
            self.field = "";
            self.value = self.premise[0].toLowerCase();
        }
        self.evalFilter();
    });
    if (!self.extFilter) {
        grid.columns.subscribe(function(a) {
            $.each(a, function (i, col) {
                self.fieldMap[col.displayName().toLowerCase().replace(' ', '_')] = col.field;
            });
        });
    }
};

/***********************************************
* FILE: ..\src\classes\selectionService.js
***********************************************/
ng.SelectionService = function (grid) {
    var self = this;
    self.multi = grid.config.multiSelect;
    self.selectedItems = grid.config.selectedItems;
    self.selectedIndex = grid.config.selectedIndex;
    self.lastClickedRow = undefined;
    self.ignoreSelectedItemChanges = false; // flag to prevent circular event loops keeping single-select var in sync

    self.rowFactory = {};
	self.Initialize = function (rowFactory) {
        self.rowFactory = rowFactory;
    };
		
	// function to manage the selection action of a data item (entity)
	self.ChangeSelection = function (rowItem, evt) {
	    if (!self.multi) {
	        if (self.lastClickedRow && self.lastClickedRow.selected) {
	            self.setSelection(self.lastClickedRow, false);
	        }
	    } else if (evt && evt.shiftKey) {
            if (self.lastClickedRow) {
                var thisIndx = grid.filteredData.indexOf(rowItem.entity);
                var prevIndx = grid.filteredData.indexOf(self.lastClickedRow.entity);
                if (thisIndx == prevIndx) return false;
                prevIndx++;
                if (thisIndx < prevIndx) {
                    thisIndx = thisIndx ^ prevIndx;
                    prevIndx = thisIndx ^ prevIndx;
                    thisIndx = thisIndx ^ prevIndx;
                }
                for (; prevIndx <= thisIndx; prevIndx++) {
                    self.setSelection(self.rowFactory.rowCache[prevIndx], self.lastClickedRow.selected);
                }
                self.lastClickedRow = rowItem;
                return true;
            }
	    }
	    if (grid.config.keepLastSelected && !self.multi) {
	        self.setSelection(rowItem, true);
	    } else {
	        self.setSelection(rowItem, rowItem.selected() ? false : true);
	    }
	    
	    self.lastClickedRow = rowItem;
        return true;
    };

    // just call this func and hand it the rowItem you want to select (or de-select)    
    self.setSelection = function(rowItem, isSelected) {
        rowItem.selected(isSelected) ;
        rowItem.entity[SELECTED_PROP] = isSelected;
        if (!isSelected) {
            var indx = self.selectedItems.indexOf(rowItem.entity);
            self.selectedItems.splice(indx, 1);
        } else {
            if (self.selectedItems.indexOf(rowItem.entity) === -1) {
                self.selectedItems.push(rowItem.entity);
            }
        }
    };
    
    // @return - boolean indicating if all items are selected or not
    // @val - boolean indicating whether to select all/de-select all
    self.toggleSelectAll = function (checkAll) {
        var selectedlength = self.selectedItems.length;
        if (selectedlength > 0) {
            self.selectedItems.splice(0, selectedlength);
        }
        $.each(grid.filteredData, function (i, item) {
            item[SELECTED_PROP] = checkAll;
            if (checkAll) {
                self.selectedItems.push(item);
            }
        });
        $.each(self.rowFactory.rowCache, function (i, row) {
            row.selected(checkAll);
        });
    };
};

/***********************************************
* FILE: ..\src\classes\styleProvider.js
***********************************************/
ng.StyleProvider = function(grid) {
    grid.topPanelStyle = ko.computed(function() {
        return { "height": grid.topPanelHeight() + "px" };
    });
    grid.canvasStyle = ko.computed(function() {
        return { "height": grid.maxCanvasHt().toString() + "px" };
    });
    grid.headerScrollerStyle = ko.computed(function() {
        return { "height": grid.config.headerRowHeight + "px" };
    });
    grid.topPanelStyle = ko.computed(function() {
        return { "width": grid.rootDim.outerWidth + "px", "height": grid.topPanelHeight() + "px" };
    });
    grid.headerStyle = ko.computed(function() {
        return { "width": (grid.rootDim.outerWidth - ng.domUtilityService.ScrollW) + "px", "height": grid.config.headerRowHeight + "px" };
    });
    grid.viewportStyle = ko.computed(function() {
        return { "width": grid.rootDim.outerWidth + "px", "height": grid.viewportDimHeight() + "px" };
    });
};

/***********************************************
* FILE: ..\src\classes\GridService.js
***********************************************/
ng.gridService = {
    gridCache: {},
    eventStorage: {},
    getIndexOfCache: function() {
        var indx = -1;   
        for (var grid in ng.gridService.gridCache) {
            indx++;
            if (!ng.gridService.gridCache.hasOwnProperty(grid)) continue;
            return indx;
        }
        return indx;
    },
    StoreGrid: function (element, grid) {
        ng.gridService.gridCache[grid.gridId] = grid;
        element[GRID_KEY] = grid.gridId;
    },
    RemoveGrid: function(gridId) {
        delete ng.gridService.gridCache[gridId];
    },
    GetGrid: function (element) {
        var grid;
        if (element[GRID_KEY]) {
            grid = ng.gridService.gridCache[element[GRID_KEY]];
            return grid;
        }
        return false;
    },
    ClearGridCache : function () {
        ng.gridService.gridCache = {};
    },
    AssignGridEventHandlers: function (grid) {
        grid.$viewport.scroll(function (e) {
            var scrollLeft = e.target.scrollLeft,
            scrollTop = e.target.scrollTop;
            grid.adjustScrollLeft(scrollLeft);
            grid.adjustScrollTop(scrollTop);
        });
        grid.$viewport.off('keydown');
        grid.$viewport.on('keydown', function (e) {
            return ng.moveSelectionHandler(grid, e);
        });
        //Chrome and firefox both need a tab index so the grid can recieve focus.
        //need to give the grid a tabindex if it doesn't already have one so
        //we'll just give it a tab index of the corresponding gridcache index 
        //that way we'll get the same result every time it is run.
        //configurable within the options.
        if (grid.config.tabIndex === -1){
            grid.$viewport.attr('tabIndex', ng.gridService.getIndexOfCache(grid.gridId));
        } else {
            grid.$viewport.attr('tabIndex', grid.config.tabIndex);
        }
        $(window).resize(function () {
            ng.domUtilityService.UpdateGridLayout(grid);
            if (grid.config.maintainColumnRatios) {
                grid.configureColumnWidths();
            }
        });
    },
};

/***********************************************
* FILE: ..\src\classes\SortService.js
***********************************************/
ng.sortService = {
    colSortFnCache: {}, // cache of sorting functions. Once we create them, we don't want to keep re-doing it
    dateRE: /^(\d\d?)[\/\.-](\d\d?)[\/\.-]((\d\d)?\d\d)$/, // nasty regex for date parsing
    guessSortFn: function(item) {
        var sortFn, // sorting function that is guessed
            itemType, // the typeof item
            dateParts, // for date parsing
            month, // for date parsing
            day; // for date parsing

        if (item === undefined || item === null || item === '') return null;
        itemType = typeof(item);
        //check for numbers and booleans
        switch (itemType) {
            case "number":
                sortFn = ng.sortService.sortNumber;
                break;
            case "boolean":
                sortFn = ng.sortService.sortBool;
                break;
        }
        //if we found one, return it
        if (sortFn) return sortFn;
        //check if the item is a valid Date
        if (Object.prototype.toString.call(item) === '[object Date]') return ng.sortService.sortDate;
        // if we aren't left with a string, return a basic sorting function...
        if (itemType !== "string") return ng.sortService.basicSort;
        // now lets string check..
        //check if the item data is a valid number
        if (item.match(/^-?[�$�]?[\d,.]+%?$/)) return ng.sortService.sortNumberStr;
        // check for a date: dd/mm/yyyy or dd/mm/yy
        // can have / or . or - as separator
        // can be mm/dd as well
        dateParts = item.match(ng.sortService.dateRE);
        if (dateParts) {
            // looks like a date
            month = parseInt(dateParts[1]);
            day = parseInt(dateParts[2]);
            if (month > 12) {
                // definitely dd/mm
                return ng.sortService.sortDDMMStr;
            } else if (day > 12) {
                return ng.sortService.sortMMDDStr;
            } else {
                // looks like a date, but we can't tell which, so assume that it's MM/DD
                return ng.sortService.sortMMDDStr;
            }
        }
        //finally just sort the normal string...
        return ng.sortService.sortAlpha;
    },
    basicSort: function(a, b) {
        if (a == b) return 0;
        if (a < b) return -1;
        return 1;
    },
    sortNumber: function(a, b) {
        return a - b;
    },
    sortNumberStr: function(a, b) {
        var numA, numB, badA = false, badB = false;
        numA = parseFloat(a.replace(/[^0-9.-]/g, ''));
        if (isNaN(numA)) badA = true;
        numB = parseFloat(b.replace(/[^0-9.-]/g, ''));
        if (isNaN(numB)) badB = true;
        // we want bad ones to get pushed to the bottom... which effectively is "greater than"
        if (badA && badB) return 0;
        if (badA) return 1;
        if (badB) return -1;
        return numA - numB;
    },
    sortAlpha: function(a, b) {
        var strA = a.toLowerCase(),
            strB = b.toLowerCase();
        return strA == strB ? 0 : (strA < strB ? -1 : 1);
    },
    sortBool: function(a, b) {
        if (a && b) return 0;
        if (!a && !b) {
            return 0;
        } else {
            return a ? 1 : -1;
        }
    },
    sortDate: function(a, b) {
        var timeA = a.getTime(),
            timeB = b.getTime();
        return timeA == timeB ? 0 : (timeA < timeB ? -1 : 1);
    },
    sortDDMMStr: function(a, b) {
        var dateA, dateB, mtch, m, d, y;
        mtch = a.match(ng.sortService.dateRE);
        y = mtch[3];
        m = mtch[2];
        d = mtch[1];
        if (m.length == 1) m = '0' + m;
        if (d.length == 1) d = '0' + d;
        dateA = y + m + d;
        mtch = b.match(ng.sortService.dateRE);
        y = mtch[3];
        m = mtch[2];
        d = mtch[1];
        if (m.length == 1) m = '0' + m;
        if (d.length == 1) d = '0' + d;
        dateB = y + m + d;
        if (dateA == dateB) return 0;
        if (dateA < dateB) return -1;
        return 1;
    },
    sortMMDDStr: function(a, b) {
        var dateA, dateB, mtch, m, d, y;
        mtch = a.match(ng.sortService.dateRE);
        y = mtch[3];
        d = mtch[2];
        m = mtch[1];
        if (m.length == 1) m = '0' + m;
        if (d.length == 1) d = '0' + d;
        dateA = y + m + d;
        mtch = b.match(dateRE);
        y = mtch[3];
        d = mtch[2];
        m = mtch[1];
        if (m.length == 1) m = '0' + m;
        if (d.length == 1) d = '0' + d;
        dateB = y + m + d;
        if (dateA == dateB) return 0;
        if (dateA < dateB) return -1;
        return 1;
    },
    sortData: function (data /*datasource*/, sortInfo) {
        var unwrappedData = data();
        // first make sure we are even supposed to do work
        if (!unwrappedData || !sortInfo) {
            return;
        }
        // grab the metadata for the rest of the logic
        var col = sortInfo.column,
            direction = sortInfo.direction,
            sortFn,
            item;
        //see if we already figured out what to use to sort the column
        if (ng.sortService.colSortFnCache[col.field]) {
            sortFn = ng.sortService.colSortFnCache[col.field];
        } else if (col.sortingAlgorithm != undefined) {
            sortFn = col.sortingAlgorithm;
            ng.sortService.colSortFnCache[col.field] = col.sortingAlgorithm;
        } else { // try and guess what sort function to use
            item = unwrappedData[0];
            sortFn = ng.sortService.guessSortFn(item[col.field]);
            //cache it
            if (sortFn) {
                ng.sortService.colSortFnCache[col.field] = sortFn;
            } else {
                // we assign the alpha sort because anything that is null/undefined will never get passed to
                // the actual sorting function. It will get caught in our null check and returned to be sorted
                // down to the bottom
                sortFn = ng.sortService.sortAlpha;
            }
        }
        //now actually sort the data
        unwrappedData.sort(function (itemA, itemB) {
            var propA = ng.utils.evalProperty(itemA, col.field);
            var propB = ng.utils.evalProperty(itemB, col.field);
            // we want to force nulls and such to the bottom when we sort... which effectively is "greater than"
            if (!propB && !propA) {
                return 0;
            } else if (!propA) {
                return 1;
            } else if (!propB) {
                return -1;
            }
            //made it this far, we don't have to worry about null & undefined
            if (direction === ASC) {
                return sortFn(propA, propB);
            } else {
                return 0 - sortFn(propA, propB);
            }
        });
        data(unwrappedData);
        return;
    },
    Sort: function (sortInfo, data) {
        if (ng.sortService.isSorting) return;
        ng.sortService.isSorting = true;
        ng.sortService.sortData(data, sortInfo);
        ng.sortService.isSorting = false;
    },
};

/***********************************************
* FILE: ..\src\classes\DomUtilityService.js
***********************************************/
var getWidths = function () {
    var $testContainer = $('<div></div>');
    $testContainer.appendTo('body');
    // 1. Run all the following measurements on startup!
    //measure Scroll Bars
    $testContainer.height(100).width(100).css("position", "absolute").css("overflow", "scroll");
    $testContainer.append('<div style="height: 400px; width: 400px;"></div>');
    ng.domUtilityService.ScrollH = ($testContainer.height() - $testContainer[0].clientHeight);
    ng.domUtilityService.ScrollW = ($testContainer.width() - $testContainer[0].clientWidth);
    $testContainer.empty();
    //clear styles
    $testContainer.attr('style', '');
    //measure letter sizes using a pretty typical font size and fat font-family
    $testContainer.append('<span style="font-family: Verdana, Helvetica, Sans-Serif; font-size: 14px;"><strong>M</strong></span>');
    ng.domUtilityService.LetterW = $testContainer.children().first().width();
    $testContainer.remove();
};
ng.domUtilityService = {
    AssignGridContainers: function (rootEl, grid) {
        grid.$root = $(rootEl);
        //Headers
        grid.$topPanel = grid.$root.find(".ngTopPanel");
        grid.$groupPanel = grid.$root.find(".ngGroupPanel");
        grid.$headerContainer = grid.$topPanel.find(".ngHeaderContainer");
        grid.$headerScroller = grid.$topPanel.find(".ngHeaderScroller");
        grid.$headers = grid.$headerScroller.children();
        //Viewport
        grid.$viewport = grid.$root.find(".ngViewport");
        //Canvas
        grid.$canvas = grid.$viewport.find(".ngCanvas");
        //Footers
        grid.$footerPanel = grid.$root.find(".ngFooterPanel");
        ng.domUtilityService.UpdateGridLayout(grid);
    },
    UpdateGridLayout: function(grid) {
        // first check to see if the grid is hidden... if it is, we will screw a bunch of things up by re-sizing
        if (grid.$root.parents(":hidden").length > 0) {
            return;
        }
        //catch this so we can return the viewer to their original scroll after the resize!
        var scrollTop = grid.$viewport.scrollTop();
        grid.elementDims.rootMaxW = grid.$root.width();
        grid.elementDims.rootMaxH = grid.$root.height();
        //check to see if anything has changed
        grid.refreshDomSizes();
        grid.adjustScrollTop(scrollTop, true); //ensure that the user stays scrolled where they were
    },
    BuildStyles: function(grid) {
        var rowHeight = grid.config.rowHeight,
            headerRowHeight = grid.config.headerRowHeight,
            $style = grid.$styleSheet,
            gridId = grid.gridId,
            css,
            cols = grid.visibleColumns(),
            sumWidth = 0;
        
        if (!$style) $style = $("<style type='text/css' rel='stylesheet' />").appendTo($('html'));
        $style.empty();
        var trw = grid.totalRowWidth();
        css = "." + gridId + " .ngCanvas { width: " + trw + "px; }"+
              "." + gridId + " .ngRow { width: " + trw + "px; }" +
              "." + gridId + " .ngCell { height: " + rowHeight + "px; }"+
              "." + gridId + " .ngCanvas { width: " + trw + "px; }" +
              "." + gridId + " .ngHeaderCell { top: 0; bottom: 0; }" + 
              "." + gridId + " .ngHeaderScroller { line-height: " + headerRowHeight + "px; width: " + (trw + ng.domUtilityService.scrollH + 2) + "px}";
        $.each(cols, function (i, col) {
            css += "." + gridId + " .col" + i + " { width: " + col.width + "px; left: " + sumWidth + "px; right: " + (trw - sumWidth - col.width) + "px; height: " + rowHeight + "px }" +
                   "." + gridId + " .colt" + i + " { width: " + col.width + "px; }";
            sumWidth += col.width;
        });
        if (ng.utils.isIe) { // IE
            $style[0].styleSheet.cssText = css;
        } else {
            $style[0].appendChild(document.createTextNode(css));
        }
        grid.$styleSheet = $style;
    },
    ScrollH: 17, // default in IE, Chrome, & most browsers
    ScrollW: 17, // default in IE, Chrome, & most browsers
    LetterW: 10
};
getWidths();

/***********************************************
* FILE: ..\src\bindingHandlers\ng-grid.js
***********************************************/
ko.bindingHandlers['ngGrid'] = (function () {
    return {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
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

/***********************************************
* FILE: ..\src\bindingHandlers\ng-row.js
***********************************************/
ko.bindingHandlers['ngRow'] = (function () {
    return {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var row = valueAccessor();
            var grid = row.$parent = bindingContext.$parent;
            var html;
            if (row.isAggRow) {
                html = ng.aggregateTemplate();
                if (row.aggLabelFilter) {
                    html = html.replace(CUSTOM_FILTERS, '| ' + row.aggLabelFilter);
                } else {
                    html = html.replace(CUSTOM_FILTERS, "");
                }
            } else {
                html = grid.rowTemplate;
            }
            var rowElem = $(html);
            ko.applyBindings(row, rowElem[0]);
            $(element).append(rowElem);
            return { controlsDescendantBindings: true };
        }
    };
}());

/***********************************************
* FILE: ..\src\bindingHandlers\ng-cell.js
***********************************************/
ko.bindingHandlers['ngCell'] = (function () {
    return {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var col = valueAccessor();
            col.$parent = bindingContext.$parent;
            var cell = $(col.cellTemplate);
            ko.applyBindings(col, cell[0]);
            $(element).append(cell);
            return { controlsDescendantBindings: true };
        }
    };
}());

/***********************************************
* FILE: ..\src\bindingHandlers\ng-header-row.js
***********************************************/
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

/***********************************************
* FILE: ..\src\bindingHandlers\ng-header-cell.js
***********************************************/
ko.bindingHandlers['ngHeaderCell'] = (function () {
    return {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var col = valueAccessor();
            col.$index = bindingContext.$index;
            col.$grid = bindingContext.$parent;
            var headerCell = $(col.headerCellTemplate);
            ko.applyBindings(col, headerCell[0]);
            $(element).append(headerCell);
            return { controlsDescendantBindings: true };
        }
    };
}());
}(window));
