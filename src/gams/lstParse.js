    /*************************************************************
     * Method: lstParse
     * Scope: Public:
     * Agruments: listingFile: The GAMS listingFile file to interpreted 
     			  model: The model we want solver to operate on
     * Purpose: Convert the results of a GAMS CPLEX solve to a 
     * 			friendly JSON similar to the one generated by
     *			the jsLPsolver
     **************************************************************/
	// Check model status, and only proceed if status code is in modelStatus-Array
	function lstParse(listing, model) {
		//console.log(listing);
		var listingFile = listing.results,
			modelStatus = (function () {
				var start = listingFile.search('MODEL STATUS') + 18,
					end = start + 2,
					modelStatusString = listingFile.slice(start, end);
					
						return parseFloat(modelStatusString);
			})(),
			statusCodes = [1,2,8,9,15,16,17];

		if (statusCodes.indexOf(modelStatus) !== -1) {
			// Read objective value
			var objectiveValue = (function () {
				var start = listingFile.search('OBJECTIVE VALUE') + 15,
					end = start + listingFile.slice(start).search('\n'),
					objectiveValueString = listingFile.slice(start, end);
						return parseFloat(objectiveValueString);
				})(),
				resultObject = {};

			// Loop over variables
			for (var i = 0; i < Object.keys(model.variables).length; i++) {
				var variableName = Object.keys(model.variables)[i],
					start = listingFile.search(variableName.slice(0,9)) + 19,
					end = start + 12,
					variableValue,
					variableValueString = listingFile.slice(start, end);
					if (!isNaN(variableValueString)) {
						variableValue = parseFloat(variableValueString);
					} else {
						variableValue = 0;
					}

				resultObject[variableName] = variableValue;
			};

			resultObject.feasible = true;
			resultObject.bounded = true;
			resultObject.result = objectiveValue;

				return resultObject;

		} else {
			var failureCodes = [1, "Optimal", 2, "Locally Optimal", 3, "Unbounded", 4, "Infeasible", 5, "Locally Infeasible", 6, "Intermediate Infeasible", 7, "Intermediate Nonoptimal", 8, "Integer Solution", 9, "Intermediate Non-Integer", 10, "Integer Infeasible", 11, "Licensing Problems - No Solution", 12, "Error Unknown", 13, "Error No Solution", 14, "No Solution Returned", 15, "Solved Unique", 16, "Solved", 17, "Solved Singular", 18, "Unbounded - No Solution", 19, "Infeasible - No Solution", NaN, "User error, rerun model with log flag"];
			throw new Error("The problem was not solved because of the following GAMS error: " + failureCodes[failureCodes.indexOf(modelStatus) + 1]);
		}
	}