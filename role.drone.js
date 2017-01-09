/** -------------------------------------------- role.drone ------------------------------------------
 * @param {Creep} creep 
 * by Urakake     **/
		
var roleDrone = {
    run: function(creep) {
        if(!creep.memory.init){
            init(creep);
        }
        work(creep);
	}
};
function init(creep) {
    console.log("Initializing Drone - "+creep.name);
    creep.memory.init=true;
	if(creep.memory.assignedNode==undefined){
	    var sources = creep.room.find(FIND_SOURCES);
    	creep.memory.assignedNode=sources[creep.room.memory.sourceIter].id;
    	creep.room.memory.sourceIter++;
    	if (creep.room.memory.sourceIter==creep.room.memory.sourceNum){
    		creep.room.memory.sourceIter=0;
	    }
	}
	if(creep.memory.role==undefined){
	    creep.memory.role="drone";
	}
}
function work(creep) {
    // check if energy is empty
	if(creep.carry.energy == 0 && creep.memory.state != "gather") {
		creep.memory.state = "gather";
		creep.say('gather');
	}
	//harvest assigned node
	if(creep.memory.state == "gather"){
		gather(creep);
	} else if(creep.memory.state == "find"){
		find(creep);
	} else if(creep.memory.state == "charge"){
	    charge(creep);
	} else if(creep.memory.state == "craft"){
		craft(creep)
	} else if(creep.memory.state == "upgrade"){
	    upgrade(creep)
	} else if(creep.memory.state == "dump"){
	    dump(creep)
	} else {
		creep.memory.state = "find";
	}
}
function find(creep) {
    var targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                 return ((structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && (structure.energy < structure.energyCapacity) ||
                    (structure.structureType == STRUCTURE_TOWER) && (structure.energy < structure.energyCapacity*.8))
            }
    });
    if(targets.length) {
            creep.memory.targetEnergy=creep.pos.findClosestByRange(targets).id;
			creep.memory.state = "charge";
			creep.say('store');
	} else {
		var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
		if(targets.length) {
			creep.memory.state = "craft";
			creep.say('build');
		} else if(creep.room.controller.level!=8) {
			creep.memory.state = "upgrade";
			creep.say('upgrade');
		} else {
		    creep.memory.state = "dump";
			creep.say('dump');
		}
	}
}
function gather(creep) {
	if(creep.carry.energy < creep.carryCapacity) {
	    var targetSource = Game.getObjectById(creep.memory.assignedNode);
	    if (targetSource!=null){
	        if(targetSource.energy != 0 && creep.harvest(targetSource) == ERR_NOT_IN_RANGE){
    			creep.moveTo(targetSource);
    		} else if (targetSource.energy == 0){ 

    		}
	    } else {
	        var sources = creep.room.find(FIND_SOURCES);
        	creep.memory.assignedNode=sources[creep.room.memory.sourceIter].id;
        	creep.room.memory.sourceIter+=1;
        	if (creep.room.memory.sourceIter==creep.room.memory.sourceNum){
        		creep.room.memory.sourceIter=0;
        	}
	    }
	} else {
		creep.memory.state = "find";
		//work(creep);
	}
}
function charge(creep) {
    var target = Game.getObjectById(creep.memory.targetEnergy);
    if(target.energy<target.energyCapacity){
        if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    } else {
        if(creep.carry.energy==0) {
           creep.memory.state = "gather";
	       creep.say('gather');
        } else {
	    	creep.memory.state = "find";
	    	//work(creep);
        }
	}
}
function craft(creep){
    var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
    if(targets.length) {
        if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0]);
        }
    } else {
        if(creep.carry.energy==0) {
            creep.memory.state = "gather";
	        creep.say('gather');
        } else {
            creep.memory.state = "find";
        }
	}
}
function upgrade(creep) {
    if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller);
    }
}
function dump(creep) {
    if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
    }
}
module.exports = roleDrone;
