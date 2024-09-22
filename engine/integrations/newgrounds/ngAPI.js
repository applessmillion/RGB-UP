let _ng_user;                       // Basic info on our user once they sign in
let _ng_user_confirmation = false;  // Sign user out? Swap to true if we're going through the loop
let _ng_timeout;                    // timeout
let _ng_notification_queue = [];    // Notification queue, will be added and removed from
let _ng_medals = [];                // Preload medal info
let _ng_boards = [];                // Preload board info
let _ng_savedata;
let _ng_savedata_length = 0;
let _ng_cloud_status = false;
let _ng_session_leaderboard;        // leaderboard info of what we're loading to the results screen.
let _ng_leaderboard_view = false;  
var ngio;
// Load in our newgrounds integration with options.
function ngLoadAPI(bypassConstruction=false){

    ngio = new Newgrounds.io.core(ng_master.appid, ng_master.secret);

    ngio.getValidSession(function() {
        // Bypass construction? Just try to log in and nothing else.
        if (ngio.user && bypassConstruction == true) { ngio.requestLogin(emptyFunction,emptyFunction,emptyFunction); }

        // Try to log in AND change shit with the title screen.
        else if (ngio.user) ngio.requestLogin(ngUserLoginSuccess,ngUserLoginFail,ngUserLoginCancel);
    });

    // load our medals and scoreboards from the server
    ngio.queueComponent("Medal.getList", {}, onMedalsLoaded);
    ngio.queueComponent("ScoreBoard.getBoards", {}, onScoreboardsLoaded);
    ngio.executeQueue();

    // If we aren't gonna build out any elements bypass this.
    if(bypassConstruction == false) ngBuildPopupDisplay();
}
function onMedalsLoaded(result) {
	if (result.success) {
        let dump = result.medals;
        debug = result.medals;
        // Format how we'd want it.....
        dump.forEach(e => {
            let dumppush = {
                'id':e.id,
                'name':e.name,
                'description':e.description,
                'secret':e.secret,
                'icon':e.icon,
                'unlocked':e.unlocked
            };
            _ng_medals.push(dumppush);
        });
    }
}

function onScoreboardsLoaded(result) {
	if (result.success) {
        let dump = result.scoreboards;

        // Format how we'd want it.....
        dump.forEach(e => {
            let dumppush = {
                'id':e.id,
                'name':e.name
            };
            _ng_boards.push(dumppush);
        });
    }
}

// Handle posting to a newgrounds scoreboard. Inputs include scoreboard ID and score.
async function ngPostScore(scoreboard, score){

    // Is our NG user loaded? if not, do journey
	if (!ngio.user) ngUserSessionJourney(); 
    else {
        try{
            ngio.callComponent('ScoreBoard.postScore', {id:Number(scoreboard), value:Number(score)});
            console.log(`Successfully submitted score for scoreboard id ${scoreboard}`);
        }
        catch {
            console.log(`Error submitting scoreboard details for scoreboard id '${scoreboard}'. Attempted to submit '${score}'.`)
        }
	}
}

// Handle posting to a newgrounds scoreboard. Inputs include scoreboard ID and score.
function ngUnlockMedal(medal_id) {

    // Grab our fun information for the medal we're trying to unlock from our special crafted array.
    let medal_info = _ng_medals.filter(medal => { return medal.id === medal_id })

	/* If there is no user attached to our ngio object, it means the user isn't logged in and we can't unlock anything */
	if (!ngio.user) ngUserSessionJourney(); 

    // Not unlocked? Great! show some shit and unlock the medals.
    if(!medal_info[0].unlocked){
	    ngio.callComponent('Medal.unlock', {id:Number(medal_id)});
        ngAddNotification('MEDAL GET! - '+medal_info[0].name,medal_info[0].description,'',medal_info[0].icon,4500);
    }
	return;
}

// Do we need this? maybe. Is it good to have? sure. Test if the game is currently hosted on NG.
function ngWhereAmI(){
    // Get full URL of the page. Since NG presents files in an iframe, this won't be newgrounds.com if being played there.
	let curURL = window.location.href;

    // Test the URL. This is not foolproof - if a URL has either of these phrases in the domain name OR page name, it'll be positive.
	if(curURL.includes("ungrounded") || curURL.includes("newgrounds")) return true;
    else return false;
}

