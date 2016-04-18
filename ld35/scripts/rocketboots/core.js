var RocketBoots = {
	isInitialized : false,
	readyFunctions : [],
	components : {},
	games: [],
	
	//==== Classes
	Component : function(c){
		this.fileName = c;
		this.name = null;
		this.isLoaded = false;
		this.isInstalled = false;	
	},
	Game : function(options){
		if (typeof options === 'string') {
			options = {name: options};
		} else {
			options = options || {};
		}
		this.name = options.name || "Game made with RocketBoots";
		
		this.init(options);
	},
	
	//==== Functions
	makeGame : function (options) {
		var g = new this.Game(options);
		this.games.push(g);
		return g;
	},
	hasComponent: function (componentClass) {
		if (typeof RocketBoots[componentClass] == "function") {
			return true;
		} else {
			return false;
		}
	},
	loadScript : function(url, callback){
		//console.log("Loading script", url);
		// http://stackoverflow.com/a/7719185/1766230
		var s = document.createElement('script');
		var r = false;
		var t;
		s.type = 'text/javascript';
		s.src = "scripts/" + url + ".js";
		s.className = "rocketboots-script";
		s.onload = s.onreadystatechange = function() {
			//console.log( this.readyState ); //uncomment this line to see which ready states are called.
			if ( !r && (!this.readyState || this.readyState == 'complete') )
			{
				r = true;
				if (typeof callback == "function") callback();
			}
		};
		t = document.getElementsByTagName('script')[0];
		t.parentNode.insertBefore(s, t);
		return this;
	},
	installComponent : function(fileName, componentClassName, componentClass){
		var o = this;
		if (typeof o.components[fileName] == "undefined") {
			o.components[fileName] = new o.Component(fileName);
		}
		o.components[fileName].name = componentClassName;
		o.components[fileName].isInstalled = true;
		o[componentClassName] = componentClass;
		return this;
	},
	loadComponents : function(arr){
		var o = this;
		var componentName;

		for (var i = 0, al = arr.length; i < al; i++){
			componentName = arr[i];
			if (typeof o.components[componentName] == "undefined") {
				o.components[componentName] = new o.Component(componentName);
				o.loadScript("rocketboots/" + arr[i], function(){
					o.components[componentName].isLoaded = true;
				});
			} else {
				//console.error("Component already exists", componentName);
			}
		}
		return this;
	},
	areAllComponentsLoaded : function(){
		var o = this;
		var componentCount = 0,
			componentsInstalledCount = 0;
		for (var c in o.components) {
			// if (o.components.hasOwnProperty(c)) {  do stuff	}
			componentCount++;
			if (o.components[c].isInstalled) componentsInstalledCount++;
		}
		console.log("RB Components Installed: " + componentsInstalledCount + "/" + componentCount);
		return (componentsInstalledCount >= componentCount);
	},
	ready : function(callback){
		if (typeof callback == "function") {
			if (this.isInitialized) {
				callback(this);
			} else {
				this.readyFunctions.push(callback);
			}
		} else {
			console.error("Ready argument (callback) not a function");
		}
		return this;
	},
	runReadyFunctions : function(){
		var o = this;
		// Loop over readyFunctions and run each one
		var f, fn;
		for (var i = 0; o.readyFunctions.length > 0; i++){
			f = o.readyFunctions.splice(i,1);
			fn = f[0];
			fn(o);
		}
		return this;	
	},
	init : function(attempt){
		var o = this;
		if (typeof attempt == "undefined") attempt = 0;
		attempt++;
		//console.log("RB Init", attempt);
		if (attempt > 20) {
			console.error("Could not initialize RocketBoots");
			return false;
		}

		if (typeof $ == "undefined") {
			if (attempt == 1) {
				// Create "rb" alias
				if (typeof window.rb != "undefined") {
					o._rb = window.rb;
				}
				window.rb = o;			
				// Load jQuery
				o.loadScript("libs/jquery-2.1.1.min", function(){
					o.init(attempt);
				});
			} else {
				o.init(attempt);
			}
		} else {	// jQuery is loaded, so continue with initialization
		
			if (o.areAllComponentsLoaded()) {
				console.log("RB Init - All components are loaded. Running Ready functions.");
				o.runReadyFunctions();
				o.isInitialized = true;
				return true;
			} else {
				// Try again
				var initTimer = window.setTimeout(function(){ 
					o.init(attempt);
				}, 10);
				return false;
			}
		}
		return false;
	}

};

