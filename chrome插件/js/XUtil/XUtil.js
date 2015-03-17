(function (window){

"use strict";

/*
 * 一个依赖于jquery和jquery-ui-dialog的js widget库
 * 支持IE10以上的IE浏览器，谷歌浏览器，火狐浏览器
 * 目前包括：拥有增删改查功能，以及过滤，排序，分页，定制等功能的表格，关键字过滤器，弹出框，可以动态修改树结构的树型结构菜单，
 * 		   一个可以绑定在鼠标右键或者dom元素上的悬浮菜单，以及一个工具函数集
 *
 * Author: Ellery Shen
 * Date: 12-17-2014
 * 
 * 这个库使用了grunt进行自动化构建，本文件由src目录下所有js文件合并而成，详见Gruntfile.js中的配置
 * 可以单独引入某个组件，但必须先引入base.js，然后引入单个js文件
 * 
 * 15-01-2015更新：新增瀑布式布局组件
 */

//源文件：src/base.js
//全局变量
var XUtil = {};

/*
 * 配置参数
 * 包括: rootPath:本库文件所在目录。每次使用库前需要修改config.rootPath,
 * 		这个路径与本库中使用的WebWorker路径有关，因此必须正确地被设置
 * 		jquery,jquery-ui:使用requireJS或者其他AMD加载器时jquery和jquery-ui的模块名
 */
XUtil.config = {
    rootPath: "js/vendor/XUtil",
    jQuery: 'jquery',
    jQueryUI: 'jquery-ui'
};

//工具函数集
XUtil.helpers = {
    //本库内部使用的控制台函数
    log: function () {
        var args = Array.prototype.slice.apply(arguments, []);
        args.unshift('(XUtil) ');
        console.log.apply(console, args);
    },

    //内部使用的异常工厂函数
    error: function () {
        if (arguments[0]) {
            var newStr = '(XUtil) ' + arguments[0].toString();
            return new Error(newStr);
        }
    },

    //为某个元素添加一层半透明遮罩，用来屏蔽该元素以及内部元素的响应事件
    //接收三个参数targetDiv(目标div), opacity(透明度)和zIndex(z-index的值)
    //返回遮罩元素
    addShield: function (targetDiv, opacity, zIndex) {
        var top, left, width, height;
        var opacity;
        var targetZIndex = zIndex || 1;
        var shield;

        !targetDiv && (targetDiv = document.body);
        targetDiv = $(targetDiv);

        top = targetDiv.offset().top;
        left = targetDiv.offset().left;
        width = targetDiv.outerWidth();
        height = targetDiv.outerHeight();

        if (!$.isNumeric(opacity)) {
            opacity = 0.5;
        }

        shield = $("<div class='xTable-pageShield'></div>");

        shield.css('position', 'absolute')
            .css('z-index', targetZIndex)
            .css('background', '#ebe9e9')
            .css('opacity', opacity)
            .css('top', top)
            .css('left', left)
            .css('width', width)
            .css('height', height)
            .appendTo(document.body);

        return shield;
    },

    //清除遮罩
    //接收遮罩元素作为参数，如果无参数则清除页面中的所有遮罩
    removeShield: function (shield) {
        if (!shield) {
            $('.xTable-pageShield').remove();
        }
        else {
            $(shield).remove();
        }
    },

    //一个异常处理工具函数，
    //可以在指定的dom元素周围显示一个错误提示
    //接收三个参数：
    //element:目标dom的引用
    //msg:需要显示的提示信息
    //style:为提示添加附加样式
    showErrorHint: function (element, msg, style) {
        var parent = $(element.parentNode);
        var errorHint = $("<div class='errorHint' style='color:red'>* " + msg + "</div>");
        if (parent.find('.errorHint').length === 0) {
            errorHint.insertAfter(element);
            if (style) {
                errorHint[0].style = 'color:red;' + style;
            }
        }
    },

    //清除错误提示的工具函数
    //接收一个参数element,清除加在指定元素上的提示
    //如果不传参数则清除页面上的所有错误提示
    clearErrorHint: function (element) {
        !element && $('.errorHint').remove();
        element && $(element.parentNode).find('.errorHint').remove();
    },

    //解析url后返回一个url参数对象的工具函数
    getUrlArgs: function () {
        var args = {};
        var query = location.search.substring(1);
        var pairs = query.split('&');
        var i, pos, name, value;

        for (i = 0; i < pairs.length; i++) {
            pos = pairs[i].indexOf('=');
            if (pos === -1) continue;
            name = pairs[i].substring(0, pos);
            value = decodeURI(pairs[i].substring(pos + 1));
            args[name] = value;
        }
        return args;
    },

    //guid生成工具
    //Author: Robert Kieffer
    guid: function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0 & 3 | 0x8);
            return v.toString(16);
        }).toUpperCase();
    },

    //预加载图片方法
    //可接收不定数量的参数，参数为图片的url
    preloadImages: function () {
        var i;
        for (i = 0; i < arguments.length; i++) {
            (new Image()).src = arguments[i].toString();
        }
    }
};
/**
 * 源文件：src/dialog.js
 * 对话框组件
 */

XUtil.XDialog=function(option){
	
};
/*
 * 源文件：src/menu.js
 * 树结构菜单
 * 可以通过给Menu实例附加(调用append方法)不同类型的MenuItem(简单Item和拥有子菜单的Item)来逐步构造菜单的树结构,
 * 或者直接将一个描述树结构的JSON赋给menuSrc属性，之后调用startUp方法来初始化Menu
 * 可以动态修改菜单的树结构，详见MenuItem
 * 菜单拥有两种展示形式：垂直vertical（类似windows资源管理器的树形展开菜单）和水平horizontal（类似点击鼠标右键后出现的悬浮菜单）
 * 拥有以下实例方法：
 * append:为菜单添加一个菜单项，可以是simpleItem或者popupItem,
 * open:将菜单展开至某个位置，接收一个位置字符串作为参数，例如0-2就是 展开第一个子菜单后，展开第一个子菜单的第二个子菜单
 * startUp:初始化/刷新菜单
 * closeAll:关闭所有打开的子菜单
 */
XUtil.XMenu = function (option) {
    //控制台函数的引用
    var log = XUtil.helpers.log;

    //类的私有成员
    var id = option.id || 'XMenu-' + XUtil.helpers.guid(),
        renderTo = option.renderTo,
        mMenuClass = option.menuClass || '',
        mTextClass = option.textClass || '',
        mIconClass = option.iconClass || '',
        mLabelClass = option.labelClass || '',
        mIconRightClass = option.iconRightClass || '',
        subMenuMargin = option.subMenuMargin || 20;

    var simpleItems = [],
        popups = [],
        allItems = [];

    //构建SimpleItem,内部使用
    var initSimpleItem = function (simpleItem, targetDiv) {
        var simpleItemId = simpleItem.id || 'XMenu-SimpleItem-' + XUtil.helpers.guid();

        var simpleItemDiv = $("<li class='XMenuItem XMenuSimpleItem' id='" + simpleItemId + "'></li>"),
            iconSpan = $("<div class='XMenuItemIcon' style='display:inline-block;'></div>"),
            labelTextSpan = $("<div class='XMenuItemLabelText' style='display:inline-block;'></div>"),
            labelSpan = $("<div class='XMenuItemLabel simpleItemLabel'></div>"),
            iconRightSpan = $("<div class='XMenuItemIconRight' style='display:inline-block;'></div>");

        var label = simpleItem.label;

        var onClick = simpleItem.onClick || function (simpleItemData, simpleItem, simpleItemDiv) {
            log(simpleItemData);
        };

        var iconClass = simpleItem.iconClass || mIconClass,
            iconRightClass = simpleItem.iconRightClass || mIconRightClass,
            textClass = simpleItem.textClass || mTextClass,
            labelClass = simpleItem.labelClass || mLabelClass;

        simpleItems.push(simpleItem);

        //给simpleItem添加一个到它的dom的引用
        simpleItem.domNode = simpleItemDiv;

        simpleItemDiv.data('itemData', simpleItem.itemData);

        labelSpan
            .append(iconSpan)
            .append(labelTextSpan)
            .append(iconRightSpan)
            .appendTo(simpleItemDiv);

        labelTextSpan.html(label).addClass(textClass);
        iconSpan.addClass(iconClass);
        iconRightSpan.addClass(iconRightClass);
        labelSpan.addClass(labelClass);

        simpleItemDiv.click(function () {
            onClick(simpleItem.data, simpleItem, simpleItemDiv);
        });

        if (that.type === 'horizontal') {
            simpleItemDiv.bind('mouseenter', function () {
                var siblings;
                if (simpleItem.parent.subMenu) {
                    siblings = simpleItem.parent.subMenu;
                }
                else {
                    siblings = simpleItem.parent.menuSrc;
                }

                siblings.forEach(function (sib) {
                    sib.close && sib.close();
                });
            });
        }

        $(targetDiv).append(simpleItemDiv);
    };

    //构建PopupItem,内部使用
    var initPopupItem = function (popupItem, targetDiv) {

        var label = popupItem.label;

        var popupId = popupItem.id || 'XMenu-PopupItem-' + XUtil.helpers.guid(),
            popupItemDiv = $("<div class='XMenuItem XMenuPopupItem' id='" + popupId + "'></div>");

        var subMenu,
            subMenuDiv = $("<ul class='XMenuSubMenu'></ul>"),
            labelSpan = $("<li class='XMenuItemLabel popupItemLabel' style='cursor:pointer;'></li>"),
            iconSpan = $("<div class='XMenuItemIcon' style='display:inline-block;'></div>"),
            labelTextSpan = $("<div class='XMenuItemLabelText' style='display:inline-block;'></div>"),
            iconRightSpan = $("<div class='XMenuItemIconRight' style='display:inline-block;'></div>");

        var textClass = popupItem.textClass || mTextClass,
            iconClass = popupItem.iconClass || mIconClass,
            labelClass = popupItem.labelClass || mLabelClass,
            subMenuClass = popupItem.subMenuClass || mMenuClass,
            iconRightClass = popupItem.iconRightClass || mIconRightClass;

        var onClick = popupItem.onClick || function (popupItemData, popupItem, popupItemDiv) {
            log(popupItemData);
        };

        popups.push(popupItem);

        //给popupItem添加一个到它的dom的引用
        popupItem.domNode = popupItemDiv;
        //给popupItem的dom元素绑定一个data属性
        popupItemDiv.data('itemData', popupItem.data);

        $(targetDiv).append(popupItemDiv);
        subMenuDiv.hide();
        if (that.type === 'horizontal') {
            subMenuDiv.css('position', 'absolute');
        }

        subMenuDiv.addClass(subMenuClass);
        labelTextSpan.html(label).addClass(textClass);
        iconSpan.addClass(iconClass);
        iconRightSpan.addClass(iconRightClass);
        labelSpan.addClass(labelClass);

        labelSpan
            .append(iconSpan)
            .append(labelTextSpan)
            .append(iconRightSpan)
            .appendTo(popupItemDiv);

        labelTextSpan.click(function () {
            onClick(popupItem.data, popupItem, popupItemDiv);
        });

        subMenu = popupItem.subMenu;
        //递归调用，构建子树
        subMenu.forEach(function (subItem) {
            var itemClass = subItem.itemClass;
            subItem.parent = popupItem;
            if (itemClass === 'simple') {
                initSimpleItem(subItem, subMenuDiv);
            }
            else if (itemClass === 'popup') {
                initPopupItem(subItem, subMenuDiv);
            }
        });
        subMenuDiv.appendTo(popupItemDiv);

        //打开popupItem
        var openPopup = function () {

            var baseWidth, borderLeftWidth, borderTopWidth;
            var left, top;
            var openDirection = that.openDirection;

            baseWidth = parseInt(popupItemDiv.css('width'));
            //在ff下使用border-width取不到值，在ie下可以，这里必须使用border-left-width
            borderLeftWidth = isNaN(parseInt(subMenuDiv.css('border-left-width'))) ? 0 : parseInt(subMenuDiv.css('border-left-width'));
            borderTopWidth = isNaN(parseInt(subMenuDiv.css('border-top-width'))) ? 0 : parseInt(subMenuDiv.css('border-top-width'));

            if (that.type === 'vertical') {
                if (that.animated === true) {
                    subMenuDiv.slideDown('fast');
                }
                else {
                    subMenuDiv.show();
                }
                subMenuDiv
                    .css('margin-left', subMenuMargin)
                    .css('width', baseWidth - subMenuMargin - 2 * borderLeftWidth);
            }
            else {
                //悬浮菜单模式下针对四种不同打开方向的配置
                if (openDirection === 'bottomRight') {
                    left = labelSpan.parent().parent().outerWidth() + labelSpan.parent().position().left;
                    top = labelSpan.position().top;
                    subMenuDiv
                        .css('top', top - borderTopWidth + "px")
                        .css('left', parseInt(left - 2 * borderLeftWidth) + "px");
                }
                else if (openDirection === 'bottomLeft') {
                    left = labelSpan.parent().position().left - labelSpan.parent().parent().outerWidth();
                    top = labelSpan.position().top;
                    subMenuDiv
                        .css('top', top - borderTopWidth + "px")
                        .css('left', parseInt(left) + "px");
                }
                else if (openDirection === 'topRight') {
                    left = labelSpan.parent().parent().outerWidth() + labelSpan.parent().position().left;
                    top = labelSpan.position().top - subMenuDiv.outerHeight() + labelSpan.outerHeight();

                    subMenuDiv
                        .css('top', top + borderTopWidth + "px")
                        .css('left', parseInt(left - 2 * borderLeftWidth) + "px");
                }
                else if (openDirection === 'topLeft') {
                    left = labelSpan.parent().position().left - labelSpan.parent().parent().outerWidth();
                    top = labelSpan.position().top - subMenuDiv.outerHeight() + labelSpan.outerHeight();
                    subMenuDiv
                        .css('top', top + borderTopWidth + "px")
                        .css('left', parseInt(left) + "px");
                }

                if (that.animated === true && that.type === 'horizontal') {
                    subMenuDiv.fadeIn('fast');
                }
                else {
                    subMenuDiv.show();
                }

            }

            labelSpan.find('.XMenuItemIconRight').addClass('rotate');
            labelSpan.addClass('opened');
            labelSpan.attr('opened', 'opened');
            iconRightSpan.addClass('subExpanded');
            popupItem.isOpened = true;
        };

        //关闭popupItem,将会递归地关闭它的所有子孙popupItem
        var closePopup = function () {

            var subMenuDiv = this.domNode.find('.XMenuSubMenu'),
                labelSpan = this.domNode.find('.XMenuItemLabel'),
                iconRightSpan = this.domNode.find('.XMenuItemIconRight');

            subMenuDiv.find('.XMenuPopupItem').removeAttr('opened');

            iconRightSpan.removeClass('rotate');

            if (that.animated === true && that.type === 'vertical') {
                subMenuDiv.slideUp('fast');
            }
            else if (that.animated === true && that.type === 'horizontal') {
                subMenuDiv.fadeOut('fast');
            }
            else {
                subMenuDiv.hide();
            }

            //递归关闭所有子孙popupItem
            this.subMenu.forEach(function (sub) {
                if (sub.itemClass === 'popupItem') {
                    $.proxy(closePopup, sub)();
                }
            });

            labelSpan.removeClass('opened');
            labelSpan.attr('opened') && labelSpan.removeAttr('opened');
            iconRightSpan.removeClass('subExpanded');
            this.isOpened = false;
        };

        popupItem.open = openPopup;
        popupItem.close = closePopup;
        popupItem.isOpened = false;

        if (that.type === 'vertical') {
            iconRightSpan.click(function () {
                var opened = $(this.parentNode).attr('opened');
                if (opened === 'opened') {
                    popupItem.close();
                }
                else {
                    popupItem.open();
                }
            });
        }
        else {
            popupItemDiv.bind('mouseenter', function (e) {
                //在鼠标放在item 0.4秒后展开子菜单
                var self = this,
                    opened,
                    siblings;

                if (popupItem.parent.subMenu) {
                    siblings = popupItem.parent.subMenu;
                }
                else {
                    siblings = popupItem.parent.menuSrc;
                }

                $(self).find('.XMenuItemLabel').attr('opened', 'opened');

                siblings.forEach(function (sib) {
                    if (sib !== popupItem)
                        sib.close && sib.close();
                });

                //为了提高用户体验而设置的延迟
                setTimeout(function () {
                    opened = $(self).find('.XMenuItemLabel').attr('opened');

                    if (opened) {
                        popupItem.open();
                    }
                }, 400);
            });
        }

    };

    //私有，获取一个menuItem的location
    var getLocation = function (item) {
        var locationArr = [];
        var self = item;
        var subStr;
        while (self.parent !== undefined && self.parent.subMenu !== undefined) {
            subStr = self.parent.subMenu.indexOf(self);
            locationArr.push(subStr);
            self = self.parent;
        }
        locationArr.push(self.parent.menuSrc.indexOf(self));

        return locationArr.reverse().join('-');
    };

    //在悬浮菜单模式下，鼠标左键点击菜单外将会关闭整个菜单中的所有popupItem
    $(document).click(function (event) {
        var target = event.target;
        if (that.type === 'horizontal') {
            if (!$(that.domNode).find(target)[0]) {
                that.closeAll();
            }
        }
    });

    //在悬浮菜单模式下，当鼠标处在菜单范围外，将会关闭鼠标X坐标右边（或左边，根据展开方向确定）的所有菜单
    //这种行为与OS X中的系统悬浮菜单一致
    $(document).bind('mousemove', function (event) {
        var mouseX;
        var popupItemDiv, popupX;
        var target = event.target;
        mouseX = event.pageX;
        if (!$(that.domNode).find(target)[0] && that.type === 'horizontal') {
            that.allItems.forEach(function (item) {
                if (item.itemClass === 'popup' && item.isOpened === true) {
                    popupItemDiv = item.domNode;
                    popupX = $(popupItemDiv).offset().left;
                    if (that.openDirection.toLowerCase().search('right') !== -1) {
                        if (popupX > mouseX) {
                            item.close();
                        }
                    }
                    else if (that.openDirection.toLowerCase().search('left') !== -1) {
                        if (popupX + $(popupItemDiv).outerWidth() < mouseX) {
                            item.close();
                        }
                    }
                }
            });
        }
    });

    //类的实例成员
    var that = {};
    //菜单类型
    that.type = option.type || 'vertical';
    //是否开启动画
    that.animated = false;
    if ('animated' in option && option.animated === true) {
        that.animated = true;
    }
    //描述树结构的数组
    that.menuSrc = [];
    //保存所有节点的数组
    that.allItems = [];
    //打开菜单的方向，可以设为左上，左下，右上，右下
    that.openDirection = option.openDirection || 'bottomRight';
    //这个属性记录了树结构的级数
    that.maxLevel = 0;

    //给菜单添加菜单项
    that.append = function (item) {
        if (item && item.itemClass && (item.itemClass === 'popup' || item.itemClass === 'simple')) {
            that.menuSrc.push(item);
            item.parent = that;
        }
        return that;
    };

    //将菜单展开至某个特定位置
    that.open = function (location) {
        var locationArr = location.split('-'),
            self = that.menuSrc[locationArr[0]];
        var i, target;

        if (self.open) {
            self.open();
        }
        else {
            return self;
        }

        for (i = 1; i < locationArr.length; i++) {
            target = locationArr[i];
            self.subMenu[target] && self.subMenu[target].open && self.subMenu[target].open();
            self = self.subMenu[target];
        }

        return self;
    };

    //关闭所有打开的popupItem
    that.closeAll = function () {
        that.menuSrc.forEach(function (sub) {
            if (sub.itemClass === 'popup') {
                sub.close();
            }
        });
    };

    //初始化/刷新菜单UI
    that.startUp = function () {
        var rootDiv = $("<div class='XMenu' id='" + id + "'></div>")[0];
        var renderToDiv = $('#' + renderTo);

        $(rootDiv).addClass(mMenuClass).css('position', 'relative');
        renderToDiv
            .empty()
            .append(rootDiv);

        //构建树型结构菜单
        that.menuSrc.forEach(function (menuItem, i) {
            var itemClass = menuItem.itemClass;
            menuItem.parent = that;
            if (itemClass === 'simple') {
                initSimpleItem(menuItem, rootDiv);
            }
            else if (itemClass === 'popup') {
                initPopupItem(menuItem, rootDiv);
            }
        });

        allItems = simpleItems.concat(popups);
        allItems.forEach(function (item) {
            var level;
            item.location = getLocation(item);
            item.rootMenu = that;
            //计算树结构的级数
            level = item.location.split('-').length;
            if (level > that.maxLevel) {
                that.maxLevel = level;
            }
        });

        that.domNode = rootDiv;
        that.allItems = allItems;

        $(rootDiv).children().addClass('firstLevelItem');
        that.type === 'vertical' ? $(rootDiv).addClass('vertical') : $(rootDiv).addClass('horizontal');
    };
    return that;
};