// Thanks official HTML5 API for this cool function!
// Handle user login process with cases.
async function ngUserSessionJourney(bypass=true){
    if (!ngio.user) {
        ngio.requestLogin(ngUserLoginSuccess,ngUserLoginFail,ngUserLoginCancel);
        return
    } 

    // Should we not bypass user signout confirmation?
    if(!bypass){
        if(_ng_user_confirmation == false){
            _ng_user_confirmation = true;
            _ng_timeout = setTimeout(() => {
                ngUserLoginSuccess();
                _ng_user_confirmation = false;
            }, 5000);
        }else{
            ngio.logOut(ngUserLoginCancel);
            clearInterval(_ng_timeout);
            _ng_user = '';
            ngio.getValidSession(function() {});
            return;
        }
    }
}

function emptyFunction(){} // Nah we don't need anything here

function ngUserLoginSuccess(){
    console.log('INFO - Successful sign-on on Newgrounds.');
    
    //document.getElementById('titleButtonNGTxt').style.fontSize = 'clamp(1.3rem, 2.5vh, 30pt)';
    _ng_user = {
        user:ngio.user.name,
        id:ngio.user.id,
        icon:ngio.user.icons.large,
        supporter:ngio.user.supporter
    }
    document.getElementById('buttonNewgroundsToggle').style.backgroundImage = `url('${_ng_user.icon}')`;
    document.getElementById('buttonNewgroundsToggle').style.backgroundSize = `105%`;
}

// NG login failed! Handle that
function ngUserLoginFail(){
    console.log('ERROR - Failure with signing into Newgrounds.');
}

// NG login cancelled! handle that
function ngUserLoginCancel(){
}

// Let's handle a session submit request. Handle all medals and scoreboards.
function ngSubmitAll(){
    // Get medal ID for point badges.
    let badge_25 = ng_badges['got25_'+gamemode_recent.gamemode];
    let badge_50 = ng_badges['got50_'+gamemode_recent.gamemode];
    let badge_90 = ng_badges['got90_'+gamemode_recent.gamemode];
    let badge_secret = ng_badges['secret_'+gamemode_recent.gamemode];

    // Get scoreboard ID for alltime plays and best score.
    let scoreboard_plays = ng_scoreboards['totalplays_'+gamemode_recent.gamemode];
    let scoreboard_correct = ng_scoreboards['totalqcorrect_'+gamemode_recent.gamemode];
    let scoreboard_score = ng_scoreboards['highscore_'+gamemode_recent.gamemode];

    // Handle this one a lil differently, we got 4 medals vs 2.

     // Request medal unlocks.
    if(gamemode_recent.score >= 25 ){ ngUnlockMedal(badge_25); } // 25+ pts
    if(gamemode_recent.score >= 50 ){ ngUnlockMedal(badge_50); } // 50+ pts
    if(gamemode_recent.score >= 90 ){ ngUnlockMedal(badge_90); } // 90+ pts

    // Check if user has guessed over 50 questions correct. Can be duplicates. If so, unlock secret badge.
    let gamemode_stats = JSON.parse("[" + localStorage.getItem(`gms_${gamemode_recent.gamemode}`) + "]");
    if(gamemode_stats[4] >= 50) ngUnlockMedal(badge_secret);

    // Submit scores to scoreboards.
    ngPostScore(scoreboard_plays,1); // Incremental scoreboard. bump by 1
    ngPostScore(scoreboard_correct,gamemode_recent.question_correct.length); // Incremental scoreboard. bump by length of correct array.
    ngPostScore(scoreboard_score,gamemode_recent.score); // Submit high score

    ngLogEvent('Event.logEvent','ScoreSubmissions'); 
}

