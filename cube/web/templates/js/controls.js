(function($){
    var _controls;

    function init(params){
        console.log("Initializing controls...");

        _controls = this;

        acceptParameters(params);

        setupControls();

        return this;
    }

    function acceptParameters(params){
    }

    function setupControls(){
        $(_controls).each(function(){
            var type = getType(this);
            if(type == 'light'){
                if($(this).parents('svg').length > 0){
                    bind(this, function(state){
                        if(state == 'on'){
                            $(this).svgAddClass('active');
                        }
                        else{
                            $(this).svgRemoveClass('active');
                        }
                    });
                }
                else{
                    bind(this, function(state){
                        if(state == 'on'){
                            $(this).addClass('active');
                        }
                        else{
                            $(this).removeClass('active');
                        }
                    });
                }
            }
        });
    }

    function getType(control){
        return $(control).attr('entity-id').split('.')[0];
    }

    function bind(control, updater){
        $(control).bind('update-state', function(e, data){
            updater.apply(this, [data.state]);
        });
    }

    $.fn.control = function(params){
        arguments[0] = $.extend(true,{
        }, arguments[0]);

        return init.apply(this, arguments);
    }

})(jQuery);

