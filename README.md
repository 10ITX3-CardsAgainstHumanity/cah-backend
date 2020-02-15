<a name="top"></a>
# cah-backend

## Table of contents

- [cah-backend](#top)
    - [Table of contents](#table-of-contents)
- [Documentation](#documentation) 
    - Diagrams
        - [Sequence diagram - user <-> backend](docs/dist/sequence_diagram_cah_user_backend.svg) [*SequenceDiagram.org*](https://sequencediagram.org/)
    - [Emit](#emit)
        - [Create a game](#create-a-game)
        - [Join a game](#join-a-game)
        - [Leave a game](#leave-a-game)
        - [Start a game](#start-a-game)
        - [Get all cards of a player](#get-all-cards-of-a-player)
        - [Choose a card during selection](#choose-a-card-during-selection)
        - [Get all players in current game](#get-all-players-in-current-game)
        - [Choose a card as czar](#choose-a-card-as-czar)
    - [On](#on)
        - [When a player joined](#when-a-player-joined)
        - [When a player leaved](#when-a-player-leaved)
        - [When a new czar is choosed](#when-a-new-czar-is-choosed)
        - [When a new black card is choosed](#when-a-new-black-card-is-choosed)
        - [When the player card deck is ready](#when-the-player-card-deck-is-ready)
        - [When the game state has changed](#when-the-game-state-has-changed)
        - [When all Player choosed their cards they get every other](#when-all-player-choosed-their-cards-they-get-every-other)
        - [When the czar choose a winner](#when-the-czar-choosed-a-winner)
        - [When the player gets a new card](#when-the-player-gets-a-new-card)

# Documentation

# Emit

## Create a game

Create a game as a host

    game.create
    
### Request
```json
{
  "username": String,
  "gameId": String
}
```

*Also emiits a `game.join`*

### Response
```json
{
  "status": true,
  "msg": {
    "player": {
      "id": String,
      "username": String
    }
  }
}
```

<br />

## Join a game

Join a game as a player

    game.join
    
### Request
```json
{
  "username": String,
  "gameId": String
}
```

### Response
```json
{
  "status": true,
  "msg": {
    "player": {
      "id": String,
      "username": String
    }
  }
}
```

<br />

## Leave a game

    game.leave

<br />    

## Start a game

    game.start
    
### Response
```json
{
  "status": true
}
```

<br />

## Get all cards of a player

    player.cards

### Response
```json
{
  "status": true,
  "msg": {
    "cards": [
      {
        "id": String,
        "text": String
      }     
    ]
  } 
}
```

<br />

## Choose a card during selection

    player.cards.choose

### Request
```json
{
  "cardId": String
}
```

### Response
```json
{
  "status": true
}
```

<br />

## Get all players in current game

    game.players
    
### Response
```json
{
  "status": true,
  "msg": {
    "players": [
      {
        "id": String,
        "username": String,
        "score": Integer,
        "isCzar": Boolean,
        "isHost": Boolean
      }
    ]
  }
}
```

## Choose a card as czar

    game.czar.judge
    
### Request
```json
{
  "playerId": String
}
```

### Respone
```json
{
  "status": true
}
```

<br />

# On

## When a player joined

    player.join

### Response
```json
{
  "status": true,
  "msg": {
    "id": String,
    "username": String
  }
}
```

<br />

## When a player leaved

    player.leave

### Response
```json
{
  "status": true,
  "msg": {
    "id": String,
    "username": String
  }
}
```

<br />

## When a new czar is choosed

    player.czar
    
### Response
```json
{
  "status": true,
  "msg": {
    "id": String,
    "username": String
  }
}
```

<br />

## When a new black card is choosed

    game.cards.black
    
### Response
```json
{
  "status": true,
  "msg": {
    "card": {
      "id": String,
      "text": String,
      "neededAnswers": String
    }
  }
}
```

<br />

## When the player card deck is ready

    player.cards.ready
    
### Response
```json
{
  "status": true
}
```

<br />

## When the game state has changed

    game.state
    
### Response
```json
{
  "status": true,
  "msg": {
    "state": /src/types.ts->GameState as Index
  }
}
```

| GameState | Trigger | Description |
| ---: | :--- | :--- |
| start | The first round must be manual started by the host. Every other round start automatically after the juding state. | A new round is starting up (e.g. choose czar and black card). |  
| selection | Is emitted automatically after a successful start(up).  | Players can now choose their white cards. |  
| judging | Is emitted automatically if every player in the round has choose the right amount of white cards. | The czar can now choose the winner card. |

<br />

## When all Player choosed their cards, during/after selection phase, cards they get every other

    game.players.cards

### Response
```json
{
  "status": true,
  "msg": [
    {
      "playerId": String,
      "cards": [
        {
          "id": String,
          "text": String
        }
      ]
    }
  ] 
}
```

<br />

## When the czar choosed a winner

    game.czar.judged
    
### Response
```json
{
  "status": true,
  "msg": {
    "player": {
      "id": String,
      "username": String,
      "score": Integer
    }
  }
}
```

<br />

## When the player gets a new card

    player.card
    
### Response
```json
{
  "status": true,
  "msg": {
    "card": {
      "id": String,
      "text": String
    }
  }
}
```

<br />
