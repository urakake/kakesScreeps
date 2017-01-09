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
	if(creep.memory.assignedNode==undefined){
	    creep.memory.assignedNode="";
	}
	if(creep.memory.storeBox==undefined){
	    creep.memory.storeBox="";
	}
	if(creep.memory.role==undefined){
	    creep.memory.role="miner";
	}
	creep.memory.state="enroute";
}
function work(creep) {
    if (creep.memory.state=="enroute"){
        var targetSource=Game.getObjectById(creep.memory.assignedNode)
        if(creep.room.name != targetSource.room.name){
            voyage(creep,targetSource.room);
        } else {
    	    if(creep.harvest(targetSource) == ERR_NOT_IN_RANGE){
    			creep.moveTo(targetSource);
    		} else { 
    		    creep.memory.state = "find";
    		    creep.say('find')
    		}
        }
    } else if (creep.memory.state=="find"){
        findStorage(creep);
    } else if (creep.memory.state=="makeBox"){
        makeBox(creep);
    } else if (creep.memory.state=="buildBox"){
        mine(creep);
    } else if (creep.memory.state=="mine"){
        mine(creep);
    }
    
}
function voyage(creep,destRoom) {
    var exitDir = Game.map.findExit(creep.room.name, destRoom);
    var Exit = creep.pos.findClosestByPath(exitDir);
    creep.moveTo(Exit);
}
function findStorage(creep){
    var targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                 return (structure.structureType == STRUCTURE_STORAGE || structure.structureType == STRUCTURE_LINK || structure.structureType == STRUCTURE_CONTAINER)
            }
    });
    var closestBox=creep.pos.findClosestByRange(targets);
    if (creep.pos.inRangeTo(closestBox, 4)){
        creep.memory.storeBox=closestBox.id;
        if(creep.transfer(closestBox, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(closestBox);
        } else {
            creep.memory.state = "mine";
            creep.say('mine')
        }
    } else {
        creep.memory.state = "makeBox";
    }
}
function makeBox(creep){
    creep.room.createConstructionSite(creep.pos.x,STRUCTURE_CONTAINER);
    var targets = creep.room.find(FIND_CONSTRUCTION_SITES, {
            filter: (structure) => {
                 return (structure.structureType == STRUCTURE_CONTAINER)
            }
    });
    creep.memory.storeBox=creep.pos.findClosestByRange(targets).id;
    creep.memory.state = "buildBox"
}
function buildBox(creep){
    var targetSource=Game.getObjectById(creep.memory.assignedNode);
    var storeBox=Game.getObjectById(creep.memory.storeBox);
    if(creep.carry.energy!=0){
        if(creep.build(Game.getObjectById(creep.memory.storeBox)) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0]);
        }
    } else {
        if(creep.harvest(targetSource) == ERR_NOT_IN_RANGE){
			creep.moveTo(targetSource);
		}
    }
    if(storeBox.progress==storeBox.progressTotal){
        creep.memory.state = "find"
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