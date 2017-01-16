/** ------------------------------------------------------ role.claimer -----------------------------------------------------
 * @param {Creep} creep 
 * by Urakake     **/
		
var roleClaimer = {
    run: function(creep) {
        if(!creep.memory.init){
            init(creep);
        }
        work(creep);
	},
	makeClaimer: function(spawn){
	    var cap = spawn.room.energyAvailable;
	    var creepName="claimer@"+spawn.room.name+"@"+spawn.name+"@"+Game.time;
	    var missingRoom = getMissingClaimerRoom(spawn.room);
	    console.log("Creating Creep ("+creepName+")");
	    spawn.createCreep( makeBestBody(cap), creepName, { role: 'claimer', targetRoom: missingRoom  } );
	},
	checkClaimers: function(myRoom){
	    var foundMissing=false;
        if(getMissingClaimerRoom(myRoom)!=undefined){
            foundMissing=true
        }
        return foundMissing;
	}
};
function getMissingClaimerRoom(myRoom){
    var nameOfRoom=undefined;
    for(var i in myRoom.memory.miningRooms){
        var thisRoom = Game.rooms[myRoom.memory.miningRooms[i]];
        if(thisRoom && !thisRoom.controller.my){
            var thisCreep = Game.creeps[thisRoom.memory.claimerName];
            if(thisCreep==undefined){
                thisRoom.memory.claimerName="";
                nameOfRoom = thisRoom.name;
            }
        }
    }
    return nameOfRoom;
}
function work(creep) {
    switch(creep.memory.state) {
        case "walkToRoom":
            walkToRoom(creep);
            break;
        case "claimRoom":
            claimRoom(creep);
            break;
        default:
            //creep.memory.state="dump"
    }
}
function claimRoom(creep){
    if(creep.room.memory.capture==true){
        if(creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
        }
    } else {
        if(creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
        }
    }
}
function walkToRoom(creep) {
    var targetRoom=creep.memory.targetRoom;
    //console.log(targetRoom+"  "+creep.memory.scoutRoom)
    if(creep.room.name == targetRoom){
        if(creep.pos.x<=48 && creep.pos.y<=48 && creep.pos.x>=1 && creep.pos.y>=1){
            creep.memory.state="claimRoom";
        } else {
            creep.moveTo(creep.room.controller);
        }
        
    } else {
        voyageOutOfRoom(creep,targetRoom);
    }
}
function voyageOutOfRoom(creep,destRoom) {
    var exitDir = Game.map.findExit(creep.room.name, destRoom);
    var Exit = creep.pos.findClosestByPath(exitDir);
    creep.moveTo(Exit);
}
function makeBestBody(cap){
    var body = [];
    if(cap > 650 && cap <1400){   // 650 - 1399
        body = makeParts(1,1)
    } else if(cap>=1400) {   // 1400+
        body = makeParts(2,2)
    }
    return body;
}
function makeParts(moves, claims) {
    var list = [];
    for(var i=0;i<moves;i++){
        list.push(MOVE);
    }
    for(var i=0;i<claims;i++){
        list.push(CLAIM);
    }
    return list;
}
function init(creep) {
    console.log("Initializing Claimer - "+creep.name);
    creep.memory.init=true;
    creep.memory.role="claimer";
    creep.memory.state="walkToRoom";
    creep.memory.spawnRoom = creep.room.name;
    if(creep.memory.targetRoom!=undefined){      // set array with your name
	    var targetRoom = Game.rooms[creep.memory.targetRoom];
	    targetRoom.memory.claimerName=creep.name;
	} else {
	    console.log("spawning claimer with no target")
	}
}
module.exports = roleClaimer;
//------------------------------------------------------ role.claimer -----------------------------------------------------



