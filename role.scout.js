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
	    var creepName="scout"+Game.time+"@"+spawn.room.name+"-"+spawn.room.memory.scoutRoom;
	    spawn.createCreep( makeParts(5,4,4,1), creepName, { role: 'scout', scoutRoom: spawn.room.memory.scoutRoom  } );
	},
	checkScouts: function(myRoom){
	    var needScout=false;
	    if(myRoom.memory.scoutRoom!=undefined){
            var scoutRoom=Game.rooms[myRoom.memory.scoutRoom];
            if(scoutRoom==undefined){
                needScout=true;
            }   else if(scoutRoom.memory.numDrones==0){
                needScout=true;
            }
	    }
	    return needScout;
	}
};

function work(creep) {
	if(creep.memory.state == "traverse") {
	    traverse(creep);
	} else if(creep.memory.state == "move"){
	    getAwayFromWall(creep)
	} else if(creep.memory.state == "drone"){
		creep.memory.role="drone";
		creep.memory.init=false;
	}
}

function traverse(creep){
    var targetRoom=creep.memory.scoutRoom
    if(creep.room.name != targetRoom){
        voyageOutOfRoom(creep,targetRoom);
    } else {
        creep.moveTo(creep.room.controller.pos);
        becomeDrone(creep);
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
}
function makeParts(moves, carries, works, claims) {
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
    for(var i=0;i<claims;i++){
        list.push(CLAIM);
    }
    return list;
}

function init(creep) {
    console.log("Initializing Scout - "+creep.name);
    creep.memory.init=true;
    creep.memory.role="scout";
    creep.memory.spawnRoom = creep.room.name;
	creep.memory.scoutRoom = creep.room.memory.scoutRoom;
	creep.memory.state="traverse"
}
module.exports = roleScout;
// -------------------------------------------------------------- role.scout --------------------------------------------------------------------




