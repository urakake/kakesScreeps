/** -------------------------------------------------------- role.miner --------------------------------------------------------------
 * @param {Creep} creep 
 * by Urakake     **/
		//
var roleMiner = {
    run: function(creep) {
        if(!creep.memory.init){
            init(creep);
        }
        work(creep);
    },
    makeMiner: function(spawn) {
        var cap = spawn.room.energyAvailable;
        var creepName = "miner"+Game.time+"@"+spawn.room.name+"@"+spawn.name;
        var missingNode = getMissingMinerSourceId(spawn.room);
        console.log("Creating Creep ("+creepName+")");
        return spawn.createCreep( makeBestBody(cap), creepName, { role: 'miner', assignedNode: missingNode } );
    },
    checkMiners: function(myRoom){  
        var foundMissing=false;
        if(getMissingMinerSourceId(myRoom) != undefined){
            foundMissing=true;
        }
        return foundMissing;
    }
};
function getMissingMinerSourceId(thisRoom){
    var srcId;
    var myRoom=thisRoom;
    var missingNum=-1;
    //console.log(myRoom.memory.minerNames)
    for(var i in myRoom.memory.minerNames){
        var thisName=myRoom.memory.minerNames[i];
        var thisCreep=Game.creeps[thisName];
        if(thisCreep==undefined){
            myRoom.memory.minerNames[i]="";
            missingNum=i;
        }
    }
    if(missingNum>=0){                    //  found missing node
        srcId = myRoom.memory.sourceIds[missingNum];
    }  else {
        for (var i in myRoom.memory.miningRooms){    //   look in  mining rooms
            myRoom=Game.rooms[myRoom.memory.miningRooms[i]];
            if(myRoom!=undefined){
                for(var i in myRoom.memory.minerNames){
                    var thisName=myRoom.memory.minerNames[i];
                    var thisCreep=Game.creeps[thisName];
                    //console.log(thisCreep)
                    if(thisCreep==undefined){
                        myRoom.memory.minerNames[i]="";
                        missingNum=i;
                    }
                }
                if(missingNum>=0){                           //  found missing node
                    return myRoom.memory.sourceIds[missingNum];
                } else {
                    return undefined;
                }
            } else {
                // cant see room
                return undefined;
                // need scount in room first
            }
        }
    }
    return srcId;
}
function work(creep) {
    if (creep.memory.state=="enroute"){
        moveToNode(creep);
    } else if (creep.memory.state=="find"){
        findStorage(creep);
    } else if (creep.memory.state=="makeBox"){
        makeBox(creep);
    } else if (creep.memory.state=="buildBox"){
        buildBox(creep);
    } else if (creep.memory.state=="acquireEnergy"){
        acquireEnergy(creep);
    } else if (creep.memory.state=="dumpEnergy"){
        dumpEnergy(creep);
    }
}
function moveToNode(creep){
    var targetSource=Game.getObjectById(creep.memory.assignedNode);
    if(targetSource!=undefined){
        if(creep.room.name == targetSource.room.name){
            if(creep.pos.x<=48 && creep.pos.y<=48 && creep.pos.x>=1 && creep.pos.y>=1){
                if(creep.harvest(targetSource) == ERR_NOT_IN_RANGE){
    			    creep.moveTo(targetSource);
    		    } else { 
    		        creep.memory.state = "find";
    		        creep.say('find')
                }
            } else {
                creep.moveTo(targetSource.room.controller);
            }
        } else {
            voyageOutOfRoom(creep,targetSource.room);
        }
    }
}

