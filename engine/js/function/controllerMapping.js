// Map specific button or key presses to actions.
_current_screen = 0;
_controller_ces = -1; // Controller - Current Element Selector
_controller_gi = null; // Controller - grid item

// Handle mouse scrollwheel events.
function controllerScroll(dirX,dirY,dirZ){
    // is a context screen we're monitoring moused over?
    if(mouseover_context === true) return null;

    // do nothing with Z-axis movements with wheel. We only care about vertical...

    // Do not support scrolling on title page OR leaderboards
    if(_current_screen === 0 || _current_screen === 7) return null;

    // DIRECTION IS UP
    if(dirY < 0 || dirX < 0) controllerTitle(37); // Simulate LEFT arrow key movement.

    // DIRECTION IS DOWN
    else if (dirY > 0 || dirX > 0) controllerTitle(39); // Simulate RIGHT arrow key movement.
}


// Handle inputs for title.
function controllerTitle(key){
    let key_atlas = {};
    _controller_gi = null;
    if(key === 75) toggleKeybindingDisplay(key); // k key
// global on quiz stage.
    if(_current_screen == 100){
        if(key === 27) document.getElementById('pageBacktoTitle').click(); // Escape
        if(key === 70) togglePageFullscreen() // F key
        if(key === 77) toggleMusic() // M key

        if(key === 13 && document.getElementById('button-6').style.display != 'none') document.getElementById('button-6').click(); // Enter
        if(key === 32 && document.getElementById('button-6').style.display != 'none') document.getElementById('button-6').click(); // Space

        if(key === 53  && document.getElementById('button-6').style.display != 'none') document.getElementById('button-5').click(); // Digit 4
        if(key === 101 && document.getElementById('button-5').style.display != 'none') document.getElementById('button-5').click(); // Numpad 3

        // Is the trivia over?
        if(q_type != 100){
            if(key === 49 && intermission == false) document.getElementById('button-1').click(); // Digit 1
            if(key === 50 && intermission == false) document.getElementById('button-2').click(); // Digit 2
            if(key === 97 && intermission == false) document.getElementById('button-1').click(); // Numpad 1
            if(key === 98 && intermission == false) document.getElementById('button-2').click(); // Numpad 2

            // Is the question T/F only?
            if(q_type != 1){
                if(key === 51 && intermission == false) document.getElementById('button-3').click(); // Digit 3
                if(key === 52 && intermission == false) document.getElementById('button-4').click(); // Digit 4
                if(key === 99 && intermission == false) document.getElementById('button-3').click(); // Numpad 3
                if(key === 100 && intermission == false) document.getElementById('button-4').click(); // Numpad 4
            }
        }
    }
// global on title stage
    if(_current_screen <= 11){
        if(key === 27) stageResetView(); // Escape
        if(key === 70) togglePageFullscreen() // F key
        if(key === 77) toggleMusic() // M key
        if(key === 78) ngUserSessionJourney(false) // N key
        if(key === 79) togglePageMotion() // O key
    }

// Current screen is the title screen.
    if(_current_screen == 0){
        _controller_gi = -1;
        grid_parent = null;
        if(key === 13) document.getElementById('titleButtonStart').click(); // Enter
        if(key === 32) document.getElementById('titleButtonStart').click(); // Space
        if(key === 49) document.getElementById('titleButtonStart').click(); // Digit 1
        if(key === 50) document.getElementById('titleButtonStats').click(); // Digit 2
        if(key === 51) document.getElementById('titleButtonCredit').click(); // Digit 3
        if(key === 52) document.getElementById('titleButtonInfo').click(); // Digit 4
        if(key === 53) document.getElementById('titleButtonNG').click(); // Digit 5
        if(key === 54) document.getElementById('titleButtonLeaderboards').click(); // Digit 6
        if(key === 97) document.getElementById('titleButtonStart').click(); // Numpad 1
        if(key === 98) document.getElementById('titleButtonStats').click(); // Numpad 2
        if(key === 99) document.getElementById('titleButtonNG').click(); // Numpad 3
        if(key === 100) document.getElementById('titleButtonInfo').click(); // Numpad 4
        if(key === 101) document.getElementById('titleButtonCredit').click(); // Numpad 5
        if(key === 102) document.getElementById('titleButtonLeaderboards').click(); // Numpad 6

        // arrow keys
        if(key === 37) document.getElementById('titleButtonStats').click(); // LEFT ARROW
        if(key === 39) document.getElementById('titleButtonStart').click(); // RIGHT ARROW
        if(key === 40) moveToStageGauntlet(); // DOWN ARROW
    }

// stage select
    else if(_current_screen == 1){
        // Parent of grid object.
        _controller_gi = document.getElementById('bodySelectGrid').querySelectorAll('.stage-tile');

        // Use our selected trivia pack buttons.
        if(_controller_ces != -1 && _gamemode != 'undefined'){
            if(key === 13) document.getElementById('selectPlayBtn').click(); // Enter
            if(key === 32) document.getElementById('selectPlayBtn').click(); // Space
            if(key === 49) document.getElementById('selectPlayBtn').click(); // Digit 1
            if(key === 50) document.getElementById('selectStatsBtn').click(); // Digit 2
            if(key === 51) stageResetView(); // Digit 3
        }

        if(key === 97) _controller_gi[0].click(); _controller_ces == 0; // Numpad 1
        if(key === 98) _controller_gi[1].click(); _controller_ces == 1; // Numpad 2
        if(key === 99) _controller_gi[2].click(); _controller_ces == 2; // Numpad 3
        if(key === 100) _controller_gi[3].click(); _controller_ces == 3; // Numpad 4
        if(key === 101) _controller_gi[4].click(); _controller_ces == 4; // Numpad 5
        if(key === 102) _controller_gi[5].click(); _controller_ces == 5; // Numpad 6
        if(key === 103) _controller_gi[6].click(); _controller_ces == 6; // Numpad 7
        if(key === 104) _controller_gi[7].click(); _controller_ces == 7; // Numpad 8
        if(key === 105) _controller_gi[8].click(); _controller_ces == 8; // Numpad 9
        if(key === 106) _controller_gi[9].click(); _controller_ces == 9; // Numpad 0

        /*** ARROW KEYS AND THEIR MANY USES */
        // Handle index movement
        if(key === 37 || key === 38) _controller_ces -= 1; // LEFT, UP ARROW
        if(key === 39 || key === 40) _controller_ces += 1; // RIGHT, DOWN ARROW

        // Handle end of bounds
        if(_controller_ces < 0) _controller_ces = _controller_gi.length-1;
        else if(_controller_ces >= _controller_gi.length) _controller_ces = 0;

        // Handle click
        if(key === 37 || key === 38 || key === 39 || key === 40) _controller_gi[_controller_ces].click();
        /* END ARROW KEYS AND MANY USES */
    }

// stage stats
    else if(_current_screen == 2){
        // Parent of grid object.
        _controller_gi = document.getElementById('bodyStatsGrid').querySelectorAll('.stage-tile');

        // Use our selected trivia pack buttons.
        if(_controller_ces != -1 && _gamemode != 'undefined'){
            if(key === 13) document.getElementById('statsPlayBtn').click(); // Enter
            if(key === 32) document.getElementById('statsPlayBtn').click(); // Space
            if(key === 49) moveToStageReview();injectReviewQuestions(_gamemode); // Digit 1
            if(key === 50) document.getElementById('statsPlayBtn').click(); // Digit 2
            if(key === 51) stageResetView(); // Digit 3
        }

        if(key === 97) _controller_gi[0].click(); _controller_ces == 0; // Numpad 1
        if(key === 98) _controller_gi[1].click(); _controller_ces == 1; // Numpad 2
        if(key === 99) _controller_gi[2].click(); _controller_ces == 2; // Numpad 3
        if(key === 100) _controller_gi[3].click(); _controller_ces == 3; // Numpad 4
        if(key === 101) _controller_gi[4].click(); _controller_ces == 4; // Numpad 5
        if(key === 102) _controller_gi[5].click(); _controller_ces == 5; // Numpad 6
        if(key === 103) _controller_gi[6].click(); _controller_ces == 6; // Numpad 7
        if(key === 104) _controller_gi[7].click(); _controller_ces == 7; // Numpad 8
        if(key === 105) _controller_gi[8].click(); _controller_ces == 8; // Numpad 9
        if(key === 106) _controller_gi[9].click(); _controller_ces == 9; // Numpad 0

        /*** ARROW KEYS AND THEIR MANY USES */
        // Handle index movement
        if(key === 37 || key === 38) _controller_ces -= 1; // LEFT, UP ARROW
        if(key === 39 || key === 40) _controller_ces += 1; // RIGHT, DOWN ARROW

        // Handle end of bounds
        if(_controller_ces < 0) _controller_ces = _controller_gi.length-1;
        else if(_controller_ces >= _controller_gi.length) _controller_ces = 0;

        // Handle click
        if(key === 37 || key === 38 || key === 39 || key === 40) _controller_gi[_controller_ces].click();
        /* END ARROW KEYS AND MANY USES */
    }
// review recent gamemode
else if (_current_screen == 3){
    if(key === 49) ngSubmitAll(); // Digit 1
    if(key === 50) gotoQuiz(); // Digit 2
    if(key === 51) moveToStageReview();injectReviewQuestions(_gamemode); // Digit 3
    if(key === 52) moveToStageSelect(); // Digit 4
    if(key === 53) stageResetView(); // Digit 5
}
// stage review/questions
else if(_current_screen == 4){
    // Parent of grid object.
    _controller_gi = document.getElementById('reviewGamemodeQuestionsList').querySelectorAll('.review-question-item');

    if(key === 13 && _controller_ces != -1) document.getElementById('bodyReviewQuestionsSource').click(); // Enter


    if(key === 49) document.getElementById('reviewStats').click(); // Digit 1
    if(key === 50) stageResetView(); // Digit 2

    if(key === 97) _controller_gi[0].click(); _controller_ces == 0; // Numpad 1
    if(key === 98) _controller_gi[1].click(); _controller_ces == 1; // Numpad 2
    if(key === 99) _controller_gi[2].click(); _controller_ces == 2; // Numpad 3
    if(key === 100) _controller_gi[3].click(); _controller_ces == 3; // Numpad 4
    if(key === 101) _controller_gi[4].click(); _controller_ces == 4; // Numpad 5
    if(key === 102) _controller_gi[5].click(); _controller_ces == 5; // Numpad 6
    if(key === 103) _controller_gi[6].click(); _controller_ces == 6; // Numpad 7
    if(key === 104) _controller_gi[7].click(); _controller_ces == 7; // Numpad 8
    if(key === 105) _controller_gi[8].click(); _controller_ces == 8; // Numpad 9
    if(key === 106) _controller_gi[9].click(); _controller_ces == 9; // Numpad 0

        /*** ARROW KEYS AND THEIR MANY USES */
        // Handle index movement
        if(key === 37 || key === 38) _controller_ces -= 1; // LEFT, UP ARROW
        if(key === 39 || key === 40) _controller_ces += 1; // RIGHT, DOWN ARROW

        // Handle end of bounds
        if(_controller_ces < 0) _controller_ces = _controller_gi.length-1;
        else if(_controller_ces >= _controller_gi.length) _controller_ces = 0;

        // Handle click
        if(key === 37 || key === 38 || key === 39 || key === 40) _controller_gi[_controller_ces].click();
        /* END ARROW KEYS AND MANY USES */
}

// stage credits
    else if(_current_screen == 5){
        if(key === 97) document.getElementById('creditAll').click(); // Numpad 1
        if(key === 49) document.getElementById('creditAll').click(); // Digit 1
        if(key === 98) stageResetView(); // Numpad 1
        if(key === 50) stageResetView(); // Digit 1
        if(key === 38 || key == 37) document.getElementById('bodyCredit').scrollBy({
            top: -125,
            left: 0,
            behavior: "smooth",
          }); // UP ARROW, LEFT ARROW
        if(key === 40 || key == 39) document.getElementById('bodyCredit').scrollBy({
            top: 125,
            left: 0,
            behavior: "smooth",
          });  // DOWN ARROW, RIGHT ARROW
    }
// stage help page
    else if(_current_screen == 6){
        if(key === 97) document.getElementById('helpAll').click(); // Numpad 1
        if(key === 49) document.getElementById('helpAll').click(); // Digit 1
        if(key === 98) stageResetView(); // Numpad 1
        if(key === 50) stageResetView(); // Digit 1

        // Supporter status buttons.
        if(_ng_user.supporter == true){
            if(key == 55) ngToggleCloud(); // Digit 7
            if(key == 56) ngSaveData(1,1); // Digit 8
            if(key == 57) ngSaveData(0,1); // Digit 9
        }
        if(key === 38 || key == 37) document.getElementById('bodyInfo').scrollBy({
            top: -125,
            left: 0,
            behavior: "smooth",
        }); // UP ARROW, LEFT ARROW
        if(key === 40 || key == 39) document.getElementById('bodyInfo').scrollBy({
            top: 125,
            left: 0,
            behavior: "smooth",
        });  // DOWN ARROW, RIGHT ARROW
    }
// stage leaderboards
    else if(_current_screen == 7){
        // Parent of grid object.
        _controller_gi = document.getElementById('bodyLeaderboardsGrid').querySelectorAll('.stage-tile');

        // Use our selected trivia pack buttons.
        if(_controller_ces != -1 && _gamemode != 'undefined'){
            if(key === 49) stageResetView(); // Digit 1
        }

        if(key === 97) _controller_gi[0].click(); _controller_ces == 0; // Numpad 1
        if(key === 98) _controller_gi[1].click(); _controller_ces == 1; // Numpad 2
        if(key === 99) _controller_gi[2].click(); _controller_ces == 2; // Numpad 3
        if(key === 100) _controller_gi[3].click(); _controller_ces == 3; // Numpad 4
        if(key === 101) _controller_gi[4].click(); _controller_ces == 4; // Numpad 5
        if(key === 102) _controller_gi[5].click(); _controller_ces == 5; // Numpad 6
        if(key === 103) _controller_gi[6].click(); _controller_ces == 6; // Numpad 7
        if(key === 104) _controller_gi[7].click(); _controller_ces == 7; // Numpad 8
        if(key === 105) _controller_gi[8].click(); _controller_ces == 8; // Numpad 9
        if(key === 106) _controller_gi[9].click(); _controller_ces == 9; // Numpad 0

        /*** ARROW KEYS AND THEIR MANY USES */
        // Handle index movement
        if(key === 37 || key === 38) _controller_ces -= 1; // LEFT, UP ARROW
        if(key === 39 || key === 40) _controller_ces += 1; // RIGHT, DOWN ARROW

        // Handle end of bounds
        if(_controller_ces < 0) _controller_ces = _controller_gi.length-1;
        else if(_controller_ces >= _controller_gi.length) _controller_ces = 0;

        // Handle click
        if(key === 37 || key === 38 || key === 39 || key === 40) _controller_gi[_controller_ces].click();
        /* END ARROW KEYS AND MANY USES */
    }
}

// enable button key display
if(localStorage.getItem('key_status')) key_status = localStorage.getItem('key_status');
else localStorage.setItem('key_status', false);

function toggleKeybindingDisplay(){
    let status = localStorage.getItem('key_status');

    if(status == false || status == 'false') status = true;
    else status = false;

    localStorage.setItem('key_status',status);
    setkeybindingDisplay(status);
}

function setkeybindingDisplay(vis=false){
    if(vis === true || vis == 'true'){
        Array.from(document.getElementsByClassName('keybinding-icon-btn')).forEach(element => {
            element.style.display = 'block';
        });
    }

    else {
        Array.from(document.getElementsByClassName('keybinding-icon-btn')).forEach(element => {
            element.style.display = 'none';
        }); 
    }

}