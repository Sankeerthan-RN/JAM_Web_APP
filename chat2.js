var curFriend;
var curGroup;
var curGroupFriend;
var curGroupFriendPhoto;
var curFriendPhoto;
var MyPhoto;
var messageLayout = `
<div class="row justify-content-end">
<div class="col-6 col-sm-5 col-md-5 ">
    <p class="sent float-right "> 
    <span class="time float-right" id="curtime">
    </span>
</p>
</div>
<div class="col-2 col-sm-1 col-md-1 float-right">
    <img src="images/pp.png" class="profile-pic"/>
</div>
</div>` ;


function StartChat(id,friendemailname){
    if(curFriend == null || curFriend.localeCompare(friendemailname) != 0){
        document.getElementById('LastSeen').innerHTML = '';
        curGroup = null;
        document.getElementById('messages').innerHTML = '';
        document.getElementById('chatPanel').removeAttribute('style');
        document.getElementById('divStart').setAttribute('style','display:none');
        setName(friendemailname,id,null,'FriendName');
        var emailname = ename(firebase.auth().currentUser.email);
        var db = firebase.firestore();
        curFriend = friendemailname;
        db.doc("User/"+curFriend).onSnapshot(function(snapshot){curFriendPhoto = snapshot.data().photo;});
        if(emailname<curFriend){var childname = emailname+'__'+curFriend}
        else{var childname = curFriend+'__'+emailname}
    
        db.collection('Messages').doc(childname).collection('messages').orderBy("time",'desc').limit(1).onSnapshot(function(snapshot){
            if(snapshot!=null ){
                snapshot.forEach(function(doc){
                    db.collection('User').doc(emailname).collection('friends').doc(curFriend).set({
                        'lastMessage':doc.data().text,
                        'lastTime':doc.data().time,
                        },{merge:true});
                });
            }
        });
    
    
        db.collection('Messages').doc(childname).collection('messages').orderBy("time").onSnapshot(function(snapshot){
            if(snapshot!=null ){
                document.getElementById('messages').innerHTML = '';
                snapshot.forEach(function(doc){
    
                    var messageEname = doc.data().ename;
                    var text = doc.data().text;
                    var timestamp = doc.data().time;
                    var type = doc.data().type;
                    var res = doc.data().res
    
                    if(messageEname.localeCompare(emailname) == 0){
                            showMessage(text,timestamp,type,res);
                    }
                    else{
                           receiveMessage(text,timestamp,type,res);
                    }
                })
                    
                }
            });
        }
    //document.getElementById('FriendName').innerHTML = friendemailname;
    //hideChatList();
}


function StartChatGroup(id,grpid){
    if(curGroup == null || curGroup.localeCompare(grpid) != 0){

        document.getElementById('messages').innerHTML = '';
        document.getElementById('chatPanel').removeAttribute('style');
        document.getElementById('divStart').setAttribute('style','display:none');
        var emailname = ename(firebase.auth().currentUser.email);
        var db = firebase.firestore();
        curGroup = grpid;
        setName(grpid,id,null,'FriendName','grpName');
        var childname = grpid;
        db.collection('Messages').doc(childname).collection('messages').orderBy("time",'desc').limit(1).onSnapshot(function(snapshot){
            if(snapshot!=null ){
                snapshot.forEach(function(doc){
                    db.collection('Group').doc(curGroup).set({
                        'lastMessage':doc.data().text,
                        'lastTime':doc.data().time,
                        'lastMessageBy':doc.data().ename
                        },{merge:true});
                });
            }
        });
    
    
        db.collection('Messages').doc(childname).collection('messages').orderBy("time").onSnapshot(function(snapshot){
            if(snapshot!=null ){
                document.getElementById('messages').innerHTML = '';
                snapshot.forEach(function(doc){
    
                    var messageEname = doc.data().ename;
                    var text = doc.data().text;
                    var timestamp = doc.data().time;
                    var res = doc.data().res
                    var type = doc.data().type;
    
                    if(messageEname.localeCompare(emailname) == 0)
                    {
                        showMessage(text,timestamp,type,res);
                    }
                    else
                    {
                        curGroupFriend = messageEname;
                        db.doc("User/"+messageEname).onSnapshot(function(snapshot){curGroupFriendPhoto = snapshot.data().photo;});
                        receiveMessage(text,timestamp,type,res);
                    }
                });
                    
                }
            });
        }
}