function voyageOutOfRoom(creep,destRoom) {
    var exitDir = Game.map.findExit(creep.room.name, destRoom);
    var Exit = creep.pos.findClosestByPath(exitDir);
    creep.moveTo(Exit);
}
function findStorage(creep){
    var node = Game.getObjectById(creep.memory.assignedNode);
    var foundStorage=false;
    var targets = node.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                 return (structure.structureType == STRUCTURE_STORAGE || structure.structureType == STRUCTURE_LINK || structure.structureType == STRUCTURE_CONTAINER)
            }
    });
    if (targets.length>0){
        var closestBox=node.pos.findClosestByRange(targets);
        if (node.pos.inRangeTo(closestBox, 7)){
            creep.memory.storeBox=closestBox.id;
            foundStorage=true;
            creep.memory.state = "acquireEnergy";
            var storageSaved=false;
            for (var i in creep.room.memory.sourceBins){
                if(creep.room.memory.sourceBins[i]==creep.memory.storeBox){
                    storageSaved=true
                }
            }
            if(!storageSaved){
                creep.room.memory.sourceBins.push(creep.memory.storeBox);
                creep.room.memory.moverNames.push("");
            }
        }
    }
    if(!foundStorage){
        var targets = node.room.find(FIND_CONSTRUCTION_SITES, {
            filter: (structure) => {
                 return (structure.structureType == STRUCTURE_CONTAINER)
            }
        });
        if (targets.length>0){
            var closestBox=node.pos.findClosestByRange(targets);
            if (node.pos.inRangeTo(closestBox, 7)){
                creep.memory.storeBox=closestBox.id;
                foundStorage=true;
                creep.memory.state = "buildBox"
            }
        }
    } if(!foundStorage){
        creep.memory.state = "makeBox";
    }
    return foundStorage;
}
function makeBox(creep){
    var node = Game.getObjectById(creep.memory.assignedNode);
    node.room.createConstructionSite(creep.pos.x,creep.pos.y,STRUCTURE_CONTAINER);
    var targets = node.room.find(FIND_CONSTRUCTION_SITES, {
            filter: (structure) => {
                 return (structure.structureType == STRUCTURE_CONTAINER)
            }
    });
    creep.memory.storeBox=node.pos.findClosestByRange(targets).id;
    creep.memory.state = "buildBox";
}
function buildBox(creep){
    var node = Game.getObjectById(creep.memory.assignedNode);
    var targetSource=Game.getObjectById(creep.memory.assignedNode);
    var storeBox=Game.getObjectById(creep.memory.storeBox);
    if(creep.carry.energy==creep.carryCapacity){
        if(creep.build(storeBox) == ERR_NOT_IN_RANGE) {
            creep.moveTo(storeBox);
        }
    } else {
        if(creep.harvest(targetSource) == ERR_NOT_IN_RANGE){
			creep.moveTo(targetSource);
		}
    }
    if(storeBox==undefined){
        creep.memory.state = "find";
    }
}
function acquireEnergy(creep){
    var targetSource=Game.getObjectById(creep.memory.assignedNode);
    if(creep.harvest(targetSource) == ERR_NOT_IN_RANGE) {
        creep.moveTo(targetSource);
    }
    if(creep.carry.energy==creep.carryCapacity || targetSource.energy==0){
        creep.memory.state="dumpEnergy"
    }
}
function dumpEnergy(creep) {
    var storeBox=Game.getObjectById(creep.memory.storeBox);
    if(storeBox.hits < storeBox.hitsMax){
        creep.repair(storeBox);
    } else {
        if(creep.transfer(storeBox, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(storeBox);
        }
    }
    if(creep.carry.energy==0){
        creep.memory.state="acquireEnergy"
    }
}
function makeBestBody(cap){
    var body = [];
    if(cap<300){   // under 300
        body = makeParts(1,1,1)
    } else if(cap<400){   // 300-399
        body = makeParts(1,1,2)
    } else if(cap<550){   // 400-549
        body = makeParts(1,1,3)
    } else if(cap<800){   // 550-799
        body = makeParts(2,1,4)
    } else if(cap<1300){   // 800-1299
        body = makeParts(4,2,5)
    } else if(cap<1800){   // 1300-1799
        body = makeParts(4,4,6)
    } else if(cap<2300){   // 1800-2299
        body = makeParts(4,4,6)
    } else {   // 2300+
        body = makeParts(4,4,6)
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
    console.log("Initializing Miner - "+creep.name);
	creep.memory.init=true;
	creep.memory.role="miner";
	creep.memory.state="enroute";
	creep.memory.spawnRoom = creep.room.name;
	if(creep.memory.assignedNode!=undefined){      // set array with your name
	    var mySource = Game.getObjectById(creep.memory.assignedNode);
	    for (var i in mySource.room.memory.sourceIds){
	        var src=mySource.room.memory.sourceIds[i];
	        if(src==creep.memory.assignedNode){
	            mySource.room.memory.minerNames[i]=creep.name;
	        }
	    }
	} else {
	    console.log("spawning miner with no target")
	}
}
module.exports = roleMiner;
//------------------------------------------------------ role.miner -----------------------------------------------------




