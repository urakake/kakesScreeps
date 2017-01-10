/** -------------------------------------------- role.miner ------------------------------------------
 * @param {Creep} creep 
 * by Urakake     **/
		
var roleMiner = {
    run: function(creep) {
        if(!creep.memory.init){
            init(creep);
        }
        work(creep);
    }
};
function init(creep) {
    console.log("Initializing Miner - "+creep.name);
	creep.memory.init=true;
	//creep.memory.assignedNode;
 	//creep.memory.storeBox;
	creep.memory.role="miner";
	creep.memory.state="enroute";
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
    } else if (creep.memory.state=="mine"){
        mine(creep);
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
    var foundStorage=false;
    var targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                 return (structure.structureType == STRUCTURE_STORAGE || structure.structureType == STRUCTURE_LINK || structure.structureType == STRUCTURE_CONTAINER)
            }
    });
    if (targets.length>0){
        var closestBox=creep.pos.findClosestByRange(targets);
        if (creep.pos.inRangeTo(closestBox, 7)){
            creep.memory.storeBox=closestBox.id;
            foundStorage=true;
            creep.memory.state = "mine";
        }
    }
    if(!foundStorage){
        var targets = creep.room.find(FIND_CONSTRUCTION_SITES, {
            filter: (structure) => {
                 return (structure.structureType == STRUCTURE_CONTAINER)
            }
        });
        if (!targets.length){
            var closestBox=creep.pos.findClosestByRange(targets);
            if (creep.pos.inRangeTo(closestBox, 7)){
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
    if (creep.memory.storeBox)
    creep.room.createConstructionSite(creep.pos.x,creep.pos.y,STRUCTURE_CONTAINER);
    var targets = creep.room.find(FIND_CONSTRUCTION_SITES, {
            filter: (structure) => {
                 return (structure.structureType == STRUCTURE_CONTAINER)
            }
    });
    creep.memory.storeBox=creep.pos.findClosestByRange(targets).id;
    creep.memory.state = "buildBox";
}
function buildBox(creep){
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
function mine(creep){
    var targetSource=Game.getObjectById(creep.memory.assignedNode);
    var storeBox=Game.getObjectById(creep.memory.storeBox);
    if(creep.carry.energy >= creep.carryCapacity){
        if(storeBox.hits < storeBox.hitsMax){
            creep.repair(storeBox);
        } else {
            if(creep.transfer(storeBox, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(storeBox);
            }
        }
    } else {
         if(creep.harvest(targetSource) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targetSource);
        }
    }
}

module.exports = roleMiner;