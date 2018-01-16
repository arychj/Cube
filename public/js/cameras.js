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

    $.fn.camera = function(params){
        var args = (arguments.length == 0 ? [{}] : arguments);

        args[0] = $.extend(true,{
            'baseurl': ''
        }, args[0]);

        return init.apply(this, args);
    }

})(jQuery);