// Pull scores from an existing scoreboard for a gamemode. Requires a good amount of info to properly pull info.
function ngDisplayGamemodeLeaderboard(gm_name, board_id, limiter=10,time_period='M',soc=false,bodyelement='resultsGamemodeLeaderboard'){
    let gml = ngio.callComponent('ScoreBoard.getScores', {
        id:ng_scoreboards[board_id+gm_name],
        limit:limiter,
        period:time_period,
        social:soc
    },onScoreboardLoaded);

    // Populate our section of the results page with a top X leaderboard
    setTimeout(() => {

        // Is our current number of scores lower than our limiter? Set limited to the min!
        if(_ng_session_leaderboard.scores.length < limiter) limiter = _ng_session_leaderboard.scores.length;


        // Set leaderboard title
        document.getElementById('resultsGamemodeTitle').innerHTML = _ng_session_leaderboard.name;

        // Make a list of supporters in an array.
        const leaderboard = document.createElement("div");
        leaderboard.id = `resultsGamemodeLeaderboardContainer`;


        let leaderboard_text = '';
        let i = 0;
        while(i < limiter){
            const leaderboard_entry = document.createElement("div");
            leaderboard_entry.id = `leaderboardEntry${i+1}`;
            leaderboard_entry.classList.add('leaderboard-item');

            // Set rank/innerHTML of our user ranking starting at 1.
            leaderboard_user_rank = document.createElement("div");
            leaderboard_user_rank.classList.add('leaderboard-item-rank');
            leaderboard_user_rank.innerHTML = `<b>#${i+1}</b>`;

            // Get user's score from object
            leaderboard_user_score = document.createElement("div");
            leaderboard_user_score.classList.add('leaderboard-item-score');
            leaderboard_user_score.innerHTML = `${_ng_session_leaderboard.scores[i].score} Pts.`;

            // Get user image from user object passed to us.
            leaderboard_user_image = document.createElement("div");
            leaderboard_user_image.classList.add('leaderboard-item-icon');
            leaderboard_user_image.style.backgroundImage = `url('${_ng_session_leaderboard.scores[i].user_img}')`;

            // Get user name from user object
            leaderboard_user_name = document.createElement("div");
            leaderboard_user_name.classList.add('leaderboard-item-username');
            leaderboard_user_name.innerHTML = `<a onclick="window.open('https://${_ng_session_leaderboard.scores[i].user}.newgrounds.com?ref=trivialtrivia', '_blank')">${_ng_session_leaderboard.scores[i].user}</a>`;
            
            if(_ng_session_leaderboard.scores[i].supporter_status == true || _ng_session_leaderboard.scores[i].supporter_status == 'true' ) leaderboard_user_image.classList.add('leaderboard-item-icon-supporter');

            i++;

            leaderboard_entry.appendChild(leaderboard_user_rank); // Append line item to leaderboard div we're creating
            leaderboard_entry.appendChild(leaderboard_user_image); // Append line item to leaderboard div we're creating
            leaderboard_entry.appendChild(leaderboard_user_name); // Append line item to leaderboard div we're creating
            leaderboard_entry.appendChild(leaderboard_user_score); // Append line item to leaderboard object.
            leaderboard.appendChild(leaderboard_entry); // Append line item to leaderboard div we're creating
        }
        
        document.getElementById(bodyelement).appendChild(leaderboard); // Append leaderboard to existing html object.
    }, 1750);
}

// We have scores! Let's handle them here.
function onScoreboardLoaded(result){
    if(result.success) console.log('INFO: Successful load of scoreboard id '+result.scoreboard.id+' from Newgrounds!');
    else console.log('ERROR: Could not load a scoreboard from Newgrounds!');
    
    // Format how we want
    let formatted_scores = {
        name:result.scoreboard.name,
        scores:[]
    }

    // Format a score object we can reference later.
    result.scores.forEach(score => {
        let score_object = {
            score:score.value,
            user:score.user.name,
            user_img:score.user.icons.large,
            supporter_status:score.user.supporter
        };


        formatted_scores.scores.push(score_object);
    });

    _ng_session_leaderboard = formatted_scores;
    
}

