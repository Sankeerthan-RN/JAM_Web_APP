function login(){

    function newLoginHappened(user){

        if(user){
            // User Logged In
            app(user);
        }
        else{

            var provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provider).then(function(result) {
            var token = result.credential.accessToken;
            var user = result.user;
            app(user);
            }).catch(function(error) {
            var errorCode = error.code;
            alert("errorCode ::"+errorCode)
            var errorMessage = error.message;
            alert("errorMessage ::"+errorMessage)
            var email = error.email;
            var credential = error.credential;
            var myid = chrome.runtime.id;
            alert(myid);

});
        }
    }

    firebase.auth().onAuthStateChanged(newLoginHappened);
}