/**
 * saveAsApp
 * - Informs user how to save web page as web-app.
 *
 * author: Filip Holmberg <filip@mobiilimarkkinointirouta.fi>
 */
;(function($,window,document,undefined)
{
    // Create the defaults
    var pluginName = "saveAsApp",
        defaults = {
            initDelay   : 1500,
            closeDelay  : 12000,
            target      : 'body',
            ignoreCookie: 'saveAsAppIgnored',
            showedCookie: 'saveAsAppShowed',
            frequency   : 120000,
            infoTexts   : {
                'ios-safari'        : 'Lisää tämä web-sovellus työpöydällesi: paina keskimmäistä kuvaketta ja valitse <br><strong>Lisää kotiin</strong>.',
                'win-ie'            : 'Lisää tämä web-sovellus työpöydällesi: paina oikeassa alakulmassa olevaa kuvaketta ja valitse <br><strong>kiinnitä aloitusnäyttöön</strong>.',
                'android-native'    : 'Voit lisätä tämän web-sovelluksen laitteesi työpöydälle.'
            }
        };

    // Plugin constructor
    function Plugin(options)
    {
        this.settings   = $.extend( {}, defaults, options );
        this._defaults  = defaults;
        this.device     = {};
        this.text       = false;
        this.init();
    }

    Plugin.prototype =
    {
        /**
         * Init method
         *
         * @returns {boolean}
         */
        init: function()
        {
            // already in app-mode
            if(window.navigator.standalone) return false;

            // plugin ignored by user
            //if(this.getCookie(this.settings.ignoreCookie) === 'true') return false;

            // check if plugin was used more receantly than frequency setting
            var now = parseInt(new Date().getTime());
            //if((now - parseInt(this.getCookie(this.settings.showedCookie))) < this.settings.frequency)
            //    return false;

            // unsupported device
            if(!this.checkDevice()) return false;

            // show bookmark info
            var _this = this;
            setTimeout(function()
            {
                _this.setCookie(_this.settings.showedCookie, now);
                _this.show();
                _this.$panel.on('click', '#bookmarkIgnore', $.proxy(_this.remove, _this));
            }, this.settings.initDelay);

            // assign events
            setTimeout(function()
            {
                $('#bookmarkInfo').fadeOut(function() {
                    $(this).remove();
                });
            }, this.settings.closeDelay);

            return true;
        },

        /**
         * Remove infopanel and add ignored cookie
         *
         * @returns {boolean}
         */
        remove: function ()
        {
            this.setCookie(this.settings.ignoreCookie, true);

            this.$panel.animate({
                'top': '-1000px'
            }, 500, function() {
                $(this).remove();
            });

            return false;
        },

        /**
         * Sets a cookie
         *
         * @param key
         * @param value
         */
        setCookie: function(key, value)
        {
            var expires = new Date();
            expires.setTime(expires.getTime() + (90 * 24 * 60 * 60 * 1000));
            document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
        },

        /**
         * Gets a cookie
         *
         * @param key
         * @returns {*}
         */
        getCookie: function(key)
        {
            var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
            return keyValue ? keyValue[2] : null;
        },

        /**
         * Check device and assing contet based on it
         *
         * @returns {string}
         */
        checkDevice: function()
        {
            var _ua = navigator.userAgent;

            if(_ua.indexOf('iPhone') > 0 || _ua.indexOf('iPad') > 0)
            {
                this.device.os = 'ios';
                if(_ua.indexOf('Safari'))       this.device.browser = 'safari';
            }
            else if(_ua.indexOf('Android') > 0)
            {
                this.device.os = 'android';
                if(_ua.indexOf('WebKit'))       this.device.browser = 'native';
            }
            else if(_ua.indexOf('Windows Phone') > 0)
            {
                this.device.os = 'win';
                if(_ua.indexOf('IEMobile'))     this.device.browser = 'ie';
            }

            return (this.device.os && this.device.browser);
        },

        /**
         * Return device and browser specific infotext
         *
         * @returns {string}
         */
        getText: function()
        {
            var stringKey = this.device.os+'-'+this.device.browser;

            if(this.settings.infoTexts[stringKey].length > 1)
            {
                return this.settings.infoTexts[stringKey];
            }
            else
            {
                return false;
            }


        },

        /**
         * show 'save as app' panel
         */
        show: function()
        {
            var _this = this;

            this.$panel = $(
                '<div id="bookmarkInfo" style="display:none">' +
                '   <div id="bookmarkContent">'+
                '       '+this.getText()+ //'<br>'+navigator.userAgent+
                '   </div>'+
                '   <a href="#" id="bookmarkIgnore">Piilota</a>'+
                '</div>'
            );

            $(this.settings.target).append(this.$panel);

            // slide down panel and fade in hide button
            this.$panel
                .css({
                    display: 'block'
                })
                .animate({
                    top: '0'
                }, 1000, function()
                {
                    setTimeout(function()
                    {
                        $('#bookmarkIgnore')
                            .css({
                                top: _this.$panel.height()+'px'
                            })
                            .fadeIn();
                    }, 500);
                }
            );
        }
    };

    $.fn[ pluginName ] = function ( options )
    {
        return this.each(function()
        {
            if ( !$.data( this, "plugin_" + pluginName ) )
            {
                $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
            }
        });
    };

    $.extend(
    {
       saveAsApp: function(o)
       {
           new Plugin(o);
       }
    });

})( jQuery, window, document );

