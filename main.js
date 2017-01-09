/** ------------------------------------------------ main -----------------------------------------------
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
		if (!roomList[i].memory.init){
			initRoom(roomList[i]);
		}
		roomList[i].memory.numOfDrones=0;
		roomList[i].memory.numOfSlaves=0;
		//autoBuild.run(roomList[i]);
		workTowers(roomList[i]);
	}
	// run thru creeps
    for(var i in Game.creeps) {
        if (Game.creeps[i].my) {
            var creep = Game.creeps[i];
            if (creep.memory.role=="drone"){ 
                creep.room.memory.numOfDrones+=1;
                roleDrone.run(creep);
            } else if (creep.memory.role=="slave"){
    			creep.room.memory.numOfSlaves+=1;
                roleSlave.run(creep);
    		}  else if (creep.memory.role=="miner"){
                roleMiner.run(creep);
    		}  else if (creep.memory.role=="scout"){
                roleScout.run(creep);
    		}   else if (creep.memory.role=="mover"){
                roleMover.run(creep);
    		}
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
        if (thisSpawn && thisSpawn.structureType==STRUCTURE_SPAWN && thisSpawn && !thisSpawn.spawning){
            spawnNextUnit(thisSpawn);
		}
	}
	
}
function initRoom(myRoom) {
    console.log("Initializing Room ("+myRoom.name+")");
    myRoom.memory.init=true;
	myRoom.memory.creepIter=0;
	myRoom.memory.sourceIter=0;
	myRoom.memory.droneIter=0;
	myRoom.memory.mineIter=0;
	myRoom.memory.sourceBins=[];
	myRoom.memory.destBins=[];
	var respawningSources = myRoom.find(FIND_SOURCES);
	var sourceIds=[];
	var minerIds=[];
	console.log(respawningSources.length);
	for (var j in respawningSources){
	    sourceIds.push(respawningSources[j].id);
	    minerIds.push("");
	}
	myRoom.memory.sourceIds = sourceIds;
	myRoom.memory.sourceNum = sourceIds.length;
	myRoom.memory.minerIds = minerIds;
}
function spawnNextUnit(spawn) {
    if(!spawn.spawning){
        if(spawn.room.energyAvailable>=200 && spawn.room.memory.numOfDrones<1){
            makeDrone(spawn);
        } else if(spawn.room.energyAvailable>=300 && spawn.room.memory.numOfSlaves<1){
                makeSlave(spawn);
        } else if(spawn.room.energyAvailable==spawn.room.energyCapacityAvailable){
            if (checkDrones(spawn.room)){
                makeDrone(spawn);
            }
        } 
    }
    
}
function makeSlave(spawn) {
    var cap = spawn.room.energyAvailable;
    var creepName="controllerSlave@"+spawn.room.name;
    console.log("Creating Creep ("+creepName+")");
    if(cap<300){   // under 300
        spawn.createCreep( makeParts(1,1,1), creepName, { role: 'slave' } );
    } else if(cap<550){   // 300-549
        spawn.createCreep( makeParts(2,2,1), creepName, { role: 'slave' } );
    } else if(cap<800){   // 550-799
        spawn.createCreep( makeParts(3,4,2), creepName, { role: 'slave' } );
    } else if(cap<1300){   // 800-1299
        spawn.createCreep( makeParts(4,6,3), creepName, { role: 'slave' } );
    } else if(cap<1800){   // 1300-1799
        spawn.createCreep( makeParts(8,10,4), creepName, { role: 'slave' } );
    } else if(cap<2300){   // 1800-2299
        spawn.createCreep( makeParts(8,10,4), creepName, { role: 'slave' } );
    } else {   // 2300+
        spawn.createCreep( makeParts(8,10,5), creepName, { role: 'slave' } );
    }
}
function checkDrones(myRoom) {
    var foundMissing=false;
    if (myRoom.memory.numOfDrones<=((myRoom.memory.sourceNum)*3)-1){
        var foundMissing=true;
    }
    return foundMissing;
}
function makeDrone(spawn) {
    var cap = spawn.room.energyAvailable;
    var creepName="drone"+spawn.room.memory.droneIter+"@"+spawn.room.name;
    console.log("Creating Creep ("+creepName+")");
    spawn.room.memory.droneIter++;
    if(cap<300){   // under 300
        spawn.createCreep( makeParts(1,1,1), creepName, { role: 'drone' } );
    } else if(cap<400){   // 300-300
        spawn.createCreep( makeParts(2,2,1), creepName, { role: 'drone' } );
    } else if(cap<550){   // 400-549
        spawn.createCreep( makeParts(2,2,2), creepName, { role: 'drone' } );
    } else if(cap<800){   // 550-799
        spawn.createCreep( makeParts(3,4,2), creepName, { role: 'drone' } );
    } else if(cap<1300){   // 800-1299
        spawn.createCreep( makeParts(4,6,3), creepName, { role: 'drone' } );
    } else if(cap<1800){   // 1300-1799
        spawn.createCreep( makeParts(6,8,4), creepName, { role: 'drone' } );
    } else if(cap<2300){   // 1800-2299
        spawn.createCreep( makeParts(8,10,4), creepName, { role: 'drone' } );
    } else {   // 2300+
        spawn.createCreep( makeParts(8,10,5), creepName, { role: 'drone' } );
    }
}
function checkMiners(myRoom) {
    var foundMissing=false;
    
    if (myRoom.memory.numOfDrones<=((myRoom.memory.sourceNum)*3)-1){
        var foundMissing=true;
    }
    return foundMissing;
}
function makeMiner(spawn) {
    var cap = spawn.room.energyAvailable;
    var creepName="miner"+spawn.room.memory.mineIter+"@"+spawn.room.name;
    console.log("Creating Creep ("+creepName+")");
    spawn.room.memory.droneIter++;
    if(cap<300){ // under 300
         spawn.createCreep( makeParts(8,10,5), creepName, { role: 'miner' } );
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
