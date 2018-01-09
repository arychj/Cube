(function($){
    var _floorplan;

    function init(params){
        $(this).on('load', function(){
            console.log('Floorplan initializing...');

            _floorplan = this;

            acceptParameters(params);
            darken();
            assignControls(params['controls']);

            $(this).trigger('floorplan-ready');
            console.log('Floorplan ready...');

            if(params['onReady'] != null){
                params['onReady']();
            }
        });

        return this;
    }

    function acceptParameters(params){
    }

    function assignControls(controls){
        $.each(controls, function(selector, entityId){
            var control = $(_floorplan).find(selector);
            if($(control).length > 0){
                $(control).attr('entity-id', entityId);
                
                if($(control).parents('svg').length > 0){
                    $(control).svgAddClass('control');
                }
                else{
                    $(control).addClass('control');
                }
            }
        });
    }

    function darken(){
        console.log('Darkening floorplan... ');

        $(_floorplan).find('[fill="#FFFFFF"]').removeAttr('fill');
        $(_floorplan).find('[fill="#DDDDDD"]').invert('fill');
        $(_floorplan).find('[stroke="#000000"]').invert('stroke');
        $(_floorplan).find('[stroke="#FFFFFF"]').invert('stroke');

        //$(_floorplan).find('[fill="#DDDDDD"]').css({'fill': '#333'});
        //$(_floorplan).find('[stroke="#000000"]').css({'stroke': '#FFF'});
        //$(_floorplan).find('[stroke="#FFFFFF"]').css({'stroke': '#000'});
    }

    //https://stackoverflow.com/a/35970186/681182
    $.fn.invert = function(property){
        if($(this).length > 0){
            var hex = $(this).css(property);

            if(hex.indexOf('rgb') === 0){
                var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(hex);
        
                var red = parseInt(digits[2]);
                var green = parseInt(digits[3]);
                var blue = parseInt(digits[4]);
                
                var rgb = blue | (green << 8) | (red << 16);

                hex = digits[1] + '#' + rgb.toString(16).padStart(6, '0');
            }

            if (hex.indexOf('#') === 0) {
                hex = hex.slice(1);
            }

            // convert 3-digit hex to 6-digits.
            if (hex.length === 3) {
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            }
            if (hex.length !== 6) {
                throw new Error('Invalid HEX color.');
            }

            // invert color components
            var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
                g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
                b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);

            // pad each with zeros and return
            var newHex = '#' + r.padStart(2, '0') +  g.padStart(2, '0') + b.padStart(2, '0');

            $(this).css(property, newHex);
        }

        return this;
    }

    $.fn.svgAddClass = function(c) {
        var classes = ($(this).attr('class') == null ? [] : $(this).attr('class').split(' '));
        classes.push(c);

        $(this).attr('class', classes.join(' '));

        return this;
    }

    $.fn.svgRemoveClass = function(c) {
        var classes = ($(this).attr('class') == null ? [] : $(this).attr('class').split(' '));
        classes = $.grep(classes, function(value){
            return (value != c);
        });

        $(this).attr('class', classes.join(' '));

        return this;
    }

    $.fn.floorplan = function(params){
        arguments[0] = $.extend(true,{
            'controls': [],
            'onReady': null
        }, arguments[0]);

        return init.apply(this, arguments);
    }

})(jQuery);

