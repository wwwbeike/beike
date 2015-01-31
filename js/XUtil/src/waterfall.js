/**
 * 源文件：src/waterfall.js
 * 瀑布式布局，展示方式类似手机端的百度图片的搜索结果
 * 可以接受任意格式的json数组，然后调用用户自定义的renderer函数将每个数组中的每一个json元素转化为dom元素的字符串（即component中的内容）
 * 然后以瀑布式布局的模式展示这些dom
 */

XUtil.XWaterfall = function (option) {

	var log = XUtil.helpers.log;

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
			log('XWaterfall: fetching...');
		},
		fetchCallback = $.isFunction(option.fetchCallback) ? option.fetchCallback : function (status, renderTo, fetchedLen) {
			log('XWaterfall: ' + status);
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

		return that;
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

			log('XWaterfall: fetch done.');
			log('XWaterfall: current visible component size:' + $('.XWaterfall-component').length);
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
							
							if(data.src.length===fetchSize){
								
								data.src.forEach(function (com) {
									var targetCol = pushComponent(com);
									preBuffer.push(targetCol.shift());
								});
								
								//fetch成功后，允许新的fetch操作
								fetchEnable = true;

								fetchCallback('success', renderTo, data.src.length);
							}
							else{
								log('XWaterfall: fetch failed, data.src.length is not equal to fetchsize.');
								fetchEnable=false;
							}
						}
						else if (data.message === 'all loaded') {
							log('XWaterfall: no more resource!');
							fetchEnable = false;

							fetchCallback('allLoaded', renderTo, data.src.length);
						}
						else {
							log('XWaterfall: exception:' + data.message);
							fetchEnable = false;
							fetchCallback('exception', renderTo, data.src.length);
						}
					})
					.fail(function () {
						log('XWaterfall: fetch failed!');
						fetchEnable = false;
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

		return that;
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

			log('XWaterfall: reAttachTop done.');
			log('XWaterfall: current visible component size:' + $('.XWaterfall-component').length);
		}
		else if (position === 'bottom') {
			component = afterBuffer.pop();

			if (component) {
				targetColIndex = component.col;
				targetCol = columns[targetColIndex];
				targetCol.append(component, 'old');
				preBuffer.push(targetCol.shift());
			}

			log('XWaterfall: reAttachBottom done.');
			log('XWaterfall: current visible component size:' + $('.XWaterfall-component').length);
		}

		setUpperHeight();
		setBottomHeight();
		setMaxHeight();

		return that;
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
			if (i < src.length) {
				pushComponent(src[i]);
			}
		}
		
		setMaxHeight();
		$(renderTo).css('height', maxHeight);

		$(document).scrollTop(0);

		return that;
	};

	(function () {
		//记录上一个滚动条位置,用来判断滚动条运动的方向
		var preScrollTop = 0;

		//页面滚动条事件
		//滚动条事件只能对一个waterfall组件有效
		$(document).off('scroll.XWaterfall');
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