/*
 * 简单MenuItem，同时作为popupItem的基类
 * 可以定制菜单项的文本，以及各个部分的className
 * 可以添加onclick回调
 * 拥有三个实例方法：
 * 		remove:将item从树结构中移除
 *      appendTo:将item和他的子孙节点添加至某个节点（形成一棵以目标节点为根节点的新的子树）
 *      		 ，如果目标节点是simpleItem，则将其转化为一个popupItem后添加
 *      		 （注意：父节点不能被添加到它的子节点中，叶子节点可以任意移动）
 *      insertAt:将item插入它同级节点中的某个位置
 * */
XUtil.MenuItem = function (option) {
    return {
        itemClass: 'simple',
        label: option.label || '空',
        onClick: option.onClick || function (itemData, item, itemDom) {
            var log = XUtil.helpers.log;
            log(itemData);
        },
        option: option,
        iconClass: option.iconClass || '',
        labelClass: option.labelClass || '',
        id: option.id || 'XMenu-SimpleItem-' + XUtil.helpers.guid(),
        textClass: option.textClass || '',
        iconRightClass: option.iconRightClass || '',
        data: option.data || {},
        //父节点的引用，在构建树结构时初始化
        parent: undefined,
        //从目录树中移除本节点
        remove: function () {
            var targetIndex;
            //从父节点的子节点数组中移除本节点
            if (this.parent.subMenu) {
                targetIndex = this.parent.subMenu.indexOf(this);
                if (targetIndex !== -1) {
                    this.parent.subMenu.splice(targetIndex, 1);
                }
            }
            else if (this.parent.menuSrc) {
                targetIndex = this.parent.menuSrc.indexOf(this);
                if (targetIndex !== -1) {
                    this.parent.menuSrc.splice(this.parent.menuSrc.indexOf(this), 1);
                }
            }

            //刷新菜单
            this.rootMenu && this.rootMenu.startUp && this.rootMenu.startUp();

            //将指向父元素的引用置为undefined
            //这一步已经被取消
            //因为在menu的startUp方法中将会初始化每个子节点的父元素，因此没有必要在此处重置parent属性
            //this.parent=undefined;

            return this;
        },
        appendTo: function (item) {
            if (item === undefined || item.parent === undefined) {
                return this;
            }

            if (this.parent === item) {
                return this;
            }

            //从原树结构中移除本节点
            this.remove();

            //如果目标是一个popupItem/menu
            //则向其添加本节点
            if (item.append) {
                item.append(this);
            }
            //如果目标是一个simpleItem
            //则将其转化为popupItem
            //然后构建以它为根节点的新子树
            else {
                //将item转化为一个空的popupItem
                item.itemClass = 'popup';
                item.subMenu = [];
                item.subMenuClass = '';
                item.append = function (i) {
                    if (i && i.itemClass && (i.itemClass === 'popup' || i.itemClass === 'simple')) {
                        this.subMenu.push(i);
                        i.parent = this;
                    }

                    //刷新菜单
                    this.rootMenu && this.rootMenu.startUp && this.rootMenu.startUp();
                    //支持级联调用
                    return this;
                };

                //插入节点
                item.append(this);
            }

            //刷新菜单
            this.rootMenu && this.rootMenu.startUp && this.rootMenu.startUp();

            return this;
        },
        insertAt: function (itemIndex) {
            this.remove();

            if (this.parent.subMenu) {
                this.parent.subMenu.splice(itemIndex, 0, this);
            }
            else {
                this.parent.menuSrc.splice(itemIndex, 0, this);
            }

            //刷新菜单
            this.rootMenu && this.rootMenu.startUp && this.rootMenu.startUp();

            return this;
        }
    };
};

/*
 * 拥有子菜单项的MenuItem，继承自SimpleMenuItem，扩展了一个append方法
 * 用来为其附加一个或多个SimpleMenuItem或者PopupItem
 * */
XUtil.PopupMenuItem = function (option) {
    //继承SimpleMenuItem
    var that = XUtil.MenuItem(option);
    //为PopupItem定制属性
    that.id = option.id || 'XMenu-PopupItem-' + XUtil.helpers.guid();
    that.itemClass = 'popup';
    //保存子菜单项的数组
    //子菜单项可以是SimpleItem,也可以是PopupItem
    that.subMenu = [];
    that.subMenuClass = option.subMenuClass || '';
    that.append = function (item) {
        if (item && item.itemClass && (item.itemClass === 'popup' || item.itemClass === 'simple')) {
            that.subMenu.push(item);
            item.parent = that;
        }

        //刷新菜单
        that.rootMenu && that.rootMenu.startUp && that.rootMenu.startUp();

        //支持级联调用
        return that;
    };
    //打开/关闭子菜单，这两个方法将在menu初始化的时候定义
    that.open = function () {
    };
    that.close = function () {
    };
    return that;
};

