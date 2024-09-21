// Get gamemode JSON file and extend elements of file
let gamemodeJSON = '';
let _total_questions_loaded = 0;
async function gamemodeObject(gamemode_name, gamemode_type='base'){
    let gamemode_url_dir;

    // Where is our JSON file located? Let's figure out where to look for the gamemode based on the type passed thru the function call.
    // Base-game gamemode. set directory to our internal folder.
    if(gamemode_type == 'base') gamemode_url_dir = 'gamemode/';
    // Workshop gamemode? Let's try and find that directory!
    else if(gamemode_url_type == 'workshop') gamemode_url_dir = 'unsupported';
    // Someone trying to make it custom? Look for install directory -> custom.
    else if(gamemode_url_type == 'custom') gamemode_url_dir = 'unsupported';
    // Fallback to base
    else gamemode_url_dir = 'gamemode/';
    // Summon the JSON file from our compiled details.
    await fetchJSONData(gamemode_url_dir, gamemode_name); 

    // Pull teeth from JSON file. Time to make our details! Supports format 2+ only.
    let gm = new Object;
    gm.image_badge  =   `${gamemode_url_dir.concat(gamemode_name)}/badge.png`;  // Landscape image for this trivia pack.
    gm.image_icon   =   `${gamemode_url_dir.concat(gamemode_name)}/icon.png`;   // Square image for this trivia pack.
    gm.name         =   gamemodeJSON.details.generated.title;                      // Title. Public-facing name of this trivia pack.
    gm.namespace    =   gamemodeJSON.details.generated.namespace;                 // NAMEPSACE. technical. Used throughout code to save data, find data, etc.
    gm.description  =   gamemodeJSON.details.generated.description;                // Description of trivia pack. tell the user a little about what they are playing.
    gm.tags         =   gamemodeJSON.details.generated.displayTags;                // Unused. Tags to easily find trivia pack
    gm.author       =   gamemodeJSON.details.generated.author;                     // Single-line author. Shown on trivia pack info
    gm.created      =   gamemodeJSON.details.generated.createDate[0];              // Create date, set in array of 3 entries representing day, month, year
    gm.updated      =   gamemodeJSON.details.generated.modifiedDate[0];            // Last modified date, set in array of 3 entries representing day, month, year
    gm.category     =   gamemodeJSON.details.generated.category;                   // Unused. Self-set category of trivia pack.
    gm.difficulty   =   gamemodeJSON.details.generated.difficulty;                // Unused. Self-set difficulty of trivia pack.
    gm.music        =   gamemodeJSON.details.generated.music_name;                // music name, minus the .mp3
    gm.music_type   =   gamemodeJSON.details.generated.music_type;                // DYNAMIC or SIMPLE. DYNAMIC has a secondary music file prefixed with _end
    gm.version      =   gamemodeJSON.details.generated.version;                   // Version of trivia pack. can be incremented. common format of X.X.X
    gm.qcount       =   gamemodeJSON.gameplay.questions.length;                 // Total number of questions in trivia pack.
    gm.credit_list  =   gamemodeJSON.details.credit.team;                     // List of credits detailing users, links, and other things
    gm.format       =   gamemodeJSON.details.generated.format;                    // Which file version are we using? Currently can be none, 1, 2, 3, or 4.
    gm.feature      =   new Object;
    gm.ql = [];     // ALL QUESTION STATEMENTS
    gm.qa = [];     // ALL QUESTION CORRECT ANSWERS
    gm.qs = [];     // ALL QUESTION SOURCES
    gm.qt1= [];     // TIPS, INCORRECT
    gm.qt2= [];     // TIPS, CORRECT
    gm.qf = [];     // DOES OUR QUESTION HAVE A SPECIAL FEATURE?
    gm.qfo = [];    // Special feature object array

    gm.source_list  =   gamemodeJSON.details.generated.sources;             // List of sources utilized in creating the trivia pack.
    gm.skin_name    =   gamemodeJSON.details.generated.skin_name;           // name of CSS file in the skins folder.
    gm.skin_type    =   gamemodeJSON.details.generated.skin_type;           // Simple or Dynamic - does our skin have animations?
    gm.skin_script  =   gamemodeJSON.details.generated.script_file;         // Do we have custom events to source for our trivia sessions?
    gm.feature.question_tips   = true;                                      // Tell whoever wants to know that we can do tips
    gm.feature.source_list     = true;                                      // Do we have a big list of sources to display?
    gm.feature.custom_skin     = true;                                      // We don't use noire!

    if(gm.format >= 4){
        gm.feature.icon         = Boolean(gamemodeJSON.details.generated.hasIcon);
        gm.feature.picture      = Boolean(gamemodeJSON.details.generated.hasPic);
        gm.feature.background   = Boolean(gamemodeJSON.details.generated.hasBg);
    }
    // Compatibility
    else{
        gm.feature.icon         = true;
        gm.feature.picture      = true;
        gm.feature.background   = false;
    }

    if(gm.skin_script !== null || gm.skin_script !== '' || gm.skin_script != false) gm.feature.skin_script = false;  
    else gm.feature.skin_script = true;                                 // Do we have a script to load?   

    // Get all question statements.
    gamemodeJSON.gameplay.questions.forEach(e => {
        gm.ql.push(e.statement);
        gm.qa.push(e.answer_correct);
        gm.qs.push(e.source);
        gm.qt1.push(e.tip_incorrect);
        gm.qt2.push(e.tip_correct);

        // I don't want to expose too much in these vars, so let's keep this feature stuff simple.
        if(e.type == 'picture-choice' || e.type == 'picture-boolean') gm.qf.push('picture');
        else if(e.type == 'choice' || e.type == 'boolean') gm.qf.push('none')
        else gm.qf.push('error');

        // Picture has some juicy deets we want to push.
        if(e.type == 'picture-choice' || e.type == 'picture-boolean'){
            let picture_object = {
                image:`${gm.namespace}/${e.image.src}`,
                image_bg:e.image.background,
                source:e.image.source,
                attrib:e.image.attribution
            };

            gm.qfo.push(picture_object);
        }
        // There's nothing special to push
        else{
            gm.qfo.push(null);
        }
    });

    // Do we have localstorage variables for our gamemode? If not, make them.
    if(!localStorage.getItem(`gms_${gm.namespace }`)){
        let base_stats = [0,0,0,0,0,0,0,0]; // Plays, HighScore, TotalScore, TotalAnswered, TotalCorrect, Reserved, Reserved, Reserved
        localStorage.setItem(`gms_${gm.namespace}`,base_stats);
    }

    // Do we have localstorage variables for our gamemode questions? If not, make them.
    if(!localStorage.getItem(`gmqs_${gm.namespace }`)){
        let base_questions = [];
        var i = 0;
        // set base array length to length of questions from gamemode
        while (i < gm.qcount) {
            base_questions.push({views:0, correct:0, incorrect:0, source_click:false}); // Push object as of 9/12/24.
            i++;
        }
        localStorage.setItem(`gmqs_${gm.namespace}`,JSON.stringify(base_questions));
    }

    // We've upgraded our gmqs array on 9/12/24. If localstorage is an array without objects, we need to update.
    let ls_gmqs;
    try{
        ls_gmqs = JSON.parse(localStorage.getItem(`gmqs_${gm.namespace}`));
        let dummy_var = ls_gmqs[0].views;
    }

    catch{
            ls_gmqs = JSON.parse( '[' + localStorage.getItem(`gmqs_${gm.namespace}`) + ']' ); // Convert old array

            // Array does not have objects. Upgrade plz.
            let new_gm_questions_array = [];
            ls_gmqs.forEach(status => {
                // Status object will log total views, correct answers, and incorrect attempts. Also checks if source has been clicked for question..
                let status_object = {
                    views:0,
                    correct:0,
                    incorrect:0,
                    source_click:false
                }
    
                // Never viewed, never answered
                if(status == 0){}
    
                // Viewed, incorrect
                else if (status == 1){
                    status_object.views = 1;
                    status_object.incorrect = 1;
                }
    
                // Viewed, correct
                else if(status == 2){
                    status_object.views = 1;
                    status_object.correct = 1;
                }
    
                // Push new question object to our new array.
                new_gm_questions_array.push(status_object);
            });
    
            // All questions have been converted with objects. Replace our old array with the new one.
            localStorage.setItem(`gmqs_${gm.namespace}`,JSON.stringify(new_gm_questions_array));
    }
    


    // Shit, someone updated the list!
    if(JSON.parse(localStorage.getItem(`gmqs_${gm.namespace }`)).length < gm.qcount){
        console.log(`Warning: Gamemode ${gm.namespace} has been updated. Expanded savedata array to match new length.`);
        console.log('Current Length: ' + localStorage.getItem(`gmqs_${gm.namespace }`).length + ' Expected Length:' + gm.qcount);
        var i = 0;
        let = registered_questions = JSON.parse(localStorage.getItem(`gmqs_${gm.namespace }`));
        while(i < gm.qcount) {
            if(registered_questions[i] == undefined || registered_questions[i] == '' || registered_questions[i] == null ||registered_questions[i] == NaN){
                registered_questions[i] = {views:0, correct:0, incorrect:0, source_click:false};
            }
            i++;
        }

        // Fix our array...
        localStorage.setItem(`gmqs_${gm.namespace}`,JSON.stringify(registered_questions));

    }

    /*
    Remove check if length of savedata is more than trivia question length. This is important to remove for now...
    Is it really this easy to 'fix'???
    
    if(localStorage.getItem(`gmqs_${gm.namespace }`).split(',').length > gm.qcount){
        console.log(`Error: Unable to load ${gm.namespace}. Question count lesser than savedata. Found ${gm.qcount}, expected ${localStorage.getItem(`gmqs_${gm.namespace }`).split(',').length}`);
        return null;
    }
    */
    // clean
    gamemodeJSON = '';

    // Submit new info to our global gamemode object.
    window[`_gamemode_info_` + gm.namespace] = new Object;
    window[`_gamemode_info_` + gm.namespace] = gm;
    return gm; // Return our pretty new info.
}

// Include this as we'll need it to pull any gamemode info anyways. Would not make sense to add it here.
async function fetchJSONData(path, file) {
    await fetch(`${path.concat(file)}/data.json`)
        .then((res) => {
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            return res.json();
        })
        .then((data) => gamemodeJSON = data)
        .catch((error) => console.error("Unable to fetch game data. ", error));
}