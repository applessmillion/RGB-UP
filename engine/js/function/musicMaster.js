let music_status = true; // Our music status. is it paused or playing?
let music_active_channels = []; // Per scene variable. 

// define 5 music channels just in case.
let music_channel_1, music_channel_2, music_channel_3, music_channel_4, music_channel_5;
/* scope for channels:
01 - BG
02 - Dyanmic BG
*/

// Look at our localstorage for any music settings.
if(localStorage.getItem('app_music_status')) music_status = localStorage.getItem('app_music_status');
else localStorage.setItem('app_music_status', true);

// Toggle whether the music is playing or not.
function toggleMusic(){
                
    if(music_status == false || music_status == 'false') music_status = true; // Set to true, will be used on click to toggle.

    // No reason to have an if-else, the else will always be true OR null. If null/undef, we get it back on track anyway.
    else  music_status = false; // Set to true, will be used on click to toggle.

    localStorage.setItem('app_music_status', music_status);
    setMusic();
}

// I hate that localstorage stores my variables as strings... 
function setMusic(){
    if(music_status === true || music_status == 'true'){
        
        // Play all active channels.
        music_active_channels.forEach(ch => {
            window[`music_channel_` + ch].play();  
        });

        document.getElementById(`buttonMusicToggle`).style.backgroundColor = `white`; // Set button background to white.
    }
    // No reason to have an if-else, the else will always be true OR null. If null/undef, we get it back on track anyway.
    else{
        // Pause all active channels.
        music_active_channels.forEach(ch => {
            window[`music_channel_` + ch].pause();  
        });

        document.getElementById(`buttonMusicToggle`).style.backgroundColor = `red`; // Set button background to red.
    }
}

// Queue a music channel.
function queueMusicChannel(ch_no, music_file, timeout=100, is_loop=false, vol=0.45, restart=false){
    // No loop & music turned off? cancel the request.
    if(music_status == false && is_loop == false){
        return null;
    }

    // Does this channel already exist? If so, let's skip the init
    if(!window[`music_channel_` + ch_no]){
        window[`music_channel_` + ch_no] = new Audio(music_file);
        window[`music_channel_` + ch_no].loop = is_loop;   // Set channel loop
        window[`music_channel_` + ch_no].volume = vol;     // Set channel volume
    }

    setTimeout(() => {
        
        // This is dumb but will work.
        console.log(music_status);
        if(music_status === true || music_status == 'true'){
            window[`music_channel_` + ch_no].play(); // Set channel to play  
        }
    }, timeout);

    // Add our looped active channel to our array
    music_active_channels.push(ch_no);
}

// Adjust volume of our channels
function setMusicChannelVolume(ch_no, vol, ease=false, delay=0){
    
    // Should we ease the volume from the current setting?
    if(ease == false){
        setTimeout(() => {
            window[`music_channel_` + ch_no].volume = vol;
        }, delay);
        
    }
    // Yes we should
    else{
        let vol_dif = vol - window[`music_channel_` + ch_no].volume;
        let update_cont = 1;

        // Shit, are we reducing the volume? why would we ever want to do that! Well... we do. Jank. Make our negative number less negative by converting it to positive.
        if(vol_dif < 0 && vol != 0) vol_dif = (-1 + (vol_dif*-1));
        console.log(`Channel ${ch_no} volume update request. Moving from current volume of ${window[`music_channel_` + ch_no].volume} to ${vol}. This should be a change of ${vol_dif}`);
        // Over the span of 10 updates, we're going to change the volume of the channel.
        let ease_interval = {};
        ease_interval[ch_no] = setInterval(() => {

            
            // Will this round of ease put the volume out of bounds above 1? Set to 1!
            if((window[`music_channel_` + ch_no].volume + (vol_dif/100) > 1)) window[`music_channel_` + ch_no].volume = 1;

            // Will this round of ease put the volume out of bounds below 0? Set to 0!
            if((window[`music_channel_` + ch_no].volume + (vol_dif/100) < 0)) window[`music_channel_` + ch_no].volume = 0;

            window[`music_channel_` + ch_no].volume += (vol_dif/10)

            console.log(`Channel ${ch_no} volume update. Moving from ${window[`music_channel_` + ch_no].volume} to ${window[`music_channel_` + ch_no].volume + (vol_dif/10)}. Vol diff ${vol_dif}`);

            // Round complete
            update_cont++;

            if(update_cont >= 10){
                clearInterval(ease_interval[ch_no]);

                if((window[`music_channel_` + ch_no].volume + vol) > 1) window[`music_channel_` + ch_no].volume = 1;
                if((window[`music_channel_` + ch_no].volume + vol) < 0) window[`music_channel_` + ch_no].volume = 0;

                window[`music_channel_` + ch_no].volume = vol;


                console.log(`Channel ${ch_no} volume update request. Current volume is ${window[`music_channel_` + ch_no].volume}. Requested to be ${vol}`);
            }
        }, delay);

    }
}

// Create a one-off audio play
function queueMusicOneoff(music_file,timeout=100,vol=0.4){

    // Is all audio muted?
    if(music_status == false || music_status == 'false') return null;

    // set up temp audio
    let temp_music_channel = new Audio(music_file);
    temp_music_channel.volume = vol;
    setTimeout(() => {
        temp_music_channel.play();
    }, timeout);
}