//基于Menu组件的悬浮菜单组件
//可以将它绑定在一个/多个dom元素上，在鼠标右键点击的位置打开
//offset: x,y偏移，用来调整打开菜单的位置
//animation: 动画效果
XUtil.XSuspendedMenu = function (option) {
    var error = XUtil.helpers.error;
    var log = XUtil.helpers.log;

    var id = 'XSuspendedMenuContainer-' + XUtil.helpers.guid();

    var bindTo = option.bindTo || 'mouse',
        offset = option.offset || {top: 0, left: 0},
        animation = option.animation || 'default',
        menuAnimated;

    if ('menuAnimated' in option && option.menuAnimated === true) {
        menuAnimated = true;
    }
    else {
        menuAnimated = false;
    }

    var container = $("<div class='XSuspendedMenuContainer'></div>");

    var that = {};

    container.css('position', 'absolute')
        .attr('id', id)
        .attr('opened', 'false')
        .appendTo(document.body)
        .hide();

    option.renderTo = id;
    option.animated = menuAnimated;
    option.type = 'horizontal';
    //内部包装的菜单组件
    that.menu = XUtil.XMenu(option);
    that.menu.startUp();
    //包装菜单的dom
    that.container = container;
    //绑定的目标dom，一个jQuery对象
    that.bindToDom = undefined;
    //保存菜单是否打开的属性
    that.isOpened = false;
    //指向当前展开的菜单所绑定的目标dom的引用
    that.target = undefined;

    if ($(bindTo)[0]) {
        that.bindToDom = $(bindTo);
    }
    else {
        throw error('XSuspendedMenu: 目标dom不存在，请检查option.bindTo属性.');
    }

    that.show = function (posX, posY) {
        var rightLimit, bottomLimit;
        var xDirection, yDirection, direction;

        rightLimit = $(document).outerWidth() - that.menu.maxLevel * container.outerWidth();
        bottomLimit = $(document).outerHeight() - that.menu.maxLevel * container.outerHeight();

        if (posX < rightLimit) {
            container.css('left', posX + 3 + offset.left);
            xDirection = 'Right';
        }
        else {
            container.css('left', posX - container.outerWidth() - 3 + offset.left);
            xDirection = 'Left';
        }

        if (posY < bottomLimit) {
            container.css('top', posY + 3 + offset.top);
            yDirection = 'bottom';
        }
        else {
            container.css('top', posY - container.outerHeight() - 3 + offset.top);
            yDirection = 'top';
        }

        direction = yDirection + xDirection;
        that.menu.openDirection = direction;
        that.menu.startUp();

        if (animation === 'default') {
            container.show();
        }
        else if (animation === 'slide') {
            container.slideDown(150);
        }
        else if (animation === 'fade') {
            container.fadeIn(150);
        }
        container.attr('opened', 'true');
        that.isOpened = true;
    };

    that.startUp = that.menu.startUp;

    that.hide = function () {
        if (animation === 'default') {
            container.hide();
        }
        else if (animation === 'slide') {
            container.slideUp(150);
        }
        else if (animation === 'fade') {
            container.fadeOut(150);
        }
        container.attr('opened', 'false');
        that.target = undefined;
        that.isOpened = false;
    };

    //在绑定dom中单击鼠标右键时打开菜单
    $(that.bindToDom).bind("contextmenu", function (event) {
        var posX = event.pageX;
        var posY = event.pageY;

        event.preventDefault();
        event.stopPropagation();

        if (that.isOpened) {
            that.hide();
            //target为触发事件的dom
            that.target = event.currentTarget;

            setTimeout(function () {
                that.show(posX, posY);
            }, 150);

        }
        else {
            that.show(posX, posY);
        }
    });

    //关闭菜单
    $(document.body).bind('click', function (event) {
        var target = event.target;
        //如果没有在container中点击左键，关闭菜单
        if (event.button === 0 && !container.find(target)[0] && container.attr('opened') === 'true') {
            that.hide();
        }
    });


    return that;
};

/*
 * 源文件：src/popout.js
 * 一个辅助输入控件容器，通常绑定在一个textbox上，在单击或者focus这个textbox时展开并提供辅助输入选项
 * 这个类只生成一个空白的容器，所需的辅助输入dom需要自行添加
 * 以后可能在这个类的基础上做出新的辅助输入UI控件
 * 接收以下参数
 * renderTo:绑定的目标dom，必需
 * popoutId:控件的id，可选
 * width:控件的宽度，可选，默认为400
 * height:控件的高度，可选，默认为auto
 * animation:展开时的动画效果，可选，有三个可选配置项：default为默认情况，没有动画；fade为淡入/淡出效果，slide为向下展开/向上收起效果
 * position:控件的位置，可选，有四个可选配置项：lowerLeft(左下),lowerRight(右下),upperLeft(左上),upperRight(右上)，默认为左下
 * autoOpen:设置控件是否自动展开，可选，默认为false,
 * onOpen,onClose:控件打开/关闭事件，可选，默认为空函数，接收一个免费参数popout，为控件的dom对象
 */
XUtil.XPopout = function (option) {
    var error = XUtil.helpers.error;

    //用来返回的实例对象
    var that = {};

    //初始化私有成员
    //	目标dom的id
    var renderTo = option.renderTo,
    //	附给popout的id
        id = option.id || 'XPopout-' + XUtil.helpers.guid(),
    //	popout的宽度
        width = option.width || 400,
    //	popout的高度
        height = option.height || 'auto',
    //	打开popout时的动画，默认为无动画
        animation = option.animation || "default",
    //	popout出现的位置
        position = option.position || "lowerLeft",
    //	目标dom
        targetDiv = document.getElementById(renderTo),
    //	设置是否自动打开popout
        autoOpen = false,
        style = option.style || {};

    var onOpen = option.onOpen || function (xPopout) {
    };
    var onClose = option.onClose || function (xPopout) {
    };
    //popout窗体
    var popout = $("<div class='xPopout' id='" + id + "'></div>");

    if (option.autoOpen !== undefined && option.autoOpen === true) {
        autoOpen = true;
    }
    //遇到非法配置参数时抛出异常
    if (targetDiv === undefined) {
        throw error("XPopout: 配置参数有误，请检查option.renderTo属性");
    }

    if (animation === 'slide' && (position === 'upperLeft' || position === 'upperRight')) {
        animation = 'default';
    }

    //生成弹出框
    popout.appendTo(document.body);
    popout
        .css("position", "absolute")
        .css("border", "1px solid #aaaaaa")
        .css("border-radius", "4px")
        .css("overflow", "auto")
        .css("height", height || "auto")
        .css("width", width || 'auto')
        .css('display', "none")
        .css('background-color', '#fff')
        .css('padding', '10px');

    Object.keys(style).forEach(function (key) {
        if (key !== 'width' &&
            key !== 'height' &&
            key !== 'display' &&
            key !== 'position' &&
            key !== 'opacity') {
            popout.css(key, style[key]);
        }
    });

    //初始化实例成员
    //绑定dom的引用
    that.bindDom = targetDiv;
    //弹出框dom的引用
    that.popout = popout[0];

    //初始化实例方法
    //设置popout的position
    that.setPosition = function (position) {
        //目标dom的坐标，宽度，高度
        var offset = $(targetDiv).offset();
        var targetDivWidth = targetDiv.offsetWidth;
        var targetDivHeight = targetDiv.offsetHeight;

        //四种位置的坐标
        var llPosition = {
            top: offset.top + targetDivHeight,
            left: offset.left
        };

        var lrPosition = {
            top: offset.top + targetDivHeight,
            left: offset.left + targetDivWidth - popout.outerWidth()
        };

        var ulPosition = {
            top: offset.top - popout.outerHeight(),
            left: offset.left
        };

        var urPosition = {
            top: offset.top - popout.outerHeight(),
            left: offset.left + targetDivWidth - popout.outerWidth()
        };

        //私有方法，根据坐标对象设置popout的位置
        var setPos = function (posObj) {
            popout.css('top', posObj.top);
            popout.css('left', posObj.left);
        };

        if (position === "lowerLeft") {
            setPos(llPosition);
            that.position = position;
        }
        else if (position === "lowerRight") {
            setPos(lrPosition);
            that.position = position;
        }
        else if (position === "upperLeft") {
            setPos(ulPosition);
            that.position = position;
        }
        else if (position === "upperRight") {
            setPos(urPosition);
            that.position = position;
        }
        else {
            setPos(llPosition);
            that.position = "lowerLeft";
        }
    };

    //公有方法，打开popout
    that.open = function () {
        if (that.status = "closed") {
            onOpen(popout[0]);

            that.setPosition(position);

            if (animation === "fade") {
                popout.fadeIn('fast');
            }
            else if (animation === 'slide' && (position === 'lowerLeft' || position === 'lowerRight')) {
                popout.slideDown('fast');
            }
            else {
                popout.show();
            }

            that.status = "opened";
        }
    };

    //公有方法，关闭popout
    that.close = function () {
        if (that.status === "opened") {
            onClose(popout[0]);
            if (animation === "fade") {
                popout.fadeOut('fast');
            }
            else if (animation === 'slide' && (position === 'lowerLeft' || position === 'lowerRight')) {
                popout.slideUp('fast');
            }
            else {
                popout.hide();
            }

            that.status = "closed";
        }
    };

    that.setPosition(position);

    //根据用户配置确定是否自动打开
    if (autoOpen === false) {
        that.status = "closed";
    }
    else {
        that.status = "opened";
        that.open();
    }

    //初始化响应事件
    //点击目标dom时展开控件
    $(targetDiv).click(function () {
        that.open();
    });

    //鼠标在非控件范围内点击时关闭
    $(document).click(function (e) {
        var target;
        if (that.status === "opened") {
            e.stopPropagation();
            target = e.target;

            if (popout.children().length !== 0 &&
                target !== popout[0] &&
                target !== targetDiv &&
                popout.find(target)[0] === undefined) {

                that.close();
            }
            else if (popout.children().length === 0 &&
                target !== targetDiv &&
                target !== popout[0]) {

                that.close();
            }
        }
    });

    return that;
};

/*
 * 源文件：src/table.js
 * 表格widget，将一个JSON数组以表的形式展示，支持对表格数据进行增删改操作，以及分页，排序，选择，编辑，关键字过滤等多种功能
 *
 * 接收一个参数对象option，包含以下内容：
 *
 * renderTo: 目标div的id，必需
 *
 * id:widget的id，如果不设置，则会调用guid函数生成一个随机id
 *
 * src:源JSON数组，必需
 *
 * fontSize:字体大小，默认12px，非必需
 *
 * colEditable:是否设置列的可见性，默认true
 *
 * hasFilter:表是否可过滤，默认true，可以对每一列分别定制过滤功能，详见column的设置
 *
 * editable:表是否可编辑，默认不可编辑
 * showEditCol:是否显示包含编辑按钮的列，默认为隐藏
 * beforeEdit:编辑操作保存之前调用
 * editCallback:编辑操作后的回调函数，在表被设置为可编辑的情况下配置，默认为一空函数，
 * 拥有免费参数editedObj，为被编辑的行的原始数据obj，以及row，为当前被编辑的列
 *
 * selectable:表的行是否可选，默认可选
 * beforeSelect,beforeDeselect:select和deselect前调用
 * selectCb,deselectCb:select和deselect过后的callback
 *
 * deletable: 行是否可删除，默认不可删除
 * beforeDelete:delete操作前调用
 * deleteCb: 删除操作后的回调函数，接收两个参数: data为删除的行对应的源数据对象，orgSrc为整个表对应的数据对象
 *
 * columns:定制列属性的数组，可对表格中的每一列进行定制，每个数组成员对象包含以下属性：
 *      name: 列名，必需
 *      width: 列宽度（单位为px或者百分数，非必需），
 *      data: 列展示的数据（即该列对应源JSON的属性，必需），
 *      hasFilter: 本列是否包含过滤器（可省略，默认包含），
 *      sortable: 本列是否可排序（可省略，默认可排序。注意：对于中文字符串的排序使用了String.prototype.localeCompare函数,
 *      对于不同的浏览器，其实现方式并不一致.例如chrome会进行按拼音的排序,而FF则会根据笔画数进行排序），
 *      visible: 本列是否可见（可省略，默认可见）
 *      editable:本列是否可编辑（可省略，在option.editable=true的情况下，默认为可编辑）
 *
 * filterType: 过滤器类别，值可为1或者2（可省略，默认为1，拆字匹配，如输入"北大"即可匹配到"北京大学";
 * 若置为2则进行连续字符串的匹配，例如"北京"能匹配到"北京大学"，而"北大"则不能）
 *
 * pageSizes:一个包含每页显示条目数的数组，例如[5,10,50,100]（代表四个可选项，每页显示5，10，50，100条数据），非必需
 *
 * linkCols:可以将某列的数据变成超链接/button，可以通过renderer定制超链接的href，或者通过onclick属性定制点击事件，非必需
 */
