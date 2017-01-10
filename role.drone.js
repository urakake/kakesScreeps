/** -------------------------------------------- role.drone ------------------------------------------
 * @param {Creep} creep 
 * by Urakake     **/
		
var roleDrone = {
    run: function(creep) {
        if(!creep.memory.init){
            init(creep);
        }
        work(creep);
	},
	makeDrone: function(spawn){
	    var cap = spawn.room.energyAvailable;
        var creepName="drone"+spawn.room.memory.creepIter+"@"+spawn.room.name;
        console.log("Creating Creep ("+creepName+")");
        spawn.room.memory.creepIter++;
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
	},
	checkDrones: function(spawn){
	    var myRoom=spawn.room;
	    var foundMissing=false;
        if (myRoom.memory.numDrones<=((myRoom.memory.sourceNum)*3)-1){
            var foundMissing=true;
        }
        return foundMissing;
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

module.exports = roleDrone;
