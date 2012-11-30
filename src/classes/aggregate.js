/// <reference path="../../lib/knockout-2.2.0.js" />
/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>
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