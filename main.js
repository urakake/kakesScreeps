/** ------------------------------------------------ main -----------------------------------------------
 *  Game.spawns['Spawn1'].createCreep( [WORK,MOVE,CARRY,CLAIM], "creepName", { role: 'scout', targetRoom: 'W7N3' } );
    Game.spawns['Spawn1'].createCreep( [WORK,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY], "moverTest", { role: 'mover' } )
    Game.spawns['Spawn1'].createCreep( [WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE,CARRY,CARRY], "miner1", { role: 'miner', assignedNode: '9263077296e02bb' } );

 * 
 * 
 * by Urakake     **/
  
var roleDrone = require('role.drone');
var roleSlave = require('role.slave');
var roleMiner = require('role.miner');
var roleMover = require('role.mover');
var roleScout = require('role.scout');
var autoBuild = require('mod.autoBuild');

module.exports.loop = function () {
    //delete dead creeps
    for(var i in Memory.creeps) {
        if(!Game.creeps[i]) {
            delete Memory.creeps[i];
        } 
    }
	var roomList = Game.rooms;   
	// room management
	for(var i in roomList){
	    var myRoom=roomList[i];
		if (!roomList[i].memory.init){
			initRoom(roomList[i]);
		}
		myRoom.memory.numDrones=0;
	    myRoom.memory.numSlaves=0;
	    myRoom.memory.numMiners=0;
	    myRoom.memory.numMover=0;
	    myRoom.memory.numScouts=0;
		//autoBuild.run(roomList[i]);
		
		workTowers(roomList[i]);
	}
	// run thru creeps
    for(var i in Game.creeps) {
        if (Game.creeps[i].my) {
            processCreep(Game.creeps[i]);
		}
    }
    // spawn missing creeps
    for(var i in roomList){
		var thisSpawn; 
		for(var j in Game.spawns) {
			if (Game.spawns[j].room==roomList[i]){
				thisSpawn=Game.spawns[j];
			}
		}
        if (thisSpawn && thisSpawn.structureType==STRUCTURE_SPAWN && !thisSpawn.spawning){
            spawnNextUnit(thisSpawn);
            //spawnNextUnit2(thisSpawn);
		}
	}
	
}
function processCreep(creep){
    if (creep.memory.role=="drone"){ 
        creep.room.memory.numDrones++;
        roleDrone.run(creep);
    } else if (creep.memory.role=="slave"){
		creep.room.memory.numSlaves++;
        roleSlave.run(creep);
	}  else if (creep.memory.role=="miner"){
	    creep.room.memory.numMiners++;
        roleMiner.run(creep);
	}  else if (creep.memory.role=="scout"){
	    creep.room.memory.numScouts++;
        roleScout.run(creep);
	}   else if (creep.memory.role=="mover"){
	    creep.room.memory.numMovers++;
        roleMover.run(creep);
	}
}
function spawnNextUnit(spawn) {
    if(spawn.room.energyAvailable>=200 && spawn.room.memory.numDrones<1){
        roleDrone.makeDrone(spawn);
    } else if(spawn.room.energyAvailable>=300 && spawn.room.memory.numSlaves<1){
            roleSlave.makeSlave(spawn);
    } else if(spawn.room.energyAvailable==spawn.room.energyCapacityAvailable){
        if (spawn.room.memory.numDrones<5){
            roleDrone.makeDrone(spawn);
        }
    } 
}
function spawnNextUnit2(spawn) {
    if(!spawn.spawning && spawn.room.energyAvailable>=200){
        if(spawn.room.memory.numMiners<1){
            console.log("spawning only miner")
            //roleMiner.makeMiner(spawn);
        } else if(spawn.room.memory.numMovers<1){
            console.log("spawning only mover")
            //roleMover.makeMover(spawn);
        } else if (spawn.room.memory.numSlaves<1){
            console.log("spawning only slave")
            //roleSlave.makeSlave(spawn);
        } else {                //  1 of each
            if(roleMiner.checkMiners(spawn)){
                console.log("spawning additional miner")
                //roleMiner.makeMiner(spawn);
            } else if (roleMover.checkMovers(spawn)){
                console.log("spawning additional mover")
                //roleMover.makeMover(spawn)
            }else if (roleSlave.checkSlaves(spawn)){
                console.log("spawning other slaves")
                //roleSlave.makeSlave(spawn)
            }
        }
    }
}
function workTowers(myRoom) {
	var targets = myRoom.find(FIND_MY_STRUCTURES, {
			filter: (structure) => {
				return (structure.structureType == STRUCTURE_TOWER)
			}
	});
	for (var i in targets) {
		var tower = targets[i];
		if(tower) {
		    var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if(closestHostile) {
                tower.attack(closestHostile);
            } else if (tower.energy>tower.energyCapacity*.7) {
                var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => (structure.hits < structure.hitsMax) && (structure.hits < 100000)
                });
                if(closestDamagedStructure) {
                   tower.repair(closestDamagedStructure);
                }
            }
		}
	}
}
function initRoom(myRoom) {
    console.log("Initializing Room ("+myRoom.name+")");
    myRoom.memory.init=true;
	myRoom.memory.creepIter=0;
	myRoom.memory.sourceIter=0;
	myRoom.memory.sourceBins=[];
	myRoom.memory.moverNames=[];
	myRoom.memory.destBins=[];
	myRoom.memory.numDrones=0;
	myRoom.memory.numSlaves=0;
	myRoom.memory.numMiners=0;
	myRoom.memory.numMovers=0;
	myRoom.memory.numScouts=0;
	var respawningSources = myRoom.find(FIND_SOURCES);
	var sourceIds=[];
	var minerNames=[];
	console.log(respawningSources.length+" sources found");
	for (var j in respawningSources){
	    sourceIds.push(respawningSources[j].id);
	    minerNames.push("");
	}
	myRoom.memory.sourceIds = sourceIds;
	myRoom.memory.sourceNum = sourceIds.length;
	myRoom.memory.minerNames = minerNames;
}
