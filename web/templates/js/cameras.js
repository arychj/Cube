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
            var name = getName(this);

            $(this).html($('<div/>').addClass('title'));
            $(this).append('<img/>');

            if(name == 'xxx'){
                bind(this, function(state){
                });
            }
            else{
                bind(this, function(title, url){
                    $(this).find('.title').html(title);
                    $(this).find('img').attr({'src': url});
                });
            }

            if($(this)[0].hasAttribute('camera-refresh')){
                var camera = this;
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

    function refresh(camera){
        if($(camera).is(':visible')){
            var img = $(camera).find('img');
            var src = $(img).attr('src');

            if(src.indexOf('&ts') > 0){
                src = src.substring(0, src.indexOf('&ts'));
            }

            src = src + '&ts=' + Date.now();

//            $(img).attr('src', src);
            $(camera).append($('<img/>').attr({'src': src}).hide());
            $(camera).find('img:last').fadeIn('fast', function(){
                $(camera).find('img:first').remove();
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

