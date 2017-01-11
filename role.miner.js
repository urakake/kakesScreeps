/** -------------------------------------------- role.miner ------------------------------------------
 * @param {Creep} creep 
 * by Urakake     **/
		
var roleMiner = {
    run: function(creep) {
        if(!creep.memory.init){
            init(creep);
        }
        work(creep);
    },
    makeMiner: function(spawn) {
        var cap = spawn.room.energyAvailable;
        var missingNum=-1;
        for(var i in spawn.room.memory.minerNames){
            var thisName=spawn.room.memory.minerNames[i];
            var thisCreep=Game.creeps[thisName];
            if(thisCreep==undefined){
                spawn.room.memory.minerNames[i]="";
                missingNum=i;
            }
        }
        
        var creepName="miner"+Game.time+"@"+spawn.room.name+"@"+spawn.name;
        var missingNode=spawn.room.memory.sourceIds[missingNum];
        if(missingNum!=-1){
            spawn.room.memory.minerNames[missingNum]=creepName;
        }
        
        console.log("Creating Creep ("+creepName+")");
        spawn.room.memory.creepIter++;
        //*
        if(cap<300){ // under 300
            return spawn.createCreep( makeParts(1,1,1), creepName, { role: 'miner', assignedNode: missingNode } );
        } else if(cap<400){   // 300-399
            return spawn.createCreep( makeParts(1,1,2), creepName, { role: 'miner', assignedNode: missingNode } );
        } else if(cap<550){   // 400-549
            return spawn.createCreep( makeParts(2,2,2), creepName, { role: 'miner', assignedNode: missingNode } );
        } else if(cap<800){   // 550-799
            return spawn.createCreep( makeParts(2,2,3), creepName, { role: 'miner', assignedNode: missingNode } );
        } else if(cap<1300){   // 800-1299
            return spawn.createCreep( makeParts(4,4,4), creepName, { role: 'miner', assignedNode: missingNode } );
        } else if(cap<1800){   // 1300-1799
            return spawn.createCreep( makeParts(4,4,6), creepName, { role: 'miner', assignedNode: missingNode } );
        } else if(cap<2300){   // 1800-2299
            return spawn.createCreep( makeParts(4,4,7), creepName, { role: 'miner', assignedNode: missingNode } );  
        } else {   // 2300+
            return spawn.createCreep( makeParts(4,4,7), creepName, { role: 'miner', assignedNode: missingNode } );
        } 
        //*/
        
    },
    checkMiners: function(spawn){  
        var myRoom=spawn.room;
        var foundMissing=false;
        for(var i in myRoom.memory.minerNames){
            var thisName=spawn.room.memory.minerNames[i];
            var thisCreep=Game.creeps[thisName];
            if(thisCreep==undefined){
               // myRoom.memory.minerIds[i]="";
                foundMissing=true;
            }
        }
        return foundMissing;
    }
};

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
        if(creep.room.name != targetSource.room.name){
            voyageOutOfRoom(creep,targetSource.room);
        } else {
    	    if(creep.harvest(targetSource) == ERR_NOT_IN_RANGE){
    			creep.moveTo(targetSource);
    		} else { 
    		    creep.memory.state = "find";
    		    creep.say('find')
    		}
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
            }
        }
    }
    if(!foundStorage){
        var targets = node.room.find(FIND_CONSTRUCTION_SITES, {
            filter: (structure) => {
                 return (structure.structureType == STRUCTURE_CONTAINER)
            }
        });
        if (!targets.length){
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
	if(creep.memory.assignedNode!=undefined){      // set array with your name
	    for (var i in creep.room.memory.sourceIds){
	        var src=creep.room.memory.sourceIds[i];
	        if(src==creep.memory.assignedNode){
	            creep.room.memory.minerNames[i]=creep.name;
	        }
	    }
	}
}
module.exports = roleMiner;