let _is_fullscreen = false;
let _increment = [];

// Do you have a slow computer? me too. Let's create a function to stop all motion on the title page!
function togglePageMotion(bypass=false){
    // Is there an entry for this in localstorage?
    if(!localStorage.getItem('_game_motion')) localStorage.setItem('_game_motion', true); // Set to false if var does not exist. We want motion to be on by default. 

    // Are we bypassing the toggle? If not, toggle.
    if(bypass == false){ 
        if(localStorage.getItem('_game_motion') == true || localStorage.getItem('_game_motion') == 'true')  localStorage.setItem('_game_motion', false);
        else localStorage.setItem('_game_motion', true);
    }

    // Animation is set to TRUE. this means we move!
    if(localStorage.getItem('_game_motion') == true || localStorage.getItem('_game_motion') == 'true'){
        document.getElementById('pageMotionToggle').style.backgroundColor = 'white';    // Set background of motion button to white to indicate motion is active.
        document.getElementById('pageBackgroundGradient').style.animation = '';         // Gradient background been touched? not anymore!
        Array.from(document.getElementsByClassName('title-button-animation')).forEach(element => { element.style.animation = ''; });    // Make the title buttons dance!
    }
    // Disable motion elements on page to make performance better.
    else{
        document.getElementById('pageMotionToggle').style.backgroundColor = 'red';
        document.getElementById('pageBackgroundGradient').style.animation = 'none';
        Array.from(document.getElementsByClassName('title-button-animation')).forEach(element => { element.style.animation = 'none'; });
    }
}

// Let's go back to the title page..
function backToTitle(){
    // Has our confirmation text already been popped?
    if(_page_confirmation == true){

        // Return to gamemode selection screen on title page.
        returnToTitle();
        // Is the music choice dynamic? If so, handle the end of question transition between tracks.
        setMusicChannelVolume(1,0,true,140);
        if(gamemode_music_type == 'dynamic') setMusicChannelVolume(2,0,true,140);

        setTimeout(() => { window.location.href = `stage_title.html?g=${gamemode_info_private.namespace}&s=select`; }, 1550);
    }
    // Confirmation not get. Get confirmation to go back to title before we do it.
    else{
        _page_confirmation = true;
        document.getElementById('pageBacktoTitleTxt').style.opacity = '1';
        document.getElementById('pageBacktoTitle').style.backgroundColor = 'red';
        // Timeout confirmation message and details after 5s
        setTimeout(() => {
            _page_confirmation = false;
            document.getElementById('pageBacktoTitleTxt').style.opacity = '0';
            document.getElementById('pageBacktoTitle').style.backgroundColor = 'white';
        }, 2750);
    }
}

// Display tooltip for clicking our token button
function showTokenInformation(){
    document.getElementById('pageTokenInfo').style.opacity = '1';
    // Timeout confirmation message and details after 5s
    setTimeout(() => {
        document.getElementById('pageTokenInfo').style.opacity = '0';
    }, 4050);
    queueMusicOneoff('audio/ui_button_token_press.mp3',1,0.33); // Play a sound when triggered.
}

// Toggle fullscreen display.
async function togglePageFullscreen(){
    // Enter
    if(!_is_fullscreen){
        await document.documentElement.requestFullscreen();
        document.getElementById('pageFullscreenToggle').style.backgroundImage = "url('images/ui/fullscreen_exit.png')";
        _is_fullscreen = true;
    }
    // Exit
    else{
        if(document.exitFullscreen) document.exitFullscreen();
        else if(document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if(document.webkitExitFullscreen) document.webkitExitFullscreen();

        document.getElementById('pageFullscreenToggle').style.backgroundImage = "url('images/ui/fullscreen.png')";
        _is_fullscreen = false;
    }
}

// Handle awarding and removing tokens.
function awardGamemodeTokens(amount,reduce=false){
    if(!localStorage.getItem('trivialtrivia_total_tokens')) localStorage.getItem('trivialtrivia_total_tokens',0); // Set if nonexistent.

    // Get token amount
    let mytokens = Number(localStorage.getItem('trivialtrivia_total_tokens'));
    mytokens = Math.round(mytokens);
    // If reduce is set, we are reverse awarding tokens... aka removing them.
    if(reduce === true){
        mytokens -= amount;
        if(_debug) console.log('INFO - Removed ' + amount + ' tokens. Total is now ' + mytokens + '.');
    }
    else{
        mytokens += amount;
        if(_debug) console.log('INFO - Added ' + amount + ' tokens. Total is now ' + mytokens + '.');
    }

    // Update token display
    document.getElementById('pageTokenCount').innerHTML = mytokens;

    // Interact with localstorage for our total amount.
    localStorage.setItem('trivialtrivia_total_tokens',mytokens);

    // If for some reason we want to use this function to set a value of something... here ya go.
    return mytokens;
}

// Fancy shit to show a number going up or down with X amount of frames!
function visualNumberUpdate(hmtl_element,from,to,frames=5,prefix='',postfix='',delay=200){
    let pointer = 1; // Always start at 1;
    let current_number = from;
    let diff = from-to;
    if(diff < 0) diff = diff*-1; // Flip from negative.
    let diff_increment = diff/frames;

    // Is there already an interval going on somewhere else?! If so, skip the BS and show new number
    if(_increment[frames] !== undefined){
        hmtl_element.innerHTML = prefix + to + postfix;
        return null;
    } 

    // While pointer is LESS THAN frames, do this. This makes it so we can start at 0 and actually get the correct number of frames.
    _increment[frames] = setInterval(() => {
        // Stop if we are done
        if(pointer >= frames){
            clearInterval(_increment[frames]);
            setTimeout(() => {_increment[frames] = undefined;}, 500);
        }

        if(to > from) current_number += diff_increment;
        else current_number -= diff_increment;
        
        hmtl_element.innerHTML = prefix + Math.round(current_number) + postfix;
        pointer++;
    }, delay);


}