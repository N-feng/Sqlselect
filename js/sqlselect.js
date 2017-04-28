;
(function($, window, document, undefined) {

    'use strict';

    var pluginName = 'sqlselect';
    var $window = $(window);

    function Plugin(selector, options) {
        var defaults = {
            fieldName: [],
            regexp: [
                { name: '等于', value: '=' },
                { name: '不等于', value: '!=' },
                { name: '小于', value: '<' },
                { name: '小于或等于', value: '<=' },
                { name: '大于', value: '>' },
                { name: '大于或等于', value: '>=' },
                { name: '包含', value: 'like \'%xxx%\'' },
                { name: '不包含', value: 'not like \'%xxx%\'' },
                { name: '开始以', value: 'like \'xxx%\'' },
                { name: '结束以', value: 'like \'%xxx\'' },
                { name: '是空值(null)', value: 'is null' },
                { name: '不是空值(null)', value: 'is not null' },
                { name: '是空的', value: '=&quot;&quot;' },
                { name: '不是空的', value: '!=&quot;&quot;' },
                { name: '介于', value: '(between * and ?)' },
                { name: '非介于', value: '(not between * and ?)' },
                { name: '在列表中', value: 'in (#)' },
                { name: '不在列表中', value: 'not in (#)' }
            ],
            hideCallback: function () {},
            showCallback: function () {},
            confirmCallback: function () {}
        }
        this.$selector = $(selector);
        this.config = $.extend({}, defaults, options);
        this.init();
        this.event();
    }

    Plugin.prototype.init = function () {
        var add = $('<a/>', {href: 'javascript:;', class: 'btn btn-primary btn-sm J-add', html: '添加'});
        var fill = $('<a/>', {href: 'javascript:;', class: 'btn btn-primary btn-sm J-fill', html: '填充'});
        var empty = $('<a/>', {href: 'javascript:;', class: 'btn btn-primary btn-sm J-empty', html: '清空'});
        var sqlControlButton = $('<div/>', {class: 'sqlControlButton'}).append(add, ' ', fill, ' ', empty);
        var sqlSelectionCondition = this.htmlSplicing.call(this);
        var template = $('<div/>', {class: 'sqlSelectContainer mt10'}).append(sqlControlButton, sqlSelectionCondition);
        this.$selector.after(template);
    }

    // html拼接
    Plugin.prototype.htmlSplicing = function () {
        var regexpHtml = '';
        var fieldNameHtml = '';
        var relationshipHtml = ' <div class="col-sm-2 hide"><select class="form-control J-fieldFive"><option>and</option><option>or</option><option>and not</option><option>or not</option></select></div> ';

        if (this.config.fieldName.length > 0) {
            $.each(this.config.fieldName, function(i, v) {
                fieldNameHtml += '<option>' + v + '</option>';
            });
            fieldNameHtml = ' <div class="col-sm-2"><select class="form-control J-fieldOne">' + fieldNameHtml + '</select></div> ';
        }
        if (this.config.regexp.length > 0) {
            $.each(this.config.regexp, function(i, v) {
                regexpHtml += '<option value="' + v.value + '">' + v.name + '</option>';
            });
            regexpHtml = ' <div class="col-sm-2"><select class="form-control J-fieldThree">' + regexpHtml + '</select></div> ';
        }
        if (fieldNameHtml !== '' && regexpHtml !== '') {
            return '<div class="sqlSelectionCondition row mt10" data-splicingMethod="1">' + fieldNameHtml + '<div class="col-sm-2 hide"><input type="text" class="form-control J-fieldTwo"></div>' + regexpHtml + '<div class="col-sm-2"><input type="text" class="form-control J-fieldFour"></div>' + relationshipHtml + '<a href="javascript:;" class="btn btn-primary btn-sm J-delete">删除</a></div>';
        }
    }

    // (填充)值拼接
    Plugin.prototype.valSplicing = function () {

        var txt = '';
        var fieldTwo = !($(this).find('.J-fieldTwo').hasClass('hide'));
        var fieldFour = !($(this).find('.J-fieldFour').hasClass('hide'));
        var fieldFive = !($(this).find('.J-fieldFive').parent().hasClass('hide'));

        var fieldOneVal = $(this).find('.J-fieldOne').val();
        var fieldTwoVal = $(this).find('.J-fieldTwo').val();
        var fieldThreeVal = $(this).find('.J-fieldThree').val();
        var fieldFourVal = $(this).find('.J-fieldFour').val();
        var fieldFiveVal = fieldFive ? ' ' + $(this).find('.J-fieldFive').val() + ' ' : '';

        var splicingMethod = $(this).attr('data-splicingMethod');

        if (splicingMethod === '1') {
            txt = fieldOneVal + ' ' + fieldThreeVal + ' "' + fieldFourVal + '"' + fieldFiveVal;
        }
        if (splicingMethod === '2') {
            fieldThreeVal = fieldThreeVal.replace('xxx', fieldFourVal);
            txt = fieldOneVal + ' ' + fieldThreeVal + fieldFiveVal;
        }
        if (splicingMethod === '3') {
            txt = fieldOneVal + ' ' + fieldThreeVal + fieldFiveVal;
        }
        if (splicingMethod === '4') {
            fieldThreeVal = fieldThreeVal.replace('*', '"' + fieldTwoVal + '"').replace('?', '"' + fieldFourVal + '"');
            txt = fieldOneVal + ' ' + fieldThreeVal + fieldFiveVal;
        }
        if (splicingMethod === '5') {
            fieldThreeVal = fieldThreeVal.replace('#', '"' + fieldFourVal + '"');
            txt = fieldOneVal + ' ' + fieldThreeVal + fieldFiveVal;
        }
        return txt;
    }

    // 正则显示
    Plugin.prototype.regexpShow = function () {
        var _this = $(event.target);
        var txt = _this.find("option:selected").text();
        var splicingMethod = 1;
        var _template = _this.parent().parent();
        if (txt === '等于' || txt === '不等于' || txt === '小于' || txt === '小于或等于' || txt === '大于' || txt === '大于或等于') {
            splicingMethod = 1;
        }
        if (txt === '包含' || txt === '不包含' || txt === '开始以' || txt === '结束以') {
            splicingMethod = 2;
        }
        if (txt === '是空值(null)' || txt === '不是空值(null)' || txt === '是空的' || txt === '不是空的') {
            splicingMethod = 3;
        }
        if (txt === '介于' || txt === '非介于') {
            splicingMethod = 4;
        }
        if (txt === '在列表中' || txt === '不在列表中') {
            splicingMethod = 5;
        }
        splicingMethod === 3 ? _template.find('.J-fieldFour').parent().addClass('hide') : _template.find('.J-fieldFour').parent().removeClass('hide');
        splicingMethod === 4 ? _template.find('.J-fieldTwo').parent().removeClass('hide') : _template.find('.J-fieldTwo').parent().addClass('hide');
        _template.attr('data-splicingMethod', splicingMethod);
    }

    Plugin.prototype.delete = function () {
        var _this = $(event.target);
        _this.parent().remove();
    }

    Plugin.prototype.add = function () {
        var $selector = this.$selector;
        var $parent = $selector.parent();
        var $container = $parent.find('.sqlSelectContainer');
        var sqlSelectionCondition = this.htmlSplicing.call(this);
        $container.find('.J-fieldFive').parent().removeClass('hide');
        $container.append(sqlSelectionCondition);
    }

    Plugin.prototype.fill = function () {
        var _this = this;
        var $selector = this.$selector;
        var $parent = $selector.parent();
        var $container = $parent.find('.sqlSelectContainer');
        var $sqlSelectionCondition = $container.find('.sqlSelectionCondition');
        var fillText = '';
        $sqlSelectionCondition.each(function(key, el) {
            fillText += _this.valSplicing.call(this);
        })
        $selector.val(fillText);
    }

    Plugin.prototype.empty = function () {
        var _this = this;
        var $selector = this.$selector;
        $selector.val('');
    }

    Plugin.prototype.event = function () {
        var $selector = this.$selector;
        var $parent = $selector.parent();
        $parent.on('change.' + pluginName, '.J-fieldThree', $.proxy(this.regexpShow, this));
        $parent.on('click.' + pluginName, '.J-delete', $.proxy(this.delete, this));
        $parent.on('click.' + pluginName, '.J-add', $.proxy(this.add, this));
        $parent.on('click.' + pluginName, '.J-fill', $.proxy(this.fill, this));
        $parent.on('click.' + pluginName, '.J-empty', $.proxy(this.empty, this));
    }

    $.fn[pluginName] = function (options) {
        return new Plugin(this, options);
    };

})(jQuery, window, document);