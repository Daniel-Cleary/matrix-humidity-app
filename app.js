// app code goes here
// matrix.init()....
//
// have fun

/////////////
// Variables
/////////////

//Options is defined for the Matrix input Function
//Percent is defined to also be used in the matrix input function and in other important parts
var options = {
	refresh: 50, //ms
	timeout: 15000 //ms
};
var percent = 0.5;

//Default values so doesn't initiate as undefined
var hRed = 0;
var hGreen = 0;
var hBlue = 0;
var lRed = 0;
var lGreen = 0;
var lBlue = 0;

//Preemtively setting up the range variables
//And also the current Humidity
//Sets the initial state to true as default
var hRangeLow;
var hRangeHigh;
var rCurrentHumidity = -1;
var initialState = true;

///////////////////
// SLIDERS
///////////////////

	matrix.on('LowRed', function(p) {
			lRed = p.value;
		});
		
		matrix.on('LowGreen', function(p) {
			lGreen = p.value;
		});
		
		matrix.on('LowBlue', function(p) {
			lBlue = p.value;
		});
		
		matrix.on('HighRed', function(p) {
			hRed = p.value;
		});
		
		matrix.on('HighGreen', function(p) {
			hGreen = p.value;
		});
		
		matrix.on('HighBlue', function(p) {
			hBlue = p.value;
		});

///////////////////
// FUNCTIONS
///////////////////

//Function that causes color to transition from one color to another color
function colorShift(initialColor, endColor) {
	//Change later to work with Integers and not floats as a side note
	var finalColor = Math.floor(initialColor + (endColor - initialColor) * (1 - percent));
	return finalColor;
}

//Function that rounds numbers to the lowest hundreth
function roundHundreth(x){
	var cheese =  Math.floor(x*100)/100;
    return cheese;
    
}


///////////////////
// ACTION ZONE
///////////////////

//Converts the humidity into percentage, which then is placed into a function that determines the RGB values based on how high the relative humidity is.
//This code will loop every ms
matrix.sensor('humidity', options).then(function(data) {
	
	matrix.type('monitor').send({
			'humidity': Math.floor(data.value)
		});
	
	//Regular State Code
	//Will run during normal use
	if(!initialState){
		
		
		rCurrentHumidity = roundHundreth(data.value);
		
		//Define new range values if necessary
		if(rCurrentHumidity > hRangeHigh){
		    hRangeHigh = rCurrentHumidity;
		} else if(rCurrentHumidity < hRangeLow){
		    hRangeLow = rCurrentHumidity;
		}
		
		percent = (rCurrentHumidity - hRangeLow)/(hRangeHigh - hRangeLow);
	    matrix.led({
			start: 0,
			arc: 360,
			color: `rgb( ${colorShift(hRed, lRed)} , ${colorShift(hGreen, lGreen)} , ${colorShift(hBlue, lBlue)})`
		}).render();
		
		
		
	}
	//Regular state code end
	
	//Intial state code + Defining new ranges
	if(initialState){
		
	    //////////////////////
	    //INITIAL STATE START
	    //////////////////////
	    
	    //Detectes and runs the initial state on the 1st loop
	    if(rCurrentHumidity === -1){
	        console.log("INITIAL STATE 1 ENTERED");
	    	//Change color
	        matrix.led({
		    	start: 0,
		    	arc: 360,
		    	color: `rgb( ${(hRed + lRed)/2} , ${(hGreen + lGreen)/2} , ${(hBlue + lBlue)/2})`
	        }).render();
	        //Store value of current humidity
	        rCurrentHumidity = roundHundreth(data.value);
	    } else { //This is executed during the second loop or other non-1st loops of the program when the range hasn't been yet established
	    	//Set variable "B" = "A"
	    	console.log("INITIAL STATE 2+N ENTERED");
	    	var tempHumidity = rCurrentHumidity;
	    	//Store value of current humidity rounded to nearest hundreth in variable "A"
	    	rCurrentHumidity = roundHundreth(data.value);
	    	
	    	//This if else statement sets the range
	    	if(rCurrentHumidity > tempHumidity){
	    		hRangeHigh = roundHundreth(rCurrentHumidity);
	    		hRangeLow = roundHundreth(tempHumidity);
	    		//The range has been established and the main part of the program may officially begin
	    		initialState = false;
	    		//Initial State is deactivated
	    		console.log("INITIAL STATE IS DEACTIVATED");
	    	} else if(rCurrentHumidity < tempHumidity){
	    		hRangeHigh = roundHundreth(tempHumidity);
	    		hRangeLow = roundHundreth(rCurrentHumidity);
	    		//The range has been established and the main part of the program may officially begin
	    		initialState = false;
	    		//Initial State is deactivated
	    		console.log("INITIAL STATE IS DEACTIVATED");
	    	} else {
	    		//In the rare case that they happen to equal to each other:
	    		//do nothing and let the program loop
	    	}
	    	
	    }
	}
	    ////////////////////
	    //INITIAL STATE END
	    ////////////////////
	
	console.log('humidity: >>>>>>', data);
	console.log("EVERLOOP COLOR:" + colorShift(hRed, lRed) + ", " + colorShift(hGreen, lGreen) + ", " + colorShift(hBlue, lBlue) + "" );
	console.log(percent);
	console.log("High Range:" + hRangeHigh);
	console.log("Low Range:" + hRangeLow);
	console.log("Current Humidity: " + rCurrentHumidity);
	console.log("Function Section 2: " + (rCurrentHumidity - hRangeLow));
  console.log("Function Section 3: " + (hRangeHigh - hRangeLow));
});

	