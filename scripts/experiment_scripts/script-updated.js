//---------------
// SCRIPT DETAILS
//---------------
// This task displays a video on each trial and prompts the participant to identify the emotion.
// There are 2 (culture) x 2 (type) x 8 (emotion) = 32 video conditions, with multiple videos in each condition.
// This script will select a subset of videos from each of those conditions (i.e., only 2 from each condition) and present them in a randomized order.
// It also inserts a "break", halfway through the task.


//------------------
// USER REQUIREMENTS
//------------------
// For this script to function correctly as is, you will need to implement the following
// 1) Add a metadata columns to your spreadsheet to contain the different condition names
// - for the way that this script is coded trials of the same condition MUST be consecutive in the spreadsheet
// 2) Assign the name of the display corresponding to the trials that need to be selected from
// 3) Set the number of trials to be selected from each condition

//-------------------
// REQUIRED VARIABLES
//-------------------

// SPREADSHEET COLUMN NAME
// This variable will hold the name of the spreadsheet columns we'll store the trial type in
var typeMetadataSpreadsheetColumnName: string = 'condition';

// DISPLAY NAME
// These variables will indicate the name display which we need to randomise the trials for
var requiredDisplay: string = 'videoDisplay';

// TRIAL STORAGE
// This variable will hold all of the available videos once we've parsed them out of the spreadsheet
var trialSet: string[][] = [];

// TRIAL NUMBER
// This variable indicates the number of trials from each type that should be selected
var typeNumber: number = 1;

// GORILLA KEYS
// This variable will hold the key used to access the modified spreadsheet in the gorilla store
var modifiedSpreadsheetKey: string = 'modified_spreadsheet';

// RANDOMISED RESPONSE BUTTON NAMES
// We also want the buttons to be randomly ordered for each participant.
// This variable contents the names of the columns we need to collect contents from to subsequently shuffle
var _requiredColumns = ["Button1",	"Button2",	"Button3",	"Button4",	"Button5"];

// RANDOMISED RESPONSE BUTTONS
// Embedded data strings
// This is the key where we will store the shuffled content once we have collected and randomised it
var _storedContentKey = 'storedContent';


//-------------------
// START OF SCRIPT
//-------------------

