// You can't say I didn't try.....
let html_loginbtn = document.getElementById('titleButtonNG');

// call init with our appid, secret, and options defined in ngAPI_info.js.
NGIO.init(ng_master.appid,ng_master.secret, _ng_options);

function ngGetConnected(){
    NGIO.init(ng_master.appid,ng_master.secret, _ng_options);
    NGIO.getConnectionStatus(function(status) {
        // This is a generic check to see if we're waiting for something...
        if (NGIO.isWaitingStatus)  console.log("We're either waiting for the server to respond, or the user to sign in on Newgrounds.");

        // check the actual connection status
        switch (status) {

            // we have version and license info
            case NGIO.STATUS_LOCAL_VERSION_CHECKED:

                if (NGIO.isDeprecated) console.log("this copy of the game is out of date");
                    

                if (!NGIO.legalHost) console.log("the site hosting this copy has been blocked");

                break;

            // user needs to log in
            case NGIO.STATUS_LOGIN_REQUIRED:
                console.log("This game uses features that require a Newgrounds account");
                NGIO.openLoginPage();
                break;

            // We are waiting for the user to log in (they should have a login page in a new browser tab)
            case NGIO.STATUS_WAITING_FOR_USER:
                console.log("It's possible the user may close the login page without signing in.");
                html_loginbtn.innerHTML = 'Waiting on Newgrounds... Cancel?';
                html_loginbtn.onclick = 'NGIO.cancelLogin();';          
                break;

            // user needs to log in
            case NGIO.STATUS_READY:
                console.log("Everything should be loaded.");
                console.log(NGIO.hasUser);
                html_loginbtn.innerHTML = `Hi ${NGIO.user.name}! Sign out?`
                break;
        }

    });
}

// I hate that I need to call this twice. I can set the timeout to really any number and still need it twice.....
setTimeout(() => {
    NGIO.init(ng_master.appid,ng_master.secret, _ng_options);
    ngGetConnected();
}, 800);

ngGetConnected();