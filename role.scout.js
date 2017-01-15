/** -------------------------------------------------------------- role.scout --------------------------------------------------------------------
 * @param {Creep} creep 
 * Game.spawns('Spawn1').
 * by Urakake     **/
		
var roleScout = {
    run: function(creep) {
        if(!creep.memory.init){
            init(creep);
        }
        work(creep);
	},
	makeScout: function(spawn){
	    var cap = spawn.room.energyAvailable;
	    var creepName="scout@"+spawn.room.name+"@"+spawn.name+"@"+Game.time;
	    var missingRoom = getMissingScoutRoom(spawn.room);
	    console.log("Creating Creep ("+creepName+")");
	    if(missingRoom!=undefined){
	        return spawn.createCreep( makeBestBody(cap), creepName, { role: 'scout', targetRoom: missingRoom } );
	    }
	},
	checkScouts: function(myRoom){
	    var foundMissing=false;
        if(getMissingScoutRoom(myRoom)!=undefined){
            foundMissing=true
        }
        if(myRoom.memory.numScouts!=0){
            foundMissing=false
        }
        return foundMissing;
	}
};
function getMissingScoutRoom(myRoom){
    var nameOfRoom=undefined;
    for(var i in myRoom.memory.miningRooms){
        var thisRoom = Game.rooms[myRoom.memory.miningRooms[i]];
        if(thisRoom){
            var thisCreep = Game.creeps[thisRoom.memory.scoutName];
            if(thisCreep==undefined){
                thisRoom.memory.scoutName="";
                nameOfRoom = thisRoom.name;
            }
        } else {
            nameOfRoom = myRoom.memory.miningRooms[i];
        }
    }
    return nameOfRoom;
}
function work(creep) {
	if(creep.memory.state == "traverse") {
	    traverse(creep);
	} else if(creep.memory.state == "drone"){
		creep.memory.role="drone";
		creep.memory.init=false;
	}
}

function traverse(creep){
    var targetRoom=creep.memory.targetRoom;
    //console.log(targetRoom+"  "+creep.memory.scoutRoom)
    if(creep.room.name == targetRoom){
        if(creep.pos.x<=48 && creep.pos.y<=48 && creep.pos.x>=1 && creep.pos.y>=1){
            becomeDrone(creep);
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
function becomeDrone(creep){
    creep.memory.role="drone";
    creep.memory.init=false;
    var targetRoom = Game.rooms[creep.memory.targetRoom];
	targetRoom.memory.scoutName=creep.name;
}
function makeBestBody(cap){
    var body = [];
    if(cap<300){   // under 300
        body = makeParts(1,1,1)
    } else if(cap<400){   // 300-399
        body = makeParts(2,2,1)
    } else if(cap<550){   // 400-549
        body = makeParts(2,2,2)
    } else if(cap<800){   // 550-799
        body = makeParts(3,3,3) 
    } else if(cap<1300){   // 800-1299
        body = makeParts(4,4,4)
    } else if(cap<1800){   // 1300-1799
        body = makeParts(4,4,4)
    } else if(cap<2300){   // 1800-2299
        body = makeParts(4,4,4)
    } else {   // 2300+
        body = makeParts(4,4,4)
    }
    return body;
}
function makeParts(moves, carries, works) {
    var list = [];
    for(var i=0;i<moves;i++){
        list.push(MOVE);
    }
    for(var i=0;i<carries;i++){
        list.push(CARRY);
    }
    for(var i=0;i<works;i++){
        list.push(WORK);
    }
    return list;
}
function init(creep) {
    console.log("Initializing Scout - "+creep.name);
    creep.memory.init=true;
    creep.memory.role="scout";
    creep.memory.state="traverse"
    creep.memory.spawnRoom = creep.room.name;
	if(creep.memory.targetRoom!=undefined){      // set array with your name
	    var targetRoom = Game.rooms[creep.memory.targetRoom];
	    if(targetRoom){
	        targetRoom.memory.scoutName=creep.name;
	    }
	} else {
	    console.log("spawning scout with no target")
	}
}
module.exports = roleScout;
// -------------------------------------------------------------- role.scout --------------------------------------------------------------------




