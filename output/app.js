let gameId = undefined;
let players = [];
let cards = [];
let playerName = undefined;
let playerIndex = undefined;
let host = undefined;
let playerId = "";
let showQueue = false;
let drawCard = false;
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
        inDuration:100,
        outDuration:100,
        dismissible:false
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
        methodClick = "dblclick";
        method.close();
        modal1.open();
    });
    snglClickBtn.addEventListener('click',()=>{
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
        let playerList= document.createElement('li');
        playerList.classList.add("collection-item")
        playerList.innerText = playerName+" (You)";
        playersCollection.appendChild(playerList);
        let startGameBtn = document.createElement("button");
        startGameBtn.id = "startGameBtn";
        startGameBtn.innerText = "start game";
        startGameBtn.className = "waves-effect waves-light btn";
        startGameBtn.addEventListener("click",()=>{
            socket.emit("startGame",{
                gameId:gameId
            });
            startGameBtn.remove();

        });
        document.querySelector("#startGameDiv").appendChild(startGameBtn);

    })
    joinBtn.click(()=>{
        host = 0;
        modal2.close();
        modalJoin.open();
    }); 
    joinGameBtn.click(async ()=>{
        if(!document.querySelector("#gameIdInput").value) modalJoin.open();
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
            });
        }

    })
    
    socket.on("gameCreated",(data)=>{
        if(gameId != data.gameId) return;
        document.querySelector("#queue").innerHTML = "";
        document.querySelector("#queue").className= "";
        players = [];
        for(let player of data.players){
            players.push({
                name: player.name,
                number: player.number
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
            if(drawCard)return;
            drawCard = 1;
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
                icon: 'info',
                title: 'Your Turn',
                timer: 500,
                
                showConfirmButton:false
            });
        }
        drawCard = 0;
        ReactDOM.unmountComponentAtNode(document.querySelector(".players ul"))
        ReactDOM.unmountComponentAtNode(document.querySelector(".board"))
        ReactDOM.unmountComponentAtNode(document.querySelector("#queue"))
        players = [];

        for(let player of data.players){
            players.push({
                name: player.name,
                number: player.number
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
                drawCard = 0;
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
            icon: 'error',
            title: 'invalid move',
            timer: 500,
            
            showConfirmButton:false
        });
    })
    socket.on("wrongTurn",(data)=>{
        if(data.gameId != gameId || data.playerId != playerId)return;
        swal.fire({
            icon: 'error',
            title: 'wait your turn',
            timer: 500,
            
            showConfirmButton:false
        });
    })

    socket.on("cannotDraw",(data)=>{
        if(data.gameId != gameId || data.playerId != playerId)return;
        swal.fire({
            icon: 'error',
            title: 'cannot draw more cards this turn',
            timer: 500,
            
            showConfirmButton:false
        });
    });
    socket.on("errorInRequest",(data)=>{
        swal.fire({
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
                icon: 'success',
                title:"congtatulations!! You Won"

            });
        }else{
            swal.fire({
                icon: 'info',
                title:"game ended"

            });
        }
        
    });
    socket.on("uno",(data)=>{
        if(data.gameId != gameId)return;
        
            swal.fire({
                icon: 'warning',
                title:"UNO",
                timer:500,
                showConfirmButton:false

            });
        
        
    });
});

