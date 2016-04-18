/*
	Keyboard
	Keyboard class
	By Luke Nickerson, 2016
*/
(function(){
	var Keyboard = function(){
		this.keyDownActions = {};
		this.keyUpActions = {};
		this._keyCodeMap = {
			"9":	"TAB",

			"13":	"ENTER",

			"27":	"ESC",

			"32":	"SPACE",

			"37": 	"LEFT",
			"38":	"UP",
			"39":	"RIGHT",
			"40":	"DOWN",

			"48":	"0",
			"49":	"1",
			"50":	"2",
			"51":	"3",
			"52":	"4",
			"53":	"5",
			"54":	"6",
			"55":	"7",
			"56":	"8",
			"57":	"9",

			"65":	"a",

			"68":	"d",
			"69":	"e",

			"81":	"q",

			"83":	"s",

			"87":	"w",
			"88":	"x",

			"90":	"z",

			"112":	"F1",
			"113":	"F2",
			"114":	"F3",
			"115":	"F4",
			"116":	"F5",
			"117":	"F6",
			"118":	"F7",
			"119":	"F8",
			"120":	"F9",
			"121":	"F10",
			"122":	"F11",
			"123":	"F12",
			
		};
	};

	Keyboard.prototype.getKeyFromKeyCode = function (keyCode) {
		return this._keyCodeMap[keyCode];
	};

	Keyboard.prototype._isFunctionKey = function (keyCode) {
		keyCode = parseInt(keyCode);
		return (keyCode >= 112 && keyCode <= 123) ? true : false;
	}

	Keyboard.prototype.tap = function (key) {
		this._fireAction(key, this.keyDownActions);
		this._fireAction(key, this.keyUpActions);
	};

	Keyboard.prototype._fireAction = function (key, keyActions) {
		var action = this.keyDownActions[key];
		if (typeof action === 'function') {
			action(key);
			return true;
		} else {
			console.warn("KB action not found", key);
			return false;
		}
	};	

	Keyboard.prototype.setup = function (options) {
		var kb = this;
		options = options || {};
		options.keyDownActions = options.keyDownActions || {};
		if (options.wasd) {
			if (typeof options.keyDownActions["w"] !== 'function') {
				options.keyDownActions["w"] = options.keyDownActions["UP"];
			}
			if (typeof options.keyDownActions["a"] !== 'function') {
				options.keyDownActions["a"] = options.keyDownActions["LEFT"];
			}
			if (typeof options.keyDownActions["s"] !== 'function') {
				options.keyDownActions["s"] = options.keyDownActions["DOWN"];
			}
			if (typeof options.keyDownActions["d"] !== 'function') {
				options.keyDownActions["d"] = options.keyDownActions["RIGHT"];
			}
		}
		kb.keyDownActions = options.keyDownActions;
		//console.log(kb.keyDownActions);
		kb.clear();

		$(document).on('keydown', function(e){
			kb._fireAction(kb.getKeyFromKeyCode(e.which), options.keyDownActions);
            //console.log(e.which);
            if (!kb._isFunctionKey(e.which)) {
				e.preventDefault();
			}
        }).on('keyup', function(e){
            // ***
        });
        return kb;
	};

	Keyboard.prototype.clear = function () {
		$(document).off('keydown').off('keyup');
	};


	
	if (typeof RocketBoots == "object") {
		RocketBoots.installComponent("keyboard", "Keyboard", Keyboard);
	} else window.Keyboard = Keyboard;
})();