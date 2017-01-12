/** ------------------------------------------------------------- main --------------------------------------------------------------------------------
 *  Game.spawns['Spawn1'].createCreep( [WORK,MOVE,CARRY,CLAIM], "creepName", { role: 'scout', targetRoom: 'W7N3' } );
    Game.spawns['Spawn1'].createCreep( [WORK,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY], "moverTest", { role: 'mover' } )
    Game.spawns['Spawn1'].createCreep( [WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE,CARRY,CARRY], "miner1", { role: 'miner', assignedNode: '9263077296e02bb' } );

 * 				still need to:
 *                  mine adjacent room
 *                  movers across rooms
 *                  autoroads
 *                  
 * by Urakake     **/
  
var roleDrone = require('role.drone');
var roleSlave = require('role.slave');
var roleMiner = require('role.miner');
var roleMover = require('role.mover');
var roleScout = require('role.scout');
//var autoBuild = require('mod.autoBuild');

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
		processRoom(myRoom)
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
		}
	}
}
function processRoom(myRoom){
        if (!myRoom.memory.init){   initRoom(myRoom);  }
		myRoom.memory.numDrones=0;
	    myRoom.memory.numSlaves=0;
	    myRoom.memory.numMiners=0;
	    myRoom.memory.numMovers=0;
	    myRoom.memory.numScouts=0;
		//autoBuild.run(roomList[i]);
	    if(myRoom.memory.scoutRoom!=undefined){
	        
	    }
	    if(myRoom.memory.newSourceId!=undefined){
	        myRoom.memory.sourceIds.push(myRoom.memory.newSourceId);
	        myRoom.memory.minerNames.push("")
	    }
	    if(myRoom.memory.newSourceBin!=undefined){
	        myRoom.memory.sourceBins.push(myRoom.memory.newSourceBin);
	        myRoom.memory.moverNames.push("")
	    }
	    
		workTowers(myRoom);
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
    if(!spawn.spawning && spawn.room.energyAvailable>=200){
        if(spawn.room.controller.level>=4){
            if(spawn.room.memory.numMiners<1){
                //console.log("spawning only miner in "+spawn.room)
                roleMiner.makeMiner(spawn);
            } else if(spawn.room.memory.numMovers<1){
               // console.log("spawning mover already have "+spawn.room.memory.numMovers+" in "+spawn.room)
                roleMover.makeMover(spawn);
            } else if (spawn.room.memory.numSlaves<1){
                //console.log("spawning only slave in "+spawn.room)
                roleSlave.makeSlave(spawn);
            } else if(spawn.room.energyAvailable==spawn.room.energyCapacityAvailable) {       //  1 of each + full
                //console.log("room full")
                if(roleMiner.checkMiners(spawn)){
                    //console.log("spawning miner already have "+spawn.room.memory.numMiners+" in "+spawn.room)
                    roleMiner.makeMiner(spawn);
                } else if (roleMover.checkMovers(spawn)){
                //} else if (spawn.room.memory.numMovers<2){
                    //console.log("spawning mover already have "+spawn.room.memory.numMovers+" in "+spawn.room)
                    roleMover.makeMover(spawn)
                }else if (roleSlave.checkSlaves(spawn)){
                    //console.log("spawning slave already have "+spawn.room.memory.numSlaves+" in "+spawn.room)
                    roleSlave.makeSlave(spawn)
                } else if (spawn.room.memory.numDrones<1){
                    //console.log("spawning drone in "+spawn.room)
                    roleDrone.makeDrone(spawn)
                } else if (roleScout.checkScouts(spawn)){
                    //console.log("spawning scout in "+spawn.room)
                    roleScout.makeScout(spawn)
                }
            }
        } else if (spawn.room.memory.numDrone<1){
            console.log("spawning only drone in "+spawn.room)
            roleDrone.makeDrone(spawn);
        } else if (spawn.room.memory.numSlaves<1){
            console.log("spawning only slave in "+spawn.room)
            roleSlave.makeSlave(spawn);
        } else if(spawn.room.energyAvailable==spawn.room.energyCapacityAvailable&&roleDrone.checkDrones(spawn.room)){
            console.log("spawning drone in "+spawn.room)
            roleDrone.makeDrone(spawn)
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
                
               var damagedStructures = tower.room.find(FIND_STRUCTURES, {
						filter: (structure) => {
							return ((structure.hits < structure.hitsMax) && (structure.hits < 250000))
						}
					});
				if (damagedStructures) {
					var LowHP = 100000000000;
					var LowID = null;
					for (var j in damagedStructures) {
						if (damagedStructures[j].hits < LowHP) {
						    if(tower.pos.inRangeTo(damagedStructures[j], 20)){
						        LowID = damagedStructures[j]
							    LowHP = damagedStructures[j].hits
						    }
						}
					}
					if (LowID != null ) {
						tower.repair(LowID);
					}
				}
            }
		}
	}
}
function initRoom(myRoom) {
    console.log("Initializing Room ("+myRoom.name+")");
    myRoom.memory.init=true;
	myRoom.memory.sourceBins=[];
	myRoom.memory.minerNames=[];
	myRoom.memory.destBins=[];
	myRoom.memory.moverNames=[];
	myRoom.memory.numDrones=0;
	myRoom.memory.numSlaves=0;
	myRoom.memory.numMiners=0;
	myRoom.memory.numMovers=0;
	myRoom.memory.numScouts=0;
	var sources = myRoom.find(FIND_SOURCES);
	var sourceIds=[];
	var minerNames=[];
	for (var j in sources){
	    sourceIds.push(sources[j].id);
	    minerNames.push("");
	}
	myRoom.memory.sourceIds = sourceIds;
	myRoom.memory.minerNames = minerNames;
}
// ------------------------------------------------------------- main --------------------------------------------------------------------------------




