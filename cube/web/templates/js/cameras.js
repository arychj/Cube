(function($){
    var _cameras, _baseurl;

    function init(params){
        console.log("Initializing cameras...");

        _cameras = this;

        acceptParameters(params);

        setupCameras();

        return this;
    }

    function acceptParameters(params){
        _baseurl = params['baseurl'];
    }

    function setupCameras(){
        $(_cameras).each(function(){
            var camera = this;
            var name = getName(this);

            $(this).html($('<div/>').addClass('title'));
            $(this).append('<img/>');

            bind(this, function(title, url){
                $(this).find('.title').html(title);
                $(this).attr({
                    'camera-snap-source': url
                });

                refresh(camera, true);
            });

            if($(this).is('[camera-refresh]')){
                setInterval(function(){ refresh(camera); }, parseInt($(this).attr('camera-refresh')) * 1000);
            }
        });
    }

    function getName(camera){
        return $(camera).attr('entity-id').split('.')[1];
    }

    function bind(camera, updater){
        $(camera).bind('update-state', function(e, data){
            updater.apply(this, [
                data.attributes.friendly_name,
                _baseurl + data.attributes.entity_picture
            ]);
        });
    }

    function refresh(camera, force){
        if($(camera).is(':visible') || (force == true)){
            var img = $(camera).find('img');

            var img = $('<img/>').attr({
                'src': $(camera).attr('camera-snap-source') + '&ts=' + Date.now()
            }).hide();
            
            $(camera).append(img);

            $(img).on('load', function(){
                $(img).fadeIn('fast', function(){
                    $(camera).find('img:first').remove();
                });
            });
        }
    }

    $.fn.camera = function(params){
        var args = (arguments.length == 0 ? [{}] : arguments);

        args[0] = $.extend(true,{
            'baseurl': ''
        }, args[0]);

        return init.apply(this, args);
    }

})(jQuery);