// build an HTML popup for NG notifications
function ngBuildPopupDisplay(){
    const ng_pop = document.createElement("div");
    ng_pop.id = `ngPopup`;
    ng_pop.classList.add('container-blur');

    // Create inner element for our credit_div
    const ng_pop_img = document.createElement("div");
    ng_pop_img.id = `ngPopupImg`;

    // Create inner element for our credit_div
    const ng_pop_guts = document.createElement("div");
    ng_pop_guts.id = `ngPopupGuts`;

    const header_title = document.createElement('p');
    header_title.id = `ngPopupHeader`;

    const name_title = document.createElement('p');
    name_title.id = `ngPopupName`;

    const name_desc = document.createElement('p');
    name_desc.id = `ngPopupDesc`;

    // Append what we have so far
    setTimeout(() => { ng_pop_guts.appendChild(header_title); }, 20);
    setTimeout(() => { ng_pop_guts.appendChild(name_title);  }, 40);
    setTimeout(() => { ng_pop_guts.appendChild(name_desc);  }, 60);
    setTimeout(() => { ng_pop.appendChild(ng_pop_img);  }, 80);
    setTimeout(() => { ng_pop.appendChild(ng_pop_guts);  }, 100);
    setTimeout(() => { document.getElementById('gameBody').appendChild(ng_pop); }, 100);
}

// Add notification to NG queue
function ngAddNotification(header,title,description,image=null,displaytime=3500){
    _ng_notification_queue.push([header,title,description,image,displaytime]);
}

// Execute NG notification queue by displaying our popups.
async function ngExecuteNotificationQueue(delay=500){

    // Nothing to show!
    if(_ng_notification_queue.length == 0) return;

    setTimeout(() => {
        // Queue up the start of our notification.
        if(_ng_notification_queue.length > 0){
            let ng_timeout = ngDisplayNotification();
            document.getElementById('ngPopup').style.right = '-1vh';
            setTimeout(() => {
                document.getElementById('ngPopup').style.right = '';
                    // Loop this function.
                    setTimeout(() => { ngExecuteNotificationQueue() }, 2000);
            }, ng_timeout);
        }
    }, delay);

}

// Display a notification array in our notification popup
function ngDisplayNotification(){
    // Nothing to show!
    if(_ng_notification_queue.length == 0) return null;

    // Get values from notification array
    let current_notification = _ng_notification_queue[0];
    let cur_head = current_notification[0];
    let cur_title = current_notification[1];
    let cur_desc = current_notification[2];
    let cur_img = current_notification[3];
    let timeframe = current_notification[4];

    // Set HTML elements to our values
    document.getElementById('ngPopupHeader').innerHTML = cur_head;
    document.getElementById('ngPopupName').innerHTML = cur_title;
    document.getElementById('ngPopupDesc').innerHTML = cur_desc;
    // if no image is being displayed, set bg to nothing and hide
    if(cur_img == null) document.getElementById('ngPopupImg').style.display = `none`;
    else document.getElementById('ngPopupImg').style.display = '';

    document.getElementById('ngPopupImg').style.backgroundImage = `url('${cur_img}')`;
    // Delete processed item
    _ng_notification_queue.shift();

    // return our intended display time
    return timeframe;
}

function ngLogEvent(component, ename=false){
    let host = window.location.origin;
    if(ename == false) ngio.callComponent(component, {host: host}, {});
    else ngio.callComponent(component, {event_name: ename, host: host}, {});
}

function onSaveDataLoaded(result) {
    console.log('INFO: Successful save slot '+result.slot.id+' loaded from Newgrounds!');
    
    // Format how we want
    let formatted_save_data = {
        datetime:result.slot.datetime,
        id:result.slot.id,
        size:result.slot.size,
        timestamp:result.slot.timestamp,
        url:result.slot.url,
    }

    // Load our savefile URL and data from Newgrounds.
    fetch(formatted_save_data.url)
    .then(response => response.text())
    .then((data) => {
      _ng_savedata_length = data.length;
      _ng_savedata = JSON.parse(data);
    });
    setTimeout(() => {
        ngOverrideLS(_ng_savedata);
    }, 670);
    

    document.getElementById('ngBtnCloudLoadTxt').innerHTML = "Load Successful!";
    setTimeout(() => {
        document.getElementById('ngBtnCloudLoadTxt').innerHTML = "Load From Newgrounds Cloud";
    }, 2250);
}

function onSaveDataSaved(result) {
    if(result.success === true){
        console.log('INFO: Successful save to slot '+result.slot.id+' on Newgrounds!');
        document.getElementById('ngBtnCloudSaveTxt').innerHTML = "Save Successful!";
        setTimeout(() => {
            document.getElementById('ngBtnCloudSaveTxt').innerHTML = "Save to Newgrounds Cloud";
        }, 2250);
    }
}
