/**
 *
 * @constructor
 */
var SpeechToTranslateSpeech = function(){
    this.initialize.apply(this, arguments);
};

$.extend(SpeechToTranslateSpeech.prototype, {

    _apiKey: null,

    _recognition: null,

    _source: null,

    _target: null,

    _tts: null,

    _recognizing: false,

    _defaultSource: 'fr',

    _defaultTarget: 'en',

    _currentText: "",

    _currentTranslatedText: "",

    _cleanText: function(s){

        return s.replace(/[\\\'\\\"]/g, ' ');
    },

    /**
     *
     * @private
     */
    _translate: function(){
        if( !this._currentText && this._apiKey ){
            return;
        }

        $.getJSON('https://www.googleapis.com/language/translate/v2?key=' + this._apiKey + '&q='+ encodeURI(this._currentText) +'&source=' + this._source + '&target=' + this._target, this._onTranslated.bind(this));
    },

    /**
     *
     * @param json
     * @private
     */
    _onTranslated: function(json){
        this._currentTranslatedText = this._cleanText(json.data.translations[0].translatedText);
        this._toSpeech();

        this.onTranslated(this._currentTranslatedText, this._currentText);
    },

    /**
     *
     * @private
     */
    _toSpeech: function(){
        var urls;

        if( !this._tts ){
            return;
        }

        urls = this._tts.urls(this._currentTranslatedText.replace(/ /g, '-'), this._target);
        this.onSpeechReady.call(this, urls[0], this._target, this._currentTranslatedText);

    },

    /**
     *
     * @private
     */
    _onStart: function(){
        this._recognizing = true;
        this.onStart.apply(this, arguments);
    },

    /**
     *
     * @private
     */
    _onStop: function(){
        this._recognizing = false;
        this.onStop.apply(this, arguments);
    },

    /**
     *
     * @private
     */
    _onError: function(){
        this.onError.apply(this, arguments);
    },

    /**
     *
     * @private
     */
    _onEnd: function(){
        this._recognizing = false;
        this.onEnd.apply(this, arguments);
    },

    /**
     *
     * @private
     */
    _onReady: function(){
        this._tts = 'GoogleTTS' in window ? new GoogleTTS(this._target) : null;
        this[this._recognition ? 'onReady' : 'onNotSupported'].apply(this, arguments);
    },

    /**
     *
     * @param googleApiKey
     * @param source
     * @param target
     */
    initialize: function(googleApiKey, source, target, streaming){

        this._apiKey = googleApiKey;
        this._recognition = 'speechRecognition' in window ? new speechRecognition() : 'webkitSpeechRecognition' in window ? new webkitSpeechRecognition() : null;

        this.setSourceLanguage(source);
        this.setTargetLanguage(target);


        if( 'GoogleTTS' in window ){
            setTimeout(this._onReady.bind(this), 0);
        }else{
            $.getScript('https://rawgithub.com/hiddentao/google-tts/master/google-tts.min.js', this._onReady.bind(this));
        }

        if( !this._recognition ){
            setTimeout(this._onReady.bind(this), 0);
            return;
        }

        if( streaming ){

            this._recognition.continuous = true;
            this._recognition.interimResults = true;
            this._recognition.start();

        }

        this._recognition.onresult = function(event){
            if (event.results.length > 0) {
                this._currentText = event.results[0][0].transcript;

                this.onResult(this._currentText);
                this._translate();

                if( !streaming ){
                    this.stop();
                }
            }
        }.bind(this);

        this._recognition.onstart = this._onStart.bind(this);
        this._recognition.onstop = this._onStop.bind(this);
        this._recognition.onerror = this._onError.bind(this);
        this._recognition.onend = this._onEnd.bind(this);

    },

    /**
     *
     */
    start: function start(){
        if( !this._recognition || this._recognizing ){
            return;
        }

        this._recognition.start();
    },

    /**
     *
     */
    stop: function(){
        if( !this._recognition || !this._recognizing ){
            return;
        }

        this._recognizing = false;

        this._recognition.stop();

    },

    /**
     *
     * @param content
     */
    translate: function(words){
        if( words ){
            this._currentText = words;
            this.onResult(this._currentText);
            this._translate();

        }
    },

    /**
     *
     */
    clear: function(){
      this._currentText = "";
      this._currentTranslatedText = "";
    },

    setSourceLanguage: function(lang){
      this._source = lang || this._source || this._defaultSource;
    },

    setTargetLanguage: function(lang){
      this._target = lang || this._target || this._defaultTarget;
    },

    /**
     *
     */
    onReady: $.noop,

    /**
     *
     */
    onNotSupported: $.noop,

    /**
     *
     */
    onResult: $.noop,

    /**
     *
     */
    onTranslated: $.noop,

    /**
     *
     */
    onSpeechReady: $.noop,

    /**
     *
     */
    onStart: $.noop,

    /**
     *
     */
    onStop: $.noop,

    /**
     *
     */
    onError: $.noop,

    /**
     *
     */
    onEnd: $.noop
});