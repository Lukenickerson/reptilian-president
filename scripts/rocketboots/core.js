var RocketBoots = {

	isInitialized : false,
	readyFunctions : [],
	components : {},
	
//==== Classes

	Component : function(c){
		this.fileName = c;
		this.name = null;
		this.isLoaded = false;
		this.isInstalled = false;	
	},
	
//==== General Functions

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

//==== Component Functions

	hasComponent: function (componentClass) {
		if (typeof RocketBoots[componentClass] == "function") {
			return true;
		} else {
			return false;
		}
	},	
	installComponent : function(fileName, componentClassName, componentClass, requirements, callback){
		var o = this;
		if (!o.areComponentsLoaded(requirements)) {
			console.warn("Component(s) missing", requirements);
			var compTimer = window.setTimeout(function(){ 
				o.installComponent(fileName, componentClassName, componentClass, requirements, callback);
			}, 10000);
		} else {
			if (typeof o.components[fileName] == "undefined") {
				o.components[fileName] = new o.Component(fileName);
			}
			if (typeof callback === "function") {
				callback();
			}
			o.components[fileName].name = componentClassName;
			o.components[fileName].isInstalled = true;
			o[componentClassName] = componentClass;
		}
		return this;
	},
	getComponentByName: function (componentName) {
		var o = this;
		for (var cKey in o.components) {
			if (o.components[cKey].name == componentName) {
				return o.components[cKey];
			}
		};
		return;
	},
	areComponentsLoaded: function (componentNameArr) {
		var o = this, areLoaded = true;
		if (typeof componentNameArr !== 'object') {
			return areLoaded;
		}
		for (var i = 0; i < componentNameArr.length; i++) {
			if (!o.isComponentInstalled(componentNameArr[i])) { areLoaded = false; }
		};
		return areLoaded;
	},
	isComponentInstalled: function (componentName) {
		var comp = this.getComponentByName(componentName);
		return (comp && comp.isInstalled);
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

//==== Ready and Init Functions

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
		if (typeof attempt == "undefined") {
			attempt = 0;
		}
		attempt++;
		//console.log("RB Init", attempt);
		if (attempt > 200) {
			console.error("Could not initialize RocketBoots");
			return false;
		}

		// Load default components
		this.loadComponents(["Game"]);

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
				}, ((attempt - 1) * 10));
				return false;
			}
		}
		return false;
	}

};

RocketBoots.init();
