/** ------------------------------------------------------ role.guard -----------------------------------------------------
 * @param {Creep} creep 
 * by Urakake     **/
		
var roleGuard = {
    run: function(creep) {
        if(!creep.memory.init){
            init(creep);
        }
        work(creep);
	},
	makeGuard: function(spawn){
	    var cap = spawn.room.energyAvailable;
	    var creepName="guard"+Game.time+"@"+spawn.room.name+"@"+spawn.name;
	    var missingRoom = getMissingGuardRoom(spawn.room);
	    console.log("Creating Creep ("+creepName+")");
	    spawn.createCreep( makeBestBody(cap), creepName, { role: 'guard', stationRoom: missingRoom } );
	},
	checkGuards: function(myRoom){
	    var foundMissing=false;
        if(getMissingGuardRoom(myRoom)!=undefined){
            foundMissing=true
        }
        return foundMissing;
	}
};
function getMissingGuardRoom(myRoom){
    var nameOfRoom=undefined;
    for(var i in myRoom.memory.miningRooms){
        var thisRoom = Game.rooms[myRoom.memory.miningRooms[i]];
        if(thisRoom){
            var thisCreep = Game.creeps[thisRoom.memory.guardCreep];
            if(thisCreep==undefined){
                thisRoom.memory.guardCreep="";
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
        case "standGuard":
            standGuard(creep);
            break;
        case "attackInvader":
            attackInvaderScum(creep);
            break;
        default:
            //creep.memory.state="dump"
    }
}
function walkToRoom(creep) {
    var targetRoom=creep.memory.stationRoom;
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
function standGuard(creep) {
    var targets = creep.room.find(FIND_HOSTILE_CREEPS);
    if(targets.length>0){
       creep.memory.state="attackInvader"
    } else {
       
    }
}
function attackInvaderScum(creep) {
   var targets = creep.room.find(FIND_HOSTILE_CREEPS);
   if(targets.length>0){
       var target = creep.pos.findClosestByRange(targets);
       if(creep.attack(target)==ERR_NOT_IN_RANGE){
           creep.moveTo(target);
       }
   } else {
       creep.memory.state="standGuard"
   }
}
function voyageOutOfRoom(creep,destRoom) {
    var exitDir = Game.map.findExit(creep.room.name, destRoom);
    var Exit = creep.pos.findClosestByPath(exitDir);
    creep.moveTo(Exit);
}
function makeBestBody(cap){
    var body = [];
    if(cap<300){   // under 300
        body = makeParts(3,2,1,0)
    } else if(cap<400){   // 300-399
        body = makeParts(5,3,1,0)
    } else if(cap<550){   // 400-549
        body = makeParts(6,4,2,0)
    } else if(cap<800){   // 550-799
        body = makeParts(3,3,3,1)
    } else if(cap<1300){   // 800-1299
        body = makeParts(5,4,3,1)
    } else if(cap<1800){   // 1300-1799
        body = makeParts(7,6,6,1)
    } else if(cap<2300){   // 1800-2299
        body = makeParts(8,10,6,1)
    } else {   // 2300+
        body = makeParts(9,10,8,1)
    }
    return body;
}
function makeParts(toughs, moves, attacks, ranged) {
    var list = [];
    for(var i=0;i<toughs;i++){
        list.push(TOUGH);
    }
    for(var i=0;i<moves;i++){
        list.push(MOVE);
    }
    for(var i=0;i<attacks;i++){
        list.push(ATTACK);
    }
    for(var i=0;i<ranged;i++){
        list.push(RANGED_ATTACK);
    }
    return list;
}
function init(creep) {
    console.log("Initializing Guard - "+creep.name);
    creep.memory.init=true;
    creep.memory.role="guard";
    creep.memory.state="walkToRoom";
    if(creep.memory.spawnRoom == undefined)
        creep.memory.spawnRoom = creep.room.name;
    if(creep.memory.stationRoom!=undefined){      // set array with your name
	    var stationRoom = Game.rooms[creep.memory.stationRoom];
	    if(stationRoom){
	        stationRoom.memory.guardCreep=creep;
	    }
	} else {
	    console.log("spawning guard with no target")
	}
}
module.exports = roleGuard;
//------------------------------------------------------ role.guard -----------------------------------------------------