XUtil.XTable = function (option) {
    //控制台和异常函数的引用
    var log = XUtil.helpers.log;
    var error = XUtil.helpers.error;

    //用来返回的对象，类的公有成员集合
    var that = {};

    //开始初始化类的私有成员
    //id
    var id = option.id || 'XTable-' + XUtil.helpers.guid();

    if (!option.src) {
        throw error('XTable: 配置参数有误，请检查src属性是否为合法的JSON数据');
    }
    //开始初始化配置属性
    var root = XUtil.config.rootPath;
    if (!root || root === "") {
        throw error("XTable: 配置参数有误，请检查myUtil.config对象");
    }

    //配置是否可以显示/隐藏列
    var colEditable = true;
    if ('colEditable' in option && option.colEditable === false) {
        colEditable = false;
    }

    //配置表是否可过滤
    var hasFilter = true;
    if ('hasFilter' in option && option.hasFilter === false) {
        hasFilter = false;
    }

    //过滤器类型
    var filterType = option.filterType || 1;

    var targetDiv = document.getElementById(option.renderTo);
    if (!targetDiv) {
        throw error('XTable: 配置参数有误，请检查option.renderTo属性');
    }

    //根据配置，设置表字体大小
    var fontSize = option.fontSize || "14px";
    $(targetDiv).empty().css('font-size', fontSize);

    //初始化每个列的配置
    //	列名
    var columns = [],
    //	源数据到列的映射关系
        dataMap = [],
    //	保存列宽度配置的数组
        columnWidth = [],
    //	保存列可见性配置的数组
        visibleCols = [],
    //	保存列是否可过滤配置的数组
        hasFilters = [],
    //	保存列是否可排序配置的数组
        sortable = [];

    //根据option的配置初始化以上几个数组
    option.columns.forEach(function (col) {
        columns.push(col.name);
        if (hasFilter === true) {
            if (!("hasFilter" in col) || col.hasFilter === true) {
                hasFilters.push(true);
            }
            else if ("hasFilter" in col && col.hasFilter === false) {
                hasFilters.push(false);
            }
        }
        else {
            hasFilters.push(false);
        }
        if (!("sortable" in col) || col.sortable === true) {
            sortable.push(true);
        }
        else if ("sortable" in col && col.sortable === false) {
            sortable.push(false);
        }
        if ((!"data" in col)) {
            throw error("XTable.js: 配置参数有误，请检查option.column的data属性。");
        }
        dataMap.push(col.data);
        columnWidth.push(col.width);
        if (!("visible" in col) || col.visible === true) {
            visibleCols.push(col.data);
        }
    });

    //配置选择功能
    //	selectable参数，默认为true
    var selectable = true,
    //	用来保存选中的列的index的数组
        selectedIndexes = [],
        beforeSelect = option.beforeSelect || function (selectedData, row) {
        },
        selectCb = option.selectCb || function (selectedData, row) {
        },
        beforeDeselect = option.beforeDeselect || function (selectedData, row) {
        },
        deselectCb = option.deselectCb || function (selectedData, row) {
        };

    if ("selectable" in option && option.selectable === false) {
        selectable = false;
    }

    //配置删除功能
    var deletable,
        beforeDelete = option.beforeDelete || function (selectedData, orgSrc) {
            return true;
        },
        deleteCb = option.deleteCb || function (selectedData, orgSrc) {
        };

    if ("deletable" in option && option.deletable === true) {
        deletable = true;
    }
    else {
        deletable = false;
    }

    //配置编辑功能
    //	editable参数，默认为false
    var editable = option.editable || false;
    //	是否显示编辑/保存按钮
    var showEditCol = option.showEditCol || false;
    //	保存编辑过的行的数组
    var editedIndexArr = [],
    //	当前打开编辑功能的列数量
        editingRowCount = 0,
    //	editCallback函数,在edit操作过后执行
        editCb = editable && option.editCb || function (eObj, row) {
        },
        beforeEdit = editable && option.beforeEdit || function (eObj, row) {
        };
        
    var controllerPosition='top';
    if('controllerPosition' in option && option.controllerPosition==='bottom'){
    	controllerPosition='bottom';
    }

    //	可选的pagesize
    var pageSizes = option.pageSizes || [10, 20, 50, 100, 200],
    //	默认的初始pageSize
        pageSize = parseInt(pageSizes[0]);

    //超链接列
    var linkCols = option.linkCols;
    //保存分页后的源数据的数组
    var pages = [];

    //开始生成基本控制界面
    var table = $("<div class='xTable-table'></div>"),
        controller = $("<div class='xTable-controller'></div>"),
        pageController = $("<div class='xTable-pageController'></div>"),
        pageSizeController = $("<div class='xTable-pageSizeController'></div>"),
        prevButton = $("<li class='functionButton prevButton ui-state-default ui-corner-all'>" +
            "<span class='ui-icon ui-icon-seek-prev'></span>" +
            "</li>"),
        nextButton = $("<li class='functionButton nextButton ui-state-default ui-corner-all'>" +
            "<span class='ui-icon ui-icon-seek-next'></span>" +
            "</li>"),
        firstButton = $("<li class='functionButton firstButton ui-state-default ui-corner-all'>" +
            "<span class='ui-icon ui-icon-seek-first'></span>" +
            "</li>"),
        lastButton = $("<li class='functionButton lastButton ui-state-default ui-corner-all'>" +
            "<span class='ui-icon ui-icon-seek-end'></span>" +
            "</li>"),
        gotoBox = $("<input type='text' class='xTable-gotoBox' value='1'/>"),
        maxPageSpan = $("<span class='xTable-maxPage'></span>"),
        view = $("<table class='xTable-view' border='1' width='100%'></table>"),
        pageSizeSelector = $("<select class='xTable-pageSizeSelector'></select>");

    pageSizes.forEach(function (size) {
        pageSizeSelector.append("<option value='" + size + "'>" + size + "</option>");
    });

    pageController
        .append(firstButton)
        .append(prevButton)
        .append(gotoBox)
        .append(maxPageSpan)
        .append(nextButton)
        .append(lastButton);

    controller
        .append(pageController)
        .append(pageSizeController);
    
    if(controllerPosition==='top'){
	    table
	        .append(controller)
	        .append(view);
    }
    else{
    	table
        	.append(view)
        	.append(controller);
    }

    $(targetDiv)
        .append(table);

    //全选checkbox
    var selectAll = $("<input class='xTable-selectAll' type='checkbox'/>"),
        selectAllTd = $("<td class='xTable-selectAllTd' class='xTable-selectAllTd'></td>");

    selectAllTd.append(selectAll);
    view.empty();

    //初始化表头
    //存储表头的数组
    var headers = [];
    var tableHeader = $("<tr class='xTable-Header'></tr>");

    //如果option.selectable为true，则插入全选checkbox
    if (selectable) {
        tableHeader.append(selectAllTd);
    }

    columns.forEach(function (colName, i) {
        var nameTd = $("<td class='colName' colName='" + colName + "'>" +
            "<div class='colNameText'>" + colName + "</div>" +
            "</td>");
        tableHeader.append(nameTd);
        headers.push(nameTd);
        //配置列的可过滤属性
        if (hasFilters[i]) {
            $("<li class='openFilterLi ui-state-default ui-corner-all' title='.ui-icon-search'>" +
                "<span class='ui-icon ui-icon-search'></span>" +
                "</li>").appendTo(nameTd);
        }
        //配置列的可排序属性
        if (sortable[i]) {
            var orderTag = $("<div class='orderTag'></div>");
            nameTd.attr("sortable", "true").append(orderTag);
        }
        else {
            nameTd.attr("sortable", "false");
        }
    });
    //如果表格可编辑，增加一包含编辑按钮的列
    if (editable) {
        var editHeader = $("<td class='editHeader' colName='edit'>编辑</td>");
        tableHeader.append(editHeader);
        if (!showEditCol) {
            editHeader.hide();
        }
    }

    //设置列的宽度
    columnWidth.forEach(function (width, i) {
        if (headers[i]) {
            headers[i].css("width", width);
        }
    });

    //给表头中的每个cell绑定一个srcName属性，这个属性指向与该列关联的源数据对象的属性名
    dataMap.forEach(function (name, i) {
        if (headers[i]) {
            headers[i].attr("srcName", name);
        }
    });
    view.append(tableHeader);

    //为打开过滤器按钮载入jquery-ui风格
    $(targetDiv).find('li').hover(function () {
        $(this).addClass("ui-state-hover");
        $(this).css("cursor", "pointer");
    }, function () {
        $(this).removeClass("ui-state-hover");
        $(this).css("cursor", "default");
    });

    //设置显示的列面板
    $('#' + id + '-setVCols', table).remove();
    var vcolsDialog = $("<div id='" + id + "-setVCols'></div>");

    vcolsDialog.dialog({
        autoOpen: false,
        width: 400,
        resizable: false,
        title: "设置显示的列",
        buttons: [
            {
                text: "确定",
                id: id + "-submitVCols",
                click: function () {

                }
            },
            {
                text: "取消",
                id: id + "-closeSetVCols",
                click: function () {
                    $(this).dialog("close");
                }
            }
        ],
        position: {
            my: "top+10%",
            at: "top+10%",
            of: window
        },
        open: function () {
            XUtil.helpers.addShield(document.body);
        },
        close: function () {
            XUtil.helpers.removeShield();
        }
    });

    $(table).append(vcolsDialog.parent());

    //设置可见列按钮
    var openSetV = $("<input type='button' value='设置' class='openSetV'/>");
    if (colEditable) {
        openSetV.insertAfter(lastButton);
        openSetV.button();
    }

    var showAllCol = $("<input type='checkbox' class='showAllCol' checked='true'/>");
    var showAllColSpan = $("<div class='subVCol showAllColSpan'></div>");
    showAllColSpan
        .append(showAllCol)
        .append('全部')
        .appendTo(vcolsDialog);

    option.columns.forEach(function (col) {
        var subVCol = $("<div class='subVCol'></div>"),
            colCb = $("<input type='checkbox' class='vColCb' srcName='" + col.data + "' colName='" + col.name + "'/>");

        subVCol.append(colCb).append(col.name);
        if (!("visible" in col) || col.visible === true) {
            colCb.prop("checked", true);
        }
        else {
            colCb.prop("checked", false);
            showAllCol.prop('checked', false);
        }

        vcolsDialog.append(subVCol);
    });

    //全选当前页按钮
    var selectCurrentPage = $("<input type='button' value='全选当前页' class='funcButton'/>");
    if (selectable) {
        selectCurrentPage.appendTo(pageController);
        selectCurrentPage.button();
    }

    //删除选中行按钮
    var deleteBtn;
    if (deletable) {
        deleteBtn = $("<input type='button' value='剔除选中条目' class='funcButton deleteBtn'/>").button({disabled: true});
        deleteBtn.appendTo(pageController);
    }

    //生成基本控制界面结束

    //工具函数，将第x列设为超链接，url由用户自己定义的renderer函数提供
    var setLink = function (columnIndex, urlRenderer, target, onclick, type) {
        var columnIndex = parseInt(columnIndex);
        var trArray, targetTdArray;

        if (!isNaN(columnIndex) && columnIndex >= 0 && columnIndex < columns.length) {
            trArray = $(".dataTr", table).toArray();
            targetTdArray = [];
            trArray.forEach(function (tr) {
                if ($(tr).find(".dataCell")[columnIndex]) {
                    targetTdArray.push($(tr).find(".dataCell")[columnIndex]);
                }
            });
            targetTdArray.forEach(function (td, i) {

                var trIndex = parseInt($(trArray[i]).attr("srcindex")),
                    trData = that.orgSrc[trIndex],
                    aTitle = $(td).text(),
                    generatedA = $("<a href=''>" + aTitle + "</a>");

                if (type === 'button') {
                    generatedA = $("<input type='button' value='" + aTitle + "'>").button();
                }

                if (urlRenderer && type !== 'button') {
                    generatedA.attr('href', urlRenderer(trIndex, trData, generatedA));
                }
                else if (type !== 'button') {
                    generatedA.attr('href', 'javascript: void (0)');
                }

                if (!target || type !== 'button') {
                    generatedA.attr('target', '_blank');
                }
                else {
                    generatedA.attr('target', target);
                }
                //修复ff下一个bug
                //如果不设置target为_self,在ff中点击href为javascript:void 0的超链接，会打开一个新的空标签页
                if (!urlRenderer) {
                    generatedA.attr('target', '_self');
                }

                if (onclick) {
                    generatedA.click(function () {
                        var a = this;
                        onclick(trData, a);
                    });
                }
                $(td).attr('editInvalid', 'true');
                $(td).empty().append(generatedA);

            });
        }
    };

    //初始化实例成员
    //原始json
    that.orgSrc = option.src;
    //widget的id
    that.id = id;
    //保存所有表头
    that.headers = headers;
    //保存分页后的JSON
    that.pages = pages;
    //这个属性保存了所有的列对应的原JSON对象中的属性
    that.attrs = dataMap;
    //与当前表格对应的JSON数组
    that.src = that.orgSrc.concat([]);
    //将部分重要dom设为实例属性
    that.option = option;
    that.firstButton = firstButton;
    that.prevButton = prevButton;
    that.gotoBox = gotoBox;
    that.nextButton = nextButton;
    that.lastButton = lastButton;
    that.pageSizeSelector = pageSizeSelector;
    that.pageController = pageController;
    that.view = view;

    //给每个数据对象增加两个属性
    that.src.forEach(function (sub, i) {
        //selected属性用来保存该对象是否被选中
        sub.selected = false;
        //orgIndex保存了该对象原始的index
        sub.orgIndex = i;
    });

    //实例方法
    //初始化函数，将JSON分页后加载第一页
    that.init = function () {
        var src = that.src;
        var maxPage = Math.ceil(src.length / pageSize);
        var i, j, subPage;

        pages = [];
        selectedIndexes = [];

        pageSizeController.empty().append("共" + src.length + "条结果，每页显示")
            .append(pageSizeSelector).append("条");
        maxPageSpan.html(' / ' + maxPage);
        $('.xTable-selectAll', table).prop('checked', false);

        //分页
        for (i = 0; i < src.length; i++) {
            src[i].selected = false;
            if ((i + 1) % pageSize === 0) {
                subPage = [];
                for (j = pageSize; j > 0; j--) {
                    src[i - j + 1].srcIndex = i - j + 1;
                    subPage.push(src[i - j + 1]);
                }
                pages.push(subPage);
            } else if (i === src.length - 1) {
                subPage = [];
                for (j = pageSize * (maxPage - 1); j < src.length; j++) {
                    src[j].srcIndex = j;
                    subPage.push(src[j]);
                }
                pages.push(subPage);
            }
        }

        //载入第一页
        that.loadPage(1);
    };

    // 加载第X页
    that.loadPage = function (pageNum) {
        var page;
        var editTd;
        var dcArr, cnArr;

        if (editingRowCount !== 0) {
            alert('请先保存当前正在编辑的行！');
            return;
        }
        if (pages.length === 0) {
            $(".dataTr", table).remove();
            return;
        }
        if (pageNum > 0 && pageNum <= pages.length) {
            $(".dataTr", table).remove();

            gotoBox.val(pageNum);
            pageNum = parseInt(pageNum);
            page = pages[pageNum - 1];
            page.forEach(function (rowObj, i) {
                var dataTr = $("<tr class='dataTr'></tr>");
                var selectRow = $("<input type='checkbox' class='selectRow'/>");
                var selectRowTd = $("<td class='rowCb'></td>");

                dataTr.attr("index", pageSize * (pageNum - 1) + i);
                if (selectable && rowObj.selected) {
                    selectRow.prop("checked", true);
                    dataTr.addClass('rowSelect');
                }
                dataTr.attr("srcIndex", rowObj.orgIndex).data("srcObj", rowObj);

                selectRowTd.append(selectRow);
                if (selectable) {
                    dataTr.append(selectRowTd);
                }
                dataTr.appendTo(view);
                dataMap.forEach(function (attrName, i) {
                    var dataTd = $("<td class='dataCell' srcName='" + attrName + "'></td>");

                    if (!(attrName in rowObj)) {
                        throw error("XTable.js: 源JSON数据与data属性关联失败，请检查参数对象：column的data属性输入是否正确。");
                    }

                    dataTd.append(rowObj[attrName]);
                    dataTd.appendTo(dataTr);

                    if (editable) {
                        if ("editable" in option.columns[i] && option.columns[i].editable === false) {
                            dataTd.attr('editInvalid', 'true');
                        }
                    }
                });
                if (editable) {
                    editTd = $("<td class='editTd'>" +
                        "<input type='button' class='editBtn' value='编辑'/>" +
                        "</td>");
                    editTd.find('input').button();
                    dataTr.append(editTd);
                    if (!showEditCol) {
                        editTd.hide();
                    }
                }
            });

            if (linkCols && linkCols.length > 0) {
                linkCols.forEach(function (col) {
                    setLink(col.colIndex, col.renderer, col.target, col.onclick, col.type);
                });
            }

            dcArr = $(".dataCell", table).toArray();
            cnArr = $(".colName", table).toArray();
            dcArr.forEach(function (dc) {
                var srcName = $(dc).attr("srcName");
                if (visibleCols.indexOf(srcName) === -1) {
                    $(dc).hide();
                }
            });
            cnArr.forEach(function (cn) {
                var srcName = $(cn).attr("srcName");
                if (visibleCols.indexOf(srcName) === -1) {
                    $(cn).hide();
                }
                else {
                    $(cn).show();
                }
            });
        }
    };

    //选择某行
    that.selectRow = function (row) {
        var index = parseInt($(row).attr("index"));

        beforeSelect(that.exportData(), row);

        $(row).attr("select", "selected");
        $(row).find('input[type=checkbox]').prop('checked', true);
        if (selectedIndexes.indexOf(index) === -1) {
            selectedIndexes.push(index);
            that.src[index].selected = true;
            $(row).addClass('rowSelect');
        }

        selectCb(that.exportData(), row);
        if (selectedIndexes.length > 0 && deletable && editingRowCount === 0) {
            deleteBtn.button({disabled: false});
        }

        log("XTable-Filter.selectRow: The rows been selected are ");
        log(that.exportData());
    };

    //反选某行
    that.unselectRow = function (row) {
        var index = $(row).attr("index");
        var i = selectedIndexes.indexOf(parseInt(index));

        beforeDeselect(that.exportData(), row);

        $(row)
            .removeClass('rowSelect')
            .removeClass('rowHover')
            .removeClass('rowSelect')
            .removeAttr("select");
        $(row).find('input[type=checkbox]').prop('checked', false);
        $(".xTable-selectAll", table).prop("checked", false);

        if (i !== -1) {
            selectedIndexes.splice(i, 1);
            that.src[index].selected = false;
        }

        deselectCb(that.exportData(), row);

        //当没有行被选中时，delete按钮将会被disabled
        if (that.exportData().length === 0 && deletable) {
            deleteBtn.button({disabled: true});
        }

        log("XTable-Filter.unselectRow: The rows been selected are ");
        log(that.exportData());
    };

    //全选
    that.selectAll = function () {
        var i;

        beforeSelect(that.exportData());

        $('.xTable-selectAll', table).prop('checked', true);
        $(".selectRow", table).prop("checked", true);
        selectedIndexes = [];
        $(".dataTr", table)
            .attr("select", "selected")
            .addClass('rowSelect');

        for (i = 0; i < that.src.length; i++) {
            selectedIndexes.push(i);
            that.src[i].selected = true;
        }

        if (selectedIndexes.length > 0 && deletable && editingRowCount === 0) {
            deleteBtn.button({disabled: false});
        }

        selectCb(that.exportData());
    };

    //全反选
    that.unselectAll = function () {
        var i;

        beforeDeselect(that.exportData());

        selectedIndexes = [];
        for (i = 0; i < that.src.length; i++) {
            that.src[i].selected = false;
        }

        $(".selectRow", table).prop("checked", false);
        $('.xTable-selectAll', table).prop('checked', false);

        $(".dataTr", table)
            .removeAttr("select")
            .removeClass('rowSelect')
            .removeClass('rowHover');

        //当没有行被选中时，delete按钮将会被disabled
        if (that.exportData().length === 0 && deletable) {
            deleteBtn.button({disabled: true});
        }

        deselectCb(that.exportData());
    };

    //设置每页显示条数
    that.setPageSize = function (pSize) {
        var options = pageSizeSelector[0].options;
        var targetIndex = -1;
        var i, option;

        if (editingRowCount !== 0) {
            alert('请先保存当前正在编辑的行！');
            return;
        }
        pageSize = parseInt(pSize);
        $(".orderTag", table).empty();

        for (i = 0; i < options.length; i++) {
            option = options[i];
            if (parseInt(option.value) === pageSize) {
                targetIndex = i;
                break;
            }
        }

        pageSizeSelector[0].selectedIndex = targetIndex;
        that.init();
    };

    //前往第一页
    that.toFirstPage = function () {
        that.loadPage(1);
    };

    //前往最后一页
    that.toLastPage = function () {
        that.loadPage(pages.length);
    };

    //上一页
    that.toPrevPage = function () {
        var currentPage = parseInt(gotoBox.val());
        if (currentPage > 1) {
            that.loadPage(currentPage - 1);
        }
    };
    //下一页
    that.toNextPage = function () {
        var currentPage = parseInt(gotoBox.val());
        if (currentPage < pages.length) {
            that.loadPage(currentPage + 1);
        }
    };

    //导出选中的数据
    that.exportData = function () {
        var selectedDataArray = [];
        selectedIndexes.forEach(function (index) {
            selectedDataArray.push(that.src[index]);
        });
        return selectedDataArray;
    };

    //设置可见的列
    that.setVisibleCols = function (vCols) {
        if (editingRowCount !== 0) {
            alert('请先保存当前正在编辑的行！');
            return;
        }
        visibleCols = vCols;
        that.init();
    };

    //在某一列开启编辑功能
    that.editRow = function (row) {
        var dCells = $(row).find('.dataCell').toArray();
        dCells.forEach(function (dCell) {
            var tempVal;
            if (!$(dCell).attr('editInvalid')) {
                tempVal = $(dCell).html();
                $(dCell)
                    .empty()
                    .append("<input class='editInput' type='text' value='" + tempVal + "'/>");
            }
        });
        $($(row).find(".editBtn")).val('保存');
        editingRowCount++;
        $('.xTable-pageSizeSelector', table).prop('disabled', true);
        $('input[type=button]:not(.editBtn)', table).button({disabled: true});
    };

    //保存经过编辑的列
    that.saveRow = function (row) {

        var dCells = $(row).find('.dataCell').toArray();
        var orgIndex = $(row).attr('srcindex'),
            index = $(row).attr('index');
        var editedObj = that.orgSrc[index],
            editedObjArr = [];

        beforeEdit(editedObj, row);

        dCells.forEach(function (dCell) {
            var tempVal = "";
            var srcName = $(dCell).attr('srcname');
            var editedObjArr;

            //判断这个单元格是否可以编辑
            if (!$(dCell).attr('editInvalid')) {
                tempVal = $($(dCell).find('.editInput')).val();
                //数字的情况要单独考虑
                if (typeof targetAttr === "number") {
                    if (isNaN(Number(tempVal))) {

                        that.src[index][srcName] = NaN;
                        that.orgSrc[orgIndex][srcName] = NaN;
                        $(dCell).html(NaN);
                    }
                    else {
                        that.src[index][srcName] = Number(tempVal);
                        that.orgSrc[orgIndex][srcName] = Number(tempVal);
                        $(dCell).html(tempVal);
                    }
                }
                //其他情况，包括字符串和null的情况
                else {
                    that.src[index][srcName] = tempVal;
                    that.orgSrc[orgIndex][srcName] = tempVal;
                    $(dCell).html(tempVal);
                }
            }
        });
        if (editedIndexArr.indexOf(orgIndex) === -1) {
            editedIndexArr.push(orgIndex);
        }

        editedObjArr = that.getEditedData();

        log("XTable-Filter.saveEdit: The rows been edited are ");
        log(editedObjArr);

        $($(row).find(".editBtn")).val('编辑');
        editingRowCount--;

        if (editingRowCount === 0) {
            $('.xTable-pageSizeSelector', table).prop('disabled', false);
            $('input[type=button]:not(.editBtn,.deleteBtn)', table).button({disabled: false});
            if (selectedIndexes.length !== 0) {
                deleteBtn.button({disabled: false});
            }
        }

        editCb(editedObj, row);

        //返回被编辑的对象
        return editedObj;

    };

    //将所有被编辑过的行整理为一个数组并导出
    that.getEditedData = function () {
        var editedObjArr = [];
        editedIndexArr.forEach(function (i) {
            that.orgSrc[i] && editedObjArr.push(that.orgSrc[i]);
        });

        return editedObjArr;
    };

    //排序，根据order进行正序和倒序排序
    //这个方法使用了WebWorker以提高用户体验
    //因此在IE10以下的浏览器将会出现异常
    that.sortBy = function (name, order) {
        var worker = new Worker(root + "/workers/XTableSort.js");

        if (editingRowCount !== 0) {
            alert('请先保存当前正在编辑的行！');
            return;
        }

        $(".dataTr", table).remove();
        $(".tempMessage", table).remove();
        $("<div class='tempMessage'>正在排序，请稍候...</div>").insertAfter(table.find(".xTable-view"));
        XUtil.helpers.addShield(table);

        worker.postMessage({
            src: that.src,
            name: name,
            order: order
        });

        worker.onmessage = function (e) {
            $(".tempMessage", table).remove();
            that.src = e.data;
            XUtil.helpers.removeShield();
            that.init();
            worker.terminate();
        };
    };

    //删除条目，使用了WebWorker
    that.deleteSelectedData = function () {
        var selectedData = that.exportData();
        var worker;

        if (editingRowCount !== 0) {
            alert('请先保存当前正在编辑的行！');
            return;
        }

        if (beforeDelete(selectedData, that.orgSrc)) {

            $(".dataTr", table).remove();
            $(".tempMessage", table).remove();
            $('.orderTag', table).empty();
            $("<div class='tempMessage'>正在删除，请稍候...</div>").insertAfter(table.find(".xTable-view"));
            XUtil.helpers.addShield();

            worker = new Worker(root + '/workers/XTableDelete.js');

            worker.postMessage({
                selectedData: selectedData,
                orgSrc: that.orgSrc
            });

            worker.onmessage = function (e) {
                XUtil.helpers.removeShield();

                that.orgSrc = e.data;
                that.src = that.orgSrc.concat([]);
                //给每个数据对象增加两个属性
                //由于源orgSrc数组发生了变化，这里必须重新初始化orgIndex和selected
                that.src.forEach(function (sub, i) {
                    //selected属性用来保存该对象是否被选中
                    sub.selected = false;
                    //orgIndex保存了该对象原始的index
                    sub.orgIndex = i;
                });

                $(table).find('.tempMessage').remove();
                $(controller).find('.cFilterData').remove();
                $(controller).find('.resetData').remove();
                $(deleteBtn).button({disabled: true});
                that.init();
                worker.terminate();

                deleteCb(selectedData, that.orgSrc);
            };
        }
    };
    /*
     * 为表格附加其他功能,将在表格上方翻页功能旁边附加一个功能按键，并且返回按键dom
     * fName:功能名，将作为button的value值
     * handler:点击功能按钮后执行的事件函数，接受两个参数：目前选中的数据的json以及源json数据
     * className:为按钮添加class,以空格分隔
     * style:为按钮附加样式
     */
    that.extendFunction = function (option) {
        var funcBtn = $("<input type='button' value='" + option.fName + "' class='funcButton'/>");
        funcBtn
            .appendTo(that.pageController)
            .button({disabled: option.disabled})
            .click(function () {
                $.proxy(option.handler, this)(that.exportData(), that.orgSrc);
            });
        option.className && funcBtn.addClass(option.className);
        option.style && (funcBtn[0].style = funcBtn[0].style + ';' + option.style);
        return funcBtn;
    };

    /*
     * 为表格添加一行，由于插入功能场景比较复杂，因此不提供默认的添加功能，用户需使用此函数自行定制
     * 可以在此接口上实现添加新表格数据的功能
     * 接收三个可选参数，分别是新行中每一列的默认值（如果没有则默认为一空行），插入前执行的操作，以及插入后的回调函数
     */
    that.addRow = function (dataObj, beforeAdd, callback) {
        var dataObj = dataObj || {};

        beforeAdd && beforeAdd(dataObj, that.orgSrc);

        dataMap.forEach(function (attr) {
            if (dataObj[attr] === undefined) {
                dataObj[attr] = '';
            }
        });
        dataObj.selected = false;
        dataObj.orgIndex = that.orgSrc.length;

        that.src.push(dataObj);
        that.orgSrc.push($.extend({}, dataObj, true));

        that.init();
        that.toLastPage();
        that.view
            .find('.dataTr')
            .last()
            .find('.editTd')
            .find('input')
            .click();
        that.view
            .find('.dataTr')
            .last()
            .find('input[type=text]')
            .first()
            .focus();
        callback && callback(dataObj, that.orgSrc);
    };

    /*
     * 列过滤器，继承自基本过滤器类
     * 重写了基本过滤器类中的loadFilter方法
     * 提取列中所有内容，生成一个关键字清单，根据用户输入的关键字进行过滤表格
     */
    that.filter = (function () {
        //继承了基本过滤器
        var filterThat = XUtil.XFilter({
            //src置为空，之后会根据列名设置src并加载
            src: [],
            id: that.id + '-filter',
            filterType: filterType
        });

        var filterId = filterThat.id;
        //过滤器容器div
        var filterDiv = filterThat.filterDiv;

        var filterDialog = filterDiv.parent();

        //过滤器标题
        var filterTitle = "";
        //与当前过滤器对应的源数据的某个属性
        var filterSrcName = "";
        //选中的关键字
        var selectedNames = filterThat.selectedNames;

        //自动调整dialog的宽度
        filterDialog
            .css('width', 'auto')
            .css('font-size', '16px');

        filterDiv.dialog({
            open: function () {
                XUtil.helpers.addShield(document.body);
            }
        });
        filterDialog.appendTo(table);

        //向过滤器中加载关键字，重载
        filterThat.loadFilterOverride = function (title, srcName) {
            //初始化src数组
            filterThat.src = [];
            filterSrcName = srcName;
            that.src.forEach(function (sub) {
                filterThat.src.push(sub[srcName]);
            });
            //根据传入的列名加载过滤器
            filterThat.loadFilter(title);
        };

        //反向过滤，对选中的关键字求反后过滤
        filterThat.cFilterdata = function () {
            var worker;

            if (editingRowCount !== 0) {
                alert('请先保存当前正在编辑的行！');
                return;
            }

            if (that.src.length !== that.orgSrc.length) {

                $('.orderTag', table).empty();
                $(".dataTr", table).remove();
                $(".tempMessage", table).remove();
                $("<div class='tempMessage'>正在载入，请稍候...</div>").insertAfter(that.view);

                XUtil.helpers.addShield(table);

                worker = new Worker(root + "/workers/XTableCFilter.js");

                worker.postMessage({
                    src: that.src,
                    orgSrc: that.orgSrc
                });

                worker.onmessage = function (e) {
                    XUtil.helpers.removeShield();
                    $(".tempMessage", table).remove();
                    that.src = e.data;
                    that.init();
                };
            }
        };

        //根据选中的关键字过滤表单
        filterThat.filterData = function () {
            var worker;

            selectedNames = filterThat.selectedNames;

            $(".dataTr", table).remove();
            $(".tempMessage", table).remove();
            $('.orderTag', table).empty();
            $("<div class='tempMessage'>正在载入，请稍候...</div>").insertAfter(that.view);

            filterDiv.dialog("close");
            XUtil.helpers.addShield(table);

            worker = new Worker(root + "/workers/XTableFilterData.js");

            worker.postMessage({
                src: that.src,
                selectedNames: selectedNames,
                filterSrcName: filterSrcName
            });

            worker.onmessage = function (e) {
                var resetData, cFilterData;
                XUtil.helpers.removeShield();
                $(".tempMessage", table).remove();
                $('#' + filterId + '-cFilterData', table).remove();
                //这里src的指向发生了变动，所以需要加一句that.src=src
                that.src = e.data;
                that.init();
                $('#' + filterId + "-resetData", table).remove();
                if (that.src.length !== that.orgSrc.length) {
                    resetData = $("<input type='button' class='resetData' id=\'" + filterId + "-resetData\' style=''value='重置过滤器'/>");
                    cFilterData = $("<input type='button' class='cFilterData' id=\'" + filterId + "-cFilterData\' value='反向过滤'/>");
                    resetData.insertAfter(pageSizeController);
                    resetData.button();
                    cFilterData.insertAfter(resetData);
                    cFilterData.button();
                }
                worker.terminate();
            };
        };

        //重置过滤器，显示表格中全部元素
        filterThat.resetData = function () {

            XUtil.helpers.addShield();

            that.src = that.orgSrc.concat([]);
            $('.orderTag', table).empty();
            $('#' + filterId + '-resetData', table).remove();
            $('#' + filterId + '-cFilterData', table).remove();
            $(".orderTag", table).empty();

            XUtil.helpers.removeShield();

            that.init();
        };

        //初始化各dom元素的响应事件
        $(".openFilterLi", table).click(function (e) {
            var isOpen = filterDiv.dialog('isOpen');
            var title, srcName;

            e.stopPropagation();

            if (editingRowCount !== 0) {
                alert('请先保存当前正在编辑的行！');
                return;
            }

            if (!isOpen) {
                title = $(this).prev().html();
                srcName = $(this.parentNode).attr("srcname");
                filterThat.loadFilterOverride(title, srcName);
            }
        });

        $(table).undelegate("#" + filterId + "-resetData", "click");
        $(table).delegate("#" + filterId + "-resetData", "click", function () {
            filterThat.resetData();
        });

        $(filterDialog).undelegate("#" + filterId + "-startFilter", "click");
        $(filterDialog).delegate("#" + filterId + "-startFilter", "click", function () {
            filterThat.filterData();
        });

        $(table).undelegate("#" + filterId + "-cFilterData", "click");
        $(table).delegate("#" + filterId + "-cFilterData", "click", function () {
            filterThat.cFilterdata();
        });

        $("#" + filterId + "-resetFilter", filterDialog).unbind().click(function () {
            $("#" + filterId + "-filterStr").val("请输入过滤关键字").select();
            filterThat.loadFilterOverride(filterTitle, filterSrcName);
        });

        return filterThat;
    })();

    //初始化各dom的响应事件
    //全选当前页按钮
    selectCurrentPage.click(function () {
        var rows = $('.dataTr', table).toArray();
        $('.selectRow', table).prop('checked', true);
        rows.forEach(function (row) {
            if (!$(row).attr('select')) {
                that.selectRow(row);
            }
        });
    });

    //前往第一页按钮
    firstButton.click(function () {
        that.toFirstPage();
    });

    //前一页按钮
    prevButton.click(function () {
        that.toPrevPage();
    });

    //前往某页输入框
    gotoBox.keydown(function (e) {
        var pageNum;
        if (e.keyCode === 13) {
            pageNum = parseInt(this.value);
            that.loadPage(pageNum);
        }
    });

    //下一页按钮
    nextButton.click(function () {
        that.toNextPage();
    });

    //最后一页按钮
    lastButton.click(function () {
        that.toLastPage();
    });

    //设置按钮
    openSetV.click(function () {
        vcolsDialog.dialog("open");
    });

    //删除列按钮
    deletable && deleteBtn.click(function () {
        that.deleteSelectedData();
    });

    //设置可见列对话框
    $("#" + that.id + "-submitVCols", vcolsDialog.parent()).click(function () {
        var vColCb = $('#' + that.id + "-setVCols .vColCb", vcolsDialog.parent()).toArray();
        var tempVisibleCols = [];

        vColCb.forEach(function (cb) {
            var checked = $(cb).is(":checked");
            if (checked) {
                tempVisibleCols.push($(cb).attr("srcName"));
            }
        });
        that.setVisibleCols(tempVisibleCols);
        $(vcolsDialog).dialog("close");
    });

    $('.showAllCol', vcolsDialog.parent()).change(function () {
        var vColCb = $('#' + that.id + "-setVCols .vColCb", vcolsDialog.parent());
        if ($(this).is(':checked')) {
            vColCb.prop('checked', true);
        }
        else {
            vColCb.prop('checked', false);
        }
    });

    $('#' + that.id + "-setVCols .vColCb", vcolsDialog.parent()).change(function () {
        if ($('.showAllCol', vcolsDialog.parent()).is(':checked')) {
            if (!$(this).is(':checked')) {
                $('.showAllCol', vcolsDialog.parent()).prop('checked', false);
            }
        }
    });

    //每页显示条数选择器
    $(table).undelegate(".xTable-pageSizeSelector", "change");
    $(table).delegate(".xTable-pageSizeSelector", "change", function () {
        var index = this.options.selectedIndex;
        that.setPageSize(this.options[index].value);
    });

    //选择checkbox
    $(table).undelegate(".selectRow", "change");
    $(table).delegate(".selectRow", "change", function () {
        var row = this.parentNode.parentNode;
        if ($(this).is(":checked")) {
            that.selectRow(row);
        } else {
            that.unselectRow(row);
        }
    });

    //全选checkbox
    $(table).undelegate(".xTable-selectAll", "change");
    $(table).delegate(".xTable-selectAll", "change", function () {
        if ($(this).is(":checked")) {
            that.selectAll();
        } else {
            that.unselectAll();
        }
    });

    //行的hover事件
    $(table).undelegate(".dataTr", "mouseover");
    $(table).delegate(".dataTr", "mouseover", function () {
        var selected = $(this).attr("select");
        if (!selected) {
            $(this).addClass('rowHover');
        }
    });

    $(table).undelegate(".dataTr", "mouseout");
    $(table).delegate(".dataTr", "mouseout", function () {
        var selected = $(this).attr("select");
        if (!selected) {
            $(this).removeClass('rowHover');
        }
    });

    //列排序
    $(table).undelegate(".colName", "click");
    $(table).delegate(".colName", "click", function () {
        var name = $(this).attr("srcname");
        var sortable = $(this).attr("sortable");
        if (sortable === "true") {
            if (editingRowCount !== 0) {
                alert('请先保存当前正在编辑的行！');
                return;
            }

            if (!$(this).attr("order") || $(this).attr("order") === "desc") {
                $(this).attr("order", "asc");
                $(table).find(".orderTag").empty();
                $(this).find(".orderTag").append("<img src='" + root + "/images/sort_asc.gif'/>");
                that.sortBy(name, "asc");
            } else {
                $(this).attr("order", "desc");
                $(table).find(".orderTag").empty();
                $(this).find(".orderTag").append("<img src='" + root + "/images/sort_desc.gif'>");
                that.sortBy(name, "desc");
            }
        }
    });

    //编辑按钮，开启该行编辑功能
    $(table).undelegate(".editBtn", 'click');
    $(table).delegate(".editBtn", 'click', function () {
        var row = this.parentNode.parentNode;
        var type = $(this).val();

        if (type === "编辑") {
            that.editRow(row);
        }
        else {
            that.saveRow(row);
        }
    });

    //单元格输入框focus事件，全选当前输入框内容
    $(table).undelegate(".editInput", 'focus');
    $(table).delegate(".editInput", 'focus', function () {
        var self = this;
        setTimeout(function () {
            self.select();
        }, 200);
    });

    //单元格双击，开启该行编辑功能
    $(table).undelegate(".dataCell", "dblclick");
    $(table).delegate(".dataCell", "dblclick", function () {
        var row, type;
        if (editable && !$(this).attr('editInvalid')) {
            row = this.parentNode;
            type = $($(row).find(".editBtn")).val();

            if (type === "编辑") {
                that.editRow(row);
            }
            $(this).find('input').focus();
        }
    });

    //单元格输入框回车事件，保存对当前行的修改
    $(table).undelegate(".editInput", "keydown");
    $(table).delegate(".editInput", "keydown", function (event) {
        var editBtn;
        if (event.keyCode === 13) {
            editBtn = $(this.parentNode.parentNode).find('.editBtn');
            if ($(editBtn).val() === '保存') {
                $(editBtn).click();
            }
        }
    });

    //初始化表格
    that.init();

    //返回表格实例that
    return that;
};