function showChatList() {
    document.getElementById('side-1').classList.add('d-none', 'd-md-block');
    document.getElementById('side-2').classList.remove('d-none');
}

function OnKeyDown(){
    document.getElementById('txtMessage').addEventListener('keydown' ,function(key){
        if(key.which  == 13){
            SendMessage();
        }
    });
        
    }
    ///.ref('users').orderByChild('').equalTo(friend)
    function Ondown(){
        var emailname = ename(firebase.auth().currentUser.email);
                document.getElementById("search").disabled = true;
                document.getElementById("searchbtn").disabled = true;
                var friend = document.getElementById('search').value;
                document.getElementById('search').value = '';
                if(friend != "" && friend.localeCompare(emailname) != 0){
                    var docRef = firebase.firestore().collection('User');
                    docRef.doc(friend).get().then((docSnapshot) => {
                     if (docSnapshot.exists) {
                            docRef.doc(emailname).collection('friends').get().then(function(collection){
                                if(collection.size!=0){
                                    docRef.doc(emailname).collection('friends').doc(friend).get().then(function(querySnapshot) {
                                            if(querySnapshot.exists){
                                                alert('already a friend');
                                            }
                                            else{
                                            alert("exsists! & u both now r friends");
                                            addFriend();
                                            }
                                        });
                                }
                                else{
                                    addFriend();
                                }
                            });
                        function addFriend(){
                            docRef.doc(friend).collection('friends').doc(emailname).set({id:emailname,lastMessage:'',lastTime:new Date().getTime()});
                            docRef.doc(friend).update({
                                no_of_friends: firebase.firestore.FieldValue.increment(1)
                            });
                            docRef.doc(emailname).collection('friends').doc(friend).set({id:friend,lastMessage:'',lastTime:new Date().getTime()});
                            docRef.doc(emailname).update({
                                no_of_friends: firebase.firestore.FieldValue.increment(1)
                            });
                            }
                      }
                      else{
                          alert("not exists");
                      }
                     });
                }
                document.getElementById("search").disabled = false;
                document.getElementById("searchbtn").disabled = false;
            
        }

        function showFriends(){
            var emailname = ename(firebase.auth().currentUser.email);
            var listItem = '<li class ="list-group-item list-group-item-action"><div class ="row"><div class ="col-md-2"><img src ="images/pp.png" class ="friend-pic"/></div><div class="col-md-10" style ="cursor: pointer; "><div class="name" >new</div><div class="under-name">Name</div></div></div></li>';
            var docRef = firebase.firestore().collection('User').doc(emailname);
            var no_of_friends;
            docRef.onSnapshot( function(doc){
                MyPhoto = doc.data().photo;
                no_of_friends = doc.data().no_of_friends;
                document.getElementById('listView').innerHTML = '';
                for(var cnt=0;cnt<no_of_friends;cnt++){
                    document.getElementById('listView').innerHTML += listItem;
                }
            });

            var i;
                docRef.collection('friends').orderBy('lastTime', 'desc').onSnapshot(function(collection){
                    if(collection.size!=0){
                        i=0;
                        collection.forEach(function(doc) {
                            if(doc.data().lastMessage.localeCompare('') == 0)
                            {
                                document.getElementsByClassName('under-name')[i].innerHTML = "";
                            }
                            // document.getElementsByClassName('under-name')[i].innerHTML = 'Photo'+"<span style=\" float:right\">"+new Date(doc.data().lastTime).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })+"</span>";
                            else{
                                var message = doc.data().lastMessage;
                                if(message.length >= 40){
                                    message = message.slice(0,40)+'......';
                                }
                           document.getElementsByClassName('under-name')[i].innerHTML = message+"<span style=\" float:right\">"+new Date(doc.data().lastTime).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })+"</span>";
                            }
                        setName(doc.id,i,'name',null,null);
                        i++;
                        });
                    }
                });

                docRef.collection('group').onSnapshot(function(grpDocs){
                    var size = grpDocs.size;
                    if(size!=0){
                        i=no_of_friends;
                        console.log(i);
                        grpDocs.forEach(function(doc){
                            grpid = doc.id;
                            document.getElementById('listView').innerHTML += listItem;
                            console.log(i);
                            setGroupDetails(i,grpid);
                            i++;
                        });
                    }
                });
        }

        function setGroupDetails(i,grpid){
            var rootRef = firebase.firestore().collection('Group');
            rootRef.doc(grpid).onSnapshot(function(snapshot)
                   {
                            var grpName = snapshot.data().name;
                            var grplastMessage = snapshot.data().lastMessage;
                            var grplastMessageBy = snapshot.data().lastMessageBy;
                            var grplastTime = snapshot.data().lastTime;
                            var grpAdmin = snapshot.data().admin;
                            var grpPhoto = snapshot.data().photo;
                            var grpMembers = snapshot.data().members;


                            console.log(grpAdmin+grpName+grplastTime+grpid+"\n"+grpMembers+"\n"+grplastMessage);
                            document.getElementsByClassName('name')[i].innerHTML = grpName;
                            document.getElementsByClassName('friend-pic')[i].setAttribute('src',grpPhoto);
                            document.getElementsByClassName('list-group-item list-group-item-action')[i].addEventListener('click',function(){StartChatGroup(i,grpid)});
                            if(grplastMessage==null  || grplastMessage.localeCompare('') == 0)
                            {
                                document.getElementsByClassName('under-name')[i].innerHTML = "<span style=\" float:right\">"+new Date(grplastTime).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })+"</span>";
                            }
                            
                            else
                            {
                                if(grplastMessage.length >= (40-grplastMessageBy.length)){
                                    grplastMessage = grplastMessage.slice(0,(40-grplastMessageBy.length))+'....';
                                }
                           document.getElementsByClassName('under-name')[i].innerHTML = "<b>"+grplastMessageBy+"</b> : "+grplastMessage+"<span style=\" float:right\">"+new Date(grplastTime).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })+"</span>";
                            }
                            var str = grpMembers.toString();
                            if(str.length > 100){
                                str = str.slice(0,100);
                            }
                            document.getElementById('LastSeen').innerHTML = str;
                   });
        }

        function setName(emailname,i,className,idName,grp){
            if(grp!=null){
                var docRef = firebase.firestore().collection('Group').doc(emailname);
            }
            else{
                var docRef = firebase.firestore().collection('User').doc(emailname);
            }
            docRef.onSnapshot( function(doc){
                    if(className != null){
                        document.getElementsByClassName('friend-pic')[i].setAttribute('src',doc.data().photo);
                        document.getElementsByClassName(className)[i].innerHTML = doc.data().name;
                        document.getElementsByClassName('list-group-item list-group-item-action')[i].addEventListener('click',function(){StartChat(i,emailname)});
                    }
                    else if(idName != null){
                        document.getElementById('FriendProfilePic').setAttribute('src',doc.data().photo);
                        document.getElementById(idName).innerHTML = doc.data().name;
                    }
            })
        }

        function SendMessage(){
            var time = new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
            var message=`
            <div class="row justify-content-end">
            <div class="col-6 col-sm-5 col-md-5 ">
                <p class="sent float-right "> ${
                    document.getElementById('txtMessage').value
                }
                <span class="time float-right" id="curtime">${
                    time
                }
                </span>
            </p>
            </div>
            <div class="col-2 col-sm-1 col-md-1 float-right">
                <img src=${
                    MyPhoto
                } class="profile-pic"/>
            </div>
       
        </div>` ;
    
        
        if(document.getElementById('txtMessage').value != ""){
            var emailname = ename(firebase.auth().currentUser.email);
            var text = document.getElementById('txtMessage').value;
            var name;
            var db = firebase.firestore();
            if(curGroup!=null && curGroup.localeCompare('')!=0){
                childname = curGroup;
            }
            else{
                if(emailname<curFriend){var childname = emailname+'__'+curFriend}
                else{var childname = curFriend+'__'+emailname}
            }
            db.collection('User').doc(emailname).get().then(function(snapshot){
                name = snapshot.data().name;
                db.collection('Messages').doc(childname).collection('messages').add({
                    'ename':emailname,
                    'name':name,
                    'text':text,
                    'type':'text',
                    'res':'',
                    'time': new Date().getTime()
                })
            });

            

        document.getElementById('messages').innerHTML +=message;                   
        document.getElementById('txtMessage').value='';
        document.getElementById('txtMessage').focus();
        document.getElementById('messages').scrollTo(0,document.getElementById('messages').scrollHeight);
        }
    }
    
        
      function showMessage(text,timestamp,type,res){
            var time = new Date(timestamp).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
            if(type=='text'){
            var message=`
            <div class="row justify-content-end">
            <div class="col-6 col-sm-5 col-md-5 ">
                <p class="sent float-right "> ${
                    text
    
                }
                
                <span class="time float-right" id="curtime">${
                    time
                }
                </span>
            </p>
            </div>
            <div class="col-2 col-sm-1 col-md-1 float-right">
                <img src=${
                    MyPhoto
                } class="profile-pic"/>
            </div>
       
        </div>`;
            }
            if(type=='img')
            {
               
               var message=`
               <div class="row justify-content-end">
               <div class="col-6 col-sm-5 col-md-5 ">
                  
               <img src='${res}'  width="300" height="300" class="sent float-right" />
    
                   <span class="time float-right" id="curtime">${
                       time
                   }
                   </span>
               </p>
               </div>
               <div class="col-2 col-sm-1 col-md-1 float-right">
                   <img src=${
                       MyPhoto
                   } class="profile-pic"/>
               </div>
          
           </div>`
           document.getElementById('messages').scrollTo(0,document.getElementById('messages').scrollHeight);
            }
            if(type=='doc')
            {
               
               var message=`
               <div class="row justify-content-end">
               <div class="col-6 col-sm-5 col-md-5 ">
                  
               
              
               
               <a href='${res}' download >
               <img src='download.jpg' class="sent float-right" />
               </a>
               
                   <span class="time float-right" id="curtime">${
                       time
                   }
                   </span>
               </p>
               </div>
               <div class="col-2 col-sm-1 col-md-1 float-right">
                   <img src=${
                       MyPhoto
                   } class="profile-pic"/>
               </div>
          
           </div>`
           document.getElementById('messages').scrollTo(0,document.getElementById('messages').scrollHeight);
            }
    
            if(type=="video")
            {
               
                var message=`
                <div class="row justify-content-end">
                <div class="col-6 col-sm-5 col-md-5 ">
    
                <video width="300" height="300" class="sent float-right" controls>
                <source src='${res}' type="video/mp4">
                </video>
    
                    <span class="time float-right" id="curtime">${
                        time
                    }
                    </span>
                </p>
                </div>
                <div class="col-2 col-sm-1 col-md-1 float-right">
                    <img src=${
                        MyPhoto
                    } class="profile-pic"/>
                </div>
           
            </div>`
            document.getElementById('messages').scrollTo(0,document.getElementById('messages').scrollHeight);
             }
    
            
           
    
        document.getElementById('messages').innerHTML +=message;                   
        document.getElementById('txtMessage').value='';
        document.getElementById('txtMessage').focus();
        document.getElementById('messages').scrollTo(0,document.getElementById('messages').scrollHeight);
    }
    
    function receiveMessage(text,timestamp,type,res){
        var time = new Date(timestamp).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        var style = 'display:none';
        var subject = text;
        var Photo = curFriendPhoto;
        if(curGroup!=null && curGroup.localeCompare('')!=0){
            Photo = curGroupFriendPhoto; 
            subject = curGroupFriend+'\n'+ text;
            style = 'display:block';
        }
        if(type=="img"){
    
            var message = `<div class="row">
            <div class="col-2 col-sm-1 col-md-1">
                <img src=${
                    curFriendPhoto
                } class="profile-pic"/>
            </div>
            <div class="col-6 col-sm-5 col-md-5">
            <img src ='${res}'  width="300" height="300" class="receive " />
                <span class="time float-right">${
                    time
                }</span>
             </p>
           </div>
       </div>`;
            
       document.getElementById('messages').scrollTo(0,document.getElementById('messages').scrollHeight);
        }
    
        if(type=="text"){
    var message = `<div class="row">
           <div class="col-2 col-sm-1 col-md-1">
               <img src=${
                   Photo
               } class="profile-pic"/>
           </div>
           <div class="col-6 col-sm-5 col-md-5">
           <p style=\"${style}\">${
               curGroupFriend
           }</p>
            <p class="receive"> ${
                text
            }
               <span class="time float-right">${
                   time
               }</span>
            </p>
          </div>
      </div>`;
      document.getElementById('messages').scrollTo(0,document.getElementById('messages').scrollHeight);
            }
    
            if(type=="doc"){
    
                var message = `<div class="row">
           <div class="col-2 col-sm-1 col-md-1">
               <img src=${
                   curFriendPhoto
               } class="profile-pic"/>
           </div>
           <div class="col-6 col-sm-5 col-md-5">
           <a href='${res}' download >
           <img src='download.jpg' class="receive" />
           </a>
               <span class="time float-right">${
                   time
               }</span>
            </p>
          </div>
      </div>`;
      document.getElementById('messages').scrollTo(0,document.getElementById('messages').scrollHeight);
    
            }
    
            if(type=="video"){
    
                var message = `<div class="row">
           <div class="col-2 col-sm-1 col-md-1">
               <img src=${
                   curFriendPhoto
               } class="profile-pic"/>
           </div>
           <div class="col-6 col-sm-5 col-md-5">
           <video width="300" height="300" class="receive" controls>
           <source src='${res}' type="video/mp4">
           </video>
               <span class="time float-right">${
                   time
               }</span>
            </p>
          </div>
      </div>`;
      document.getElementById('messages').scrollTo(0,document.getElementById('messages').scrollHeight);
    
            }

            
      document.getElementById('messages').innerHTML +=message;
                               
        document.getElementById('txtMessage').value='';
        document.getElementById('txtMessage').focus();
        document.getElementById('messages').scrollTo(0,document.getElementById('messages').scrollHeight);
    }
    
    function ChooseImage() {
        document.getElementById('imageFile').click();
    }
    function ChooseDoc() {
        document.getElementById('imgFile').click();
    }
    function ChooseVideo() {
        document.getElementById('videoFile').click();
    }
    
    
      ///////////
    
      function SendImage(input) {
    
        var fake_path=document.getElementById('imageFile').value;
        var rk= fake_path.split("\\").pop();
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById("dp").setAttribute("src",e.target.result);
    
                if(firebase.auth().currentUser!=null){
                var email = firebase.auth().currentUser.email;
                var emailname = ename(email);
               
                if(emailname<curFriend){var childname = emailname+'__'+curFriend}
                else{var childname = curFriend+'__'+emailname} 
                
                firebase.firestore().collection('Messages').doc(childname).collection('messages').add({
    
                    'ename':emailname,
                    'text':'',
                    'res':'',
                    'type':'img',
                    'time': new Date().getTime()
                    }).then(function(doc){
                        var storageRef = firebase.storage().ref('messages/'+childname+'/image/'+doc.id+'/'+rk);
                        storageRef.putString(e.target.result, 'data_url').then(function(snapshot) {
                            storageRef.getDownloadURL().then(function(url) {
                                firebase.firestore().collection('Messages').doc(childname).collection('messages').doc(doc.id).update({
                                    'res':url,
                                    'time': new Date().getTime()
                                });
                              
                              });
                              alert('Uploaded a blob or file!'+emailname);
                             });;
                    });

                }
            };
            reader.readAsDataURL(input.files[0]);
        }
    }
    
    function SendVideo(input) {
    
        var fake_path=document.getElementById('videoFile').value;
        var rk= fake_path.split("\\").pop();
    
    
        if(input.files[0].size > 2097152){
            alert("File is too big!");
            this.value = "";
         }
    
       else{
         if (input.files && input.files[0]) {
       var reader = new FileReader();
       reader.onload = function (e) {
           alert("hi");
           document.getElementById("dp").setAttribute("src",e.target.result);
    
           if(firebase.auth().currentUser!=null){
           var email = firebase.auth().currentUser.email;
           var emailname = ename(email);
          
           if(emailname<curFriend){var childname = emailname+'__'+curFriend}
           else{var childname = curFriend+'__'+emailname}   

           firebase.firestore().collection('Messages').doc(childname).collection('messages').add({
    
            'ename':emailname,
            'text':'Video',
            'res':'',
            'type':'video',
            'time': new Date().getTime()
            }).then(function(doc){
                var storageRef = firebase.storage().ref('messages/'+childname+'/video/'+doc.id+'/'+rk);
                storageRef.putString(e.target.result, 'data_url').then(function(snapshot) {
                    storageRef.getDownloadURL().then(function(url) {
                        firebase.firestore().collection('Messages').doc(childname).collection('messages').doc(doc.id).update({
                            'res':url,
                            'time': new Date().getTime()
                        });
                      
                      });
                      alert('Uploaded a blob or file!'+emailname);
                     });;
            });
           }
       };
       reader.readAsDataURL(input.files[0]);
    }
    }
    }
    function myFunction(input) {
    
         var fake_path=document.getElementById('imgFile').value;
             var rk= fake_path.split("\\").pop();
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                alert("hi");
                document.getElementById("dp").setAttribute("src",e.target.result);
    
                if(firebase.auth().currentUser!=null){
                var email = firebase.auth().currentUser.email;
                var emailname = ename(email);
               
                if(emailname<curFriend){var childname = emailname+'__'+curFriend}
                else{var childname = curFriend+'__'+emailname} 
                
                firebase.firestore().collection('Messages').doc(childname).collection('messages').add({
    
                    'ename':emailname,
                    'text': rk,
                    'res':'',
                    'type':'doc',
                    'time': new Date().getTime()
                    }).then(function(doc){
                        var storageRef = firebase.storage().ref('messages/'+childname+'/doc/'+doc.id+'/'+rk);
                        storageRef.putString(e.target.result, 'data_url').then(function(snapshot) {
                            storageRef.getDownloadURL().then(function(url) {
                                firebase.firestore().collection('Messages').doc(childname).collection('messages').doc(doc.id).update({
                                    'res':url,
                                    'time': new Date().getTime()
                                });
                              
                              });
                              alert('Uploaded a blob or file!'+emailname);
                             });;
                    });
                
                }
            };
            reader.readAsDataURL(input.files[0]);
        }
    }
    
    
    
    
    loadAllEmoji();
    
    function loadAllEmoji() {
        var emoji = '';
        for (var i = 128512; i <= 128566; i++) {
            emoji += `<a href="#" style="font-size: 22px;" onclick="getEmoji(this)">&#${i};</a>`;
        }
        
    
        document.getElementById('smiley').innerHTML = emoji;
    }
    
    function showEmojiPanel() {
        document.getElementById('emoji').removeAttribute('style');
    }
    
    function hideEmojiPanel() {
        document.getElementById('emoji').setAttribute('style', 'display:none;');
    }
    
    function getEmoji(control) {
        document.getElementById('txtMessage').value += control.innerHTML;
    }


        function showInput(){

            var add =`<li class="list-group-item" style="background-color:#f8f8f8;">
            <input type ="text" id="addBar" placeholder ="   Add Participants"    style="width: 88%;" class="form-rounded bar"/><button id="addbtn" style="float:right" class="bar" onclick="addParticipants(participants)" >Add</button>
        </li>
        <li class="list-group-item" style="background-color:#f8f8f8;">
        <button id="createGroup" class="bar" onclick="CreateGroup(participants)">Create Group</button>
    </li>`;
        document.getElementById('dd').innerHTML =add; 

           }
           function addParticipants(participants){
               var input = document.getElementById('addBar').value;
               if(input !='' && input!=null){
                document.getElementById('addBar').value = '';
                rootRef = firebase.firestore();
                userRef = rootRef.collection('User');
                emailname = ename(firebase.auth().currentUser.email);
                var myName;
                userRef.doc(emailname).get().then(function(doc){
                    myName = doc.data().name;
                })
                if(input!=emailname){
                    userRef.doc(input).get().then((docSnapshot) => {
                     if (docSnapshot.exists) 
                     {
                        participants.push(input);
                        //console.log(participants);
                     }
                    });
                }

               }
           }

           function SearchBar() {
            var input, filter, ul, li, a, i, txtValue;
            
            input = document.getElementById("search");
            filter = input.value.toUpperCase();
           
            ul = document.getElementById("listView");
            li = ul.getElementsByTagName("li");
         
          /*  for (i = 0; i < li.length; i++) {
                a = li[i].getElementsByTagName("p")[0];
                txtValue = a.textContent || a.innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    li[i].style.display = "";
                } else {
                    li[i].style.display = "none";
                }
            }
            */
        }

        function SearchUser() {
           
            var input, filter, ul, li, a, i, txtValue;
           
            input = document.getElementById("sp");
            
            filter = input.value.toUpperCase();
           
            ul = document.getElementById("dd");
            li = ul.getElementsByTagName("li");
            
            for (i = 0; i < li.length; i++) {
               
                a = li[i].getElementsByTagName("p")[0];
                
              
                txtValue = a.textContent || a.innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                  
                    li[i].style.display = "";
                } else {
                    li[i].style.display =none;
                }
            }
        }


        function FriendList(){ 

            var add = '';
            var  docRef = firebase.firestore().collection('User');
            docRef.onSnapshot( function(collection){
             
                
            {
                add= `<li class="list-group-item" style="background-color:#f8f8f8;">
                <input type="text" placeholder="Search or new chat" id="sp"  onkeyup=" SearchUser()"   class="form-control form-rounded" />
            </li>`;
                              
            }
            
                      collection .forEach(function (doc) {
                       
                                var user=doc.data
            
                                Photo = doc.data().photo
                                Name  = doc.data().name
            
                            
                                add += `<li class="list-group-item list-group-item-action">
                                <div class="row">
                                    <div class="col-md-2">
                                        <img src="${Photo}" class="rounded-circle friend-pic" />
                                    </div>
                                    <div class="col-md-10" style="cursor:pointer;">
                                
                                        <p class="name" >${Name}</p>
                                            <button class="btn btn-sm btn-defualt" style="float:right;"><i class="fas fa-user-plus"></i> Add</button>
                                            
                                            <button class="btn btn-sm btn-defualt" style="float:right;"><i class="fas fa-user-plus"></i> Remove</button>
                                        </div>
                                    </div>
                                </div>
                            </li>`;
              
            });
            document.getElementById('dd').innerHTML = add;
            
            });
            }
        
            var participants= [];
            var i=0;
            function GroupList(){ 
                participants = [];
                i=0;
                document.getElementById('pp').innerHTML = '';
            
            }
            
            function Onup(){  
                    
               input  =  document.getElementById('search2').value;
               document.getElementById('search2').value = '';

                               emailname = ename(firebase.auth().currentUser.email);
                               if(input.length > 0 && input!=emailname){
                            var  docRef = firebase.firestore().collection('User');
        
                            docRef.doc(input).get().then((docSnapshot) => {

                             if (docSnapshot.exists) {
                                if(participants.length == 0 || !participants.includes(docSnapshot.id)){

                               var MyPhoto = docSnapshot.data().photo
                               var name =docSnapshot.data().name
                               var id = docSnapshot.id;
                              
                               var add = '';
                              
        
                                add = `<li class="list-group-item list-group-item-action" id="listItem${i}">
                                <div class="row">
                                    <div class="col-md-2">
                                        <img src="${MyPhoto}" class="rounded-circle friend-pic" />
                                    </div>
                                    <div class="col-md-10" style="cursor:pointer;">
                                   
                                        <p class="name" >${name}</p>  
                                        <p id="idName${i}" style="visibility: hidden;">${id}</p>              
                                            <button class="btn btn-sm btn-defualt" onclick="remove(${i})" name="gg" id="0" value="0" style="float:right;"><i class="fas fa-user-plus"></i> Remove</button>
                                        </div>
                                    </div>
                                </div>
                            </li>`;
                          
                            document.getElementById('pp').innerHTML += add;
                            participants.push(id);
                            //console.log(participants);
                            //console.log(i);
                            i++;
                            
                             }  
                            }
                });
               }
            }

            function createGroup(){
                if(participants.length >= 2){
                var docid;
                //console.log(participants);
                emailname = ename(firebase.auth().currentUser.email);
                if(!participants.includes(emailname))
                {
                    participants.push(emailname);
                }
                rootRef = firebase.firestore();
                rootRef.collection('Group').add({
                    admin:emailname,
                    lastMessage:'',
                    lastMessageBy:'',
                    lastTime:new Date().getTime(),
                    members:participants,
                    name:'helo',
                    photo:'images\\groupDp.png'
                }).then(function(snapshot){
                    docid = snapshot.id;
                    var userRef = rootRef.collection('User');
                    var docs;
                    for(docs of participants){
                    userRef.doc(docs).collection('group').doc(docid).set({'id':docid}).then(function(docsnapshot){
                        alert("group Created")
                    })
                }
                });
                
            }
            else{
                alert("Not enough members !");
            }

            $("#MyPopup").modal("hide");
            }


            function SearchUser() {
               
                var input, filter, ul, li, a, i, txtValue;
               
                input = document.getElementById("sp");
                
                filter = input.value.toUpperCase();
               
                ul = document.getElementById("dd");
                li = ul.getElementsByTagName("li");
                
                for (i = 0; i < li.length; i++) {
                   
                    a = li[i].getElementsByTagName("p")[0];
                    
                  
                    txtValue = a.textContent || a.innerText;
                    if (txtValue.toUpperCase().indexOf(filter) > -1) {
                      
                        li[i].style.display = "";
                    } else {
                        li[i].style.display =none;
                    }
                }
            }
        
        function remove(k){
                    var p= document.getElementsByName("gg").length;
                   var w= parseInt(k);
                   var name = document.getElementById("idName"+w).innerHTML ;
                    var num = participants.indexOf(name);
                    //console.log("idName"+w+".."+name+".."+num);
                    if(num > -1){
                        participants.splice(num,1);
                        //console.log(participants);
                    }
                    document.getElementById("listItem"+w).remove();
                    
                }

////////////////////////////////////////////////////////////////////////////
function signIn(){

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

function app(user){

    if (user != null) {
        document.getElementById('lnkSignOut').removeAttribute('style');
        var email = user.email;
        var emailname = ename(email);
        firebase.firestore().collection('User').doc(emailname).onSnapshot(function(doc) {
            document.getElementById("imgProfile").setAttribute("src",doc.data().photo);
        });
    }
}

function ename(email){

var num = email.lastIndexOf("@gmail.com");
var emailname = email.slice(0,num);
var result = emailname.match(/\./g);
if(result!=null){
var size = Object.keys(result).length;
for(var i=0;i<size;i++){
emailname = emailname.replace(".",",,");
}
}
return emailname;
}

//window.onload(start());