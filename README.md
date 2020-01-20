<a name="top"></a>
# cah-backend

## Table of contents

- [cah-backend](#top)
    - [Table of contents](#table-of-contents)
- [Documentation](#documentation)
    - [Emit](#emit)
        - [Create a game](#create-a-game)
        - [Join a game](#join-a-game)
        - [Leave a game](#leave-a-game)
        - [Start a game](#start-a-game)
        - [Get all cards of a player](#get-all-cards-of-a-player)
        - [Choose a card during selection](#choose-a-card-during-selection)
    - [On](#on)
        - [When a player joined](#when-a-player-joined)
        - [When a player leaved](#when-a-player-leaved)
        - [When a new czar is choosed](#when-a-new-czar-is-choosed)
        - [When a new black card is choosed](#when-a-new-black-card-is-choosed)
        - [When the player card deck is ready](#when-the-player-card-deck-is-ready)
        - [When the game state has changed](#when-the-game-state-has-changed)
        - [When all Player choosed their cards they get every other](#when-all-player-choosed-their-cards-they-get-every-other)

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
  "status": true
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
    "state": /src/types.ts->GameState
  }
}
```

<br />

## When all Player choosed their cards they get every other

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