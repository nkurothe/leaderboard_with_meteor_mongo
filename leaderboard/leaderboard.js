playerList = new Mongo.Collection('players');
Meteor.methods({
  'createPlayer': function (playerName) {
    check(playerName, String);
    var currentUserId = Meteor.userId;
    if(currentUserId) {
      playerList.insert({"name": playerName, "score":0, "createdBy": currentUserId})      
    }
  },
  'removePlayer': function(playerId) {
    check(playerId, String);
    var currentUserId = Meteor.userId;
    if (currentUserId) {
      playerList.remove({"_id": playerId, "createdBy":currentUserId})
    }
  },
  'updateScore': function(playerId, scoreValue) {
    check(playerId, String);
    check(scoreValue, Number);
    var currentUserId = Meteor.userId;
    if(currentUserId) {
      playerList.update({"_id": playerId, "createdBy": currentUserId, $inc: {"score": scoreValue}});      
    }
  }
});
if (Meteor.isClient) {
  Meteor.subscribe('thePlayers');
	/*Template.leaderboard.player = function () {
		return "some text";
	} //Old way of creating helper method */
	Template.leaderboard.helpers({
		'player': function () {
      var currentUserId = Meteor.userId();
			return playerList.find({"createdBy": currentUserId}, {sort:{"score": -1, "name": 1}});
		},
		'totalPlayers': function () {
      var currentUserId = Meteor.userId();
			return playerList.find({"createdBy": currentUserId}).count();
		},
    'selectedClass': function() {
      var playerId = this._id;
      var selectedPlayer = Session.get('selectedPlayer');
      if(playerId == selectedPlayer) {
        return "selected";  
      }
    },
    'selectedPlayer': function () {
      return playerList.findOne({_id: Session.get('selectedPlayer')})
    }
	});

  //Meteor events
	Template.leaderboard.events({
    //Too broad to just use click event, hence added selected event
		/*'click': function () {
      console.log('you clicked');
    }*/ 
    'click .player': function () {
      var playerId = this._id
      Session.set('selectedPlayer',playerId);
      var selectedPlayer = Session.get('selectedPlayer');
    },
    'dblclick .player': function () {
      console.log('you dblclicked a .player element');
    },
    'click .increment': function () {
      var selectedPlayer = Session.get('selectedPlayer');
      Meteor.call('updateScore', selectedPlayer, 5);
      //playerList.update({"_id":selectedPlayer}, {$inc:{"score": 5}});
    },
    'click .decrement': function () {
      var selectedPlayer = Session.get('selectedPlayer');
      Meteor.call('updateScore', selectedPlayer, -5);
      //playerList.update({"_id":selectedPlayer}, {$inc:{"score": -5}});
    },
    'click .remove': function () {
      var selectedPlayer = Session.get('selectedPlayer');
      Meteor.call('removePlayer', selectedPlayer);
      //playerList.remove({_id: selectedPlayer})
    }
	});

  Template.addPlayerForm.events({
    'submit form': function(event) {
      event.preventDefault();
      //var currentUserId = Meteor.userId();
      var playerName = event.target.playerName.value;
      Meteor.call('createPlayer', playerName);
      //playerList.insert({"name": playerName, "score":0, "createdBy": currentUserId})
      event.target.playerName.value="";
    }
  });
}
if (Meteor.isServer) {
  Meteor.publish("thePlayers", function() {
    var currentUserId = this.userId;
    return playerList.find({"createdBy": currentUserId});
  });	
}