// The preProcessSpreadsheet hook allows us to define functionality that will run before Gorilla has carried out
// any spreadsheet randomisation
gorillaTaskBuilder.preProcessSpreadsheet((spreadsheet: any[]) => {

    // First, check to see if we already have a modifiedSpreadsheet in the store
    // if we do, it means we've done all of the randomisation of content and buttons before (i.e., maybe the participant reloaded the page) and we shouldn't do it again

    var modifiedSpreadsheet: any[] = [];

    modifiedSpreadsheet = gorilla.retrieve(modifiedSpreadsheetKey, [], true);

    if (modifiedSpreadsheet.length > 0) {
        // Immediately return the modified Spreadsheet and don't do any new randomisation
        // Note that this will halt execution of the rest of the script automatically.

        return modifiedSpreadsheet;
    }
    // if there's no spreadsheet in store, continue!

    // RANDOMISE THE STIMULI

    // STAGE 1) Collect all of the trials we need to select from and divide them into their types
    // To do this, we'll create an associative array
    // The key for each element in the array will be the type and the entry will be an array of the trials of that type
    console.log("length of spreadsheet before randomising trials:" , spreadsheet.length)
    for (var i = 0; i < spreadsheet.length; i++) {
        // Check to see if the current row corresponds to the trial type we're targetting
        if (spreadsheet[i].display == requiredDisplay) {
            // First, look at the value of type metadata
            var currentType: string = spreadsheet[i][typeMetadataSpreadsheetColumnName];
            if (trialSet[currentType]) {
                trialSet[currentType].push(spreadsheet[i]);
            } else {
                trialSet[currentType] = [spreadsheet[i]];
            }
        }
    }


    // STAGE 2) Pick out our subset of each type
    // Go through each type in our array, shuffle the trials for that type and then pick out as many as required by our settings
    // Any trials left over will be removed
    for (var typeKey in trialSet) {
        var typeSet: any[] = trialSet[typeKey];
        typeSet = gorilla.shuffle(typeSet);
        var typeSetSubset: any[] = [];
        for (var i = 0; i < typeNumber; i++) {
            typeSetSubset.push(typeSet[i]);
        }

        trialSet[typeKey] = typeSetSubset;
    }

    // STAGE 3) Procedurally build our spreadsheet
    // We need to parse through the spreadsheet, replacing content as we go
    // We'll do this be going through the spreadsheet row by row and first looking at the display name
    // If this doesn't match our required display, we'll just pass it straight through to the modified spreadsheet
    // If it does, we'll then look at the value of the type metadata column
    // We'll then pull out the corresponding trials for that type that we've chosen, adding them to the modified spreadsheet
    // and ignoring any further trials of that type in the existing spreadsheet

    // We will use this to store what the current trial type is that we're handling.  This way, we can make sure we only
    // add the subset of trials once
    // We need to intialise it outside of the for loop, as we want it to track the current trial type once we're inside the for loop
    var currentTrialType: string = '';


    for (var j = 0; i < spreadsheet.length; i++) {

        // Defining this variable will just make some of the code shorter (rather than writing spreadsheet[i] all the time)
        var currentRow: any = spreadsheet[i];

        // Check to see if the current row corresponds to one of our target trials
        if (currentRow.display == requiredDisplay) {
            // If the currentTrialType matches the type for this row, then we just need to move one
            if (currentRow[typeMetadataSpreadsheetColumnName] == currentTrialType) {
                continue;
            } else { // otherwise, add in all the trials of that type
                currentTrialType = currentRow[typeMetadataSpreadsheetColumnName];
                var trialTypeArray: any[] = trialSet[currentTrialType];
                for (var j = 0; j < trialTypeArray.length; j++) {
                    modifiedSpreadsheet.push(trialTypeArray[j]);
                }
            }
        } else {
            // Just push it to the array
            modifiedSpreadsheet.push(currentRow);
        }
    }
    console.log("length of modified spreadsheet:", modifiedSpreadsheet.length)

    function shuffle(array) {
        let currentIndex = array.length,
            randomIndex;

        // While there remain elements to shuffle...
        while (currentIndex != 0) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]
            ];
        }

        return array;
    }

    // We then shuffle the modified spreadsheet so that the trials are mixed

    shuffle(modifiedSpreadsheet);
    console.log("length of modified spreadsheet:", modifiedSpreadsheet.length)


    // However, this results in the "break" trial also being randomised, whereas we want it to be in the middle.
    // To solve this, we get the current index of the "break" trial

    index = modifiedSpreadsheet.findIndex(x => x.display === "break");
    console.log("current index of 'break' before moving it:", index);

    // We then insert this trial at a specific index (i.e., the 16th position)
    function moveElement(array, initialIndex, finalIndex) {
        array.splice(finalIndex, 0, array.splice(initialIndex, 1)[0])
        return array;
    };

    moveElement(modifiedSpreadsheet, index, 30);

    console.log("modifiedSpreadsheet:", modifiedSpreadsheet);
    console.log("length of modifiedSpreadsheet:", modifiedSpreadsheet.length);


    // RANDOMISE THE BUTTONS:
    // STAGE 1) Collect the contents to be shuffled
    // First, check the store to see if we already already carried out this shuffling and stored the result
    // This can occur if we've already run this logic once before and the participant has subsequently refreshed the page or reentered the task having stopped partway through
    // We need to check in the experiment (global) store (third variable set to true)

    var modifiedSpreadsheet2: any[] = [];

    var shuffledContent = gorilla.retrieve(_storedContentKey, [], true);
    console.log("initial shuffled content:", shuffledContent)

    if (shuffledContent.length == 0) { // shuffledContent is null, we need to collect the contents from the spreadsheet and then shuffle it
        // variable for storing out collected content
        var collectedContent = [];
        // Go through the spreadsheet and find the first row that matchs our requiredDisplay
        // Then collect the contents to be shuffled from the designated columns in that row
        // We only want to do that once, so we'll create a variable that will indicate whether or not we've collected the information
        var haveCollected: boolean = false;
        for (var i = 0; i < modifiedSpreadsheet.length; i++) {
            if (!haveCollected) { // if we haven't collected the contents yet, proceed
                if (modifiedSpreadsheet[i].display == requiredDisplay) {
                    // Collect the contents to be shuffled from our spreadsheet using the column names we provided in _requiredColumns
                    for (var j = 0; j < _requiredColumns.length; j++) {
                        console.log("required column [j]:" , _requiredColumns[j]);
                        console.log("i:",i);
                        collectedContent.push(modifiedSpreadsheet[i][_requiredColumns[j]]);
                        console.log("collectedContent:",collectedContent)
                    };

                    // indicate that we've now collected the contents so we won't go through any more of the spreadsheet
                    haveCollected = true;
                }
            } else {
                // if we've already collected the contents we need, break out of the for loop
                break;
            }
        }

        // now we need to shuffle the required contents
        // First, create a random seed from the Date
        var randomSeed = Date.now();
        // Next, use gorilla.shuffle to shuffle the contents order
        shuffledContent = gorilla.shuffle(collectedContent, randomSeed);
        // Send the shuffled content to the store for later collection (if necessary)
        gorilla.store(_storedContentKey, shuffledContent, true);
        console.log("shuffled content:",shuffledContent);
    };

    // STAGE 2) Populate the modified spreadsheet
    // Either we already had some shuffled content in the store, or we have just collected it and shuffled it
    // Regardless, we are now ready to alter the contents of our spreadsheet

    for (var i = 0; i < modifiedSpreadsheet.length; i++) {
        if (modifiedSpreadsheet[i].display == requiredDisplay) {
            // Collect the contents to be shuffled from our spreadsheet using the column names we provided in _requiredColumns
            for (var j = 0; j < _requiredColumns.length; j++) {
                modifiedSpreadsheet[i][_requiredColumns[j]] = shuffledContent[j];
            }
            modifiedSpreadsheet2.push(modifiedSpreadsheet[i]);
        } else {
            modifiedSpreadsheet2.push(modifiedSpreadsheet[i]);
        }
    }


    // Return the modified spreadsheet
    return modifiedSpreadsheet2;

    // Store the contents of our modified spreadsheet in gorilla
    gorilla.store(modifiedSpreadsheetKey, modifiedSpreadsheet2, true);

});
