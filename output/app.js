let gameId = undefined;
let players = [];
let cards = [];
let playerName = undefined;
let playerIndex = undefined;
let host = undefined;
let playerId = "";
let showQueue = false;
let mainThemeAudio = new Audio('audio/theme.mp3');
mainThemeAudio.loop = true;
mainThemeAudio.volume = .2;
let contentBG = document.querySelector("body");
let colorMap = {
    "red":"#ff5555",
    "yellow":"#ffaa00",
    "green":"#55aa55",
    "blue":"#5555fd"
}
for(let i=0;i<32;i++){
    playerId += String((Math.floor(Math.random()*10)))
}
playerId = String(playerId)
let methodClick = "click";
socket.on('connect',async ()=>{
    console.log("connected client");
    // create the choosing window to be host or join
    let modalOptions = {
        inDuration:10,
        outDuration:10,
        dismissible:false,
        onCloseEnd: function(e){
            //console.log(e);
            if(e.id != "modal5" && e.id != "modal4") e.remove();
        }
    }
    $('#modal1').modal(modalOptions);
    $('#modal2').modal(modalOptions);
    $('.host-modal').modal(modalOptions);
    $('.join-modal').modal(modalOptions);
    $('#modal5').modal(modalOptions);
    $('#method').modal(modalOptions);
    let modal1 = M.Modal.getInstance($('#modal1'));     
    let modal2 = M.Modal.getInstance($('#modal2'));     
    let method = M.Modal.getInstance($('#method'));     
    let modalHost = M.Modal.getInstance($('.host-modal'));     
    let modalJoin = M.Modal.getInstance($('.join-modal'));     
    let modalChooseColor = M.Modal.getInstance($('#modal5'));
    let chooseColorBtn = document.querySelector("#choosColorBtn");     
    let dblClickBtn = document.querySelector("#dblClickBtn");     
    let snglClickBtn = document.querySelector("#snglClickBtn");   
    method.open();
    dblClickBtn.addEventListener('click',()=>{
        mainThemeAudio.play();
        methodClick = "dblclick";
        method.close();
        modal1.open();
    });
    snglClickBtn.addEventListener('click',()=>{
        mainThemeAudio.play();
        methodClick = "click";
        method.close();
        modal1.open();
    });
    // get user name
    $("#nameEnterBtn").click(()=>{
        let inputText =document.querySelector("#nameInput").value;
        if(!inputText) inputText = "default-name";
        playerName = inputText;
        modal1.close();
        modal2.open();
    })


    let hostBtn = $("#hostBtn");
    let joinBtn = $("#joinBtn");
    let joinGameBtn = $("#joinGameBtn");
    let modalHostClose = $("#modalHostClose");
    
    hostBtn.click(async ()=>{
        host = 1;
        modal2.close();
        // create game as host
        socket.emit("createGame",{
            name: playerName,
            number: 0,
            playerId:playerId
        });
        $("#gameIdText").text("creating the game....");
        socket.on("createdGameId",(data)=>{
                if(data.playerId != playerId)return;
                gameId = data.gameId;
                $("#gameIdText").text(data.gameId);
                playerIndex = 0;
                

        });
        modalHost.open();      
    });
    modalHostClose.click( ()=>{
        showQueue = true;
        modalHost.close();  
        let playersCollection  = document.querySelector("#queue");
        if(playersCollection.innerHTML.trim() == ""){
        let playerList= document.createElement('li');
        playerList.classList.add("collection-item")
        playerList.innerText = playerName+" (You)";
        playersCollection.appendChild(playerList);
        
        }
        let startGameBtn = document.createElement("button");
        startGameBtn.id = "startGameBtn";
        startGameBtn.innerText = "start game";
        startGameBtn.className = "waves-effect waves-light btn";
        startGameBtn.addEventListener("click",()=>{
            socket.emit("startGame",{
                gameId:gameId
            });

        });
        document.querySelector("#startGameDiv").appendChild(startGameBtn);
        // add game id to floating point
        //<a class="btn-floating btn-large waves-effect waves-light red"><i class="material-icons">add</i></a
        let showGameId = document.createElement('a');
        showGameId.className = "btn-floating btn-large waves-effect waves-light teal"
        showGameId.innerText = "gameId";
        showGameId.addEventListener("click",()=>{
            swal.fire({
               confirmButtonColor:"#2c3e50",
                icon: 'info',
                title: "your game id is : "+gameId,      
                showConfirmButton:true
            });
        });
        // intialize chat button 
        let sideNavChat = document.createElement('ul');
        sideNavChat.className = "sidenav";
        sideNavChat.id = "chat-slide";
        let chatBox = document.createElement('div');
        chatBox.id = "chatBox";
        sideNavChat.appendChild(chatBox)
        let chatInputDiv = document.createElement('div');
        chatInputDiv.className = "input-field col s12";
        let chatInputTextarea = document.createElement('textarea');
        chatInputTextarea.className = "materialize-textarea";
        chatInputTextarea.setAttribute("placeholder","enter your message");
        chatInputTextarea.addEventListener('keypress', function (e) {
           
            if (e.key === 'Enter') {
                e.preventDefault();
              // send the message
              let text = chatInputTextarea.value.trim();
              if(!text) return;
              chatInputTextarea.value = "";
              socket.emit("chatMessage",{
                  gameId:gameId,
                  playerName:playerName,
                  message:text,
                  playerId:playerId
              });
              
            }
        });
        chatInputDiv.appendChild(chatInputTextarea);
        sideNavChat.appendChild(chatInputDiv);
        document.body.appendChild(sideNavChat);
        let sideNavchatInstance =  M.Sidenav.init(document.querySelectorAll('.sidenav'),{
            inDuration:10,
            outDuration:10
        });
        let showChatBtn = document.createElement('a');
        showChatBtn.className = "sidenav-trigger btn"
        showChatBtn.innerText = "chat";
        showChatBtn.setAttribute("data-target","chat-slide");
        document.body.appendChild(showChatBtn);
        document.body.appendChild(showGameId);
        


    })
    joinBtn.click(()=>{
        host = 0;
        modal2.close();
        modalJoin.open();
    }); 
    joinGameBtn.click(async ()=>{
        
        if(!document.querySelector("#gameIdInput").value){
            modalJoin.close();
             setTimeout(()=>{
                modalJoin.open();
             },20);
             swal.fire({
               confirmButtonColor:"#2c3e50",
                icon: 'error',
                title: "please enter valid game id",      
                showConfirmButton:false,
                timer:500
             }) 
            }
        else{
            gameId = document.querySelector("#gameIdInput").value;
            modalJoin.close();
            socket.emit("joinGame",{
                gameId:gameId,
                name:playerName,
                playerId:playerId
            });
            socket.on("joinedGame",(data)=>{
                if(data.playerId != playerId)return;
                console.log("joined game with id "+data.gameId);
                showQueue = true;
                playerIndex = data.index;
                let showGameId = document.createElement('a');
                showGameId.className = "btn-floating btn-large waves-effect waves-light teal"
                showGameId.innerText = "gameId";
                showGameId.addEventListener("click",()=>{
                    swal.fire({
               confirmButtonColor:"#2c3e50",
                        icon: 'info',
                        title: "your game id is : "+gameId,      
                        showConfirmButton:true
                    });
                });
                // intialize chat button 
                let sideNavChat = document.createElement('ul');
                sideNavChat.className = "sidenav";
                sideNavChat.id = "chat-slide";
                let chatBox = document.createElement('div');
                chatBox.id = "chatBox";
                sideNavChat.appendChild(chatBox)
                let chatInputDiv = document.createElement('div');
                chatInputDiv.className = "input-field col s12";
                let chatInputTextarea = document.createElement('textarea');
                chatInputTextarea.className = "materialize-textarea";
                chatInputTextarea.setAttribute("placeholder","enter your message");
                chatInputTextarea.addEventListener('keypress', function (e) {
                
                    if (e.key === 'Enter') {
                        e.preventDefault();
                    // send the message
                    let text = chatInputTextarea.value.trim();
                    if(!text) return;
                    chatInputTextarea.value = "";
                    socket.emit("chatMessage",{
                        gameId:gameId,
                        playerName:playerName,
                        message:text,
                        playerId:playerId
                    });
                    
                    }
                });
                chatInputDiv.appendChild(chatInputTextarea);
                sideNavChat.appendChild(chatInputDiv);
                document.body.appendChild(sideNavChat);
                let sideNavchatInstance =  M.Sidenav.init(document.querySelectorAll('.sidenav'),{
                    inDuration:10,
                    outDuration:10
                });
                let showChatBtn = document.createElement('a');
                showChatBtn.className = "sidenav-trigger btn"
                showChatBtn.innerText = "chat";
                showChatBtn.setAttribute("data-target","chat-slide");
                document.body.appendChild(showChatBtn);
                document.body.appendChild(showGameId);
            });
        }

    })
    
    socket.on("gameCreated",(data)=>{
        if(gameId != data.gameId) return;
        document.querySelector("#queue").innerHTML = "";
        document.querySelector("#queue").className= "";
        if(document.querySelector("#startGameBtn"))document.querySelector("#startGameBtn").remove();
        players = [];
        for(let player of data.players){
            players.push({
                name: player.name,
                number: player.number,
                score:player.score
            });
        }
        
        ReactDOM.render(
            React.createElement(Players, {
                players: players,
                index:playerIndex,
                currentTurn:data.currentPlayerTurn
            }, null),
            document.querySelector(".players ul")
        );
         
        ReactDOM.render(
            React.createElement(Board, {currentCard: {value:data.currentCard.value,color:data.currentCard.color,isSpecial:data.currentCard.isSpecial}}, null),
            document.querySelector(".board")
        );

        contentBG.style.backgroundColor = colorMap[data.currenColor];
        let drawBtn = document.createElement("button");
        drawBtn.className = "waves-effect waves-light btn";
        drawBtn.innerText = "draw card";
        let endTurnBtn = document.createElement("button");
        endTurnBtn.className = "waves-effect waves-light btn";
        endTurnBtn.innerText = "end turn";
        drawBtn.addEventListener("click",()=>{
            socket.emit("drawCard",{
                gameId:gameId,
                playerId:playerId,
                playerIndex:playerIndex
            });
        });
        endTurnBtn.addEventListener("click",()=>{
            socket.emit("endTurn",{
                gameId:gameId,
                playerId:playerId,
                playerIndex:playerIndex
            })
        })
        document.querySelector(".col").appendChild(drawBtn);
        document.querySelector(".col").appendChild(endTurnBtn);
    })
    socket.on("gameUpdated",(data)=>{
        if(gameId != data.gameId) return;
        if(playerIndex == data.currentPlayerTurn && !data.cardDrawn){
            swal.fire({
               confirmButtonColor:"#2c3e50",
                icon: 'info',
                title: 'Your Turn',
                timer: 500,
                
                showConfirmButton:false
            });
        }
        ReactDOM.unmountComponentAtNode(document.querySelector(".players ul"))
        ReactDOM.unmountComponentAtNode(document.querySelector(".board"))
        ReactDOM.unmountComponentAtNode(document.querySelector("#queue"))
        players = [];
        for(let player of data.players){
            players.push({
                name: player.name,
                number: player.number,
                score:player.score
            });
        }
        
        ReactDOM.render(
            React.createElement(Players, {
                players: players,
                index:playerIndex,
                currentTurn:data.currentPlayerTurn
            }, null),
            document.querySelector(".players ul")
          );
         
          ReactDOM.render(
            React.createElement(Board, {currentCard: {value:data.currentCard.value,color:data.currentCard.color,isSpecial:data.currentCard.isSpecial}}, null),
            document.querySelector(".board")
          );
          contentBG.style.backgroundColor = colorMap[data.currenColor];
     
    });

    socket.on("getCards",(data)=>{
        if(playerId != data.playerId) return;
        cards = data.cards;
        //document.querySelector("#frame").innerHTML = "";
        var $owl = $('.owl-carousel');
        $owl.trigger('destroy.owl.carousel');
        ReactDOM.unmountComponentAtNode(document.querySelector("#frame"));
        ReactDOM.render(
            React.createElement(Deck,
            {
                cards:cards
            },
            null)
        ,document.querySelector("#frame"));
        let cardsDoc = document.querySelectorAll(".card-deck");
        cardsDoc.forEach(card =>{
            card.addEventListener(methodClick,(e)=>{
                let data = {
                    gameId:gameId,
                    playerIndex:playerIndex,
                    card:{
                        isspecial:e.target.attributes.isspecial.value=="1"?true:false,
                        value:Number(e.target.attributes.value.value),
                        color:e.target.attributes.color.value
                    },
                    cardIndex:Number(e.target.attributes.index.value),
                    playerId:playerId
                }
                socket.emit("playCard",data);
            })
        })
    });
    socket.on("queueChanged",(data)=>{
        if(gameId != data.gameId)return;
        players = data.players;
        let playersCollection  = document.querySelector("#queue");
        playersCollection.innerHTML = "";
        for(let player of players){
            let playerList= document.createElement('li');
            playerList.classList.add("collection-item")
            playerList.innerText = player.name;
            if(player.index == playerIndex)playerList.innerText += " (You)";
            playersCollection.appendChild(playerList);
        }
    });

    socket.on("chooseColor",(data)=>{
        if(data.gameId != gameId) return;
        if(playerId != data.playerId)return;
        modalChooseColor.open();
        chooseColorBtn.addEventListener("click",()=>{
            let color = document.querySelector("select").value;
            socket.emit("colorIsChosen",{
                gameId:gameId,
                playerId:playerId,
                playerIndex:playerIndex,
                color:color
            });
        })
    })
    socket.on("wrongMove",(data)=>{
        if(data.gameId != gameId || data.playerId != playerId)return;
        swal.fire({
               confirmButtonColor:"#2c3e50",
            icon: 'error',
            title: 'invalid move',
            timer: 500,
            
            showConfirmButton:false
        });
    })
    socket.on("wrongTurn",(data)=>{
        if(data.gameId != gameId || data.playerId != playerId)return;
        swal.fire({
               confirmButtonColor:"#2c3e50",
            icon: 'error',
            title: 'wait your turn',
            timer: 500,
            
            showConfirmButton:false
        });
    })

    socket.on("cannotDraw",(data)=>{
        if(data.gameId != gameId || data.playerId != playerId)return;
        swal.fire({
               confirmButtonColor:"#2c3e50",
            icon: 'error',
            title: 'cannot draw more cards this turn',
            timer: 500,
            
            showConfirmButton:false
        });
    });
    socket.on("errorInRequest",(data)=>{
        swal.fire({
               confirmButtonColor:"#2c3e50",
            icon: 'error',
            title: data.msg,
            timer: 500,
            
            showConfirmButton:false
        });
    });
    socket.on("gameEnd",(data)=>{
        if(data.gameId != gameId)return;
        if(data.playerId == playerId){
            swal.fire({
               confirmButtonColor:"#2c3e50",
                icon: 'success',
                title:"congtatulations!! You Won",
                onClose: function(){
                    window.location.href = '/';
                },
                confirmButtonText:"reload"

            });
        }else{
            swal.fire({
               confirmButtonColor:"#2c3e50",
                icon: 'info',
                title:"game ended",
                onClose: function(){
                    window.location.href = '/';
                },
                confirmButtonText:"reload"
            });
        }
        
    });
    socket.on("uno",(data)=>{
        if(data.gameId != gameId)return;
        
            swal.fire({
               confirmButtonColor:"#2c3e50",
                icon: 'warning',
                title:"UNO",
                timer:500,
                showConfirmButton:false

            });
        
        
    });
    socket.on("playerDiconnnected",(data)=>{
        if(data.gameId != gameId)return;
        
            swal.fire({
               confirmButtonColor:"#2c3e50",
                icon: 'warning',
                title:"player "+data.playerName+" is diconnected",
                timer:1000,
                showConfirmButton:false

            });
        
        
    });
    socket.on("drawTwo",(data)=>{
        if(data.gameId != gameId)return;
        
            swal.fire({
               confirmButtonColor:"#2c3e50",
                icon: 'warning',
                title:"+2",
                timer:500,
                showConfirmButton:false

            });
        
        
    });
    socket.on("drawFour",(data)=>{
        if(data.gameId != gameId)return;
        
            swal.fire({
               confirmButtonColor:"#2c3e50",
                icon: 'warning',
                title:"+4",
                timer:500,
                showConfirmButton:false

            });
        
        
    });

    socket.on("skipTurn",(data)=>{
        if(data.gameId != gameId)return;
        
            swal.fire({
               confirmButtonColor:"#2c3e50",
                icon: 'warning',
                title:"SKIP",
                timer:500,
                showConfirmButton:false

            });
        
        
    });

    socket.on("reverseTurn",(data)=>{
        if(data.gameId != gameId)return;
        
            swal.fire({
               confirmButtonColor:"#2c3e50",
                icon: 'warning',
                title:"REVERSE",
                timer:500,
                showConfirmButton:false

            });
        
        
    });

    socket.on("messageRecieve",(data)=>{
        if(data.gameId != gameId) return;
        let navChat = document.querySelector('#chatBox');
        let li = document.createElement("li");
        li.innerText = `${data.playerName}: ${data.message}`;
        navChat.appendChild(li);
        navChat.scrollTop = navChat.scrollHeight;
        if(playerId != data.playerId){
            Swal.fire({
                position: 'top-start',
                title: `${data.playerName}: ${data.message}`,
                showConfirmButton: false,
                timer: 15000000,
                backdrop:false,
                customClass:{
                    title: 'swal-title',
                    container: 'swal-container-class',
                }
            })
        }
    })
});