//======================================================= Game Functions ======

RocketBoots.Game.prototype.init = function(options){
	//console.log("Initializing Game");
	var g = this;
	
	g._addDefaultComponents(options);
	g._addStages(options.stages);
	g._addDefaultStates();
	return this;
}

RocketBoots.Game.prototype._addDefaultComponents = function(options){
	this._addComponent("sounds", "SoundCannon")
		._addComponent("images", "ImageOverseer")
		._addComponent("state", "StateMachine")	
		._addComponent("looper", "Looper")
		//._addComponent("timeCount", "TimeCount")
		//._addComponent("incrementer", "Incrementer")
		._addComponent("dice", "Dice")
		._addComponent("keyboard", "Keyboard")
		._addComponent("physics", "Physics")
		._addComponent("entity", "Entity")
		._addComponent("world", "World", options.world);
		// *** stage?
	return this;
};

RocketBoots.Game.prototype._addComponent = function(gameCompName, componentClass, arg){
	if (RocketBoots.hasComponent(componentClass)) {
		console.log("RB adding component", gameCompName, "to the game using class", componentClass, "and arguments:", arg);
		this[gameCompName] = new RocketBoots[componentClass](arg);
	} else {
		//console.warn(componentClass, "not found as a RocketBoots component");
	}
	return this;
};

RocketBoots.Game.prototype._addDefaultStates = function () {
	var g = this;
	// Setup default states (mostly menu controls)
	var startMenu = function(){ 
		$('header, footer').show();
	};
	var endMenu = function(){
		$('header, footer').hide();
	}
	g.state.addStates({
		"boot": { 		autoView: true, start: startMenu, end: endMenu },
		"preload": { 	autoView: true, start: startMenu, end: endMenu },
		"mainmenu": { 	autoView: true, start: startMenu, end: endMenu },
		"new": { 		autoView: true, start: startMenu, end: endMenu },
		"save": { 		autoView: true, start: startMenu, end: endMenu },
		"load": { 		autoView: true, start: startMenu, end: endMenu },
		"help": { 		autoView: true, start: startMenu, end: endMenu },
		"settings": { 	autoView: true, start: startMenu, end: endMenu },
		"credits": { 	autoView: true, start: startMenu, end: endMenu },
		"share": { 		autoView: true, start: startMenu, end: endMenu },
		"game": {}
	});
	/*
	g.state.add("game",{
		start : function(){
			$('header, footer').hide();
			this.$view.show();
		}, end : function(){
			$('header, footer').show();
			this.$view.hide();
		}
	});
	*/
	g.state.start("boot");
	//g.state.get("game").$view.show();

	// Setup state transition clicks
	$('.goto').click(function(){
		var stateName = $(this).data("state");
		g.state.transition(stateName);
	});
	return g;
};


RocketBoots.Game.prototype._addStages = function (stageData) {
	var g = this;
	g.stages = g.stages || [];
	stageData = stageData || [];
	// If the stage data exists and the element exists, then convert into real stages...
	if (typeof RocketBoots.Stage === "function" && stageData.length > 0) {
		$.each(stageData, function(i, iStageData){
			if ($('#' + iStageData.id).length > 0) {
				g.stages[i] = new RocketBoots.Stage(iStageData.id, iStageData.size);
			}
		});
		g.stage = g.stages[0];
	}
	return g;
};




RocketBoots.Game.prototype.cloneDataObject = function (o) {
	return JSON.parse(JSON.stringify(o));
}

RocketBoots.init();
