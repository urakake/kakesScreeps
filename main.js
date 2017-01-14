/** ------------------------------------------------------------- main --------------------------------------------------------------------------------
 *  Game.spawns['Spawn1'].createCreep( [WORK,MOVE,CARRY,CLAIM], "creepName", { role: 'scout', targetRoom: 'W7N3' } );
    Game.spawns['Spawn1'].createCreep( [WORK,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY], "moverTest", { role: 'mover' } )
    Game.spawns['Spawn1'].createCreep( [WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE,CARRY,CARRY], "miner1", { role: 'miner', assignedNode: '9263077296e02bb' } );

    Game.rooms['W8N3'].memory.miningRoms.push('W8N2');
    Game.rooms['W8N3'].memory.scoutRoom = 'W8N2';
    Game.rooms['W8N2'].memory.capture = true;

 * 				still need to:
 *                  
 *                  
 *                  autoroads
 *                  
 * by Urakake     **/
  
var roleRoom = require('role.room');
var roleDrone = require('role.drone');
var roleSlave = require('role.slave');
var roleMiner = require('role.miner');
var roleMover = require('role.mover');
var roleScout = require('role.scout');
var roleGuard = require('role.guard');
var roleClaimer = require('role.claimer');
//var autoBuild = require('mod.autoBuild');

module.exports.loop = function () {
    removeDeadCreeps();
	var roomList = Game.rooms;   
	// process room
	for(var i in roomList){
		roleRoom.run(roomList[i])
	}
	// run thru creeps
    for(var i in Game.creeps) {
        if (Game.creeps[i].my) {
            processCreep(Game.creeps[i]);
		}
    }
    // spawn missing creeps
    for(var i in roomList){
	    spawnCreeps(roomList[i])
	}
}
function removeDeadCreeps(){
    //delete dead creeps
    for(var i in Memory.creeps) {
        if(!Game.creeps[i]) {
            delete Memory.creeps[i];
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
	} else if (creep.memory.role=="miner"){
	    creep.room.memory.numMiners++;
        roleMiner.run(creep);
	} else if (creep.memory.role=="scout"){
	    creep.room.memory.numScouts++;
        roleScout.run(creep);
	} else if (creep.memory.role=="mover"){
	    creep.room.memory.numMovers++;
        roleMover.run(creep);
	} else if (creep.memory.role=="guard"){
	    creep.room.memory.numGuards++;
        roleGuard.run(creep);
	} else if (creep.memory.role=="claimer"){
	    creep.room.memory.numClaimers++;
        roleClaimer.run(creep);
	}
}
function spawnCreeps(myRoom){
    var mySpawns = myRoom.find(FIND_MY_SPAWNS)
    var cap = myRoom.energyAvailable;
    for(var i in mySpawns){
        spawnNextUnit(mySpawns[i]);
    }
}
function spawnNextUnit(spawn) {
    if(!spawn.spawning && spawn.room.energyAvailable>=200){
        if(spawn.room.controller.level>=3){
            if (spawn.room.memory.numDrones<1){
                roleDrone.makeDrone(spawn);
            } else if (spawn.room.memory.numMiners<1){
                roleMiner.makeMiner(spawn);
            } else if (spawn.room.energyAvailable==spawn.room.energyCapacityAvailable){ 
                //console.log(spawn.room.name+" is full")
                if (roleMiner.checkMiners(spawn.room)){
                    roleMiner.makeMiner(spawn);
                } else if (roleDrone.checkDrones(spawn.room)){
                    roleDrone.makeDrone(spawn);
                } else if (roleMover.checkMovers(spawn.room)){
                    //console.log(spawn.room.name+" is full")
                    roleMover.makeMover(spawn);
                }else if (roleSlave.checkSlaves(spawn.room)){
                    roleSlave.makeSlave(spawn)
                } else if (roleScout.checkScouts(spawn.room)){
                    roleScout.makeScout(spawn)
                } else if (roleGuard.checkGuards(spawn.room)){
                    roleGuard.makeGuard(spawn) 
                } else if (roleClaimer.checkClaimers(spawn.room)){
                    roleClaimer.makeClaimer(spawn)
                } else {
                    var foundMissing=false;
                    for (var i in spawn.room.memory.miningRooms){    //   look in  mining rooms
                        myRoom=Game.rooms[spawn.room.memory.miningRooms[i]];
                        if(myRoom!=undefined && !foundMissing){
                            if (roleMiner.checkMiners(myRoom)){
                                foundMissing=true;
                                roleMiner.makeMiner(spawn);
                            } else if (roleMover.checkMovers(myRoom)){
                                roleMover.makeMover(spawn);
                                foundMissing=true;
                            }
                        }
                    }
                }
            }
        } else if (spawn.room.memory.numDrones<1){
            roleDrone.makeDrone(spawn);
        } else if(spawn.room.energyAvailable==spawn.room.energyCapacityAvailable && (spawn.room.memory.numDrones<3)){
            roleDrone.makeDrone(spawn);
        }
    }
}
// ------------------------------------------------------------- main --------------------------------------------------------------------------------




