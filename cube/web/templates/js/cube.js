(function($){
    var _cube = null;
    var _defaultFace = null;

    var _isAnimating = false;
    var _endCurrentAnimation = false;
    var _endNextAnimation = false;

    var _resetTimeout = null;
    var _resetTimer = null;

    function init(params){
        console.log('Initializing cube...');

        acceptParameters(params);

        var faces = $(this).find('[cube-face]');
        if(faces.length == 6){
            _defaultFace = $(faces).first();
            _cube = generateCubeRotationGraph(faces);
        }
        else{
            throw 'Invalid number of faces.' + faces.length;
        }

        addEventListeners();

	    setTimeout(function(){ show(); }, 1000);

        return this;
    }

    function acceptParameters(params){
        _resetTimeout = params['resetTimeout'] * 1000;
    }

    function show(face){
        if(typeof face === 'undefined'){
            face = _defaultFace;
        }
             
        $('[cube-face]').fadeOut().removeAttr('cube-face-current');
	    $(face).attr({'cube-face-current': ''}).fadeIn();

        $('.cube-map-face').removeClass('active');
        $('.cube-map-face[cube-face-show=' + $(face).attr('cube-face') + ']').addClass('active');

        setResetTimer();

		$(document).trigger('cube-rotate'); 
    }

    function setResetTimer(){
        if(_resetTimer != null){
            clearTimeout(_resetTimer);
        }

        if(!$('[cube-face-current]').is($(_defaultFace))){
            _resetTimer = setTimeout(function(){ show(); }, _resetTimeout);
        }
    }

    function rotate(event){
        direction = event.data.direction;

        if(_isAnimating) {
            return false;
        }

        _isAnimating = true;

        switch(direction) {
            case 'left':
                outClass = 'pt-page-rotateCubeLeftOut pt-page-ontop';
                inClass = 'pt-page-rotateCubeLeftIn';
                break;
            case 'right':
                outClass = 'pt-page-rotateCubeRightOut pt-page-ontop';
                inClass = 'pt-page-rotateCubeRightIn';
                break;
            case 'up':
                outClass = 'pt-page-rotateCubeTopOut pt-page-ontop';
                inClass = 'pt-page-rotateCubeTopIn';
                break;
            case 'down':
                outClass = 'pt-page-rotateCubeBottomOut pt-page-ontop';
                inClass = 'pt-page-rotateCubeBottomIn';
                break;
        }

        current = $('[cube-face-current]');
        next = _cube[current.attr('cube-face')][direction].element;

        $(current)
            .addClass(outClass)
            .on('webkitAnimationEnd', {'current': current, 'next': next}, endAnimation);

        $(next)
            .addClass(inClass)
            .on('webkitAnimationEnd', {'current': current, 'next': next}, endAnimation);

        show(next);

        _isAnimating = false;
    }

    function endAnimation(event){
        $(event.data.current).removeClassByPrefix('pt-');
        $(event.data.next).removeClassByPrefix('pt-');
    }

    function addEventListeners(){
	    $('body').not('[no-rotate]').on('swipeup', {'direction': 'up'}, rotate);
    	$('body').not('[no-rotate]').on('swipedown', {'direction': 'down'}, rotate);
    	$('body').not('[no-rotate]').on('swipeleft', {'direction': 'left'}, rotate);
	    $('body').not('[no-rotate]').on('swiperight', {'direction': 'right'}, rotate);

        $('[cube-face-show]').on('click', function(e){
            show('[cube-face=' + $(this).attr('cube-face-show') + ']');
        });
    }

    function generateCubeRotationGraph(faces){
        var	cube = {
            front: {
                name: 'front',
                element: $(faces).locate('[cube-face="front"]')
            },
            back: {
                name: 'back',
                element: $(faces).locate('[cube-face="back"]')
            },
            left: {
                name: 'left',
                element: $(faces).locate('[cube-face="left"]')
            },
            right: {
                name: 'right',
                element: $(faces).locate('[cube-face="right"]')
            },
            up: {
                name: 'up',
                element: $(faces).locate('[cube-face="up"]')
            },
            down: {
                name: 'down',
                element: $(faces).locate('[cube-face="down"]')
            }
        };

        cube.front.up = cube.down;
        cube.front.down = cube.up;
        cube.front.left = cube.right;
        cube.front.right = cube.left;

        cube.back.up = cube.up;
        cube.back.down = cube.down;
        cube.back.left = cube.left;
        cube.back.right = cube.right;

        cube.up.up = cube.front;
        cube.up.down = cube.back;
        cube.up.left = cube.right;
        cube.up.right = cube.left;

        cube.down.up = cube.back;
        cube.down.down = cube.front;
        cube.down.left = cube.right;
        cube.down.right = cube.left;

        cube.left.up = cube.down;
        cube.left.down = cube.up;
        cube.left.left = cube.front;
        cube.left.right = cube.back;

        cube.right.up = cube.down;
        cube.right.down = cube.up;
        cube.right.left = cube.back;
        cube.right.right = cube.front;

        return cube;
    }

    $.fn.locate = function(selector) {
        return $(this).filter(function(index){
            return $(this).is(selector);
        });
    }

    $.fn.removeClassByPrefix = function(prefix) {
        this.each(function(i, el) {
            var classes = el.className.split(' ').filter(function(c) {
                return c.lastIndexOf(prefix, 0) !== 0;
            });

            el.className = $.trim(classes.join(' '));
        });

        return this;
    }

    $.fn.cubify = function(){
        var args = (arguments.length == 0 ? [{}] : arguments);

        args[0] = $.extend(true,{
            'resetTimeout': 2 * 60
        }, args[0]);

        return init.apply(this, args);
    };
})(jQuery);