/*
 * 基本过滤器类
 * 接受以下参数
 * src:字符串数组，包含了应当加载的所有关键字，必须
 * id:过滤器dom的id，可选
 * startFilterText:确定按钮的文本，可选，
 * startFilterHandler:点击确定按钮时的响应
 * closeFilterText:取消按钮的文本
 * closeFilterHandler:点击取消按钮时的响应
 * filterType:设置过滤器关键字匹配模式，设置为1时为拆字匹配（例如输入北大即可匹配到北京大学），
 *            设置为2时为连字匹配（方法和String的search方法类似），可选，默认为2
 */
XUtil.XFilter = function (option) {
    //控制台函数的引用
    var log = XUtil.helpers.log;
    var error = XUtil.helpers.error;

    //用来返回的实例
    var that = {};

    //类的私有成员
    var id = option.id || 'XFilter-' + XUtil.helpers.guid(),
    //	确定和取消按钮的文本
        startFilterText = option.startFilterText || "确定",
        closeFilterText = option.closeFilterText || '取消',
    //	确定和取消按钮的响应函数
        startFilterHandler = option.startFilterHandler || function (selectedNames, filter) {
            filter.filterDiv.dialog('close');
        },
        closeFilterHandler = option.closeFilterHandler || function (selectedNames, filter) {
            filter.filterDiv.dialog('close');
        },
    //	过滤类型
        filterType = option.filterType || 2,
    //	过滤器的标题
        title = option.title || "",
    //	rootPath
        root = XUtil.config.rootPath;

    //开始生成对话框，使用jquery-ui.dialog
    var filterDiv = $("<div style='display:table' title='过滤器'></div>");
    $(filterDiv).attr("id", id);
    filterDiv.dialog({
        autoOpen: false,
        resizable: false,
        title: title,
        buttons: [
            {
                text: startFilterText,
                id: id + "-startFilter",
                click: function () {
                    startFilterHandler(that.selectedNames, that);
                }
            },
            {
                text: closeFilterText,
                id: id + "-closeFilter",
                click: function () {
                    closeFilterHandler(that.selectedNames, that);
                }
            }
        ],
        position: {
            my: "top+10%",
            at: "top+10%",
            of: window
        },
        //打开和关闭时清除关键字缓存
        close: function () {
            XUtil.helpers.removeShield();

            filterDiv.removeData('allNamesCatch');
            filterDiv.removeData('sNamesCatch');
        },
        open: function () {
            XUtil.helpers.addShield();

            filterDiv.removeData('allNamesCatch');
            filterDiv.removeData('sNamesCatch');
        }
    });

    var filterDialog = filterDiv.parent();

    //开始生成控制界面
    var filter = $("<div class='xFilter-searchDiv'>"
            + "<div><input type='text' value='请输入过滤关键字' class='xFilter-filterStr' id=\'" + id + "-filterStr\'/></div>"
            + "<div>" +
            "<input type='button' class='button blue sea_btn' value='搜索' id=\'" + id + "-filterSubmit\'/></div>"
            + "<div><input type='button' class='button blue sea_btn' value='重置' id=\'" + id + "-resetFilter\'/>" +
            "</div></div>"),
        completeMatch = $("<input type='radio' value='completeMatch' id='completeMatch' name='matchType'/>"),
        partialMatch = $("<input type='radio' value='partialMatch' id='partialMatch' checked='checked' name='matchType'/>"),
        matchType = "partial",
        matchRadios = $("<div class='matchRadios'></div>"),
        completeMatchSpan = $("<div></div>").append(completeMatch).append("<span class='xFilter-radioSpan'>完全匹配</span>"),
        partialMatchSpan = $("<div></div>").append(partialMatch).append("<span class='xFilter-radioSpan'>部分匹配</span>"),
        filterResult = $("<div class='xFilter-filterResult' id='xFilter-filterResult'></div>");

    matchRadios.append(partialMatchSpan).append(completeMatchSpan);
    filter.append(matchRadios);
    filterDiv.append(filter).append(filterResult);

    //检验参数合法性
    if (!root || root === "") {
        throw error("XFilter: 配置参数有误，请检查myUtil.config对象中的root属性");
    }
    if (!option.src) {
        throw error("XFilter: 配置参数有误，请检查option对象的src属性");
    }

    //开始初始化实例成员
    that.option = option;
    //源数据数组
    that.src = option.src;
    //所有关键字
    that.allNames = [];
    //选中的关键字
    that.selectedNames = [];
    //关键字过滤后剩余的所有关键字
    that.tempAllNames = [];
    //id
    that.id = option.id || 'XFilter-' + XUtil.helpers.guid();
    //过滤器类型
    that.filterType = filterType;
    //关键字匹配类型
    that.matchType = matchType;
    //将重要的dom加入实例
    that.filterDiv = filterDiv;
    that.filterResult = filterResult;
    that.startFilterBtn = $('#' + id + "-startFilter", filterDialog)[0];
    that.closeFilterBtn = $("#" + id + "-closeFilter", filterDialog)[0];
    that.completeMatch = completeMatch;
    that.partialMatch = partialMatch;

    //实例方法
    //生成关键字列表（关键字去重）并载入过滤器
    that.loadFilter = function (title) {
        //缓存
        var allNamesCatch = filterDiv.data('allNamesCatch');
        var sNamesCatch = filterDiv.data('sNamesCatch');
        var worker, option;
        var selectAll;

        if (title) {
            filterDiv.dialog({
                title: title
            });
        }

        filterDiv.dialog("open");
        filterDialog.css('width', 'auto');

        $("#" + id + "-filterStr", filterDialog).val("请输入过滤关键字").select();
        partialMatch.prop("checked", true);
        completeMatch.prop("checked", false);
        filterDiv.find(".XFilter-matchResult").remove();

        $(filterResult).empty().append("正在加载关键字，请稍候...");
        $("#" + id + "-startFilter").button({
            disabled: true
        });

        that.tempAllNames = [];
        //如果没有缓存，则调用WebWorker载入关键字列表
        if (!allNamesCatch || !sNamesCatch) {

            log("XFilter.loadFilter: 未找到缓存，将直接加载关键字.");

            worker = new Worker(root + "/workers/XFilterGetKeys.js");
            option = {
                src: that.src
            };
            worker.postMessage(option);
            worker.onmessage = function (e) {
                var res = e.data;
                var names = res.names;
                var sNames = res.sNames;

                selectAll = $("<div id='xFilter-fSelectAllSpan'>" +
                    "<input type='checkbox' class=\'" + id + "-fselectAll\' checked='checked' id=\'" + id + "-fselectAll\'><span class='xFilter-nameTag'>全部</span>" +
                    "</div>");

                $("#" + id + "-startFilter", filterDialog).button({
                    disabled: false
                });

                filterResult.empty().append(selectAll);
                that.allNames = names;
                that.selectedNames = sNames;
                names.forEach(function (name, i) {
                    var filterName;
                    if (i < 1000) {
                        filterName = $("<div class='nameCell'>" +
                            "<input type='checkbox' class=\'" + id + "-nameCb\' key='" + name + "' checked='checked'><span class='xFilter-nameTag'>" + name + "</span>" +
                            "</div>");
                        filterResult.append(filterName);
                    }
                });
                filterDiv.data('allNamesCatch', that.allNames);
                filterDiv.data('sNamesCatch', that.selectedNames);

                worker.terminate();
            };
        }
        //如果有缓存，则直接载入缓存
        else {
            log('XFilter.loadFilter: 从缓存加载关键字.');

            selectAll = $("<div id='xFilter-fSelectAllSpan'>" +
                "<input type='checkbox' class=\'" + id + "-fselectAll\' checked='checked' id=\'" + id + "-fselectAll\'><span class='xFilter-nameTag'>全部</span>" +
                "</div>");
            filterResult.empty().append(selectAll);

            $("#" + id + "-startFilter", filterDialog).button({
                disabled: false
            });

            that.allNames = allNamesCatch;
            that.selectedNames = sNamesCatch;
            that.allNames.forEach(function (name, i) {
                var filterName;
                if (i < 1000) {
                    filterName = $("<div class='nameCell'>" +
                        "<input type='checkbox' class=\'" + id + "-nameCb\' key='" + name + "' checked='checked'/><span class='xFilter-nameTag'>" + name + "</span>" +
                        "</div>");
                    filterResult.append(filterName);
                }
            });
        }
    };

    //选中某关键字
    that.selectName = function (name) {
        if (that.selectedNames.indexOf(name) === -1) {
            that.selectedNames.push(name);
        }
    };

    //反选某关键字
    that.unselectName = function (name) {
        var index = that.selectedNames.indexOf(name);
        if (index !== -1) {
            that.selectedNames.splice(index, 1);
        }
        $("#" + id + "fselectAll", filterDialog).prop("checked", false);
    };

    //根据用户输入过滤关键字
    that.searchByName = function (searchStr, type) {
        var selectedNames = [],
            allNames = that.allNames,
            tempAllNames = [];

        var filterResult = that.filterResult;

        var searchType = "";

        var strArray = searchStr.split(/\s+/);

        var i, j, k, substr, orgName, name, hasSubstr, startPos, endPos;

        var tempSelectAll = $("<div id='tSelectAll'>" +
                "<input type='checkbox' checked='checked' class=\'" + id + "-fselectAll\' id=\'" + id + "-fselectAll\'>" +
                "<span class='xFilter-nameTag'>全部</span>" +
                "</div>"),
            tempNameCell;

        if (!type) {
            searchType = "partial";
            if ($(completeMatch).is(":checked")) {
                searchType = "complete";
            }
        }
        else {
            searchType = type;
        }
        searchStr = searchStr.replace(/[\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b]|\s|\,|\.|\?/g, " ");
        searchStr = searchStr.trim().toLowerCase();

        for (i = 0; i < strArray.length; i++) {
            substr = strArray[i].trim();

            for (j = 0; j < allNames.length; j++) {
                orgName = allNames[j].toString();
                name = allNames[j].toString().toLowerCase();
                hasSubstr = true;
                //部分匹配
                if (searchType === "partial") {
                    //拆字匹配
                    if (parseInt(filterType) === 1) {
                        //如果过滤关键字不为数字
                        if (isNaN(Number(substr))) {
                            //判断关键字是否包含用户输入的字符
                            for (k = 0; k < substr.length; k++) {
                                if (name.search(substr.charAt(k)) === -1) {
                                    hasSubstr = false;
                                    break;
                                }
                            }
                            //判断字符的先后顺序是否符合
                            if (hasSubstr) {
                                var foundIndexes = [];
                                for (k = 0; k < substr.length; k++) {
                                    if (name.search(substr.charAt(k)) !== -1) {
                                        startPos = name.indexOf(substr.charAt(k));
                                        endPos = name.lastIndexOf(substr.charAt(k));
                                        if (foundIndexes.length === 0) {
                                            foundIndexes.push(startPos);
                                        }
                                        else {
                                            if (endPos < foundIndexes[foundIndexes.length - 1]) {
                                                hasSubstr = false;
                                                break;
                                            }
                                            else {
                                                if (startPos > foundIndexes[foundIndexes.length - 1]) {
                                                    foundIndexes.push(startPos);
                                                }
                                                else {
                                                    foundIndexes.push(endPos);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        //如果过滤关键字是数字且候选关键字也是数字
                        else if (!isNaN(substr) && !isNaN(parseInt(name))) {
                            hasSubstr = false;
                            if (name.toString().search('' + substr) === 0) {
                                hasSubstr = true;
                            }
                        }
                        //如果候选关键字是字符串
                        else if (!isNaN(substr) && isNaN(parseInt(name))) {
                            hasSubstr = true;
                            if (name.toString().search('' + substr) === -1) {
                                hasSubstr = false;
                            }
                        }
                    }
                    //连字匹配
                    else {
                        hasSubstr = false;
                        if (name.search(substr) !== -1) {
                            hasSubstr = true;
                        }
                    }
                }
                //完全匹配
                else {
                    hasSubstr = false;
                    if (name === substr) {
                        hasSubstr = true;
                    }
                }
                if (hasSubstr) {
                    selectedNames.indexOf(orgName) === -1 && selectedNames.push(orgName);
                    tempAllNames.indexOf(orgName) === -1 && tempAllNames.push(orgName);
                }
            }
        }

        filterResult.empty().append(tempSelectAll);

        for (i = 0; i < tempAllNames.length; i++) {
            if (i < 500) {
                name = tempAllNames[i];
                tempNameCell = $("<div class='nameCell'>" +
                    "<input type='checkbox' checked='checked' class=\'" + id + "-nameCb\' key='" + name + "' index='" + i + "'>" +
                    "<span class='xFilter-nameTag'>" +
                    name +
                    "</span>" +
                    "</div>");
                filterResult.append(tempNameCell);
            }
            else {
                break;
            }
        }

        matchRadios.find(".XFilter-matchResult").remove();
        matchRadios.append("<span class='XFilter-matchResult'>共匹配到" +
            "<span class='red'>" + tempAllNames.length + "</span>" +
            "条关键字</span>");
        that.selectedNames = selectedNames;
        that.tempAllNames = tempAllNames;
        log(that.selectedNames);
    };

    //选中所有关键字
    that.fSelectAll = function () {
        that.selectedNames = [];
        if (that.tempAllNames.length === 0) {
            that.allNames.forEach(function (name) {
                that.selectedNames.push(name);
            });
        } else {
            that.tempAllNames.forEach(function (name) {
                that.selectedNames.push(name);
            });
        }
    };

    //反选所有关键字
    that.fUnselectAll = function () {
        that.selectedNames = [];
    };

    //组件响应事件初始化
    //输入框的focus事件
    //为了解决ff下的未知bug，select都在200毫秒后执行
    $("#" + id + "-filterStr", filterDialog).unbind().focus(function () {
        var self = this;
        setTimeout(function () {
            self.select();
        }, 200);
    });

    //输入框中点击回车，开始搜素关键字
    $("#" + id + "-filterStr", filterDialog).keydown(function (e) {
        if (e.keyCode === 13) {
            $("#" + id + "-filterSubmit", filterDialog).click();
        }
    });

    //搜索按钮单击事件
    $("#" + id + "-filterSubmit", filterDialog).unbind().click(function () {
        var searchStr = $("#" + id + "-filterStr", filterDialog).val();
        var type;
        if (searchStr !== "" && searchStr !== "请输入过滤关键字") {
            type = "partial";
            if ($(completeMatch).is(":checked")) {
                type = "complete";
            }
            that.searchByName(searchStr, type);

        }
        else
            $("#" + id + "-resetFilter", filterDialog).click();
    });

    //关键字前选择框改变事件
    $(filterDialog).undelegate("." + id + "-nameCb", "change");
    $(filterDialog).delegate("." + id + "-nameCb", "change", function () {
        var checked = $(this).is(":checked");
        var name = $(this).attr("key");
        if (!checked) {
            that.unselectName(name);
            $("." + id + "-fselectAll", filterDialog).prop("checked", false);
        } else {
            that.selectName(name);
        }
    });

    //选择全部关键字选择框改变事件
    $(filterDialog).undelegate("." + id + "-fselectAll", "change");
    $(filterDialog).delegate("." + id + "-fselectAll", "change", function () {
        var checked = $(this).is(":checked");
        if (!checked) {
            $("." + id + "-nameCb", filterDialog).prop("checked", false);
            that.fUnselectAll();
        } else {
            $("." + id + "-nameCb", filterDialog).prop("checked", true);
            that.fSelectAll();
        }
    });

    //重置按钮单击事件
    $("#" + id + "-resetFilter", filterDialog).unbind().click(function () {
        $("#" + id + "-filterStr", filterDialog).val("请输入过滤关键字").select();
        that.loadFilter();
    });

    return that;
};

/**
 * 源文件：src/waterfall.js
 * 瀑布式布局，展示方式类似手机端的百度图片的搜索结果
 * 可以接受任意格式的json数组，然后调用用户自定义的renderer函数将每个数组中的每一个json元素转化为dom元素的字符串（即component中的内容）
 * 然后以瀑布式布局的模式展示这些dom
 */

XUtil.XWaterfall = function (option) {
    //读取配置项
    var url = option.url || '',
        src = $.isArray(option.src) ? option.src : [],
        colNum = $.isNumeric(Math.floor(option.colNum)) ? Math.floor(option.colNum) : 5,
        renderTo = option.renderTo || document.body,
        colWidth = $.isNumeric(option.colWidth) ? option.colWidth : 236,
        contentWidth = $.isNumeric(option.contentWidth) ? option.contentWidth : 234,
        initialSize = $.isNumeric(Math.floor(option.initialSize)) ? option.initialSize : colNum * 10,
        marginTop = $.isNumeric(option.marginTop) ? option.marginTop : 10,
        fetchSize = $.isNumeric(option.fetchSize) ? option.fetchSize : colNum * 5,
        renderer = $.isFunction(option.renderer) ? option.renderer : function (model) {
            return model;
        },
        onFetch = $.isFunction(option.onFetch) ? option.onFetch : function (renderTo) {
            console.log('fetching...');
        },
        fetchCallback = $.isFunction(option.fetchCallback) ? option.fetchCallback : function (status, renderTo, fetchedLen) {
            console.log(fetchedLen + ' components fetched!');
        };

    //私有成员及方法
    //  保存当前显示元素之前被移除元素的缓冲
    var preBuffer = [],
    //  保存当前显示元素之后被移除元素的缓冲
        afterBuffer = [],
    //  保存全部已加载元素的数组
        all = [],
    //  保存所有列信息的数组
        columns = [],
    //  上方基线
        upperHeight = 0,
    //  下方基线
        bottomHeight = 0,
    //  容器高度，将随着加载/移除元素动态设置
        maxHeight = 0,
    //  是否可以继续fetch
        fetchEnable = true;

    //推入一个新的component（并非从afterBuffer中读取）
    var pushComponent = function (component) {
        var i, col;
        var targetCol = columns[0],
            minHeight = columns[0].currentHeight;

        for (i = 0; i < columns.length; i++) {
            col = columns[i];
            if (col.currentHeight < minHeight) {
                minHeight = col.currentHeight;
                targetCol = col;
            }
        }

        targetCol.append(component, 'new');
        all.push(component);

        return targetCol;
    };

    //计算并设置顶端基线
    var setUpperHeight = function () {
        var upperHeights = [];

        columns.forEach(function (col) {
            upperHeights.push(col.currentTop);
        });

        upperHeight = Math.max.apply(window, upperHeights);
    };

    //计算并设置底端基线
    var setBottomHeight = function () {
        var bottomHeights = [];

        columns.forEach(function (col) {
            bottomHeights.push(col.currentHeight);
        });

        bottomHeight = Math.min.apply(window, bottomHeights);
    };

    //计算并设置控件的最大高度
    var setMaxHeight = function () {
        var maxHeights = [];

        columns.forEach(function (col) {
            maxHeights.push(col.currentHeight);
        });

        maxHeight = Math.max.apply(window, maxHeights);
    };

    //实例对象及实例属性/方法
    var that = {};

    that.set = function (attrs) {
        $.isNumeric(attrs.initialSize) && (initialSize = attrs.initialSize);
        $.isNumeric(attrs.colWidth) && (colWidth = attrs.colWidth);
        $.isNumeric(attrs.marginTop) && (marginTop = attrs.marginTop);
        $.isNumeric(attrs.fetchSize) && (fetchSize = attrs.fetchSize);
        $.isNumeric(attrs.colNum) && (colNum = attrs.colNum);
        $.isNumeric(attrs.contentWidth) && (contentWidth = attrs.contentWidth);
        $.isFunction(attrs.onFetch) && (onFetch = attrs.onFetch);
        $.isFunction(attrs.fetchCallback) && (fetchCallback = attrs.fetchCallback);
        ("url" in attrs) && (url = attrs.url);
    };

    //向瀑布流中追加新元素
    that.fetch = function () {
        var i, currentLen;
        var targetCol;

        currentLen = all.length;

        //从静态资源中获得新元素
        if (currentLen < src.length) {
            for (i = currentLen; i < currentLen + fetchSize; i++) {
                if (i < src.length) {
                    targetCol = pushComponent(src[i]);
                    preBuffer.push(targetCol.shift());
                }
                else {
                    arguments.callee();
                    break;
                }
            }

            console.log('fetch done.');
            console.log('current visible component size:' + $('.XWaterfall-component').length);
        }
        else {
            //从服务器请求新元素
            if (url !== '') {
                onFetch(renderTo);
                //在本次fetch操作结束之前，禁止新的fetch操作
                fetchEnable = false;

                //会自动为get请求添加两个参数，当前已经获取的所有资源的数量和期望获取元素的数量(等于fetchSize)
                $.get(url, {
                    fetchSize: fetchSize,
                    currentSize: all.length
                })
                    .done(function (data) {
                        if (data.message === 'success') {
                            data.src.forEach(function (com) {
                                var targetCol = pushComponent(com);
                                preBuffer.push(targetCol.shift());
                            });

                            //fetch成功后，允许新的fetch操作
                            fetchEnable = true;

                            fetchCallback('success', renderTo, data.src.length);
                        }
                        else if (data.message === 'all loaded') {
                            console.log('no more resource!');
                            fetchEnable = false;

                            fetchCallback('allLoaded', renderTo, data.src.length);
                        }
                        else {
                            console.log('exception:' + data.message);
                            fetchCallback('exception', renderTo, data.src.length);
                        }
                    })
                    .fail(function () {
                        console.log('fetch failed!');
                        fetchEnable = true;
                        fetchCallback('error', renderTo, data.src.length);
                    });
            }
            else {
                fetchEnable = false;
                return;
            }

        }

        setUpperHeight();
        setBottomHeight();
        setMaxHeight();

        $(renderTo).css('height', maxHeight);

    };

    //从前/后缓冲中重新获取/添加元素
    that.reAttach = function (position) {
        var i;
        var component, targetColIndex, targetCol;

        if (position === 'top') {
            component = preBuffer.pop();
            if (component) {
                targetColIndex = component.col;
                targetCol = columns[targetColIndex];
                targetCol.prepend(component);

                afterBuffer.push(targetCol.pop());
            }

            console.log('reAttachTop done.');
            console.log('current visible component size:' + $('.XWaterfall-component').length);
        }
        else if (position === 'bottom') {
            component = afterBuffer.pop();

            if (component) {
                targetColIndex = component.col;
                targetCol = columns[targetColIndex];
                targetCol.append(component, 'old');
                preBuffer.push(targetCol.shift());
            }

            console.log('reAttachBottom done.');
            console.log('current visible component size:' + $('.XWaterfall-component').length);
        }

        setUpperHeight();
        setBottomHeight();
        setMaxHeight();
    };

    //初始化瀑布式布局
    //可以单独调用，这样能实现还原布局的效果（滚动条跳到顶端，并且只加载初始的元素）
    that.init = function () {
        var i, col;

        all = [];
        preBuffer = [];
        afterBuffer = [];
        columns = [];
        upperHeight = 0;
        bottomHeight = 0;
        maxHeight = 0;
        fetchEnable = true;

        $(renderTo)
            .empty()
            .css('min-height', 0)
            .css('height', 0)
            .css('position', 'relative');

        for (i = 0; i < colNum; i++) {
            //列对象，存储了一些基本信息，包括：
            //列中的所有元素，列的位置(targetLeft)，列的index，列的当前高度（随着元素的添加和删除会动态
            //变化），以及列中第一个元素的top(currentTop)
            //提供四个方法：append(在列末尾添加新元素),prepend（在列的头部添加新元素），
            //pop（从列的末尾推出一个元素），shift（从列头推出一个元素）
            col = {
                index: i,
                targetLeft: colWidth * i,
                components: [],
                currentTop: $(renderTo).offset().top,
                currentHeight: 0,
                append: function (com, type) {

                    var self = this;

                    var component = {},
                        domHtml,
                        domNode;

                    var id;

                    var top;

                    if (type === 'new') {

                        id = XUtil.helpers.guid();
                        
                        self.currentHeight === 0 ? top = 0 : top = self.currentHeight + marginTop;

                        //注意，这里对元素的原始数据（即从服务器获得的json）进行了dom创建的操作
                        //用户必须自定义renderer方法来根据原始数据定制自己元素的dom字符串（并非dom元素，否则会带来巨大的性能问题）
                        //默认返回原始数据本身
                        domHtml = renderer(com);
                        domNode = $("<div class='XWaterfall-component'>");
                        domNode.append(domHtml);
                        
                        domNode
                            .css('width', contentWidth)
                            .attr('id', id)
                            .appendTo(renderTo)
                            .css('left', self.targetLeft)
                            .css('top', top);

                        //这个属性保存了元素被放在哪一列中
                        component.col = self.index;
                        self.components.push(component);
                        //这个属性保存了元素在列中的位置
                        component.index = self.components.indexOf(component);
                        component.id = id;
                        component.top = top;
                        component.left = self.targetLeft;
                        component.height = domNode.outerHeight();
                        component.model = com;

                        if (self.components.length === 1) {
                            self.currentHeight = component.height;
                        }
                        else {
                            self.currentHeight += component.height + marginTop;
                        }
                    }
                    else {

                        domNode = $("<div class='XWaterfall-component'>");
                        domNode.append(renderer(com.model));

                        domNode
                            .css('left', com.left)
                            .css('top', com.top)
                            .attr('id', com.id)
                            .css('width', contentWidth);

                        domNode.addClass('XWaterfall-component');

                        $(renderTo).append(domNode);

                        self.components.push(com);

                        if (self.components.length === 1) {
                            self.currentHeight = com.height;
                        }
                        else {
                            self.currentHeight += com.height + marginTop;
                        }
                    }
                },
                prepend: function (component) {
                    var self = this;

                    var domHtml = renderer(component.model);
                    var domNode = $("<div class='XWaterfall-component'>").append(domHtml);

                    domNode
                        .css('left', component.left)
                        .css('top', component.top)
                        .css('width', contentWidth)
                        .css('height', component.height)
                        .attr('id', component.id);

                    domNode.addClass('XWaterfall-component');

                    $(renderTo).append(domNode);

                    self.components.unshift(component);

                    self.currentTop > 0 && (self.currentTop = parseInt(self.components[0].top));
                },
                shift: function () {
                    var self = this;
                    var first = self.components.shift();

                    $('#' + first.id).remove();

                    self.currentTop = parseInt(self.components[0].top);

                    return first;
                },
                pop: function () {
                    var self = this;
                    var last = self.components.pop();

                    $('#' + last.id).remove();

                    self.currentHeight = self.currentHeight - last.height - marginTop;

                    return last;
                }
            };

            columns.push(col);
        }

        for (i = 0; i < initialSize; i++) {
            pushComponent(src[i]);
        }

        that.minHeight = $(renderTo).height();

        $(document).scrollTop(0);
    };

    (function () {
        //记录上一个滚动条位置,用来判断滚动条运动的方向
        var preScrollTop = 0;

        //页面滚动条事件
        $(document).on('scroll.XWaterfall', function (event) {

            var scrollTop = $(document).scrollTop(),
                scrollBottom = $(document).scrollTop() + $(window).height(),
                documentHeight = $(document).height();

            var fetchFactor = (documentHeight - scrollBottom),
                upFactor = scrollTop - upperHeight,
                downFactor = bottomHeight - scrollBottom;

            //根据当前滚动条坐标计算运动方向
            var isGoingDown = (scrollTop - preScrollTop > 0);

            if (isGoingDown) {
                if (afterBuffer.length === 0) {
                    if (fetchEnable && fetchFactor < 100) {
                        that.fetch();
                    }
                }
                else {
                    if (downFactor < 100) {
                        if (downFactor >= 0) {
                            that.reAttach('bottom');
                        }
                        else {
                            while (bottomHeight < $(document).scrollTop() + $(window).height() &&
                                afterBuffer.length > 0) {

                                that.reAttach('bottom');
                            }
                        }
                    }
                }
            }
            else {
                if (upFactor < 100 && preBuffer.length > 0) {
                    if (upFactor >= 0) {
                        that.reAttach('top');
                    }
                    else {
                        while (upperHeight > $(document).scrollTop() &&
                            preBuffer.length > 0) {

                            that.reAttach('top');
                        }
                    }
                }
            }

            preScrollTop = scrollTop;

        });
    })();

    that.init();

    return that;
};
/*
 * 源文件：src/amd.js
 * */

//预加载图片
XUtil.helpers.preloadImages(
        XUtil.config.rootPath + "/images/sort_asc.gif",
        XUtil.config.rootPath + "/images/sort_desc.gif",
        XUtil.config.rootPath + '/images/button.png',
        XUtil.config.rootPath + '/images/button-active.png'
);

//支持模块加载模式
if (typeof define === "function" && define.amd && define.amd.jQuery) {

    define(
        [XUtil.config.jQuery, XUtil.config.jQueryUI],
        function () {
            return XUtil;
        });
}

window.XUtil = XUtil;
window.myUtil = XUtil;

})( window );